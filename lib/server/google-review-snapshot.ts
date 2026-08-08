import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchGoogleReviews, type GoogleBusinessReviewsConfig } from "@/lib/google-business-reviews-core";
import { type GoogleReview, type GoogleReviewSummary } from "@/lib/public-content";

const SYNC_STATE_ID = 1;
const SNAPSHOT_TTL_DAYS = 30;
const SYNC_INTERVAL_DAYS = 14;
const RETRY_INTERVAL_HOURS = 6;
const LEASE_MINUTES = 10;
const MAX_DISPLAY_REVIEWS = 6;

export type PublishedGoogleReviewsSnapshot = { reviews: GoogleReview[]; summary: GoogleReviewSummary };
export type PublicGoogleReviewsData = { state: "available" | "fresh_setup" | "unavailable"; snapshot: PublishedGoogleReviewsSnapshot | null; profileUrl: string | null };
export type CachedGoogleReviewsData = {
  stateExists: boolean;
  snapshot: { expiresAt: string; profileUrl: string; averageRating: number | null; totalReviewCount: number; fetchedAt: string; items: Array<Record<string, unknown>> } | null;
};
export type GoogleReviewSyncResult = {
  status: "success" | "not_due" | "running" | "error" | "configuration_missing" | "reauthorization_required" | "unavailable";
  published: boolean;
  attemptedAt: string;
  nextDueAt: string | null;
  reviewCount: number | null;
  errorSummary?: string;
};
export type SnapshotSyncDependencies = { supabase: SupabaseClient; googleConfig: GoogleBusinessReviewsConfig | null; profileUrl: string | null };

class SnapshotRepositoryError extends Error {
  constructor(public readonly code = "snapshot_repository_error") { super(code); this.name = "SnapshotRepositoryError"; }
}

function isoAfterHours(date: Date, hours: number) { return new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString(); }
function isoAfterDays(date: Date, days: number) { return isoAfterHours(date, days * 24); }
function isValidProfileUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === "https:" && (hostname === "maps.app.goo.gl" || hostname === "g.page" || hostname === "google.com" || hostname.endsWith(".google.com"));
  } catch { return false; }
}
function formatRating(value: number | null) { return value === null ? "—" : value.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 }); }
function formatObservedAt(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(value)); }
function formatReviewAge(value: string | null) {
  if (!value) return "baru";
  const ageDays = Math.floor(Math.max(0, Date.now() - Date.parse(value)) / (24 * 60 * 60 * 1000));
  if (ageDays < 1) return "hari ini";
  if (ageDays < 30) return `${ageDays} hari lalu`;
  if (ageDays < 365) return `${Math.floor(ageDays / 30)} bulan lalu`;
  return `${Math.floor(ageDays / 365)} tahun lalu`;
}

export async function readGoogleReviewsData(supabase: SupabaseClient): Promise<CachedGoogleReviewsData> {
  const { data: state, error: stateError } = await supabase.from("google_review_sync_state").select("current_snapshot_id").eq("id", SYNC_STATE_ID).maybeSingle();
  if (stateError) throw new SnapshotRepositoryError();
  if (!state) return { stateExists: false, snapshot: null };
  if (!state.current_snapshot_id) return { stateExists: true, snapshot: null };
  const { data: snapshot, error: snapshotError } = await supabase.from("google_review_snapshots")
    .select("id,average_rating,total_review_count,fetched_at,expires_at,profile_url")
    .eq("id", state.current_snapshot_id).maybeSingle();
  if (snapshotError || !snapshot) return { stateExists: true, snapshot: null };
  const { data: items, error: itemError } = await supabase.from("google_review_snapshot_items")
    .select("google_review_id,reviewer_display_name,reviewer_is_anonymous,rating,comment,google_created_at")
    .eq("snapshot_id", snapshot.id).not("comment", "is", null).order("source_order", { ascending: true }).limit(MAX_DISPLAY_REVIEWS);
  if (itemError) throw new SnapshotRepositoryError();
  return {
    stateExists: true,
    snapshot: {
      expiresAt: snapshot.expires_at,
      profileUrl: snapshot.profile_url,
      averageRating: snapshot.average_rating === null ? null : Number(snapshot.average_rating),
      totalReviewCount: Number(snapshot.total_review_count),
      fetchedAt: snapshot.fetched_at,
      items: (items ?? []) as Array<Record<string, unknown>>,
    },
  };
}

export function toPublicGoogleReviewsData(data: CachedGoogleReviewsData): PublicGoogleReviewsData {
  if (!data.snapshot) return { state: data.stateExists ? "unavailable" : "fresh_setup", snapshot: null, profileUrl: null };
  const reviews = data.snapshot.items
    .filter((item) => typeof item.comment === "string" && item.comment.trim().length > 0)
    .map((item) => ({
      id: String(item.google_review_id),
      name: item.reviewer_is_anonymous ? "Pelanggan Google" : (typeof item.reviewer_display_name === "string" && item.reviewer_display_name.trim() ? item.reviewer_display_name : "Pelanggan Google"),
      rating: item.rating as GoogleReview["rating"],
      reviewAge: formatReviewAge(typeof item.google_created_at === "string" ? item.google_created_at : null),
      quote: item.comment as string,
    }));
  return {
    state: "available",
    profileUrl: data.snapshot.profileUrl,
    snapshot: {
      reviews,
      summary: {
        rating: formatRating(data.snapshot.averageRating),
        ratingValue: data.snapshot.averageRating,
        reviewCount: data.snapshot.totalReviewCount,
        observedAt: formatObservedAt(data.snapshot.fetchedAt),
        profileUrl: data.snapshot.profileUrl,
      },
    },
  };
}

type Claim = { claimed: boolean; state_status: string; next_due_at: string; lease_token: string | null };
function firstRow<T>(data: T[] | T | null): T | null { return Array.isArray(data) ? data[0] ?? null : data; }

async function claim(supabase: SupabaseClient, now: string): Promise<Claim> {
  const { data, error } = await supabase.rpc("claim_google_review_sync", { p_now: now, p_lease_until: isoAfterHours(new Date(now), LEASE_MINUTES / 60) });
  const row = firstRow(data as Claim[] | null);
  if (error || !row || typeof row.claimed !== "boolean") throw new SnapshotRepositoryError("claim_failed");
  return row;
}

async function release(supabase: SupabaseClient, token: string, status: "error" | "reauthorization_required", nextDueAt: string, errorSummary: string) {
  const { data, error } = await supabase.rpc("release_google_review_sync", { p_lease_token: token, p_status: status, p_next_due_at: nextDueAt, p_error_summary: errorSummary });
  if (error || data !== true) throw new SnapshotRepositoryError("release_failed");
}

function summarizeError(error: unknown) {
  if (error instanceof Error && ["oauth_failed", "reauthorization_required", "reviews_failed", "invalid_response", "purge_failed", "claim_failed", "release_failed"].includes(error.message)) return error.message;
  return "sync_failed";
}

export async function runGoogleReviewsSync(dependencies: SnapshotSyncDependencies): Promise<GoogleReviewSyncResult> {
  const attemptedAt = new Date().toISOString();
  let lease: Claim;
  try { lease = await claim(dependencies.supabase, attemptedAt); }
  catch (error) { return { status: "unavailable", published: false, attemptedAt, nextDueAt: null, reviewCount: null, errorSummary: summarizeError(error) }; }
  if (!lease.claimed || !lease.lease_token) {
    return { status: lease.state_status === "running" ? "running" : "not_due", published: false, attemptedAt, nextDueAt: lease.next_due_at, reviewCount: null };
  }

  if (!dependencies.googleConfig || !isValidProfileUrl(dependencies.profileUrl)) {
    const nextDueAt = isoAfterHours(new Date(attemptedAt), RETRY_INTERVAL_HOURS);
    try { await release(dependencies.supabase, lease.lease_token, "error", nextDueAt, "configuration_missing"); }
    catch { return { status: "unavailable", published: false, attemptedAt, nextDueAt, reviewCount: null, errorSummary: "release_failed" }; }
    return { status: "configuration_missing", published: false, attemptedAt, nextDueAt, reviewCount: null, errorSummary: "configuration_missing" };
  }

  try {
    const fetched = await fetchGoogleReviews(dependencies.googleConfig);
    const fetchedAt = attemptedAt;
    const expiresAt = isoAfterDays(new Date(fetchedAt), SNAPSHOT_TTL_DAYS);
    const nextDueAt = isoAfterDays(new Date(fetchedAt), SYNC_INTERVAL_DAYS);
    const items = fetched.reviews.map((review, index) => ({ ...review, source_order: index, google_review_id: review.googleReviewId, reviewer_display_name: review.reviewerDisplayName, reviewer_is_anonymous: review.reviewerIsAnonymous, google_created_at: review.googleCreatedAt, google_updated_at: review.googleUpdatedAt, owner_reply: review.ownerReply, owner_reply_updated_at: review.ownerReplyUpdatedAt }));
    const { data, error } = await dependencies.supabase.rpc("publish_google_review_snapshot", { p_average_rating: fetched.averageRating, p_total_review_count: fetched.totalReviewCount, p_fetched_at: fetchedAt, p_expires_at: expiresAt, p_profile_url: dependencies.profileUrl, p_items: items, p_next_due_at: nextDueAt, p_lease_token: lease.lease_token });
    if (error || !data) throw new SnapshotRepositoryError("publish_failed");
    return { status: "success", published: true, attemptedAt, nextDueAt, reviewCount: fetched.reviews.length };
  } catch (error) {
    const errorSummary = summarizeError(error);
    const failureStatus = errorSummary === "reauthorization_required" ? "reauthorization_required" : "error";
    const nextDueAt = isoAfterHours(new Date(attemptedAt), failureStatus === "reauthorization_required" ? 24 : RETRY_INTERVAL_HOURS);
    try { await release(dependencies.supabase, lease.lease_token, failureStatus, nextDueAt, errorSummary); }
    catch { return { status: "unavailable", published: false, attemptedAt, nextDueAt, reviewCount: null, errorSummary: "release_failed" }; }
    return { status: failureStatus, published: false, attemptedAt, nextDueAt, reviewCount: null, errorSummary };
  }
}
