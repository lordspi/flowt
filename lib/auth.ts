import NextAuth, { DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'
import type { NextAuthConfig, Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role: string
      organizationId?: string | null
      currentPlan: string
      creditsBalance: number
    }
  }
}

type SessionCallbackParams = {
  session: Session
  token: JWT
}

type JwtCallbackParams = {
  token: JWT
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }: SessionCallbackParams) {
      if (session.user && token.sub) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = (token as any).role || 'user'
        ;(session.user as any).organizationId = (token as any).organizationId ?? null
        ;(session.user as any).currentPlan = (token as any).currentPlan || 'FREE'
        ;(session.user as any).creditsBalance = (token as any).creditsBalance ?? 0
      }
      return session
    },
    async jwt({ token }: JwtCallbackParams) {
      if (!token.sub) return token

      const user = await prisma.user.findUnique({
        where: { id: token.sub },
        select: {
          role: true,
          organizationId: true,
          currentPlan: true,
          creditsBalance: true,
        },
      })

      if (user) {
        ;(token as any).role = user.role
        ;(token as any).organizationId = user.organizationId
        ;(token as any).currentPlan = user.currentPlan
        ;(token as any).creditsBalance = user.creditsBalance
      }

      return token
    },
  },
  session: {
    strategy: 'database',
  },
} satisfies NextAuthConfig

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)
