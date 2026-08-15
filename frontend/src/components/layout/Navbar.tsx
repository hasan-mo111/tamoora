'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard, Wallet, ChevronDown, Sun, Moon, Globe, Users, Headset } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isGuest } from '@/utils/guestToken';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';
import CoinLogo from './CoinLogo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, lang, toggleLanguage, t, isDark } = useThemeLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <CoinLogo size={40} />
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800/80 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <CoinLogo size={42} />
            <div>
              <h1 className="text-xl font-extrabold text-primary-600 dark:text-primary-400">طامورة</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {lang === 'ar' ? 'شارك بفكرتك وكن جزءاً من مستقبل الاستثمار' : 'Invest together in the future of businesses'}
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-5">
            <Link href="/" className="text-gray-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
              {t('nav.home')}
            </Link>
            
            {!isAuthenticated && (
              <>
                <Link href="/about" className="text-gray-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  {t('nav.about')}
                </Link>
                <Link href="/terms" className="text-gray-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  {t('nav.terms')}
                </Link>
                <Link href="/faq" className="text-gray-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  {t('nav.faq')}
                </Link>
              </>
            )}
            
            {isAuthenticated && (
              <>
                <Link href="/investments" className="text-gray-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  {t('nav.investments')}
                </Link>
                <Link href="/dashboard/investments" className="text-gray-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  {t('nav.dashboard')}
                </Link>
              </>
            )}

            {/* Support Team Icon Button */}
            <a
              href="tel:+963936834823"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-colors"
              title="فريق الدعم (+963 936834823)"
            >
              <Headset size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>فريق الدعم</span>
            </a>

            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={lang === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
              aria-label="Language switch"
            >
              <Globe size={15} className="text-primary-600 dark:text-primary-400" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? t('theme.lightMode') : t('theme.darkMode')}
              aria-label="Theme toggle"
            >
              {isDark ? (
                <Sun size={18} className="text-amber-400 animate-spin-once" />
              ) : (
                <Moon size={18} className="text-slate-700" />
              )}
            </button>

            {/* User Dropdown or Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 dark:text-slate-200 hover:text-primary-600 font-medium"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-start">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {user.role === 'admin' ? t('nav.adminRole') : t('nav.investorRole')}
                    </p>
                  </div>
                  <ChevronDown size={16} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 border border-gray-100 dark:border-slate-700 z-20">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          {user.role === 'admin' ? t('nav.adminRole') : t('nav.investorRole')}
                        </p>
                      </div>
                      
                      <Link href="/dashboard/investments" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-600 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                        <LayoutDashboard size={18} />
                        <span>{t('nav.dashboard')}</span>
                      </Link>
                      
                      <Link href="/dashboard/wallet" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-600 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                        <Wallet size={18} />
                        <span>{t('nav.wallet')}</span>
                      </Link>

                      <Link href="/dashboard/referrals" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-600 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                        <Users size={18} />
                        <span>{lang === 'ar' ? 'نظام الإحالات والبرومو كود' : 'Referrals & Promo'}</span>
                      </Link>
                      
                      <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-600 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                        <User size={18} />
                        <span>{t('nav.profile')}</span>
                      </Link>
                      
                      {user.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-slate-200 hover:bg-accent-50 dark:hover:bg-slate-700 hover:text-accent-600 transition-colors border-t border-gray-100 dark:border-slate-700" onClick={() => setIsUserMenuOpen(false)}>
                          <LayoutDashboard size={18} />
                          <span>{t('nav.admin')}</span>
                        </Link>
                      )}
                      
                      <hr className="my-2 border-gray-100 dark:border-slate-700" />
                      
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-3 w-full text-start px-4 py-2.5 text-error hover:bg-error/5 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {isGuest() && (
                  <span className="text-sm text-gray-600 dark:text-slate-300 hidden sm:block">{t('nav.welcomeGuest')}</span>
                )}
                <Link href="/auth/login" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-md hover:shadow-lg text-sm">
                  {t('nav.login')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-slate-200"
              aria-label="Language Switcher"
            >
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200"
              aria-label="Theme Toggle"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-700 dark:text-slate-200">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-slate-800 space-y-1">
            {isAuthenticated && user ? (
              <>
                <div className="px-4 py-3 bg-primary-50 dark:bg-slate-800 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{user.email}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{user.role === 'admin' ? t('nav.adminRole') : t('nav.investorRole')}</p>
                </div>
                <Link href="/dashboard/investments" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={18} />
                  <span>{t('nav.dashboard')}</span>
                </Link>
                <Link href="/dashboard/wallet" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>
                  <Wallet size={18} />
                  <span>{t('nav.wallet')}</span>
                </Link>
                <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>
                  <User size={18} />
                  <span>{t('nav.profile')}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>
                    <LayoutDashboard size={18} />
                    <span>{t('nav.admin')}</span>
                  </Link>
                )}
                <hr className="my-2 border-gray-100 dark:border-slate-800" />
                <button onClick={() => { setIsOpen(false); logout(); }} className="flex items-center gap-3 w-full text-start px-4 py-2.5 text-error hover:bg-gray-100 dark:hover:bg-slate-800">
                  <LogOut size={18} />
                  <span>{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/" className="block px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>{t('nav.home')}</Link>
                <Link href="/about" className="block px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>{t('nav.about')}</Link>
                <Link href="/terms" className="block px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>{t('nav.terms')}</Link>
                <Link href="/faq" className="block px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>{t('nav.faq')}</Link>
                <Link href="/auth/login" className="block px-4 py-2 text-primary-600 dark:text-primary-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>{t('nav.login')}</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
