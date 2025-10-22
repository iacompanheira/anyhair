import React, { useState, useEffect, useMemo } from 'react';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { useAppContext } from '../../contexts/AppContext';
import { EyeIcon, EyeOffIcon } from '../../components/ui/Icons';
import type { FeatureFlags } from '../../types';

const SpinnerIcon: React.FC<{className?: string}> = ({className}) => <svg className={`animate-spin ${className ?? ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


const SettingsScreen: React.FC = () => {
  const context = useAppContext();

  // Individual draft states for each setting
  const [draftFeatureFlags, setDraftFeatureFlags] = useState(context.featureFlags);
  const [draftIsPaymentMandatory, setDraftIsPaymentMandatory] = useState(context.isPaymentMandatory);
  const [draftIsLoginRequiredForBooking, setDraftIsLoginRequiredForBooking] = useState(context.isLoginRequiredForBooking);
  const [draftServiceSelectionMode, setDraftServiceSelectionMode] = useState(context.serviceSelectionMode);
  const [draftSuggestedSlotsCount, setDraftSuggestedSlotsCount] = useState(context.suggestedSlotsCount);
  const [draftSuggestedDatesCount, setDraftSuggestedDatesCount] = useState(context.suggestedDatesCount);

  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Check for changes between draft and context
  useEffect(() => {
    const changes =
      JSON.stringify(draftFeatureFlags) !== JSON.stringify(context.featureFlags) ||
      draftIsPaymentMandatory !== context.isPaymentMandatory ||
      draftIsLoginRequiredForBooking !== context.isLoginRequiredForBooking ||
      draftServiceSelectionMode !== context.serviceSelectionMode ||
      draftSuggestedSlotsCount !== context.suggestedSlotsCount ||
      draftSuggestedDatesCount !== context.suggestedDatesCount;
    setHasChanges(changes);
  }, [
    draftFeatureFlags,
    draftIsPaymentMandatory,
    draftIsLoginRequiredForBooking,
    draftServiceSelectionMode,
    draftSuggestedSlotsCount,
    draftSuggestedDatesCount,
    context.featureFlags,
    context.isPaymentMandatory,
    context.isLoginRequiredForBooking,
    context.serviceSelectionMode,
    context.suggestedSlotsCount,
    context.suggestedDatesCount
  ]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (passwordSuccess || passwordError) {
        timer = setTimeout(() => {
            setPasswordSuccess('');
            setPasswordError('');
        }, 4000);
    }
    return () => clearTimeout(timer);
  }, [passwordSuccess, passwordError]);

  if (!context.featureFlags || !draftFeatureFlags) {
    return <div>Carregando configurações...</div>;
  }
  
  const handleRevert = () => {
    setDraftFeatureFlags(context.featureFlags);
    setDraftIsPaymentMandatory(context.isPaymentMandatory);
    setDraftIsLoginRequiredForBooking(context.isLoginRequiredForBooking);
    setDraftServiceSelectionMode(context.serviceSelectionMode);
    setDraftSuggestedSlotsCount(context.suggestedSlotsCount);
    setDraftSuggestedDatesCount(context.suggestedDatesCount);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    if (draftFeatureFlags) context.setFeatureFlags(draftFeatureFlags);
    context.setIsPaymentMandatory(draftIsPaymentMandatory);
    context.setIsLoginRequiredForBooking(draftIsLoginRequiredForBooking);
    context.setServiceSelectionMode(draftServiceSelectionMode);
    context.setSuggestedSlotsCount(draftSuggestedSlotsCount);
    context.setSuggestedDatesCount(draftSuggestedDatesCount);

    setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };


  const handleDraftToggle = (key: keyof FeatureFlags, subKey?: string) => {
    setDraftFeatureFlags(prevFlags => {
      if (!prevFlags) return prevFlags;
      
      const newFeatureFlags = { ...prevFlags };

      if (subKey) {
        const mainKey = key as keyof typeof newFeatureFlags;
        const subObject = newFeatureFlags[mainKey];

        if (typeof subObject === 'object' && subObject !== null && subKey in subObject) {
            (newFeatureFlags as any)[mainKey] = {
                ...(subObject as object),
                [subKey]: !(subObject as any)[subKey],
            };
        }
      } else {
        (newFeatureFlags as any)[key] = !newFeatureFlags[key];
      }
      
      return newFeatureFlags;
    });
  };

  const handlePasswordChange = () => {
      setPasswordError('');
      setPasswordSuccess('');
      if (!newPassword) { setPasswordError('O campo de nova senha não pode estar vazio.'); return; }
      if (newPassword !== confirmPassword) { setPasswordError('As senhas não coincidem.'); return; }
      if (newPassword.length < 6) { setPasswordError('A senha deve ter pelo menos 6 caracteres.'); return; }
      context.setMasterPassword(newPassword);
      setPasswordSuccess('Senha mestra alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
  };

  const handlePasswordReset = () => {
      setPasswordError('');
      context.setMasterPassword('admin123');
      setPasswordSuccess('Senha mestra redefinida para o padrão "admin123".');
      setNewPassword('');
      setConfirmPassword('');
  };

  const FeatureToggle: React.FC<{
    label: string;
    description: string;
    flag: boolean;
    onToggle: () => void;
    isSubItem?: boolean;
  }> = ({ label, description, flag, onToggle, isSubItem = false }) => (
    <div className={`flex justify-between items-start bg-white p-4 rounded-lg border border-gray-200 ${isSubItem ? 'ml-6' : ''}`}>
      <div>
        <h4 className="font-semibold text-brand-dark">{label}</h4>
        <p className="text-sm text-gray-500 max-w-md">{description}</p>
      </div>
      <div className="flex-shrink-0 ml-4">
        <ToggleSwitch enabled={flag} setEnabled={onToggle} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <style>{`.animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; } @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Seção Principal */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h3 className="text-xl font-bold text-brand-dark mb-4">Funcionalidades Principais</h3>
        <div className="space-y-4">
          <FeatureToggle label="Painel Geral" description="A tela inicial com a visão geral do negócio." flag={draftFeatureFlags.dashboard} onToggle={() => handleDraftToggle('dashboard')} />
          <FeatureToggle label="Agendamentos" description="Lista de agendamentos do dia, com filtros e ações." flag={draftFeatureFlags.appointments} onToggle={() => handleDraftToggle('appointments')} />
          <FeatureToggle label="Calendário" description="Visão completa do calendário, por mês, semana ou dia." flag={draftFeatureFlags.calendar} onToggle={() => handleDraftToggle('calendar')} />
          <FeatureToggle label="Clientes" description="Base de dados de clientes, com busca e cadastro." flag={draftFeatureFlags.clients} onToggle={() => handleDraftToggle('clients')} />
          <FeatureToggle label="Relatórios" description="Gráficos e dados sobre faturamento, serviços e mais." flag={draftFeatureFlags.reports} onToggle={() => handleDraftToggle('reports')} />
          <FeatureToggle label="Financeiro" description="Controle de fluxo de caixa, despesas e comissões." flag={draftFeatureFlags.financial} onToggle={() => handleDraftToggle('financial')} />
        </div>
      </div>
       
      {/* Regras do Negócio */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h3 className="text-xl font-bold text-brand-dark mb-4">Regras do Negócio</h3>
        <div className="space-y-4">
          <FeatureToggle
            label="Exigir Login/Cadastro para Agendar"
            description="Quando ativado, o cliente deverá fazer login ou criar uma conta antes de poder confirmar um agendamento."
            flag={draftIsLoginRequiredForBooking}
            onToggle={() => setDraftIsLoginRequiredForBooking(prev => !prev)}
          />
          <FeatureToggle
            label="Exigir Registro de Pagamento ao Concluir"
            description="Quando ativado, o profissional será obrigado a registrar a forma de pagamento ao marcar um agendamento como 'Concluído'."
            flag={draftIsPaymentMandatory}
            onToggle={() => setDraftIsPaymentMandatory(prev => !prev)}
          />
        </div>
      </div>

      {/* Configurações do Agendamento */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h3 className="text-xl font-bold text-brand-dark mb-4">Configurações do Agendamento</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-brand-dark">Modo de Seleção de Serviço</h4>
            <p className="text-sm text-gray-500 max-w-md mb-2">Escolha se os clientes podem selecionar um ou múltiplos serviços por agendamento.</p>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 transition-all ${draftServiceSelectionMode === 'multiple' ? 'bg-pink-50 border-brand-primary ring-2 ring-brand-primary' : 'hover:bg-gray-50'}`}>
                <input type="radio" name="service-selection-mode" value="multiple" checked={draftServiceSelectionMode === 'multiple'} onChange={() => setDraftServiceSelectionMode('multiple')} className="h-4 w-4 text-brand-primary focus:ring-brand-primary"/>
                <span className="font-medium text-gray-800">Múltiplos Serviços</span>
              </label>
              <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 transition-all ${draftServiceSelectionMode === 'single' ? 'bg-pink-50 border-brand-primary ring-2 ring-brand-primary' : 'hover:bg-gray-50'}`}>
                <input type="radio" name="service-selection-mode" value="single" checked={draftServiceSelectionMode === 'single'} onChange={() => setDraftServiceSelectionMode('single')} className="h-4 w-4 text-brand-primary focus:ring-brand-primary"/>
                <span className="font-medium text-gray-800">Serviço Único (avança auto)</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-brand-dark">Quantidade de Horários Sugeridos</h4>
            <p className="text-sm text-gray-500 max-w-md mb-2">Defina quantos horários disponíveis são exibidos na tela de seleção de profissional (1-20).</p>
            <input type="number" min="1" max="20" value={draftSuggestedSlotsCount} onChange={e => setDraftSuggestedSlotsCount(Number(e.target.value))} className="input-dark w-32" />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-brand-dark">Quantidade de Datas Sugeridas</h4>
            <p className="text-sm text-gray-500 max-w-md mb-2">Defina quantos dias com horários vagos serão mostrados na visualização de calendário (1-30).</p>
            <input type="number" min="1" max="30" value={draftSuggestedDatesCount} onChange={e => setDraftSuggestedDatesCount(Number(e.target.value))} className="input-dark w-32" />
          </div>
        </div>
      </div>

      {/* Senha Mestra */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
          <h3 className="text-xl font-bold text-brand-dark mb-4">Senha Mestra de Segurança</h3>
          <div className="space-y-4">
              <FeatureToggle
                  label="Ativar Senha Mestra"
                  description="Permite o uso de uma senha global para recuperação e acesso irrestrito."
                  flag={context.isMasterPasswordEnabled}
                  onToggle={() => context.setIsMasterPasswordEnabled(!context.isMasterPasswordEnabled)}
              />
              {context.isMasterPasswordEnabled && (
                  <div className="p-4 border-t mt-4 space-y-4 animate-fade-in-down">
                      <div className="bg-gray-100 p-3 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700">Senha Mestra Atual</label>
                          <div className="flex items-center justify-between mt-1">
                              <span className="text-lg font-mono text-brand-dark">
                                  {showMasterPassword ? context.masterPassword : '••••••••'}
                              </span>
                              <button type="button" onClick={() => setShowMasterPassword(!showMasterPassword)} className="p-2 text-gray-500 hover:text-brand-dark" aria-label={showMasterPassword ? "Ocultar senha" : "Mostrar senha"}>
                                  {showMasterPassword ? <EyeOffIcon /> : <EyeIcon />}
                              </button>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alterar Senha Mestra</label>
                          <div className="relative">
                              <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha (mín. 6 caracteres)" className="w-full px-4 py-2 pr-10 bg-brand-input-bg text-white border border-gray-600 rounded-lg placeholder-gray-400"/>
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                              </button>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme a nova senha" className="w-full px-4 py-2 bg-brand-input-bg text-white border border-gray-600 rounded-lg placeholder-gray-400"/>
                      </div>
                      {passwordError && <p className="text-sm text-red-600" role="alert">{passwordError}</p>}
                      {passwordSuccess && <p className="text-sm text-green-600" role="alert">{passwordSuccess}</p>}
                      <div className="flex flex-col sm:flex-row gap-4">
                          <button onClick={handlePasswordChange} className="btn-primary flex-1">Salvar Nova Senha</button>
                          <button onClick={handlePasswordReset} className="btn-secondary flex-1">Redefinir para Padrão</button>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* Seção Ferramentas de Marketing */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h3 className="text-xl font-bold text-brand-dark mb-4">Ferramentas de Marketing</h3>
        <div className="space-y-4">
          <FeatureToggle label="Marketing" description="Gerencie campanhas, banners, widget flutuante e frases promocionais." flag={draftFeatureFlags.marketingTools.marketing} onToggle={() => handleDraftToggle('marketingTools', 'marketing')} />
          <FeatureToggle label="Comunicação em Massa" description="Envie mensagens via WhatsApp ou E-mail para seus clientes." flag={draftFeatureFlags.marketingTools.communication} onToggle={() => handleDraftToggle('marketingTools', 'communication')} />
          <FeatureToggle label="Aniversariantes" description="Visualize e envie vouchers para os aniversariantes do mês." flag={draftFeatureFlags.marketingTools.birthdays} onToggle={() => handleDraftToggle('marketingTools', 'birthdays')} />
          <FeatureToggle label="Sorteio" description="Realize sorteios entre clientes ou funcionários." flag={draftFeatureFlags.marketingTools.raffle} onToggle={() => handleDraftToggle('marketingTools', 'raffle')} />
        </div>
      </div>

      {/* Seção de Gestão */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h3 className="text-xl font-bold text-brand-dark mb-4">Gestão do Salão</h3>
        <div className="space-y-4">
          <FeatureToggle label="Serviços" description="Gerencie os serviços oferecidos pelo salão." flag={draftFeatureFlags.services} onToggle={() => handleDraftToggle('services')} />
          <FeatureToggle label="Profissionais" description="Cadastre e edite os profissionais da sua equipe." flag={draftFeatureFlags.professionals} onToggle={() => handleDraftToggle('professionals')} />
          <FeatureToggle label="Identidade Visual" description="Personalize cores, logo, nome e slogan do salão." flag={draftFeatureFlags.settings.branding} onToggle={() => handleDraftToggle('settings', 'branding')} />
          <FeatureToggle label="Horário de Funcionamento" description="Defina os horários padrão e exceções do salão." flag={draftFeatureFlags.settings.salonHours} onToggle={() => handleDraftToggle('settings', 'salonHours')} />
          <FeatureToggle label="Administradores" description="Gerencie os usuários com acesso total ao painel." flag={draftFeatureFlags.settings.admins} onToggle={() => handleDraftToggle('settings', 'admins')} />
        </div>
      </div>
      
      {hasChanges && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50">
            <div className="bg-brand-dark text-white rounded-xl shadow-2xl p-4 flex justify-between items-center animate-fade-in-up">
                <p className="font-semibold">Você tem alterações não salvas!</p>
                <div className="flex gap-4">
                    <button onClick={handleRevert} className="font-semibold hover:underline">Reverter</button>
                    <button onClick={handleSave} disabled={saveStatus === 'saving'} className="btn-primary flex items-center gap-2 disabled:bg-gray-500">
                        {saveStatus === 'saving' && <SpinnerIcon className="w-5 h-5 -ml-1 mr-1" />}
                        {saveStatus === 'saved' ? '✓ Salvo!' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;