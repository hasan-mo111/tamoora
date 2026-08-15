'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function Card({
  children,
  className = '',
  hover = true,
  padding = 'md',
  shadow = 'md',
}: CardProps) {
  const baseStyles = 'bg-white dark:bg-slate-800 dark:border dark:border-slate-700/60 text-gray-900 dark:text-slate-100 rounded-xl overflow-hidden transition-colors duration-200';
  
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  const hoverStyles = hover ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1' : '';

  return (
    <div className={`${baseStyles} ${paddingStyles[padding]} ${shadowStyles[shadow]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}