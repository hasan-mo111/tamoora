'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'right' | 'left';
  iconAction?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  icon,
  iconPosition = 'right',
  iconAction,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full px-4 py-3 border rounded-xl transition-all duration-200
            bg-white/50 dark:bg-slate-800/80 backdrop-blur-sm text-gray-900 dark:text-slate-100
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800
            disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed
            placeholder:text-gray-400 dark:placeholder:text-slate-500
            ${error ? 'border-error focus:ring-error/50 focus:border-error' : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600'}
            ${icon && iconPosition === 'right' ? 'pr-11' : ''}
            ${icon && iconPosition === 'left' ? 'pl-11' : ''}
            ${className}
          `}
          {...props}
        />
        {iconAction && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {iconAction}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-error flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}