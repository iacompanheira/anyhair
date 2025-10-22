import React, { useMemo } from 'react';
import type { UnifiedUser, Service } from '../../types';
import { CheckIcon } from '../ui/Icons';

interface StepSelectProfessionalProps {
  professionals: UnifiedUser[];
  selectedServices: Service[];
  selectedProfessional: UnifiedUser | null;
  onSelectProfessional: (professional: UnifiedUser) => void;
}

const StepSelectProfessional: React.FC<StepSelectProfessionalProps> = ({ professionals, selectedServices, selectedProfessional, onSelectProfessional }) => {

  const availableProfessionals = useMemo(() => {
    const noPreferenceOption = professionals.find(p => p.id === 0);
    let filtered = professionals.filter(p => p.id !== 0);

    if (selectedServices.length > 0) {
      const selectedServiceIds = selectedServices.map(s => s.id);
      filtered = filtered.filter(p =>
        selectedServiceIds.every(serviceId => p.serviceIds?.includes(serviceId))
      );
    }

    return noPreferenceOption ? [noPreferenceOption, ...filtered] : filtered;
  }, [professionals, selectedServices]);

  return (
    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
      {availableProfessionals.map(pro => (
        <div
          key={pro.id}
          onClick={() => onSelectProfessional(pro)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectProfessional(pro)}
          className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary ${selectedProfessional?.id === pro.id ? 'bg-gray-700 ring-2 ring-brand-primary' : 'bg-brand-input-bg text-white hover:bg-gray-700 border border-gray-700'}`}
        >
          <img src={pro.imageUrl} alt={pro.name} className="w-12 h-12 rounded-full object-cover mr-4" />
          <div className="flex-grow">
            <p className="font-semibold text-white">{pro.name}</p>
            <p className="text-sm text-gray-300">{pro.id === 0 ? pro.specialty : `Especialidade: ${pro.specialty}`}</p>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${selectedProfessional?.id === pro.id ? 'bg-brand-primary border-brand-primary' : 'border-gray-300'}`}>
            {selectedProfessional?.id === pro.id && <CheckIcon variant='light' />}
          </div>
        </div>
      ))}
      {availableProfessionals.length <= 1 && ( // Only shows if "No preference" is the only option
        <div className="text-center p-4 text-gray-300 bg-brand-input-bg rounded-lg border border-gray-700">
          <p>Nenhum profissional específico disponível para os serviços selecionados.</p>
          <p className="text-sm">Selecione "Sem preferência" para que o sistema escolha por você.</p>
        </div>
      )}
    </div>
  );
};

export default StepSelectProfessional;