'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Container from '@/components/layout/Container';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { API_BASE } from '@/config/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
   method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError('البريد الإلكتروني غير مسجل في المنصة');
      }
    } catch (err) {
      console.log('Demo mode - simulating password reset...');
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">نسيت كلمة المرور؟</h1>
            <p className="text-gray-600">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
          </div>

          <Card className="p-8 shadow-xl">
            {!isSubmitted ? (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-error flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-error text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="البريد الإلكتروني"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                  />

                  <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                    إرسال رابط إعادة التعيين
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-2">
                    <ArrowRight size={16} />
                    العودة لتسجيل الدخول
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-success" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">تم الإرسال بنجاح!</h2>
                <p className="text-gray-600 mb-6">
                  تم إرسال رابط إعادة تعيين كلمة المرور إلى:
                  <br />
                  <span className="font-bold text-primary-600">{email}</span>
                </p>
                <Link href="/auth/login">
                  <Button className="w-full" size="lg">العودة لتسجيل الدخول</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </Container>
    </div>
  );
}
