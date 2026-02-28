import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || 
                                 nextUrl.pathname.startsWith('/aluguel') || 
                                 nextUrl.pathname.startsWith('/caixa') || 
                                 nextUrl.pathname.startsWith('/maquinas') || 
                                 nextUrl.pathname.startsWith('/patio') || 
                                 nextUrl.pathname.startsWith('/relatorios') || 
                                 nextUrl.pathname.startsWith('/usuarios') || 
                                 nextUrl.pathname.startsWith('/cidades');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redireciona para /login
            } else if (isLoggedIn && nextUrl.pathname === '/login') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.cityId = user.cityId;
                token.cityName = user.cityName;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = (token.sub || token.id) as string;
                session.user.role = token.role as string;
                session.user.cityId = token.cityId as string;
                session.user.cityName = token.cityName as string;
            }
            return session;
        },
    },
    providers: [], 
} satisfies NextAuthConfig;
