'use client';
import { useState } from 'react';
import {
  PenTool, CheckCircle, AlertCircle,
  FileText, ShieldCheck
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SignatureCanvas from '@/components/ui/SignatureCanvas';
import { API_BASE } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';

interface ContractSignatureProps {
  signed: boolean;
  signedAt: string | null;
  emailVerified: boolean;
  onSigned: () => void;
}

const CONTRACT_VERSION = 'v2.0';

const CONTRACT_TEXT = `عقد استثمار تشاركي — منصة طامورة
الإصدار 2.0 (v2.0)

أنا الموقع أدناه، بصفتي مشتركاً ومستثمراً في منصة طامورة للأعمال التجارية التشاركية، أقر وأوافق على البنود والشروط التالية:

المادة 1: الحساب الواحد والمشروعات المتعددة
يحق للمشترك فتح حساب واحد فقط يتم من خلاله الاشتراك بالخطط والاستثمارات بما يتناسب مع رأس ماله، حيث يمكنه الاشتراك بأكثر من خطة أو مشروع وفق برامج العمل المتاحة.

المادة 2: خصوصية وأمان الحسابات
يتحمل المشترك كامل المسؤولية عن سرية بيانات حسابه ورمز الأمان (PIN) وعدم مشاركتها مع أي طرف آخر لضمان الحماية ومنع الأخطاء التقنية.

المادة 3: رسوم الإدارة وصندوق التحوط (25%)
يتم تخطيط وتنظيم وإدارة المشاريع من قبل الفريق الاقتصادي في الشركة حصراً، وتتقاضى الشركة نسبة (25%) كرسوم إدارة ومتابعة وتنفيذ وصندوق تحوط تقتطع لمرة واحدة عن كل خطة أو استثمار.

المادة 4: تفعيل الخطط واحتساب الأرباح
يتم تفعيل خطة الأرباح المعتمدة في الصفقات والاستثمارات بعد مضي 24 ساعة من تأكيد الاشتراك والإيداع، وتُوزع الأرباح وفق الجداول الزمنية لكل خطة.

المادة 5: المهام اليومية والالتزام
في حال وجود مهام يومية محددة ضمن الخطة، فإن التأخر أو الامتناع عن تفعيل المهمة في يوم ما يؤدي إلى تعليق أرباح ذلك اليوم المحدد فقط دون المساس بباقي الأيام.

المادة 6: ضوابط سحب الأرباح (80% من صافي الأرباح)
يحق للمشترك سحب أرباحه بنسبة تصل إلى 80% من صافي الأرباح المحققة أثناء سريان مدة الاشتراك، بشكل دوري (أسبوعي أو شهري) عبر القنوات المالية المعتمدة.

المادة 7: فترة الاستثمار وتحرير رأس المال (4 أشهر)
مدة دورة الاستثمار الأساسية هي أربعة (4) أشهر من تاريخ الاشتراك، وبعد انقضائها يحق للمشترك سحب كامل رأس المال والأرباح المتبقية (100%). وفي حال طلب الانسحاب المبكر، تتوقف الأرباح فوراً ويُعاد رأس المال الأصلي فقط بعد انقضاء مدة الأربعة أشهر.

المادة 8: عدم تراكمية الأرباح وإعادة الاشتراك
الأرباح غير تراكمية تلقائياً؛ ولتفعيل خطط جديدة يتوجب تخصيص المبالغ المطلوبة. كما يحق للمشترك إعادة الاشتراك بعد انتهاء دورته الاستثمارية وفق الشروط السائدة.

المادة 9: حالات الإخلال وسوء الاستخدام
تحتفظ إدارة المنصة بالحق في إيقاف أي حساب وإلغاء الأرباح الناتجة عن أي تلاعب أو إساءة استخدام لأنظمة المنصة، مع إعادة رأس المال الأصلي لصاحبه وفق الأصول.

المادة 10: الطبيعة القانونية والتحكيم
يُعد هذا العقد والإيصالات والبيانات الإلكترونية الصادرة عن المنصة وثائق رسمية ملزمة للطرفين، وتخضع لأحكام وقوانين الأعمال التجارية التشاركية.

الإقرار والموافقة:
بالتوقيع الإلكتروني أدناه، أقر بأنني قرأت وفهمت جميع بنود هذا العقد (المواد 1 إلى 10) وأوافق عليها موافقة تامة ونهائية لا رجعة فيها.`;

const CONTRACT_TEXT_EN = `Participatory Investment Contract — Tamoora Platform
Version 2.0 (v2.0)

I, the undersigned, as a registered participant and investor on the Tamoora Platform for Participatory Commercial Business, hereby acknowledge and agree to the following terms and conditions:

Article 1: Single Account & Multiple Projects
The participant is entitled to open only one account, through which they can subscribe to available investment plans and projects matching their capital according to operational guidelines.

Article 2: Account Privacy & Security
The participant bears full responsibility for maintaining the confidentiality of account credentials and security PIN, and agrees not to share them with any third party to ensure data protection and prevent errors.

Article 3: Management Fees & Hedge Fund (25%)
All commercial operations are exclusively planned and executed by the company’s economic team. The company receives a one-time 25% fee per investment plan covering management, monitoring, execution, and hedge buffer.

Article 4: Plan Activation & Profit Calculation
Approved profit plans activate 24 hours after deposit and subscription confirmation. Profits are distributed in accordance with the specified schedule of each plan.

Article 5: Daily Tasks & Compliance
Where daily tasks are assigned under a plan, delay or failure to complete a daily task results in withholding profits for that specific day only, without affecting other days.

Article 6: Profit Withdrawal Limit (80% Net Profit)
The participant is entitled to withdraw up to 80% of net earned profits during the active subscription period, on weekly or monthly cycles via approved financial gateways.

Article 7: Investment Term & Capital Release (4 Months)
The standard investment cycle is four (4) months from the subscription date. Upon completion, the participant may withdraw 100% of capital and remaining profits. In case of early exit, profit accrual stops immediately and the original principal is refunded only after the 4-month period expires.

Article 8: Non-Cumulative Profits & Re-subscription
Profits are non-cumulative by default. Activating new plans requires manual allocation. Participants may re-subscribe to any available plans upon completion of their investment term.

Article 9: Misconduct & Breach of Terms
Platform management reserves the right to suspend any account and void illegitimate profits in the event of manipulation or system abuse, returning the original principal balance.

Article 10: Legal Nature & Binding Agreement
This electronic contract and all related platform receipts constitute an official legally binding agreement between both parties subject to commercial participatory laws.

Acknowledgment & Consent:
By signing below, I certify that I have read, understood, and irrevocably agree to all terms and articles (Articles 1 through 10) of this agreement.`;

export default function ContractSignature({
  signed,
  signedAt,
  emailVerified,
  onSigned,
}: ContractSignatureProps) {
  const { token } = useAuth();
  const { lang } = useThemeLanguage();
  const isEn = lang === 'en';
  const [showContract, setShowContract] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!agreed) {
      setError(isEn ? 'You must agree to contract terms first' : 'يجب الموافقة على بنود العقد أولاً');
      return;
    }
    if (!signature) {
      setError(isEn ? 'Please add your signature first' : 'يجب إضافة التوقيع أولاً');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/users/sign-contract`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature,
          version: CONTRACT_VERSION,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || (isEn ? 'Failed to sign contract' : 'فشل توقيع العقد'));

      onSigned();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // حالة: موقّع
  if (signed) {
    return (
      <Card className="p-6 border-success/30 bg-success/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-success" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">{isEn ? 'Electronic Contract' : 'العقد الإلكتروني'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEn
                ? `Signed on ${signedAt ? new Date(signedAt).toLocaleDateString('en-US') : ''}`
                : `تم التوقيع ${signedAt ? `بتاريخ ${new Date(signedAt).toLocaleDateString('ar-SA')}` : ''}`}
            </p>
          </div>
          <Badge variant="success">{isEn ? 'Signed ✓' : 'موقّع ✓'}</Badge>
        </div>
      </Card>
    );
  }

  // حالة: البريد غير موثّق
  if (!emailVerified) {
    return (
      <Card className="p-6 border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <PenTool className="text-gray-400 dark:text-slate-500" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-500 dark:text-slate-400">{isEn ? 'Electronic Contract' : 'العقد الإلكتروني'}</h3>
            <p className="text-sm text-gray-400 dark:text-slate-500">
              {isEn
                ? 'Please verify your email address first before signing the contract'
                : 'يجب التحقق من البريد الإلكتروني أولاً قبل توقيع العقد'}
            </p>
          </div>
          <Badge variant="secondary">{isEn ? 'Locked 🔒' : 'مقفل 🔒'}</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/50 rounded-xl flex items-center justify-center">
          <PenTool className="text-primary-600 dark:text-primary-400" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white">{isEn ? 'Sign Electronic Contract' : 'توقيع العقد الإلكتروني'}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{isEn ? `Version ${CONTRACT_VERSION}` : `الإصدار ${CONTRACT_VERSION}`}</p>
        </div>
        <Badge variant="warning">{isEn ? 'Required' : 'مطلوب'}</Badge>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 text-error text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* نص العقد */}
      {!showContract ? (
        <Button
          variant="outline"
          onClick={() => setShowContract(true)}
          className="w-full mb-4"
        >
          <FileText size={18} className="ml-2" />
          {isEn ? 'View Contract Text' : 'عرض نص العقد'}
        </Button>
      ) : (
        <div className="mb-5">
          <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 max-h-52 overflow-y-auto mb-4">
            <pre className="text-sm text-gray-700 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
              {isEn ? CONTRACT_TEXT_EN : CONTRACT_TEXT}
            </pre>
          </div>

          {/* الموافقة */}
          <label className="flex items-start gap-3 cursor-pointer mb-5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-slate-300">
              {isEn
                ? 'I acknowledge that I have read, understood, and agree to all the terms of the contract above'
                : 'أقر بأنني قرأت وفهمت جميع بنود العقد أعلاه وأوافق عليها'}
            </span>
          </label>

          {/* التوقيع */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              {isEn ? 'Digital Signature' : 'التوقيع الإلكتروني'}
            </label>
            <SignatureCanvas
              onSave={dataUrl => {
                setSignature(dataUrl);
                setError('');
              }}
            />
            {signature && (
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                <CheckCircle size={14} />
                {isEn ? 'Signature saved' : 'تم حفظ التوقيع'}
              </p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!agreed || !signature}
            className="w-full"
          >
            <ShieldCheck size={18} className="ml-2" />
            {isEn ? 'Sign Contract & Agree' : 'توقيع العقد والموافقة'}
          </Button>
        </div>
      )}
    </Card>
  );
}
