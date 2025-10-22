import React from 'react';
import type { Service, UnifiedUser, DateTimeSelection } from '../types';
import { navigate } from '../router';
import { useAppContext } from '../contexts/AppContext';
import { AddToCalendarIcon } from '../components/ui/Icons';

interface ConfirmationScreenProps {
  selectedServices: Service[];
  selectedProfessional: UnifiedUser | null;
  selectedDateTime: DateTimeSelection | null;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  selectedServices,
  selectedProfessional,
  selectedDateTime
}) => {
  const { currentUser } = useAppContext();
  const isGuest = currentUser?.isGuest;

  const handleAddToCalendar = () => {
    if (!selectedServices || selectedServices.length === 0 || !selectedProfessional || !selectedDateTime) {
      alert("Não há informações de agendamento para adicionar ao calendário.");
      return;
    }

    const { date, time } = selectedDateTime;
    const [hour, minute] = time.split(':').map(Number);

    const startDate = new Date(date);
    startDate.setHours(hour, minute, 0, 0);

    const totalDurationMinutes = selectedServices.reduce((total, service) => {
        const durationMatch = service.duration.match(/(\d+)/);
        return total + (durationMatch ? parseInt(durationMatch[1], 10) : 0);
    }, 0);

    const endDate = new Date(startDate.getTime() + totalDurationMinutes * 60000);

    const toIcsFormat = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    
    const startDateIcs = toIcsFormat(startDate);
    const endDateIcs = toIcsFormat(endDate);
    const nowIcs = toIcsFormat(new Date());
    
    const eventName = selectedServices.map(s => s.name).join(' & ');
    const eventDescription = `Seu agendamento para ${eventName} com ${selectedProfessional.name}.\\n\\nLembre-se de chegar com 10 minutos de antecedência.`;
    const location = 'Rua da Beleza, 123 - Centro, São Paulo - SP';
    const uid = `anyhair-agendamento-${startDate.getTime()}`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AnyHair//Agendamento//PT
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${nowIcs}
DTSTART:${startDateIcs}
DTEND:${endDateIcs}
SUMMARY:${eventName} no Any Hair
DESCRIPTION:${eventDescription}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'agendamento-anyhair.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!selectedServices || selectedServices.length === 0 || !selectedProfessional || !selectedDateTime) {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-brand-secondary to-brand-light text-brand-dark flex flex-col font-sans justify-center items-center p-6 text-center">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">Não encontramos os detalhes do seu agendamento. Por favor, tente fazer o agendamento novamente.</p>
          <button onClick={() => navigate('/')} className="w-full mt-8 font-sans py-3 px-4 rounded-xl bg-brand-primary text-white shadow-lg hover:bg-white hover:text-brand-primary border-2 border-transparent hover:border-brand-primary transition-all duration-300 transform hover:scale-105 btn-text-layout">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-brand-secondary to-brand-light text-brand-dark flex flex-col font-sans justify-center items-center p-6 text-center">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md w-full">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Agendamento Confirmado!</h2>
        <p className="text-gray-600 mb-6">Seu horário foi agendado com sucesso. Nos vemos em breve!</p>
        
        <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="grid grid-cols-[auto_1fr] items-start gap-4">
                <span className="font-semibold text-gray-600">Serviços:</span>
                <div className="text-right">
                    {selectedServices.map(service => (
                        <p key={service.id} className="font-medium">{service.name}</p>
                    ))}
                </div>
            </div>
             <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                <span className="font-semibold text-gray-600">Profissional:</span>
                <span className="font-medium text-right text-lg">{selectedProfessional?.name}</span>
            </div>
             <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                <span className="font-semibold text-gray-600">Data:</span>
                <span className="font-medium text-right">{selectedDateTime?.date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} às {selectedDateTime?.time}</span>
            </div>
        </div>

        {isGuest && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <h3 className="font-bold text-green-800">Crie uma conta para facilitar seus próximos agendamentos!</h3>
                <p className="text-sm text-green-700 mt-1">Seu nome já está preenchido. É rápido e fácil.</p>
                <button onClick={() => navigate('/register')} className="mt-3 btn-success">
                    Criar conta em 10 segundos
                </button>
            </div>
        )}

        <div className="w-full mt-8 space-y-3">
            <button onClick={handleAddToCalendar} className="w-full flex items-center justify-center btn-secondary py-3">
                <AddToCalendarIcon />
                Adicionar ao Calendário
            </button>
            <button onClick={() => navigate('/')} className="w-full font-sans py-3 px-4 rounded-xl bg-brand-primary text-white shadow-lg hover:bg-white hover:text-brand-primary border-2 border-transparent hover:border-brand-primary transition-all duration-300 transform hover:scale-105 btn-text-layout">
                Voltar ao Início
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;