'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';
import {
  TrendingUp, ShieldCheck, Users, Clock, CheckCircle,
  ArrowLeft, Star, Award, Zap, Lock,
  Quote, Play, Sparkles, ArrowRight,
  Handshake, Target, Eye
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Container from '@/components/layout/Container';
import Link from 'next/link';

// 🎯 Counter Animation Hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return { count, ref };
}

function StatCard({ stat }: { stat: any }) {
  const counter = useCountUp(stat.value, 2000);
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400',
    success: 'bg-success/10 text-success',
    accent: 'bg-accent-100 dark:bg-accent-900/40 text-accent-600 dark:text-accent-400',
    secondary: 'bg-secondary-100 dark:bg-secondary-900/40 text-secondary-600 dark:text-secondary-400',
  };

  return (
    <div
      ref={counter.ref}
      className="text-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-2 flex flex-col items-center justify-between min-w-0 overflow-hidden"
    >
      <div className={`w-14 h-14 sm:w-16 sm:h-16 ${colorClasses[stat.color] || colorClasses.primary} rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shrink-0`}>
        <stat.icon size={26} />
      </div>
      <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight break-all sm:break-normal max-w-full truncate px-1">
        {stat.prefix || ''}{counter.count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-medium line-clamp-2">{stat.label}</div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t, dir, lang } = useThemeLanguage();
  const isEn = lang === 'en';
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (mounted) {
      const interval = setInterval(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-300">جاري التوجيه...</p>
        </div>
      </div>
    );
  }

  const liveStats = [
    { value: 1250, suffix: '+', label: t('stats.activeInvestors'), icon: Users, color: 'primary' },
    { value: 85, suffix: '+', label: t('stats.completedProjects'), icon: Target, color: 'success' },
    { value: 2500000, prefix: '$', suffix: '+', label: t('stats.investmentVolume'), icon: TrendingUp, color: 'accent' },
    { value: 99, suffix: '%', label: t('stats.satisfactionRate'), icon: Star, color: 'secondary' },
  ];

  const features = [
    { icon: ShieldCheck, title: t('why.feature1Title'), desc: t('why.feature1Desc'), color: 'primary' },
    { icon: TrendingUp, title: t('why.feature2Title'), desc: t('why.feature2Desc'), color: 'success' },
    { icon: Users, title: t('why.feature3Title'), desc: t('why.feature3Desc'), color: 'accent' },
    { icon: Clock, title: t('why.feature4Title'), desc: t('why.feature4Desc'), color: 'secondary' },
  ];

  const testimonials = [
    {
      name: isEn ? 'Ahmed Al-Khalidi' : 'أحمد الخالدي',
      role: isEn ? 'Investor - Syria' : 'مستثمر - سوريا',
      image: '👨‍💼',
      rating: 5,
      text: isEn
        ? 'Wonderful investment experience with Tamoora! Continuous profits and excellent technical support.'
        : 'تجربة استثمارية رائعة مع طامورة! الأرباح مستمرة والدعم الفني ممتاز.',
      profit: '+$12,500'
    },
    {
      name: isEn ? 'Fatima Al-Zahra' : 'فاطمة الزهراء',
      role: isEn ? 'Entrepreneur - UAE' : 'رائدة أعمال - الإمارات',
      image: '👩‍💼',
      rating: 5,
      text: isEn
        ? 'The platform is easy to use, and complete transparency made me trust them entirely.'
        : 'المنصة سهلة الاستخدام والشفافية في التعاملات جعلتني أثق بهم تماماً.',
      profit: '+$8,300'
    },
    {
      name: isEn ? 'Mohammed Al-Ali' : 'محمد العلي',
      role: isEn ? 'Engineer - Saudi Arabia' : 'مهندس - السعودية',
      image: '👨‍🔬',
      rating: 5,
      text: isEn
        ? 'The best investment platform I have worked with. Fast withdrawals and genuine returns.'
        : 'أفضل منصة استثمارية تعاملت معها. السحب سريع والعوائد حقيقية.',
      profit: '+$15,200'
    },
    {
      name: isEn ? 'Layla Hassan' : 'ليلى حسن',
      role: isEn ? 'Doctor - Jordan' : 'طبيبة - الأردن',
      image: '👩‍⚕️',
      rating: 5,
      text: isEn
        ? 'As a busy professional, I needed a trusted platform to manage my investments. Tamoora was the ideal choice.'
        : 'كمشغولة، أحتاج منصة موثوقة لإدارة استثماراتي. طامورة كانت الخيار الأمثل.',
      profit: '+$6,800'
    },
  ];

  const trustPartners = [
    { name: 'Tron Network', icon: '🔷' },
    { name: 'Ethereum', icon: '💎' },
    { name: 'Binance Smart Chain', icon: '🟡' },
    { name: 'USDT', icon: '💵' },
    { name: 'SSL Secure', icon: '🔒' },
    { name: 'Verified', icon: '✅' },
  ];

  const projects = [
    {
      title: isEn ? 'Boxing & Fitness Club' : 'نادي ملاكمة ولياقة بدنية',
      profit: '+125%',
      investors: 342,
      image: '🥊',
      duration: isEn ? '6 Months' : '6 أشهر'
    },
    {
      title: isEn ? 'PlayStation & Entertainment Lounge' : 'صالة العاب ترفيه و بلي ستيشن',
      profit: '+89%',
      investors: 215,
      image: '🎮',
      duration: isEn ? '4 Months' : '4 أشهر'
    },
    {
      title: isEn ? 'Nesmat Jabal Sweets' : 'محل حلويات نسمة جبل',
      profit: '+156%',
      investors: 187,
      image: '🧁',
      duration: isEn ? '12 Months' : '12 شهر'
    },
  ];

  const steps = [
    { step: '01', title: t('steps.step1Title'), desc: t('steps.step1Desc'), icon: Sparkles },
    { step: '02', title: t('steps.step2Title'), desc: t('steps.step2Desc'), icon: Target },
    { step: '03', title: t('steps.step3Title'), desc: t('steps.step3Desc'), icon: Zap },
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: isEn ? '256-bit Encryption' : 'تشفير 256-bit',
      desc: isEn ? 'Highest encryption standards to protect your data' : 'أعلى معايير التشفير لحماية بياناتك'
    },
    {
      icon: ShieldCheck,
      title: isEn ? 'Legally Licensed' : 'مرخصة قانونياً',
      desc: isEn ? 'Operating strictly within official legal frameworks' : 'نعمل ضمن الأطر القانونية المعتمدة'
    },
    {
      icon: Eye,
      title: isEn ? 'Full Transparency' : 'شفافية كاملة',
      desc: isEn ? 'All operations and transactions are clearly documented' : 'جميع العمليات موثقة وواضحة'
    },
    {
      icon: Handshake,
      title: isEn ? '24/7 Dedicated Support' : 'دعم 24/7',
      desc: isEn ? 'Professional support team available round the clock' : 'فريق دعم متاح على مدار الساعة'
    },
  ];

  const faqPreview = [
    { q: 'ما هو الحد الأدنى للاستثمار؟', a: 'يبدأ من 5$ للخطط اليومية و250$ للخطط الشهرية.' },
    { q: 'كيف يتم توزيع الأرباح؟', a: 'تُضاف الأرباح تلقائياً لرصيدك حسب نوع الخطة.' },
    { q: 'هل أموالي آمنة؟', a: 'نعم، نستخدم أحدث تقنيات التشفير ونعمل ضمن أطر قانونية.' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 overflow-hidden transition-colors">
      {/* ============ HERO SECTION ============ */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-slate-900 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-start">
              <Badge variant="secondary" className="bg-white/20 text-white border border-white/30 mb-6 backdrop-blur-sm">
                <Sparkles size={14} className="mx-1" />
                {t('hero.badge')}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                {t('hero.title1')}{' '}
                <span className="relative inline-block text-accent-300">
                  {t('hero.titleHighlight')}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed max-w-2xl">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-white border-none shadow-2xl shadow-accent-500/50 hover:scale-105 transition-transform">
                    {t('hero.startInvesting')} <ArrowLeft className={`mx-2 w-5 h-5 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
                <Link href="/investments">
                  <Button variant="outline" size="lg" className="text-white border-white/50 hover:bg-white/10 backdrop-blur-sm">
                    <Play size={18} className="mx-2" /> {t('hero.browsePlans')}
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-primary-100">
                <div className="flex items-center gap-2"><CheckCircle size={16} className="text-success" /><span>{t('hero.freeRegister')}</span></div>
                <div className="flex items-center gap-2"><CheckCircle size={16} className="text-success" /><span>{t('hero.noHiddenFees')}</span></div>
                <div className="flex items-center gap-2"><CheckCircle size={16} className="text-success" /><span>{t('hero.instantWithdrawal')}</span></div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative">
                <div className="bg-white/10 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-primary-200 text-sm">{t('hero.totalProfit')}</p>
                      <p className="text-4xl font-bold">$24,850.75</p>
                    </div>
                    <div className="w-14 h-14 bg-success/20 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="text-success" size={28} />
                    </div>
                  </div>
                  <div className="h-32 flex items-end gap-2 mb-4">
                    {[40, 65, 45, 80, 55, 90, 70, 95, 85, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-accent-500 to-accent-300 rounded-t-lg animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}></div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-200">{t('hero.last30Days')}</span>
                    <span className="text-success font-bold flex items-center gap-1"><ArrowRight size={14} className="rotate-180" /> +24.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ TRUST PARTNERS ============ */}
      <section className="py-10 bg-gray-100 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800">
        <Container>
          <p className="text-center text-gray-500 dark:text-slate-400 text-sm mb-6">
            {isEn ? "Powered by the world's leading blockchain networks" : 'مدعوم من أقوى شبكات البلوكشين العالمية'}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {trustPartners.map((partner, idx) => (
              <div key={idx} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <span className="text-xl">{partner.icon}</span>
                <span className="font-semibold text-gray-700 dark:text-slate-200 text-xs sm:text-sm">{partner.name}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ LIVE STATS COUNTER ============ */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <Container>
          <div className="text-center mb-12">
            <Badge variant="primary" size="md"><Zap size={14} className="mx-1" /> {t('stats.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-4">{t('stats.title')}</h2>
            <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">{t('stats.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {liveStats.map((stat, idx) => (
              <StatCard key={idx} stat={stat} />
            ))}
          </div>
        </Container>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="py-20 bg-gray-50 dark:bg-slate-950">
        <Container>
          <div className="text-center mb-16">
            <Badge variant="primary" size="md">{t('why.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-4">{t('why.title')}</h2>
            <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">{t('why.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const colorMap: Record<string, string> = {
                primary: 'from-primary-500 to-primary-600',
                success: 'from-success to-green-600',
                accent: 'from-accent-500 to-accent-600',
                secondary: 'from-secondary-500 to-secondary-600',
              };
              return (
                <Card key={idx} className="text-center p-8 hover:border-primary-300 dark:hover:border-primary-500 transition-all duration-300 group">
                  <div className={`w-20 h-20 bg-gradient-to-br ${colorMap[feature.color] || colorMap.primary} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-sm">{feature.desc}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============ SUCCESSFUL PROJECTS ============ */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <Container>
          <div className="text-center mb-12">
            <Badge variant="accent" size="md"><Award size={14} className="mx-1" /> {t('projects.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-4">{t('projects.title')}</h2>
            <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">{t('projects.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project, idx) => (
              <Card key={idx} className="p-6 hover:shadow-2xl transition-all hover:-translate-y-2 group">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{project.image}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{project.title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-500 dark:text-slate-400">{t('projects.profit')}</span><span className="font-bold text-success">{project.profit}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-500 dark:text-slate-400">{t('projects.investors')}</span><span className="font-semibold text-gray-900 dark:text-slate-100">{project.investors}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-500 dark:text-slate-400">{t('projects.duration')}</span><span className="font-semibold text-gray-900 dark:text-slate-100">{project.duration}</span></div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white dark:from-slate-900 dark:to-slate-950">
        <Container>
          <div className="text-center mb-12">
            <Badge variant="secondary" size="md"><Quote size={14} className="mx-1" /> {t('testimonials.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-4">{t('testimonials.title')}</h2>
            <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className={`transition-all duration-500 ${idx === activeTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 absolute inset-0 translate-y-4'}`}>
                  <Card className="p-8 md:p-12 text-center">
                    <div className="text-6xl mb-4">{testimonial.image}</div>
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={20} className="text-accent-500 fill-accent-500" />
                      ))}
                    </div>
                    <Quote size={32} className="text-primary-300 mx-auto mb-4" />
                    <p className="text-lg md:text-xl text-gray-700 dark:text-slate-200 leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                    <div className="inline-block bg-success/10 text-success px-4 py-2 rounded-full font-bold mb-4">{t('testimonials.realProfit')} {testimonial.profit}</div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{testimonial.name}</p>
                      <p className="text-gray-500 dark:text-slate-400 text-sm">{testimonial.role}</p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button key={idx} onClick={() => setActiveTestimonial(idx)} className={`transition-all ${idx === activeTestimonial ? 'w-8 h-2 bg-primary-600' : 'w-2 h-2 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400'} rounded-full`} aria-label={`Testimonial ${idx + 1}`} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-20 bg-gray-50 dark:bg-slate-950">
        <Container>
          <div className="text-center mb-16">
            <Badge variant="secondary" size="md">{t('steps.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-4">{t('steps.title')}</h2>
            <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              {isEn ? 'Start your investment journey with Tamoora in three simple steps' : 'ابدأ رحلتك الاستثمارية مع طامورة بثلاث خطوات بسيطة وميسرة'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <Card key={idx} className="relative p-8 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-primary-400 dark:hover:border-primary-500 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                    <step.icon size={26} />
                  </div>
                  <span className="text-4xl font-black text-primary-200 dark:text-slate-700 font-mono select-none">
                    0{idx + 1}
                  </span>
                </div>
                <div>
                  <div className="inline-block px-2.5 py-1 rounded-md bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold text-xs mb-2">
                    {isEn ? `Step 0${idx + 1}` : `الخطوة 0${idx + 1}`}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-sm">{step.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ SECURITY SECTION ============ */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-slate-950 text-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 mb-6"><Lock size={14} className="mx-1" /> {t('security.badge')}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('security.title')}</h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">{t('security.desc')}</p>
              <Link href="/privacy">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">{t('security.learnMore')}<ShieldCheck size={18} className="mx-2" /></Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {securityFeatures.map((feature, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                  <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center mb-4"><feature.icon className="text-accent-400" size={24} /></div>
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative py-20 bg-gradient-to-r from-primary-700 via-primary-600 to-accent-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-400 rounded-full blur-3xl"></div>
        </div>
        <Container className="relative z-10 text-center">
          <Award className="w-20 h-20 text-accent-300 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">{t('cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="xl" className="bg-white text-primary-700 hover:bg-gray-100 border-none shadow-2xl font-bold hover:scale-105 transition-transform">{t('cta.button')}<CheckCircle className="mx-2 w-5 h-5" /></Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="xl" className="text-white border-white hover:bg-white/10">{t('cta.aboutButton')}</Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
