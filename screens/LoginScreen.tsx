import React, { useState } from 'react';
import { navigate } from '../router';
import { EyeIcon, EyeOffIcon } from '../components/ui/Icons';

interface LoginScreenProps {
  onLogin: (credentials: { email: string; pass: string }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('cliente@exemplo.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin({ email, pass: password });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-brand-secondary to-brand-light text-brand-dark flex flex-col font-sans justify-center items-center p-6">
      <button onClick={() => navigate('/')} className="sticky top-4 left-4 sm:top-8 sm:left-6 z-20 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors" aria-label="Voltar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" />
          </svg>
      </button>

      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md w-full">
        <header className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold">Acessar ou Criar Conta</h2>
          <p className="text-gray-600 mt-2">Entre com seu e-mail e senha. Se não tiver uma conta, ela será criada automaticamente.</p>
        </header>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1 input-label-layout">E-mail</label>
            <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className="input-dark" />
          </div>
          <div>
            <label htmlFor="password"className="block text-gray-700 mb-1 input-label-layout">Senha</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input-dark pr-10" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary" />
              <label htmlFor="remember-me" className="ml-2 block text-gray-600">Lembrar de mim</label>
            </div>
            <a href="#" className="font-medium text-brand-primary hover:text-brand-accent">Esqueceu a senha?</a>
          </div>

          <div>
            <button type="submit" className="w-full font-sans py-3 px-4 rounded-xl bg-brand-primary text-white shadow-lg hover:bg-white hover:text-brand-primary border-2 border-transparent hover:border-brand-primary transition-all duration-300 transform hover:scale-105 btn-text-layout">
              Entrar ou Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
