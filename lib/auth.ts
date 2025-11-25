import NextAuth, { DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'
import type { NextAuthConfig, Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'

// Conditional database adapter - only initialize if DATABASE_URL is available
let PrismaAdapter: any = null
let prisma: any = null

if (process.env.DATABASE_URL) {
  try {
    const adapterModule = require('@auth/prisma-adapter').default
    PrismaAdapter = adapterModule
    prisma = require('./db').prisma
  } catch (error) {
    console.warn('Database adapter not available, falling back to JWT strategy:', error)
  }
}

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
  // Only use database adapter if DATABASE_URL is available
  ...(PrismaAdapter && prisma ? { adapter: PrismaAdapter(prisma) } : {}),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ] : [])
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async session({ session, token }: SessionCallbackParams) {
      if (session.user && token.sub) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = (token as any).role || 'user'
        ;(session.user as any).organizationId = (token as any).organizationId ?? null
        ;(session.user as any).currentPlan = (token as any).currentPlan || 'FREE'
        ;(session.user as any).creditsBalance = (token as any).creditsBalance ?? (PrismaAdapter ? 0 : 15)
      }
      return session
    },
    async jwt({ token, user, account }: JwtCallbackParams & { user?: any; account?: any }) {
      if (!token.sub) return token

      // Only lookup user in database if adapter is available
      if (PrismaAdapter && prisma) {
        try {
          // Check if this is a new user (first time sign-in)
          if (user && account?.provider === 'google') {
            const existingUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { id: true }
            })

            if (!existingUser) {
              // Create new user with 15 free credits
              await prisma.user.create({
                data: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  image: user.image,
                  role: 'user',
                  currentPlan: 'FREE',
                  creditsBalance: 15,
                }
              })

              // Set token values for new user
              ;(token as any).role = 'user'
              ;(token as any).organizationId = null
              ;(token as any).currentPlan = 'FREE'
              ;(token as any).creditsBalance = 15
            }
          }

          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: {
              role: true,
              organizationId: true,
              currentPlan: true,
              creditsBalance: true,
            },
          })

          if (dbUser) {
            ;(token as any).role = dbUser.role
            ;(token as any).organizationId = dbUser.organizationId
            ;(token as any).currentPlan = dbUser.currentPlan
            ;(token as any).creditsBalance = dbUser.creditsBalance
          }
        } catch (error) {
          console.warn('Database lookup failed, using defaults:', error)
        }
      } else {
        // Default values for demo mode
        ;(token as any).role = 'user'
        ;(token as any).organizationId = null
        ;(token as any).currentPlan = 'FREE'
        ;(token as any).creditsBalance = 15
      }

      return token
    },
  },
  session: {
    strategy: PrismaAdapter ? 'database' : 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)
