'use client';

import React from 'react';
import { Printer, X, ShieldCheck, CheckCircle2, Clock, AlertTriangle, FileText, Lock, QrCode } from 'lucide-react';
import CoinLogo from '@/components/layout/CoinLogo';
import Button from './Button';

export interface ReceiptData {
  id: string;
  type: 'deposit' | 'withdraw' | 'investment_purchase' | 'profit' | string;
  amount: number;
  status: 'completed' | 'pending' | 'rejected' | string;
  date: string;
  method?: string;
  network?: string;
  txHash?: string;
  userName?: string;
  userEmail?: string;
  notes?: string;
  investmentTitle?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

export default function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'deposit': return 'إيداع أموال (Deposit)';
      case 'withdraw': return 'سحب أرباح (Withdrawal)';
      case 'profit': return 'عوائد أرباح (Profit Return)';
      case 'investment_purchase':
      case 'investment':
        return 'شراء صفقة استثمارية (Deal Subscription)';
      default: return 'عملية مالية (Financial Transaction)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل ومعتمد (COMPLETED & VERIFIED)';
      case 'pending': return 'قيد المعالجة (PENDING)';
      case 'rejected': return 'مرفوض (REJECTED)';
      default: return status.toUpperCase();
    }
  };

  const currentDate = data.date ? new Date(data.date) : new Date();
  const formattedDate = currentDate.toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none print:bg-white print:text-black">
        
        {/* Top Actions (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 px-6 bg-slate-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="text-primary-600 dark:text-primary-400" size={20} />
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              وصل دفع رسمي معتمد (Official Receipt)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2">
              <Printer size={16} />
              <span>طباعة الوصل كـ PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* RECEIPT PRINTABLE CANVAS AREA */}
        <div className="p-8 sm:p-10 relative bg-white text-slate-900 print:p-6" id="printable-receipt">
          {/* Background Watermark Stamp */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <CoinLogo size={340} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-slate-800">
            <div className="flex items-center gap-3">
              <CoinLogo size={52} />
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">طامورة</h2>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">TAMOURA INVESTMENT PLATFORM</p>
                <p className="text-[11px] text-slate-500">منصة الاستثمار التشاركي والأعمال الناشئة</p>
              </div>
            </div>
            <div className="text-left">
              <div className="inline-block bg-slate-900 text-white font-mono text-xs px-3 py-1 rounded-md font-bold mb-1">
                إيصال رقم: #{data.id ? data.id.slice(-8).toUpperCase() : 'REC-9982'}
              </div>
              <p className="text-xs text-slate-500 font-medium">التاريخ: {formattedDate}</p>
            </div>
          </div>

          {/* Official Stamp Banner & Status */}
          <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-600/20">
                <ShieldCheck size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">نوع العملية المالية:</p>
                <h4 className="text-lg font-black text-slate-900">{getTypeName(data.type)}</h4>
              </div>
            </div>

            {/* Official Stamp Badge */}
            <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-xl shadow-md border border-emerald-500/40">
              <div className="w-8 h-8 rounded-full border-2 border-white/60 flex items-center justify-center font-bold text-[10px]">
                SEAL
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">طابع رسمي معتمد</p>
                <p className="text-xs font-extrabold">{getStatusText(data.status)}</p>
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <p className="text-xs font-medium text-slate-300 mb-1">المبلغ الصافي المؤكد (Net Amount)</p>
              <h3 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-400 dir-ltr">
                ${Number(data.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg text-white">USD</span>
              </h3>
            </div>
          </div>

          {/* Details Table */}
          <div className="mb-6 rounded-xl border border-slate-200 overflow-hidden text-sm">
            <div className="grid grid-cols-3 p-3 bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
              <div className="col-span-1">البيان</div>
              <div className="col-span-2">التفاصيل والمعلومات</div>
            </div>

            {data.userName && (
              <div className="grid grid-cols-3 p-3 border-b border-slate-100">
                <div className="col-span-1 font-semibold text-slate-600">اسم المستخدم:</div>
                <div className="col-span-2 font-bold text-slate-900">{data.userName}</div>
              </div>
            )}

            {data.userEmail && (
              <div className="grid grid-cols-3 p-3 border-b border-slate-100">
                <div className="col-span-1 font-semibold text-slate-600">البريد الإلكتروني:</div>
                <div className="col-span-2 font-mono text-slate-800">{data.userEmail}</div>
              </div>
            )}

            {data.investmentTitle && (
              <div className="grid grid-cols-3 p-3 border-b border-slate-100">
                <div className="col-span-1 font-semibold text-slate-600">اسم الصفقة:</div>
                <div className="col-span-2 font-bold text-primary-700">{data.investmentTitle}</div>
              </div>
            )}

            {(data.method || data.network) && (
              <div className="grid grid-cols-3 p-3 border-b border-slate-100">
                <div className="col-span-1 font-semibold text-slate-600">طريقة الدفع / الشبكة:</div>
                <div className="col-span-2 font-medium text-slate-800">{data.method || data.network}</div>
              </div>
            )}

            {data.txHash && (
              <div className="grid grid-cols-3 p-3 border-b border-slate-100">
                <div className="col-span-1 font-semibold text-slate-600">رمز المعاملة (TxHash):</div>
                <div className="col-span-2 font-mono text-xs break-all text-slate-700 dir-ltr text-right">{data.txHash}</div>
              </div>
            )}

            {data.notes && (
              <div className="grid grid-cols-3 p-3 border-b border-slate-100">
                <div className="col-span-1 font-semibold text-slate-600">الملاحظات:</div>
                <div className="col-span-2 text-slate-700">{data.notes}</div>
              </div>
            )}

            <div className="grid grid-cols-3 p-3 bg-slate-50">
              <div className="col-span-1 font-semibold text-slate-600">الحالة القانونية:</div>
              <div className="col-span-2 font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>إيصال مالي رسمي وموثّق إلكترونياً</span>
              </div>
            </div>
          </div>

          {/* Footer Signature & Stamp Seal */}
          <div className="pt-4 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-700 mb-1">الختم والتوقيع الإلكتروني:</p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-600 flex items-center justify-center bg-emerald-50 text-emerald-700 font-extrabold text-[9px] shadow-sm">
                  طامورة
                </div>
                <div>
                  <p className="font-extrabold text-slate-800">إدارة منصة طامورة</p>
                  <p className="text-[10px] text-slate-500">Tamoura Official Financial Stamp</p>
                </div>
              </div>
            </div>

            <div className="text-left flex flex-col items-end">
              <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center p-1 mb-1">
                <QrCode size={48} className="text-slate-800" />
              </div>
              <p className="text-[9px] font-mono text-slate-400">VERIFIED #{data.id ? data.id.slice(0, 10) : '8892'}</p>
            </div>
          </div>

          {/* Legal Note */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            تعتبر هذه الوثيقة إيصالاً إلكترونياً رسمياً صادراً عن منصة طامورة الاستثمارية، ولا تحتاج إلى توقيع خطي.
          </div>
        </div>

        {/* Footer Actions (Hidden in Print) */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex items-center justify-end gap-3 print:hidden">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
          <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            <Printer size={16} className="ml-2" />
            طباعة الوصل
          </Button>
        </div>
      </div>
    </div>
  );
}
