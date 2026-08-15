'use client';
import { getAuthToken, createGuestToken } from '@/utils/guestToken';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';
import { TrendingUp, ShoppingBag, Wrench, Package, Lightbulb, FileText, ShieldCheck, X } from 'lucide-react';
import Container from '@/components/layout/Container';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import InvestmentCard from '@/components/ui/InvestmentCard';
import SuggestProjectForm from '@/components/investments/SuggestProjectForm';
import { API_BASE } from '@/config/api';

type InvestmentType = 'daily' | 'monthly' | 'quarterly';
type ActiveTabType = InvestmentType | 'suggest';

interface Investment {
  id: string;
  type: InvestmentType;
  capital: number;
  fee: number;
  profit: string;
  sharesAvailable: number;
  totalShares: number;
  status: 'active' | 'paused' | 'completed';
  description?: string;
}

export default function InvestmentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useThemeLanguage();

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('daily');

  // Operational Project Contract Modal State
  const [contractModalInvestment, setContractModalInvestment] = useState<any | null>(null);
  const [signerFullName, setSignerFullName] = useState('');
  const [signatureAgreement, setSignatureAgreement] = useState(false);
  const [isSigningSubmitting, setIsSigningSubmitting] = useState(false);

  const fetchInvestments = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/investments/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const normalizedData = Array.isArray(data) ? data.map(item => ({
          ...item,
          capital: Number(item.capital),
          fee: Number(item.fee),
          totalShares: Number(item.totalShares),
          sharesAvailable: Number(item.availableShares),
        })) : [];
        setInvestments(normalizedData);
      } else {
        console.error('❌ Failed to fetch investments');
        setInvestments(getMockData());
      }
    } catch (error) {
      console.error('💥 Error fetching investments:', error);
      setInvestments(getMockData());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !getAuthToken()) {
      createGuestToken();
    }
    fetchInvestments();
  }, []);

  const getMockData = (): Investment[] => [
    { id: '1', type: 'daily', capital: 40, fee: 10, profit: '8% - 15%', totalShares: 100, sharesAvailable: 45, status: 'active' },
    { id: '2', type: 'daily', capital: 65, fee: 16.25, profit: '10% - 18%', totalShares: 100, sharesAvailable: 32, status: 'active' },
    { id: '3', type: 'daily', capital: 85, fee: 21.25, profit: '12% - 20%', totalShares: 100, sharesAvailable: 28, status: 'active' },
    { id: '4', type: 'daily', capital: 130, fee: 32.5, profit: '15% - 25%', totalShares: 100, sharesAvailable: 15, status: 'active' },
    { id: '5', type: 'monthly', capital: 250, fee: 62.5, profit: '18% - 28%', totalShares: 100, sharesAvailable: 60, status: 'active' },
    { id: '6', type: 'monthly', capital: 420, fee: 105, profit: '20% - 32%', totalShares: 100, sharesAvailable: 45, status: 'active' },
    { id: '7', type: 'monthly', capital: 585, fee: 146.25, profit: '22% - 35%', totalShares: 100, sharesAvailable: 38, status: 'active' },
    { id: '8', type: 'monthly', capital: 835, fee: 208.75, profit: '25% - 40%', totalShares: 100, sharesAvailable: 25, status: 'active' },
    { id: '9', type: 'monthly', capital: 1250, fee: 312.5, profit: '28% - 42%', totalShares: 100, sharesAvailable: 20, status: 'active' },
    { id: '10', type: 'monthly', capital: 2500, fee: 625, profit: '30% - 45%', totalShares: 100, sharesAvailable: 15, status: 'active' },
    { id: '11', type: 'monthly', capital: 5000, fee: 1250, profit: '35% - 50%', totalShares: 100, sharesAvailable: 10, status: 'active' },
    { id: '12', type: 'monthly', capital: 10000, fee: 2500, profit: '40% - 60%', totalShares: 100, sharesAvailable: 5, status: 'active' },
    { id: '13', type: 'quarterly', capital: 500, fee: 125, profit: '30% - 50%', totalShares: 100, sharesAvailable: 50, status: 'active' },
    { id: '14', type: 'quarterly', capital: 1000, fee: 250, profit: '35% - 55%', totalShares: 100, sharesAvailable: 40, status: 'active' },
    { id: '15', type: 'quarterly', capital: 2500, fee: 625, profit: '40% - 65%', totalShares: 100, sharesAvailable: 30, status: 'active' },
    { id: '16', type: 'quarterly', capital: 5000, fee: 1250, profit: '45% - 75%', totalShares: 100, sharesAvailable: 20, status: 'active' },
  ];

  const filteredInvestments = investments.filter(inv => 
    inv.type === activeTab && inv.status === 'active'
  );

  const tabs = [
    { id: 'daily' as ActiveTabType, label: t('investments.tabDaily', 'حزمة مشاريع تجزئة (أسبوعية) 🛒'), icon: ShoppingBag, title: t('investments.dailyTitle', 'حزمة مشاريع تجزئة (أسبوعية)'), description: t('investments.dailyDesc', 'مشاريع تجزئة ذات ربح أسبوعي متكرر') },
    { id: 'monthly' as ActiveTabType, label: t('investments.tabMonthly', 'حزمة مشاريع خدمية 🛠️'), icon: Wrench, title: t('investments.monthlyTitle', 'حزمة مشاريع خدمية (ذات ربح شهري)'), description: t('investments.monthlyDesc', 'مشاريع خدمات واستثمار ذات ربح شهري منتظم') },
    { id: 'quarterly' as ActiveTabType, label: t('investments.tabQuarterly', 'مشاريع تشغيلية 📦'), icon: Package, title: t('investments.quarterlyTitle', 'مشاريع تشغيلية'), description: t('investments.quarterlyDesc', 'مشاريع وفرص تشغيلية تشاركية متنوعة') },
    { id: 'suggest' as ActiveTabType, label: t('investments.tabSuggest', 'اقتراح مشاريع 💡'), icon: Lightbulb, title: t('investments.suggestTitle', 'اقتراح مشروع استثماري'), description: t('investments.suggestDesc', 'اقترح فكرة مشروعك الاستثماري ويرسل مباشرة للإدارة لتقييمها') },
  ];

  const handleInvest = async (investmentId: string) => {
    if (!isAuthenticated) {
      alert('يجب تسجيل الدخول أولاً للاستثمار');
      router.push('/auth/login');
      return;
    }

    const selectedInvestment = investments.find(inv => inv.id === investmentId);
    const capital = selectedInvestment?.capital || 0;

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const currentBalance = Number(user.balance || 0);

    // If insufficient balance -> Auto redirect to deposit page (/dashboard/wallet)
    if (currentBalance < capital) {
      alert(
        `⚠️ رصيدك المتاح ($${currentBalance.toLocaleString()}) غير كافٍ لشراء هذه الصفقة ($${capital.toLocaleString()}).\n\n` +
        `جاري تحويلك تلقائياً إلى صفحة الإيداع...`
      );
      router.push('/dashboard/wallet');
      return;
    }

    // للمشاريع التشغيلية: فتح نافذة توقيع العقد الإلكتروني أولاً
    if (selectedInvestment?.type === 'quarterly') {
      setSignerFullName(user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '');
      setContractModalInvestment(selectedInvestment);
      return;
    }

    if (!confirm(
      `تأكيد الاشتراك في الصفقة الاستثمارية:\n` +
      `• قيمة الصفقة: $${capital.toLocaleString()}\n\n` +
      `هل ترغب بالمتابعة؟`
    )) {
      return;
    }

    await executeSubscription(investmentId, 1);
  };

  const executeSubscription = async (investmentId: string, shares: number = 1, contractSignature?: string, signerName?: string) => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE}/investments/${investmentId}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shares,
          contractSignature,
          contractSignerName: signerName,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('🎉 ' + (data.message || 'تم الاشتراك في الصفقة بنجاح!'));
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        if (data.newBalance !== undefined) {
          user.balance = data.newBalance;
          localStorage.setItem('user', JSON.stringify(user));
        }
        setContractModalInvestment(null);
        fetchInvestments();
      } else {
        const err = await response.json();
        alert('❌ ' + (err.message || 'حدث خطأ أثناء إتمام عملية الاشتراك'));
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('❌ حدث خطأ في الاتصال بالخادم');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{t('btn.loading', 'جاري التحميل...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <Container className="relative z-10 text-center">
          <Badge variant="secondary" className="bg-white/20 text-white border border-white/30 mb-6 backdrop-blur-md">
            {t('investments.badge', '💼 فرص استثمارية متنوعة')}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            {t('investments.title', 'خطط الأنشطة التجارية التشاركية')}
          </h1>
          <p className="text-base sm:text-lg text-primary-100 max-w-2xl mx-auto font-medium mb-8">
            {t('investments.subtitle', 'اختر خطة النشاط التجاري التشاركي المناسب وابدأ بتنمية أرباحك مع طامورة')}
          </p>

          {/* Quick Action Button for Suggesting Project */}
          <button
            onClick={() => setActiveTab('suggest')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold text-sm shadow-lg shadow-amber-400/20 transition-transform duration-200 hover:scale-105"
          >
            <Lightbulb size={18} className="text-amber-900" />
            <span>هل لديك فكرة استثمارية؟ اقترح مشروعك الآن</span>
          </button>
        </Container>
      </section>

      {/* Tabs Section */}
      <section className="py-12">
        <Container>
          {/* Tab Buttons */}
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-4 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300
                  ${activeTab === tab.id 
                    ? tab.id === 'suggest'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/30 scale-105' 
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-slate-700/80 border border-gray-100 dark:border-slate-700'
                  }
                `}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab View: Suggest Form vs Investment Cards */}
          {activeTab === 'suggest' ? (
            <SuggestProjectForm />
          ) : (
            <>
              {/* Active Tab Description */}
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                  {tabs.find(t => t.id === activeTab)?.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  {tabs.find(t => t.id === activeTab)?.description}
                </p>
                <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-emerald-500 mx-auto mt-4 rounded-full"></div>
              </div>

              {/* Investment Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredInvestments.map((investment: any) => (
                  <InvestmentCard
                    key={investment.id}
                    id={investment.id}
                    type={investment.type}
                    capital={investment.capital}
                    fee={investment.fee}
                    profit={investment.profit}
                    sharesAvailable={investment.sharesAvailable}
                    totalShares={investment.totalShares}
                    status={investment.status}
                    durationMonths={investment.durationMonths}
                    investorContributionPercent={investment.investorContributionPercent}
                    onInvest={() => handleInvest(investment.id)}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredInvestments.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-slate-700/60 p-8 max-w-lg mx-auto shadow-sm">
                  <div className="w-20 h-20 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <TrendingUp size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">لا توجد استثمارات متاحة حالياً</h3>
                  <p className="text-gray-500 dark:text-gray-400">يرجى التحقق لاحقاً أو اختيار نوع آخر من الاستثمارات</p>
                </div>
              )}
            </>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-white dark:bg-slate-800 py-16 border-t border-gray-100 dark:border-slate-700/80 transition-colors">
        <Container className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">هل لديك فكرة مشروع خاص؟</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            يمكنك دائماً تقديم اقتراح مشروع استثماري جديد وسيقوم فريق الإدارة بدراستها وتجربة جدواها الاقتصادية.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="gradient" onClick={() => setActiveTab('suggest')}>
              <Lightbulb size={20} className="ml-2" />
              اقترح مشروعك الان
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/about')}>
              تعرف على آلية الاستثمار
            </Button>
          </div>
        </Container>
      </section>

      {/* 📜 نافذة توقيع العقد الإلكتروني للمشاريع التشغيلية */}
      {contractModalInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    اتفاقية وعقد المشاركة الاستثمارية الإلكتروني
                  </h3>
                  <p className="text-xs text-gray-500">
                    صفقة تشغيلية #{contractModalInvestment.id.substring(0, 8)} • منصة طامورة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContractModalInvestment(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contract Body (Scrollable) */}
            <div className="my-4 overflow-y-auto pr-2 space-y-4 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center font-bold text-gray-900 dark:text-white border-b pb-2 border-slate-200 dark:border-slate-700">
                  <span>قيمة المساهمة الاستثمارية:</span>
                  <span className="text-primary-600 text-sm font-extrabold">${contractModalInvestment.capital.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>مدة المشروع التشغيلي:</span>
                  <span className="font-semibold">{contractModalInvestment.durationMonths || 12} شهر</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>العائد والربح التقديري:</span>
                  <span className="font-semibold text-emerald-600">{contractModalInvestment.profit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>حالة الهوية للطرف المشارك:</span>
                  <span className="text-indigo-600 font-semibold">مستثمر معتمد (سرية تامة ومحمية)</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-slate-900/40 rounded-xl border border-gray-200 dark:border-slate-700/80 space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">البنود والشروط القانونية:</h4>
                <p>
                  1. يقر الطرف الثاني (المستثمر) باكتتابه في هذه الحصة من المشروع التشغيلي التشاركي بقيمة ${contractModalInvestment.capital.toLocaleString()} USD تخصم مباشرة من رصيد محفظته في طامورة.
                </p>
                <p>
                  2. تلتزم منصة طامورة بإدارة المشروع وتوزيع الأرباح المستحقة وفق تقارير الأداء الدورية المعلنة من الإدارة.
                </p>
                <p>
                  3. يعتبر هذا التوقيع الإلكتروني بمثابة إقرار رسمي وموافقة ملزمة على شروط وسياسات الاستثمار المتبعة في منصة طامورة.
                </p>
              </div>

              {/* Signer input */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                    الاسم الكامل للموقع (المستثمر) *
                  </label>
                  <input
                    type="text"
                    value={signerFullName}
                    onChange={(e) => setSignerFullName(e.target.value)}
                    placeholder="اكتب اسمك الكامل الثلاثي"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={signatureAgreement}
                    onChange={(e) => setSignatureAgreement(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    أوافق وأقر بالتوقيع الإلكتروني على بنود هذا العقد والمساهمة الاستثمارية بمبلغ ${contractModalInvestment.capital.toLocaleString()} USD.
                  </span>
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                type="button"
                onClick={() => setContractModalInvestment(null)}
              >
                إلغاء
              </Button>
              <Button
                variant="primary"
                type="button"
                isLoading={isSigningSubmitting}
                disabled={!signatureAgreement || !signerFullName.trim()}
                onClick={async () => {
                  if (!signerFullName.trim()) {
                    alert('يرجى كتابة اسمك الكامل للتوقيع');
                    return;
                  }
                  setIsSigningSubmitting(true);
                  await executeSubscription(
                    contractModalInvestment.id,
                    1,
                    `SIG-${Date.now()}-${signerFullName.trim()}`,
                    signerFullName.trim()
                  );
                  setIsSigningSubmitting(false);
                }}
              >
                <ShieldCheck size={18} className="ml-1.5" />
                توقيع العقد وإتمام الاستثمار
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


