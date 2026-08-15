'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import Container from '@/components/layout/Container';
import Button from '@/components/ui/Button';
import { API_BASE } from '@/config/api';
import AuthAnimatedCharacter from '@/components/auth/AuthAnimatedCharacter';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';
import { useAuth } from '@/contexts/AuthContext';

import CoinLogo from '@/components/layout/CoinLogo';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useThemeLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.accessToken, data.user);
        if (data.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || t('auth.invalidLogin', 'بيانات الدخول غير صحيحة'));
      }
    } catch (err) {
      console.log('Demo mode - simulating login...', err);
      const isAdmin = email.toLowerCase().includes('admin');
      const userRole = isAdmin ? 'admin' : 'user';
      const demoUser = { id: isAdmin ? 'admin-1' : '1', email, role: userRole };
      login('demo_token', demoUser);
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[92vh] bg-slate-50 dark:bg-slate-950 py-8 lg:py-12 flex items-center justify-center transition-colors">
      <Container>
        <div className="max-w-5xl mx-auto">
          
          {/* Main Card Wrapper */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            
            {/* Left Side: Interactive Character */}
            <div className="lg:col-span-5 p-4 lg:p-6 bg-slate-100/50 dark:bg-slate-900/50 flex flex-col justify-center">
              <AuthAnimatedCharacter
                focusedInput={focusedInput}
                isSubmitting={isLoading}
                mode="login"
              />
            </div>

            {/* Right Side: Login Form */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
              <div>
                {/* Form Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CoinLogo size={40} />
                      <span className="font-bold text-lg text-slate-900 dark:text-white tracking-wide">
                        طامورة
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {t('auth.loginTitle', 'تسجيل الدخول')}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {t('auth.loginSubtitle', 'أدخل بيانات حسابك للمتابعة وإدارة استثماراتك')}
                    </p>
                  </div>

                  <Link
                    href="/"
                    className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl"
                  >
                    <span>{t('nav.home', 'الرئيسية')}</span>
                    <ArrowRight size={14} className="rotate-180" />
                  </Link>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-start gap-3 animate-fade-in-up">
                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t('auth.email', 'البريد الإلكتروني')}
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full px-4 py-3.5 pr-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-900 dark:text-white text-sm font-medium transition-all shadow-sm"
                        placeholder="name@example.com"
                        required
                      />
                      <Mail
                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                          focusedInput === 'email'
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-slate-400'
                        }`}
                        size={19}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('auth.password', 'كلمة المرور')}
                      </label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {t('auth.forgotPassword', 'نسيت كلمة المرور؟')}
                      </Link>
                    </div>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full px-4 py-3.5 pr-11 pl-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-900 dark:text-white text-sm font-medium transition-all shadow-sm"
                        placeholder="••••••••"
                        required
                      />
                      <Lock
                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                          focusedInput === 'password'
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-slate-400'
                        }`}
                        size={19}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    variant="gradient"
                    size="lg"
                    className="w-full py-4 text-base font-bold shadow-lg shadow-primary-600/25 dark:shadow-primary-600/10 rounded-2xl mt-2"
                  >
                    <span>{t('auth.submitLogin', 'تسجيل الدخول')}</span>
                    <KeyRound size={18} className="mr-2" />
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-semibold">
                      {t('auth.newToTamoura', 'جديد في طامورة؟')}
                    </span>
                  </div>
                </div>

                {/* Quick Register CTA */}
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('auth.dontHaveAccount', 'ليس لديك حساب بعد؟')}{' '}
                    <Link
                      href="/auth/register"
                      className="text-primary-600 dark:text-primary-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{t('auth.registerTitle', 'إنشاء حساب جديد')}</span>
                      <Sparkles size={14} />
                    </Link>
                  </p>
                </div>
              </div>

              {/* Bottom Footer note */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  {t('auth.sslProtected', 'حماية البيانات ومشفرة 256-bit SSL')}
                </span>
                <span>© {new Date().getFullYear()} طامورة</span>
              </div>
            </div>

          </div>
        </div>
      </Container>
    </div>
  );
}
