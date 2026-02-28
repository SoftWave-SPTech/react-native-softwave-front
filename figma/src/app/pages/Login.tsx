import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Mail, Fingerprint } from "lucide-react";
import logoImage from "figma:asset/0ad24c7f890777b03da82d6439dab1886bc294ce.png";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [useBiometria, setUseBiometria] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/home");
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#6EDDD6] to-[#0E6F73] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <img
              src={logoImage}
              alt="SoftWave Finance Logo"
              className="w-100px h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            SoftWave Finance
          </h1>
          <p className="text-blue-100">
            Gestão financeira para advocacia
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <label className="text-white text-sm mb-2 block">
              Email
            </label>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-white/70" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <label className="text-white text-sm mb-2 block">
              Senha
            </label>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-white/70" />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
              />
            </div>
          </div>

          {/* Biometria Toggle */}
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-white/70" />
              <span className="text-white text-sm">
                Entrar com biometria
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUseBiometria(!useBiometria)}
              className={`w-12 h-6 rounded-full transition-colors ${
                useBiometria ? "bg-white" : "bg-white/30"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-blue-600 transition-transform ${
                  useBiometria
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            className="w-full bg-white text-blue-600 rounded-2xl py-4 font-semibold hover:bg-blue-50 transition-colors"
          >
            Entrar
          </button>
        </form>

        {/* Esqueci senha */}
        <button
          onClick={() => navigate('/esqueci-senha')}
          className="w-full text-center text-white/80 text-sm mt-4 hover:text-white"
        >
          Esqueci minha senha
        </button>

        {/* Acesso Cliente */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <button
            onClick={() => navigate("/cliente")}
            className="w-full text-center text-white/80 text-sm hover:text-white"
          >
            Acesso para Cliente →
          </button>
        </div>
      </div>
    </div>
  );
}