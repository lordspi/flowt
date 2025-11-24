import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // For demo mode, return mock user data
  return NextResponse.json({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    role: 'user',
    currentPlan: 'FREE',
    creditsBalance: 15,
    organization: null,
  }, { status: 200 })
}
