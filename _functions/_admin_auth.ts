/**
 * Admin auth helpers for /admin/* routes.
 *
 * Protects the claim-review UI + mutation endpoints behind a single
 * shared password stored in the ADMIN_PASSWORD CF Pages env var.
 *
 * Cookie-based: client POSTs password to /api/admin/login, we set
 * admin_password=<password> as HttpOnly/Secure/SameSite=Strict cookie
 * with 8h expiry. Every admin-protected endpoint checks the cookie
 * using constant-time comparison to prevent timing attacks.
 *
 * This is intentionally simple (no sessions table, no JWT, no IDP).
 * Admin actions are rare and audited via reviewed_at/reviewed_by in
 * pending_claims — per-action authentication isn't worth the
 * complexity. Rotate ADMIN_PASSWORD whenever operators change.
 */
import type { Env } from './_types';

const ADMIN_COOKIE = 'admin_password';
const COOKIE_MAX_AGE_SEC = 60 * 60 * 8; // 8h

function extractCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isAdminAuthenticated(request: Request, env: Env): boolean {
  const expected = env.ADMIN_PASSWORD;
  if (!expected) return false;
  const cookie = request.headers.get('Cookie') || '';
  const provided = extractCookie(cookie, ADMIN_COOKIE);
  if (!provided) return false;
  return constantTimeEquals(provided, expected);
}

export function adminCookieHeader(password: string): string {
  return [
    `${ADMIN_COOKIE}=${encodeURIComponent(password)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${COOKIE_MAX_AGE_SEC}`,
  ].join('; ');
}

export function adminClearCookieHeader(): string {
  return [
    `${ADMIN_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Max-Age=0',
  ].join('; ');
}

export function adminJsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function requireAdmin(request: Request, env: Env): Response | null {
  if (!isAdminAuthenticated(request, env)) {
    return adminJsonResponse({ error: 'Unauthorized' }, 401);
  }
  return null;
}
