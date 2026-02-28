import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

// Inicializa o NextAuth apenas no middleware usando a configuração Edge-compatible
const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isLoginPage = nextUrl.pathname === "/login";

    if (!isLoggedIn && !isLoginPage) {
        return Response.redirect(new URL("/login", nextUrl));
    }
    if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
