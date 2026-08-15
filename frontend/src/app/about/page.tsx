'use client';

import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Building2,
  Sparkles,
  PieChart,
  Briefcase,
  Store,
  Layers,
  Award,
  Wallet,
  Clock,
  Share2,
  FileCheck,
  HeartHandshake,
} from 'lucide-react';

export default function AboutPage() {
  const { lang } = useThemeLanguage();
  const isEn = lang === 'en';

  const businessSectors = [
    { title: isEn ? 'General Trading' : 'التجارة العامة', icon: Briefcase },
    { title: isEn ? 'Finishing Contracting & Real Estate' : 'تعهدات الإكساء والوساطة العقارية', icon: Building2 },
    { title: isEn ? 'Cafes & Restaurants' : 'المقاهي والمطاعم', icon: Store },
    { title: isEn ? 'Gifts & Toys Stores' : 'متاجر هدايا وألعاب الأطفال', icon: Sparkles },
    { title: isEn ? 'Wholesale & Retail Stores' : 'متاجر البيع بالجملة والتجزئة', icon: Layers },
    { title: isEn ? 'Cosmetics & Beauty Stores' : 'متاجر أدوات ومستحضرات التجميل', icon: Award },
    { title: isEn ? "Accessories & Women's Gifts" : 'الإكسسوار والهدايا النسائية', icon: Sparkles },
    { title: isEn ? 'Clothing Stores' : 'متاجر الألبسة', icon: Store },
    { title: isEn ? 'Books & Stationery' : 'الكتب والقرطاسية', icon: FileCheck },
    { title: isEn ? 'Perfumes & Fragrances' : 'تصنيع وبيع الروائح العطرية', icon: Sparkles },
    { title: isEn ? 'Produce & Grocery Stores' : 'متاجر بيع الخضار والفواكه', icon: Store },
    { title: isEn ? 'Gyms & Esports Centers' : 'صالات الألعاب الرياضية والإلكترونية', icon: Users },
    { title: isEn ? 'Pastries & Sweets Bakery' : 'صنع وبيع المعجنات والحلويات', icon: Store },
    { title: isEn ? 'Hot Beverages & Juice Bars' : 'المشروبات الساخنة والعصائر', icon: Store },
    { title: isEn ? 'Mobile Devices & Accessories' : 'أجهزة وإكسسوار الموبايل', icon: Layers },
    { title: isEn ? 'Housewares & Kitchenware' : 'الأدوات والأواني المنزلية', icon: Building2 },
    { title: isEn ? 'Grain & Agricultural Crops' : 'تجارة الحبوب والمحاصيل الزراعية', icon: TrendingUp },
    { title: isEn ? 'Poultry, Livestock & Professions' : 'المداجن والمباقر والمهن الحرة', icon: Briefcase },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <Container className="relative z-10 text-center">
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border border-white/30 px-4 py-1.5 text-sm font-semibold mb-6 shadow-sm inline-flex items-center gap-2"
          >
            <Sparkles size={16} />
            {isEn ? 'Tamoora Participatory Development Platform' : 'منصة طامورة التشاركية التنموية'}
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            {isEn
              ? 'Start Growing Your Income ..... Hand in Hand Goodness Multiplies'
              : 'ابدأ تنمية دخلك ..... إيد بأيد الخير بيزيد'}
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed font-medium">
            {isEn
              ? 'Short-term commercial solutions to grow individual income through innovative collective participation in real, active projects.'
              : 'حلول تجارية قصيرة الأجل لتنمية دخول الأفراد عبر المشاركة الجماعية المبتكرة في مشاريع واقعية نشطة.'}
          </p>
        </Container>
      </section>

      {/* 1. التعريف بالشركة */}
      <section className="py-16">
        <Container>
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="p-8 sm:p-10 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-md rounded-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center font-black text-xl">
                  1
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {isEn ? 'Company & Platform Overview' : 'التعريف بالشركة والمنصة'}
                  </h2>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                    {isEn
                      ? 'Modern Model for Participatory Development Business'
                      : 'نموذج عصري للأعمال التشاركية التنموية'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
                <p>
                  {isEn ? (
                    <>
                      The <strong className="text-primary-600 dark:text-primary-400 font-bold">Tamoora</strong> platform is a modern model for participatory development business that provides commercial services enabling individuals to participate in real business and service projects with modest capital and achieve sustainable profits legally.
                    </>
                  ) : (
                    <>
                      منصة <strong className="text-primary-600 dark:text-primary-400 font-bold">طامورة</strong> هي نموذج عصري للأعمال التجارية التشاركية التنموية تقدم مجموعة من الخدمات التجارية التي تمكن الأفراد من المشاركة في المشاريع التجارية والخدمية برأس مال بسيط وتحقيق أرباح مستدامة بطريقة مبتكرة وفق الأطر القانونية المحلية.
                    </>
                  )}
                </p>
                <p>
                  {isEn
                    ? 'Capital is directed exclusively into active real-world commercial projects managed by an economic and advisory team relying on integrated execution strategies combining research, market analysis, and practical implementation.'
                    : 'حيث يوجه رأس المال حصرياً في مشروعات تجارية نشطة قائمة على أرض الواقع تدار من قبل فريق اقتصادي واستشاري يعتمد على استراتيجيات تنفيذية متكاملة تجمع بين البحث والتحليل الاقتصادي لسوق العمل والتطبيق العملي، بما يضمن حلولاً مستدامة وفعالة لتنمية دخول الأفراد.'}
                </p>
                <p className="p-4 bg-primary-50/80 dark:bg-slate-900/60 border-r-4 border-primary-500 rounded-lg text-slate-800 dark:text-slate-100 font-medium text-base">
                  {isEn
                    ? 'These participatory commercial activities take place over specified time cycles according to management plans, allowing participants to benefit from short-term profits while maintaining full clarity and active communication at every stage.'
                    : 'تتم هذه الأنشطة التجارية التشاركية خلال فترات زمنية محددة وتستمر حسب خطة الإدارة بما يتيح للمشاركين الاستفادة من الأرباح قصيرة الأجل مع الحفاظ على الوضوح من خلال تحديث هذه الأنشطة التجارية وضمان استمراريتها والتواصل الفعال مع المشتركين في كل مرحلة.'}
                </p>
              </div>
            </Card>

            {/* 2. الاستثمار في المنصة */}
            <Card className="p-8 sm:p-10 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-md rounded-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-black text-xl">
                  2
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {isEn ? 'Investment & Commercial Partnership' : 'الاستثمار والتشارك التجاري'}
                  </h2>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    {isEn ? 'Real Business Activity Away from Bank Interest' : 'حركة تجارية حقيقية بعيداً عن الفوائد الحسابية'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed">
                <p>
                  {isEn
                    ? 'Investment on the platform represents collective participation in business operations managed by the company. Each investor holds defined equity shares based on their capital, generating real trading profits rather than relying on frozen bank balances or fixed interest.'
                    : 'الاستثمار في المنصة هو التشارك الجماعي في مجموعة الأعمال التجارية التي تديرها وتنظمها الشركة، حيث أن كل مستثمر هو شريك برأس مال محدد في أحد هذه المشروعات بحصص سهمية محددة حسب رأس المال، وتأتي أرباحه من ربح التجارة الفعلي حيث يدخل رأس المال في حركة تجارة حقيقية بعيداً عن الحسابات البنكية المجمدة والفوائد.'}
                </p>
                <p>
                  {isEn
                    ? 'Participants can select suitable commercial plans according to their budget and receive profit distributions managed by company leadership, with the ability to participate in multiple plans simultaneously.'
                    : 'ويتم اختيار الخطة التجارية أو الاستثمار التجاري المناسب حسب رأس المال والحصول على الأرباح بنسب يتم إدارتها وتحديدها من قبل إدارة الشركة حسب كل عمل تجاري، كما يمكن الاشتراك في أكثر من خطة أو استثمار في وقت واحد من خلال تفعيل المشاركة وإدخال البيانات المطلوبة.'}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Store className="text-primary-600" size={22} />
                  {isEn
                    ? 'Diversity of Real Commercial Sectors Included in Tamoora:'
                    : 'تنوع المشاريع التجارية الواقعية التي تشملها طامورة:'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {businessSectors.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/70 rounded-xl flex items-center gap-3 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:border-primary-400 transition-colors"
                    >
                      <sec.icon size={18} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
                      <span>{sec.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* 3. رسالتنا */}
            <Card className="p-8 sm:p-10 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-md rounded-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center font-black text-xl">
                  3
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {isEn ? 'Platform Mission & Goals' : 'رسالة المنصة وأهدافها'}
                  </h2>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    {isEn ? 'Empowerment, Sustainability & Social Security' : 'تمكين، استدامة، وأمان اجتماعي'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-primary-50 to-white dark:from-slate-900 dark:to-slate-800/80 rounded-2xl border border-primary-100 dark:border-slate-700 space-y-3">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {isEn ? 'For Individuals' : 'على مستوى الأفراد'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {isEn
                      ? 'Providing investment solutions and empowering individuals to grow their income as an alternative to traditional savings through collective participation.'
                      : 'تقديم حلول استثمارية وتمكين الأفراد من تنمية دخولهم وتوفير بدائل للادخار التقليدي من خلال المشاركة الجماعية والحصول على دخل مستمر ومتنامي.'}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800/80 rounded-2xl border border-emerald-100 dark:border-slate-700 space-y-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {isEn ? 'For Business' : 'على مستوى الأعمال'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {isEn
                      ? 'Delivering investment opportunities and a resilient business model that thrives even under challenging economic conditions.'
                      : 'تقديم حلول استثمارية ونموذج أعمال مستمر ومستدام في الظروف الاقتصادية الصعبة.'}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800/80 rounded-2xl border border-indigo-100 dark:border-slate-700 space-y-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                    <HeartHandshake size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {isEn ? 'For Community' : 'على مستوى المجتمع'}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {isEn
                      ? 'Nurturing social security and solidarity by bridging economic gaps through collective project participation.'
                      : 'تقليص الفجوات الاجتماعية بالمشاركة الجماعية في المشروعات بما يعزز الأمان الاجتماعي والتكافل التنموي.'}
                  </p>
                </div>
              </div>
            </Card>

            {/* 4 & 5 & 6. خدمات المنصة و خدمة مشروعي */}
            <Card className="p-8 sm:p-10 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-md rounded-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-black text-xl">
                  4
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {isEn ? 'Investment & Participatory Services' : 'خدمات الاستثمار والمشاريع التشاركية'}
                  </h2>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    {isEn
                      ? 'Feasibility Studies & Innovative Participatory Solutions'
                      : 'طرح دراسات الجدوى والحلول التشاركية المبتكرة'}
                  </p>
                </div>
              </div>

              <div className="space-y-6 text-slate-700 dark:text-slate-200">
                <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="text-primary-600" size={20} />
                    {isEn ? '"My Project" Service:' : 'خدمة "مشروعي":'}
                  </h3>
                  <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {isEn
                      ? 'The "My Project" feature offers evaluated projects studied by Tamoora management for participatory execution under legal partnership agreements, defined share ratios, and fixed timeframes.'
                      : 'أيقونة "مشروعي" ضمن المنصة هي نموذج لطرح المشاريع التي تتم دراستها من قبل إدارة المنصة والعمل على تنفيذها بشكل تشاركي بين مجموعة من المشتركين بموجب عقود شراكة قانونية ونسب محددة وخطة تنفيذية ضمن فترات زمنية محددة وهي مخصصة للمشاركين ضمن مشروعات طامورة.'}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChart className="text-emerald-600" size={20} />
                    {isEn ? 'Other Participatory Projects:' : 'المشاريع التشاركية الأخرى:'}
                  </h3>
                  <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {isEn
                      ? 'Periodically launched by platform management with detailed capital requirements, available share allocations, share pricing, and expected return ratios after thorough economic analysis.'
                      : 'يتم طرحها من قبل إدارة المنصة خلال فترات زمنية متفاوتة حيث يتم طرح المشروع وقيمة رأس المال المطلوب والحصص السهمية المتاحة وتسعير الحصة السهمية ونسب الربح المتوقعة بعد دراستها من قبل الفريق الاقتصادي في الشركة ثم تدعو المنصة جمهورها للمشاركة بها.'}
                  </p>
                </div>
              </div>
            </Card>

            {/* 7 & 8. الإدارة وتوزيع الأرباح وبرنامج الإحالات */}
            <Card className="p-8 sm:p-10 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-md rounded-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center font-black text-xl">
                  5
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {isEn ? 'Management, Profits & Commissions' : 'الإدارة وتوزيع الأرباح والعمولات'}
                  </h2>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    {isEn ? 'Complete Transparency & Clear Financial Rules' : 'شفافية تامة وضوابط مالية واضحة'}
                  </p>
                </div>
              </div>

              <div className="space-y-6 text-slate-700 dark:text-slate-200 text-base leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Highlighted Red Box 1: رسوم الإدارة (25%) */}
                  <div className="p-6 bg-red-50 dark:bg-red-950/40 rounded-2xl border-2 border-red-500 dark:border-red-600 shadow-md space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0 shadow">
                        <ShieldCheck size={22} />
                      </div>
                      <h3 className="text-xl font-extrabold text-red-700 dark:text-red-400">
                        {isEn ? 'Management Fees (25%)' : 'رسوم الإدارة (25%)'}
                      </h3>
                    </div>
                    <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 font-semibold leading-relaxed">
                      {isEn
                        ? 'Business activities are planned and executed exclusively by the economic team. A one-time 25% fee is deducted per plan for management, monitoring, execution, and hedge buffer.'
                        : 'يتم تخطيط وتنظيم وتنفيذ الأعمال التجارية من قبل الفريق الاقتصادي في الشركة حصراً وتحصل الشركة على نسبة (25)% كرسوم إدارة ومتابعة وتنفيذ وصندوق تحوط تقتطع لمرة واحدة عن كل خطة أو استثمار.'}
                    </p>
                  </div>

                  {/* Highlighted Red Box 2: نسبة سحب الأرباح (80% صافي الربح) */}
                  <div className="p-6 bg-red-50 dark:bg-red-950/40 rounded-2xl border-2 border-red-500 dark:border-red-600 shadow-md space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0 shadow">
                        <Wallet size={22} />
                      </div>
                      <h3 className="text-xl font-extrabold text-red-700 dark:text-red-400">
                        {isEn ? 'Profit Withdrawal (80% Net Profit)' : 'نسبة سحب الأرباح (80% صافي الربح)'}
                      </h3>
                    </div>
                    <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 font-semibold leading-relaxed">
                      {isEn
                        ? 'Participants have the right to withdraw up to 80% of net earned profits on a weekly or monthly schedule.'
                        : 'يحق للمشترك سحب الأرباح بنسبة 80% من صافي الربح في الصفقات والاستثمارات بشكل أسبوعي أو شهري.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-amber-50/60 dark:bg-slate-900/60 rounded-xl border border-amber-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-lg">
                    <Clock size={20} />
                    {isEn
                      ? '100% Capital & Profit Liberation (After 4 Months)'
                      : 'تحرير رأس المال والأرباح كاملاً (100% بعد 4 أشهر)'}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {isEn
                      ? 'After 4 months from subscription, participants can withdraw 100% of capital and profits unconditionally. Early exit requests stop profit accrual immediately and unlock capital automatically after 4 months.'
                      : 'يحق للمشترك بعد انقضاء أربعة أشهر على تاريخ الاشتراك سحب رأس المال والأرباح كاملاً بدون أي قيود. وفي حال طلب الانسحاب قبل هذه المدة، تتوقف الأرباح فوراً ويُحرر رأس المال تلقائياً بعد اكتمال الـ 4 أشهر.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Share2 className="text-indigo-600" size={22} />
                    {isEn
                      ? 'Multi-Tier Referral & Commission Program (Deducted from Management Fee):'
                      : 'برنامج الإحالات والعمولات المتعددة (يُقتطع من رسوم الإدارة):'}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500">{isEn ? 'Level 1' : 'المستوى الأول'}</p>
                      <p className="text-2xl font-black text-primary-600">7%</p>
                    </div>
                    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500">{isEn ? 'Level 2' : 'المستوى الثاني'}</p>
                      <p className="text-2xl font-black text-emerald-600">3.5%</p>
                    </div>
                    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500">{isEn ? 'Level 3' : 'المستوى الثالث'}</p>
                      <p className="text-2xl font-black text-amber-600">1.5%</p>
                    </div>
                    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500">{isEn ? 'Level 4' : 'المستوى الرابع'}</p>
                      <p className="text-2xl font-black text-indigo-600">{isEn ? '1% Monthly' : '1% شهرياً'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-16">
        <Container className="text-center">
          <h2 className="text-3xl font-extrabold mb-4">
            {isEn ? 'Join the Tamoora Participatory Development Community' : 'انضم إلى مجتمع طامورة للتنمية التشاركية'}
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto text-base sm:text-lg">
            {isEn
              ? 'Create your account and explore real commercial opportunities with modest capital and sustainable returns.'
              : 'قم بإنشاء حسابك واستكشاف فرص الاستثمار التجاري الواقعي برأس مال بسيط وعوائد مستدامة.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-slate-100 font-bold px-8">
                {isEn ? 'Create New Account' : 'إنشاء حساب جديد'}
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10 px-8">
                {isEn ? 'General Terms & Conditions' : 'الشروط والأحكام العامة'}
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}

