import { NextRequest, NextResponse } from 'next/server'

type PlanTier = 'FREE' | 'BASIC' | 'ENHANCED' | 'PREMIUM' | 'DEDICATED'

export async function POST(request: NextRequest) {
  // For demo mode, return a mock response
  return NextResponse.json({
    error: 'Demo mode - payment processing not available'
  }, { status: 503 })
}
