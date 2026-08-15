'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone, ExternalLink, X, Settings } from 'lucide-react';
import { TickerItem } from '@/types/ticker';
import { getTickerItems } from '@/utils/tickerStorage';
import { useAuth } from '@/contexts/AuthContext';

export default function TickerBanner() {
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  const loadTickers = () => {
    const all = getTickerItems();
    const active = all.filter((item) => item.isActive);
    setTickers(active);
  };

  useEffect(() => {
    setMounted(true);
    loadTickers();

    const handleUpdate = () => {
      loadTickers();
    };

    window.addEventListener('tickerUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('tickerUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!mounted || !isVisible || tickers.length === 0) {
    return null;
  }

  // Duplicate the array twice to ensure continuous seamless marquee scrolling from 0% to -50%
  const displayItems = [...tickers, ...tickers];

  return (
    <div className="bg-gradient-to-r from-amber-600 via-primary-700 to-indigo-800 text-white shadow-md relative z-40 overflow-hidden border-b border-white/10 select-none">
      <div className="max-w-7xl mx-auto flex items-center h-10 px-3 sm:px-4 text-xs md:text-sm font-medium">
        {/* Ticker Fixed Header Label */}
        <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-2.5 py-1 rounded-md text-amber-300 font-bold shrink-0 z-10 border border-white/15 shadow-sm ml-2 sm:ml-4">
          <Megaphone size={15} className="text-amber-400 animate-pulse" />
          <span className="hidden xs:inline">إعلانات طامورة</span>
          <span className="xs:hidden">إعلانات</span>
        </div>

        {/* Scrolling Track Container */}
        <div className="flex-1 overflow-hidden relative flex items-center h-full">
          <div className="animate-ticker-rtl items-center gap-8 py-1">
            {displayItems.map((item, index) => {
              const ContentElement = (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center gap-2.5 shrink-0 hover:text-amber-200 transition-colors cursor-pointer group"
                >
                  {/* Tag Badge */}
                  {item.tag && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-400 text-gray-950 shadow-sm group-hover:scale-105 transition-transform">
                      {item.tag}
                    </span>
                  )}

                  {/* Image / GIF */}
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt="شعار الإعلان"
                      className="h-6 w-auto max-w-[80px] object-contain rounded bg-white/10 p-0.5 border border-white/20 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}

                  {/* Text */}
                  <span className="whitespace-nowrap tracking-wide font-normal drop-shadow-sm">
                    {item.text}
                  </span>

                  {/* Link Icon Indicator */}
                  {item.linkUrl && (
                    <ExternalLink size={12} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                  )}

                  {/* Separator */}
                  <span className="text-amber-300/60 mr-4 font-extrabold text-xs">✨</span>
                </div>
              );

              if (item.linkUrl) {
                return (
                  <Link href={item.linkUrl} key={`${item.id}-${index}`}>
                    {ContentElement}
                  </Link>
                );
              }

              return ContentElement;
            })}
          </div>
        </div>

        {/* Admin Quick Action & Close Buttons */}
        <div className="flex items-center gap-1 shrink-0 z-10 mr-2 border-r border-white/20 pr-2">
          {user?.role === 'admin' && (
            <Link
              href="/admin/tickers"
              className="p-1 hover:bg-white/20 rounded-md text-amber-200 hover:text-white transition-colors"
              title="إدارة شريط الإعلانات"
            >
              <Settings size={15} />
            </Link>
          )}

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-md text-white/80 hover:text-white transition-colors"
            title="إغلاق الشريط"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
