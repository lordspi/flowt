import NextAuth, { DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'
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
  // Remove PrismaAdapter for demo mode to avoid database connection during build
  providers: [Google],
  callbacks: {
    async session({ session, token }: SessionCallbackParams) {
      if (session.user && token.sub) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = (token as any).role || 'user'
        ;(session.user as any).organizationId = (token as any).organizationId ?? null
        ;(session.user as any).currentPlan = (token as any).currentPlan || 'FREE'
        ;(session.user as any).creditsBalance = (token as any).creditsBalance ?? 15
      }
      return session
    },
    async jwt({ token }: JwtCallbackParams) {
      // Skip database lookup for demo mode
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)
