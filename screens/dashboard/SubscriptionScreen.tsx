


import React, { useState } from 'react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import BottomNav from '../components/shared/BottomNav';
import type { Service, SubscriptionPlan } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { formatCurrency } from '../utils/formatters';

// --- Reusable Components defined in this file for simplicity ---

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  onSubscribe: (planId: number) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ plan, isCurrentPlan, onSubscribe }) => {
  const { branding } = useAppContext();
  
  const cardClasses = `bg-white p-8 rounded-layout text-center flex flex-col h-full ${branding.layout.cardShadow} ${plan.isPopular ? 'border-2 border-brand-primary' : 'border'}`;
  const buttonClasses = isCurrentPlan 
    ? "mt-8 btn-secondary w-full cursor-default" 
    : "mt-8 btn-primary w-full";
  
  return (
    <div className={`relative ${plan.isPopular ? 'transform md:scale-105' : ''}`}>
      {plan.isPopular && (
        <span className="bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          MAIS POPULAR
        </span>
      )}
      <div className={cardClasses}>
        <h3 className="text-2xl font-bold text-brand-dark">{plan.name}</h3>
        <p className="text-4xl font-bold text-brand-primary my-4">
          {formatCurrency(plan.price)}
          <span className="text-lg font-normal text-gray-500">/{plan.period}</span>
        </p>
        <ul className="space-y-3 text-gray-600 text-left my-6 flex-grow">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <button 
          onClick={() => onSubscribe(plan.id)} 
          disabled={isCurrentPlan}
          className={buttonClasses}
        >
          {isCurrentPlan ? 'Seu Plano Atual' : 'Assinar Agora'}
        </button>
      </div>
    </div>
  );
};


const Toast: React.FC<{ message: string; show: boolean; onClose: () => void }> = ({ message, show, onClose }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
      <div className="bg-green-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg flex items-center gap-3">
        <span>{message}</span>
      </div>
    </div>
  );
};


// --- Main Screen Component ---

interface SubscriptionScreenProps {
    onStaffAccessClick: () => void;
    onOpenBookingDrawer: (service?: Service) => void;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onStaffAccessClick, onOpenBookingDrawer }) => {
  const { branding, currentUserSubscriptionId, setCurrentUserSubscriptionId, subscriptionPlans } = useAppContext();
  const [toastInfo, setToastInfo] = useState({ show: false, message: '' });

  const pageTitleStyle: React.CSSProperties = {
    fontSize: `${branding.layout.pageTitle.fontSize}px`,
    fontWeight: branding.layout.pageTitle.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.layout.pageTitle.fontStyle,
  };

  const handleSubscribe = (planId: number) => {
    setCurrentUserSubscriptionId(planId);
    const plan = subscriptionPlans.find(p => p.id === planId);
    setToastInfo({ show: true, message: `Assinatura do ${plan?.name} confirmada!` });
  };
  
  const currentPlan = subscriptionPlans.find(p => p.id === currentUserSubscriptionId);

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <Toast message={toastInfo.message} show={toastInfo.show} onClose={() => setToastInfo({ show: false, message: '' })} />
      <Header onStaffAccessClick={onStaffAccessClick} />
      <main className="flex-grow container mx-auto px-6 py-12">
        <h2 style={pageTitleStyle} className="text-brand-dark mb-4 text-center text-3xl">Nossos Planos de Assinatura</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Tenha seus serviços favoritos garantidos todo mês com descontos exclusivos. Beleza e praticidade em um só plano!</p>
        
        {currentPlan && (
          <div className={`bg-white p-6 rounded-layout mb-12 max-w-2xl mx-auto text-center border-l-4 border-green-500 ${branding.layout.cardShadow}`}>
            <h3 className="text-xl font-bold text-brand-dark">Seu Plano Atual: {currentPlan.name}</h3>
            <p className="text-gray-600 mt-2">Você aproveita todos os benefícios por apenas {formatCurrency(currentPlan.price)} por mês. Continue desfrutando da praticidade e dos descontos!</p>
            <button className="mt-4 btn-secondary text-sm" onClick={() => setCurrentUserSubscriptionId(null)}>Cancelar Assinatura</button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {subscriptionPlans.map(plan => (
            <SubscriptionCard 
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentUserSubscriptionId === plan.id}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      </main>
      <Footer />
      <BottomNav onOpenBookingDrawer={onOpenBookingDrawer} />
    </div>
  );
};

export default SubscriptionScreen;