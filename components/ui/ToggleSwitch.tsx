import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, setEnabled }) => (
    <button onClick={() => setEnabled(!enabled)} className={`${enabled ? 'bg-brand-primary' : 'bg-gray-300'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary`}>
        <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
    </button>
);