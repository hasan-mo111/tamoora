'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flame, CheckCircle2, Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { API_BASE } from '@/config/api';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

interface DailyAttendanceCardProps {
  onCheckInCompleted?: () => void;
  className?: string;
}

interface CheckInStatus {
  hasCheckedInToday: boolean;
  streak: number;
  totalCheckIns: number;
  lastCheckInDate?: string;
  todayDate: string;
}

export default function DailyAttendanceCard({ onCheckInCompleted, className = '' }: DailyAttendanceCardProps) {
  const { lang } = useThemeLanguage();
  const isEn = lang === 'en';

  const [status, setStatus] = useState<CheckInStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${API_BASE}/users/check-in-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Error fetching check-in status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleCheckIn = async () => {
    if (isSubmitting || status?.hasCheckedInToday) return;
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${API_BASE}/users/check-in`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({
          hasCheckedInToday: true,
          streak: data.streak || (status?.streak || 0) + 1,
          totalCheckIns: data.totalCheckIns || (status?.totalCheckIns || 0) + 1,
          lastCheckInDate: data.todayDate,
          todayDate: data.todayDate,
        });
        setFeedbackMessage({
          type: 'success',
          text: isEn ? 'Daily attendance recorded successfully! 🎉' : 'تم تسجيل حضورك اليومي بنجاح! تم احتساب اليوم ضمن أرباح صفقاتك ✅',
        });
        if (onCheckInCompleted) {
          onCheckInCompleted();
        }
      } else {
        setFeedbackMessage({
          type: 'error',
          text: data.message || (isEn ? 'Failed to record attendance' : 'تعذر تسجيل الحضور'),
        });
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: isEn ? 'Connection error' : 'حدث خطأ في الاتصال بالخادم',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-5 animate-pulse bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 ${className}`}>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
      </Card>
    );
  }

  const hasCheckedIn = status?.hasCheckedInToday;
  const streak = status?.streak || 0;
  const totalCheckIns = status?.totalCheckIns || 0;

  return (
    <Card
      id="daily-attendance-card"
      className={`relative overflow-hidden transition-all duration-300 border ${
        hasCheckedIn
          ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/10 dark:from-emerald-950/40 dark:via-slate-900/50 dark:to-slate-900 border-emerald-500/30 dark:border-emerald-500/30 shadow-sm'
          : 'bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-slate-900/10 dark:from-amber-950/40 dark:via-slate-900/50 dark:to-slate-900 border-amber-500/40 dark:border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
      } ${className}`}
    >
      <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Main Info */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-xl flex items-center justify-center ${
                hasCheckedIn
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-bounce'
              }`}>
                {hasCheckedIn ? <CheckCircle2 className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEn ? 'Daily Attendance System' : 'نظام الحضور اليومي وتأكيد النشاط'}
              </h3>
            </div>

            {hasCheckedIn ? (
              <Badge variant="success" className="px-3 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                {isEn ? 'Checked in today' : 'تم الحضور اليوم'}
              </Badge>
            ) : (
              <Badge variant="warning" className="px-3 py-1 text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 animate-pulse">
                {isEn ? 'Action required today' : 'مطلوب تسجيل الحضور اليوم'}
              </Badge>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {hasCheckedIn ? (
              isEn
                ? 'Great job! Your attendance is verified for today. Today is actively counted towards your investment cycle and profit settlement.'
                : 'رائع! تم تسجيل حضورك وتأكيد نشاطك اليوم. يتم احتساب هذا اليوم تلقائياً ضمن دورة استثماراتك وموعد تسليم الأرباح.'
            ) : (
              isEn
                ? '⚠️ You must click the button daily to count each day toward your profit countdown. Missing check-in will extend the deal duration by an extra day!'
                : '⚠️ يجب الضغط على زر الحضور يومياً لاحتساب اليوم ضمن أرباح الصفقات. عدم تسجيل الحضور يضيف يوماً تأخيرياً لعداد استحقاق الأرباح.'
            )}
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{isEn ? 'Current Streak:' : 'أيام الحضور المتواصل:'}</span>
              <strong className="text-orange-600 dark:text-orange-400 font-bold text-sm">{streak} {isEn ? 'days' : 'يوم'}</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{isEn ? 'Total Attendance:' : 'إجمالي أيام الحضور:'}</span>
              <strong className="text-blue-600 dark:text-blue-400 font-bold text-sm">{totalCheckIns} {isEn ? 'days' : 'يوم'}</strong>
            </div>
          </div>
        </div>

        {/* Action Button & Feedback */}
        <div className="flex flex-col items-stretch sm:items-end justify-center min-w-[200px] gap-2">
          {hasCheckedIn ? (
            <div className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-sm font-bold w-full text-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{isEn ? 'Attendance Active' : 'حضورك معتمد اليوم'}</span>
            </div>
          ) : (
            <Button
              id="submit-daily-checkin-btn"
              onClick={handleCheckIn}
              disabled={isSubmitting}
              className="relative group overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all active:scale-95 text-base flex items-center justify-center gap-2.5 w-full"
            >
              <Sparkles className="w-5 h-5 animate-spin text-amber-200 group-hover:scale-110 transition-transform" />
              <span>
                {isSubmitting
                  ? (isEn ? 'Recording...' : 'جاري التسجيل...')
                  : (isEn ? 'Confirm Attendance Today' : 'تسجيل الحضور اليومي')}
              </span>
            </Button>
          )}

          {feedbackMessage && (
            <p className={`text-xs text-center font-medium ${
              feedbackMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {feedbackMessage.text}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
