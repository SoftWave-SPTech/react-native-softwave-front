import { useState } from 'react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ArrowRight,
  X,
  FileSpreadsheet,
  Database,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

type TipoImportacao = 'extrato' | 'transacoes' | 'clientes';
type StatusImportacao = 'pendente' | 'processando' | 'concluido' | 'erro';

interface Importacao {
  id: number;
  tipo: TipoImportacao;
  arquivo: string;
  data: string;
  status: StatusImportacao;
  registros: number;
  novos: number;
  atualizados: number;
  erros: number;
}

export function ImportacaoExportacao() {
  const [modalUpload, setModalUpload] = useState(false);
  const [tipoUpload, setTipoUpload] = useState<TipoImportacao>('extrato');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [processando, setProcessando] = useState(false);
  const [modalExportar, setModalExportar] = useState(false);

  const historicoImportacoes: Importacao[] = [
    {
      id: 1,
      tipo: 'extrato',
      arquivo: 'extrato_janeiro_2026.csv',
      data: '15/02/2026',
      status: 'concluido',
      registros: 45,
      novos: 32,
      atualizados: 13,
      erros: 0
    },
    {
      id: 2,
      tipo: 'transacoes',
      arquivo: 'transacoes_backup.xlsx',
      data: '10/02/2026',
      status: 'concluido',
      registros: 120,
      novos: 0,
      atualizados: 120,
      erros: 0
    },
    {
      id: 3,
      tipo: 'extrato',
      arquivo: 'extrato_dezembro_2025.csv',
      data: '05/02/2026',
      status: 'erro',
      registros: 0,
      novos: 0,
      atualizados: 0,
      erros: 15
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0]);
    }
  };

  const handleImportar = () => {
    if (!arquivo) return;
    
    setProcessando(true);
    // Simula processamento
    setTimeout(() => {
      setProcessando(false);
      setModalUpload(false);
      setArquivo(null);
    }, 3000);
  };

  const handleExportar = (tipo: string) => {
    console.log('Exportando:', tipo);
    setModalExportar(false);
  };

  const getTipoLabel = (tipo: TipoImportacao) => {
    const labels = {
      extrato: 'Extrato Bancário',
      transacoes: 'Transações',
      clientes: 'Clientes'
    };
    return labels[tipo];
  };

  const getStatusIcon = (status: StatusImportacao) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processando':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'erro':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: StatusImportacao) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-50 text-green-700';
      case 'processando':
        return 'bg-blue-50 text-blue-700';
      case 'erro':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Importação & Exportação" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Info ETL */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="w-6 h-6" />
            <h2 className="font-semibold text-lg">Processamento de dados</h2>
          </div>
          <p className="text-blue-100 text-sm">
            Importe extratos bancários para reconciliação automática ou exporte seus dados para backup e análise.
          </p>
        </div>

        {/* Ações Principais */}
        <div className="grid grid-cols-2 gap-3">
          {/* Importar */}
          <button
            onClick={() => setModalUpload(true)}
            className="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-center mb-1">
              Importar
            </h3>
            <p className="text-xs text-gray-500 text-center">
              Upload de arquivos
            </p>
          </button>

          {/* Exportar */}
          <button
            onClick={() => setModalExportar(true)}
            className="bg-white rounded-2xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-center mb-1">
              Exportar
            </h3>
            <p className="text-xs text-gray-500 text-center">
              Baixar dados
            </p>
          </button>
        </div>

        {/* Formatos Aceitos */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">
            Formatos Aceitos para Importação
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">CSV / Excel</p>
                <p className="text-xs text-gray-500">Extratos e planilhas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">OFX / OFC</p>
                <p className="text-xs text-gray-500">Arquivos bancários</p>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico de Importações */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Histórico de Importações
          </h3>
          <div className="space-y-3">
            {historicoImportacoes.map((importacao) => (
              <div key={importacao.id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-start gap-3 mb-2">
                  {getStatusIcon(importacao.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {importacao.arquivo}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(importacao.status)}`}>
                        {getTipoLabel(importacao.tipo)}
                      </span>
                      <span className="text-xs text-gray-500">{importacao.data}</span>
                    </div>
                  </div>
                </div>

                {importacao.status === 'concluido' && (
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {importacao.registros}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Novos</p>
                      <p className="text-sm font-semibold text-green-600">
                        +{importacao.novos}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Atualizados</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {importacao.atualizados}
                      </p>
                    </div>
                  </div>
                )}

                {importacao.status === 'erro' && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-red-600">
                      {importacao.erros} erros encontrados no arquivo
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Como Funciona */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">
            Como funciona a reconciliação?
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600">1.</span>
              <p>Upload do extrato bancário (CSV, Excel ou OFX)</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600">2.</span>
              <p>O sistema compara com transações cadastradas</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600">3.</span>
              <p>Reconciliação automática por valor, data e descrição</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600">4.</span>
              <p>Sugestões de lançamentos para movimentos não cadastrados</p>
            </div>
          </div>
        </div>

        <div className="h-20"></div>
      </div>

      {/* Modal de Upload/Importação */}
      {modalUpload && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50"
          onClick={() => !processando && setModalUpload(false)}
        >
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">
                Importar Dados
              </h3>
              {!processando && (
                <button
                  onClick={() => setModalUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {processando ? (
              <div className="text-center py-8">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="font-semibold text-gray-900 mb-1">
                  Processando arquivo...
                </p>
                <p className="text-sm text-gray-600">
                  Analisando e reconciliando dados
                </p>
              </div>
            ) : (
              <>
                {/* Tipo de Importação */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Arquivo
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="radio"
                        name="tipo"
                        value="extrato"
                        checked={tipoUpload === 'extrato'}
                        onChange={(e) => setTipoUpload(e.target.value as TipoImportacao)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          Extrato Bancário
                        </p>
                        <p className="text-xs text-gray-500">
                          Para reconciliação automática
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="radio"
                        name="tipo"
                        value="transacoes"
                        checked={tipoUpload === 'transacoes'}
                        onChange={(e) => setTipoUpload(e.target.value as TipoImportacao)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          Transações
                        </p>
                        <p className="text-xs text-gray-500">
                          Importar transações em lote
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Upload de Arquivo */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar Arquivo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.ofx,.ofc"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      {arquivo ? (
                        <p className="text-sm font-medium text-gray-900">
                          {arquivo.name}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Clique para selecionar
                          </p>
                          <p className="text-xs text-gray-500">
                            CSV, Excel, OFX ou OFC
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setModalUpload(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImportar}
                    disabled={!arquivo}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                  >
                    Importar
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Exportação */}
      {modalExportar && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50"
          onClick={() => setModalExportar(false)}
        >
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">
                Exportar Dados
              </h3>
              <button
                onClick={() => setModalExportar(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Escolha qual tipo de dado deseja exportar:
            </p>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => handleExportar('transacoes')}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">Transações</p>
                    <p className="text-xs text-gray-500">Todas as receitas e despesas</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => handleExportar('honorarios')}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">Honorários</p>
                    <p className="text-xs text-gray-500">Contratos e pagamentos</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => handleExportar('clientes')}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">Clientes</p>
                    <p className="text-xs text-gray-500">Cadastro completo</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => handleExportar('completo')}
                className="w-full flex items-center justify-between p-4 border-2 border-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-blue-900 text-sm">Backup Completo</p>
                    <p className="text-xs text-blue-700">Todos os dados do sistema</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </button>
            </div>

            <button
              onClick={() => setModalExportar(false)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}