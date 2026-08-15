'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Lock, Mail, User } from 'lucide-react';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

interface AuthAnimatedCharacterProps {
  focusedInput?: 'email' | 'password' | 'name' | 'phone' | null;
  isSubmitting?: boolean;
  mode?: 'login' | 'register';
}

export default function AuthAnimatedCharacter({
  focusedInput = null,
  isSubmitting = false,
  mode = 'login',
}: AuthAnimatedCharacterProps) {
  const { lang } = useThemeLanguage();
  const isEn = lang === 'en';
  const [hasLanded, setHasLanded] = useState(false);
  const [isWaving, setIsWaving] = useState(true);

  useEffect(() => {
    // Entrance animation sequence
    const timer = setTimeout(() => {
      setHasLanded(true);
    }, 400);

    const waveTimer = setTimeout(() => {
      setIsWaving(false);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(waveTimer);
    };
  }, []);

  // Calculate eye positions based on focused input
  const getPupilOffset = () => {
    if (focusedInput === 'password') {
      return { x: 0, y: -4 }; // Looking up / covering eyes
    }
    if (focusedInput === 'email' || focusedInput === 'name' || focusedInput === 'phone') {
      return { x: -6, y: 3 }; // Looking towards input form (Left in RTL)
    }
    return { x: 0, y: 0 }; // Normal looking straight
  };

  const pupilOffset = getPupilOffset();

  // Speech bubble text based on state
  const getSpeechText = () => {
    if (isSubmitting) {
      return isEn ? 'Verifying and signing in... 💼' : 'جاري التحقق وتسجيل الدخول... 💼';
    }
    if (focusedInput === 'password') {
      return isEn
        ? 'Account data is 256-bit encrypted and secured 🔒'
        : 'بيانات الحساب مشفرة ومحمية بالكامل 🔒';
    }
    if (focusedInput === 'email') {
      return isEn ? 'Please enter your registered email address 📧' : 'يرجى إدخال البريد الإلكتروني المعتمد 📧';
    }
    if (focusedInput === 'name') {
      return isEn
        ? 'Delighted to have you join Tamoora Investment Platform ✨'
        : 'يسعدنا انضمامك إلى منصة طامورة الاستثمارية ✨';
    }
    if (focusedInput === 'phone') {
      return isEn ? 'Phone number for contact & verification 📱' : 'رقم الهاتف للتواصل والتوثيق 📱';
    }
    if (mode === 'register') {
      return isEn
        ? 'Welcome to Tamoora Investment Platform! 👋💼'
        : 'أهلاً بك في منصة طامورة الاستثمارية! 👋💼';
    }
    return isEn
      ? 'Welcome back to your investment account 👋💼'
      : 'مرحباً بعودتك إلى حسابك الاستثماري 👋💼';
  };

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-[500px] bg-gradient-to-br from-[#EE8262] via-[#E27D60] to-[#D96B43] dark:from-[#2B1B2B] dark:via-[#1F1524] dark:to-[#120B16] rounded-3xl p-8 flex flex-col justify-between items-center overflow-hidden shadow-2xl border border-white/20">
      
      {/* 🌟 Stage Ambient Glow & Floating Decorative Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-300/30 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-400/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* 💡 Header / Badge */}
      <div className="relative z-10 text-center w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold shadow-sm mb-3">
          <Sparkles size={14} className="text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
          <span>
            {mode === 'login'
              ? (isEn ? '100% Secure Login' : 'تسجيل دخول آمن 100%')
              : (isEn ? 'New Investment Account' : 'حساب تشاركي جديد')}
          </span>
        </div>
        <h2 className="text-2xl font-black text-white drop-shadow-sm">
          {mode === 'login'
            ? (isEn ? 'Tamoora Investment Platform' : 'منصة طامورة للاستثمار')
            : (isEn ? 'Join the Tamoora Family' : 'انضم لعائلة طامورة')}
        </h2>
      </div>

      {/* 💬 Speech Bubble */}
      <div className={`relative z-20 transition-all duration-300 transform ${hasLanded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}`}>
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md text-slate-800 dark:text-white px-5 py-2.5 rounded-2xl shadow-xl border border-white/40 text-sm font-bold flex items-center gap-2 text-center relative">
          <span>{getSpeechText()}</span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 dark:bg-slate-800/95 rotate-45 border-r border-b border-white/40" />
        </div>
      </div>

      {/* 🧍 3D Animated Character Container */}
      <div className="relative z-10 w-full max-w-[280px] h-[280px] flex items-end justify-center my-auto">
        
        {/* Floor Shadow */}
        <div className="absolute bottom-1 w-48 h-6 bg-black/25 rounded-full blur-md" />

        <svg
          viewBox="0 0 240 300"
          className={`w-full h-full transition-transform duration-500 ${hasLanded ? 'translate-y-0' : 'translate-y-12 opacity-0'}`}
          style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.25))' }}
        >
          <defs>
            {/* Hair Gradient */}
            <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            {/* Jacket Gradient */}
            <linearGradient id="jacketGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            {/* Briefcase Gradient */}
            <linearGradient id="briefcaseGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>

          {/* 💼 Briefcase on Floor */}
          <g className={`transition-all duration-700 ${hasLanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
            <rect x="35" y="225" width="45" height="32" rx="5" fill="url(#briefcaseGrad)" />
            {/* Handle */}
            <path d="M 48 225 C 48 218, 67 218, 67 225" stroke="#F59E0B" strokeWidth="3" fill="none" />
            {/* Metallic Clasp */}
            <rect x="53" y="235" width="9" height="6" rx="1.5" fill="#FBBF24" />
            <line x1="35" y1="238" x2="80" y2="238" stroke="#92400E" strokeWidth="1.5" />
          </g>

          {/* 👖 Legs & Shoes */}
          <g>
            {/* Left Leg */}
            <rect x="95" y="190" width="18" height="75" rx="7" fill="#1E293B" />
            <ellipse cx="104" cy="265" rx="14" ry="7" fill="#0F172A" />
            {/* Right Leg */}
            <rect x="127" y="190" width="18" height="75" rx="7" fill="#1E293B" />
            <ellipse cx="136" cy="265" rx="14" ry="7" fill="#0F172A" />
          </g>

          {/* 🧥 Torso / Blazer Body */}
          <g>
            {/* White Shirt */}
            <polygon points="120,105 102,130 138,130" fill="#FFFFFF" />
            {/* Red Tie */}
            <polygon points="120,112 116,155 120,162 124,155" fill="#EF4444" />
            {/* Jacket */}
            <path d="M 85,115 C 85,100 155,100 155,115 L 150,195 C 150,200 90,200 90,195 Z" fill="url(#jacketGrad)" />
            {/* Collar V-neck cuts */}
            <path d="M 85,115 L 108,160 L 120,130 L 132,160 L 155,115" fill="none" stroke="#1E40AF" strokeWidth="2.5" />
            {/* Buttons */}
            <circle cx="120" cy="170" r="2.5" fill="#FBBF24" />
            <circle cx="120" cy="182" r="2.5" fill="#FBBF24" />
          </g>

          {/* 🖐 Left Arm (Side) */}
          <g>
            <path d="M 85,115 C 70,135 72,165 76,180" stroke="url(#jacketGrad)" strokeWidth="18" strokeLinecap="round" fill="none" />
            <circle cx="76" cy="182" r="9" fill="#FDBA74" />
          </g>

          {/* 🖐 Right Arm (Waving or Normal) */}
          <g className={`transition-transform duration-500 origin-[155px_115px] ${isWaving ? 'animate-bounce' : ''}`}>
            {focusedInput === 'password' ? (
              // Covering eyes pose!
              <path d="M 155,115 C 165,110 150,75 130,70" stroke="url(#jacketGrad)" strokeWidth="18" strokeLinecap="round" fill="none" />
            ) : isWaving ? (
              // Friendly Wave
              <path d="M 155,115 C 175,100 185,70 175,50" stroke="url(#jacketGrad)" strokeWidth="18" strokeLinecap="round" fill="none" />
            ) : (
              // Confident hand on hip
              <path d="M 155,115 C 175,130 170,160 158,165" stroke="url(#jacketGrad)" strokeWidth="18" strokeLinecap="round" fill="none" />
            )}
            <circle
              cx={focusedInput === 'password' ? 128 : isWaving ? 175 : 158}
              cy={focusedInput === 'password' ? 68 : isWaving ? 46 : 165}
              r="9"
              fill="#FDBA74"
            />
          </g>

          {/* 👤 Head & Face */}
          <g className="transition-transform duration-300">
            {/* Neck */}
            <rect x="111" y="92" width="18" height="18" rx="4" fill="#FDBA74" />

            {/* Head Circle */}
            <ellipse cx="120" cy="70" rx="32" ry="34" fill="#FED7AA" />

            {/* 💇 Blond Hair */}
            <path
              d="M 86,65 C 86,30 154,30 154,65 C 154,55 145,40 120,40 C 95,40 86,55 86,65 Z"
              fill="url(#hairGrad)"
            />
            {/* Hair Fringe / Swoop */}
            <path
              d="M 88,60 C 100,45 130,42 152,52 C 140,48 110,48 94,65 Z"
              fill="#F59E0B"
            />

            {/* 🙈 Password Cover Hands / Glasses */}
            {focusedInput === 'password' ? (
              <g className="animate-pulse">
                {/* Cute Hands covering eyes */}
                <ellipse cx="108" cy="68" rx="12" ry="10" fill="#FDBA74" />
                <ellipse cx="132" cy="68" rx="12" ry="10" fill="#FDBA74" />
                <path d="M 100,68 Q 120,60 140,68" stroke="#D97706" strokeWidth="2" fill="none" />
              </g>
            ) : (
              /* 👀 Eyes with dynamic tracking pupils */
              <g>
                {/* Left Eye White */}
                <ellipse cx="106" cy="68" rx="7" ry="8" fill="#FFFFFF" />
                {/* Right Eye White */}
                <ellipse cx="134" cy="68" rx="7" ry="8" fill="#FFFFFF" />

                {/* Left Pupil */}
                <circle
                  cx={106 + pupilOffset.x}
                  cy={68 + pupilOffset.y}
                  r="3.5"
                  fill="#1E293B"
                  className="transition-all duration-200"
                />
                <circle cx={107 + pupilOffset.x} cy={66 + pupilOffset.y} r="1.2" fill="#FFFFFF" />

                {/* Right Pupil */}
                <circle
                  cx={134 + pupilOffset.x}
                  cy={68 + pupilOffset.y}
                  r="3.5"
                  fill="#1E293B"
                  className="transition-all duration-200"
                />
                <circle cx={135 + pupilOffset.x} cy={66 + pupilOffset.y} r="1.2" fill="#FFFFFF" />

                {/* Eyebrows */}
                <path d="M 98,58 Q 106,54 114,58" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 126,58 Q 134,54 142,58" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* 🌸 Blushing Cheeks */}
            <ellipse cx="98" cy="76" rx="5" ry="3" fill="#F87171" opacity="0.5" />
            <ellipse cx="142" cy="76" rx="5" ry="3" fill="#F87171" opacity="0.5" />

            {/* 👄 Mouth */}
            <path
              d={isSubmitting ? "M 110,82 Q 120,92 130,82" : "M 112,82 Q 120,89 128,82"}
              stroke="#9A3412"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill={isSubmitting ? "#9A3412" : "none"}
            />
          </g>
        </svg>
      </div>

      {/* 🛡️ Footer Feature Pills */}
      <div className="relative z-10 flex flex-wrap justify-center gap-2 mt-4 text-white/90 text-xs font-medium">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md">
          <ShieldCheck size={14} className="text-emerald-300" />
          <span>تشفير عالي الأمان</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md">
          <Sparkles size={14} className="text-amber-300" />
          <span>أرباح وتوزيعات يومية</span>
        </div>
      </div>
    </div>
  );
}
