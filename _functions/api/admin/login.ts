/**
 * POST /api/admin/login
 * Body: { password: string }
 *
 * Validates against env.ADMIN_PASSWORD. On success, sets the
 * admin_password cookie with 8h TTL. On failure, returns 401.
 *
 * Rate-limited naturally by ADMIN_PASSWORD being a long random string;
 * brute force is impractical. No explicit rate limiter since this route
 * sees maybe a dozen requests per day.
 */
import type { Env } from '../../_types';
import { adminCookieHeader, adminJsonResponse } from '../../_admin_auth';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const expected = env.ADMIN_PASSWORD;
  if (!expected) {
    return adminJsonResponse({ error: 'Admin login not configured on this deployment' }, 503);
  }

  let payload: { password?: string };
  try {
    payload = await request.json();
  } catch {
    return adminJsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const provided = (payload.password || '').trim();
  if (!provided) return adminJsonResponse({ error: 'Password required' }, 400);

  // constant-time compare inline — avoid pulling helper into this small
  // endpoint since we'd just be re-implementing the same thing.
  if (provided.length !== expected.length) {
    return adminJsonResponse({ error: 'Invalid password' }, 401);
  }
  let diff = 0;
  for (let i = 0; i < provided.length; i++) diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) {
    return adminJsonResponse({ error: 'Invalid password' }, 401);
  }

  return adminJsonResponse(
    { ok: true },
    200,
    { 'Set-Cookie': adminCookieHeader(provided) },
  );
};
