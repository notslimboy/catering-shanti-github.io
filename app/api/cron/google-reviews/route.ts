import { revalidateTag } from "next/cache";
import { runGoogleReviewsSync } from "@/lib/server/google-review-snapshot-entry";
import { hasStrongCronSecret, serverConfig } from "@/lib/server/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!hasStrongCronSecret() || authorization !== `Bearer ${serverConfig.cronSecret}`) {
    return response({ error: "unauthorized" }, 401);
  }

  const result = await runGoogleReviewsSync();
  if (result.published) revalidateTag("google-reviews", "max");

  const status = result.status === "success" || result.status === "not_due" || result.status === "running" ? 200 : 503;
  return response({
    status: result.status,
    published: result.published,
    attemptedAt: result.attemptedAt,
    nextDueAt: result.nextDueAt,
    reviewCount: result.reviewCount,
    ...(result.errorSummary ? { errorSummary: result.errorSummary } : {}),
  }, status);
}
