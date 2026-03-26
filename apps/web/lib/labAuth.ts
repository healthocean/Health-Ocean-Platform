// Lab Authentication utility functions

export interface Lab {
  labId: string;
  name: string;
  email: string;
  status: string;
  city: string;
}

export interface LabEmployee {
  employeeId: string;
  name: string;
  email: string;
  role: string;
  labId: string;
}

export const getLabToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('labToken');
};

export const getLab = (): Lab | null => {
  if (typeof window === 'undefined') return null;
  const labStr = localStorage.getItem('lab');
  if (!labStr) return null;
  try {
    return JSON.parse(labStr);
  } catch {
    return null;
  }
};

export const getEmployeeToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('employeeToken');
};

export const getEmployee = (): LabEmployee | null => {
  if (typeof window === 'undefined') return null;
  const empStr = localStorage.getItem('employee');
  if (!empStr) return null;
  try {
    return JSON.parse(empStr);
  } catch {
    return null;
  }
};

export const setLabAuth = (token: string, lab: Lab): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('labToken', token);
  localStorage.setItem('lab', JSON.stringify(lab));
};

export const setEmployeeAuth = (token: string, employee: LabEmployee): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('employeeToken', token);
  localStorage.setItem('employee', JSON.stringify(employee));
};

export const clearLabAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('labToken');
  localStorage.removeItem('lab');
};

export const clearEmployeeAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('employeeToken');
  localStorage.removeItem('employee');
};

export const isLabAuthenticated = (): boolean => {
  return !!getLabToken() && !!getLab();
};

export const isEmployeeAuthenticated = (): boolean => {
  return !!getEmployeeToken() && !!getEmployee();
};
