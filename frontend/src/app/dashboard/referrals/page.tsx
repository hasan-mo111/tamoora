'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Award, 
  TrendingUp, 
  Building2, 
  ShieldAlert, 
  Crown, 
  HelpCircle, 
  Gift, 
  FileText, 
  PieChart,
  UserCheck
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';

export default function ReferralsPage() {
  const { lang } = useThemeLanguage();
  const { user } = useAuth();
  const isAr = lang === 'ar';

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tier_rules' | 'major_projects' | 'operational'>('overview');

  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/referral-info')
      .then((res) => setReferralData(res.data))
      .catch((err) => console.error('Failed to fetch referral info:', err))
      .finally(() => setLoading(false));
  }, []);

  // Real Referral Code and Link from actual user object
  const referralCode = referralData?.referralCode || user?.referralCode || `USER-${user?.id?.substring(0, 6).toUpperCase() || 'REF'}`;
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/register?ref=${referralCode}`
    : `https://tamoura.app/auth/register?ref=${referralCode}`;

  // Real referrer info based on user account
  const referrerInfo = referralData?.referrerInfo;
  const referrerName = referrerInfo
    ? `${referrerInfo.firstName || ''} ${referrerInfo.lastName || ''}`.trim() || referrerInfo.email
    : (user as any)?.invitedByName || (isAr ? 'التسجيل المباشر / إدارة المنصة' : 'Direct Registration / Platform Admin');
  const referrerCode = referrerInfo?.referralCode || (user as any)?.referredBy || 'TAMOURA-OFFICIAL';
  const referrerDate = referrerInfo?.createdAt
    ? new Date(referrerInfo.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')
    : ((user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : '-');

  // Real dynamic referral performance statistics
  const totalInvitedCount = referralData?.totalInvited ?? (user as any)?.referralsCount ?? 0;
  const activeInvestorsCount = referralData?.activeInvestorsCount ?? (user as any)?.activeReferralsCount ?? 0;
  const totalEarnings = Number(referralData?.totalEarnings ?? (user as any)?.referralEarnings ?? 0);
  const teamBonus = Number(referralData?.teamBonus ?? (user as any)?.teamLeaderBonus ?? 0);

  const stats = {
    totalInvited: totalInvitedCount,
    activeInvestors: activeInvestorsCount,
    totalReferralEarned: totalEarnings,
    teamLeaderBonus: teamBonus,
    currentTier: totalInvitedCount >= 4 
      ? (isAr ? 'قائد فريق (Team Leader)' : 'Team Leader') 
      : totalInvitedCount > 0 
      ? (isAr ? `عضو داعي (${totalInvitedCount} إحالات)` : `Inviter (${totalInvitedCount} invites)`)
      : (isAr ? 'مستثمر جديد (0 إحالات)' : 'New Investor (0 invites)'),
    nextMilestone: isAr ? 'مكافأة المشروع الكبير (50 عميل)' : 'Major Project Bonus (50 clients)',
    majorProjectProgress: totalInvitedCount, // out of 50
    capitalAchievedProgress: Math.min(100, Math.round((totalInvitedCount / 50) * 100)), // % achieved out of 50%
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-none">
              <Users size={14} className="mx-1" />
              {isAr ? 'برنامج التسويق والإحالات' : 'Referral & Affiliate Program'}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            {isAr ? 'نظام الإحالات والبرومو كود والمستثمرين' : 'Referral & Promo Code Hub'}
          </h1>
          <p className="text-primary-100 mt-2 text-sm md:text-base max-w-2xl">
            {isAr 
              ? 'احصل على عمولات مجزية من الصفقات، وشارك في تسويق المشاريع الكبرى والتشغيلية بنسب أرباح تنافسية.' 
              : 'Earn rewarding commissions, market major & operational projects, and build your investment team.'}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center min-w-[200px]">
          <span className="text-xs text-primary-200 block mb-1">{isAr ? 'أرباح الإحالات المكتسبة' : 'Total Referral Earnings'}</span>
          <span className="text-3xl font-extrabold text-white">${stats.totalReferralEarned.toFixed(2)}</span>
          <span className="text-[10px] block text-primary-200 mt-1">{isAr ? '(بعد خصم 2% رسوم إدارة المنصة)' : '(Net after 2% fee)'}</span>
        </div>
      </div>

      {/* Inviter Identification Banner (من قام بدعوتك) */}
      <Card className="p-5 border-l-4 border-l-primary-500 bg-slate-50 dark:bg-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <UserCheck size={20} />
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium block">
                {isAr ? 'حسابك تم تسجيله بدعوة من:' : 'Your Account Invited By:'}
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {referrerName} <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">({referrerCode})</span>
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
            {isAr ? 'تاريخ التوثيق والانضمام:' : 'Registration Date:'} {referrerDate}
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'
          }`}
        >
          <Share2 size={16} />
          {isAr ? 'رابط الإحالة والبرومو كود' : 'Referral Link & Code'}
        </button>
        <button
          onClick={() => setActiveTab('tier_rules')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tier_rules'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'
          }`}
        >
          <Gift size={16} />
          {isAr ? 'نظام العمولات والبرومو كود' : 'Promo & Tier System'}
        </button>
        <button
          onClick={() => setActiveTab('major_projects')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'major_projects'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'
          }`}
        >
          <Building2 size={16} />
          {isAr ? 'تسويق المشاريع الكبرى (5%)' : 'Major Projects (5%)'}
        </button>
        <button
          onClick={() => setActiveTab('operational')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'operational'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'
          }`}
        >
          <PieChart size={16} />
          {isAr ? 'المشاريع التشغيلية (70/15/15)' : 'Operational Projects'}
        </button>
      </div>

      {/* Tab 1: Link & Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Important Advisory Box */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <ShieldAlert className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-xs md:text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
              <strong>{isAr ? 'تنويه قانوني هـام:' : 'Legal Disclaimer:'}</strong>{' '}
              {isAr
                ? 'رابط الإحالة المقدم لك هو دعوة تعريفية لتجربة المنصة واستكشاف خدماتها، وليس توصية استثمارية لشراء أي حصة سهمية في مشروع معين.'
                : 'Your referral link is an introductory invitation to explore the platform, not a financial recommendation to purchase shares in any project.'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Link Generator */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 className="text-primary-600" size={20} />
                {isAr ? 'رابط الإحالة الخاص بك' : 'Your Referral Link'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-slate-300">
                {isAr ? 'شارك هذا الرابط مع أصدقائك أو متابعيك لكسب العمولات عند دخولهم الصفقات:' : 'Share this link with your network to earn commissions on trades:'}
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 font-mono"
                />
                <Button onClick={handleCopyLink} size="sm" variant={copiedLink ? 'success' : 'primary'}>
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  {copiedLink ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">{isAr ? 'البرومو كود الخاص بك:' : 'Your Promo Code:'}</span>
                  <span className="font-mono font-bold text-lg text-primary-600 dark:text-primary-400">{referralCode}</span>
                </div>
                <Button onClick={handleCopyCode} size="sm" variant="outline">
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  {isAr ? 'نسخ الكود' : 'Copy Code'}
                </Button>
              </div>
            </Card>

            {/* Quick Stats Grid */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-success" size={20} />
                {isAr ? 'إحصائيات إحالاتك' : 'Referral Performance'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-primary-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-xs text-gray-500 dark:text-slate-400 block mb-1">{isAr ? 'عدد المدعوين' : 'Total Invited'}</span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.totalInvited}</span>
                </div>

                <div className="p-3 bg-success/10 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-xs text-gray-500 dark:text-slate-400 block mb-1">{isAr ? 'المستثمرون النشطون' : 'Active Investors'}</span>
                  <span className="text-2xl font-bold text-success">{stats.activeInvestors}</span>
                </div>

                <div className="p-3 bg-amber-500/10 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-xs text-gray-500 dark:text-slate-400 block mb-1">{isAr ? 'علاوة قائد الفريق (شهرياً)' : 'Team Leader Bonus'}</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">${stats.teamLeaderBonus.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-purple-500/10 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-xs text-gray-500 dark:text-slate-400 block mb-1">{isAr ? 'الرتبة الحالية' : 'Current Status'}</span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block mt-1">{stats.currentTier}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Promo Code & Tier Rules */}
      {activeTab === 'tier_rules' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Gift className="text-primary-600" size={24} />
                {isAr ? 'سلم عمولات الإحالة المتعددة المراتب (4 مستويات)' : 'Multi-Tier Referral Commission Structure'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                {isAr
                  ? 'توزيع عمولات الإحالة التراكمية على المستويات الأربعة الأولى للداعي عند دخول المستثمر لأول صفقة:'
                  : 'Multi-tier referral commission distribution across the 4 referral levels on the investor\'s 1st trade:'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Tier 1 */}
              <div className="p-4 rounded-xl border-2 border-primary-500 bg-primary-50/50 dark:bg-slate-800 relative">
                <Badge variant="primary" size="sm" className="mb-2">{isAr ? 'المستوى الأول (A ➔ B)' : 'Level 1 (A ➔ B)'}</Badge>
                <div className="text-3xl font-black text-primary-600 dark:text-primary-400 mb-1">0.0175%</div>
                <p className="text-xs text-gray-600 dark:text-slate-300">
                  {isAr ? 'يأخذ A نسبة 0.0175% من قيمة أول صفقة يدخلها B.' : 'A gets 0.0175% of B\'s 1st investment deal.'}
                </p>
              </div>

              {/* Tier 2 */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <Badge variant="secondary" size="sm" className="mb-2">{isAr ? 'المستوى الثاني (A ➔ B ➔ C)' : 'Level 2 (A ➔ B ➔ C)'}</Badge>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">0.00875%</div>
                <p className="text-xs text-gray-600 dark:text-slate-300">
                  {isAr ? 'عندما يدعو B شخصاً C، يأخذ B نسبة 0.0175% ويأخذ A نسبة 0.00875% من قيمة أول صفقة لـ C.' : 'When B invites C: B gets 0.0175% and A gets 0.00875% of C\'s 1st deal.'}
                </p>
              </div>

              {/* Tier 3 */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <Badge variant="accent" size="sm" className="mb-2">{isAr ? 'المستوى الثالث (B ➔ C ➔ D)' : 'Level 3 (B ➔ C ➔ D)'}</Badge>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">0.00375%</div>
                <p className="text-xs text-gray-600 dark:text-slate-300">
                  {isAr ? 'عندما يدعو C شخصاً D، يأخذ C نسبة 0.0175% ويأخذ B نسبة 0.00875% ويأخذ A نسبة 0.00375% من أول صفقة لـ D.' : 'When C invites D: C gets 0.0175%, B gets 0.00875%, and A gets 0.00375% of D\'s 1st deal.'}
                </p>
              </div>

              {/* Tier 4 */}
              <div className="p-4 rounded-xl border-2 border-purple-500 bg-purple-50/50 dark:bg-slate-800 relative">
                <div className="absolute -top-3 right-3 bg-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown size={12} /> {isAr ? 'ثابت شهرياً' : 'Fixed Monthly'}
                </div>
                <Badge variant="success" size="sm" className="mb-2 mt-1">{isAr ? 'المستوى الرابع (C ➔ D ➔ H)' : 'Level 4 (C ➔ D ➔ H)'}</Badge>
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">0.0025% <span className="text-xs font-normal text-gray-500">{isAr ? 'شهرياً' : '/mo'}</span></div>
                <p className="text-xs text-gray-600 dark:text-slate-300">
                  {isAr ? 'عندما يدعو D شخصاً H، يأخذ A نسبة 0.0025% شهرياً وبشكل ثابت، وتوزع العمولات المتبقية لـ B وC وD.' : 'When D invites H: A gets 0.0025% fixed monthly, with tiered payouts to B, C, and D on H\'s 1st deal.'}
                </p>
              </div>
            </div>

            {/* Crucial First Investor Rule Notice */}
            <div className="p-4 bg-amber-500/10 dark:bg-amber-900/20 rounded-xl space-y-2 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-100 text-sm">
                <ShieldAlert size={18} className="text-amber-600" />
                {isAr ? 'شرط حصرية الدعوة الأولى (First Investor Rule):' : 'First Investor Only Rule:'}
              </div>
              <p className="font-semibold leading-relaxed">
                {isAr
                  ? 'إذا دعا أي شخص أكثر من شخص، يأخذ العمولة فقط على أول مستثمر يدعيه ويقبل ويستثمر بالمنصة.'
                  : 'If any user invites multiple people, they earn referral commission strictly on the FIRST investor they invite who successfully subscribes to a deal.'}
              </p>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs text-gray-600 dark:text-slate-300 space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                <HelpCircle size={16} className="text-primary-600" />
                {isAr ? 'ملاحظة حول رسوم الإدارة:' : 'Platform Management Fee Note:'}
              </div>
              <p>
                {isAr
                  ? 'تقتطع المنصة 2% رسوم إدارة تشغيلية وتقنية من كافة أرباح الإحالات والعمولات المحسوبة أعلاه.'
                  : 'A standard 2% operational platform fee applies to all generated referral earnings.'}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Major Projects */}
      {activeTab === 'major_projects' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="accent" className="mb-2">
                  <Building2 size={14} className="mx-1" />
                  {isAr ? 'المشاريع الاستثمارية الكبرى' : 'Major Mega Projects'}
                </Badge>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isAr ? 'مكافأة تسويق المشاريع الكبرى (5% من رأس المال)' : 'Major Project Marketing Bonus (5% Capital)'}
                </h2>
              </div>
              <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-2xl font-black px-4 py-2 rounded-xl border border-amber-500/20">
                5% {isAr ? 'مكافأة مسوق' : 'Bonus'}
              </div>
            </div>

            {/* Condition Requirements */}
            <div className="p-5 bg-gradient-to-br from-amber-500/10 via-primary-500/5 to-transparent rounded-2xl border border-amber-500/30 space-y-4">
              <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm md:text-base flex items-center gap-2">
                <Award className="text-amber-600" size={20} />
                {isAr ? 'شروط استحقاق الـ 5% من رأس مال المشروع الكبير:' : 'Requirements for the 5% Capital Commission:'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{isAr ? 'جلب 50 عميلاً مستثمراً' : 'Bring 50 Active Investors'}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {isAr ? 'أن يقوم المسوق بدعوة 50 عميلاً حقيقياً قاموا بالتسجيل والاستثمار بالمنصة.' : 'Bring 50 registered verified investors.'}
                    </p>
                    <div className="mt-2 text-xs font-semibold text-primary-600">
                      {isAr ? `التقدم الحالي: ${stats.majorProjectProgress} / 50 عميل` : `Progress: ${stats.majorProjectProgress} / 50`}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{isAr ? 'تغطية 50% من رأس مال المشروع' : 'Fund 50% of Project Capital'}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {isAr ? 'أن يحقق العملاء المجلوبون من طرف المسوق ما نسبته 50% على الأقل من القيمة الكلية للمشروع.' : 'Injected funds from your invitees must reach 50% of total project capital.'}
                    </p>
                    <div className="mt-2 text-xs font-semibold text-primary-600">
                      {isAr ? `التقدم الحالي: ${stats.capitalAchievedProgress}% / 50%` : `Progress: ${stats.capitalAchievedProgress}% / 50%`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Distribution Rules for Major Projects */}
            <div className="space-y-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <PieChart className="text-primary-600" size={20} />
                {isAr ? 'هيكلية توزيع أرباح المشروع الكبير:' : 'Major Project Profit Breakdown:'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-slate-700">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">80%</span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">{isAr ? 'توزع على المستثمرين المشاركين' : 'Distributed to Investors'}</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{isAr ? 'أرباح صافية تضاف لحسابات المستثمرين حسب حصصهم.' : 'Net profits credited to investor balance.'}</p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-slate-700">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">20%</span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">{isAr ? 'حصة المنصة (لا توزع على أحد)' : 'Platform Share (Non-distributable)'}</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{isAr ? 'حصة المنصة التشغيلية والتطويرية والتأمين.' : 'Platform operating reserve & infrastructure.'}</p>
                </div>
              </div>
            </div>

            {/* Admin Quarterly Reports & Flexible Payout Rules */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-gray-700 dark:text-slate-300">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                <FileText size={18} className="text-primary-600" />
                {isAr ? 'التقارير الدورية وتوزيع الأرباح من الأدمن:' : 'Admin Quarterly Reports & Profit Payout Policy:'}
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  {isAr
                    ? 'يُطلب من إدارة المنصة نشر تقارير دورية كل 3 أشهر عن سير العمل وأداء المشروع.'
                    : 'Admin issues official progress reports every 3 months.'}
                </li>
                <li>
                  {isAr
                    ? 'نسبة وتوقيت توزيع الأرباح لا تُعرض بصفة دائمة ثابتة في جدول الصفقة، بل تظهر للمستثمر في اليوم المتفق عليه رسمياً لتوزيع الأرباح.'
                    : 'Profit payouts are not statically displayed; exact yield pricing is set by Admin on scheduled payout days within the approved range.'}
                </li>
                <li>
                  {isAr
                    ? 'المنصة تحصل على 2% رسوم إدارة من أي أرباح مستحقة يتم توزيعها.'
                    : 'A 2% management fee applies to all distributed profits.'}
                </li>
              </ul>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Operational Projects (70/15/15) */}
      {activeTab === 'operational' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <Badge variant="primary" className="mb-2">
                <PieChart size={14} className="mx-1" />
                {isAr ? 'المشاريع التشغيلية التشاركية' : 'Operational Participatory Projects'}
              </Badge>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isAr ? 'هيكلية ملكية وأرباح المشاريع التشغيلية (70% - 15% - 15%)' : 'Operational Projects Ownership (70% - 15% - 15%)'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                {isAr
                  ? 'عند طرح الأدمن لمشاريع تشغيلية جديدة، يتم اختيار صاحب الفكرة من بين المستخدمين مع الحفاظ على سرية هويته:'
                  : 'For operational projects proposed on platform, the Idea Owner is designated while keeping their identity protected:'}
              </p>
            </div>

            {/* Split Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-gradient-to-b from-primary-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-primary-500 text-center">
                <span className="text-4xl font-black text-primary-600 dark:text-primary-400 block mb-2">70%</span>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">{isAr ? 'المستثمرون المشاركون' : 'Investors Share'}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                  {isAr ? 'حصة المساهمين بتمويل المشروع وتوزع الأرباح حسب عدد الحصص.' : 'Equity distributed to participating investors.'}
                </p>
              </div>

              <div className="p-5 bg-gradient-to-b from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-amber-500 text-center">
                <span className="text-4xl font-black text-amber-600 dark:text-amber-400 block mb-2">15%</span>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">{isAr ? 'صاحب فكرة المشروع' : 'Idea Owner'}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                  {isAr ? 'تخصص لصاحب الفكرة المختار من مستخدمي المنصة (هويته سرية للمستثمرين).' : 'Reserved for Idea Owner (Identity remains private from investors).'}
                </p>
              </div>

              <div className="p-5 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-indigo-500 text-center">
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 block mb-2">15%</span>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">{isAr ? 'حصة المنصة' : 'Platform Share'}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                  {isAr ? 'مقابل الإشراف والبرمجة والإدارة الفنية والتطوير.' : 'Covers technical oversight, platform & maintenance.'}
                </p>
              </div>
            </div>

            {/* Key Features */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-2 text-xs text-gray-700 dark:text-slate-300">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{isAr ? 'ضوابط شروط المشروع التشغيلي:' : 'Operational Rules & Privacy:'}</h4>
              <p>• 🔒 <strong>سرية صاحب الفكرة:</strong> لا يمكن للمستثمرين الاطلاع على اسم أو معلومات صاحب الفكرة حمايةً لخصوصيته ولأمان المشروع.</p>
              <p>• ⏱️ <strong>المدة الزمنية والمساهمة:</strong> يحدد صاحب الفكرة بالاتفاق مع المنصة المدة الزمنية المستهدفة ونسبة المساهمة المطلوبة للبدء.</p>
              <p>• 💼 <strong>رسوم الإدارة:</strong> تحصل المنصة على 2% رسوم إدارة ثابتة من كافة توزيعات الأرباح.</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
