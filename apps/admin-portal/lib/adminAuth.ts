// Admin Authentication utility functions

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'SuperAdmin' | 'Admin' | 'Manager';
}

export const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
};

export const getAdmin = (): Admin | null => {
  if (typeof window === 'undefined') return null;
  const adminStr = localStorage.getItem('admin');
  if (!adminStr) return null;
  try {
    return JSON.parse(adminStr);
  } catch {
    return null;
  }
};

export const setAdminAuth = (token: string, admin: Admin): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('adminToken', token);
  localStorage.setItem('admin', JSON.stringify(admin));
};

export const clearAdminAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin');
};

export const isAdminAuthenticated = (): boolean => {
  return !!getAdminToken() && !!getAdmin();
};
