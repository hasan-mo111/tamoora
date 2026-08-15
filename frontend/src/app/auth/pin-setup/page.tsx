'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import Container from '@/components/layout/Container';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PinInput from '@/components/ui/PinInput';
import { API_BASE } from '@/config/api';
export default function PinSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFirstPinComplete = (pin: string) => {
    if (pin.length === 6) {
      setFirstPin(pin);
      setError('');
      setTimeout(() => setStep(2), 300);
    }
  };

const handleConfirmPinComplete = async (pin: string) => {
  setError('');
  if (pin !== firstPin) {
    setError('الـ PIN غير متطابق. يرجى المحاولة مرة أخرى.');
    setStep(1);
    return;
  }
  setIsLoading(true);
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE}/auth/set-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user.id, // ✅ إضافة userId!
        pin: pin,
      }),
    });
    if (response.ok) {
      localStorage.setItem('pinVerified', 'true'); // ✅ مهم جداً!
      router.push('/dashboard');
    } else {
      throw new Error('فشل في حفظ الـ PIN');
    }
  } catch (err) {
    console.error(err);
    setError('حدث خطأ أثناء حفظ الـ PIN');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12">
      <Container>
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إعداد رمز الأمان</h1>
            <p className="text-gray-600">
              {step === 1 
                ? 'أدخل رمزاً مكوناً من 6 أرقام لحماية حسابك' 
                : 'أعد إدخال نفس الرمز للتأكيد'}
            </p>
          </div>

          <Card className="p-8 shadow-xl">
            {/* Progress Indicator */}
            <div className="flex justify-center gap-2 mb-8">
              <div className={`h-1.5 w-16 rounded-full transition-all ${step >= 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
              <div className={`h-1.5 w-16 rounded-full transition-all ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-error flex-shrink-0 mt-0.5" size={20} />
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Lock className="mx-auto text-primary-600 mb-3" size={32} />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">الخطوة 1: أدخل الـ PIN</h2>
                  <p className="text-sm text-gray-600">
                    اختر 6 أرقام سهلة التذكر ولكن يصعب تخمينها
                  </p>
                </div>

                <PinInput key="pin-input-step1" length={6} onComplete={handleFirstPinComplete} />

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-800">
                  <p className="font-medium mb-1">نصائح لاختيار PIN آمن:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>تجنب استخدام تاريخ الميلاد أو أرقام متسلسلة</li>
                    <li>لا تشارك الـ PIN مع أي شخص</li>
                    <li>احفظه في مكان آمن</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="mx-auto text-success mb-3" size={32} />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">الخطوة 2: تأكيد الـ PIN</h2>
                  <p className="text-sm text-gray-600">
                    أعد إدخال نفس الرمز للتأكد من حفظه بشكل صحيح
                  </p>
                </div>

                <PinInput key="pin-input-step2" length={6} onComplete={handleConfirmPinComplete} disabled={isLoading} />

                <div className="text-center text-sm text-gray-500">
                  <button 
                    onClick={() => { setStep(1); setError(''); setFirstPin(''); }}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    ← تغيير الـ PIN
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="mt-6 text-center text-sm text-gray-600">
                جاري حفظ الـ PIN بأمان...
              </div>
            )}
          </Card>
        </div>
      </Container>
    </div>
  );
}