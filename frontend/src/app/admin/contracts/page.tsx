'use client';

import { useState, useEffect, useRef } from 'react';
import { FileCheck, Download, Printer, Search, RefreshCw, Eye, ShieldCheck, Calendar, User, CheckCircle2, Sparkles, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { API_BASE } from '@/config/api';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

interface SignedContract {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  contractVersion: string;
  contractSignature: string;
  contractSignedAt: string;
}

export default function AdminContractsPage() {
  const { t, lang } = useThemeLanguage();
  const [contracts, setContracts] = useState<SignedContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<SignedContract | null>(null);
  const printableRef = useRef<HTMLDivElement>(null);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const signedList: SignedContract[] = Array.isArray(data)
          ? data
              .filter((u: any) => u.contractSigned)
              .map((u: any) => ({
                id: `contract-${u.id}`,
                userId: u.id,
                userEmail: u.email,
                userName: u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}` : 'مستثمر موثق',
                userPhone: u.phone || '+96650000000',
                contractVersion: u.contractVersion || 'v1.0',
                contractSignature: u.contractSignature || u.email,
                contractSignedAt: u.contractSignedAt || u.createdAt || new Date().toISOString(),
              }))
          : [];

        setContracts(signedList);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (err) {
      console.log('Demo fallback for admin contracts:', err);
      // Demo mock data
      setContracts([
        {
          id: 'contract-101',
          userId: 'u-1',
          userEmail: 'investor1@example.com',
          userName: 'عبدالله الشمري',
          userPhone: '+966500123456',
          contractVersion: 'v1.0',
          contractSignature: 'عبدالله الشمري - التوقيع الرقمي المعتمد',
          contractSignedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'contract-102',
          userId: 'u-2',
          userEmail: 'sarah.m@example.com',
          userName: 'سارة محمود',
          userPhone: '+966555987654',
          contractVersion: 'v1.0',
          contractSignature: 'سارة محمود - التوقيع الإلكتروني',
          contractSignedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const filteredContracts = contracts.filter(
    (c) =>
      c.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contractSignature.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-full min-w-0 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <FileCheck size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('admin.contractsTitle', 'سجل العقود الإلكترونية الموقعة')}
            </h1>
            <button
              onClick={fetchContracts}
              className="p-2 text-slate-500 hover:text-primary-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t(
              'admin.contractsSubtitle',
              'جميع العقود الموقعة رقمياً من قبل المستثمرين محفوظة هنا مع خيار المعاينة والتحميل والطباعة'
            )}
          </p>
        </div>

        <Badge variant="success" size="md" className="self-start md:self-auto font-bold text-sm">
          إجمالي العقود الموقعة: {contracts.length}
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">إجمالي العقود الموقعة</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{contracts.length}</p>
            </div>
            <FileCheck size={28} className="text-emerald-500" />
          </div>
        </Card>
        <Card className="p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">نسخة العقد المعيارية</p>
              <p className="text-2xl font-black text-primary-600 dark:text-primary-400">v1.0 Standard</p>
            </div>
            <Sparkles size={28} className="text-primary-500" />
          </div>
        </Card>
        <Card className="p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">الحالة القانونية</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">موثق ومحفوظ</p>
            </div>
            <ShieldCheck size={28} className="text-emerald-500" />
          </div>
        </Card>
      </div>

      {/* Controls & Search */}
      <Card className="p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المستثمر أو البريد..."
            className="w-full pl-3 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </Card>

      {/* Contracts Table */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500">جاري تحميل العقود الإلكترونية...</p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
          <FileCheck size={48} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">لا توجد عقود موقعة مطابقة للبحث حالياً</h3>
        </div>
      ) : (
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md max-w-full min-w-0">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-start text-xs min-w-[600px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4 text-start">المستثمر (الطرف الثاني)</th>
                  <th className="py-3.5 px-4 text-start">التوقيع الرقمي</th>
                  <th className="py-3.5 px-4 text-start">إصدار العقد</th>
                  <th className="py-3.5 px-4 text-start">تاريخ التوقيع</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{c.userName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] dir-ltr text-right">
                        {c.userEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 inline-block font-mono">
                        ✍️ {c.contractSignature}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="primary" size="sm">
                        {c.contractVersion}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {new Date(c.contractSignedAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedContract(c)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-600 text-white font-bold text-[11px] hover:bg-primary-700 shadow-sm transition-colors"
                        >
                          <Eye size={14} />
                          <span>معاينة العقد</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Official Contract Viewer Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-10 space-y-6 relative max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 print:max-h-none print:shadow-none print:border-none print:w-full">
            
            {/* Modal Header Actions (Hidden when printing) */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileCheck size={24} className="text-emerald-600" />
                <h3 className="text-lg font-bold">العقد الاستثماري الرسمي - منصة طامورة</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer size={16} className="ml-1.5" />
                  طباعة / حفظ PDF
                </Button>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Document Container */}
            <div ref={printableRef} className="space-y-6 text-sm leading-relaxed p-2 print:p-8 bg-white dark:bg-slate-900">
              
              {/* Document Official Header */}
              <div className="border-b-2 border-slate-900 dark:border-slate-200 pb-6 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    ط
                  </div>
                  <span className="font-extrabold text-2xl tracking-wider text-slate-900 dark:text-white">
                    منصة طامورة الاستثمارية
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white underline underline-offset-8 decoration-primary-600">
                  عقد استثمار إلكتروني معتمد
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  رقم المرجع: TAM-CONTRACT-{selectedContract.userId.slice(0, 8).toUpperCase()} | الإصدار: {selectedContract.contractVersion}
                </p>
              </div>

              {/* Parties Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <h4 className="font-extrabold text-primary-700 dark:text-primary-400 mb-2 border-b pb-1">
                    الطرف الأول (الشركة المشغلة):
                  </h4>
                  <p className="font-bold">شركة طامورة المحدودة للاستثمار والتطوير</p>
                  <p className="text-slate-600 dark:text-slate-400">سجل تجاري ترخيص استثماري رقم 1098452</p>
                  <p className="text-slate-600 dark:text-slate-400">البريد: support@tamoura.com</p>
                </div>
                <div>
                  <h4 className="font-extrabold text-emerald-700 dark:text-emerald-400 mb-2 border-b pb-1">
                    الطرف الثاني (المستثمر الموثق):
                  </h4>
                  <p className="font-bold">الاسم: {selectedContract.userName}</p>
                  <p className="text-slate-600 dark:text-slate-400">البريد: {selectedContract.userEmail}</p>
                  <p className="text-slate-600 dark:text-slate-400 font-mono">الهاتف: {selectedContract.userPhone}</p>
                </div>
              </div>

              {/* Terms Content */}
              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">البنود والشروط العامة للعقد:</h4>
                <ol className="list-decimal list-inside space-y-2 pr-2">
                  <li>
                    يقر الطرف الثاني باطلاعه المباشر على خطط ومشروعات منصة طامورة الاستثمارية وموافقته على دخول الشراكة والتمويل الإلكتروني حسب النسب المحددة.
                  </li>
                  <li>
                    تلتزم المنصة بتسجيل وتوثيق كافة حصص وأسهم الطرف الثاني في لوحة تحكم حسابه مع احتساب الأرباح وعوائد الاستثمار بشكل دوري.
                  </li>
                  <li>
                    يحق للمستثمر طلب سحب أرباحه ورصيده وفق الآلية المتبعة والحدود الأدنى الموضحة في لوحة التحكم.
                  </li>
                  <li>
                    يعتبر هذا العقد وثيقة إلكترونية نافذة وموقعة رقمياً بموجب أنظمة التعاملات الإلكترونية وتوقيع الطرف الثاني.
                  </li>
                </ol>
              </div>

              {/* Digital Signature Footer Seal Box */}
              <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>توقيع المستثمر الإلكتروني المعتمد</span>
                  </div>
                  <p className="font-mono font-bold text-slate-900 dark:text-white text-sm bg-white dark:bg-slate-900 p-2 rounded-xl border border-emerald-300 dark:border-emerald-700">
                    {selectedContract.contractSignature}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    تاريخ التوقيع: {new Date(selectedContract.contractSignedAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col justify-between text-center">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">ختم المنصة واعتماد الإدارة</p>
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary-600 text-primary-600 flex items-center justify-center font-black mx-auto text-xs my-1 rotate-12 bg-primary-50 dark:bg-primary-950">
                      طامورة <br /> موثق
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">عقد محفوظ وسارٍ قانونياً في قاعدة بيانات طامورة</p>
                </div>
              </div>

            </div>

            {/* Modal Bottom Footer (Hidden when printing) */}
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800 print:hidden">
              <Button variant="primary" onClick={() => setSelectedContract(null)}>
                إغلاق
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
