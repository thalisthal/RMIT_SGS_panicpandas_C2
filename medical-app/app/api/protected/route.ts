import { NextResponse } from 'next/server'

export function GET(): NextResponse {
  return NextResponse.json(
    {
      error:
        'Server-side TideCloak authentication is unavailable in the local demo mode.',
    },
    { status: 501 },
  )
}
