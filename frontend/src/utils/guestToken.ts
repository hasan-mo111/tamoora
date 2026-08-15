export interface GuestToken {
  role: 'guest';
  id: string;
  exp: number;
}

const GUEST_TOKEN_KEY = 'guestToken';
const TOKEN_EXPIRY_DAYS = 7;

export function createGuestToken(): GuestToken {
  if (typeof window === 'undefined') {
    throw new Error('Cannot create guest token on the server');
  }
  
  const token: GuestToken = {
    role: 'guest',
    id: 'guest_' + crypto.randomUUID(),
    exp: Date.now() + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  };
  
  localStorage.setItem(GUEST_TOKEN_KEY, JSON.stringify(token));
  return token;
}

export function getAuthToken(): string | null {
  // 🛡️ حماية: إرجاع null أثناء البناء (SSR/SSG)
  if (typeof window === 'undefined') {
    return null;
  }

  const userToken = localStorage.getItem('accessToken');
  if (userToken) return userToken;

  const guestTokenStr = localStorage.getItem(GUEST_TOKEN_KEY);
  if (guestTokenStr) {
    try {
      const guestToken: GuestToken = JSON.parse(guestTokenStr);
      if (guestToken.exp > Date.now()) {
        return `guest_${guestToken.id}`;
      }
      localStorage.removeItem(GUEST_TOKEN_KEY);
    } catch {
      localStorage.removeItem(GUEST_TOKEN_KEY);
    }
  }

  // ✅ لا تنشئ token هنا — أرجع null ودع الصفحة تنشئه عند الحاجة
  return null;
}

export function isGuest(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userToken = localStorage.getItem('accessToken');
  if (userToken) return false;
  
  const guestTokenStr = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!guestTokenStr) return true;
  
  try {
    const guestToken: GuestToken = JSON.parse(guestTokenStr);
    return guestToken.exp > Date.now();
  } catch {
    return true;
  }
}

export function clearGuestToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_TOKEN_KEY);
}

export function ensureGuestToken(): string {
  if (typeof window === 'undefined') return '';
  
  const existing = getAuthToken();
  if (existing) return existing;
  
  const newToken = createGuestToken();
  return `guest_${newToken.id}`;
}
