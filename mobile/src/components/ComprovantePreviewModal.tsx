import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getApiBaseUrl } from '../config/api';
import { apiFetch } from '../services/http';

type Props = {
  visible: boolean;
  onClose: () => void;
  token: string | null;
  comprovanteUrl?: string | null;
  title?: string;
  downloadName: string;
};

const MIME_TO_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function extrairExtensaoDoContentDisposition(contentDisposition?: string): string | null {
  if (!contentDisposition) return null;
  const match = /filename\*?=(?:UTF-8''|")?([^\";]+)"?/i.exec(contentDisposition);
  if (!match?.[1]) return null;
  const filename = decodeURIComponent(match[1]).trim();
  const ext = /\.([a-z0-9]{2,5})$/i.exec(filename)?.[1]?.toLowerCase();
  return ext ?? null;
}

function extrairExtensaoDaUrl(url: string): string | null {
  const clean = url.split('?')[0].split('#')[0];
  const ext = /\.([a-z0-9]{2,5})$/i.exec(clean)?.[1]?.toLowerCase();
  return ext ?? null;
}

function normalizarExtensao(ext: string | null | undefined): string | null {
  if (!ext) return null;
  const e = ext.toLowerCase().replace(/^\./, '');
  if (e === 'jpeg') return 'jpg';
  if (e in { pdf: 1, jpg: 1, png: 1, webp: 1, gif: 1 }) return e;
  return null;
}

function inferirExtensao(headers: Record<string, string> | null | undefined, url: string): string {
  const normalizedHeaders: Record<string, string> = {};
  Object.entries(headers ?? {}).forEach(([k, v]) => {
    normalizedHeaders[k.toLowerCase()] = String(v);
  });

  const mime = normalizedHeaders['content-type']?.split(';')[0]?.trim().toLowerCase();
  const fromMime = mime ? MIME_TO_EXTENSION[mime] : null;
  const fromDisposition = extrairExtensaoDoContentDisposition(normalizedHeaders['content-disposition']);
  const fromUrl = extrairExtensaoDaUrl(url);

  return (
    normalizarExtensao(fromDisposition) ??
    normalizarExtensao(fromMime) ??
    normalizarExtensao(fromUrl) ??
    'pdf'
  );
}

function montarNomeComExtensao(baseName: string, ext: string): string {
  const safeBase = baseName.replace(/[^\w.-]/g, '_');
  const hasExt = /\.[a-z0-9]{2,5}$/i.test(safeBase);
  if (hasExt) return safeBase;
  return `${safeBase}.${ext}`;
}

export function ComprovantePreviewModal({
  visible,
  onClose,
  token,
  comprovanteUrl,
  title = 'Comprovante de Pagamento',
  downloadName,
}: Props) {
  const [previewErro, setPreviewErro] = useState(false);
  const [previewCarregando, setPreviewCarregando] = useState(false);
  const [comprovantePreviewUrl, setComprovantePreviewUrl] = useState('');

  const cleanupPreviewUrl = useCallback((url: string) => {
    if (url && url.startsWith('blob:') && typeof URL !== 'undefined' && URL.revokeObjectURL) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const absUrl = useMemo(() => {
    const raw = comprovanteUrl ?? '';
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = getApiBaseUrl() ?? '';
    const normalizedRaw = raw.startsWith('/') ? raw : `/${raw}`;
    if (!base) return normalizedRaw;
    const baseMatch = base.match(/^https?:\/\/[^/]+(\/.*)?$/i);
    const basePath = (baseMatch?.[1] ?? '').replace(/\/+$/, '');
    if (basePath && normalizedRaw === basePath) return base;
    if (basePath && normalizedRaw.startsWith(`${basePath}/`)) {
      return `${base}${normalizedRaw.slice(basePath.length)}`;
    }
    return `${base}${normalizedRaw}`;
  }, [comprovanteUrl]);

  const blobToPreviewUri = useCallback(async (blob: Blob): Promise<string> => {
    if (Platform.OS === 'web' && typeof URL !== 'undefined' && URL.createObjectURL) {
      return URL.createObjectURL(blob);
    }
    if (typeof FileReader !== 'undefined') {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('Falha ao converter arquivo para preview.'));
        reader.readAsDataURL(blob);
      });
    }
    throw new Error('Preview não suportado neste dispositivo');
  }, []);

  useEffect(
    () => () => {
      cleanupPreviewUrl(comprovantePreviewUrl);
    },
    [cleanupPreviewUrl, comprovantePreviewUrl],
  );

  useEffect(() => {
    if (!visible) return;
    let prevBlobUrl = '';
    const loadPreview = async () => {
      setPreviewCarregando(true);
      setComprovantePreviewUrl((prev) => {
        prevBlobUrl = prev;
        return '';
      });
      setPreviewErro(false);
      if (!absUrl) {
        setPreviewCarregando(false);
        return;
      }
      const base = getApiBaseUrl() ?? '';
      if (!base || !absUrl.startsWith(base)) {
        setComprovantePreviewUrl(absUrl);
        setPreviewCarregando(false);
        return;
      }
      if (!token) {
        setPreviewErro(true);
        setPreviewCarregando(false);
        return;
      }
      try {
        const relativePath = absUrl.slice(base.length) || '/';
        const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
        const res = await apiFetch(path, { method: 'GET', token });
        if (!res.ok) throw new Error('Falha ao carregar comprovante');
        const blob = await res.blob();
        const previewUri = await blobToPreviewUri(blob);
        setComprovantePreviewUrl(previewUri);
      } catch {
        setPreviewErro(true);
      } finally {
        cleanupPreviewUrl(prevBlobUrl);
        setPreviewCarregando(false);
      }
    };
    void loadPreview();
  }, [absUrl, blobToPreviewUri, cleanupPreviewUrl, token, visible]);

  const baixarComprovante = useCallback(async () => {
    if (!absUrl || !token) {
      Alert.alert('Indisponível', 'Comprovante ou sessão indisponível.');
      return;
    }
    try {
      const base = getApiBaseUrl() ?? '';
      const path = absUrl.startsWith(base) ? (absUrl.slice(base.length) || '/') : absUrl;
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof URL !== 'undefined') {
        const res = await apiFetch(normalizedPath, { method: 'GET', token });
        if (!res.ok) {
          throw new Error('Falha ao baixar comprovante');
        }
        const blob = await res.blob();
        const ext = inferirExtensao({}, absUrl);
        const fileName = montarNomeComExtensao(downloadName, ext);
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectUrl);
        return;
      }
      const ext = inferirExtensao(undefined, absUrl);
      const fileName = montarNomeComExtensao(downloadName, ext);
      const destinoBase = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!destinoBase) {
        Alert.alert('Erro', 'Não foi possível acessar armazenamento temporário do dispositivo.');
        return;
      }
      const destino = `${destinoBase}${Date.now()}-${fileName}`;
      const downloadRes = await FileSystem.downloadAsync(absUrl, destino, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const extFinal = inferirExtensao(downloadRes.headers as Record<string, string>, absUrl);
      let uriFinal = downloadRes.uri;
      const jaTemExtensao = new RegExp(`\\.${extFinal}$`, 'i').test(uriFinal);
      if (!jaTemExtensao) {
        const uriComExt = `${uriFinal}.${extFinal}`;
        try {
          await FileSystem.moveAsync({ from: uriFinal, to: uriComExt });
          uriFinal = uriComExt;
        } catch {
          // Mantém URI original se não conseguir renomear.
        }
      }
      const podeCompartilhar = await Sharing.isAvailableAsync();
      if (!podeCompartilhar) {
        Alert.alert('Download concluído', `Arquivo salvo em: ${uriFinal}`);
        return;
      }
      const mimeType = extFinal === 'pdf' ? 'application/pdf' : `image/${extFinal === 'jpg' ? 'jpeg' : extFinal}`;
      await Sharing.shareAsync(uriFinal, { mimeType, dialogTitle: 'Compartilhar comprovante' });
    } catch {
      Alert.alert('Erro ao baixar', 'Não foi possível baixar o comprovante agora.');
    }
  }, [absUrl, downloadName, token]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <Text style={styles.modalTitle}>{title}</Text>
          {previewCarregando ? (
            <View style={styles.comprovanteLoading}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.loadingText}>Carregando comprovante...</Text>
            </View>
          ) : comprovantePreviewUrl && !previewErro ? (
            <Image
              source={{ uri: comprovantePreviewUrl }}
              resizeMode="contain"
              style={styles.comprovantePreview}
              onError={() => setPreviewErro(true)}
            />
          ) : (
            <View style={styles.comprovantePlaceholder}>
              <MaterialCommunityIcons name="file-image-outline" size={64} color="#9ca3af" />
            </View>
          )}
          {absUrl ? (
            <Pressable onPress={() => void baixarComprovante()} style={styles.modalAbrir}>
              <MaterialCommunityIcons name="download" size={18} color="#0d9488" />
              <Text style={styles.modalAbrirText}>Baixar comprovante</Text>
            </Pressable>
          ) : (
            <Text style={styles.modalSemArquivo}>Comprovante ainda não enviado pelo cliente.</Text>
          )}
          <Pressable onPress={onClose} style={styles.modalFechar}>
            <Text style={styles.modalFecharText}>Fechar</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  comprovantePreview: { height: 260, borderRadius: 12, backgroundColor: '#f8fafc', marginBottom: 12 },
  comprovanteLoading: {
    height: 220,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: { fontSize: 13, color: '#6b7280' },
  comprovantePlaceholder: { height: 200, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalAbrir: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#ecfeff',
  },
  modalAbrirText: { color: '#0f766e', fontSize: 14, fontWeight: '600' },
  modalSemArquivo: { fontSize: 13, color: '#6b7280', marginBottom: 10, textAlign: 'center' },
  modalFechar: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalFecharText: { fontSize: 16, fontWeight: '500', color: '#fff' },
});
