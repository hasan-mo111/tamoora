'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Send, CheckCircle, Clock, DollarSign, BarChart3, Tag, User, MessageSquare, Lock, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import { API_BASE } from '@/config/api';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';
import Link from 'next/link';

export default function SuggestProjectForm() {
  const { t } = useThemeLanguage();

  const [hasActiveInvestment, setHasActiveInvestment] = useState<boolean | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    size: 'متوسط',
    estimatedCost: '',
    expectedReturn: '',
    proposerName: '',
    proposerEmail: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function checkEligibility() {
      setIsCheckingEligibility(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setHasActiveInvestment(false);
          setIsCheckingEligibility(false);
          return;
        }

        const res = await fetch(`${API_BASE}/investments/my-subscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const subs = await res.json();
          setHasActiveInvestment(Array.isArray(subs) && subs.length > 0);
        } else {
          setHasActiveInvestment(false);
        }
      } catch (err) {
        console.error('Check eligibility error:', err);
        setHasActiveInvestment(false);
      } finally {
        setIsCheckingEligibility(false);
      }
    }

    checkEligibility();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage(t('propose.titleRequired', 'يرجى كتابة اسم الاستثمار / المشروع'));
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/project-proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormData({
          title: '',
          duration: '',
          size: 'متوسط',
          estimatedCost: '',
          expectedReturn: '',
          proposerName: '',
          proposerEmail: '',
          notes: '',
        });
      } else {
        const err = await response.json();
        setErrorMessage(err.message || 'حدث خطأ أثناء إرسال الاقتراح');
      }
    } catch (err) {
      console.error('Proposal error:', err);
      setErrorMessage('تعذر الاتصال بالخادم لإرسال الاقتراح.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingEligibility) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl text-center border border-gray-100 dark:border-slate-700 max-w-2xl mx-auto">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">جاري التحقق من أهليتك لتقديم اقتراح مشروع...</p>
      </div>
    );
  }

  if (hasActiveInvestment === false) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl border border-amber-200 dark:border-amber-800/60 max-w-2xl mx-auto text-center transition-all">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/10">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          تقديم الاقتراحات متاح حصرًا للمستثمرين
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-6 max-w-lg mx-auto">
          عذراً، تقتصر إمكانية تقديم اقتراحات المشاريع الجديدة على الأعضاء المشتركين في صفقة استثمارية واحدة على الأقل.
          اشترك في إحدى الصفقات الأسبوعية أو الشهرية لتتمكن من رفع أفكارك الاستثمارية مباشرة للإدارة!
        </p>
        <Link href="/investments">
          <Button variant="gradient" size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8">
            <TrendingUp size={18} className="ml-2" />
            تصفح الصفقات المتاحة والاشتراك
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 dark:border-slate-700 max-w-4xl mx-auto transition-all">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <Lightbulb size={32} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('propose.title', 'اقتراح مشروع استثماري')}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 max-w-xl mx-auto">
          {t('propose.subtitle', 'شاركنا فكرتك الاستثمارية، وسيتم إرسالها مباشرة للإدارة للتقييم والتواصل معك.')}
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-2">
            {t('propose.successTitle', 'تم إرسال اقتراحك للإدارة بنجاح! 🎉')}
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-md mx-auto mb-6">
            {t('propose.successDesc', 'شكراً لمساهمتك. تم تسجيل بيانات مشروعك وسيتم الاطلاع عليها من قبل فريق طامورة.')}
          </p>
          <Button onClick={() => setIsSuccess(false)} variant="primary" size="md">
            {t('propose.another', 'اقتراح مشروع آخر')}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {/* Table-like Form layout */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-200 dark:divide-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
            
            {/* Row 1: Project Name */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <label className="md:col-span-4 flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 text-sm">
                <Tag size={18} className="text-primary-600 dark:text-primary-400" />
                <span>{t('propose.projectName', 'اسم الاستثمار / المشروع')}</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="md:col-span-8">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t('propose.projectNamePlaceholder', 'مثال: متجر إلكتروني، مغسلة سيارات...')}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Row 2: Duration */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <label className="md:col-span-4 flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 text-sm">
                <Clock size={18} className="text-primary-600 dark:text-primary-400" />
                <span>{t('propose.duration', 'الزمن / مدة الاستثمار')}</span>
              </label>
              <div className="md:col-span-8">
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder={t('propose.durationPlaceholder', 'مثال: 3 أشهر، 6 أشهر، يومي، سنة كاملة...')}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Row 3: Size / Scope */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <label className="md:col-span-4 flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 text-sm">
                <BarChart3 size={18} className="text-primary-600 dark:text-primary-400" />
                <span>{t('propose.size', 'حجم المشروع / نطاقه')}</span>
              </label>
              <div className="md:col-span-8">
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white text-sm"
                >
                  <option value="صغير">{t('propose.sizeSmall', 'مشروع صغير (تجزئة / ناشئ)')}</option>
                  <option value="متوسط">{t('propose.sizeMedium', 'مشروع متوسط (خدمي / تجاري)')}</option>
                  <option value="كبير">{t('propose.sizeLarge', 'مشروع كبير (مجمع / إنتاجي)')}</option>
                  <option value="أخرى">{t('propose.sizeOther', 'أخرى')}</option>
                </select>
              </div>
            </div>

            {/* Row 4: Estimated Cost */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <label className="md:col-span-4 flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 text-sm">
                <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>{t('propose.estimatedCost', 'كم يكلف تقديرياً؟ (التكلفة)')}</span>
              </label>
              <div className="md:col-span-8">
                <input
                  type="text"
                  name="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  placeholder={t('propose.estimatedCostPlaceholder', 'مثال: $5,000...')}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Row 5: Expected Return */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <label className="md:col-span-4 flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 text-sm">
                <BarChart3 size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>{t('propose.expectedReturn', 'كم العائد المتوقع؟ (الأرباح)')}</span>
              </label>
              <div className="md:col-span-8">
                <input
                  type="text"
                  name="expectedReturn"
                  value={formData.expectedReturn}
                  onChange={handleChange}
                  placeholder={t('propose.expectedReturnPlaceholder', 'مثال: 15% شهرياً...')}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Row 6: Proposer Name & Email (Optional) */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <label className="md:col-span-4 flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 text-sm">
                <User size={18} className="text-primary-600 dark:text-primary-400" />
                <span>{t('propose.nameEmail', 'الاسم والبريد (اختياري)')}</span>
              </label>
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="proposerName"
                  value={formData.proposerName}
                  onChange={handleChange}
                  placeholder={t('auth.firstName', 'اسمك')}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="email"
                  name="proposerEmail"
                  value={formData.proposerEmail}
                  onChange={handleChange}
                  placeholder={t('auth.email', 'بريدك الإلكتروني')}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Row 7: Additional Notes */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <label className="md:col-span-4 flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 text-sm pt-2">
                <MessageSquare size={18} className="text-primary-600 dark:text-primary-400" />
                <span>{t('propose.notes', 'تفاصيل وملاحظات إضافية')}</span>
              </label>
              <div className="md:col-span-8">
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t('propose.notesPlaceholder', 'أي تفاصيل أو ملاحظات تود إضافتها للادارة...')}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white text-sm resize-none"
                />
              </div>
            </div>

          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            variant="gradient"
            size="lg"
            className="w-full py-4 text-base font-bold shadow-lg shadow-primary-600/20 rounded-2xl"
          >
            <span>{t('propose.submit', 'إرسال الاقتراح للإدارة')}</span>
            <Send size={18} className="mr-2" />
          </Button>
        </form>
      )}
    </div>
  );
}
