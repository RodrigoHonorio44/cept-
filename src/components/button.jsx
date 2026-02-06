import React from 'react';
import { toLowerCase } from '../utils/Formatters';

const variants = {
  primary: 'bg-brand-primary text-white hover:bg-blue-700',
  secondary: 'bg-brand-secondary text-white hover:bg-orange-600',
  success: 'bg-brand-success text-white hover:bg-green-700',
  outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white'
};

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button 
      className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 lowercase shadow-sm active:scale-95 ${variants[variant]} ${className}`}
      {...props}
    >
      {toLowerCase(children)}
    </button>
  );
}