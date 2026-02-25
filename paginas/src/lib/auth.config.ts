import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        jwt({ token, user, trigger, session }) {
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
    providers: [], // configurado no auth.ts para não quebrar o Edge Runtime
} satisfies NextAuthConfig;
