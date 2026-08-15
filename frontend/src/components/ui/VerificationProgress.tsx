'use client';
import { Mail, FileText, PenTool, CheckCircle } from 'lucide-react';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

interface VerificationProgressProps {
  emailVerified: boolean;
  identityApproved: boolean;
  contractSigned: boolean;
}

export default function VerificationProgress({
  emailVerified,
  identityApproved,
  contractSigned,
}: VerificationProgressProps) {
  const { lang } = useThemeLanguage();
  const isEn = lang === 'en';

  const steps = [
    { label: isEn ? 'Email' : 'البريد', done: emailVerified, icon: Mail },
    { label: isEn ? 'Identity' : 'الهوية', done: identityApproved, icon: FileText },
    { label: isEn ? 'Contract' : 'العقد', done: contractSigned, icon: PenTool },
  ];

  const completedCount = steps.filter(s => s.done).length;

  return (
    <div className="bg-gradient-to-l from-primary-50 to-white dark:from-slate-800 dark:to-slate-900 border border-primary-100 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
          {isEn ? 'Verification Level' : 'مستوى التحقق'}
        </h3>
        <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
          {completedCount} / {steps.length} {isEn ? 'Completed' : 'مكتمل'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  step.done
                    ? 'bg-success text-white shadow-md'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
                }`}
              >
                {step.done ? <CheckCircle size={20} /> : <step.icon size={18} />}
              </div>
              <span
                className={`text-xs font-medium ${
                  step.done ? 'text-success' : 'text-gray-500 dark:text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 rounded ${
                  step.done ? 'bg-success' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {completedCount === steps.length && (
        <div className="mt-4 pt-3 border-t border-primary-100 dark:border-slate-700 text-center">
          <p className="text-success text-sm font-bold flex items-center justify-center gap-1">
            <CheckCircle size={16} />
            {isEn ? 'Fully Verified Account ✓' : 'حساب موثّق بالكامل'}
          </p>
        </div>
      )}
    </div>
  );
}
