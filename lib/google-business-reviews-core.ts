const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVIEWS_URL = "https://mybusiness.googleapis.com/v4";
const REVIEW_PAGE_SIZE = 50;

export type GoogleBusinessReviewsConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accountId: string;
  locationId: string;
};

export type NormalizedGoogleReview = {
  googleReviewId: string;
  reviewerDisplayName: string | null;
  reviewerIsAnonymous: boolean;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  googleCreatedAt: string | null;
  googleUpdatedAt: string | null;
  ownerReply: string | null;
  ownerReplyUpdatedAt: string | null;
  sourceOrder: number;
};

export type FetchedGoogleReviews = {
  averageRating: number | null;
  totalReviewCount: number;
  reviews: NormalizedGoogleReview[];
};

export class GoogleBusinessReviewsError extends Error {
  constructor(public readonly code: "oauth_failed" | "reauthorization_required" | "reviews_failed" | "invalid_response") {
    super(code);
    this.name = "GoogleBusinessReviewsError";
  }
}

function readText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeTimestamp(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) throw new GoogleBusinessReviewsError("invalid_response");
  return new Date(value).toISOString();
}

function normalizeRating(value: unknown): 1 | 2 | 3 | 4 | 5 | null {
  const ratings: Record<string, 1 | 2 | 3 | 4 | 5> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
  if (typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5) return value as 1 | 2 | 3 | 4 | 5;
  return typeof value === "string" ? ratings[value] ?? null : null;
}

async function getAccessToken(config: GoogleBusinessReviewsConfig): Promise<string> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, refresh_token: config.refreshToken, grant_type: "refresh_token" }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    let tokenError: unknown;
    try { tokenError = (await response.json() as { error?: unknown }).error; } catch { /* bounded error classification */ }
    throw new GoogleBusinessReviewsError(tokenError === "invalid_grant" ? "reauthorization_required" : "oauth_failed");
  }
  const payload = (await response.json()) as { access_token?: unknown };
  if (typeof payload.access_token !== "string" || payload.access_token.length < 10) throw new GoogleBusinessReviewsError("oauth_failed");
  return payload.access_token;
}

function normalizeReview(value: unknown, sourceOrder: number): NormalizedGoogleReview {
  if (!value || typeof value !== "object") throw new GoogleBusinessReviewsError("invalid_response");
  const review = value as Record<string, unknown>;
  const googleReviewId = readText(review.reviewId);
  const rating = normalizeRating(review.starRating);
  if (!googleReviewId?.trim() || !rating) throw new GoogleBusinessReviewsError("invalid_response");

  const reviewer = review.reviewer;
  if (!reviewer || typeof reviewer !== "object") throw new GoogleBusinessReviewsError("invalid_response");
  const reply = review.reviewReply;
  if (reply !== undefined && (!reply || typeof reply !== "object")) throw new GoogleBusinessReviewsError("invalid_response");
  const reviewerRecord = reviewer as Record<string, unknown>;
  const replyRecord = reply as Record<string, unknown> | undefined;
  if (reviewerRecord.displayName !== undefined && typeof reviewerRecord.displayName !== "string") throw new GoogleBusinessReviewsError("invalid_response");
  if (reviewerRecord.isAnonymous !== undefined && typeof reviewerRecord.isAnonymous !== "boolean") throw new GoogleBusinessReviewsError("invalid_response");
  const reviewerDisplayName = readText(reviewerRecord?.displayName);
  const comment = readText(review.comment);
  const ownerReply = readText(replyRecord?.comment);
  if (review.comment !== undefined && comment === null) throw new GoogleBusinessReviewsError("invalid_response");
  if (replyRecord?.comment !== undefined && ownerReply === null) throw new GoogleBusinessReviewsError("invalid_response");

  return {
    googleReviewId,
    reviewerDisplayName,
    reviewerIsAnonymous: reviewerRecord?.isAnonymous === true || !reviewerDisplayName?.trim(),
    rating,
    comment,
    googleCreatedAt: normalizeTimestamp(review.createTime),
    googleUpdatedAt: normalizeTimestamp(review.updateTime),
    ownerReply,
    ownerReplyUpdatedAt: normalizeTimestamp(replyRecord?.updateTime),
    sourceOrder,
  };
}

function parseSummary(payload: Record<string, unknown>) {
  const total = payload.totalReviewCount;
  const average = payload.averageRating;
  if (typeof total !== "number" || !Number.isInteger(total) || total < 0) throw new GoogleBusinessReviewsError("invalid_response");
  if (total === 0) {
    if (average !== null && average !== undefined && average !== 0) throw new GoogleBusinessReviewsError("invalid_response");
    return { totalReviewCount: 0, averageRating: null };
  }
  if (typeof average !== "number" || !Number.isFinite(average) || average < 1 || average > 5) throw new GoogleBusinessReviewsError("invalid_response");
  return { totalReviewCount: total, averageRating: average };
}

export async function fetchGoogleReviews(config: GoogleBusinessReviewsConfig): Promise<FetchedGoogleReviews> {
  const accessToken = await getAccessToken(config);
  const reviews: NormalizedGoogleReview[] = [];
  let pageToken: string | undefined;
  const seenPageTokens = new Set<string>();
  let summary: ReturnType<typeof parseSummary> | null = null;

  do {
    const params = new URLSearchParams({ pageSize: String(REVIEW_PAGE_SIZE) });
    if (pageToken) params.set("pageToken", pageToken);
    const url = `${GOOGLE_REVIEWS_URL}/accounts/${encodeURIComponent(config.accountId)}/locations/${encodeURIComponent(config.locationId)}/reviews?${params}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new GoogleBusinessReviewsError("reviews_failed");
    const payload = (await response.json()) as Record<string, unknown>;
    if (!Array.isArray(payload.reviews)) throw new GoogleBusinessReviewsError("invalid_response");
    const pageSummary = parseSummary(payload);
    if (summary && (summary.totalReviewCount !== pageSummary.totalReviewCount || summary.averageRating !== pageSummary.averageRating)) {
      throw new GoogleBusinessReviewsError("invalid_response");
    }
    summary ??= pageSummary;
    payload.reviews.forEach((review) => reviews.push(normalizeReview(review, reviews.length)));
    const nextPageToken = typeof payload.nextPageToken === "string" && payload.nextPageToken.length > 0 ? payload.nextPageToken : undefined;
    if (nextPageToken && seenPageTokens.has(nextPageToken)) throw new GoogleBusinessReviewsError("invalid_response");
    if (nextPageToken) seenPageTokens.add(nextPageToken);
    pageToken = nextPageToken;
  } while (pageToken);

  if (!summary || summary.totalReviewCount < reviews.length || (reviews.length === 0 && summary.totalReviewCount !== 0)) {
    throw new GoogleBusinessReviewsError("invalid_response");
  }
  if (reviews.length > 0 && summary.averageRating === null) throw new GoogleBusinessReviewsError("invalid_response");
  return { ...summary, reviews };
}
