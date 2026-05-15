import { NextResponse } from 'next/server'

export function middleware(request) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  if (hostname === 'app.trailday.io') {
    if (pathname === '/') {
      const token = request.cookies.get('tra_token')?.value
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
    return NextResponse.next()
  }

  if (hostname === 'trailday.io' || hostname === 'www.trailday.io') {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/billing') ||
        pathname.startsWith('/generate') || pathname.startsWith('/login') ||
        pathname.startsWith('/signup')) {
      return NextResponse.redirect(new URL('https://app.trailday.io' + pathname, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
