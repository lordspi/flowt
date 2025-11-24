import { NextResponse } from 'next/server'

export async function GET() {
  // For demo mode, always return mock user data without auth check
  return NextResponse.json({
    id: 'demo-user',
    email: 'demo@flowt.ai',
    name: 'Demo User',
    image: null,
    role: 'user',
    currentPlan: 'FREE',
    creditsBalance: 15,
    organization: null,
  }, { status: 200 })
}
