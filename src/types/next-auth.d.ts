import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    avatar?: string | null
  }

  interface Session {
    user: {
      id: string
      avatar?: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string
    avatar?: string | null
  }
}
