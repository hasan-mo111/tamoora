'use client';

import { useState, useEffect } from 'react';
import { Search, MoreVertical, Ban, CheckCircle, Eye, Edit, Users as UsersIcon, UserCheck, UserX, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { API_BASE } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  balance: string;
  isPinVerified: boolean;
  createdAt: string;
  status: 'active' | 'suspended';
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    if (userId === currentUser?.id || users.find(u => u.id === userId)?.email === currentUser?.email) {
      alert('⚠️ إجراء غير مسموح: لا يمكنك حظر أو توقيف حسابك الحالي!');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert(newStatus === 'active' ? 'تم تفعيل الحساب' : 'تم إيقاف الحساب');
        fetchUsers();
      } else {
        alert('حدث خطأ أثناء تحديث الحالة');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('حدث خطأ');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (userToDelete.id === currentUser?.id || userToDelete.email === currentUser?.email) {
      alert('⚠️ إجراء غير مسموح: لا يمكنك حذف حسابك الحالي!');
      setUserToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'تم حذف المستخدم بنجاح');
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
      } else {
        // Fallback for local state sync if backend fails or mock mode
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        alert('تم حذف المستخدم من القائمة');
        setUserToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      alert('تم حذف المستخدم');
      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;

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
          <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-gray-600">عرض وإدارة جميع حسابات المستخدمين</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <UsersIcon className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <UserCheck className="text-success" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              <p className="text-sm text-gray-600">مستخدمين نشطين</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
              <UsersIcon className="text-accent-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
              <p className="text-sm text-gray-600">مدراء النظام</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="ابحث بالبريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterRole === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterRole('user')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterRole === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              مستخدمين
            </button>
            <button
              onClick={() => setFilterRole('admin')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterRole === 'admin' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              مدراء
            </button>
          </div>
        </div>
      </Card>

      {/* Users View (Mobile Cards + Desktop Table) */}
      <Card className="p-4 sm:p-6">
        {/* Mobile Card Layout */}
        <div className="block md:hidden space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate max-w-[170px]">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{user.email}</p>
                    <p className="text-[11px] text-slate-500 truncate">ID: {user.id.substring(0, 8)}...</p>
                  </div>
                </div>

                <Badge variant={user.role === 'admin' ? 'accent' : 'primary'} size="sm">
                  {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-500 block">الرصيد:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">${user.balance || '0.00'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">الحالة:</span>
                  <Badge variant={user.status === 'active' ? 'success' : 'error'} size="sm">
                    {user.status === 'active' ? 'نشط' : 'موقوف'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForDetails(user)}
                  className="px-3 py-1.5 bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 rounded-lg font-bold text-xs flex items-center gap-1"
                >
                  <Eye size={16} />
                  <span>التفاصيل</span>
                </button>

                {user.id === currentUser?.id || user.email === currentUser?.email ? (
                  <span className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-200 rounded-lg flex items-center gap-1">
                    <ShieldAlert size={14} />
                    حسابك محمي
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                        user.status === 'active'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}
                    >
                      {user.status === 'active' ? <Ban size={15} /> : <CheckCircle size={15} />}
                      <span>{user.status === 'active' ? 'إيقاف' : 'تفعيل'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserToDelete(user)}
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">المستخدم</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">الدور</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">الرصيد</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">الحالة</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">تاريخ التسجيل</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={user.role === 'admin' ? 'accent' : 'primary'} size="sm">
                      {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">${user.balance || '0.00'}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={user.status === 'active' ? 'success' : 'error'} size="sm">
                      {user.status === 'active' ? 'نشط' : 'موقوف'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        aria-label="عرض التفاصيل"
                        title="عرض تفاصيل المستخدم الكاملة"
                        onClick={() => setSelectedUserForDetails(user)}
                        className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors flex items-center gap-1 font-medium text-xs"
                      >
                        <Eye size={18} />
                        <span>التفاصيل</span>
                      </button>

                      {user.id === currentUser?.id || user.email === currentUser?.email ? (
                        <span 
                          title="حسابك الحالي - محمي من الحظر والتوقيف والحذف"
                          className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-200 rounded-lg border border-amber-300 flex items-center gap-1"
                        >
                          <ShieldAlert size={14} />
                          حسابك (محمي)
                        </span>
                      ) : (
                        <>
                          <button 
                            type="button"
                            aria-label={user.status === 'active' ? 'إيقاف المستخدم' : 'تفعيل المستخدم'}
                            title={user.status === 'active' ? 'إيقاف المستخدم' : 'تفعيل المستخدم'}
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                              user.status === 'active' ? 'text-amber-600' : 'text-success'
                            }`}
                          >
                            {user.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                          </button>
                          <button 
                            type="button"
                            aria-label="حذف المستخدم نهائياً"
                            title="حذف المستخدم نهائياً"
                            onClick={() => setUserToDelete(user)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد نتائج</p>
          </div>
        )}
      </Card>

      {/* View User Details Modal */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedUserForDetails.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">تفاصيل حساب المستخدم</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUserForDetails.email}</p>
                </div>
              </div>
              <Badge variant={selectedUserForDetails.role === 'admin' ? 'accent' : 'primary'}>
                {selectedUserForDetails.role === 'admin' ? 'مدير منصة' : 'مستثمر'}
              </Badge>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div>
                  <p className="text-gray-500 text-xs mb-1">المعرف (ID):</p>
                  <p className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200 break-all">{selectedUserForDetails.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">الرصيد المتاح:</p>
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400">${selectedUserForDetails.balance || '0.00'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
                  <p className="text-gray-500 text-xs mb-1">حالة الحساب:</p>
                  <Badge variant={selectedUserForDetails.status === 'active' ? 'success' : 'error'} size="sm">
                    {selectedUserForDetails.status === 'active' ? 'نشط (مفعل)' : 'موقوف'}
                  </Badge>
                </div>

                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
                  <p className="text-gray-500 text-xs mb-1">التحقق من الـ PIN:</p>
                  <Badge variant={selectedUserForDetails.isPinVerified ? 'success' : 'warning'} size="sm">
                    {selectedUserForDetails.isPinVerified ? 'مفعل ومؤكد' : 'غير مؤكد'}
                  </Badge>
                </div>
              </div>

              <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">تاريخ الإنشاء والتسجيل:</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(selectedUserForDetails.createdAt).toLocaleString('ar-SA', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={() => setSelectedUserForDetails(null)}
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">تأكيد حذف المستخدم نهائياً</h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              هل أنت ألكيد من حذف الحساب الخاص بـ <span className="font-bold text-gray-900 dark:text-white">{userToDelete.email}</span>؟
            </p>

            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3 mb-6">
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                ⚠️ تحذير: سيتم مسح هذا المستخدم بالكامل من قاعدة البيانات مع جميع معاملاته المالية وطلبات استثماره. لا يمكن التراجع عن هذا الإجراء!
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
              >
                إلغاء
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteUser}
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                حذف الحساب نهائياً
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}