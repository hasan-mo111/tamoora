'use client';

import { TrendingUp, Sparkles } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

interface InvestmentCardProps {
  id: string;
  type: 'daily' | 'monthly' | 'quarterly';
  capital: number;
  fee: number;
  profit: string;
  sharesAvailable: number;
  totalShares: number;
  status: 'active' | 'paused' | 'completed';
  durationMonths?: number;
  investorContributionPercent?: number;
  onInvest: () => void;
}

export default function InvestmentCard({
  id,
  type,
  capital,
  fee,
  profit,
  sharesAvailable,
  totalShares,
  status,
  durationMonths,
  investorContributionPercent,
  onInvest,
}: InvestmentCardProps) {
  const { t } = useThemeLanguage();

  const typeLabels = {
    daily: t('investments.dailyTitle', 'حزمة مشاريع تجزئة (أسبوعية)'),
    monthly: t('investments.monthlyTitle', 'حزمة مشاريع خدمية'),
    quarterly: t('investments.quarterlyTitle', 'مشروع تشغيلي (تشاركي)'),
  };

  const typeAttributes = {
    daily: 'ذات ربح أسبوعي',
    monthly: 'ذات ربح شهري',
    quarterly: 'تشاركي تشغيلي',
  };

  const typeColors = {
    daily: 'primary',
    monthly: 'secondary',
    quarterly: 'warning',
  } as const;

  const progressPercentage = totalShares > 0 ? (sharesAvailable / totalShares) * 100 : 0;

  if (status !== 'active') {
    return null;
  }

  return (
    <div className="relative group bg-white dark:bg-slate-800/90 rounded-2xl shadow-md hover:shadow-xl p-6 border border-gray-100 dark:border-slate-700/80 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden">
      {/* Top Gradient Highlight Accent Bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-500 via-emerald-500 to-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 pt-1">
        <div className="flex flex-col gap-1.5 items-start">
          <Badge variant={typeColors[type]} size="md">
            {typeLabels[type]}
          </Badge>
          {typeAttributes[type] && (
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
              ⚡ {typeAttributes[type]}
            </span>
          )}
        </div>
        <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300">
          <TrendingUp className="text-white" size={22} />
        </div>
      </div>

      {/* Capital Breakdown */}
      <div className="mb-4 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">قيمة الصفقة الاستثمارية</span>
        <span className="text-base font-extrabold text-primary-600 dark:text-primary-400">${capital.toLocaleString()} <span className="text-xs font-normal text-gray-500">USD</span></span>
      </div>

      {/* Operational Project Confidentiality & Specs */}
      {type === 'quarterly' && (
        <div className="mb-4 p-3 bg-indigo-50/70 dark:bg-slate-900/80 rounded-xl border border-indigo-100 dark:border-slate-700 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-bold text-indigo-900 dark:text-indigo-300">
            <span>صاحب الفكرة:</span>
            <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              مستثمر معتمد (هوية محميّة 🔒)
            </span>
          </div>
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
            <span>المدة الزمنية للمشروع:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{durationMonths || 12} شهر</span>
          </div>
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
            <span>المساهمة المطلوبة معنا:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{investorContributionPercent || 50}% تمويل مستثمرين</span>
          </div>
        </div>
      )}

      {/* Profit Range Row */}
      <div className="my-4 py-3 border-y border-gray-100 dark:border-slate-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Sparkles size={14} className="text-emerald-500" />
            <span>{t('investments.expectedProfit', 'مجال الربح المتوقع')}</span>
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
            {profit.includes('%') || profit.includes('$') ? profit : `${profit}%`}
          </div>
        </div>
      </div>

      {/* Deal Availability Status / Progress */}
      {type === 'quarterly' ? (
        <div className="mb-6">
          <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
            <span>الصفقات المتاحة للاكتتاب</span>
            <span className="text-primary-600 dark:text-primary-400">{sharesAvailable} من {totalShares} صفقة</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden p-0.5">
            <div 
              className="bg-gradient-to-r from-primary-500 via-primary-600 to-emerald-500 h-1.5 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-6 p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <span>حالة الاكتتاب</span>
          <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            متاحة دائماً للاستثمار
          </span>
        </div>
      )}

      {/* Action Button */}
      <Button 
        onClick={onInvest}
        variant="gradient"
        className="w-full shadow-md hover:shadow-lg group-hover:scale-[1.01]"
        size="md"
      >
        <TrendingUp size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
        {t('investments.investNow', 'استثمر الآن')}
      </Button>
    </div>
  );
}

