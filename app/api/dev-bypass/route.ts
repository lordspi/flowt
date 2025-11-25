import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  // Only for localhost development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Development only' }, { status: 403 })
  }

  // Create a mock user session for testing
  const mockUser = {
    id: 'dev-user-123',
    email: 'dev@test.com',
    name: 'Development User',
    image: null,
    role: 'user',
    currentPlan: 'FREE',
    creditsBalance: 15,
    organizationId: null
  }

  return NextResponse.json({
    success: true,
    user: mockUser,
    message: 'Development bypass - use for testing only'
  })
}
