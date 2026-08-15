'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Trash2, RefreshCw } from 'lucide-react';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { API_BASE } from '@/config/api';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

interface ProjectProposal {
  id: string;
  title: string;
  duration?: string;
  size?: string;
  estimatedCost?: string;
  expectedReturn?: string;
  proposerName?: string;
  proposerEmail?: string;
  notes?: string;
  createdAt: string;
}

export default function AdminProposalsPage() {
  const { t, lang } = useThemeLanguage();
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/project-proposals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProposals(Array.isArray(data) ? data : []);
      } else {
        // Mock data fallback for preview
        setProposals([
          {
            id: '1',
            title: lang === 'ar' ? 'متجر تجزئة إلكتروني لبيع العطور الخاصة' : 'E-commerce Perfume Retail Store',
            duration: lang === 'ar' ? '6 أشهر' : '6 months',
            size: lang === 'ar' ? 'متوسط' : 'Medium',
            estimatedCost: '$8,500',
            expectedReturn: lang === 'ar' ? '18% شهرياً' : '18% Monthly',
            proposerName: 'محمد العلي',
            proposerEmail: 'mohamed@example.com',
            notes: lang === 'ar' ? 'مشروع ذو إقبال كبير مع توفر الموردين.' : 'High demand project with available suppliers.',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'هل أنت تأكد من إزالة هذا الاقتراح؟' : 'Are you sure you want to delete this proposal?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_BASE}/project-proposals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProposals(proposals.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting proposal:', err);
      setProposals(proposals.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 transition-colors">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                <Lightbulb size={24} />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {t('admin.proposalsTitle', 'اقتراحات المشاريع المقدمة')}
              </h1>
              <button
                onClick={() => { setIsRefreshing(true); fetchProposals(); }}
                className="p-2 text-gray-500 hover:text-primary-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="تحديث البيانات"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.proposalsSubtitle', 'جدول يستعرض كافة المشاريع الاستثمارية المقترحة من قبل المستخدمين لمراجعتها مباشرة')}
            </p>
          </div>

          <Badge variant="warning" size="md" className="self-start md:self-auto font-bold text-sm">
            {t('admin.totalProposals', 'إجمالي الاقتراحات:')} {proposals.length}
          </Badge>
        </div>

        {/* Proposals Table */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
            <p className="text-gray-500">{t('btn.loading', 'جاري التحميل...')}</p>
          </div>
        ) : proposals.length > 0 ? (
          <Card className="overflow-hidden border border-gray-200 dark:border-slate-700 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-bold border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="py-4 px-4 text-start">{t('propose.projectName', 'اسم الاستثمار / المشروع')}</th>
                    <th className="py-4 px-4 text-start">{t('propose.duration', 'الزمن / المدة')}</th>
                    <th className="py-4 px-4 text-start">{t('propose.size', 'حجمه')}</th>
                    <th className="py-4 px-4 text-start">{t('propose.estimatedCost', 'التكلفة التقديرية')}</th>
                    <th className="py-4 px-4 text-start">{t('propose.expectedReturn', 'العائد المتوقع')}</th>
                    <th className="py-4 px-4 text-start">{t('admin.proposer', 'صاحب الاقتراح')}</th>
                    <th className="py-4 px-4 text-start">{t('wallet.date', 'التاريخ')}</th>
                    <th className="py-4 px-4 text-center">{t('admin.actions', 'الإجراءات')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {proposals.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-white max-w-xs">
                        <div className="flex flex-col">
                          <span>{p.title}</span>
                          {p.notes && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 italic">
                              "{p.notes}"
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium">
                        {p.duration || 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="primary" size="sm">
                          {p.size || 'Medium'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-semibold text-emerald-700 dark:text-emerald-400">
                        {p.estimatedCost || 'N/A'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-amber-600 dark:text-amber-400">
                        {p.expectedReturn || 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-300">
                        <div>{p.proposerName || 'Guest'}</div>
                        <div className="text-gray-400">{p.proposerEmail}</div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-8 max-w-md mx-auto">
            <Lightbulb size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{t('admin.noProposals', 'لا توجد اقتراحات حالياً')}</h3>
          </div>
        )}
      </Container>
    </div>
  );
}
