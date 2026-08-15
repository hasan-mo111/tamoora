'use client';
import { useState, useRef } from 'react';
import { Mail, CheckCircle, AlertCircle, Send, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { API_BASE } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

interface EmailVerificationProps {
  email: string;
  verified: boolean;
  onVerified: () => void;
}

export default function EmailVerification({ email, verified, onVerified }: EmailVerificationProps) {
  const { token } = useAuth();
  const { lang } = useThemeLanguage();
  const isEn = lang === 'en';
  const [code, setCode] = useState<string[]>(new Array(6).fill(''));
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

const sendCode = async () => {
  setError('');
  setSuccess('');
  setIsSending(true);
  
  try {
    const res = await fetch(`${API_BASE}/users/send-email-code`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.message || 'فشل إرسال الرمز');
    
    setCodeSent(true);
    
    // ✅ إذا كان الكود موجود في الـ Response (Demo Mode)
    if (data.code) {
      setSuccess(`وضع تجريبي - رمز التحقق: ${data.code}`);
      // ✅ املأ الحقول تلقائياً
      const digits = data.code.split('');
      setCode(digits);
    } else {
      setSuccess('تم إرسال الرمز. تحقق من بريدك الإلكتروني.');
    }
    
    startCooldown();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsSending(false);
  }
};

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // تحقق تلقائي عند اكتمال الرمز
    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      verifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (fullCode: string) => {
    setError('');
    setIsVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/users/verify-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'الرمز غير صحيح');

      setSuccess('تم التحقق من البريد بنجاح ✓');
      setTimeout(() => onVerified(), 1500);
    } catch (err: any) {
      setError(err.message);
      setCode(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  if (verified) {
    return (
      <Card className="p-6 border-success/30 bg-success/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-success" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">{isEn ? 'Email Address' : 'البريد الإلكتروني'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
          </div>
          <Badge variant="success">{isEn ? 'Verified ✓' : 'موثّق ✓'}</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
          <Mail className="text-warning" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white">{isEn ? 'Email Verification' : 'التحقق من البريد'}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
        </div>
        <Badge variant="warning">{isEn ? 'Unverified' : 'غير موثّق'}</Badge>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 text-error text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2 text-success text-sm">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {!codeSent ? (
        <Button
          onClick={sendCode}
          isLoading={isSending}
          className="w-full"
        >
          <Send size={18} className="ml-2" />
          {isEn ? 'Send Verification Code' : 'إرسال رمز التحقق'}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 justify-center" dir="ltr">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={ref => { inputRefs.current[idx] = ref; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleCodeChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                disabled={isVerifying}
                className="w-11 h-13 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <button
              onClick={sendCode}
              disabled={cooldown > 0 || isSending}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {cooldown > 0 ? (
                <>
                  <Clock size={14} />
                  {isEn ? `Resend (${cooldown}s)` : `إعادة الإرسال (${cooldown}ث)`}
                </>
              ) : (
                isEn ? 'Resend Code' : 'إعادة إرسال الرمز'
              )}
            </button>
            <button
              onClick={() => {
                setCodeSent(false);
                setCode(new Array(6).fill(''));
                setError('');
                setSuccess('');
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {isEn ? 'Change Email' : 'تغيير البريد'}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
