const SESSION_KEY = 'finance_tracker_session';

const CREDENTIALS = {
  login: 'admin',
  password: 'fintrack2026',
};

export function verifyCredentials(login: string, password: string): boolean {
  return login === CREDENTIALS.login && password === CREDENTIALS.password;
}

export function getUsername(): string {
  return CREDENTIALS.login;
}

export function setSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, Date.now().toString());
}

export function hasSession(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SESSION_KEY) !== null;
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}
