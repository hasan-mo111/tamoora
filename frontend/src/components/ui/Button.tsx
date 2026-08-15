'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';
  
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-500/25 focus:ring-primary-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:border-primary-700 hover:text-primary-700 focus:ring-primary-500 bg-white/50',
    ghost: 'text-primary-600 hover:bg-primary-50/80 focus:ring-primary-500',
    danger: 'bg-error text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
    gradient: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 focus:ring-primary-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    glass: 'bg-white/70 backdrop-blur-md border border-white/40 text-gray-800 hover:bg-white/90 focus:ring-gray-400 shadow-sm hover:shadow-md',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-2.5 text-base gap-2',
    lg: 'px-8 py-3 text-lg gap-2',
    xl: 'px-10 py-4 text-xl gap-3',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" aria-hidden="true" />
      )}
      {!isLoading && rightIcon && (
        <span className="order-first">{rightIcon}</span>
      )}
      {children}
      {!isLoading && leftIcon && (
        <span className="order-last">{leftIcon}</span>
      )}
    </button>
  );
}