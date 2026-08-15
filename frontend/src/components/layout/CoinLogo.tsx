'use client';

import React from 'react';

interface CoinLogoProps {
  size?: number;
  className?: string;
}

export default function CoinLogo({ size = 44, className = '' }: CoinLogoProps) {
  return (
    <div 
      className={`relative inline-block select-none group ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, perspective: '1000px' }}
    >
      {/* Golden Ambient Glow Aura */}
      <div 
        className="absolute inset-0 rounded-full bg-amber-400/30 dark:bg-amber-400/20 blur-md transition-all duration-300 group-hover:bg-amber-400/50 group-hover:scale-110"
      />

      <div 
        className="w-full h-full relative animate-coin-spin preserve-3d cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Front Face - Arabic Logo */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center p-0.5"
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            transform: 'translateZ(1px)',
          }}
        >
          {/* eslint-disable-next-next/no-img-element */}
          <img
            src="/logo-ar.svg"
            alt="طامورة"
            className="w-full h-full object-contain filter drop-shadow-sm"
          />
        </div>

        {/* Back Face - English Logo */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center p-0.5"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)',
          }}
        >
          {/* eslint-disable-next-next/no-img-element */}
          <img
            src="/logo-en.svg"
            alt="TAMOORA"
            className="w-full h-full object-contain filter drop-shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
