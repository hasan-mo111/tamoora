import { TickerItem } from '@/types/ticker';

const STORAGE_KEY = 'tamoura_ticker_items';

const DEFAULT_TICKERS: TickerItem[] = [
  {
    id: 'ticker-1',
    text: '🎉 انضم إلى أكثر من 1,200 مستثمر وحقق عوائد مستقرة مع خطة الأرباح اليومية الجديدة!',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    linkUrl: '/investments',
    tag: 'عاجل',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ticker-2',
    text: '🔥 عرض خاص: احصل على حوافز إضافية عند الاستثمار في الأسهم الشهرية هذا الأسبوع!',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/1041/1041883.png',
    linkUrl: '/investments',
    tag: 'عرض خاص',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ticker-3',
    text: '⚡ تم اعتماد وسيلة الإيداع المباشر وسرعة معالجة السحوبات خلال ساعات قليل!',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png',
    linkUrl: '/dashboard/wallet',
    tag: 'تحديث',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function getTickerItems(): TickerItem[] {
  if (typeof window === 'undefined') return DEFAULT_TICKERS;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TICKERS));
      return DEFAULT_TICKERS;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_TICKERS;
  } catch (error) {
    console.error('Error reading ticker items from storage:', error);
    return DEFAULT_TICKERS;
  }
}

export function saveTickerItems(items: TickerItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('tickerUpdated'));
  } catch (error) {
    console.error('Error saving ticker items to storage:', error);
  }
}

export function addTickerItem(item: Omit<TickerItem, 'id' | 'createdAt'>): TickerItem {
  const current = getTickerItems();
  const newItem: TickerItem = {
    ...item,
    id: `ticker-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newItem, ...current];
  saveTickerItems(updated);
  return newItem;
}

export function updateTickerItem(id: string, updates: Partial<TickerItem>): TickerItem[] {
  const current = getTickerItems();
  const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
  saveTickerItems(updated);
  return updated;
}

export function deleteTickerItem(id: string): TickerItem[] {
  const current = getTickerItems();
  const updated = current.filter(item => item.id !== id);
  saveTickerItems(updated);
  return updated;
}
