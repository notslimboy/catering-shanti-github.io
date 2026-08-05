import "server-only";

import { unstable_cache } from "next/cache";
import { hasGoogleBusinessReviewsConfig, serverConfig } from "@/lib/server/config";
import { getSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase/server";
import {
  readGoogleReviewsData,
  runGoogleReviewsSync as runCoreGoogleReviewsSync,
  toPublicGoogleReviewsData,
  type GoogleReviewSyncResult,
} from "@/lib/server/google-review-snapshot";

const getCachedPublishedSnapshot = unstable_cache(
  async () => readGoogleReviewsData(getSupabaseAdmin()),
  ["google-reviews-current"],
  { tags: ["google-reviews"] },
);

function withTimeout<T>(promise: Promise<T>, milliseconds: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("snapshot_read_timeout")), milliseconds)),
  ]);
}

export async function getPublishedGoogleReviewsSnapshot() {
  if (!hasSupabaseConfig()) return { state: "fresh_setup" as const, snapshot: null, profileUrl: null };
  try {
    // The cached record contains expiresAt; this validation intentionally runs
    // outside the cache so a cached result can never outlive its snapshot.
    return toPublicGoogleReviewsData(await withTimeout(getCachedPublishedSnapshot(), 1_200));
  } catch {
    return { state: "unavailable" as const, snapshot: null, profileUrl: null };
  }
}

export async function runGoogleReviewsSync(): Promise<GoogleReviewSyncResult> {
  const attemptedAt = new Date().toISOString();
  if (!hasSupabaseConfig()) {
    return { status: "unavailable", published: false, attemptedAt, nextDueAt: null, reviewCount: null };
  }

  return runCoreGoogleReviewsSync({
    supabase: getSupabaseAdmin(),
    googleConfig: hasGoogleBusinessReviewsConfig()
      ? {
          clientId: serverConfig.googleBusinessClientId!,
          clientSecret: serverConfig.googleBusinessClientSecret!,
          refreshToken: serverConfig.googleBusinessRefreshToken!,
          accountId: serverConfig.googleBusinessAccountId!,
          locationId: serverConfig.googleBusinessLocationId!,
        }
      : null,
    profileUrl: serverConfig.googleBusinessProfileUrl ?? null,
  });
}
