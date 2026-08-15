'use client';
import Link from 'next/link';
import { Mail, Phone, MapPin, Headset } from 'lucide-react';
import { useThemeLanguage } from '@/contexts/ThemeLanguageContext';
import CoinLogo from './CoinLogo';

export default function Footer() {
  const { t, lang } = useThemeLanguage();
  const isEn = lang === 'en';

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-gray-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <CoinLogo size={42} />
              <h3 className="text-2xl font-extrabold text-white">{isEn ? 'Tamoora' : 'طامورة'}</h3>
            </div>
            <p className="text-gray-400 leading-relaxed mb-4 text-sm md:text-base">
              {t('footer.desc')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/investments" className="hover:text-primary-400 transition-colors">
                  {t('nav.investments')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-400 transition-colors">
                  {t('nav.terms')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition-colors">
                  {t('nav.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">{t('footer.contactUs')}</h4>
            <ul className="space-y-3 text-sm mb-5">
              <li className="flex items-center gap-2">
                <Mail size={18} className="text-primary-500" />
                <span>tamoora.sy@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 pt-1">
                <a
                  href="tel:+963936834823"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-900/30 hover:brightness-110 transition-all duration-200 group"
                  title={isEn ? 'Live Support Team (+963 936834823)' : 'فريق الدعم المباشر - Support Team (+963 936834823)'}
                >
                  <Headset size={17} className="text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span>{isEn ? 'Support Team' : 'فريق الدعم'}</span>
                  <span className="text-[10px] text-emerald-100 font-normal dir-ltr">(+963 936834823)</span>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={18} className="text-primary-500 mt-1" />
                <span>{isEn ? 'Latakia, Syria' : 'اللاذقية، سوريا'}</span>
              </li>
            </ul>

            {/* Social Media Links: Facebook, WhatsApp, Instagram */}
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-xs text-gray-400 font-semibold mb-3">
                {isEn ? 'Follow & connect with us via:' : 'تابعنا وتواصل معنا عبر:'}
              </p>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=61592649812651"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-200 group"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/+963936834823"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-200 group"
                  title="WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/tamoora.sy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-pink-600/20 text-pink-400 border border-pink-500/30 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-200 group"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* QR Codes Section for Email & Facebook */}
        <div className="border-t border-slate-800/80 mt-10 pt-6">
          <p className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-2">
            <span>
              {isEn
                ? '📱 Scan QR code for direct contact and fast support:'
                : '📱 امسح الباركود للتواصل المباشر والمتابعة السريعة:'}
            </span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {/* Email QR Code */}
            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl flex items-center gap-3 shadow-md">
              <div className="p-1.5 bg-white rounded-xl flex-shrink-0">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=mailto:tamoora.sy@gmail.com"
                  alt="Email QR Code"
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {isEn ? 'Email QR Code' : 'باركود البريد الإلكتروني'}
                </p>
                <p className="text-[11px] text-gray-400 truncate dir-ltr text-right">tamoora.sy@gmail.com</p>
                <a
                  href="mailto:tamoora.sy@gmail.com"
                  className="inline-block mt-1 text-[11px] text-primary-400 hover:text-primary-300 font-bold"
                >
                  {isEn ? 'Send Email ✉️' : 'إرسال بريد ✉️'}
                </a>
              </div>
            </div>

            {/* Facebook QR Code */}
            <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl flex items-center gap-3 shadow-md">
              <div className="p-1.5 bg-white rounded-xl flex-shrink-0">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://www.facebook.com/profile.php?id=61592649812651"
                  alt="Facebook QR Code"
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {isEn ? 'Facebook Page QR Code' : 'باركود صفحة الفيسبوك'}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {isEn ? 'Tamoora Investment' : 'طامورة للاستثمار'}
                </p>
                <a
                  href="https://www.facebook.com/profile.php?id=61592649812651"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-[11px] text-blue-400 hover:text-blue-300 font-bold"
                >
                  {isEn ? 'Open Page 👍' : 'فتح الصفحة 👍'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
