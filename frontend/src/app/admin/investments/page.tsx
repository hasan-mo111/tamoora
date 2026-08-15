'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, DollarSign, Users, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { API_BASE } from '@/config/api';

interface InvestmentPlan {
  id: string;
  type: 'daily' | 'monthly' | 'quarterly';
  capital: number;
  fee: number;
  profit: string;
  totalShares: number;
  availableShares: number;
  status: 'active' | 'paused' | 'completed';
  adminApproved?: boolean;
  description?: string;
  createdAt?: string;
  ideaOwnerId?: string;
  ideaOwnerEmail?: string;
  durationMonths?: number;
  investorContributionPercent?: number;
}

export default function AdminInvestmentsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [selectedPlanForDistribution, setSelectedPlanForDistribution] = useState<InvestmentPlan | null>(null);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [usersList, setUsersList] = useState<{ id: string; email: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsersList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch users for idea owner selection', err);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/investments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch plans');
        setPlans(getMockData());
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans(getMockData());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchUsers();
  }, []);

  const getMockData = (): InvestmentPlan[] => [
    { id: '1', type: 'daily', capital: 40, fee: 10, profit: '8% - 15%', totalShares: 100, availableShares: 45, status: 'active' },
    { id: '2', type: 'daily', capital: 130, fee: 32.5, profit: '15% - 25%', totalShares: 100, availableShares: 15, status: 'active' },
    { id: '3', type: 'monthly', capital: 250, fee: 62.5, profit: '18% - 28%', totalShares: 100, availableShares: 60, status: 'active' },
    { id: '4', type: 'monthly', capital: 10000, fee: 2500, profit: '40% - 60%', totalShares: 100, availableShares: 5, status: 'active' },
    { id: '5', type: 'quarterly', capital: 5000, fee: 1250, profit: '45% - 75%', totalShares: 100, availableShares: 20, status: 'paused' },
  ];

  const getTypeBadge = (type: InvestmentPlan['type']) => {
    const badges = {
      daily: { variant: 'primary' as const, label: 'تجزئة (أسبوعي)' },
      monthly: { variant: 'secondary' as const, label: 'خدمي' },
      quarterly: { variant: 'accent' as const, label: 'مشاريع تشغيلية' },
    };
    return <Badge variant={badges[type].variant} size="sm">{badges[type].label}</Badge>;
  };

  const getStatusBadge = (status: InvestmentPlan['status']) => {
    const badges = {
      active: { variant: 'success' as const, label: 'نشط' },
      paused: { variant: 'warning' as const, label: 'متوقف' },
      completed: { variant: 'secondary' as const, label: 'مكتمل' },
    };
    return <Badge variant={badges[status].variant} size="sm">{badges[status].label}</Badge>;
  };

  const handleApproveProject = async (id: string) => {
    if (!confirm('تأكيد الموافقة (OK) على هذا المشروع والتأذين بانطلاق حسابات الأرباح والعداد للمشتركين؟')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/investments/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('🎉 تم اعتماد المشروع بنجاح (OK) وبدأ حساب العداد للمشتركين!');
        fetchPlans();
      } else {
        alert('فشل اعتماد المشروع');
      }
    } catch (error) {
      console.error('Error approving project:', error);
      alert('حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  const handleDelete = async (plan: InvestmentPlan) => {
    const isRefundable = plan.type === 'quarterly' && plan.adminApproved === false;
    const confirmMessage = isRefundable
      ? 'هل أنت متأكد من إلغاء/حذف هذا المشروع قبل البدأ؟\nسيتم إعادة كامل الأموال والعمولة (125%) تلقائياً إلى أرصدة المشتركين.'
      : 'هل أنت متأكد من حذف هذه الصفقة/الخطة الاستثمارية؟';

    if (!confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/investments/${plan.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const resData = await response.json();
        alert('✅ ' + (resData.message || 'تم حذف الصفقة بنجاح'));
        fetchPlans();
      } else {
        alert('فشل الحذف');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleEdit = (plan: InvestmentPlan) => {
    setEditingPlan(plan);
    setShowAddModal(true);
  };

  const handleOpenDistributeProfit = (plan: InvestmentPlan) => {
    setSelectedPlanForDistribution(plan);
    setShowDistributeModal(true);
  };

  const activePlans = plans.filter(p => p.status === 'active').length;
  const totalAvailableShares = plans.reduce((sum, p) => sum + p.availableShares, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">خطط الاستثمار والحصص السهمية</h1>
          <p className="text-gray-600">إدارة الحصص السهمية، وتعديل مجالات الأرباح، وتأكيد توزيع الأرباح تلقائياً للمشتركين</p>
        </div>
        <Button onClick={() => { setEditingPlan(null); setShowAddModal(true); }}>
          <Plus size={18} className="ml-2" />
          إضافة حصة سهمية جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
              <p className="text-sm text-gray-600">إجمالي الحصص والخطط</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <DollarSign className="text-success" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activePlans}</p>
              <p className="text-sm text-gray-600">حصص سهمية نشطة</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
              <Users className="text-accent-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalAvailableShares}</p>
              <p className="text-sm text-gray-600">أسهم متاحة</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          return (
            <Card key={plan.id} className="p-6 hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                {getTypeBadge(plan.type)}
                {getStatusBadge(plan.status)}
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-gray-600 dark:text-gray-400">قيمة السهم / رأس المال:</span>
                  <span className="font-bold text-gray-900 dark:text-white">${plan.capital.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-gray-600 dark:text-gray-400">مجال الربح المتوقع:</span>
                  <span className="font-bold text-emerald-600">{plan.profit}</span>
                </div>
                {plan.declaredProfitPercentage && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                    <span className="font-semibold">نسبة الربح المعتمدة حالياً:</span>
                    <span className="font-bold">{plan.declaredProfitPercentage}%</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-gray-600 dark:text-gray-400">الأسهم المتاحة:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{plan.availableShares} / {plan.totalShares}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((plan.availableShares / plan.totalShares) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {Math.round((plan.availableShares / plan.totalShares) * 100)}% أسهم متبقية
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {plan.type === 'quarterly' && plan.adminApproved === false && (
                  <Button
                    onClick={() => handleApproveProject(plan.id)}
                    className="w-full justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold"
                    size="sm"
                  >
                    <CheckCircle2 size={16} className="ml-1.5" />
                    اعتماد المشروع (OK) وبدء العداد
                  </Button>
                )}

                <Button 
                  onClick={() => handleOpenDistributeProfit(plan)}
                  variant="gradient"
                  size="sm"
                  className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Sparkles size={16} className="ml-1.5" />
                  تأكيد وتوزيع الأرباح
                </Button>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit size={16} className="ml-2" />
                    تعديل الصفقة
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-error text-error hover:bg-error/10"
                    onClick={() => handleDelete(plan)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {plans.length === 0 && (
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد خطط استثمارية</h3>
          <p className="text-gray-600 mb-6">ابدأ بإضافة خطتك الاستثمارية الأولى</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={18} className="ml-2" />
            إضافة خطة جديدة
          </Button>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddEditModal
          plan={editingPlan}
          usersList={usersList}
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            try {
              const token = localStorage.getItem('accessToken');
              const url = editingPlan 
                ? `${API_BASE}/investments/${editingPlan.id}`
                : `${API_BASE}/investments`;
              
              const response = await fetch(url, {
                method: editingPlan ? 'PUT' : 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });

              if (response.ok) {
                await fetchPlans();
                setShowAddModal(false);
                alert(editingPlan ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
              } else {
                alert('حدث خطأ أثناء الحفظ');
              }
            } catch (error) {
              console.error('Error saving:', error);
              alert('حدث خطأ أثناء الحفظ');
            }
          }}
        />
      )}

      {/* Distribute Profit Modal */}
      {showDistributeModal && selectedPlanForDistribution && (
        <DistributeProfitModal
          plan={selectedPlanForDistribution}
          onClose={() => {
            setShowDistributeModal(false);
            setSelectedPlanForDistribution(null);
          }}
          onSuccess={() => {
            setShowDistributeModal(false);
            setSelectedPlanForDistribution(null);
            fetchPlans();
          }}
        />
      )}
    </div>
  );
}

// Distribute Profit Modal Component
function DistributeProfitModal({
  plan,
  onClose,
  onSuccess,
}: {
  plan: InvestmentPlan;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [profitPercentage, setProfitPercentage] = useState<string>('12.5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericProfit = parseFloat(profitPercentage) || 0;
  const estimatedProfitPerShare = (plan.capital * numericProfit) / 100;
  const subscribersCount = plan.totalShares - plan.availableShares;
  const estimatedTotalPayout = estimatedProfitPerShare * (subscribersCount > 0 ? subscribersCount : 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericProfit <= 0) {
      alert('يرجى إدخال نسبة ربح صالحة أكبر من 0');
      return;
    }

    if (!confirm(
      `تأكيد اعتماد نسبة ربح ${numericProfit}% لهذه الصفقة؟\n\n` +
      `• سيتم الصرف الفوري للمشتركين الذين أتموا فترتهم الزمنية.\n` +
      `• المشتركون الذين لم تنتهِ فتراتهم بعد، ستُصرف أرباحهم تلقائياً وتباعاً بمجرد حلول موعد استحقاق كل منهم.`
    )) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/investments/${plan.id}/distribute-profit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profitPercentage: numericProfit }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('🎉 ' + (data.message || 'تم تأكيد نسبة الربح وجدولتها للتوزيع تباعاً بحسب مدة كل مشترك!'));
        onSuccess();
      } else {
        const err = await response.json();
        alert('❌ ' + (err.message || 'حدث خطأ أثناء توزيع الأرباح.'));
      }
    } catch (error) {
      console.error('Error distributing profit:', error);
      alert('❌ تعذر الاتصال بالخادم لتوزيع الأرباح');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-lg w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-700 pb-3">
          <Sparkles size={26} />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              تحديد وتأكيد نسبة أرباح الصفقة
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              توزيع تباعي ذكي للمستثمرين وفق تاريخ اكتمال فترة كل مشترك
            </p>
          </div>
        </div>

        <div className="mb-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">نوع الصفقة:</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{plan.type === 'daily' ? 'صفقة تجزئة (أسبوعية)' : plan.type === 'monthly' ? 'صفقة خدمية (شهرية)' : 'مشروع تشغيلي'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">رأس مال السهم:</span>
            <span className="font-bold text-gray-900 dark:text-white">${plan.capital.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">مجال الربح المتوقع المعلن:</span>
            <span className="font-bold text-emerald-600">{plan.profit}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
              نسبة الربح المؤكدة للتوزيع (%)
            </label>
            <Input
              type="number"
              step="0.01"
              value={profitPercentage}
              onChange={(e) => setProfitPercentage(e.target.value)}
              placeholder="مثال: 12.5"
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              💡 <strong>نظام التوزيع الزمني التباعي:</strong> عند تأكيد النسبة، لن تصرف لجميع العملاء دفعة واحدة، بل يتم الصرف فوري فقط لمن حقق فترته الزمنية بالكامل، بينما يستلم البقية أرباحهم تلقائياً فور حلول موعد استحقاقهم وفق وقت اشتراكهم بالخطة.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
            <div className="flex justify-between font-medium">
              <span>ربح السهم الواحد بنسبة {numericProfit}%:</span>
              <span className="font-bold">${estimatedProfitPerShare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>تقديري لإجمالي المبالغ عند اكتمال استحقاق كافة المشتركين:</span>
              <span className="font-bold">${estimatedTotalPayout.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isSubmitting ? 'جاري التأكيد والجدولة...' : 'تأكيد النسبة وتوزيع الأرباح تباعاً'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Add/Edit Modal Component
function AddEditModal({ 
  plan, 
  usersList = [],
  onClose, 
  onSave 
}: { 
  plan: InvestmentPlan | null;
  usersList?: { id: string; email: string }[];
  onClose: () => void;
  onSave: (data: Partial<InvestmentPlan>) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    type: plan?.type || 'daily',
    capital: plan?.capital || 0,
    fee: plan?.fee || (plan?.capital ? plan.capital * 0.25 : 0),
    profit: plan?.profit || '',
    totalShares: plan?.totalShares || 100,
    availableShares: plan?.availableShares || 100,
    status: plan?.status || 'active',
    description: plan?.description || '',
    ideaOwnerId: plan?.ideaOwnerId || '',
    durationMonths: plan?.durationMonths || 12,
    investorContributionPercent: plan?.investorContributionPercent || 50,
  });

  const handleCapitalChange = (capitalVal: number) => {
    setFormData({
      ...formData,
      capital: capitalVal,
      fee: capitalVal * 0.25,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedOwner = usersList.find(u => u.id === formData.ideaOwnerId);
    onSave({
      ...formData,
      ideaOwnerEmail: selectedOwner?.email || '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {plan ? 'تعديل بيانات الصفقة' : 'إضافة صفقة استثمارية جديدة'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* النوع */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الصفقة / الخطة
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="نوع الخطة الاستثمارية"
                required
              >
                <option value="daily">أسبوعي (صفقات تجزئة أسبوعية)</option>
                <option value="monthly">شهري (مشاريع خدمية)</option>
                <option value="quarterly">مشاريع تشغيلية (تشاركية)</option>
              </select>
            </div>

            {/* الحالة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="حالة الخطة"
                required
              >
                <option value="active">نشط</option>
                <option value="paused">متوقف</option>
                <option value="completed">مكتمل</option>
              </select>
            </div>
          </div>

          {/* Operational Project Specific Inputs */}
          {formData.type === 'quarterly' && (
            <div className="p-4 bg-indigo-50 dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-slate-700 space-y-4">
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                <span>إعدادات المشروع التشغيلي التشاركي (سرية هوية صاحب الفكرة محميّة 🔒)</span>
                <span className="text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded">مخفي عن المستثمرين</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  صاحب الفكرة (اختر من بين المستخدمين):
                </label>
                <select
                  value={formData.ideaOwnerId}
                  onChange={(e) => setFormData({ ...formData, ideaOwnerId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900"
                >
                  <option value="">-- اختر صاحب الفكرة من قائمة المستخدمين --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email} (ID: {u.id.substring(0, 6)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    المدة الزمنية للمشروع (بالشهور):
                  </label>
                  <input
                    type="number"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900"
                    placeholder="مثال: 12"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    نسبة المساهمة المطلوبة من المستثمرين (%):
                  </label>
                  <input
                    type="number"
                    value={formData.investorContributionPercent}
                    onChange={(e) => setFormData({ ...formData, investorContributionPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900"
                    placeholder="مثال: 50"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="رأس المال ($)"
              type="number"
              value={formData.capital}
              onChange={(e) => handleCapitalChange(Number(e.target.value))}
              required
            />

            <Input
              label="عمولة المنصة 25% ($)"
              type="number"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
              required
            />

            <Input
              label="مجال الربح المتوقع"
              type="text"
              value={formData.profit}
              onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
              placeholder="مثال: 8% - 15% أو $10 - $25"
              required
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
            <strong>ملاحظة مالية:</strong> يتطلب الاشتراك توفر 125% من قيمة رأس المال في رصيد المشترك ($
            {(formData.capital * 1.25).toLocaleString()}) شاملة عمولة المنصة 25% (${formData.fee.toLocaleString()}).
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="إجمالي الأسهم"
              type="number"
              value={formData.totalShares}
              onChange={(e) => setFormData({ ...formData, totalShares: Number(e.target.value) })}
              required
            />

            <Input
              label="الأسهم المتاحة"
              type="number"
              value={formData.availableShares}
              onChange={(e) => setFormData({ ...formData, availableShares: Number(e.target.value) })}
              required
            />
          </div>

          {/* الوصف */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (اختياري)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="أضف وصفاً للصفقة الاستثمارية..."
              aria-label="وصف الخطة الاستثمارية"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              حفظ
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
