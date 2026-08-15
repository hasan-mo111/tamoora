'use client';

import { useState } from 'react';
import { CheckCircle, ArrowRight, FileText, Shield, Scale } from 'lucide-react';
import Container from '@/components/layout/Container';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

export default function TermsPage() {
  const [agreed, setAgreed] = useState(false);
  const { lang } = useThemeLanguage();
  const isEn = lang === 'en';

  const officialTerms = [
    {
      id: 1,
      title: isEn ? 'Article 1: Single Account & Multiple Projects' : 'المادة 1: الحساب الواحد والمشروعات المتعددة',
      content: isEn
        ? 'The participant is entitled to open only one account, through which they can subscribe to available investment plans and projects matching their capital according to operational guidelines.'
        : 'يحق للمشترك فتح حساب واحد فقط يتم من خلاله الاشتراك بالخطط والاستثمارات بما يتناسب مع رأس ماله، حيث يمكنه الاشتراك بأكثر من خطة أو مشروع وفق برامج العمل المتاحة.',
    },
    {
      id: 2,
      title: isEn ? 'Article 2: Account Privacy & Security' : 'المادة 2: خصوصية وأمان الحسابات',
      content: isEn
        ? 'The participant bears full responsibility for maintaining the confidentiality of account credentials and security PIN, and agrees not to share them with any third party to ensure data protection and prevent errors.'
        : 'يتحمل المشترك كامل المسؤولية عن سرية بيانات حسابه ورمز الأمان (PIN) وعدم مشاركتها مع أي طرف آخر لضمان الحماية ومنع الأخطاء التقنية.',
    },
    {
      id: 3,
      title: isEn ? 'Article 3: Management Fees & Hedge Fund (25%)' : 'المادة 3: رسوم الإدارة وصندوق التحوط (25%)',
      isRed: true,
      content: isEn
        ? 'All commercial operations are exclusively planned and executed by the company’s economic team. The company receives a one-time 25% fee per investment plan covering management, monitoring, execution, and hedge buffer.'
        : 'يتم تخطيط وتنظيم وإدارة المشاريع من قبل الفريق الاقتصادي في الشركة حصراً، وتتقاضى الشركة نسبة (25%) كرسوم إدارة ومتابعة وتنفيذ وصندوق تحوط تقتطع لمرة واحدة عن كل خطة أو استثمار.',
    },
    {
      id: 4,
      title: isEn ? 'Article 4: Plan Activation & Profit Calculation' : 'المادة 4: تفعيل الخطط واحتساب الأرباح',
      content: isEn
        ? 'Approved profit plans activate 24 hours after deposit and subscription confirmation. Profits are distributed in accordance with the specified schedule of each plan.'
        : 'يتم تفعيل خطة الأرباح المعتمدة في الصفقات والاستثمارات بعد مضي 24 ساعة من تأكيد الاشتراك والإيداع، وتُوزع الأرباح وفق الجداول الزمنية لكل خطة.',
    },
    {
      id: 5,
      title: isEn ? 'Article 5: Daily Tasks & Compliance' : 'المادة 5: المهام اليومية والالتزام',
      content: isEn
        ? 'Where daily tasks are assigned under a plan, delay or failure to complete a daily task results in withholding profits for that specific day only, without affecting other days.'
        : 'في حال وجود مهام يومية محددة ضمن الخطة، فإن التأخر أو الامتناع عن تفعيل المهمة في يوم ما يؤدي إلى تعليق أرباح ذلك اليوم المحدد فقط دون المساس بباقي الأيام.',
    },
    {
      id: 6,
      title: isEn ? 'Article 6: Profit Withdrawal Limit (80% Net Profit)' : 'المادة 6: ضوابط سحب الأرباح (80% من صافي الأرباح)',
      isRed: true,
      content: isEn
        ? 'The participant is entitled to withdraw up to 80% of net earned profits during the active subscription period, on weekly or monthly cycles via approved financial gateways.'
        : 'يحق للمشترك سحب أرباحه بنسبة تصل إلى 80% من صافي الأرباح المحققة أثناء سريان مدة الاشتراك، بشكل دوري (أسبوعي أو شهري) عبر القنوات المالية المعتمدة.',
    },
    {
      id: 7,
      title: isEn ? 'Article 7: Investment Term & Capital Release (4 Months)' : 'المادة 7: فترة الاستثمار وتحرير رأس المال (4 أشهر)',
      content: isEn
        ? 'The standard investment cycle is four (4) months from the subscription date. Upon completion, the participant may withdraw 100% of capital and remaining profits. In case of early exit, profit accrual stops immediately and the original principal is refunded only after the 4-month period expires.'
        : 'مدة دورة الاستثمار الأساسية هي أربعة (4) أشهر من تاريخ الاشتراك، وبعد انقضائها يحق للمشترك سحب كامل رأس المال والأرباح المتبقية (100%). وفي حال طلب الانسحاب المبكر، تتوقف الأرباح فوراً ويُعاد رأس المال الأصلي فقط بعد انقضاء مدة الأربعة أشهر.',
    },
    {
      id: 8,
      title: isEn ? 'Article 8: Non-Cumulative Profits & Re-subscription' : 'المادة 8: عدم تراكمية الأرباح وإعادة الاشتراك',
      content: isEn
        ? 'Profits are non-cumulative by default. Activating new plans requires manual allocation. Participants may re-subscribe to any available plans upon completion of their investment term.'
        : 'الأرباح غير تراكمية تلقائياً؛ ولتفعيل خطط جديدة يتوجب تخصيص المبالغ المطلوبة. كما يحق للمشترك إعادة الاشتراك بعد انتهاء دورته الاستثمارية وفق الشروط السائدة.',
    },
    {
      id: 9,
      title: isEn ? 'Article 9: Misconduct & Breach of Terms' : 'المادة 9: حالات الإخلال وسوء الاستخدام',
      content: isEn
        ? 'Platform management reserves the right to suspend any account and void illegitimate profits in the event of manipulation or system abuse, returning the original principal balance.'
        : 'تحتفظ إدارة المنصة بالحق في إيقاف أي حساب وإلغاء الأرباح الناتجة عن أي تلاعب أو إساءة استخدام لأنظمة المنصة، مع إعادة رأس المال الأصلي لصاحبه وفق الأصول.',
    },
    {
      id: 10,
      title: isEn ? 'Article 10: Legal Nature & Binding Agreement' : 'المادة 10: الطبيعة القانونية والتحكيم',
      content: isEn
        ? 'This electronic contract and all related platform receipts constitute an official legally binding agreement between both parties subject to commercial participatory laws.'
        : 'يُعد هذا العقد والإيصالات والبيانات الإلكترونية الصادرة عن المنصة وثائق رسمية ملزمة للطرفين، وتخضع لأحكام وقوانين الأعمال التجارية التشاركية.',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-16 relative overflow-hidden">
        <Container className="relative z-10 text-center">
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border border-white/30 px-4 py-1.5 text-sm font-semibold mb-6 shadow-sm inline-flex items-center gap-2"
          >
            <Scale size={16} />
            {isEn ? 'Contract & General Terms' : 'العقد والشروط العامة'}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            {isEn ? 'General Terms and Conditions - Tamoora Platform' : 'الشروط والأحكام العامة - منصة طامورة'}
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto font-medium">
            {isEn
              ? 'Official Regulatory & Commercial Contract Document between Tamoora and Participants'
              : 'وثيقة العقد التنظيمي والتجاري المعتمد بين إدارة منصة طامورة والمشاركين'}
          </p>
        </Container>
      </section>

      {/* Terms Content */}
      <section className="py-12">
        <Container size="lg">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Introduction Card */}
            <Card className="p-8 bg-white dark:bg-slate-800 border-r-8 border-r-primary-600 border border-slate-200/80 dark:border-slate-700 shadow-sm rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={26} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isEn ? 'Partnership Agreement & Regulations' : 'اتفاقية الشراكة والأنظمة العامة'}
                  </h2>
                  <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed font-normal">
                    {isEn ? (
                      <>
                        This document establishes the governing operational and legal framework for all participatory projects and commercial plans on <strong className="text-primary-600 dark:text-primary-400">Tamoora</strong>, acting as an official binding agreement.
                      </>
                    ) : (
                      <>
                        تحدد هذه الوثيقة القواعد والأطر القانونية والتنفيذية الحاكمة لجميع العمليات والخطط التجارية والمشاريع التشاركية المطروحة عبر منصة <strong className="text-primary-600 dark:text-primary-400">طامورة</strong>، وتعتبر بمثابة عقد رسمي ملزم لجميع الأطراف.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </Card>

            {/* Featured Red Highlight Banner for Key Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-red-50 dark:bg-red-950/50 border-2 border-red-500 rounded-2xl shadow-md space-y-2">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-black text-xl">
                  <Shield size={24} className="text-red-600" />
                  {isEn ? 'Management Fees (25%)' : 'رسوم الإدارة (25%)'}
                </div>
                <p className="text-slate-900 dark:text-slate-100 font-bold text-base sm:text-lg leading-relaxed">
                  {isEn
                    ? 'Business activities are planned, organized, and executed exclusively by the company’s economic team. A one-time 25% management fee is deducted per plan.'
                    : 'يتم تخطيط وتنظيم وتنفيذ الأعمال التجارية من قبل الفريق الاقتصادي في الشركة حصراً وتحصل الشركة على نسبة (25)% كرسوم إدارة ومتابعة وتنفيذ وصندوق تحوط تقتطع لمرة واحدة عن كل خطة أو استثمار.'}
                </p>
              </div>

              <div className="p-6 bg-red-50 dark:bg-red-950/50 border-2 border-red-500 rounded-2xl shadow-md space-y-2">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-black text-xl">
                  <CheckCircle size={24} className="text-red-600" />
                  {isEn ? 'Profit Withdrawal (80% Net Profit)' : 'نسبة سحب الأرباح (80% صافي الربح)'}
                </div>
                <p className="text-slate-900 dark:text-slate-100 font-bold text-base sm:text-lg leading-relaxed">
                  {isEn
                    ? 'Participants have the right to withdraw up to 80% of net profits earned on weekly or monthly schedules.'
                    : 'يحق للمشترك سحب الأرباح بنسبة 80% من صافي الربح في الصفقات والاستثمارات بشكل أسبوعي أو شهري.'}
                </p>
              </div>
            </div>

            {/* Terms List */}
            <div className="space-y-4">
              {officialTerms.map((term) => {
                const isRed = term.isRed;
                return (
                  <Card
                    key={term.id}
                    className={`p-6 transition-all rounded-2xl shadow-sm ${
                      isRed
                        ? 'bg-red-50/90 dark:bg-red-950/60 border-2 border-red-500 shadow-md ring-2 ring-red-400/30'
                        : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-primary-400 dark:hover:border-primary-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-sm flex-shrink-0 mt-0.5 ${
                          isRed
                            ? 'bg-red-600 text-white ring-2 ring-red-300 dark:ring-red-800'
                            : 'bg-gradient-to-br from-primary-600 to-primary-700 text-white'
                        }`}
                      >
                        {term.id}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <h3
                          className={`text-lg sm:text-xl font-extrabold ${
                            isRed ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {term.title}
                        </h3>
                        <p
                          className={`text-base sm:text-[17px] leading-relaxed ${
                            isRed
                              ? 'text-slate-900 dark:text-slate-100 font-bold'
                              : 'text-slate-700 dark:text-slate-200 font-normal'
                          }`}
                        >
                          {term.content}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Acknowledgment & Consent Box */}
            <Card className="p-8 bg-gradient-to-br from-emerald-500/10 via-white to-primary-500/10 dark:from-slate-800 dark:to-slate-800/90 border-2 border-emerald-500/30 rounded-2xl shadow-md">
              <div className="text-center mb-6 space-y-3">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Shield size={34} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {isEn ? 'Acknowledgment & Consent' : 'الإقرار والموافقة'}
                </h2>
                <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-medium">
                  {isEn
                    ? '"By joining the platform after account creation, the participant acknowledges reading, understanding, and agreeing to all terms and conditions on the platform."'
                    : '"بانضمام المشترك إلى المنصة بعد إنشاء حسابه يقر بقراءته وفهمه وموافقته على جميع البنود والبيانات الموجودة ضمن المنصة."'
                  }
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Button
                  onClick={() => setAgreed(true)}
                  className={`${
                    agreed
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-primary-600 hover:bg-primary-700'
                  } text-white font-bold px-8 py-3 text-base`}
                  size="lg"
                >
                  <CheckCircle size={20} className="mx-2" />
                  {agreed
                    ? (isEn ? 'Consent Recorded ✓' : 'تم تسجيل الإقرار والموافقة ✓')
                    : (isEn ? 'I Agree to All Terms & Conditions' : 'موافق وأقر بجميع الشروط والأحكام')}
                </Button>

                <Link href="/auth/register">
                  <Button variant="outline" size="lg" className="font-bold px-8 py-3 text-base">
                    <ArrowRight size={20} className="mx-2" />
                    {isEn ? 'Proceed to Register' : 'المتابعة للتسجيل'}
                  </Button>
                </Link>
              </div>

              {agreed && (
                <div className="mt-6 p-4 bg-emerald-500/15 rounded-xl border border-emerald-500/30 text-center animate-fadeIn">
                  <p className="text-emerald-800 dark:text-emerald-300 font-bold text-base flex items-center justify-center gap-2">
                    <CheckCircle size={20} className="text-emerald-600" />
                    {isEn
                      ? 'Your agreement to the terms and conditions has been recorded successfully.'
                      : 'تم تسجيل إقرارك بموافقتك على اتفاقية الشروط والأحكام بنجاح.'}
                  </p>
                </div>
              )}
            </Card>

            {/* Footer Notice */}
            <div className="text-center mt-8 text-slate-500 dark:text-slate-400 text-xs">
              <p>
                {isEn
                  ? `Tamoora Platform for Participatory Commercial Business - All Rights Reserved © ${new Date().getFullYear()}`
                  : `منصة طامورة للأعمال التجارية التشاركية - جميع الحقوق محفوظة © ${new Date().getFullYear()}`}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
