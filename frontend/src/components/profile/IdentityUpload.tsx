'use client';
import { useState, useRef } from 'react';
import {
  FileText, Upload, CheckCircle, AlertCircle,
  Clock, XCircle, Image as ImageIcon, RefreshCw
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { API_BASE } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

type IdStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface IdentityUploadProps {
  status: IdStatus;
  front: string | null;
  back: string | null;
  rejectReason: string | null;
  onStatusChange: () => void;
}

export default function IdentityUpload({
  status,
  front,
  back,
  rejectReason,
  onStatusChange,
}: IdentityUploadProps) {
  const { token } = useAuth();
  const { lang } = useThemeLanguage();
  const isEn = lang === 'en';
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(front ? `${API_BASE}${front}` : null);
  const [backPreview, setBackPreview] = useState<string | null>(back ? `${API_BASE}${back}` : null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(isEn ? 'Only JPG, PNG, WEBP files are allowed' : 'يُسمح فقط بملفات JPG, PNG, WEBP');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(isEn ? 'File size must not exceed 5MB' : 'حجم الملف يجب ألا يتجاوز 5MB');
      return false;
    }
    setError('');
    return true;
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) return;

    if (side === 'front') {
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
    } else {
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!frontFile || !backFile) {
      setError('يجب اختيار الصورتين الأمامية والخلفية');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('front', frontFile);
      formData.append('back', backFile);

      const res = await fetch(`${API_BASE}/users/upload-identity`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل رفع الملفات');

      onStatusChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // حالة: موافق عليه
  if (status === 'approved') {
    return (
      <Card className="p-6 border-success/30 bg-success/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-success" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">{isEn ? 'Identity Verification' : 'التحقق من الهوية'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{isEn ? 'Your ID document has been approved' : 'تمت الموافقة على وثيقتك'}</p>
          </div>
          <Badge variant="success">{isEn ? 'Verified ✓' : 'موثّق ✓'}</Badge>
        </div>
      </Card>
    );
  }

  // حالة: قيد المراجعة
  if (status === 'pending') {
    return (
      <Card className="p-6 border-warning/30 bg-warning/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
            <Clock className="text-warning" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">{isEn ? 'Identity Verification' : 'التحقق من الهوية'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{isEn ? 'Your document is under admin review' : 'وثيقتك قيد مراجعة الإدارة'}</p>
          </div>
          <Badge variant="warning">{isEn ? 'Pending Review' : 'قيد المراجعة'}</Badge>
        </div>
      </Card>
    );
  }

  // حالة: مرفوض أو لم يرفع
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
          <FileText className="text-gray-500 dark:text-slate-400" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white">{isEn ? 'Identity Verification' : 'التحقق من الهوية'}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{isEn ? 'Upload your ID photo for verification' : 'ارفع صورة هويتك للتحقق'}</p>
        </div>
        {status === 'rejected' && <Badge variant="error">{isEn ? 'Rejected' : 'مرفوض'}</Badge>}
      </div>

      {status === 'rejected' && rejectReason && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2 text-sm">
          <XCircle className="text-error flex-shrink-0 mt-0.5" size={16} />
          <div>
            <p className="text-error font-medium">{isEn ? 'Rejection reason:' : 'سبب الرفض:'}</p>
            <p className="text-gray-700 dark:text-slate-300">{rejectReason}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 text-error text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* الصورة الأمامية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {isEn ? 'Front Side' : 'الوجه الأمامي'}
          </label>
          <div
            onClick={() => frontInputRef.current?.click()}
            className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all overflow-hidden"
          >
            {frontPreview ? (
              <>
                <img src={frontPreview} alt={isEn ? 'Front Side' : 'الوجه الأمامي'} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <RefreshCw className="text-white" size={24} />
                </div>
              </>
            ) : (
              <>
                <ImageIcon className="text-gray-400 mb-2" size={32} />
                <span className="text-xs text-gray-500">{isEn ? 'Click to select' : 'اضغط للاختيار'}</span>
              </>
            )}
          </div>
          <input
            ref={frontInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={e => handleFileSelect(e, 'front')}
            className="hidden"
          />
        </div>

        {/* الصورة الخلفية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {isEn ? 'Back Side' : 'الوجه الخلفي'}
          </label>
          <div
            onClick={() => backInputRef.current?.click()}
            className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all overflow-hidden"
          >
            {backPreview ? (
              <>
                <img src={backPreview} alt={isEn ? 'Back Side' : 'الوجه الخلفي'} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <RefreshCw className="text-white" size={24} />
                </div>
              </>
            ) : (
              <>
                <ImageIcon className="text-gray-400 mb-2" size={32} />
                <span className="text-xs text-gray-500">{isEn ? 'Click to select' : 'اضغط للاختيار'}</span>
              </>
            )}
          </div>
          <input
            ref={backInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={e => handleFileSelect(e, 'back')}
            className="hidden"
          />
        </div>
      </div>

      <Button
        onClick={handleUpload}
        isLoading={isUploading}
        disabled={!frontFile || !backFile}
        className="w-full"
      >
        <Upload size={18} className="ml-2" />
        {isEn ? 'Upload Documents for Verification' : 'رفع الوثائق للتحقق'}
      </Button>

      <p className="text-xs text-gray-500 dark:text-slate-400 mt-3 text-center">
        {isEn
          ? 'Allowed formats: JPG, PNG, WEBP — Max size: 5MB per image'
          : 'الصيغ المقبولة: JPG, PNG, WEBP — الحد الأقصى: 5MB لكل صورة'}
      </p>
    </Card>
  );
}
