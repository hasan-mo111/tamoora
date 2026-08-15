'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowUpLeft,
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Users
} from 'lucide-react';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { API_BASE } from '@/config/api';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';
import DailyAttendanceCard from '@/components/dashboard/DailyAttendanceCard';


// Types
interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'profit' | 'investment_purchase';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  method: string;
  createdAt: string;
}

interface InvestmentRequest {
  id: string;
  investmentId: string;
  userId: string;
  userEmail: string;
  numberOfShares?: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Investment {
  id: string;
  type: 'daily' | 'monthly' | 'quarterly';
  capital: number;
  fee: number;
  profit: string;
  totalShares: number;
  availableShares: number;
  status: 'active' | 'paused' | 'completed';
}

interface DashboardStats {
  totalBalance: number;
  totalInvested: number;
  totalProfit: number;
  activeInvestments: number;
  availableDeals: {
    daily: number;
    monthly: number;
    quarterly: number;
    total: number;
  };
  monthlyProfit: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { t, lang } = useThemeLanguage();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    totalInvested: 0,
    totalProfit: 0,
    activeInvestments: 0,
    availableDeals: { daily: 1, monthly: 1, quarterly: 1, total: 3 },
    monthlyProfit: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // جلب جميع البيانات من الـ APIs
  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    const pinVerified = localStorage.getItem('pinVerified');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    if (!pinVerified) {
      router.push('/auth/pin-verify');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role === 'admin') {
      router.push('/admin');
      return;
    }
    setUser(parsedUser);

    try {
      // استدعاء متوازي لـ 3 APIs لتحسين الأداء
      const [transactionsRes, requestsRes, investmentsRes] = await Promise.all([
        fetch(`${API_BASE}/transactions/my-transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/investment-requests/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/investments/available`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // معالجة الاستجابات
      const transactions: Transaction[] = transactionsRes.ok ? await transactionsRes.json() : [];
      const requests: InvestmentRequest[] = requestsRes.ok ? await requestsRes.json() : [];
      const investments: Investment[] = investmentsRes.ok ? await investmentsRes.json() : [];

      // 1. إجمالي الأرباح (من معاملات الربح المكتملة)
      const profitTransactions = transactions.filter(
        (t) => t.type === 'profit' && t.status === 'completed'
      );
      const totalProfit = profitTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

      // 2. الربح الشهري (معاملات الربح خلال آخر 30 يوم)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyProfit = profitTransactions
        .filter((t) => new Date(t.createdAt) >= thirtyDaysAgo)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // 3. الاستثمارات النشطة (الطلبات الموافَق عليها)
      const approvedRequests = requests.filter((r) => r.status === 'approved');
      const activeInvestments = approvedRequests.length;

      // 4. إجمالي المستثمر (حساب رأس المال من الطلبات الموافَق عليها)
      const totalInvested = approvedRequests.reduce((sum, req) => {
        const investment = investments.find((inv) => inv.id === req.investmentId);
        const capital = investment ? Number(investment.capital) : 0;
        const shares = req.numberOfShares || 1;
        return sum + capital * shares;
      }, 0);

      // 5. الصفقات والخيارات المتاحة للاكتتاب (متاحة دائماً للمستثمرين)
      const availableDeals = {
        daily: 0,
        monthly: 0,
        quarterly: 0,
        total: 0,
      };
      investments.forEach((inv) => {
        if (inv.status === 'active' || !inv.status) {
          if (inv.type in availableDeals) {
            availableDeals[inv.type] += 1;
            availableDeals.total += 1;
          }
        }
      });
      if (availableDeals.total === 0) {
        availableDeals.daily = 1;
        availableDeals.monthly = 1;
        availableDeals.quarterly = 1;
        availableDeals.total = 3;
      }

      // 6. آخر 5 معاملات (النشاط الأخير)
      const recent = transactions.slice(0, 5);

      // تحديث الـ State
      setStats({
        totalBalance: Number(parsedUser.balance || 0),
        totalInvested,
        totalProfit,
        activeInvestments,
        availableDeals,
        monthlyProfit,
      });
      setRecentTransactions(recent);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
      // استخدام الرصيد من الـ user كحد أدنى
      setStats((prev) => ({
        ...prev,
        totalBalance: Number(parsedUser.balance || 0),
      }));
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Skeleton Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Container>
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-32 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  // دالة مساعدة لعرض أيقونة ونوع المعاملة
  const getTransactionDisplay = (transaction: Transaction) => {
    const config = {
      deposit: {
        icon: <ArrowDownLeft className="text-success" size={20} />,
        label: 'إيداع',
        color: 'text-success',
        prefix: '+',
        bgColor: 'bg-success/10',
      },
      withdraw: {
        icon: <ArrowUpLeft className="text-error" size={20} />,
        label: 'سحب',
        color: 'text-error',
        prefix: '-',
        bgColor: 'bg-error/10',
      },
      profit: {
        icon: <TrendingUp className="text-primary-600" size={20} />,
        label: 'ربح',
        color: 'text-success',
        prefix: '+',
        bgColor: 'bg-primary-100',
      },
      investment_purchase: {
        icon: <PieChart className="text-accent-600" size={20} />,
        label: 'شراء أسهم',
        color: 'text-error',
        prefix: '-',
        bgColor: 'bg-accent-100',
      },
    };
    return config[transaction.type] || config.deposit;
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const config = {
      pending: { variant: 'warning' as const, label: 'قيد المراجعة', icon: Clock },
      completed: { variant: 'success' as const, label: 'مكتمل', icon: CheckCircle },
      rejected: { variant: 'error' as const, label: 'مرفوض', icon: XCircle },
    };
    const badge = config[status];
    return (
      <Badge variant={badge.variant} size="sm">
        <badge.icon size={12} className="inline ml-1" />
        {badge.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-SA');
  };

  // حساب نسبة التغيير (محاكاة)
  const getChangePercentage = () => {
    if (stats.totalProfit === 0) return { value: '0%', isPositive: true };
    // محاكاة نسبة إيجابية بناءً على الأرباح
    const percentage = Math.min(25, Math.max(1, stats.totalProfit / 100));
    return { value: `+${percentage.toFixed(1)}%`, isPositive: true };
  };

  const change = getChangePercentage();

  const statCards = [
    {
      title: t('dashboard.totalBalance', 'إجمالي الرصيد المتاح'),
      value: `$${formatCurrency(stats.totalBalance)}`,
      change: change.value,
      isPositive: change.isPositive,
      icon: Wallet,
      color: 'primary',
      highlight: true,
    },
    {
      title: t('dashboard.totalInvested', 'إجمالي الاستثمارات'),
      value: `$${formatCurrency(stats.totalInvested)}`,
      change: `${stats.activeInvestments} ${t('dashboard.investments', 'استثمار')}`,
      isPositive: true,
      icon: DollarSign,
      color: 'secondary',
    },
    {
      title: t('dashboard.totalProfit', 'إجمالي الأرباح'),
      value: `$${formatCurrency(stats.totalProfit)}`,
      change: `$${formatCurrency(stats.monthlyProfit)} ${t('dashboard.thisMonth', 'هذا الشهر')}`,
      isPositive: true,
      icon: TrendingUp,
      color: 'success',
    },
    {
      title: t('dashboard.activeInvestments', 'الاستثمارات النشطة'),
      value: stats.activeInvestments.toString(),
      change: t('dashboard.activeDeals', 'حصص سهمية نشطة'),
      isPositive: true,
      icon: PieChart,
      color: 'accent',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 text-slate-800 dark:text-slate-100 transition-colors">
      <Container>
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dashboard.welcome', 'مرحباً')}, {user?.firstName || user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-gray-600 dark:text-slate-300">{t('dashboard.overview', 'نظرة عامة على محفظتك وأدائك الاستثماري')}</p>
          {error && (
            <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Daily Attendance Card */}
        <div className="mb-8">
          <DailyAttendanceCard onCheckInCompleted={fetchDashboardData} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className={`p-6 ${stat.highlight ? 'ring-2 ring-primary-100 dark:ring-primary-900' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === 'primary'
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                      : stat.color === 'secondary'
                      ? 'bg-secondary-100 dark:bg-secondary-900/40 text-secondary-600 dark:text-secondary-400'
                      : stat.color === 'success'
                      ? 'bg-success/10 text-success'
                      : 'bg-accent-100 dark:bg-accent-900/40 text-accent-600 dark:text-accent-400'
                  }`}
                >
                  <stat.icon size={24} />
                </div>
                <Badge variant={stat.isPositive ? 'success' : 'error'} size="sm">
                  {stat.isPositive ? (
                    <ArrowUpRight size={14} className="inline mx-1" />
                  ) : (
                    <ArrowDownRight size={14} className="inline mx-1" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <div>
                <p className="text-gray-600 dark:text-slate-300 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity size={20} className="text-primary-600 dark:text-primary-400" />
                {t('dashboard.recentActivity', 'أحدث النشاطات والمعاملات')}
              </h2>
              <Link href="/dashboard/wallet">
                <Button variant="ghost" size="sm">
                  {t('common.viewAll', 'عرض الكل')}
                </Button>
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="text-gray-400" size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('wallet.noTransactions', 'لا توجد معاملات سابقة حتى الآن')}</h3>
                <p className="text-gray-600 dark:text-slate-300 text-sm mb-6">
                  {t('dashboard.overview', 'نظرة عامة على محفظتك وأدائك الاستثماري')}
                </p>
                <Link href="/dashboard/wallet">
                  <Button size="md">
                    <DollarSign size={18} className="mx-2" />
                    {t('wallet.depositNow', 'إيداع الآن')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const display = getTransactionDisplay(transaction);
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/60 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 ${display.bgColor} rounded-full flex items-center justify-center`}
                        >
                          {display.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{display.label}</p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-left flex items-center gap-3">
                        <div>
                          <p className={`font-bold ${display.color}`}>
                            {display.prefix}${formatCurrency(Number(transaction.amount))}
                          </p>
                          <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('dashboard.quickActions', 'إجراءات سريعة')}</h2>
            <div className="space-y-3">
              <Link href="/investments">
                <Button className="w-full justify-center" size="lg">
                  <TrendingUp size={20} className="mx-2" />
                  {t('dashboard.exploreInvestments', 'استكشاف الحصص والفرص')}
                </Button>
              </Link>
              <Link href="/dashboard/wallet">
                <Button variant="outline" className="w-full justify-center" size="lg">
                  <Wallet size={20} className="mx-2" />
                  {t('dashboard.manageWallet', 'إدارة المحفظة والرصيد')}
                </Button>
              </Link>
              <Link href="/dashboard/referrals">
                <Button variant="outline" className="w-full justify-center bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-slate-700 hover:border-primary-400" size="lg">
                  <Users size={20} className="mx-2" />
                  {lang === 'ar' ? 'نظام الإحالات والمسوقين' : 'Referrals & Marketing'}
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="ghost" className="w-full justify-center" size="lg">
                  <Shield size={20} className="mx-2" />
                  {t('dashboard.profile', 'الملف الشخصي والأمان')}
                </Button>
              </Link>
            </div>

            {/* Monthly Profit Card */}
            <div className="mt-6 p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/20">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-success" size={20} />
                <span className="text-gray-600 dark:text-slate-300 font-medium">{t('dashboard.monthlyProfit', 'الربح الشهري')}</span>
              </div>
              <p className="text-3xl font-bold text-success">
                ${formatCurrency(stats.monthlyProfit)}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('dashboard.thisMonth', 'هذا الشهر')}</p>
            </div>
          </Card>
        </div>

        {/* Available Deals & Options */}
        <Card className="mt-6 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('dashboard.availableDeals', 'الصفقات والخيارات المتاحة للاكتتاب')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                {lang === 'en'
                  ? 'All deal plans and options are always available for subscription'
                  : 'جميع باقات الصفقات والخطط متاحة دائماً للاكتتاب والمشاركة في الأرباح'}
              </p>
            </div>
            <Badge variant="primary" size="md" className="self-start sm:self-auto bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
              ✨ {t('dashboard.alwaysAvailable', 'خيارات متاحة دائماً')}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Weekly / Daily Deals */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 text-white p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                  <Clock size={22} className="text-white" />
                </div>
                <Badge variant="secondary" size="sm" className="bg-white/20 text-white border-none font-medium">
                  {lang === 'en' ? 'Weekly Returns' : 'عوائد أسبوعية'}
                </Badge>
              </div>
              <h3 className="text-lg font-bold mb-1">
                {lang === 'en' ? 'Retail Projects Package' : 'باقة مشاريع التجزئة (أسبوعية)'}
              </h3>
              <p className="text-primary-100 text-xs sm:text-sm leading-relaxed mb-3">
                {lang === 'en'
                  ? 'Available active options with periodic returns (Starting from $50)'
                  : 'خيارات صفقات نشطة بعوائد أسبوعية دورية (الحد الأدنى 50$)'}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1 rounded-lg">
                <span>✓ {lang === 'en' ? 'Active & Available' : 'صفقات متاحة دائماً'}</span>
              </div>
            </div>

            {/* Monthly Deals */}
            <div className="relative overflow-hidden bg-gradient-to-br from-secondary-600 to-secondary-700 text-white p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                  <Calendar size={22} className="text-white" />
                </div>
                <Badge variant="secondary" size="sm" className="bg-white/20 text-white border-none font-medium">
                  {lang === 'en' ? 'Monthly Returns' : 'عوائد شهرية'}
                </Badge>
              </div>
              <h3 className="text-lg font-bold mb-1">
                {lang === 'en' ? 'Service Projects Package' : 'باقة المشاريع الخدمية (شهرية)'}
              </h3>
              <p className="text-secondary-100 text-xs sm:text-sm leading-relaxed mb-3">
                {lang === 'en'
                  ? 'Regular monthly business return options (Starting from $500)'
                  : 'خيارات استثمارية بعوائد شهرية منتظمة (الحد الأدنى 500$)'}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1 rounded-lg">
                <span>✓ {lang === 'en' ? 'Active & Available' : 'صفقات متاحة دائماً'}</span>
              </div>
            </div>

            {/* Quarterly Deals */}
            <div className="relative overflow-hidden bg-gradient-to-br from-accent-600 to-accent-700 text-white p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                  <TrendingUp size={22} className="text-white" />
                </div>
                <Badge variant="secondary" size="sm" className="bg-white/20 text-white border-none font-medium">
                  {lang === 'en' ? 'Strategic / Quarterly' : 'ربع سنوي وتشغيلي'}
                </Badge>
              </div>
              <h3 className="text-lg font-bold mb-1">
                {lang === 'en' ? 'Operational Projects' : 'باقة المشاريع التشغيلية'}
              </h3>
              <p className="text-accent-100 text-xs sm:text-sm leading-relaxed mb-3">
                {lang === 'en'
                  ? 'Strategic partnership opportunities with high compounding returns'
                  : 'فرص تشاركية استراتيجية لنمو رأس المال والمشاريع'}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1 rounded-lg">
                <span>✓ {lang === 'en' ? 'Active & Available' : 'صفقات متاحة دائماً'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/investments">
              <Button variant="outline" size="lg" className="font-semibold shadow-sm">
                <TrendingUp size={18} className="mx-2" />
                {t('dashboard.exploreDeals', 'تصفح الصفقات والاشتراك')}
              </Button>
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}