import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { ToggleSwitch } from '../components/ToggleSwitch';
import type { LocalSeguroMapPreviewProps } from '../components/localSeguroMapPreviewShared';
import {
  mensagemBloqueioGestaoLocais,
  useLocaisSeguros,
} from '../context/LocaisSegurosContext';
import { loadExpoLocation } from '../utils/expoLocationLazy';
import type { LocalSeguro } from '../types/locaisSeguros';
import { fetchEnderecoByCep, formatCepDisplay, normalizeCepDigits } from '../services/viacep';
import { montarEnderecoExibicao, montarLinhaGeocode } from '../utils/endereco';
import { infoCardStyles } from '../styles/infoCard';
import { useScrollPaddingBottom } from '../utils/scrollPadding';

type Props = {
  onBack: () => void;
};

type FormState = {
  nome: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cidade: string;
  uf: string;
  raio: number;
  latitude: number;
  longitude: number;
  temCoordenadas: boolean;
};

const RAIOS_OPCOES = [50, 100, 150, 200, 300, 500];

const FORM_VAZIO: FormState = {
  nome: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  cidade: '',
  uf: '',
  raio: 100,
  latitude: 0,
  longitude: 0,
  temCoordenadas: false,
};

function formFromLocal(local: LocalSeguro): FormState {
  return {
    nome: local.nome,
    cep: formatCepDisplay(local.cep),
    logradouro: local.logradouro,
    numero: local.numero,
    complemento: local.complemento ?? '',
    cidade: local.cidade,
    uf: local.uf,
    raio: local.raio,
    latitude: local.latitude,
    longitude: local.longitude,
    temCoordenadas: true,
  };
}

export function LocaisSegurosScreen({ onBack }: Props) {
  const {
    enabled,
    locais,
    setEnabled,
    addLocal,
    updateLocal,
    removeLocal,
    isInsideSafeZone,
    locationStatus,
    syncing,
    apiOn,
    canDisableProtection,
  } = useLocaisSeguros();

  /** Mesma regra da toggle: fora do local seguro não altera cadastro nem desativa proteção. */
  const gestaoBloqueada = enabled && !canDisableProtection;

  const avisarGestaoBloqueada = () => {
    Alert.alert('Fora do local seguro', mensagemBloqueioGestaoLocais(locationStatus));
  };

  const [modalForm, setModalForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalExcluir, setModalExcluir] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [obtendoGps, setObtendoGps] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [MapPreview, setMapPreview] = useState<React.ComponentType<LocalSeguroMapPreviewProps> | null>(
    null,
  );

  useEffect(() => {
    if (!modalForm) {
      setMapPreview(null);
      return;
    }
    let cancelled = false;
    void import('../components/LocalSeguroMapPreview').then((m) => {
      if (!cancelled) setMapPreview(() => m.LocalSeguroMapPreview);
    });
    return () => {
      cancelled = true;
    };
  }, [modalForm]);

  const abrirNovo = () => {
    if (gestaoBloqueada) {
      avisarGestaoBloqueada();
      return;
    }
    setEditId(null);
    setForm(FORM_VAZIO);
    setModalForm(true);
  };

  const abrirEditar = (local: LocalSeguro) => {
    if (gestaoBloqueada) {
      avisarGestaoBloqueada();
      return;
    }
    setEditId(local.id);
    setForm(formFromLocal(local));
    setModalForm(true);
  };

  const abrirExcluir = (id: string) => {
    if (gestaoBloqueada) {
      avisarGestaoBloqueada();
      return;
    }
    setModalExcluir(id);
  };

  const fecharForm = () => {
    setModalForm(false);
    setEditId(null);
    setForm(FORM_VAZIO);
  };

  const geocodificarForm = useCallback(async (state: FormState): Promise<{ lat: number; lon: number } | null> => {
    if (state.temCoordenadas && state.latitude !== 0 && state.longitude !== 0) {
      return { lat: state.latitude, lon: state.longitude };
    }
    const linha = montarLinhaGeocode({
      logradouro: state.logradouro,
      numero: state.numero,
      complemento: state.complemento,
      cidade: state.cidade,
      uf: state.uf,
      cep: state.cep,
    });
    try {
      const Location = await loadExpoLocation();
      const results = await Location.geocodeAsync(linha);
      if (results.length > 0) {
        return { lat: results[0].latitude, lon: results[0].longitude };
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  const buscarCep = useCallback(async (cepDigits: string) => {
    if (cepDigits.length !== 8) return;
    setBuscandoCep(true);
    try {
      const data = await fetchEnderecoByCep(cepDigits);
      if (!data) {
        Alert.alert('CEP não encontrado', 'Verifique o CEP informado.');
        return;
      }
      setForm((prev) => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        complemento: data.complemento || prev.complemento,
        cidade: data.localidade || prev.cidade,
        uf: data.uf || prev.uf,
        temCoordenadas: false,
      }));
      const coords = await geocodificarForm({
        ...form,
        cep: cepDigits,
        logradouro: data.logradouro || form.logradouro,
        cidade: data.localidade || form.cidade,
        uf: data.uf || form.uf,
        temCoordenadas: false,
      });
      if (coords) {
        setForm((prev) => ({
          ...prev,
          latitude: coords.lat,
          longitude: coords.lon,
          temCoordenadas: true,
        }));
      }
    } finally {
      setBuscandoCep(false);
    }
  }, [form, geocodificarForm]);

  useEffect(() => {
    const digits = normalizeCepDigits(form.cep);
    if (digits.length === 8 && !editId) {
      const t = setTimeout(() => {
        void buscarCep(digits);
      }, 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [form.cep, editId, buscarCep]);

  const usarLocalizacaoAtual = async () => {
    setObtendoGps(true);
    try {
      const Location = await loadExpoLocation();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Autorize o acesso à localização.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      let logradouro = form.logradouro;
      let cidade = form.cidade;
      let uf = form.uf;
      let cep = form.cep;
      try {
        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        const g = geo[0];
        if (g) {
          logradouro = [g.street, g.name].filter(Boolean).join(' ') || logradouro;
          cidade = g.city ?? g.subregion ?? cidade;
          uf = g.region ?? uf;
          if (g.postalCode) cep = formatCepDisplay(g.postalCode);
        }
      } catch {
        /* ignore */
      }
      setForm((prev) => ({
        ...prev,
        logradouro,
        cidade,
        uf,
        cep,
        latitude,
        longitude,
        temCoordenadas: true,
      }));
    } catch {
      Alert.alert('Erro', 'Não foi possível obter sua localização.');
    } finally {
      setObtendoGps(false);
    }
  };

  const handleSalvar = async () => {
    if (!form.nome.trim() || !form.logradouro.trim() || !form.numero.trim() || !form.cidade.trim() || !form.uf.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, CEP, endereço, número, cidade e UF.');
      return;
    }
    const cepDigits = normalizeCepDigits(form.cep);
    if (cepDigits.length !== 8) {
      Alert.alert('CEP inválido', 'Informe um CEP com 8 dígitos.');
      return;
    }

    setSalvando(true);
    try {
      let lat = form.latitude;
      let lon = form.longitude;
      if (!form.temCoordenadas) {
        const coords = await geocodificarForm(form);
        if (!coords) {
          Alert.alert(
            'Localização',
            'Não foi possível obter coordenadas. Use "Usar minha localização atual" ou revise o endereço.',
          );
          return;
        }
        lat = coords.lat;
        lon = coords.lon;
      }

      const payload = {
        nome: form.nome.trim(),
        cep: cepDigits,
        logradouro: form.logradouro.trim(),
        numero: form.numero.trim(),
        complemento: form.complemento.trim() || undefined,
        cidade: form.cidade.trim(),
        uf: form.uf.trim().toUpperCase(),
        endereco: montarEnderecoExibicao({
          logradouro: form.logradouro,
          numero: form.numero,
          complemento: form.complemento,
          cidade: form.cidade,
          uf: form.uf,
        }),
        latitude: lat,
        longitude: lon,
        raio: form.raio,
      };

      const result = editId
        ? await updateLocal(editId, payload)
        : await addLocal(payload);

      if (!result.ok) {
        Alert.alert('Erro', result.error ?? 'Não foi possível salvar.');
        return;
      }
      fecharForm();
    } finally {
      setSalvando(false);
    }
  };

  const formValido =
    form.nome.trim() &&
    normalizeCepDigits(form.cep).length === 8 &&
    form.logradouro.trim() &&
    form.numero.trim() &&
    form.cidade.trim() &&
    form.uf.trim();

  const scrollPad = useScrollPaddingBottom();

  return (
    <View style={styles.container}>
      <Header title="Locais Seguros" showBack onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPad }]}
        showsVerticalScrollIndicator={false}
      >
        {!apiOn ? (
          <View style={styles.apiWarn}>
            <Text style={styles.apiWarnText}>
              Configure a API (EXPO_PUBLIC_API_URL) e faça login para sincronizar locais seguros com o servidor.
            </Text>
          </View>
        ) : null}

        {syncing ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#0d9488" />
            <Text style={styles.loadingText}>Sincronizando…</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.cardTitle}>Locais Seguros</Text>
              <Text style={styles.cardDesc}>
                {enabled
                  ? 'Permitir acesso apenas em locais cadastrados'
                  : 'Acesso permitido de qualquer localização'}
              </Text>
            </View>
            <ToggleSwitch
              value={enabled}
              disabled={gestaoBloqueada}
              onValueChange={(v) => {
                void setEnabled(v).then((r) => {
                  if (!r.ok && r.error) {
                    Alert.alert('Não foi possível desativar', r.error);
                  }
                });
              }}
            />
          </View>

          {gestaoBloqueada ? (
            <View style={styles.lockBox}>
              <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#b45309" />
              <Text style={styles.lockText}>{mensagemBloqueioGestaoLocais(locationStatus)}</Text>
            </View>
          ) : null}

          {enabled ? (
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#0d9488" />
              <Text style={styles.infoText}>
                Locais Seguros ativados. O acesso ao sistema só será permitido quando você estiver em um dos locais cadastrados.
              </Text>
            </View>
          ) : null}

          {enabled && locationStatus === 'granted' ? (
            <View style={styles.statusRow}>
              <MaterialCommunityIcons
                name={isInsideSafeZone ? 'shield-check' : 'shield-off-outline'}
                size={18}
                color={isInsideSafeZone ? '#16a34a' : '#d97706'}
              />
              <Text style={styles.statusText}>
                {isInsideSafeZone
                  ? 'Você está em um local seguro.'
                  : 'Você está fora dos locais cadastrados.'}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.listHeader}>
            <Text style={styles.cardTitle}>Meus Locais ({locais.length})</Text>
            <Pressable
              style={[styles.addBtn, (!apiOn || gestaoBloqueada) && styles.addBtnDisabled]}
              onPress={abrirNovo}
              disabled={!apiOn || gestaoBloqueada}
            >
              <MaterialCommunityIcons name="plus" size={22} color="#fff" />
            </Pressable>
          </View>

          {locais.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="map-marker-outline" size={32} color="#9ca3af" />
              </View>
              <Text style={styles.emptyTitle}>Nenhum local cadastrado</Text>
              <Text style={styles.emptyDesc}>Adicione locais seguros para aumentar a segurança</Text>
            </View>
          ) : (
            locais.map((local) => (
              <Pressable
                key={local.id}
                style={[styles.localItem, gestaoBloqueada && styles.localItemDisabled]}
                onPress={() => abrirEditar(local)}
                disabled={gestaoBloqueada}
              >
                <View style={styles.localIcon}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#0d9488" />
                </View>
                <View style={styles.localBody}>
                  <Text style={styles.localNome}>{local.nome}</Text>
                  <Text style={styles.localEndereco}>{local.endereco}</Text>
                  <Text style={styles.localRaio}>Raio de segurança: {local.raio} metros</Text>
                </View>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => abrirExcluir(local.id)}
                  disabled={gestaoBloqueada}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={20}
                    color={gestaoBloqueada ? '#d1d5db' : '#9ca3af'}
                  />
                </Pressable>
              </Pressable>
            ))
          )}
        </View>

        <View style={infoCardStyles.card}>
          <Text style={infoCardStyles.title}>Como funciona?</Text>
          {[
            'Cadastre locais onde você costuma trabalhar',
            'O sistema verifica sua localização automaticamente',
            'Acesso só é permitido dentro do raio de segurança',
            'Aumenta a proteção contra acessos não autorizados',
          ].map((item) => (
            <View key={item} style={infoCardStyles.row}>
              <Text style={infoCardStyles.bullet}>•</Text>
              <Text style={infoCardStyles.item}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomNavWrap}>
        <BottomNav />
      </View>

      <Modal visible={modalForm} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={fecharForm}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editId ? 'Editar Local Seguro' : 'Adicionar Local Seguro'}
                </Text>
                <Pressable onPress={fecharForm}>
                  <MaterialCommunityIcons name="close" size={22} color="#9ca3af" />
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>Nome do Local</Text>
              <TextInput
                value={form.nome}
                onChangeText={(v) => setForm((p) => ({ ...p, nome: v }))}
                placeholder="Ex: Escritório, Casa, Fórum..."
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>CEP</Text>
              <View style={styles.cepRow}>
                <TextInput
                  value={form.cep}
                  onChangeText={(v) =>
                    setForm((p) => ({
                      ...p,
                      cep: formatCepDisplay(v),
                      temCoordenadas: false,
                    }))
                  }
                  placeholder="00000-000"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={9}
                  style={[styles.input, styles.cepInput]}
                />
                {buscandoCep ? <ActivityIndicator size="small" color="#0d9488" /> : null}
              </View>

              <Text style={styles.fieldLabel}>Endereço (logradouro)</Text>
              <TextInput
                value={form.logradouro}
                onChangeText={(v) => setForm((p) => ({ ...p, logradouro: v, temCoordenadas: false }))}
                placeholder="Rua, avenida..."
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>Número</Text>
              <TextInput
                value={form.numero}
                onChangeText={(v) => setForm((p) => ({ ...p, numero: v, temCoordenadas: false }))}
                placeholder="Ex: 1000"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>Complemento (opcional)</Text>
              <TextInput
                value={form.complemento}
                onChangeText={(v) => setForm((p) => ({ ...p, complemento: v }))}
                placeholder="Sala, andar, bloco..."
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />

              <View style={styles.row2}>
                <View style={styles.col}>
                  <Text style={styles.fieldLabel}>Cidade</Text>
                  <TextInput
                    value={form.cidade}
                    onChangeText={(v) => setForm((p) => ({ ...p, cidade: v, temCoordenadas: false }))}
                    style={styles.input}
                  />
                </View>
                <View style={styles.colUf}>
                  <Text style={styles.fieldLabel}>UF</Text>
                  <TextInput
                    value={form.uf}
                    onChangeText={(v) =>
                      setForm((p) => ({ ...p, uf: v.toUpperCase().slice(0, 2), temCoordenadas: false }))
                    }
                    maxLength={2}
                    autoCapitalize="characters"
                    style={styles.input}
                  />
                </View>
              </View>

              <Pressable style={styles.gpsLink} onPress={usarLocalizacaoAtual} disabled={obtendoGps}>
                {obtendoGps ? (
                  <ActivityIndicator size="small" color="#0d9488" />
                ) : (
                  <Text style={styles.gpsLinkText}>Usar minha localização atual</Text>
                )}
              </Pressable>

              <Text style={styles.fieldLabel}>Raio de segurança (metros)</Text>
              <View style={styles.raioRow}>
                {RAIOS_OPCOES.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setForm((p) => ({ ...p, raio: r }))}
                    style={[styles.raioChip, form.raio === r && styles.raioChipOn]}
                  >
                    <Text style={[styles.raioChipText, form.raio === r && styles.raioChipTextOn]}>
                      {r}m
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.mapLabel}>Visualização no mapa</Text>
              {MapPreview ? (
                <MapPreview
                  latitude={form.latitude}
                  longitude={form.longitude}
                  raioMetros={form.raio}
                  height={180}
                />
              ) : (
                <View style={[styles.mapLoading, { height: 180 }]}>
                  <ActivityIndicator color="#14b8a6" />
                </View>
              )}

              <View style={styles.modalActions}>
                <Pressable style={styles.btnCancel} onPress={fecharForm}>
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.btnPrimary, (!formValido || salvando) && styles.btnDisabled]}
                  disabled={!formValido || salvando}
                  onPress={handleSalvar}
                >
                  {salvando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="check" size={20} color="#fff" />
                      <Text style={styles.btnPrimaryText}>{editId ? 'Salvar' : 'Adicionar'}</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!modalExcluir} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalExcluir(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Excluir Local</Text>
              <Pressable onPress={() => setModalExcluir(null)}>
                <MaterialCommunityIcons name="close" size={22} color="#9ca3af" />
              </Pressable>
            </View>
            <Text style={styles.excluirText}>
              Tem certeza que deseja excluir este local seguro? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.btnCancel} onPress={() => setModalExcluir(null)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.btnDanger}
                onPress={async () => {
                  if (!modalExcluir) return;
                  const r = await removeLocal(modalExcluir);
                  setModalExcluir(null);
                  if (!r.ok && r.error) Alert.alert('Não foi possível excluir', r.error);
                }}
              >
                <Text style={styles.btnPrimaryText}>Excluir</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  apiWarn: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  apiWarnText: { fontSize: 13, color: '#92400e', lineHeight: 18 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { fontSize: 13, color: '#6b7280' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardDesc: { fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 18 },
  lockBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  lockText: { flex: 1, fontSize: 13, color: '#92400e', lineHeight: 18 },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    padding: 12,
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  infoText: { flex: 1, fontSize: 13, color: '#115e59', lineHeight: 18 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  statusText: { fontSize: 13, color: '#374151' },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#14b8a6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 28 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 15, fontWeight: '500', color: '#6b7280' },
  emptyDesc: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  localItemDisabled: { opacity: 0.65 },
  localItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  localIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  localBody: { flex: 1 },
  localNome: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  localEndereco: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  localRaio: { fontSize: 12, color: '#9ca3af' },
  deleteBtn: { padding: 4 },
  bottomNavWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 14,
  },
  cepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 0 },
  cepInput: { flex: 1, marginBottom: 14 },
  row2: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  colUf: { width: 72 },
  gpsLink: { marginBottom: 14 },
  gpsLinkText: { fontSize: 14, fontWeight: '600', color: '#0d9488' },
  raioRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  raioChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  raioChipOn: { backgroundColor: '#ccfbf1' },
  raioChipText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  raioChipTextOn: { color: '#0f766e' },
  mapLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginTop: 4 },
  mapLoading: {
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  btnCancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDanger: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  btnDisabled: { opacity: 0.5 },
  excluirText: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 20 },
});
