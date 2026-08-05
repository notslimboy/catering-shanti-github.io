import { NextResponse, type NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "shanti_admin_session";

function hasUnexpiredAdminSession(value?: string) {
  if (!value) return false;
  try {
    const session = JSON.parse(value) as { access_token?: string; expires_at?: number };
    if (!session.access_token) return false;
    return !session.expires_at || session.expires_at * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Let the protected layout render its actionable setup screen locally when
  // a deployment has not received its Supabase secrets yet.
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.next();
  }

  const hasSession = hasUnexpiredAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (pathname === "/admin/login") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
