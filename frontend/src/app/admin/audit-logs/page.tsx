'use client';

import { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  User, 
  ShieldAlert, 
  Clock, 
  Globe, 
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '@/utils/api';

interface AuditLog {
  id: string;
  adminId?: string;
  adminEmail?: string;
  action: string;
  targetUserId?: string;
  targetUserEmail?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs?limit=200');
      if (Array.isArray(res)) {
        setLogs(res);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'APPROVE_WITHDRAW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> قبول سحب</span>;
      case 'REJECT_WITHDRAW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit"><XCircle size={12} /> رفض سحب</span>;
      case 'APPROVE_IDENTITY':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1 w-fit"><ShieldAlert size={12} /> قبول هوية</span>;
      case 'REJECT_IDENTITY':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit"><XCircle size={12} /> رفض هوية</span>;
      case 'MANUAL_BALANCE_UPDATE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1 w-fit"><ArrowRightLeft size={12} /> تعديل رصيد يدوي</span>;
      case 'DEPOSIT_VERIFIED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> اعتماد إيداع</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 flex items-center gap-1 w-fit"><AlertCircle size={12} /> {action}</span>;
    }
  };

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      (log.adminEmail && log.adminEmail.toLowerCase().includes(term)) ||
      (log.targetUserEmail && log.targetUserEmail.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.reason && log.reason.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-primary-600" />
            سجل التدقيق الأمني والعمليات (Audit Logs)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            توثيق دقيق وشامل لجميع العمليات الإدارية الحساسة والمالية لضمان الأمان والمساءلة
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors border border-gray-200"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          تحديث السجل
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400 mr-2" size={20} />
        <input
          type="text"
          placeholder="ابحث بالبريد الإلكتروني للآدمن أو المستخدم، أو نوع العملية..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">جاري تحميل سجل التدقيق...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">لا توجد سجلات تدقيق مطابقة</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500">
                  <th className="py-3.5 px-4">التاريخ والوقت</th>
                  <th className="py-3.5 px-4">العملية</th>
                  <th className="py-3.5 px-4">منفذ العملية (الآدمن)</th>
                  <th className="py-3.5 px-4">المستخدم المستهدف</th>
                  <th className="py-3.5 px-4">السبب / الملاحظات</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4 text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-400" />
                        {new Date(log.createdAt).toLocaleString('ar-SA')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900 whitespace-nowrap">
                      {log.adminEmail || log.adminId || 'النظام (تلقائي)'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                      {log.targetUserEmail || log.targetUserId || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 max-w-xs truncate">
                      {log.reason || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Globe size={11} /> {log.ipAddress || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1 text-xs bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium transition-colors"
                      >
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <FileText className="text-primary-600" size={20} />
                تفاصيل سجل التدقيق
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                <p className="text-xs text-gray-500">نوع العملية:</p>
                <div>{getActionBadge(selectedLog.action)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500">منفذ العملية:</p>
                  <p className="font-semibold text-gray-800 text-xs mt-0.5">{selectedLog.adminEmail || 'النظام'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500">المستهدف:</p>
                  <p className="font-semibold text-gray-800 text-xs mt-0.5">{selectedLog.targetUserEmail || '-'}</p>
                </div>
              </div>

              {selectedLog.reason && (
                <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl">
                  <p className="text-xs font-semibold text-amber-800">السبب / الملاحظة:</p>
                  <p className="text-xs text-amber-900 mt-1">{selectedLog.reason}</p>
                </div>
              )}

              {selectedLog.oldValue && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">القيمة السابقة (Old Value):</p>
                  <pre className="bg-gray-900 text-emerald-400 p-3 rounded-xl text-xs overflow-x-auto font-mono">
                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">القيمة الجديدة (New Value):</p>
                  <pre className="bg-gray-900 text-cyan-400 p-3 rounded-xl text-xs overflow-x-auto font-mono">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl text-sm transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
