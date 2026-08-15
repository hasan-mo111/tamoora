'use client';
import { useState } from 'react';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

export default function FAQPage() {
  const { t, lang } = useThemeLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const isEn = lang === 'en';

  const faqs = [
    {
      question: isEn ? 'What is Tamoura Platform?' : 'ما هي منصة طامورة؟',
      answer: isEn
        ? 'Tamoura is an official collaborative investment platform allowing participants to partner in real commercial projects with periodic profits under transparent legal frameworks.'
        : 'طامورة هي منصة استثمارية وتجارية تشاركية رسمية تتيح للمشتركين المساهمة في مشاريع وصفقات تجارية حقيقية بعوائد دورية واضحة تحت أطر قانونية وتشغيلية تضمن حقوق الجميع.',
    },
    {
      question: isEn ? 'How do I start investing?' : 'كيف أبدأ الاستثمار في المنصة؟',
      answer: isEn
        ? '1) Register an account, 2) Complete identity verification and set your security PIN, 3) Deposit funds to your wallet (USDT or Cash), 4) Choose your preferred available deal, 5) Record daily attendance and receive your profits!'
        : 'الخطوات بسيطة: 1) سجّل حساباً جديداً، 2) أكمل التحقق من الهوية وقم بإعداد رمز الأمان (PIN)، 3) أودع رصيدك في المحفظة (USDT أو كاش)، 4) اختر الصفقة المناسبة لك من الصفقات المتاحة، 5) واظب على تسجيل الحضور اليومي واستلم أرباحك دورياً!',
    },
    {
      question: isEn ? 'What is the minimum investment?' : 'ما هو الحد الأدنى للاستثمار؟',
      answer: isEn
        ? 'The minimum investment is $50 for daily/weekly plans, and $500 for monthly plans.'
        : 'الحد الأدنى للاستثمار هو 50$ للخطط والصفقات اليومية، و500$ للخطط والصفقات الشهرية. نوفر باقات متنوعة تناسب مختلف المستثمرين ورؤوس الأموال.',
    },
    {
      question: isEn ? 'How are profits distributed and withdrawn?' : 'كيف يتم توزيع وسحب الأرباح؟',
      answer: isEn
        ? 'Profits activate 24 hours after subscription with daily attendance confirmation. Participants can withdraw up to 80% of net profits on weekly or monthly cycles, while full capital release (100%) occurs upon completing the 4-month investment cycle.'
        : 'يبدأ تفعيل الأرباح بعد 24 ساعة من الاشتراك وتأكيد الحضور اليومي. ويحق للمشترك سحب أرباحه بنسبة تصل إلى 80% من صافي الأرباح المحققة بشكل دوري (أسبوعي أو شهري)، بينما تبلغ مدة دورة الاستثمار الأساسية 4 أشهر لتحرير كامل رأس المال والأرباح المتبقية بنسبة 100%.',
    },
    {
      question: isEn ? 'What are the platform management fees?' : 'ما هي رسوم إدارة المشاريع والتحوط؟',
      answer: isEn
        ? 'As outlined in Article 3 of the Terms, the company deducts a one-time 25% fee per plan/deal covering economic management, operations, monitoring, and the protective hedge fund buffer.'
        : 'وفقاً للمادة 3 من الشروط والأحكام، تتقاضى الشركة نسبة 25% كرسوم إدارة ومتابعة وتنفيذ وصندوق تحوط تقتطع لمرة واحدة فقط عن كل خطة أو استثمار.',
    },
    {
      question: isEn ? 'Are my funds and account secure?' : 'هل أموالي وبيانات حسابي آمنة في المنصة؟',
      answer: isEn
        ? 'Yes, all data and transactions are protected with high-level encryption, a 6-digit security PIN for operations, and official electronic receipts with unique transaction hashes.'
        : 'نعم، نستخدم أعلى معايير التشفير والأمان لحماية بياناتك ومحفظتك، مع رمز PIN أمان سري مكون من 6 أرقام لتأكيد العمليات، وتوثيق إلكتروني كامل لكافة الصفقات والإيصالات.',
    },
    {
      question: isEn ? 'How long do withdrawal requests take?' : 'كم تستغرق معالجة طلبات السحب؟',
      answer: isEn
        ? 'Withdrawals are audited and processed rapidly within business hours, and USDT transactions are delivered directly to your verified external wallet address upon admin approval.'
        : 'تتم مراجعة ومعالجة طلبات السحب بسرعة وموثوقية، ويتم إرسال العملات الرقمية (USDT) إلى عنوان محفظتك المعتمد فور موافقة الإدارة.',
    },
    {
      question: isEn ? 'What deposit and payment methods are available?' : 'ما هي طرق الإيداع والدفع المتاحة؟',
      answer: isEn
        ? 'We support cryptocurrency deposits in USDT (via OxaPay gateway or TRC20, ERC20, BEP20) as well as direct cash deposit requests with admin verification.'
        : 'نقبل الإيداع عبر العملات الرقمية USDT (من خلال بوابة OxaPay الإلكترونية أو شبكات TRC20, ERC20, BEP20) بالإضافة إلى خيار طلب الإيداع النقدي (كاش) المعتمد من الإدارة.',
    },
    {
      question: isEn ? 'How can I contact the support team?' : 'كيف يمكنني التواصل مع الدعم الفني؟',
      answer: isEn
        ? 'You can reach us at info@tamoura.com or submit a support inquiry directly through your account dashboard.'
        : 'يمكنك التواصل معنا عبر البريد الإلكتروني info@tamoura.com أو من خلال وسائل التواصل المعتمدة داخل المنصة. فريق الدعم متاح لمساعدتكم.',
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-600 to-primary-500 text-white py-16">
        <Container className="text-center">
          <Badge variant="secondary" className="bg-white/20 text-white border border-white/30 mb-6">
            {t('faq.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {t('faq.title')}
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <Container size="lg">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card
                  key={index}
                  className="p-6 cursor-pointer hover:shadow-lg transition-all"
                  hover={true}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between text-start"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <HelpCircle className="text-primary-600 dark:text-primary-400 flex-shrink-0" size={20} />
                      <h3 className="font-bold text-gray-900 dark:text-white">{faq.question}</h3>
                    </div>
                    <ChevronDown
                      className={`text-gray-400 transition-transform ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                      size={20}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                      <p className="text-gray-600 dark:text-slate-300 leading-relaxed pr-8">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Contact CTA */}
            <Card className="mt-12 p-8 bg-gradient-to-br from-primary-50 to-white dark:from-slate-800 dark:to-slate-800/80 text-center">
              <HelpCircle className="text-primary-600 dark:text-primary-400 mx-auto mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('faq.stillQuestions')}
              </h2>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                {t('faq.supportTeamDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:info@tamoura.com">
                  <Button size="lg">{t('faq.contactBtn')}</Button>
                </a>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg">{t('nav.login')}</Button>
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}