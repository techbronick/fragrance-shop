// Service-role Supabase client for Vercel Functions ONLY.
// SUPABASE_SERVICE_ROLE_KEY must never be VITE_-prefixed (see SECURITY_SETUP.md):
// it lives in server env vars and bypasses RLS, so only use it after the
// request has been authorised by the calling function.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/** Test seam: scripts/maib/sandbox-e2e.ts swaps in an in-memory database. */
export function setSupabaseAdminForTests(fake: SupabaseClient): void {
  client = fake;
}

export function supabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Returns the user id if the bearer token belongs to a row in admin_users. */
export async function requireAdmin(request: Request): Promise<string | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const db = supabaseAdmin();
  const { data: userData, error } = await db.auth.getUser(token);
  if (error || !userData?.user) return null;
  const { data: admin } = await db
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  return admin ? userData.user.id : null;
}
