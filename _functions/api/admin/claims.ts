/**
 * GET /api/admin/claims
 *
 * Returns all pending_claims (pending + recently-reviewed) with the
 * joined provider email. Used by /admin/ page to render the review
 * table. Admin-only: requires admin_password cookie.
 */
import type { Env } from '../../_types';
import { requireAdmin, adminJsonResponse } from '../../_admin_auth';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  // Pending first, then recently reviewed. Cap at 200 so a listing with
  // 100+ junk claim attempts doesn't blow out the response.
  const rows = await env.LEADS_DB.prepare(
    `SELECT pc.id, pc.listing_slug, pc.reason, pc.created_at,
            pc.decision, pc.reviewed_at, pc.reviewed_by, pc.notes,
            p.id AS provider_id, p.email AS provider_email
     FROM pending_claims pc
     LEFT JOIN providers p ON pc.provider_id = p.id
     ORDER BY (pc.decision IS NULL) DESC, pc.created_at DESC
     LIMIT 200`,
  ).all();

  return adminJsonResponse({ claims: rows.results || [] }, 200);
};
