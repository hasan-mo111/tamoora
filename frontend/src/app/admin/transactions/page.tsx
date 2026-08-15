'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, DollarSign, ArrowUpRight, ArrowDownLeft, TrendingUp, RefreshCw, AlertCircle, Search, FileText, Printer, Zap } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ReceiptModal, { ReceiptData } from '@/components/ui/ReceiptModal';
import { API_BASE } from '@/config/api';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'profit' | 'investment';
  amount: number;
  status: 'pending' | 'completed' | 'rejected' | 'expired';
  method?: string;
  network?: string;
  txHash?: string;
  adminNotes?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
  };
}

interface InvestmentRequest {
  id: string;
  investmentId: string;
  userId: string;
  userEmail: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  numberOfShares?: number;
  adminNotes?: string;
}

export default function AdminTransactionsPage() {
  const { t, lang } = useThemeLanguage();
  const [activeTab, setActiveTab] = useState<'withdraw' | 'deposit'>('withdraw');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');

      // 1. Fetch Real Transactions (Deposits / Withdrawals)
      const txRes = await fetch(`${API_BASE}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(Array.isArray(txData) ? txData : []);
      }

      // 2. Fetch Real Investment Requests
      const reqRes = await fetch(`${API_BASE}/investment-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setInvestmentRequests(Array.isArray(reqData) ? reqData : []);
      }
    } catch (err) {
      console.error('Error fetching real admin transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers for Withdrawals
  const handleApproveWithdraw = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من الموافقة على طلب السحب؟' : 'Approve withdrawal request?')) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/transactions/${id}/approve-withdraw`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        const txHashMsg = data.transaction?.txHash ? `\n\n🔗 رمز المعاملة (TxHash):\n${data.transaction.txHash}` : '';
        alert((lang === 'ar' ? '✅ تمت الموافقة على طلب السحب بنجاح' : 'Withdrawal request approved successfully!') + txHashMsg);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Error approving withdrawal');
      }
    } catch (err) {
      console.error(err);
      alert(lang === 'ar' ? 'حدث خطأ في الاتصال بالخادم' : 'Server connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectWithdraw = async (id: string) => {
    const reason = prompt(lang === 'ar' ? 'أدخل سبب رفض طلب السحب (اختياري):' : 'Rejection reason:');
    if (reason === null) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/transactions/${id}/reject-withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: reason }),
      });
      if (res.ok) {
        alert(lang === 'ar' ? '❌ تم رفض طلب السحب' : 'Withdrawal request rejected');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Error rejecting withdrawal');
      }
    } catch (err) {
      console.error(err);
      setTransactions(transactions.map(t => t.id === id ? { ...t, status: 'rejected', adminNotes: reason } : t));
      alert('❌ تم رفض طلب السحب (وضع تجريبي)');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Deposits
  const handleApproveDeposit = async (id: string) => {
    if (!confirm('هل أنت متأكد من الموافقة على طلب الإيداع وإضافة الرصيد لحساب المستثمر بنجاح (OK)؟')) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/transactions/${id}/approve-deposit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('✅ تمت الموافقة على طلب الإيداع وإضافة الرصيد لحساب المستثمر بنجاح');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'حدث خطأ أثناء موافقة الإيداع');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectDeposit = async (id: string) => {
    const reason = prompt('أدخل سبب رفض طلب الإيداع (اختياري):');
    if (reason === null) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/transactions/${id}/reject-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: reason }),
      });
      if (res.ok) {
        alert('❌ تم رفض طلب الإيداع');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'حدث خطأ أثناء رفض الإيداع');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Data
  const withdrawals = transactions.filter(t => t.type === 'withdraw');
  const deposits = transactions.filter(t => t.type === 'deposit');

  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;
  const pendingDepositsCount = deposits.filter(d => d.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600/10 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              إدارة المعاملات وطلبات سحب الرصيد
            </h1>
            <button
              onClick={fetchData}
              className="p-2 text-slate-500 hover:text-primary-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            مراجعة كافة طلبات السحب والإيداع واتخاذ الإجراء المناسب بالموافقة أو الرفض
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'withdraw'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <ArrowUpRight size={16} />
          <span>طلبات سحب الرصيد</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="bg-white text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-black">
              {pendingWithdrawalsCount} معلق
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'deposit'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <ArrowDownLeft size={16} />
          <span>سجل الإيداعات</span>
          {pendingDepositsCount > 0 && (
            <span className="bg-white text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black">
              {pendingDepositsCount}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500">جاري تحميل المعاملات...</p>
        </div>
      ) : activeTab === 'withdraw' ? (
        /* ================= WITHDRAWALS TAB ================= */
        <div className="space-y-4">
          <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowUpRight className="text-amber-500" size={18} />
                طلبات السحب المقدمة من المستثمرين ({withdrawals.length})
              </h3>
            </div>

            {withdrawals.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">لا توجد طلبات سحب رصيد حالياً</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4 text-start">المستخدم</th>
                      <th className="py-3.5 px-4 text-start">المبلغ المطلوبة</th>
                      <th className="py-3.5 px-4 text-start">عنوان المحفظة / الشبكة</th>
                      <th className="py-3.5 px-4 text-start">الحالة</th>
                      <th className="py-3.5 px-4 text-start">التاريخ</th>
                      <th className="py-3.5 px-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white dir-ltr text-right">
                          {w.user?.email || 'User ID: ' + w.id}
                        </td>
                        <td className="py-3.5 px-4 font-black text-amber-600 dark:text-amber-400 text-sm">
                          ${Number(w.amount).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-w-xs truncate dir-ltr text-right">
                          {w.method || 'USDT TRC20'}
                        </td>
                        <td className="py-3.5 px-4">
                          {w.status === 'pending' && <Badge variant="warning" size="sm">قيد المراجعة</Badge>}
                          {w.status === 'completed' && <Badge variant="success" size="sm">مكتمل ومحول</Badge>}
                          {w.status === 'rejected' && <Badge variant="error" size="sm">مرفوض</Badge>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {new Date(w.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {w.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveWithdraw(w.id)}
                                  disabled={isSubmitting}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] shadow-sm transition-colors"
                                >
                                  موافقة وتحويل
                                </button>
                                <button
                                  onClick={() => handleRejectWithdraw(w.id)}
                                  disabled={isSubmitting}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-[11px] shadow-sm transition-colors"
                                >
                                  رفض
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedReceipt({
                                  id: w.id,
                                  type: 'withdraw',
                                  amount: w.amount,
                                  status: w.status,
                                  date: w.createdAt,
                                  method: w.method,
                                  txHash: w.txHash,
                                  userEmail: w.user?.email,
                                  userName: w.user?.email ? w.user.email.split('@')[0] : 'المستثمر',
                                });
                                setIsReceiptOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-[11px] flex items-center gap-1 transition-colors"
                              title="طباعة / معاينة الوصل الرسمي"
                            >
                              <Printer size={13} />
                              <span>الوصل</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* ================= DEPOSITS TAB ================= */
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowDownLeft className="text-emerald-500" size={18} />
              سجل عمليات الإيداع بالعملات الرقمية ({deposits.length})
            </h3>
          </div>

          {deposits.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">لا توجد إيداعات مسجلة</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4 text-start">المستثمر</th>
                    <th className="py-3.5 px-4 text-start">المبلغ</th>
                    <th className="py-3.5 px-4 text-start">الطريقة / الشبكة</th>
                    <th className="py-3.5 px-4 text-start">تفاصيل / TxHash</th>
                    <th className="py-3.5 px-4 text-start">الحالة</th>
                    <th className="py-3.5 px-4 text-start">التاريخ</th>
                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white dir-ltr text-right">
                        {d.user?.email || 'User ID: ' + d.id}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        +${Number(d.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={d.network === 'CASH' ? 'accent' : 'primary'} size="sm">
                          {d.method || d.network || 'TRC20'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 max-w-xs truncate dir-ltr text-right">
                        {d.adminNotes || d.txHash || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        {d.status === 'completed' && <Badge variant="success" size="sm">مكتمل ومعتمد</Badge>}
                        {d.status === 'pending' && <Badge variant="warning" size="sm">قيد التحقق</Badge>}
                        {d.status === 'rejected' && <Badge variant="error" size="sm">مرفوض</Badge>}
                        {d.status === 'expired' && <Badge variant="error" size="sm">منتهي الصلاحية</Badge>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(d.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {d.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveDeposit(d.id)}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] shadow-sm transition-colors"
                              >
                                موافقة وإيداع (OK)
                              </button>
                              <button
                                onClick={() => handleRejectDeposit(d.id)}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-[11px] shadow-sm transition-colors"
                              >
                                رفض
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedReceipt({
                                id: d.id,
                                type: 'deposit',
                                amount: d.amount,
                                status: d.status,
                                date: d.createdAt,
                                method: d.method || d.network,
                                txHash: d.txHash,
                                userEmail: d.user?.email,
                                userName: d.user?.email ? d.user.email.split('@')[0] : 'المستثمر',
                                notes: d.adminNotes,
                              });
                              setIsReceiptOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-[11px] flex items-center gap-1 transition-colors"
                            title="طباعة / معاينة الوصل الرسمي"
                          >
                            <Printer size={13} />
                            <span>الوصل</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Official PDF Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={selectedReceipt}
      />
    </div>
  );
}
