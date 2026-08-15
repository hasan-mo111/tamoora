'use client';

import React, { useEffect, useState } from 'react';

export default function AppSplashLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // إبقاء شاشة البداية الدائرية في المنتصف لمدة ثانية ثم التلاشي بسلاسة
    const timer = setTimeout(() => {
      setIsFading(true);
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 600);
      return () => clearTimeout(removeTimer);
    }, 1100);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      id="tamoora-splash-screen"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-500 ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center justify-center animate-fadeIn p-6">
        {/* Glow ambient background aura */}
        <div className="absolute w-56 h-56 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />

        {/* Circular Ring Frame with Centered Logo */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-yellow-300 to-primary-600 shadow-2xl shadow-amber-500/30 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center p-4 overflow-hidden shadow-inner border border-white/20">
            {/* eslint-disable-next-next/no-img-element */}
            <img
              src="/icon.svg"
              alt="طامورة"
              className="w-full h-full object-contain filter drop-shadow-md animate-scaleUp"
            />
          </div>
        </div>

        {/* Platform Title */}
        <div className="mt-5 text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
            طامـورة
          </h1>
          <p className="text-xs font-semibold tracking-widest text-slate-400 mt-1 uppercase">
            منصة الاستثمار التشاركي
          </p>
        </div>

        {/* Subtle Loading Progress */}
        <div className="flex items-center gap-1.5 mt-5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
