'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

export interface CountryOption {
  code: string;
  nameAr: string;
  nameEn: string;
  dialCode: string;
  flag: string;
}

export function SyriaGreenFlag({ className = "w-6 h-4" }: { className?: string }) {
  return (
    <svg className={`inline-block rounded-xs overflow-hidden shadow-xs border border-gray-300/40 shrink-0 ${className}`} viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      {/* Top Stripe: Green */}
      <rect width="600" height="133.3" fill="#007A3D" />
      {/* Middle Stripe: White */}
      <rect y="133.3" width="600" height="133.3" fill="#FFFFFF" />
      {/* Bottom Stripe: Black */}
      <rect y="266.6" width="600" height="133.4" fill="#000000" />
      {/* Three Red Stars */}
      <g fill="#D21034">
        <polygon points="150,170 156,188 175,188 160,200 166,218 150,207 134,218 140,200 125,188 144,188" />
        <polygon points="300,170 306,188 325,188 310,200 316,218 300,207 284,218 290,200 275,188 294,188" />
        <polygon points="450,170 456,188 475,188 460,200 466,218 450,207 434,218 440,200 425,188 444,188" />
      </g>
    </svg>
  );
}

export const COUNTRIES: CountryOption[] = [
  { code: 'SY', nameAr: 'سوريا', nameEn: 'Syria', dialCode: '+963', flag: '🇸🇾' },
  { code: 'AE', nameAr: 'الإمارات', nameEn: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'OM', nameAr: 'عُمان', nameEn: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', dialCode: '+962', flag: '🇯🇴' },
  { code: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon', dialCode: '+961', flag: '🇱🇧' },
  { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', dialCode: '+964', flag: '🇮🇶' },
  { code: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine', dialCode: '+970', flag: '🇵🇸' },
  { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'SE', nameAr: 'السويد', nameEn: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NL', nameAr: 'هولندا', nameEn: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'GB', nameAr: 'المملكة المتحدة', nameEn: 'UK', dialCode: '+44', flag: '🇬🇧' },
  { code: 'US', nameAr: 'أمريكا / كندا', nameEn: 'US/CA', dialCode: '+1', flag: '🇺🇸' },
  { code: 'FR', nameAr: 'فرنسا', nameEn: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', nameAr: 'إيطاليا', nameEn: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', nameAr: 'إسبانيا', nameEn: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'CH', nameAr: 'سويسرا', nameEn: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', nameAr: 'النمسا', nameEn: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'BE', nameAr: 'بلجيكا', nameEn: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'NO', nameAr: 'النرويج', nameEn: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', nameAr: 'الدنمارك', nameEn: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', nameAr: 'فنلندا', nameEn: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', dialCode: '+213', flag: '🇩🇿' },
  { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', dialCode: '+212', flag: '🇲🇦' },
  { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', dialCode: '+216', flag: '🇹🇳' },
  { code: 'SD', nameAr: 'السودان', nameEn: 'Sudan', dialCode: '+249', flag: '🇸🇩' },
  { code: 'LY', nameAr: 'ليبيا', nameEn: 'Libya', dialCode: '+218', flag: '🇱🇾' },
  { code: 'YE', nameAr: 'اليمن', nameEn: 'Yemen', dialCode: '+967', flag: '🇾🇪' },
  { code: 'SO', nameAr: 'الصومال', nameEn: 'Somalia', dialCode: '+252', flag: '🇸🇴' },
  { code: 'MR', nameAr: 'موريتانيا', nameEn: 'Mauritania', dialCode: '+222', flag: '🇲🇷' },
  { code: 'RU', nameAr: 'روسيا', nameEn: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'CN', nameAr: 'الصين', nameEn: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'IN', nameAr: 'الهند', nameEn: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'JP', nameAr: 'اليابان', nameEn: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'AU', nameAr: 'أستراليا', nameEn: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'GR', nameAr: 'اليونان', nameEn: 'Greece', dialCode: '+30', flag: '🇬🇷' },
  { code: 'CY', nameAr: 'قبرص', nameEn: 'Cyprus', dialCode: '+357', flag: '🇨🇾' },
];

interface CountryModalSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: CountryOption;
  onSelect: (country: CountryOption) => void;
}

export default function CountryModalSelector({
  isOpen,
  onClose,
  selectedCountry,
  onSelect,
}: CountryModalSelectorProps) {
  const { lang, t } = useThemeLanguage();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = COUNTRIES.filter((c) => {
    const term = search.toLowerCase().trim();
    return (
      c.nameAr.toLowerCase().includes(term) ||
      c.nameEn.toLowerCase().includes(term) ||
      c.dialCode.includes(term) ||
      c.code.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-[#faf5f0] dark:bg-slate-900 border border-amber-200/60 dark:border-slate-700 w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-amber-200/40 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('country.selectTitle', 'اختر الدولة / Select Country')}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-4 py-3 border-b border-amber-200/30 dark:border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('country.searchPlaceholder', 'بحث عن دولة أو مفتاح اتصل...')}
              className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Countries List (matching user screenshot style) */}
        <div className="overflow-y-auto flex-1 divide-y divide-amber-100/60 dark:divide-slate-800/60 p-2">
          {filtered.map((country) => {
            const isSelected = selectedCountry.code === country.code;
            const displayName = lang === 'ar' ? country.nameAr : country.nameEn;

            return (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onSelect(country);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-150 text-start ${
                  isSelected
                    ? 'bg-amber-100/70 dark:bg-amber-950/40 font-bold text-amber-900 dark:text-amber-200'
                    : 'hover:bg-amber-50/80 dark:hover:bg-slate-800/60 text-gray-800 dark:text-gray-200'
                }`}
              >
                {/* Radio Circle */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-amber-700 dark:border-amber-400 bg-amber-700 dark:bg-amber-500'
                        : 'border-amber-800/40 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {country.code === 'SY' ? (
                    <SyriaGreenFlag className="w-6 h-4" />
                  ) : (
                    <span className="text-xl leading-none">{country.flag}</span>
                  )}
                  <span className="text-sm sm:text-base font-semibold">{displayName}</span>
                </div>

                {/* Dial code */}
                <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 font-mono dir-ltr">
                  {country.dialCode}
                </span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('country.noResults', 'لا توجد نتائج')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
