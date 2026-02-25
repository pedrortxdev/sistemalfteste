import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

// Inicializa o NextAuth apenas no middleware usando a configuração Edge-compatible
const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isLoginPage = req.nextUrl.pathname === "/login";

    if (!isLoggedIn && !isLoginPage) {
        return Response.redirect(new URL("/login", req.url));
    }
    if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/dashboard", req.url));
    }
});

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
