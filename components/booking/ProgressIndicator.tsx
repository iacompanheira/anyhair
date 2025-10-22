import React from 'react';
import { UserIcon, ScissorsIcon, CheckIcon } from '../ui/Icons';

export type Step = 'service' | 'professional' | 'summary';

interface ProgressIndicatorProps {
    currentStep: Step;
    onStepClick: (step: 'service' | 'professional') => void;
    stepsStatus: {
        service: boolean;
        professional: boolean;
    };
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, onStepClick, stepsStatus }) => {
    
    const steps: { name: string; id: 'service' | 'professional'; icon: React.ReactElement }[] = [
        { id: 'service', name: 'Serviço', icon: <ScissorsIcon /> },
        { id: 'professional', name: 'Profissional & Hora', icon: <UserIcon /> },
    ];

    const stepOrder: Step[] = ['service', 'professional', 'summary'];
    const currentStepIndex = stepOrder.indexOf(currentStep);

    return (
        <div className="w-full max-w-md mx-auto mb-4 px-4">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const isComplete = stepsStatus[step.id];
                    const isActive = currentStep === step.id;
                    const isClickable = isComplete;

                    return (
                        <React.Fragment key={step.name}>
                            <div className="flex flex-col items-center">
                                <button 
                                    onClick={() => isClickable && onStepClick(step.id)}
                                    disabled={!isClickable && !isActive}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isComplete ? 'bg-brand-primary border-brand-primary' : isActive ? 'bg-white border-brand-primary' : 'bg-gray-200 border-gray-300'} ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                                    aria-current={isActive ? 'step' : undefined}
                                >
                                    {isComplete && currentStepIndex > index ? <CheckIcon /> : <div className={isActive ? "text-brand-primary" : "text-gray-500"}>{step.icon}</div>}
                                </button>
                                <p className={`mt-1 text-xs font-semibold text-center ${isComplete || isActive ? 'text-brand-dark' : 'text-gray-500'}`}>{step.name}</p>
                            </div>

                            {index < steps.length - 1 && (
                                <div className={`flex-grow h-1 transition-colors duration-300 mx-2 ${isComplete && index < currentStepIndex ? 'bg-brand-primary' : 'bg-gray-300'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressIndicator;