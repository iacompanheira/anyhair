import React, { useState } from 'react';
import { navigate } from '../router';

interface GuestRegisterScreenProps {
  onRegister: (guestData: { name: string; birthdate?: string }) => void;
  onNavigateToLogin: () => void;
}

const GuestRegisterScreen: React.FC<GuestRegisterScreenProps> = ({ onRegister, onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthYear, setBirthYear] = useState('');
    
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        const birthdate = (birthDay && birthMonth) 
            ? `${birthYear || 'XXXX'}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}` 
            : undefined;
        onRegister({ name, birthdate });
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
                    <h2 className="text-3xl sm:text-4xl font-bold">Agendar como Visitante</h2>
                    <p className="text-gray-600 mt-2">Precisamos de apenas algumas informações para confirmar seu horário.</p>
                </header>
                <form className="space-y-6" onSubmit={handleRegister}>
                    <div>
                        <label htmlFor="fullname" className="block text-gray-700 mb-1 input-label-layout">Nome Completo</label>
                        <input type="text" id="fullname" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" required className="input-dark" />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 input-label-layout">Data de Nascimento</label>
                        <div className="grid grid-cols-3 gap-3">
                            <input type="number" placeholder="Dia" value={birthDay} onChange={e => setBirthDay(e.target.value)} min="1" max="31" className="input-dark" />
                            <input type="number" placeholder="Mês" value={birthMonth} onChange={e => setBirthMonth(e.target.value)} min="1" max="12" className="input-dark" />
                            <input type="number" placeholder="Ano (Opcional)" value={birthYear} onChange={e => setBirthYear(e.target.value)} min="1900" max={2025} className="input-dark" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full font-sans py-3 px-4 rounded-xl text-lg bg-brand-primary text-white shadow-lg hover:bg-white hover:text-brand-primary border-2 border-transparent hover:border-brand-primary transition-all duration-300 transform hover:scale-105 btn-text-layout">
                            Confirmar Agendamento
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

export default GuestRegisterScreen;