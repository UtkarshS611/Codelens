import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(
    request: NextRequest
) {
    const { pathname } = request.nextUrl;

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET as string,
    });

    console.log(
        "PROXY TOKEN:",
        token
    );

    /*
     * A token means the user is authenticated.
     */
    const isAuthenticated = Boolean(token);

    /*
     * Logged-in user trying to access
     * signin/signup.
     */
    if (
        isAuthenticated &&
        (
            pathname === "/signin" ||
            pathname === "/signup"
        )
    ) {
        return NextResponse.redirect(
            new URL(
                "/dashboard",
                request.url
            )
        );
    }

    /*
     * Logged-out user trying to access
     * dashboard.
     */
    if (
        !isAuthenticated &&
        pathname.startsWith("/dashboard")
    ) {
        return NextResponse.redirect(
            new URL(
                "/signin",
                request.url
            )
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/signin",
        "/signup",
        "/dashboard/:path*",
    ],
};