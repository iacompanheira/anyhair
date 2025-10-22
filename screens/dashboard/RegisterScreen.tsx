import React, { useState } from 'react';
import type { Client } from '../types';
import { navigate } from '../router';
import { EyeIcon, EyeOffIcon } from '../components/ui/Icons';
import { formatCPF, formatPhone, validateCPF } from '../utils/formatters';

interface RegisterScreenProps {
  onRegister: (newClientData: Omit<Client, 'id' | 'lastVisit'>) => void;
  onNavigateToLogin: () => void;
  prefillName?: string;
}

const FormError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1 animate-fade-in">{message}</p>;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onNavigateToLogin, prefillName }) => {
    const [form, setForm] = useState({
      name: prefillName || '',
      email: '',
      phone: '',
      cpf: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      password: '',
      confirmPassword: ''
    });
    const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const validateField = (name: keyof typeof form, value: string): string => {
      switch (name) {
          case 'name':
              if (!value) return 'Nome completo é obrigatório.';
              if (value.trim().split(' ').length < 2) return 'Por favor, insira nome e sobrenome.';
              return '';
          case 'email':
              if (!value) return 'E-mail é obrigatório.';
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Formato de e-mail inválido.';
              return '';
          case 'phone':
              if (!value) return 'Telefone é obrigatório.';
              if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) return 'Formato de telefone inválido. Use (XX) XXXXX-XXXX.';
              return '';
          case 'cpf':
              if (!value) return 'CPF é obrigatório.';
              if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) return 'Formato de CPF inválido. Use 000.000.000-00.';
              if (!validateCPF(value)) return 'Este CPF não é válido.';
              return '';
          case 'password':
              if (!value) return 'Senha é obrigatória.';
              if (value.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
              return '';
          case 'confirmPassword':
              if (!value) return 'Confirmação de senha é obrigatória.';
              if (value !== form.password) return 'As senhas não coincidem.';
              return '';
          default:
              return '';
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name as keyof typeof form, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        let formattedValue = value;
        if (name === 'phone') {
            formattedValue = formatPhone(value);
        } else if (name === 'cpf') {
            formattedValue = formatCPF(value);
        }

        setForm(prev => ({ ...prev, [name]: formattedValue }));
        
        if (errors[name as keyof typeof form]) {
            const error = validateField(name as keyof typeof form, formattedValue);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
        if (name === 'password' && form.confirmPassword) {
            const confirmError = validateField('confirmPassword', form.confirmPassword);
            setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
    }
    
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Partial<Record<keyof typeof form, string>> = {};
        let hasError = false;
        (Object.keys(form) as Array<keyof typeof form>).forEach(key => {
            const error = validateField(key, form[key]);
            if (error) {
                hasError = true;
                newErrors[key] = error;
            }
        });
        
        setErrors(newErrors);

        if (hasError) {
            return;
        }
        
        const { name, email, phone, cpf, birthDay, birthMonth, birthYear } = form;
        const birthdate = (birthDay && birthMonth) 
            ? `${birthYear || 'XXXX'}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}` 
            : undefined;
        
        onRegister({ name, email, phone, cpf, birthdate });
    };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-brand-secondary to-brand-light text-brand-dark flex flex-col font-sans justify-center items-center p-6">
      <style>{`.animate-fade-in { animation: fade-in 0.3s ease-out forwards; } @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }`}</style>
      <button onClick={() => navigate('/')} className="sticky top-4 left-4 sm:top-8 sm:left-6 z-20 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors" aria-label="Voltar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" />
          </svg>
      </button>

      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md w-full">
        <header className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold">Criar Conta</h2>
        </header>
        
        <form className="space-y-4" onSubmit={handleRegister} noValidate>
          <div>
            <label htmlFor="fullname" className="block text-gray-700 mb-1 input-label-layout">Nome Completo</label>
            <input type="text" id="fullname" name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} placeholder="Seu nome completo" required className="input-dark" />
            <FormError message={errors.name} />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1 input-label-layout">E-mail</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="seu@email.com" required className="input-dark" />
            <FormError message={errors.email} />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 mb-1 input-label-layout">Telefone</label>
            <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} onBlur={handleBlur} placeholder="(XX) XXXXX-XXXX" required className="input-dark" maxLength={15} />
            <FormError message={errors.phone} />
          </div>
          <div>
            <label htmlFor="cpf" className="block text-gray-700 mb-1 input-label-layout">CPF</label>
            <input type="text" id="cpf" name="cpf" value={form.cpf} onChange={handleChange} onBlur={handleBlur} placeholder="000.000.000-00" required className="input-dark" maxLength={14} />
            <FormError message={errors.cpf} />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 input-label-layout">Data de Nascimento</label>
            <div className="grid grid-cols-3 gap-3">
                <input type="number" name="birthDay" placeholder="Dia" value={form.birthDay} onChange={handleChange} onBlur={handleBlur} min="1" max="31" className="input-dark" />
                <input type="number" name="birthMonth" placeholder="Mês" value={form.birthMonth} onChange={handleChange} onBlur={handleBlur} min="1" max="12" className="input-dark" />
                <input type="number" name="birthYear" placeholder="Ano (Opcional)" value={form.birthYear} onChange={handleChange} onBlur={handleBlur} min="1900" max={2025} className="input-dark" />
            </div>
          </div>
          <div>
            <label htmlFor="password"className="block text-gray-700 mb-1 input-label-layout">Senha</label>
            <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={form.password} onChange={handleChange} onBlur={handleBlur} placeholder="Crie uma senha forte" required className="input-dark pr-10" />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
            <FormError message={errors.password} />
          </div>
           <div>
            <label htmlFor="confirm-password"className="block text-gray-700 mb-1 input-label-layout">Confirmar Senha</label>
            <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} id="confirm-password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Repita a senha" required className="input-dark pr-10" />
                 <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                    aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
            <FormError message={errors.confirmPassword} />
          </div>

          <div className="pt-2 text-center text-xs text-gray-500">
            <p>
              Ao se cadastrar na plataforma, você concorda com nossos Termos de Uso e com as Diretrizes de Privacidade.
            </p>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full font-sans py-3 px-4 rounded-xl bg-brand-primary text-white shadow-lg hover:bg-white hover:text-brand-primary border-2 border-transparent hover:border-brand-primary transition-all duration-300 transform hover:scale-105 btn-text-layout">
              Criar Conta
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Já possui uma conta?{' '}
            <button onClick={onNavigateToLogin} className="font-bold text-brand-primary hover:text-brand-accent">
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
