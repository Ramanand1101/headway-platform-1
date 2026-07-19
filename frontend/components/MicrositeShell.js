'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMicrositeTheme, themeCssVars } from '../lib/micrositeThemes';

const socialLabels = { linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube' };

const navLinks = [
  { href: '/#about', label: 'About' },
  { href: '/#services', label: 'Services' },
  { href: '/#companies', label: 'Companies' },
  { href: '/#testimonials', label: 'Reviews' },
  { href: '/#achievements', label: 'Achievements' },
  { href: '/blog', label: 'Blog' },
  { href: '/#contact', label: 'Contact' },
  { href: '/#social', label: 'Follow' }
];

function LogoMark() {
  return (
    <span className="flex items-center text-[var(--tc-dark)]">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M11 2 2 7v3l9-5 9 5V7L11 2Z" />
        <path d="M2 12l9-5 9 5v3l-9-5-9 5v-3Z" opacity="0.55" />
      </svg>
    </span>
  );
}

// Wraps the header/footer/theme for the advisor microsite. In live-preview
// mode (embedded as an iframe from the advisor dashboard) it listens for
// postMessage updates so header branding, WhatsApp links and the theme all
// reflect unsaved edits instantly, instead of the server-fetched advisor.
export default function MicrositeShell({ initialAdvisor, children }) {
  const [advisor, setAdvisor] = useState(initialAdvisor);

  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
    if (!isPreview) return;

    function handleMessage(e) {
      if (e.data?.type === 'advisor-preview-content') {
        setAdvisor(e.data.advisor);
      }
    }
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'advisor-preview-ready', part: 'shell' }, '*');
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const advisorName = advisor?.name || 'Headway Advisor';
  const theme = getMicrositeTheme(advisor?.themeKey);
  const socialLinks = Object.entries(advisor?.socialLinks || {}).filter(([, url]) => url);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--tc-dark)]" style={themeCssVars(theme)}>
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${theme.font.google}&display=swap`} />
      <input type="checkbox" id="mobile-nav-toggle" className="peer hidden" />
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2 tracking-tight text-[var(--tc-dark)]">
            <LogoMark />
            <span className="leading-tight">
              <span className="block text-sm font-extrabold uppercase">{advisorName}</span>
              <span className="block text-[0.62rem] font-semibold uppercase tracking-widest text-gray-400">
                Insurance Advisory
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-gray-600 hover:text-[var(--tc-primary)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {advisor?.whatsappNumber && (
              <a
                href={`https://wa.me/${advisor.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 rounded-full bg-[var(--tc-dark)] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:opacity-90 sm:inline-flex"
              >
                Free Consult <span aria-hidden>↗</span>
              </a>
            )}
            <label
              htmlFor="mobile-nav-toggle"
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-gray-200 md:hidden"
              aria-label="Menu"
            >
              ☰
            </label>
          </div>
        </div>
        <nav className="hidden max-h-0 flex-col overflow-hidden border-t border-gray-100 bg-white transition-all peer-checked:flex peer-checked:max-h-96 md:!hidden">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="border-b border-gray-100 px-6 py-3.5 text-sm font-semibold text-gray-700">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="bg-[var(--tc-dark)] text-white/70">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-8">
            <Link href="/" className="flex items-center gap-2 text-white">
              <span className="text-white">
                <LogoMark />
              </span>
              <span className="text-sm font-extrabold uppercase">{advisorName}</span>
            </Link>
            <nav className="flex flex-wrap gap-6 text-sm font-semibold">
              {navLinks
                .filter((l) => l.label !== 'Blog')
                .map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                ))}
              {socialLinks.map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {socialLabels[key] || key}
                </a>
              ))}
            </nav>
          </div>

          {advisor?.irdaiLicenseNumber && (
            <p className="mt-6 max-w-3xl text-xs leading-relaxed text-white/40">
              IRDAI Registration No.: {advisor.irdaiLicenseNumber}. Insurance is the subject matter of solicitation.
              For more details on risk factors, terms &amp; conditions, please read the sales brochure/policy wording
              carefully before concluding a sale.
            </p>
          )}

          <p className="mt-6 text-xs text-white/40">
            © {new Date().getFullYear()} by {advisorName}. All rights reserved.
          </p>
        </div>
      </footer>

      {advisor?.whatsappNumber && (
        <a
          href={`https://wa.me/${advisor.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-6 right-6 z-30 grid h-14 w-14 place-items-center rounded-full bg-[var(--tc-secondary)] text-2xl text-white shadow-xl transition hover:-translate-y-0.5"
        >
          💬
        </a>
      )}
    </div>
  );
}
