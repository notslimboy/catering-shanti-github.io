import { createClient } from "@supabase/supabase-js";
import { runGoogleReviewsSync } from "@/lib/server/google-review-snapshot";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && serviceRoleKey);

const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

const profileUrl = process.env.GOOGLE_BUSINESS_PROFILE_URL;
const isValidProfileUrl = (() => {
  if (!profileUrl) return false;
  try {
    const hostname = new URL(profileUrl).hostname.toLowerCase();
    return new URL(profileUrl).protocol === "https:" && (hostname === "maps.app.goo.gl" || hostname === "g.page" || hostname === "google.com" || hostname.endsWith(".google.com"));
  } catch { return false; }
})();
const googleConfig = process.env.GOOGLE_BUSINESS_CLIENT_ID && process.env.GOOGLE_BUSINESS_CLIENT_SECRET && process.env.GOOGLE_BUSINESS_REFRESH_TOKEN && process.env.GOOGLE_BUSINESS_ACCOUNT_ID && process.env.GOOGLE_BUSINESS_LOCATION_ID && isValidProfileUrl
  ? {
      clientId: process.env.GOOGLE_BUSINESS_CLIENT_ID,
      clientSecret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_BUSINESS_REFRESH_TOKEN,
      accountId: process.env.GOOGLE_BUSINESS_ACCOUNT_ID,
      locationId: process.env.GOOGLE_BUSINESS_LOCATION_ID,
    }
  : null;

const sync = supabase
  ? runGoogleReviewsSync({ supabase, googleConfig, profileUrl: isValidProfileUrl ? profileUrl! : null })
  : Promise.resolve({ status: "unavailable", published: false, attemptedAt: new Date().toISOString(), nextDueAt: null, reviewCount: null });

sync
  .then((result) => {
    console.info(JSON.stringify(result));
    process.exitCode = result.status === "success" || result.status === "not_due" ? 0 : 1;
  })
  .catch(() => {
    console.error("Google review snapshot sync failed.");
    process.exitCode = 1;
  });
