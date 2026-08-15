'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Eye, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Search, X, Image as ImageIcon } from 'lucide-react';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { API_BASE } from '@/config/api';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

interface UserKYC {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  idDocumentFront?: string | null;
  idDocumentBack?: string | null;
  idDocumentStatus: 'none' | 'pending' | 'approved' | 'rejected';
  idDocumentRejectReason?: string | null;
  verificationStatus: string;
  createdAt: string;
}

export default function AdminKYCPage() {
  const { t, lang } = useThemeLanguage();
  const [users, setUsers] = useState<UserKYC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserKYC | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsersKYC = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        // Filter users who uploaded documents or have a non-'none' status
        const kycUsers = Array.isArray(data)
          ? data.filter((u: UserKYC) => u.idDocumentStatus && u.idDocumentStatus !== 'none')
          : [];
        setUsers(kycUsers);
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      console.log('Using demo fallback for KYC:', err);
      // Demo fallback data
      setUsers([
        {
          id: 'u-1',
          email: 'investor1@example.com',
          firstName: 'عبدالله',
          lastName: 'الشمري',
          phone: '+966500123456',
          idDocumentFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
          idDocumentBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
          idDocumentStatus: 'pending',
          verificationStatus: 'email_verified',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'u-2',
          email: 'sarah.m@example.com',
          firstName: 'سارة',
          lastName: 'محمود',
          phone: '+966555987654',
          idDocumentFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
          idDocumentBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
          idDocumentStatus: 'approved',
          verificationStatus: 'identity_verified',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersKYC();
  }, []);

  const handleApprove = async (userId: string) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من الموافقة وتوثيق هوية هذا المستخدم؟' : 'Approve & verify user identity?')) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/users/${userId}/approve-identity`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert(lang === 'ar' ? '✅ تم التوثيق بنجاح' : '✅ Verified successfully');
        setSelectedUser(null);
        fetchUsersKYC();
      } else {
        const err = await res.json();
        alert(err.message || 'Error approving identity');
      }
    } catch (err) {
      console.error(err);
      // Demo state update
      setUsers(users.map(u => u.id === userId ? { ...u, idDocumentStatus: 'approved' } : u));
      alert(lang === 'ar' ? '✅ تم التوثيق بنجاح (وضع تجريبي)' : '✅ Verified (Demo mode)');
      setSelectedUser(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectReason.trim()) {
      alert(lang === 'ar' ? 'يرجى كتابة سبب الرفض' : 'Please enter rejection reason');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}/reject-identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (res.ok) {
        alert(lang === 'ar' ? '❌ تم رفض وثيقة الهوية' : '❌ Identity document rejected');
        setShowRejectModal(false);
        setSelectedUser(null);
        setRejectReason('');
        fetchUsersKYC();
      } else {
        const err = await res.json();
        alert(err.message || 'Error rejecting identity');
      }
    } catch (err) {
      console.error(err);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, idDocumentStatus: 'rejected', idDocumentRejectReason: rejectReason } : u));
      alert(lang === 'ar' ? '❌ تم رفض الهوية (وضع تجريبي)' : '❌ Rejected (Demo mode)');
      setShowRejectModal(false);
      setSelectedUser(null);
      setRejectReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'all' || u.idDocumentStatus === filter;
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = users.filter(u => u.idDocumentStatus === 'pending').length;
  const approvedCount = users.filter(u => u.idDocumentStatus === 'approved').length;
  const rejectedCount = users.filter(u => u.idDocumentStatus === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600/10 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('admin.kycTitle', 'طلبات التحقق من الهوية (KYC)')}
            </h1>
            <button
              onClick={fetchUsersKYC}
              className="p-2 text-slate-500 hover:text-primary-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t('admin.kycSubtitle', 'مراجعة صور الهويات الوطنية والجوازات المقدمة من المستثمرين لاعتمادها أو رفضها')}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 mb-1">إجمالي التوثيقات</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</p>
        </Card>
        <Card className="p-5 border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">بانتظار المراجعة</p>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{pendingCount}</p>
            </div>
            <Clock className="text-amber-500" size={28} />
          </div>
        </Card>
        <Card className="p-5 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">مقبولة وموثقة</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{approvedCount}</p>
            </div>
            <CheckCircle className="text-emerald-500" size={28} />
          </div>
        </Card>
        <Card className="p-5 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">مرفوضة</p>
              <p className="text-2xl font-black text-red-700 dark:text-red-400">{rejectedCount}</p>
            </div>
            <XCircle className="text-red-500" size={28} />
          </div>
        </Card>
      </div>

      {/* Controls & Search */}
      <Card className="p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            بانتظار المراجعة ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            الكل ({users.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === 'approved'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            المقبولة ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === 'rejected'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            المرفوضة ({rejectedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالبريد أو الاسم..."
            className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </Card>

      {/* KYC Table */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500">جاري تحميل طلبات الهوية...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
          <ShieldCheck size={48} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">لا توجد طلبات تحقق تطابق هذا الفلتر</h3>
        </div>
      ) : (
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4 text-start">المستخدم</th>
                  <th className="py-3.5 px-4 text-start">رقم الهاتف</th>
                  <th className="py-3.5 px-4 text-center">الوثائق المقدمة</th>
                  <th className="py-3.5 px-4 text-start">الحالة</th>
                  <th className="py-3.5 px-4 text-start">تاريخ الرفع</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}` : 'مستخدم بدون اسم'}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] dir-ltr text-right">
                        {u.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 dir-ltr text-right">
                      {u.phone || 'غير مسجل'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold text-[11px] hover:bg-primary-100 transition-colors"
                      >
                        <ImageIcon size={14} />
                        <span>معاينة الصور ({u.idDocumentFront ? '2' : '0'})</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.idDocumentStatus === 'pending' && (
                        <Badge variant="warning" size="sm">
                          <Clock size={12} className="inline ml-1" />
                          بانتظار المراجعة
                        </Badge>
                      )}
                      {u.idDocumentStatus === 'approved' && (
                        <Badge variant="success" size="sm">
                          <CheckCircle size={12} className="inline ml-1" />
                          مقبول وموثق
                        </Badge>
                      )}
                      {u.idDocumentStatus === 'rejected' && (
                        <Badge variant="error" size="sm">
                          <XCircle size={12} className="inline ml-1" />
                          مرفوض
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="معاينة"
                        >
                          <Eye size={16} />
                        </button>
                        {u.idDocumentStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(u.id)}
                              disabled={isSubmitting}
                              className="px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowRejectModal(true);
                              }}
                              disabled={isSubmitting}
                              className="px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-colors"
                            >
                              رفض
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* User Document Preview Modal */}
      {selectedUser && !showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={24} className="text-primary-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  معاينة وثائق هوية: {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                </h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            {/* Document Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front ID */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">الوجه الأمامي للهوية/الجواز</p>
                {selectedUser.idDocumentFront ? (
                  <img
                    src={selectedUser.idDocumentFront.startsWith('http') ? selectedUser.idDocumentFront : `${API_BASE}${selectedUser.idDocumentFront}`}
                    alt="Front ID"
                    className="max-h-60 w-auto mx-auto object-contain rounded-xl border shadow-sm"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-xs">لا يوجد صورة أمامية</div>
                )}
              </div>

              {/* Back ID */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">الوجه الخلفي للهوية</p>
                {selectedUser.idDocumentBack ? (
                  <img
                    src={selectedUser.idDocumentBack.startsWith('http') ? selectedUser.idDocumentBack : `${API_BASE}${selectedUser.idDocumentBack}`}
                    alt="Back ID"
                    className="max-h-60 w-auto mx-auto object-contain rounded-xl border shadow-sm"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-xs">لا يوجد صورة خلفية</div>
                )}
              </div>
            </div>

            {selectedUser.idDocumentRejectReason && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300">
                <span className="font-bold">سبب الرفض السابق:</span> {selectedUser.idDocumentRejectReason}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                إغلاق
              </Button>

              {selectedUser.idDocumentStatus === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowRejectModal(true)}
                  >
                    رفض الطلب
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(selectedUser.id)}
                    isLoading={isSubmitting}
                  >
                    موافقة وتوثيق الهوية
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              سبب رفض وثيقة الهوية
            </h3>
            <p className="text-xs text-slate-500">
              سيتم إرسال هذا السبب للمستخدم حتى يستطيع إعادة رفع صورة واضحة ومطابقة.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="مثال: الصورة غير واضحة، أطراف الهوية مقتطعة، انتهت صلاحية الهوية..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                إلغاء
              </Button>
              <Button variant="danger" size="sm" onClick={handleReject} isLoading={isSubmitting}>
                تأكيد الرفض
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
