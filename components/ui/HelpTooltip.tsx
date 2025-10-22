import React, { useState, useEffect, useRef } from 'react';
import { QuestionMarkIcon } from './Icons';

interface HelpTooltipProps {
  text: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ text }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={tooltipRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleTooltip}
        className="text-gray-400 hover:text-brand-primary transition-colors"
        aria-label="Ver ajuda"
      >
        <QuestionMarkIcon />
      </button>

      {isOpen && (
        <div
          className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-64 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10 animate-fade-in-fast"
          role="tooltip"
        >
          <p className="text-sm text-gray-700 font-normal">{text}</p>
          <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-white border-t border-r border-gray-200 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};
