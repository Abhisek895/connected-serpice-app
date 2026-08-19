import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for /dashboard routes.
 *
 * Rules:
 * 1. Unauthenticated user + ?demo=X in URL → redirect to /gift/X
 *    (No account needed — users can create & pay without signing in)
 * 2. Unauthenticated user + no demo param → redirect to /login
 * 3. Authenticated user → proceed normally
 */
export async function proxy(req: NextRequest) {
  const token = await getToken({ req });
  const url = req.nextUrl;
  const demoId = url.searchParams.get("demo");

  if (!token) {
    // Has a demo param — send straight to the public gift landing page
    if (demoId) {
      const giftUrl = new URL(`/gift/${demoId}`, url.origin);
      // Preserve any UTM params (for ad attribution)
      const utmSource = url.searchParams.get("utm_source");
      const utmCampaign = url.searchParams.get("utm_campaign");
      if (utmSource) giftUrl.searchParams.set("utm_source", utmSource);
      if (utmCampaign) giftUrl.searchParams.set("utm_campaign", utmCampaign);
      return NextResponse.redirect(giftUrl);
    }

    // No demo param — redirect to login as normal
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("callbackUrl", url.href);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated — proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
