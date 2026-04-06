const COOKIE_NAME = "token";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(COOKIE_NAME);
}

export function setToken(token: string) {
  localStorage.setItem(COOKIE_NAME, token);
  // Also set as cookie so Next.js middleware can read it
  setCookie(COOKIE_NAME, token);
}

export function removeToken() {
  localStorage.removeItem(COOKIE_NAME);
  deleteCookie(COOKIE_NAME);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getSellerId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
