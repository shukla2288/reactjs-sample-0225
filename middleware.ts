import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // If it's the root path, allow the redirect to happen in the page component
  if (path === '/') {
    return NextResponse.next()
  }

  // Add authentication logic here if needed
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*'
  ]
} 