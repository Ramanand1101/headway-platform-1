'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { defaultHomepageContent } from '../lib/homepageContent';

const pillBlue =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--site-blue)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-ia-gold-tint transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--site-blue-soft)] hover:shadow-xl hover:shadow-ia-gold-tint active:translate-y-0 active:scale-[0.97]';

function Chevron({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-3.5 w-3.5 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function linkTargetProps(link) {
  return link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

// Shared marketing-site header — used on every platform page except the
// advisor microsites (those render their own advisor-branded header). Pass
// `onLoginClick` to intercept the Advisor Login button (e.g. the homepage
// opens its inline login modal); pages without it fall back to a plain
// link to /advisor/login. Pass `navLinks` to control the menu directly (used
// by the homepage's live preview); otherwise it's fetched from the saved
// site content, falling back to the platform defaults while that loads.
export default function SiteHeader({ onLoginClick, navLinks }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const [fetchedNavLinks, setFetchedNavLinks] = useState(null);

  useEffect(() => {
    if (navLinks) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/content/homepage`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.content?.navLinks)) setFetchedNavLinks(data.content.navLinks);
      })
      .catch(() => {});
  }, [navLinks]);

  const links = navLinks || fetchedNavLinks || defaultHomepageContent.navLinks;

  return (
    <div className="sticky top-2 z-50 px-4 sm:px-6">
      <nav className="mx-auto max-w-6xl rounded-2xl border border-gray-100 bg-white/95 shadow-lg shadow-gray-900/5 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 py-3 sm:px-7 sm:py-4">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight sm:text-xl">
            <Logo />
          </Link>
          <div className="hidden items-center gap-7 text-[0.92rem] font-semibold text-gray-600 lg:flex">
            {links.map((link) =>
              link.children?.length ? (
                <div key={link.id} className="group relative">
                  <button type="button" className="flex items-center gap-1 py-2 transition hover:text-[var(--site-navy)]">
                    {link.label}
                    <Chevron className="transition group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-0 top-full z-10 min-w-[190px] rounded-xl border border-gray-100 bg-white py-2 opacity-0 shadow-lg shadow-gray-900/10 transition group-hover:visible group-hover:opacity-100">
                    {link.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        {...linkTargetProps(child)}
                        className="block px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-[var(--site-navy)]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={link.id} href={link.href} {...linkTargetProps(link)} className="transition hover:text-[var(--site-navy)]">
                  {link.label}
                </Link>
              )
            )}
          </div>

          {onLoginClick ? (
            <button type="button" onClick={onLoginClick} className={`${pillBlue} hidden lg:inline-flex`}>
              Advisor Login
              <span aria-hidden>→</span>
            </button>
          ) : (
            <Link href="/advisor/login" className={`${pillBlue} hidden lg:inline-flex`}>
              Advisor Login
              <span aria-hidden>→</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            className="grid h-10 w-10 flex-none place-items-center rounded-lg text-[var(--site-navy)] transition hover:bg-gray-100 lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        <div
          className={`overflow-hidden rounded-b-2xl transition-all duration-300 ease-in-out lg:hidden ${
            mobileMenuOpen ? 'max-h-[32rem] border-t border-gray-100' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col gap-1 px-5 py-4 sm:px-6">
            {links.map((link) =>
              link.children?.length ? (
                <div key={link.id}>
                  <button
                    type="button"
                    onClick={() => setMobileSubmenuOpen((cur) => (cur === link.id ? null : link.id))}
                    aria-expanded={mobileSubmenuOpen === link.id}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    {link.label}
                    <Chevron className={`transition-transform ${mobileSubmenuOpen === link.id ? 'rotate-180' : ''}`} />
                  </button>
                  <div
                    className={`overflow-hidden pl-3 transition-all duration-200 ${
                      mobileSubmenuOpen === link.id ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        {...linkTargetProps(child)}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileSubmenuOpen(null);
                        }}
                        className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.id}
                  href={link.href}
                  {...linkTargetProps(link)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              )
            )}
            {onLoginClick ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLoginClick();
                }}
                className={`${pillBlue} mt-2 w-full justify-center`}
              >
                Advisor Login
              </button>
            ) : (
              <Link
                href="/advisor/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`${pillBlue} mt-2 w-full justify-center`}
              >
                Advisor Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
