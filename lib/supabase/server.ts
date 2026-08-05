import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
    BackendConfigurationError,
    hasSupabaseConfig,
    serverConfig,
} from "@/lib/server/config";

let adminClient: SupabaseClient | undefined;

/**
 * Service-role client for server routes, server actions, and trusted scripts.
 * Never import this module from a Client Component and never expose the key to
 * the browser.
 */
export function getSupabaseAdmin(): SupabaseClient {
    if (!hasSupabaseConfig()) {
        throw new BackendConfigurationError(
            "SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi untuk memakai Supabase."
        );
    }

    if (!adminClient) {
        adminClient = createClient(
            serverConfig.supabaseUrl!,
            serverConfig.supabaseServiceRoleKey!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                    detectSessionInUrl: false,
                },
            }
        );
    }

    return adminClient;
}

export { hasSupabaseConfig };
