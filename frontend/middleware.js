import { NextResponse } from 'next/server';

// Root domains that mean "no advisor subdomain" — the bare production
// domain and bare localhost during local dev.
const ROOT_DOMAINS = [process.env.NEXT_PUBLIC_BASE_DOMAIN, 'localhost'].filter(Boolean);
const RESERVED_SUBDOMAINS = ['www', 'admin'];

function getSubdomain(hostname) {
  for (const root of ROOT_DOMAINS) {
    if (hostname === root) return null;
    if (hostname.endsWith(`.${root}`)) {
      return hostname.slice(0, -(root.length + 1));
    }
  }
  return null;
}

// Reads the subdomain from the Host header and internally rewrites
// the request to /[advisorSlug]/... so one codebase serves every advisor.
// Works both in production (ramanand.headwayadvisors.com) and local dev
// (ramanand.localhost:3000, via an /etc/hosts entry).
export function middleware(req) {
  const host = req.headers.get('host') || '';
  const hostname = host.split(':')[0];
  const subdomain = getSubdomain(hostname);

  if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)']
};
