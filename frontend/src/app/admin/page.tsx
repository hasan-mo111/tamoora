'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  Activity, 
  UserCheck, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';
import { API_BASE } from '@/config/api';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalInvested: number;
  pendingWithdrawals: number;
  totalProfitDistributed: number;
  activePlans: number;
}

interface RecentActivity {
  id: string;
  type: 'user_register' | 'deposit_request' | 'withdraw_request' | 'profit_distribution' | 'plan_create';
  message: string;
  time: string;
  createdAt?: string;
  status: 'pending' | 'approved' | 'rejected';
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'الآن';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'الآن';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'الآن';
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  if (diffInSeconds < 172800) return 'أمس';
  return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t } = useThemeLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalInvested: 0,
    pendingWithdrawals: 0,
    totalProfitDistributed: 0,
    activePlans: 0,
  });

  const [activities, setActivities] = useState<RecentActivity[]>([]);

  const fetchAdminStats = useCallback(async () => {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('auth_token');
      
      if (!userStr || !token) return;
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      const response = await fetch(`${API_BASE}/users/admin-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.stats) {
          setStats(data.stats);
        }
        if (Array.isArray(data.activities)) {
          setActivities(
            data.activities.map((a: any) => ({
              ...a,
              time: formatRelativeTime(a.createdAt),
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAdminStats();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: t('dashboard.totalUsers', 'إجمالي المستخدمين'), value: stats.totalUsers, icon: Users, color: 'primary', sub: `${stats.activeUsers} نشط` },
    { title: t('dashboard.totalInvested', 'إجمالي المستثمر'), value: `$${stats.totalInvested.toLocaleString()}`, icon: Wallet, color: 'secondary', sub: 'منذ البداية' },
    { title: t('dashboard.pendingWithdrawals', 'سحوبات معلقة'), value: `$${stats.pendingWithdrawals.toLocaleString()}`, icon: AlertTriangle, color: 'warning', sub: 'تحتاج موافقة' },
    { title: t('dashboard.activePlans', 'خطط نشطة'), value: stats.activePlans, icon: TrendingUp, color: 'accent', sub: 'يومي + شهري + ربع سنوي' },
  ];

  const getStatusBadge = (status: RecentActivity['status']) => {
    const config = {
      pending: { variant: 'warning' as const, label: 'قيد المراجعة' },
      approved: { variant: 'success' as const, label: 'موافق عليه' },
      rejected: { variant: 'error' as const, label: 'مرفوض' },
    };
    return <Badge variant={config[status].variant} size="sm">{config[status].label}</Badge>;
  };

  const getTypeIcon = (type: RecentActivity['type']) => {
    const icons = {
      user_register: <Users className="text-primary-600 dark:text-primary-400" size={20} />,
      deposit_request: <DollarSign className="text-emerald-600 dark:text-emerald-400" size={20} />,
      withdraw_request: <AlertTriangle className="text-amber-600 dark:text-amber-400" size={20} />,
      profit_distribution: <CheckCircle className="text-primary-600 dark:text-primary-400" size={20} />,
      plan_create: <TrendingUp className="text-accent-600 dark:text-accent-400" size={20} />,
    };
    return icons[type] || <Activity size={20} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 transition-colors">
      <Container>
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {t('admin.title', 'لوحة تحكم الإدارة')}
              </h1>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                title="تحديث البيانات"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('admin.subtitle', 'مراقبة وإدارة جميع عمليات المنصة من مكان واحد')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/transactions">
              <Button size="md" variant="gradient">
                <Wallet size={18} className="ml-2" />
                مراجعة الطلبات
              </Button>
            </Link>
            <Link href="/admin/investments">
              <Button variant="outline" size="md">
                <TrendingUp size={18} className="ml-2" />
                إضافة خطة جديدة
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'primary' ? 'bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400' :
                  stat.color === 'secondary' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' :
                  stat.color === 'warning' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' :
                  'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">{stat.value}</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.sub}</p>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity size={20} className="text-primary-600 dark:text-primary-400" />
                آخر نشاطات المنصة
              </h2>
              <Link href="/admin/transactions">
                <Button variant="ghost" size="sm">عرض الكل</Button>
              </Link>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-800/70 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-colors border border-gray-100/80 dark:border-slate-700/50">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700">
                        {getTypeIcon(activity.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{activity.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
                لا توجد نشاطات مسجلة حديثاً
              </div>
            )}
          </Card>

          {/* Quick Admin Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <UserCheck size={20} className="text-primary-600 dark:text-primary-400" />
              إجراءات سريعة
            </h2>
            <div className="space-y-3">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-center">
                  <Users size={18} className="ml-2" />
                  إدارة المستخدمين
                </Button>
              </Link>
              <Link href="/admin/investments">
                <Button variant="outline" className="w-full justify-center">
                  <TrendingUp size={18} className="ml-2" />
                  خطط الاستثمار
                </Button>
              </Link>
              <Link href="/admin/transactions">
                <Button variant="outline" className="w-full justify-center">
                  <Wallet size={18} className="ml-2" />
                  الإيداعات والسحوبات
                </Button>
              </Link>
              <Link href="/admin/proposals">
                <Button variant="outline" className="w-full justify-center bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100">
                  <Lightbulb size={18} className="ml-2 text-amber-600" />
                  اقتراحات المشاريع
                </Button>
              </Link>
              
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="p-4 bg-gradient-to-br from-primary-50 to-white dark:from-slate-800 dark:to-slate-800/60 rounded-xl border border-primary-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">حالة النظام</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">جميع الأنظمة تعمل بشكل طبيعي</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">متصل بقاعدة البيانات وسيرفر Render</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
