'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle, KeyRound } from 'lucide-react';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import PinInput from '@/components/ui/PinInput';
import { API_BASE } from '@/config/api';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

export default function PinVerifyPage() {
  const router = useRouter();
  const { t } = useThemeLanguage();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [attempts] = useState(0);
  const maxAttempts = 5;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      setUserId(user.id);
    }
  }, []);

  const handlePinComplete = async (pin: string) => {
  setError('');
  setIsLoading(true);

  try {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log(' Sending PIN verification request...');
    console.log('📦 Data:', { userId: user.id, pin });

    const response = await fetch(`${API_BASE}/auth/verify-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user.id,
        pin: pin,
      }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response OK:', response.ok);
    console.log('📡 Response headers:', response.headers);

    const responseData = await response.json();
    console.log('📦 Response data:', responseData);

    if (response.ok) {
      console.log('✅ PIN verified successfully');
      localStorage.setItem('pinVerified', 'true');
      router.push('/dashboard');
    } else {
      console.error(' PIN verification failed:', responseData);
      setError(responseData.message || responseData.error || 'الـ PIN غير صحيح');
    }
  } catch (error) {
    console.error(' Error verifying PIN:', error);
    setError('حدث خطأ في الاتصال بالخادم');
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
              <KeyRound className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pinVerify.title')}</h1>
            <p className="text-gray-600 dark:text-slate-300">{t('pinVerify.subtitle')}</p>
          </div>

          <Card className="p-8 shadow-xl">
            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-error flex-shrink-0 mt-0.5" size={20} />
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="text-center">
                <Shield className="mx-auto text-primary-600 mb-3" size={40} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('pinVerify.enterPin')}</h2>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  {t('pinVerify.protectDesc')}
                </p>
              </div>

              <PinInput length={6} onComplete={handlePinComplete} disabled={isLoading} />

              {attempts > 0 && (
                <div className="text-center text-sm text-gray-500">
                  {t('pinVerify.attempts')} {attempts} / {maxAttempts}
                </div>
              )}

              <div className="border-t pt-6 mt-6 border-slate-100 dark:border-slate-800">
                <p className="text-center text-sm text-gray-600 dark:text-slate-300 mb-3">
                  {t('pinVerify.trouble')}
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => router.push('/auth/login')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {t('pinVerify.switchLogin')}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button 
                    onClick={() => alert(t('pinVerify.forgotPin'))}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {t('pinVerify.forgotPin')}
                  </button>
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-slate-300">
                {t('pinVerify.verifying')}
              </div>
            )}
          </Card>

          {/* Security Info */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
              <Shield size={14} className="text-success" />
              <span>{t('pinVerify.encrypted')}</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}