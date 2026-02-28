import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    // Garante que o middleware não rode em arquivos estáticos ou APIs de auth
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
