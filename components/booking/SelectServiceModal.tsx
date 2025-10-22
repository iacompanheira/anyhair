import React, { useMemo } from 'react';
import type { Service } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { LockIcon } from '../ui/Icons';

interface StepSelectServiceProps {
  services: Service[];
  selectedServices: Service[];
  onToggleService: (service: Service) => void;
}

const StepSelectService: React.FC<StepSelectServiceProps> = ({ services, selectedServices, onToggleService }) => {
  const includedServiceIds = useMemo(() => {
    const ids = new Set<number>();
    selectedServices.forEach(service => {
        service.includesServiceIds?.forEach(id => ids.add(id));
    });
    return ids;
  }, [selectedServices]);

  return (
    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
      {services.map(service => {
        const isSelected = selectedServices.some(s => s.id === service.id);
        const isLocked = isSelected && includedServiceIds.has(service.id);
        const priceAsNumber = parseFloat(service.price.replace('R$', '').replace(',', '.'));

        let classNames = 'flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary ';
        if (isSelected) {
            if (isLocked) {
                // Style for locked included services
                classNames += 'bg-gray-800 ring-2 ring-pink-900 cursor-help';
            } else {
                // Style for regular selected services
                classNames += 'bg-gray-700 ring-2 ring-brand-primary';
            }
        } else {
            // Style for unselected services
            classNames += 'bg-brand-input-bg text-white hover:bg-gray-700 border border-gray-700';
        }

        return (
          <div
            key={service.id}
            onClick={() => onToggleService(service)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggleService(service)}
            className={classNames}
            aria-disabled={isLocked}
            title={isLocked ? "Este serviço faz parte de um pacote. Para removê-lo, desmarque o pacote principal." : ""}
          >
            <div className="flex-grow">
              <p className="font-semibold text-white flex items-center gap-2">
                {service.icon && <i className={`${service.icon} text-brand-primary w-5 text-center`}></i>}
                <span>{service.name}</span>
                {isLocked && <LockIcon />}
              </p>
              <p className="text-sm text-gray-300 mt-1">{service.description}</p>
              <p className="text-sm text-gray-400 mt-1">
                {service.duration} - {service.isPriceHidden ? 'Consulte' : formatCurrency(priceAsNumber)}
              </p>
            </div>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 shrink-0 ml-4 ${isSelected ? (isLocked ? 'bg-pink-800 border-pink-700' : 'bg-brand-primary border-brand-primary') : 'border-gray-300 bg-transparent'}`}>
              {isSelected && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default StepSelectService;