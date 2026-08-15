'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Wallet, 
  LogOut,
  ChevronLeft,
  Shield,
  Megaphone,
  ShieldCheck,
  FileCheck,
  Lightbulb,
  FileSearch,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const menuItems = [
    { href: '/admin', label: 'نظرة عامة', icon: LayoutDashboard },
    { href: '/admin/users', label: 'المستخدمين', icon: Users },
    { href: '/admin/kyc', label: 'التحقق من الهوية', icon: ShieldCheck },
    { href: '/admin/contracts', label: 'العقود الإلكترونية', icon: FileCheck },
    { href: '/admin/transactions', label: 'المعاملات والسحوبات', icon: Wallet },
    { href: '/admin/investments', label: 'خطط الاستثمار', icon: TrendingUp },
    { href: '/admin/proposals', label: 'اقتراحات المشاريع', icon: Lightbulb },
    { href: '/admin/audit-logs', label: 'سجل التدقيق والأمان', icon: FileSearch },
    { href: '/admin/tickers', label: 'شريط الإعلانات', icon: Megaphone },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col md:flex-row max-w-full overflow-x-hidden text-slate-800 dark:text-slate-100">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex bg-white dark:bg-slate-800 shadow-lg border-l border-slate-200 dark:border-slate-700 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } flex-col shrink-0 sticky top-0 h-screen overflow-y-auto z-20`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <Shield size={22} />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">لوحة الأدمن</h1>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-bold">منصة طامورة</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1.5">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all font-semibold ${
                isActive(item.href)
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 w-full"
          >
            <ChevronLeft size={20} className={`transition-transform shrink-0 ${isCollapsed ? 'rotate-180' : ''}`} />
            {!isCollapsed && <span>طي القائمة</span>}
          </button>

          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <Globe size={20} className="shrink-0 text-indigo-500" />
            {!isCollapsed && <span>العودة للموقع</span>}
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 w-full"
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Slide-out menu for mobile) */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white">لوحة الأدمن</h1>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-bold">منصة طامورة</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive(item.href)
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <Globe size={20} className="text-indigo-500 shrink-0" />
            <span>العودة للموقع الرئيسي</span>
          </Link>
          <button
            onClick={() => {
              setIsMobileOpen(false);
              logout();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 w-full"
          >
            <LogOut size={20} className="shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-4 md:px-8 py-3.5 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                aria-label="القائمة"
              >
                <Menu size={22} />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {menuItems.find((item) => isActive(item.href))?.label || 'لوحة الأدمن'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-md">
                  مرحباً، {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-left hidden sm:block">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                  {user?.email}
                </p>
                <p className="text-[10px] sm:text-xs text-primary-600 dark:text-primary-400 font-semibold">
                  مدير النظام
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white font-black text-sm sm:text-base shrink-0 shadow-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 min-w-0 w-full max-w-full overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}