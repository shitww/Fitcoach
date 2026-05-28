import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) {
          return null
        }

        const isValid = await compare(
          credentials.password as string, 
          user.password
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // 首次登录时把用户信息存入 JWT，后续请求不再查数据库
        token.userId = user.id;
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
      }

      // 允许客户端通过 useSession().update() 刷新 session 中的用户字段
      // 用于头像/昵称更新后不必重新登录即可生效（最小变更，避免额外查询）
      if (trigger === "update" && session?.user) {
        const u = session.user as any;
        if (u.name !== undefined) token.name = u.name;
        if (u.email !== undefined) token.email = u.email;
        if (u.avatar !== undefined) token.avatar = u.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) || (token.sub as string);
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天过期
  },
  trustHost: true,
})
