'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, DollarSign, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle, ExternalLink
} from 'lucide-react';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import ReceiptModal, { ReceiptData } from '@/components/ui/ReceiptModal';
import { API_BASE } from '@/config/api';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

// Enums
enum NetworkType {
  TRC20 = 'TRC20',
  ERC20 = 'ERC20',
  BEP20 = 'BEP20',
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'profit';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  method: string;
  network?: string;
  txHash?: string;
}

interface WithdrawalEligibility {
  balance: number;
  totalProfitEarned: number;
  netProfit80Percent: number;
  totalWithdrawn: number;
  netProfitWithdrawableRemaining: number;
  hasMaturedSubscription: boolean;
  maxWithdrawable: number;
}

export default function WalletPage() {
  const { user, updateUser } = useAuth();
  const { t, lang } = useThemeLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');
  
  const isEn = lang === 'en';
  
  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [withdrawNetwork, setWithdrawNetwork] = useState<NetworkType>(NetworkType.TRC20);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  // Deposit state
  const [depositType, setDepositType] = useState<'oxpay' | 'cash'>('oxpay');
  const [depositAmount, setDepositAmount] = useState('');
  const [cashNotes, setCashNotes] = useState('');
  const [isSubmittingCash, setIsSubmittingCash] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(NetworkType.TRC20);
  const [txHash, setTxHash] = useState('');
  const [currentTransactionId, setCurrentTransactionId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // OXPAY State
  const [oxpayAmount, setOxpayAmount] = useState('');
  const [isCreatingOxpay, setIsCreatingOxpay] = useState(false);
  const [oxpayInvoice, setOxpayInvoice] = useState<{
    invoiceId: string;
    orderId: string;
    amount: number;
    currency: string;
    network?: string;
    payUrl: string;
    qrCodeUrl?: string;
    status: string;
    expiresAt: string;
  } | null>(null);
  const [isCheckingOxpay, setIsCheckingOxpay] = useState(false);
  
  const balance = Number(user?.balance || 0);
  const [eligibility, setEligibility] = useState<WithdrawalEligibility | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchEligibility();
  }, [activeTab]);

  const fetchEligibility = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/transactions/withdrawal-eligibility`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEligibility(data);
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/transactions/my-transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ إنشاء طلب إيداع كاش (نقدي)
  const handleCreateCashDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) < 1) {
      alert(isEn ? 'Minimum cash deposit is $1' : 'الحد الأدنى للإيداع النقدي هو $1');
      return;
    }

    setIsSubmittingCash(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/transactions/cash-deposit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(depositAmount),
          notes: cashNotes,
        }),
      });

      if (response.ok) {
        alert(isEn ? 'Cash deposit request submitted successfully! Balance will be credited upon admin approval.' : '✅ تم إرسال طلب الإيداع النقدي بنجاح! سيتم إضافة المبلغ لرصيدك فور موافقة الإدارة.');
        setDepositAmount('');
        setCashNotes('');
        setActiveTab('overview');
        fetchTransactions();
      } else {
        const err = await response.json();
        alert(err.message || (isEn ? 'Error submitting cash deposit' : 'حدث خطأ أثناء إرسال طلب الإيداع النقدي'));
      }
    } catch (error) {
      console.error('Error creating cash deposit:', error);
      alert(isEn ? 'Connection error' : 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmittingCash(false);
    }
  };

  // ✅ إنشاء فاتورة إيداع عبر OxaPay (دون الحاجة لاختيار الشبكة حيث يختارها العميل داخل بوابة OxaPay)
  const handleCreateOxpayDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(oxpayAmount);
    if (!amount || amount < 1) {
      alert(isEn ? 'Minimum deposit amount is $1' : 'الحد الأدنى للإيداع هو $1');
      return;
    }

    setIsCreatingOxpay(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/transactions/oxpay/create-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'USD',
        }),
      });

      const data = await response.json();
      if (response.ok && data.invoice) {
        setOxpayInvoice({
          invoiceId: data.invoice.invoiceId,
          orderId: data.transaction?.id || data.invoice.orderId,
          amount: data.invoice.amount,
          currency: data.invoice.currency,
          network: data.invoice.network || 'OxaPay',
          payUrl: data.invoice.payUrl,
          qrCodeUrl: data.invoice.qrCodeUrl,
          status: data.invoice.status || 'PENDING',
          expiresAt: data.invoice.expiresAt,
        });
        fetchTransactions();
      } else {
        alert(data.message || (isEn ? 'Failed to create OxaPay invoice' : 'تعذر إنشاء فاتورة OxaPay'));
      }
    } catch (error) {
      console.error('Error creating OxaPay invoice:', error);
      alert(isEn ? 'Connection error' : 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsCreatingOxpay(false);
    }
  };

  // ✅ إلغاء الفاتورة وتحديث حالتها إلى مرفوض فوراً بدلاً من البقاء قيد المراجعة
  const handleCancelOxpayInvoice = async () => {
    if (oxpayInvoice?.orderId) {
      try {
        const token = localStorage.getItem('accessToken');
        await fetch(`${API_BASE}/transactions/${oxpayInvoice.orderId}/cancel-deposit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: 'تم إلغاء الفاتورة من قبل المستخدم' }),
        });
      } catch (err) {
        console.error('Error canceling invoice:', err);
      }
    }
    setOxpayInvoice(null);
    setOxpayAmount('');
    fetchTransactions();
  };

  // ✅ فحص حالة دفع فاتورة OxaPay
  const handleCheckOxpayStatus = async () => {
    if (!oxpayInvoice) return;
    setIsCheckingOxpay(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/transactions/oxpay/status/${oxpayInvoice.orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'completed') {
          alert(isEn ? 'Payment confirmed via OxaPay! Funds added to your wallet.' : '⚡ تم تأكيد استلام الدفعة عبر OxaPay بنجاح! تم إضافة المبلغ إلى محفظتك.');
          const added = oxpayInvoice.amount;
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = { ...userData, balance: (Number(userData.balance) || 0) + added };
          updateUser(updatedUser);
          setOxpayInvoice(null);
          setOxpayAmount('');
          setActiveTab('overview');
          fetchTransactions();
        } else {
          alert(isEn ? 'Payment status: Pending. If already paid, please allow a few moments.' : 'حالة الدفعة: قيد المعالجة (بانتظار التأكيد). يرجى الانتظار ثوانٍ قليلة إذا قمت بالتحويل.');
        }
      }
    } catch (error) {
      console.error('Error checking OxaPay status:', error);
    } finally {
      setIsCheckingOxpay(false);
    }
  };

  // ✅ التحقق التلقائي المباشر من المعاملة عبر TxHash
  const handleVerifyDeposit = async () => {
    if (!txHash || txHash.trim().length < 5) {
      alert(isEn ? 'Please enter a valid TxHash' : 'يرجى إدخال TxHash صحيح المكون من حروف وأرقام');
      return;
    }

    setIsVerifying(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/transactions/verify-deposit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: currentTransactionId,
          txHash: txHash.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(isEn ? '⚡ Deposit automatically verified via TxHash and credited instantly!' : '⚡ تم تأكيد واعتماد الإيداع تلقائياً عبر TxHash بنجاح! تم إضافة المبلغ لرصيدك فوراً.');
        const addedAmount = Number(depositAmount) || Number(oxpayAmount) || (data.transaction?.amount ? Number(data.transaction.amount) : 0);
        setDepositAmount('');
        setOxpayAmount('');
        setTxHash('');
        setCurrentTransactionId('');
        setOxpayInvoice(null);
        setActiveTab('overview');
        fetchTransactions();
        
        // تحديث الرصيد من رد الخادم الموثق
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const newBal = data.userBalance !== undefined ? Number(data.userBalance) : (Number(userData.balance) || 0) + addedAmount;
        const updatedUser = { ...userData, balance: newBal };
        updateUser(updatedUser);
      } else {
        const err = await response.json();
        alert(err.message || (isEn ? 'Failed to verify transaction TxHash' : 'فشل التحقق من رمز المعاملة'));
      }
    } catch (error) {
      console.error('Error verifying deposit:', error);
      alert(isEn ? 'Connection error' : 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || !walletAddress) return;

    setIsWithdrawing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/transactions/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          walletAddress,
          network: withdrawNetwork,
          method: 'OXPAY (USDT)',
        }),
      });

      if (response.ok) {
        alert(isEn ? '✅ Withdrawal request via OXPAY submitted successfully! Management will review and process it.' : '✅ تم إرسال طلب السحب عبر OXPAY بنجاح! سيتم مراجعته وتحويله من الإدارة.');
        setWithdrawAmount('');
        setWalletAddress('');
        setActiveTab('overview');
        fetchTransactions();
        fetchEligibility();
      } else {
        const err = await response.json();
        alert(err.message || (isEn ? 'Error submitting withdrawal request' : 'حدث خطأ أثناء الطلب'));
      }
    } catch (error) {
      alert(isEn ? 'Connection error' : 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const badges = {
      pending: { variant: 'warning' as const, label: isEn ? 'Under Review' : 'قيد المراجعة', icon: Clock },
      completed: { variant: 'success' as const, label: isEn ? 'Completed' : 'مكتمل', icon: CheckCircle },
      rejected: { variant: 'error' as const, label: isEn ? 'Rejected' : 'مرفوض', icon: XCircle },
    };
    const badge = badges[status];
    return (
      <Badge variant={badge.variant} size="sm">
        <badge.icon size={14} className="inline ml-1" />
        {badge.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="text-success" size={20} />;
      case 'withdraw': return <ArrowUpRight className="text-error" size={20} />;
      case 'profit': return <TrendingUp className="text-primary-600" size={20} />;
    }
  };

  const resetDeposit = () => {
    setDepositAmount('');
    setOxpayAmount('');
    setOxpayInvoice(null);
    setTxHash('');
    setCashNotes('');
    setCurrentTransactionId('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 text-slate-800 dark:text-slate-100 transition-colors">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('wallet.title', 'المحفظة الرقمية')}</h1>
          <p className="text-gray-600 dark:text-slate-300">{t('wallet.subtitle', 'إدارة الرصيد والإيداعات وسحب الأرباح بسهولة وأمان')}</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-br from-white/30 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Wallet size={32} />
                <Badge variant="secondary" size="sm" className="bg-white/20 border-none text-white">{t('wallet.availableBalance', 'الرصيد المتاح')}</Badge>
              </div>
              <p className="text-4xl font-bold mb-2">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-primary-100 text-sm">{isEn ? 'Available for instant investment & withdrawal' : 'متاح للاستثمار والسحب الفوري'}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Clock className="text-warning" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length}
            </p>
            <p className="text-gray-600 dark:text-slate-300 text-sm">{t('wallet.pendingDeposits', 'إيداعات قيد المعالجة')}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-success" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ${transactions.filter(t => t.type === 'profit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </p>
            <p className="text-gray-600 dark:text-slate-300 text-sm">{t('wallet.totalProfitReceived', 'إجمالي الأرباح المستلمة')}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: t('wallet.tabOverview', 'نظرة عامة'), icon: null },
            { id: 'deposit', label: t('wallet.tabDeposit', 'إيداع أموال'), icon: Plus },
            { id: 'withdraw', label: t('wallet.tabWithdraw', 'سحب أرباح'), icon: ArrowUpRight }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id !== 'deposit') resetDeposit();
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {tab.icon && <tab.icon size={18} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-primary-600" />
              {isEn ? 'Recent Transactions' : 'سجل العمليات الأخيرة'}
            </h2>
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">{isEn ? 'Loading...' : 'جاري التحميل...'}</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{isEn ? 'No financial transactions yet' : 'لا توجد عمليات مالية حتى الآن'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.network ? `${transaction.method} (${transaction.network})` : transaction.method}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString(isEn ? 'en-US' : 'ar-SA')}</p>
                        {transaction.txHash && (
                          <a 
                            href={`https://tronscan.org/#/transaction/${transaction.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            <ExternalLink size={12} />
                            {isEn ? 'View on Blockchain' : 'عرض على البلوكشين'}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-left flex items-center gap-3">
                      <div>
                        <p className={`font-bold ${
                          transaction.type === 'deposit' || transaction.type === 'profit'
                            ? 'text-success'
                            : 'text-error'
                        }`}>
                          {transaction.type === 'withdraw' ? '-' : '+'}${transaction.amount.toLocaleString()}
                        </p>
                        <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedReceipt({
                            id: transaction.id,
                            type: transaction.type,
                            amount: transaction.amount,
                            status: transaction.status,
                            date: transaction.date,
                            method: transaction.method,
                            network: transaction.network,
                            txHash: transaction.txHash,
                            userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : (isEn ? 'Tamoora Investor' : 'مستثمر طامورة'),
                            userEmail: user?.email,
                          });
                          setIsReceiptOpen(true);
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                        title={isEn ? 'Print / View Official Receipt' : 'طباعة / معاينة وصل الإيداع الرسمي'}
                      >
                        <span>{isEn ? 'Receipt' : 'الوصل'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'deposit' && (
          <Card className="p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowDownLeft className="text-success" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isEn ? 'Deposit Funds' : 'إيداع رصيد بالمحفظة'}</h2>
              <p className="text-gray-600 dark:text-slate-300 mb-6">{isEn ? 'Choose your preferred deposit method' : 'اختر طريقة الإيداع المناسبة لك'}</p>

              {/* Deposit Type Selector: OXPAY (USDT) vs Cash */}
              <div className="flex justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setDepositType('oxpay')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                    depositType === 'oxpay'
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <CreditCard size={16} className="inline ml-1.5 mb-0.5" />
                  {isEn ? 'OXPAY Gateway (USDT)' : 'بوابة OXPAY الرقمية (USDT)'}
                </button>
                <button
                  type="button"
                  onClick={() => setDepositType('cash')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                    depositType === 'cash'
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <DollarSign size={16} className="inline ml-1.5 mb-0.5" />
                  {isEn ? 'Cash Deposit' : 'إيداع كاش (نقدي)'}
                </button>
              </div>
            </div>

            {/* OXPAY Deposit Gateway (Default & Primary Digital Gateway) */}
            {depositType === 'oxpay' ? (
              <div className="space-y-6">
                {!oxpayInvoice ? (
                  <form onSubmit={handleCreateOxpayDeposit} className="space-y-6">
                    {/* Quick Amount Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        {isEn ? 'Quick Select Amount ($)' : 'اختيار سريع للمبلغ ($)'}
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {['50', '100', '250', '500', '1000'].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setOxpayAmount(amt)}
                            className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                              oxpayAmount === amt
                                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                            }`}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Input
                      label={isEn ? 'Deposit Amount ($ USD / USDT)' : 'مبلغ الإيداع ($ USD / USDT)'}
                      type="number"
                      min="1"
                      placeholder={isEn ? 'Enter amount (min $1)' : 'أدخل المبلغ (الحد الأدنى $1)'}
                      value={oxpayAmount}
                      onChange={(e) => setOxpayAmount(e.target.value)}
                      required
                    />

                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex gap-3">
                      <CreditCard size={20} className="flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      <p>
                        {isEn
                          ? `Payment will be processed via OxaPay. You can select your preferred crypto network (TRC20, BEP20, Polygon, etc.) directly on the checkout screen.`
                          : `سيتم تجهيز فاتورة الدفع عبر بوابة OxaPay الآمنة. يمكنك اختيار شبكتك المفضلة (TRC20، BEP20، Polygon وغيرها) مباشرة من صفحة الدفع الرسمية.`}
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      variant="gradient"
                      isLoading={isCreatingOxpay}
                      disabled={!oxpayAmount || Number(oxpayAmount) < 1}
                    >
                      <CreditCard size={18} className="ml-2" />
                      {isEn ? `Proceed to Pay with OxaPay ($${oxpayAmount || '0'})` : `متابعة الدفع عبر OxaPay ($${oxpayAmount || '0'})`}
                    </Button>
                  </form>
                ) : (
                  /* OXPAY Active Invoice View */
                  <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {isEn ? 'OxaPay Invoice Ready' : 'فاتورة OxaPay جاهزة للدفع'}
                    </div>

                    <div className="space-y-1">
                      <p className="text-3xl font-black text-slate-900 dark:text-white">
                        ${oxpayInvoice.amount} <span className="text-base font-normal text-slate-500">USDT</span>
                      </p>
                      <p className="text-xs text-slate-500 font-mono">Invoice ID: {oxpayInvoice.invoiceId}</p>
                    </div>

                    {/* QR Code */}
                    {oxpayInvoice.qrCodeUrl && (
                      <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-white rounded-2xl shadow-sm max-w-[220px] mx-auto">
                        <img
                          src={oxpayInvoice.qrCodeUrl}
                          alt="OxaPay QR Code"
                          className="w-44 h-44 object-contain"
                        />
                        <span className="text-[11px] text-slate-600 font-medium mt-2">
                          {isEn ? 'Scan to Pay via Wallet' : 'امسح الرمز للدفع'}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3 max-w-md mx-auto">
                      {oxpayInvoice.payUrl && (
                        <a
                          href={oxpayInvoice.payUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                        >
                          <ExternalLink size={18} />
                          <span>{isEn ? 'Open OxaPay Payment Page' : 'الانتقال لصفحة الدفع في OxaPay'}</span>
                        </a>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleCheckOxpayStatus}
                          className="flex-1"
                          size="md"
                          variant="outline"
                          isLoading={isCheckingOxpay}
                        >
                          <CheckCircle size={16} className="ml-1.5 text-emerald-500" />
                          <span>{isEn ? 'Check Payment Status' : 'التحقق من وصول الدفعة'}</span>
                        </Button>
                        <Button
                          onClick={handleCancelOxpayInvoice}
                          size="md"
                          variant="ghost"
                        >
                          {isEn ? 'Cancel / New Invoice' : 'إلغاء / فاتورة جديدة'}
                        </Button>
                      </div>
                    </div>

                    {/* Optional TxHash direct verification */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-right space-y-3">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isEn ? 'Transferred directly? Enter TxHash for instant verification:' : 'هل قمت بالتحويل المباشر؟ أدخل رقم المعاملة (TxHash) للتحقق الفوري:'}
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={isEn ? 'Enter TxHash...' : 'أدخل معرف المعاملة TxHash...'}
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <Button
                          onClick={() => {
                            setCurrentTransactionId(oxpayInvoice.orderId);
                            setDepositAmount(String(oxpayInvoice.amount));
                            handleVerifyDeposit();
                          }}
                          size="sm"
                          isLoading={isVerifying}
                          disabled={!txHash}
                        >
                          {isEn ? 'Verify' : 'تأكيد'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Cash Deposit */
              <form onSubmit={handleCreateCashDeposit} className="space-y-6">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-sm text-amber-900 dark:text-amber-200">
                  <p className="font-bold mb-1">ℹ️ {isEn ? 'Cash Deposit Instructions:' : 'تعليمات الإيداع النقدي (كاش):'}</p>
                  <p className="text-xs leading-relaxed">
                    {isEn
                      ? 'Enter the amount you wish to deposit in cash and any handover notes. Your request will be sent to management, and once approved, funds will be added directly to your wallet.'
                      : 'أدخل قيمة المبلغ الذي ترغب بإيداعه نقداً وأي ملاحظات خاصة. سيتم إرسال الطلب فوراً للإدارة، وعند موافقة الأدمن (OK) سيتم إضافة الرصيد مباشرة إلى محفظتك للاستثمار.'}
                  </p>
                </div>

                <Input
                  label={isEn ? 'Cash Deposit Amount ($)' : 'مبلغ الإيداع النقدي ($)'}
                  type="number"
                  min="1"
                  placeholder={isEn ? 'Enter amount ($)' : 'أدخل المبلغ ($)'}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                />

                <Input
                  label={isEn ? 'Notes or Handover Location (Optional)' : 'ملاحظات أو موقع التسليم (اختياري)'}
                  placeholder={isEn ? 'E.g., Cash delivery / Receipt number...' : 'مثال: تسليم كاش - دمشق / وصل أمانة / رقم العملية...'}
                  value={cashNotes}
                  onChange={(e) => setCashNotes(e.target.value)}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isSubmittingCash}
                  disabled={!depositAmount || Number(depositAmount) < 1}
                >
                  {isEn ? 'Submit Cash Deposit Request' : 'إرسال طلب إيداع كاش'}
                </Button>
              </form>
            )}
          </Card>
        )}

        {activeTab === 'withdraw' && (
          <Card className="p-8 max-w-2xl mx-auto dark:bg-slate-800 dark:border-slate-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-error/10 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUpRight className="text-error" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isEn ? 'Withdraw Profits & Capital' : 'سحب الأرباح ورأس المال'}</h2>
              <p className="text-gray-600 dark:text-slate-300">
                {isEn ? 'Total Current Balance:' : 'إجمالي رصيد الحساب الحالي:'} <span className="font-bold text-primary-600 dark:text-primary-400">${balance.toLocaleString()}</span>
              </p>
            </div>

            {/* تفاصيل أهلية السحب */}
            <div className="mb-6 p-5 bg-gradient-to-br from-slate-50 to-primary-50/40 dark:from-slate-900 dark:to-slate-800 border border-primary-200 dark:border-slate-700 rounded-2xl space-y-3 text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-600 dark:text-slate-400">{isEn ? 'Total Net Earned Profit:' : 'إجمالي الأرباح الصافية المحققة:'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">${(eligibility?.totalProfitEarned || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-600 dark:text-slate-400">{isEn ? 'Active Limit (80% Net Profit):' : 'الحد المسموح أثناء الاشتراك (80% أرباح صافية):'}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">${(eligibility?.netProfit80Percent || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-600 dark:text-slate-400">{isEn ? 'Previous Withdrawals (Completed):' : 'المسحوبات السابقة (مكتملة ومراجعة):'}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">${(eligibility?.totalWithdrawn || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-gray-900 dark:text-white">{isEn ? 'Maximum Withdrawable Now:' : 'الحد الأقصى القابل للسحب الآن:'}</span>
                <span className="text-xl font-black text-primary-600 dark:text-primary-400">
                  ${(eligibility?.maxWithdrawable || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-6">
              {/* اختيار شبكة السحب OXPAY */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  {isEn ? 'Select Withdrawal Network (USDT)' : 'اختر شبكة السحب (OXPAY USDT)'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.values(NetworkType).map((network) => (
                    <button
                      key={network}
                      type="button"
                      onClick={() => setWithdrawNetwork(network)}
                      className={`p-3.5 border-2 rounded-xl flex flex-col items-center gap-1.5 transition-all ${
                        withdrawNetwork === network
                          ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold shadow-sm'
                          : 'border-gray-200 dark:border-slate-700 hover:border-primary-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <DollarSign size={20} className={withdrawNetwork === network ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'} />
                      <div className="text-center">
                        <p className="font-bold text-xs sm:text-sm">{network}</p>
                        <p className="text-[10px] opacity-75">
                          {network === 'TRC20' && (isEn ? 'Tron' : 'شبكة ترون')}
                          {network === 'BEP20' && (isEn ? 'BNB Chain' : 'شبكة باينانس')}
                          {network === 'ERC20' && (isEn ? 'Ethereum' : 'شبكة إيثيريوم')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label={isEn ? `USDT Wallet Address (${withdrawNetwork})` : `عنوان محفظة USDT (${withdrawNetwork})`}
                placeholder={
                  withdrawNetwork === NetworkType.TRC20
                    ? (isEn ? 'Enter Tron address (starts with T)' : 'أدخل عنوان محفظة ترون (يبدأ بحرف T)')
                    : (isEn ? 'Enter address (starts with 0x)' : 'أدخل عنوان المحفظة (يبدأ بـ 0x)')
                }
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                required
              />

              <Input
                label={isEn ? 'Withdrawal Amount ($)' : 'مبلغ السحب ($)'}
                type="number"
                min="1"
                step="any"
                max={eligibility?.maxWithdrawable || balance}
                placeholder={isEn ? `Enter amount (Available limit: $${eligibility?.maxWithdrawable ?? balance})` : `أدخل المبلغ (الحد المتاح حالياً: $${eligibility?.maxWithdrawable ?? balance})`}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />

              <div className="p-4 bg-primary-50 dark:bg-slate-900 border border-primary-200 dark:border-slate-700 rounded-xl text-xs text-gray-600 dark:text-slate-300 flex gap-3">
                <AlertCircle size={20} className="flex-shrink-0 text-primary-500 mt-0.5" />
                <p>
                  {isEn
                    ? `Withdrawal will be sent via OXPAY (${withdrawNetwork}). Processing time is typically under 24 hours after review.`
                    : `سيتم تحويل السحب عبر OXPAY على شبكة ${withdrawNetwork}. تصل الأموال إلى محفظتك خلال 24 ساعة فور مراجعة الإدارة.`}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                variant="gradient"
                isLoading={isWithdrawing}
                disabled={!walletAddress || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > (eligibility?.maxWithdrawable ?? balance)}
              >
                {isEn ? `Submit Withdrawal Request ($${withdrawAmount || 0} - ${withdrawNetwork})` : `تقديم طلب السحب عبر OXPAY ($${withdrawAmount || 0})`}
              </Button>
            </form>
          </Card>
        )}
      </Container>

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={selectedReceipt}
      />
    </div>
  );
}
