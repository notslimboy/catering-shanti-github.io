import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
const resetPassword = process.env.RESET_ADMIN_PASSWORD === "true";

function fail(message: string): never {
    console.error(`\nSetup admin gagal: ${message}`);
    process.exit(1);
}

if (!supabaseUrl) fail("SUPABASE_URL wajib diisi.");
if (!serviceRoleKey) fail("SUPABASE_SERVICE_ROLE_KEY wajib diisi.");
if (!adminEmail) fail("ADMIN_EMAIL wajib diisi.");
if (!adminPassword || adminPassword.length < 12) {
    fail("ADMIN_PASSWORD wajib diisi dan minimal 12 karakter.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function setupAdmin() {
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
    });
    if (usersError) fail(usersError.message);

    let user = usersData.users.find((candidate) => candidate.email?.toLowerCase() === adminEmail);
    const { data: existingAdmin, error: existingAdminError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .maybeSingle();
    if (existingAdminError) fail(existingAdminError.message);
    if (existingAdmin && existingAdmin.id !== user?.id) {
        fail(
            "Admin owner lain sudah terdaftar. Gunakan akun tersebut atau ubah profile secara manual jika kepemilikan memang dipindahkan."
        );
    }

    if (!user) {
        const { data, error } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
        });
        if (error || !data.user) fail(error?.message ?? "User admin tidak dapat dibuat.");
        user = data.user;
        console.info(`User admin dibuat untuk ${adminEmail}.`);
    } else if (resetPassword) {
        const { error } = await supabase.auth.admin.updateUserById(user.id, {
            password: adminPassword,
            email_confirm: true,
        });
        if (error) fail(error.message);
        console.info(`Password admin diatur ulang untuk ${adminEmail}.`);
    } else {
        console.info(`User admin ${adminEmail} sudah ada; password tidak diubah.`);
    }

    const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, role: "admin" }, { onConflict: "id" });
    if (profileError) fail(profileError.message);

    console.info(`Profil admin aktif untuk ${adminEmail}.`);
}

setupAdmin().catch((error: unknown) => {
    fail(error instanceof Error ? error.message : "Terjadi kesalahan tak dikenal.");
});
