'use client';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: 'البيانات التي نجمعها',
      content: 'نقوم بجمع البيانات الشخصية الأساسية مثل الاسم، البريد الإلكتروني، رقم الهاتف، ومعلومات الحساب المالي. هذه البيانات ضرورية لتقديم خدماتنا وتحسين تجربتك.',
    },
    {
      icon: Lock,
      title: 'كيف نحمي بياناتك',
      content: 'نستخدم تقنيات تشفير متقدمة (SSL/TLS) لحماية جميع البيانات المنقولة. كلمات المرور مشفرة باستخدام خوارزميات قوية، ولا نشارك بياناتك مع أي طرف ثالث.',
    },
    {
      icon: Eye,
      title: 'استخدام البيانات',
      content: 'تُستخدم بياناتك فقط لتقديم الخدمات، معالجة المعاملات، إرسال إشعارات مهمة، وتحسين منصتنا. لن نبيع أو نؤجر بياناتك لأي جهة خارجية.',
    },
    {
      icon: UserCheck,
      title: 'حقوقك',
      content: 'لديك الحق في الوصول إلى بياناتك، تصحيحها، أو طلب حذفها في أي وقت. يمكنك أيضاً إلغاء اشتراكك في الرسائل التسويقية بسهولة.',
    },
    {
      icon: Shield,
      title: 'ملفات تعريف الارتباط',
      content: 'نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك وتذكر تفضيلاتك. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-600 to-primary-500 text-white py-16">
        <Container className="text-center">
          <Badge variant="secondary" className="bg-white/20 text-white border border-white/30 mb-6">
            الخصوصية والأمان
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            سياسة الخصوصية
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            نلتزم بحماية بياناتك الشخصية وخصوصيتك الكاملة
          </p>
        </Container>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <Container size="lg">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <Card className="mb-8 p-8 bg-gradient-to-br from-primary-50 to-white border-r-4 border-primary-500">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="text-primary-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">التزامنا بخصوصيتك</h2>
                  <p className="text-gray-700 leading-relaxed">
                    في منصة طامورة، نأخذ خصوصيتك على محمل الجد. هذه السياسة توضح كيف نجمع
                    ونستخدم ونحمي معلوماتك الشخصية عند استخدامك لمنصتنا.
                  </p>
                </div>
              </div>
            </Card>

            {/* Sections */}
            <div className="space-y-6 mb-8">
              {sections.map((section, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-all">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <section.icon className="text-primary-600" size={24} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Contact Section */}
            <Card className="p-8 bg-gradient-to-br from-success/5 to-white border-2 border-success/20 text-center">
              <Shield className="text-success mx-auto mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                أسئلة حول الخصوصية؟
              </h2>
              <p className="text-gray-600 mb-6">
                إذا كان لديك أي استفسارات حول سياسة الخصوصية، لا تتردد في التواصل معنا
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:privacy@tamoura.com">
                  <button className="bg-success hover:bg-success/90 text-white px-8 py-3 rounded-xl font-semibold transition-all">
                    تواصل مع فريق الخصوصية
                  </button>
                </a>
                <Link href="/terms">
                  <button className="bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600 px-8 py-3 rounded-xl font-semibold transition-all">
                    الشروط والأحكام
                  </button>
                </Link>
              </div>
            </Card>

            {/* Last Updated */}
            <div className="text-center mt-8 text-gray-500 text-sm">
              <p>آخر تحديث: {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}