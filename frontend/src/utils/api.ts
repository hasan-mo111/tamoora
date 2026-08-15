import { getAuthToken, isGuest } from './guestToken';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requireAuth?: boolean;
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, requireAuth = false } = options;

  // التحقق من الصلاحيات
  if (requireAuth && isGuest()) {
    throw new Error('يجب تسجيل الدخول للوصول إلى هذا المورد');
  }

  const token = getAuthToken();
  
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: any = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'حدث خطأ' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Helper functions
export const api = {
  get: (endpoint: string) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) => apiCall(endpoint, { method: 'POST', body }),
  put: (endpoint: string, body: any) => apiCall(endpoint, { method: 'PUT', body }),
  delete: (endpoint: string) => apiCall(endpoint, { method: 'DELETE' }),
};