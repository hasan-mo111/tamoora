'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, UserPlus, ChevronDown } from 'lucide-react';
import Container from '@/components/layout/Container';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/config/api';
import AuthAnimatedCharacter from '@/components/auth/AuthAnimatedCharacter';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';
import CountryModalSelector, { COUNTRIES, CountryOption } from '@/components/ui/CountryModalSelector';

import CoinLogo from '@/components/layout/CoinLogo';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, lang } = useThemeLanguage();
  const isEn = lang === 'en';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  const [phoneNumberOnly, setPhoneNumberOnly] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRIES.find((c) => c.code === 'SY') || COUNTRIES[0]
  );
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | 'name' | 'phone' | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
      if (refCode) {
        setFormData((prev) => ({ ...prev, referralCode: refCode.trim() }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('security.passwordMismatch', 'كلمات المرور غير متطابقة'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('auth.passwordLengthError', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'));
      return;
    }

    if (!agreedToTerms) {
      setError(t('auth.agreeRequired', 'يجب الموافقة على الشروط والأحكام'));
      return;
    }

    const cleanNumber = phoneNumberOnly.replace(/^0+/, '').trim();
    if (!cleanNumber || cleanNumber.length < 5) {
      setError(t('auth.invalidPhone', 'رقم الهاتف غير صالح'));
      return;
    }

    const fullPhone = cleanNumber.startsWith('+') ? cleanNumber : `${selectedCountry.dialCode}${cleanNumber}`;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: fullPhone,
          password: formData.password,
          referralCode: formData.referralCode || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.accessToken, data.user);
        router.push('/auth/pin-setup');
      } else {
        setError(data.message || t('auth.errorOccurred', 'حدث خطأ أثناء التسجيل'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      // Demo fallback simulation
      login('demo_token', { id: '1', email: formData.email, role: 'user' });
      router.push('/auth/pin-setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[92vh] bg-slate-50 dark:bg-slate-950 py-8 lg:py-12 flex items-center justify-center transition-colors">
      <Container>
        <div className="max-w-6xl mx-auto">
          
          {/* Main Container Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
            
            {/* Left Side: 3D Animated Character */}
            <div className="lg:col-span-5 p-4 lg:p-6 bg-slate-100/50 dark:bg-slate-900/50 flex flex-col justify-center">
              <AuthAnimatedCharacter
                focusedInput={focusedInput}
                isSubmitting={isLoading}
                mode="register"
              />
            </div>

            {/* Right Side: Registration Form */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CoinLogo size={40} />
                      <span className="font-bold text-lg text-slate-900 dark:text-white tracking-wide">
                        {isEn ? 'Tamoora' : 'طامورة'}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {t('auth.registerTitle', 'إنشاء حساب جديد')}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {t('auth.registerSubtitle', 'انضم إلى منصتنا ابدأ رحلتك الاستثمارية بعوائد يومية')}
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

                {/* Error Banner */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-start gap-3 animate-fade-in-up">
                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('auth.firstName', 'الاسم الأول')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          onFocus={() => setFocusedInput('name')}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-900 dark:text-white text-sm font-medium transition-all shadow-sm"
                          placeholder="أحمد"
                          required
                        />
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('auth.lastName', 'الكنية / العائلة')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          onFocus={() => setFocusedInput('name')}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-900 dark:text-white text-sm font-medium transition-all shadow-sm"
                          placeholder="العلي"
                          required
                        />
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('auth.email', 'البريد الإلكتروني')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-900 dark:text-white text-sm font-medium transition-all shadow-sm"
                        placeholder="example@mail.com"
                        required
                      />
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>

                  {/* International Phone Field with Country Code Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('auth.phone', 'رقم الهاتف الدولي')} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {/* Country Flag & Dial Code Button */}
                      <button
                        type="button"
                        onClick={() => setIsCountryModalOpen(true)}
                        className="flex items-center gap-2 px-3.5 py-3 bg-amber-50/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-2xl hover:bg-amber-100 dark:hover:bg-slate-700/80 transition-colors shadow-sm cursor-pointer"
                        title={t('country.selectTitle', 'اختر الدولة')}
                      >
                        <span className="text-xl leading-none">{selectedCountry.flag}</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono dir-ltr">
                          {selectedCountry.dialCode}
                        </span>
                        <ChevronDown size={16} className="text-slate-400" />
                      </button>

                      {/* Phone Number Input */}
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          name="phone"
                          value={phoneNumberOnly}
                          onChange={(e) => setPhoneNumberOnly(e.target.value)}
                          onFocus={() => setFocusedInput('phone')}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-900 dark:text-white text-sm font-medium transition-all shadow-sm"
                          placeholder="912 345 678"
                          required
                        />
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('auth.password', 'كلمة المرور')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onFocus={() => setFocusedInput('password')}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full px-4 py-3 pr-11 pl-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-900 dark:text-white text-sm font-medium transition-all shadow-sm"
                          placeholder="••••••••"
                          required
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('auth.confirmPassword', 'تأكيد كلمة المرور')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onFocus={() => setFocusedInput('password')}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-900 dark:text-white text-sm font-medium transition-all shadow-sm"
                          placeholder="••••••••"
                          required
                        />
                        <CheckCircle
                          className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                            formData.confirmPassword && formData.password === formData.confirmPassword
                              ? 'text-emerald-500'
                              : 'text-slate-400'
                          }`}
                          size={18}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Referral Code (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('auth.referralCode', 'كود الإحالة')}{' '}
                      <span className="text-slate-400 text-xs font-normal">{t('auth.optional', '(اختياري)')}</span>
                    </label>
                    <input
                      type="text"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-slate-900 dark:text-white text-sm font-medium transition-all shadow-sm"
                      placeholder={t('auth.referralPlaceholder', 'أدخل كود صديقك لمكافأة ترحيبية')}
                    />
                  </div>

                  {/* Terms & Conditions */}
                  <div className="flex items-start gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700"
                      required
                    />
                    <label htmlFor="terms" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t('auth.agreeTerms', 'أوافق على الشروط والأحكام وسياسة الخصوصية')}
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    variant="gradient"
                    size="lg"
                    className="w-full py-4 text-base font-bold shadow-lg shadow-primary-600/25 dark:shadow-primary-600/10 rounded-2xl mt-3"
                  >
                    <span>{t('auth.submitRegister', 'إنشاء الحساب الان')}</span>
                    <UserPlus size={18} className="mr-2" />
                  </Button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('auth.alreadyHaveAccount', 'لديك حساب بالفعل؟')}{' '}
                    <Link
                      href="/auth/login"
                      className="text-primary-600 dark:text-primary-400 font-bold hover:underline"
                    >
                      {t('nav.login', 'تسجيل الدخول')}
                    </Link>
                  </p>
                </div>
              </div>

              {/* Bottom Footer note */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  {t('auth.protectedData', 'بيانات معتمدة ومحمية 100%')}
                </span>
                <span>© {new Date().getFullYear()} طامورة</span>
              </div>
            </div>

          </div>
        </div>
      </Container>

      {/* Country Modal Selector */}
      <CountryModalSelector
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        selectedCountry={selectedCountry}
        onSelect={(country) => setSelectedCountry(country)}
      />
    </div>
  );
}
