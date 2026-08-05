import "server-only";

/**
 * Server-side configuration for persistence and notification services.
 *
 * Local development intentionally works without credentials so the public
 * order flow can still be exercised. Production must be explicitly
 * configured: accepting an order that cannot be persisted is worse than
 * asking the customer to try again.
 */
export const serverConfig = {
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    resendFrom: process.env.RESEND_FROM,
    orderNotificationTo: process.env.ORDER_NOTIFICATION_TO,
    adminEmail: process.env.ADMIN_EMAIL,
    siteUrl: process.env.SITE_URL,
    googleBusinessClientId: process.env.GOOGLE_BUSINESS_CLIENT_ID,
    googleBusinessClientSecret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET,
    googleBusinessRefreshToken: process.env.GOOGLE_BUSINESS_REFRESH_TOKEN,
    googleBusinessAccountId: process.env.GOOGLE_BUSINESS_ACCOUNT_ID,
    googleBusinessLocationId: process.env.GOOGLE_BUSINESS_LOCATION_ID,
    googleBusinessProfileUrl: process.env.GOOGLE_BUSINESS_PROFILE_URL,
    googleReviewsSnapshotEnabled: process.env.GOOGLE_REVIEWS_SNAPSHOT_ENABLED === "true",
    cronSecret: process.env.CRON_SECRET,
};

export const isProduction = process.env.NODE_ENV === "production";

export function isValidGoogleBusinessProfileUrl(value: string | undefined): value is string {
    if (!value) return false;
    try {
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase();
        return url.protocol === "https:" && (
            hostname === "maps.app.goo.gl" ||
            hostname === "g.page" ||
            hostname === "google.com" ||
            hostname.endsWith(".google.com")
        );
    } catch {
        return false;
    }
}

export function hasStrongCronSecret() {
    return Boolean(serverConfig.cronSecret && Buffer.byteLength(serverConfig.cronSecret, "utf8") >= 32);
}

export function hasSupabaseConfig() {
    return Boolean(serverConfig.supabaseUrl && serverConfig.supabaseServiceRoleKey);
}

export function hasResendConfig() {
    return Boolean(
        serverConfig.resendApiKey &&
        serverConfig.resendFrom &&
        serverConfig.orderNotificationTo
    );
}

export function hasGoogleBusinessReviewsConfig() {
    return Boolean(
        serverConfig.googleBusinessClientId &&
        serverConfig.googleBusinessClientSecret &&
        serverConfig.googleBusinessRefreshToken &&
        serverConfig.googleBusinessAccountId &&
        serverConfig.googleBusinessLocationId &&
        isValidGoogleBusinessProfileUrl(serverConfig.googleBusinessProfileUrl)
    );
}

export function hasGoogleReviewsSnapshotEnabled() {
    return serverConfig.googleReviewsSnapshotEnabled === true;
}

export function missingProductionServices() {
    const missing: string[] = [];
    if (!hasSupabaseConfig()) missing.push("Supabase");
    return missing;
}

export class BackendConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BackendConfigurationError";
    }
}

export function requireProductionServices() {
    if (!isProduction) return;

    const missing = missingProductionServices();
    if (missing.length > 0) {
        throw new BackendConfigurationError(
            `Layanan produksi belum dikonfigurasi: ${missing.join(", ")}`
        );
    }
}
