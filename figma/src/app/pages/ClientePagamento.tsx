import { useState } from 'react';
import { useParams } from 'react-router';
import { Header } from '../components/Header';
import { Copy, QrCode, Building2, Upload, CheckCircle } from 'lucide-react';

export function ClientePagamento() {
  const { id } = useParams();
  const [copiado, setCopiado] = useState(false);
  const [comprovanteAnexado, setComprovanteAnexado] = useState(false);

  const pixCode = '00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540525.005802BR5925SILVA E ASSOCIADOS LTDA6014SAO PAULO62070503***6304ABCD';

  const copiarPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const anexarComprovante = () => {
    // Simular anexo de comprovante
    setComprovanteAnexado(true);
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <Header title="Realizar Pagamento" showBack />
      
      <div className="px-5 py-4 space-y-4">
        {/* Valor */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white text-center">
          <p className="text-blue-100 text-sm mb-2">Valor a pagar</p>
          <h2 className="text-4xl font-bold mb-2">R$ 6.000,00</h2>
          <p className="text-blue-100 text-sm">Vencimento: 15/03/2026</p>
        </div>

        {/* QR Code Pix */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">QR Code Pix</h3>
          <div className="bg-gray-100 rounded-2xl p-8 flex items-center justify-center mb-4">
            <QrCode className="w-40 h-40 text-gray-400" />
          </div>
          <p className="text-center text-sm text-gray-600">
            Escaneie o QR Code com o app do seu banco
          </p>
        </div>

        {/* Pix Copia e Cola */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Pix Copia e Cola</h3>
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <p className="text-xs text-gray-600 break-all font-mono">
              {pixCode}
            </p>
          </div>
          <button
            onClick={copiarPix}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
              copiado
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copiado ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copiar Código Pix
              </>
            )}
          </button>
        </div>

        {/* Dados Bancários */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Dados Bancários</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Banco:</span>
              <span className="text-gray-900 font-medium">Banco do Brasil</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Agência:</span>
              <span className="text-gray-900 font-medium">1234-5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Conta:</span>
              <span className="text-gray-900 font-medium">67890-1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Favorecido:</span>
              <span className="text-gray-900 font-medium">Silva & Associados</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CNPJ:</span>
              <span className="text-gray-900 font-medium">12.345.678/0001-90</span>
            </div>
          </div>
        </div>

        {/* Anexar Comprovante */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Comprovante</h3>
          {comprovanteAnexado ? (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-700 font-medium">Comprovante anexado!</p>
              <p className="text-sm text-green-600 mt-1">
                Aguardando confirmação do escritório
              </p>
            </div>
          ) : (
            <button
              onClick={anexarComprovante}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <Upload className="w-5 h-5" />
              Anexar Comprovante
            </button>
          )}
        </div>

        {/* Status */}
        {comprovanteAnexado && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-sm text-amber-800 text-center">
              Seu pagamento será confirmado em até 24 horas úteis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
