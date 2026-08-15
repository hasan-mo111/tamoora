'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, Clock, Eye, ArrowUpRight, Sparkles, AlertCircle, CheckCircle2, Flame, AlertTriangle } from 'lucide-react';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DailyAttendanceCard from '@/components/dashboard/DailyAttendanceCard';
import { API_BASE } from '@/config/api';
import Link from 'next/link';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

interface SubscriptionTimer {
  id: string;
  investmentId: string;
  type: 'daily' | 'monthly' | 'quarterly';
  capital: number;
  fee: number;
  profit: string;
  numberOfShares: number;
  subscriptionDate: string;
  timerStartTime: string;
  endTime: string;
  adminApproved: boolean;
  baseDurationDays?: number;
  effectiveDurationDays?: number;
  missedDays?: number;
  attendedDays?: number;
  hasCheckedInToday?: boolean;
  isDelayPeriod: boolean;
  delayRemainingMs: number;
  isTimerRunning: boolean;
  timerRemainingMs: number;
  isReadyForProfit: boolean;
  isExitRequested?: boolean;
  exitRequestedAt?: string;
  exitReason?: string;
  isCapitalRefunded?: boolean;
  capitalRefundedAt?: string;
  fourMonthUnlockDate?: string;
  canExitNow?: boolean;
  daysUntilUnlock?: number;
}

export default function DashboardInvestmentsPage() {
  const { lang } = useThemeLanguage();
  const isEn = lang === 'en';

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [subscriptions, setSubscriptions] = useState<SubscriptionTimer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Exit Modal State
  const [exitModalSub, setExitModalSub] = useState<SubscriptionTimer | null>(null);
  const [exitReasonInput, setExitReasonInput] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${API_BASE}/investments/my-subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSubscriptions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmExit = async () => {
    if (!exitModalSub) return;
    setIsExiting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/investment-requests/${exitModalSub.id}/request-exit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: exitReasonInput }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.message}`);
        setExitModalSub(null);
        setExitReasonInput('');
        fetchSubscriptions();
      } else {
        alert(`❌ ${data.message || (isEn ? 'An error occurred while processing your request' : 'حدث خطأ أثناء تنفيذ الطلب')}`);
      }
    } catch (err) {
      alert(isEn ? 'Server connection error' : 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsExiting(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    const interval = setInterval(fetchSubscriptions, 10000); // refresh timer states every 10s
    return () => clearInterval(interval);
  }, []);

  const formatDurationMs = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return isEn ? `${days}d ${hours}h ${minutes}m` : `${days} يوم و ${hours} ساعة و ${minutes} دقيقة`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTypeBadge = (type: SubscriptionTimer['type']) => {
    const badges = {
      daily: { variant: 'primary' as const, label: isEn ? 'Weekly' : 'أسبوعي' },
      monthly: { variant: 'secondary' as const, label: isEn ? 'Monthly' : 'شهري' },
      quarterly: { variant: 'accent' as const, label: isEn ? 'Quarterly/Custom' : 'مشروع ربع سنوي/آخر' },
    };
    return <Badge variant={badges[type].variant} size="sm">{badges[type].label}</Badge>;
  };

  const totalInvestedCapital = subscriptions.reduce((sum, s) => sum + s.capital * s.numberOfShares, 0);
  const totalShares = subscriptions.reduce((sum, s) => sum + s.numberOfShares, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEn ? 'My Active Investments & Real-time Countdown' : 'استثماراتي الراهنة والعدّاد الحقيقي'}
          </h1>
          <p className="text-gray-600">
            {isEn
              ? 'Track active deals, 24-hour launch timer, and payout distributions'
              : 'متابعة صفقاتك النشطة، وتوقيتات الانطلاق الـ 24 ساعة ومواعيد جني الأرباح'}
          </p>
        </div>

        {/* Daily Attendance Card */}
        <div className="mb-8">
          <DailyAttendanceCard onCheckInCompleted={fetchSubscriptions} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <DollarSign className="text-primary-600" size={24} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">${totalInvestedCapital.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{isEn ? 'Invested Capital in Deals' : 'رأس المال المستثمر في الصفقات'}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Calendar className="text-accent-600" size={24} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{totalShares}</p>
            <p className="text-sm text-gray-600">{isEn ? 'Total Shares Owned' : 'إجمالي الأسهم التي تمتلكها'}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Clock className="text-secondary-600" size={24} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{subscriptions.length}</p>
            <p className="text-sm text-gray-600">{isEn ? 'Subscribed Deals' : 'عدد الصفقات المشترك بها'}</p>
          </Card>
        </div>

        {/* Investments List */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">{isEn ? 'Loading investments and timers...' : 'جاري تحميل استثماراتك والعدادات...'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => {
              const capitalTotal = sub.capital * sub.numberOfShares;

              return (
                <Card key={sub.id} className="p-6 hover:shadow-lg transition-all border border-slate-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left Section */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="text-white" size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">
                            {isEn ? `Deal #${sub.investmentId.substring(0, 8)}` : `صفقة #${sub.investmentId.substring(0, 8)}`}
                          </h3>
                          {getTypeBadge(sub.type)}
                          
                          {sub.isCapitalRefunded ? (
                            <Badge variant="success" size="sm">{isEn ? 'Withdrawn & 100% Capital Refunded' : 'تم الانسحاب وإعادة رأس المال 100%'}</Badge>
                          ) : sub.isExitRequested ? (
                            <Badge variant="warning" size="sm">{isEn ? 'Exit Requested (Profits Paused)' : 'طلب انسحاب مسبق (الأرباح متوقفة)'}</Badge>
                          ) : sub.canExitNow ? (
                            <Badge variant="primary" size="sm">{isEn ? '4-Month Lock Expired (Eligible for 100% Exit)' : 'مكتملة الـ 4 أشهر (يحق لك الانسحاب وسحب 100%)'}</Badge>
                          ) : sub.type === 'quarterly' && !sub.adminApproved ? (
                            <Badge variant="warning" size="sm">{isEn ? 'Awaiting Admin Approval (OK)' : 'بانتظار موافقة الإدارة (OK) لبدء العداد'}</Badge>
                          ) : sub.isDelayPeriod ? (
                            <Badge variant="secondary" size="sm">{isEn ? 'Countdown Preparation (24 hrs)' : 'انتظار انطلاق العداد (24 ساعة)'}</Badge>
                          ) : sub.isTimerRunning ? (
                            <Badge variant="success" size="sm">{isEn ? 'Timer Active' : 'العداد يعمل بانتظام'}</Badge>
                          ) : sub.isReadyForProfit ? (
                            <Badge variant="primary" size="sm">{isEn ? 'Completed - Awaiting Profit Approval' : 'مكتملة - بانتظار اعتماد الأرباح'}</Badge>
                          ) : (
                            <Badge variant="success" size="sm">{isEn ? 'Active' : 'نشط'}</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(sub.subscriptionDate).toLocaleDateString(isEn ? 'en-US' : 'ar-EG')}
                          </span>
                          <span>•</span>
                          <span>{sub.numberOfShares} {isEn ? 'Shares' : 'سهم'}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">{isEn ? 'Domain:' : 'المجال:'} {sub.profit}</span>
                          
                          {!sub.isCapitalRefunded && (
                            <>
                              <span>•</span>
                              <span className="text-xs text-indigo-600 font-medium">
                                {sub.canExitNow
                                  ? (isEn ? '4 months passed since subscription (Capital can be unlocked)' : 'انقضى 4 أشهر على الاشتراك (يمكنك تحرير رأس المال الآن)')
                                  : (isEn ? `${sub.daysUntilUnlock ?? 120} days left until 4-month mark (Full Exit)` : `متبقي ${sub.daysUntilUnlock ?? 120} يوم على انقضاء 4 أشهر (الانسحاب الكامل)`)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle Section - Timer status */}
                    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 flex-1 max-w-xl">
                      {sub.isCapitalRefunded ? (
                        <div className="text-emerald-700 text-xs flex items-center gap-2 font-semibold">
                          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                          <span>
                            {isEn
                              ? `Withdrawal request completed. Full capital ($${capitalTotal.toLocaleString()}) credited to your account.`
                              : `تم إكمال طلب الانسحاب وإعادة كامل رأس المال ($${capitalTotal.toLocaleString()}) إلى رصيدك بالحساب.`}
                          </span>
                        </div>
                      ) : sub.isExitRequested ? (
                        <div className="text-amber-800 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
                            <span>{isEn ? 'Exit request recorded - Profits paused on this deal' : 'طلب الانسحاب مسجل - توقفت الأرباح على هذه الصفقة'}</span>
                          </div>
                          <p className="text-[11px] text-gray-600">
                            {isEn ? `Capital ($${capitalTotal.toLocaleString()}) will unlock automatically on ` : `سيتم تحرير رأس المال ($${capitalTotal.toLocaleString()}) وإعادته تلقائياً إلى رصيدك بتاريخ `}
                            <strong>{sub.fourMonthUnlockDate ? new Date(sub.fourMonthUnlockDate).toLocaleDateString(isEn ? 'en-US' : 'ar-SA') : (isEn ? 'after 4 months' : 'بعد 4 أشهر')}</strong>.
                          </p>
                        </div>
                      ) : sub.type === 'quarterly' && !sub.adminApproved ? (
                        <div className="text-amber-700 text-sm flex items-center gap-2">
                          <Clock size={18} className="animate-pulse" />
                          <span>{isEn ? 'Project under review and approval by management. Timer will start upon approval (OK).' : 'المشروع قيد المراجعة والاعتماد من الإدارة. سينطلق العداد بعد الموافقة (OK).'}</span>
                        </div>
                      ) : sub.isDelayPeriod ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-amber-700 font-medium">
                            <span>{isEn ? '24-Hour Preparation Timer:' : 'عدّاد فترة التجهيز وانطلاق الصفقة (24 ساعة):'}</span>
                            <span className="font-bold">{formatDurationMs(sub.delayRemainingMs)}</span>
                          </div>
                          <div className="w-full bg-amber-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                          </div>
                          <p className="text-[11px] text-gray-500">{isEn ? 'Profit countdown begins right after initial 24 hours.' : 'سيبدأ العداد الرسمي احتساب فترة الأرباح فور انتهاء الـ 24 ساعة الأولى.'}</p>
                        </div>
                      ) : sub.isTimerRunning ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-emerald-700 font-medium">
                            <span>{isEn ? 'Time remaining until profit distribution:' : 'المتبقي على موعد استحقاق الأرباح:'}</span>
                            <span className="font-bold text-sm text-emerald-800">{formatDurationMs(sub.timerRemainingMs)}</span>
                          </div>
                          <div className="w-full bg-emerald-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }} />
                          </div>
                        </div>
                      ) : sub.isReadyForProfit ? (
                        <div className="text-emerald-700 text-sm flex items-center gap-2 font-semibold">
                          <Sparkles size={18} className="text-emerald-500" />
                          <span>{isEn ? 'Deal period completed! Profits will be credited once approved by management.' : 'اكتملت مدة الصفقة بنجاح! سيتم إيداع الأرباح فور اعتماد النسبة من الإدارة.'}</span>
                        </div>
                      ) : null}
                      {/* Attendance indicator for this deal */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span>{isEn ? 'Deal Attendance:' : 'حضور الصفقة:'}</span>
                          <strong className="text-slate-700 dark:text-slate-200">
                            {sub.attendedDays ?? 0} / {sub.effectiveDurationDays ?? (sub.type === 'monthly' ? 30 : sub.type === 'quarterly' ? 90 : 7)} {isEn ? 'days' : 'يوم'}
                          </strong>
                        </div>

                        {(sub.missedDays ?? 0) > 0 ? (
                          <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                            <AlertTriangle size={12} className="text-amber-600" />
                            <span>+{sub.missedDays} {isEn ? 'delay days (missed attendance)' : 'أيام تأخير لعدم الحضور'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            <span>{isEn ? 'Perfect Attendance (0 delay)' : 'حضور مكتمل (0 تأخير)'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Amounts & Exit Button */}
                    <div className="text-right flex flex-col items-end justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-500">{isEn ? 'Invested Capital' : 'رأس المال المستثمر'}</p>
                        <p className="text-lg font-bold text-gray-900">${capitalTotal.toLocaleString()}</p>
                      </div>

                      {!sub.isCapitalRefunded && !sub.isExitRequested && (
                        <Button
                          size="sm"
                          variant={sub.canExitNow ? 'primary' : 'outline'}
                          onClick={() => setExitModalSub(sub)}
                          className="mt-2 text-xs"
                        >
                          {sub.canExitNow ? (isEn ? 'Exit & 100% Refund' : 'انسحاب واسترداد 100%') : (isEn ? 'Request Early Exit' : 'طلب انسحاب مبكر')}
                        </Button>
                      )}
                      {sub.isExitRequested && !sub.isCapitalRefunded && (
                        <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          {isEn ? 'Profits Paused (4-Mo Lock)' : 'الأرباح متوقفة (انتظار 4 أشهر)'}
                        </span>
                      )}
                      {sub.isCapitalRefunded && (
                        <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {isEn ? 'Fully Refunded' : 'مسترد بالكامل'}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Exit Request Confirmation Modal */}
        {exitModalSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="text-amber-500" size={24} />
                  {isEn ? 'Confirm Exit Request' : 'تأكيد طلب الانسحاب من الصفقة'}
                </h3>
                <button
                  onClick={() => setExitModalSub(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              {exitModalSub.canExitNow ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-900 dark:text-emerald-200 space-y-2">
                  <p className="font-bold flex items-center gap-1 text-base">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                    {isEn ? '4+ months passed since subscription!' : 'انقضى أكثر من 4 أشهر على تاريخ اشتراكك!'}
                  </p>
                  <p className="text-xs leading-relaxed">
                    {isEn
                      ? `According to platform rules, you are entitled to withdraw 100% of capital and profits ($${(exitModalSub.capital * 1.25 * exitModalSub.numberOfShares).toLocaleString()}) immediately to your available wallet balance upon confirmation.`
                      : `وفقاً لنظام المنصة، يحق لك الآن الانسحاب وسحب كامل رأس المال والأرباح (100%). عند الضغط على تأكيد، سيتم تحرير رأس المال والأرباح ($${(exitModalSub.capital * 1.25 * exitModalSub.numberOfShares).toLocaleString()}) فوراً إلى رصيد حسابك المتاح للسحب.`}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-900 dark:text-amber-200 space-y-2">
                  <p className="font-bold flex items-center gap-1 text-base text-amber-800 dark:text-amber-300">
                    <AlertCircle size={20} className="text-amber-600" />
                    {isEn ? 'Important Notice on Exit Before 4 Months:' : 'تنبيه هام حول الانسحاب قبل مضي 4 أشهر:'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
                    <li>
                      <strong>{isEn ? 'Profits pause immediately' : 'تتوقف الأرباح فوراً'}</strong> {isEn ? 'upon sending the exit request.' : 'عن هذه الصفقة اعتباراً من لحظة إرسال طلب الانسحاب.'}
                    </li>
                    <li>
                      <strong>{isEn ? 'Capital is not refunded immediately' : 'لا يُعاد رأس المال فوراً'}</strong>; {isEn ? 'it will automatically unlock and return to your balance after 4 months on:' : 'وإنما سيتم إعادته وتحريره تلقائياً إلى رصيدك فور مضي 4 أشهر على تاريخ الاشتراك بتاريخ:'}{' '}
                      <strong className="text-amber-900 dark:text-amber-100 underline">
                        {exitModalSub.fourMonthUnlockDate
                          ? new Date(exitModalSub.fourMonthUnlockDate).toLocaleDateString(isEn ? 'en-US' : 'ar-SA')
                          : (isEn ? 'after 4 months' : 'بعد 4 أشهر')}
                      </strong>.
                    </li>
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Exit Reason or Notes (Optional):' : 'سبب أو ملاحظات الانسحاب (اختياري):'}
                </label>
                <textarea
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  rows={2}
                  placeholder={isEn ? 'Enter reason for exit request...' : 'أكتب سبب طلب الانسحاب إن وجد...'}
                  value={exitReasonInput}
                  onChange={(e) => setExitReasonInput(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  className="w-full"
                  variant="primary"
                  isLoading={isExiting}
                  onClick={handleConfirmExit}
                >
                  {isEn ? 'Confirm Exit Request' : 'تأكيد إرسال طلب الانسحاب'}
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setExitModalSub(null)}
                >
                  {isEn ? 'Cancel' : 'إلغاء'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && subscriptions.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{isEn ? 'No Active Investment Subscriptions' : 'لا توجد صفقات مشترَك بها'}</h3>
            <p className="text-gray-600 mb-6">{isEn ? 'You have not subscribed to any investment deals yet' : 'لم تقم بالاشتراك في أي صفقة استثمارية بعد'}</p>
            <Link href="/investments">
              <Button variant="gradient">{isEn ? 'Explore Available Deals' : 'تصفح الصفقات المتاحة والاشتراك'}</Button>
            </Link>
          </Card>
        )}
      </Container>
    </div>
  );
}