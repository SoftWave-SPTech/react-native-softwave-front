import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, ArrowLeft, CheckCircle, Lock, Key } from 'lucide-react';
import logoImage from 'figma:asset/0ad24c7f890777b03da82d6439dab1886bc294ce.png';

type Etapa = 'email' | 'token' | 'novaSenha';

export function EsqueciSenha() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<Etapa>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const handleEnviarEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEtapa('token');
  };

  const handleValidarToken = (e: React.FormEvent) => {
    e.preventDefault();
    setEtapa('novaSenha');
  };

  const handleRedefinirSenha = (e: React.FormEvent) => {
    e.preventDefault();
    // Redireciona para home após redefinir senha
    navigate('/home');
  };

  // Etapa 1: Informar Email
  if (etapa === 'email') {
    return (
      <div className="h-full bg-gradient-to-br from-[#6EDDD6] to-[#0E6F73] flex flex-col">
        {/* Header */}
        <div className="px-5 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <img
                  src={logoImage}
                  alt="SoftWave Finance Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Recuperar Senha
              </h1>
              <p className="text-blue-100">
                Digite seu e-mail para receber o código de recuperação
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleEnviarEmail} className="space-y-4">
              {/* Email */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <label className="text-white text-sm mb-2 block">
                  E-mail cadastrado
                </label>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-white/70" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-900/30 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/90 text-sm">
                  💡 Enviaremos um código de 6 dígitos para você redefinir sua senha.
                </p>
              </div>

              {/* Botão Enviar */}
              <button
                type="submit"
                disabled={!email}
                className="w-full bg-white text-blue-600 rounded-2xl py-4 font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Código
              </button>
            </form>

            {/* Link alternativo */}
            <div className="mt-6 text-center">
              <p className="text-white/70 text-sm">
                Lembrou sua senha?{' '}
                <button
                  onClick={() => navigate('/')}
                  className="text-white font-semibold hover:underline"
                >
                  Fazer login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Etapa 2: Validar Token
  if (etapa === 'token') {
    return (
      <div className="h-full bg-gradient-to-br from-[#6EDDD6] to-[#0E6F73] flex flex-col">
        {/* Header */}
        <div className="px-5 py-6">
          <button
            onClick={() => setEtapa('email')}
            className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="w-full max-w-sm">
            {/* Ícone */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Código Enviado
              </h1>
              <p className="text-blue-100">
                Digite o código de 6 dígitos enviado para
              </p>
              <p className="text-white font-semibold mt-1">{email}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleValidarToken} className="space-y-4">
              {/* Token */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <label className="text-white text-sm mb-2 block">
                  Código de verificação
                </label>
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-white/70" />
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="flex-1 bg-transparent text-white text-2xl font-bold placeholder-white/50 outline-none tracking-widest"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-900/30 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/90 text-sm text-center">
                  ⏱️ O código expira em 10 minutos
                </p>
              </div>

              {/* Botão Validar */}
              <button
                type="submit"
                disabled={token.length !== 6}
                className="w-full bg-white text-blue-600 rounded-2xl py-4 font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Validar Código
              </button>
            </form>

            {/* Reenviar */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setEtapa('email')}
                className="text-white/80 text-sm hover:text-white"
              >
                Não recebeu o código? <span className="font-semibold">Reenviar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Etapa 3: Nova Senha
  return (
    <div className="h-full bg-gradient-to-br from-[#6EDDD6] to-[#0E6F73] flex flex-col">
      {/* Header */}
      <div className="px-5 py-6">
        <button
          onClick={() => setEtapa('token')}
          className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-sm">
          {/* Ícone */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Nova Senha
            </h1>
            <p className="text-blue-100">
              Crie uma senha forte para sua conta
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRedefinirSenha} className="space-y-4">
            {/* Nova Senha */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <label className="text-white text-sm mb-2 block">
                Nova senha
              </label>
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-white/70" />
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
                />
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <label className="text-white text-sm mb-2 block">
                Confirmar senha
              </label>
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-white/70" />
                <input
                  type="password"
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
                />
              </div>
            </div>

            {/* Validação */}
            {novaSenha && confirmaSenha && novaSenha !== confirmaSenha && (
              <div className="bg-red-900/30 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white text-sm text-center">
                  ⚠️ As senhas não coincidem
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-900/30 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/90 text-sm">
                ✓ Mínimo de 6 caracteres
              </p>
            </div>

            {/* Botão Redefinir */}
            <button
              type="submit"
              disabled={!novaSenha || !confirmaSenha || novaSenha !== confirmaSenha || novaSenha.length < 6}
              className="w-full bg-white text-blue-600 rounded-2xl py-4 font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Redefinir Senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}