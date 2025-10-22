import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'light-success';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, className = '', isLoading = false, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors';
  
  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-pink-700 focus:ring-pink-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400',
    'light-success': 'bg-green-400 text-white hover:bg-green-500 focus:ring-green-300',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className} btn-text-layout`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <Spinner /> : children}
    </button>
  );
};