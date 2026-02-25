import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            role: string
            cityId: string
            cityName: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        name?: string | null
        email?: string | null
        role: string
        cityId: string
        cityName: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        cityId: string
        cityName: string
    }
}
