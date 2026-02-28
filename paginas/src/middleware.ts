import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    // Protege todas as rotas exceto as estáticas e a de login
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
