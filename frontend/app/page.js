'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { defaultHomepageContent } from '../lib/homepageContent';
import { getHomepageTheme, homepageThemeCssVars } from '../lib/homepageThemes';

const pillBase =
  'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]';
const pillBlue = `${pillBase} bg-[var(--site-blue)] text-white shadow-lg shadow-ia-gold-tint hover:bg-[var(--site-blue-soft)] hover:shadow-xl hover:shadow-ia-gold-tint`;
const pillOutline = `${pillBase} border-2 border-[var(--site-navy)] text-[var(--site-navy)] hover:bg-[var(--site-navy)] hover:text-white`;
const pillGreen = `${pillBase} bg-[var(--site-green)] text-white shadow-lg shadow-green-200 hover:bg-[var(--site-green-soft)] hover:shadow-xl hover:shadow-green-200`;
const cardHover = 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl';

// Non-text presentation metadata that stays fixed in code (icons, colors,
// image keys) — the actual copy comes from `content`, editable at
// /admin/homepage. Arrays below line up by index with the content arrays.
const heroMeta = ['/images/banner-1.jpg', '/images/banner-2.jpg', '/images/banner-3.jpg', '/images/banner-4.jpg'];

const trustMeta = [
  { icon: '⏱️', iconClass: 'bg-ia-gold-tint/40 text-[var(--site-blue)]' },
  { icon: '🎁', iconClass: 'bg-green-50 text-[var(--site-green)]' },
  { icon: '🗂️', iconClass: 'bg-[#2E6FD8]/10 text-[#2E6FD8]' },
  { icon: '🚀', iconClass: 'bg-ia-gold-tint/40 text-[var(--site-blue)]' }
];

const whyMeta = [
  { icon: '🔍', iconClass: 'bg-ia-gold-tint/40 text-[var(--site-blue)]' },
  { icon: '🛡️', iconClass: 'bg-green-50 text-[var(--site-green)]' },
  { icon: '💬', iconClass: 'bg-[#2E6FD8]/10 text-[#2E6FD8]' },
  { icon: '📅', iconClass: 'bg-ia-gold-tint/40 text-[var(--site-blue)]' }
];

const capMeta = [
  { key: 'cap-reels', icon: '🎬' },
  { key: 'cap-carousels', icon: '🖼️' },
  { key: 'cap-posts', icon: '📌' }
];

const pricingMeta = [
  { popular: false, btnClass: `${pillBase} w-full justify-center border-2 border-[var(--site-navy)] text-[var(--site-navy)] hover:bg-[var(--site-navy)] hover:text-white` },
  { popular: true, btnClass: pillBlue },
  { popular: false, btnClass: pillGreen }
];

const complianceMeta = [{ icon: '🚫' }, { icon: '✅' }, { icon: '📤' }, { icon: '🔒' }];

// Click-to-locate: in live-preview mode (embedded from /admin/homepage),
// wraps a piece of content so clicking it tells the admin editor which
// field to scroll to and highlight, instead of doing anything on the page.
function Editable({ path, active, notify, as: Tag = 'span', className = '', children }) {
  if (!active) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={`${className} cursor-pointer rounded-sm outline-dashed outline-2 outline-transparent transition hover:bg-[rgb(var(--site-blue-rgb)/10%)] hover:outline-[rgb(var(--site-blue-rgb)/50%)]`}
      onClick={(e) => {
        e.stopPropagation();
        notify(path);
      }}
    >
      {children}
    </Tag>
  );
}

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [rechargeNotice, setRechargeNotice] = useState('');
  const [bannerUrls, setBannerUrls] = useState({});
  const [content, setContent] = useState(defaultHomepageContent);
  const [previewMode, setPreviewMode] = useState(false);
  const heroSlides = content.hero.slides;

  function notify(path) {
    window.parent.postMessage({ type: 'homepage-preview-click', path }, '*');
  }

  // In live-preview mode (embedded as an iframe from /admin/homepage), skip
  // the normal fetches and instead render whatever draft content/images the
  // admin editor pushes via postMessage — so unsaved edits show up instantly.
  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
    if (isPreview) {
      setPreviewMode(true);
      function handleMessage(e) {
        if (e.data?.type === 'homepage-preview-content') {
          setContent(e.data.content);
          if (e.data.bannerUrls) setBannerUrls(e.data.bannerUrls);
        }
      }
      window.addEventListener('message', handleMessage);
      window.parent.postMessage({ type: 'homepage-preview-ready' }, '*');
      return () => window.removeEventListener('message', handleMessage);
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/banners`)
      .then((res) => res.json())
      .then((data) => {
        const byKey = {};
        (data.banners || []).forEach((b) => {
          byKey[b.key] = b.imageUrl;
        });
        setBannerUrls(byKey);
      })
      .catch(() => {});

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/content/homepage`)
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setContent({ ...data.content, navLinks: data.content.navLinks?.length ? data.content.navLinks : defaultHomepageContent.navLinks });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((i) => (i + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  function goToSlide(i) {
    setActiveSlide(i);
  }

  function prevSlide() {
    setActiveSlide((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  }

  function nextSlide() {
    setActiveSlide((i) => (i + 1) % heroSlides.length);
  }

  // The homepage used to have its own inline login modal (duplicating
  // /advisor/login's form + consent logic); it now just sends advisors to
  // that page directly so there's a single login/signup implementation.
  function openLogin() {
    window.location.href = '/advisor/login';
  }

  function handleRecharge(planName) {
    setRechargeNotice(
      `Recharge for the ${planName} plan is launching soon — payments aren't live yet. We'll email you the moment it's ready.`
    );
    setTimeout(() => setRechargeNotice(''), 5000);
  }

  const theme = getHomepageTheme(content.themeKey);
  const heroOverlayOpacity = content.heroOverlayOpacity ?? 70;

  return (
    <div className="min-h-screen bg-white text-[var(--site-navy)]" style={homepageThemeCssVars(theme)}>
      <SiteHeader navLinks={content.navLinks} />

      {/* HERO CAROUSEL — full-bleed photo background with text overlay. The
          background layer bleeds up behind the floating header (which sits
          in its own reserved space above) so the photo reaches the very top
          of the viewport instead of stopping below the navbar. */}
      <section className="relative isolate -mt-[96px] min-h-[500px] overflow-hidden pt-[96px] sm:min-h-[560px] lg:min-h-[620px]">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--site-navy)] via-[var(--site-navy-2)] to-[var(--site-navy-3)]">
          <img
            key={activeSlide}
            src={bannerUrls[`hero-${activeSlide + 1}`] || heroMeta[activeSlide]}
            alt=""
            className={`animate-fade-in h-full w-full object-cover object-top ${previewMode ? 'cursor-pointer outline-dashed outline-2 outline-transparent hover:outline-[rgb(var(--site-blue-rgb)/60%)]' : ''}`}
            onClick={previewMode ? () => notify(['image', `hero-${activeSlide + 1}`]) : undefined}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, rgb(var(--site-navy-rgb) / ${heroOverlayOpacity}%), rgb(var(--site-navy-rgb) / ${(
                heroOverlayOpacity * (45 / 70)
              ).toFixed(1)}%), rgb(var(--site-navy-rgb) / ${(heroOverlayOpacity * (10 / 70)).toFixed(1)}%))`
            }}
          />
        </div>

        <div className="relative flex min-h-[500px] items-center px-[6vw] py-16 sm:min-h-[560px] lg:min-h-[620px]">
          <div key={activeSlide} className="animate-fade-in max-w-2xl text-white">
            <Editable
              path={['hero', 'slides', activeSlide, 'tag']}
              active={previewMode}
              notify={notify}
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[rgb(var(--site-blue-rgb)/30%)] bg-[rgb(var(--site-blue-rgb)/15%)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--site-blue-soft)] backdrop-blur"
            >
              {heroSlides[activeSlide].tag}
            </Editable>
            <h1 className="mb-5 text-[clamp(2rem,4.4vw,3.5rem)] font-extrabold leading-tight tracking-tight">
              <Editable path={['hero', 'slides', activeSlide, 'headlineLine1']} active={previewMode} notify={notify}>
                {heroSlides[activeSlide].headlineLine1}
              </Editable>
              <br />
              <Editable
                path={['hero', 'slides', activeSlide, 'headlineLine2']}
                active={previewMode}
                notify={notify}
                className="bg-gradient-to-r from-[var(--site-blue)] to-[var(--site-blue-soft)] bg-clip-text text-transparent"
              >
                {heroSlides[activeSlide].headlineLine2}
              </Editable>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/80">
              <Editable path={['hero', 'slides', activeSlide, 'text']} active={previewMode} notify={notify}>
                {heroSlides[activeSlide].text}
              </Editable>
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                className={`${pillBlue}${previewMode ? ' outline-dashed outline-2 outline-white/60' : ''}`}
                onClick={
                  previewMode
                    ? (e) => {
                        e.preventDefault();
                        notify(['hero', 'slides', activeSlide, 'primary']);
                      }
                    : openLogin
                }
              >
                {heroSlides[activeSlide].primary}
              </button>
              {heroSlides[activeSlide].secondary && (
                <button
                  type="button"
                  className={`${pillBase} border-2 border-white/80 text-white hover:border-white hover:bg-white hover:text-[var(--site-navy)]${
                    previewMode ? ' outline-dashed outline-2 outline-white/60' : ''
                  }`}
                  onClick={
                    previewMode
                      ? (e) => {
                          e.preventDefault();
                          notify(['hero', 'slides', activeSlide, 'secondary']);
                        }
                      : () => {
                          if (heroSlides[activeSlide].secondaryHref) {
                            document
                              .querySelector(heroSlides[activeSlide].secondaryHref)
                              ?.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            openLogin();
                          }
                        }
                  }
                >
                  {heroSlides[activeSlide].secondary}
                </button>
              )}
            </div>
            {heroSlides[activeSlide].chip && (
              <Editable
                path={['hero', 'slides', activeSlide, 'chip']}
                active={previewMode}
                notify={notify}
                className="mt-7 inline-flex w-fit items-center gap-2.5 rounded-full border border-[rgb(var(--site-green-rgb)/40%)] bg-[rgb(var(--site-green-rgb)/20%)] px-5 py-3 text-sm font-bold text-[var(--site-green-soft)] backdrop-blur"
              >
                ✓ {heroSlides[activeSlide].chip}
              </Editable>
            )}

            {/* dots + arrows — normal flow, no overlap */}
            <div className="mt-10 flex items-center gap-6 border-t border-white/15 pt-8">
              <div className="flex gap-2">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-[5px] rounded-full transition-all duration-300 ${
                      i === activeSlide ? 'w-8 bg-white' : 'w-8 bg-white/25 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white/10"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white/10"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="grid grid-cols-2 gap-6 border-y border-gray-100 bg-gray-50 px-[6vw] py-9 lg:grid-cols-4">
        {content.trustStrip.map((item, i) => (
          <div key={i} className="flex items-center gap-3.5">
            <div className={`grid h-12 w-12 flex-none place-items-center rounded-2xl text-2xl ${trustMeta[i].iconClass}`}>
              {trustMeta[i].icon}
            </div>
            <div>
              <Editable
                path={['trustStrip', i, 'value']}
                active={previewMode}
                notify={notify}
                as="strong"
                className="block font-extrabold text-[var(--site-navy)]"
              >
                {item.value}
              </Editable>
              <Editable
                path={['trustStrip', i, 'label']}
                active={previewMode}
                notify={notify}
                className="text-xs text-gray-500"
              >
                {item.label}
              </Editable>
            </div>
          </div>
        ))}
      </div>

      {/* WHY A WEBSITE */}
      <section id="why" className="px-[6vw] py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Editable
            path={['whyWebsite', 'eyebrow']}
            active={previewMode}
            notify={notify}
            className="text-sm font-bold uppercase tracking-widest text-[var(--site-blue)]"
          >
            {content.whyWebsite.eyebrow}
          </Editable>
          <Editable
            path={['whyWebsite', 'heading']}
            active={previewMode}
            notify={notify}
            as="h2"
            className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            {content.whyWebsite.heading}
          </Editable>
          <Editable
            path={['whyWebsite', 'paragraph']}
            active={previewMode}
            notify={notify}
            as="p"
            className="mt-4 text-gray-600"
          >
            {content.whyWebsite.paragraph}
          </Editable>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.whyWebsite.cards.map((item, i) => (
            <div key={i} className={`rounded-2xl border border-gray-100 bg-white p-7 shadow-sm ${cardHover}`}>
              <div className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl ${whyMeta[i].iconClass}`}>
                {whyMeta[i].icon}
              </div>
              <Editable
                path={['whyWebsite', 'cards', i, 'title']}
                active={previewMode}
                notify={notify}
                as="h3"
                className="mt-5 font-bold tracking-tight"
              >
                {item.title}
              </Editable>
              <Editable
                path={['whyWebsite', 'cards', i, 'desc']}
                active={previewMode}
                notify={notify}
                as="p"
                className="mt-2.5 text-sm leading-relaxed text-gray-600"
              >
                {item.desc}
              </Editable>
              <Editable
                path={['whyWebsite', 'cards', i, 'stat']}
                active={previewMode}
                notify={notify}
                className="mt-4 block text-xs font-bold text-[var(--site-blue)]"
              >
                {item.stat}
              </Editable>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT'S FREE */}
      <section id="free" className="bg-gray-50 px-[6vw] py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div className="relative mx-auto w-full max-w-md">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-blue-50 to-green-50 shadow-sm">
              {bannerUrls['free-image'] ? (
                <img
                  src={bannerUrls['free-image']}
                  alt="Advisor onboarding"
                  className={`h-full w-full object-cover ${previewMode ? 'cursor-pointer outline-dashed outline-2 outline-transparent hover:outline-[rgb(var(--site-blue-rgb)/60%)]' : ''}`}
                  onClick={previewMode ? () => notify(['image', 'free-image']) : undefined}
                />
              ) : (
                <span
                  className={`text-8xl ${previewMode ? 'cursor-pointer' : ''}`}
                  onClick={previewMode ? () => notify(['image', 'free-image']) : undefined}
                >
                  🤝
                </span>
              )}
            </div>
            <div className="absolute -right-4 -top-4 rounded-2xl bg-gradient-to-br from-[var(--site-green)] to-[var(--site-green-soft)] px-6 py-4 text-center text-white shadow-xl shadow-green-200 sm:-right-6 sm:-top-6">
              <strong className="block text-xl font-extrabold">FREE</strong>
              <span className="text-[0.65rem] font-bold uppercase tracking-wide opacity-90">Website + Hosting</span>
            </div>
          </div>
          <div>
            <Editable
              path={['freeSection', 'eyebrow']}
              active={previewMode}
              notify={notify}
              className="text-sm font-bold uppercase tracking-widest text-[var(--site-blue)]"
            >
              {content.freeSection.eyebrow}
            </Editable>
            <Editable
              path={['freeSection', 'heading']}
              active={previewMode}
              notify={notify}
              as="h2"
              className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              {content.freeSection.heading}
            </Editable>
            <Editable
              path={['freeSection', 'paragraph']}
              active={previewMode}
              notify={notify}
              as="p"
              className="mt-5 leading-relaxed text-gray-600"
            >
              {content.freeSection.paragraph}
            </Editable>
            <ul className="mt-7 space-y-4">
              {content.freeSection.checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-gray-600">
                  <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-green-50 text-xs font-bold text-[var(--site-green)]">
                    ✓
                  </span>
                  <span>
                    <Editable path={['freeSection', 'checklist', i, 'bold']} active={previewMode} notify={notify} as="b" className="text-[var(--site-navy)]">
                      {item.bold}
                    </Editable>{' '}
                    <Editable path={['freeSection', 'checklist', i, 'rest']} active={previewMode} notify={notify}>
                      {item.rest}
                    </Editable>
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`${pillBlue} mt-8${previewMode ? ' outline-dashed outline-2 outline-white/60' : ''}`}
              onClick={
                previewMode
                  ? (e) => {
                      e.preventDefault();
                      notify(['freeSection', 'button']);
                    }
                  : openLogin
              }
            >
              {content.freeSection.button} <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* PLATFORM CAPABILITIES */}
      <section id="platform" className="px-[6vw] py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Editable
            path={['capabilities', 'eyebrow']}
            active={previewMode}
            notify={notify}
            className="text-sm font-bold uppercase tracking-widest text-[var(--site-blue)]"
          >
            {content.capabilities.eyebrow}
          </Editable>
          <Editable
            path={['capabilities', 'heading']}
            active={previewMode}
            notify={notify}
            as="h2"
            className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            {content.capabilities.heading}
          </Editable>
          <Editable
            path={['capabilities', 'paragraph']}
            active={previewMode}
            notify={notify}
            as="p"
            className="mt-4 text-gray-600"
          >
            {content.capabilities.paragraph}
          </Editable>
        </div>
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
          {content.capabilities.cards.map((cap, i) => (
            <div key={i} className={`overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm ${cardHover}`}>
              <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-green-50">
                {bannerUrls[capMeta[i].key] ? (
                  <img
                    src={bannerUrls[capMeta[i].key]}
                    alt={cap.title}
                    className={`h-full w-full object-cover ${previewMode ? 'cursor-pointer outline-dashed outline-2 outline-transparent hover:outline-[rgb(var(--site-blue-rgb)/60%)]' : ''}`}
                    onClick={previewMode ? () => notify(['image', capMeta[i].key]) : undefined}
                  />
                ) : (
                  <span
                    className={`text-6xl ${previewMode ? 'cursor-pointer' : ''}`}
                    onClick={previewMode ? () => notify(['image', capMeta[i].key]) : undefined}
                  >
                    {capMeta[i].icon}
                  </span>
                )}
                <span className="absolute right-3.5 top-3.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-extrabold shadow-sm">
                  <span className="text-[var(--site-green)]">10</span> credits
                </span>
              </div>
              <div className="p-6">
                <Editable
                  path={['capabilities', 'cards', i, 'title']}
                  active={previewMode}
                  notify={notify}
                  as="h3"
                  className="text-lg font-bold tracking-tight"
                >
                  {cap.title}
                </Editable>
                <Editable
                  path={['capabilities', 'cards', i, 'desc']}
                  active={previewMode}
                  notify={notify}
                  as="p"
                  className="mt-2.5 text-sm leading-relaxed text-gray-600"
                >
                  {cap.desc}
                </Editable>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ONE PLATFORM FLOW */}
      <div className="mx-[6vw] rounded-[28px] border border-gray-100 bg-gradient-to-br from-blue-50 to-green-50 px-[6vw] py-14 text-center">
        <h2 className="mx-auto max-w-3xl text-2xl font-extrabold tracking-tight sm:text-3xl">
          <Editable path={['flow', 'headingLine1']} active={previewMode} notify={notify}>
            {content.flow.headingLine1}
          </Editable>
          <br />
          <Editable path={['flow', 'headingLine2']} active={previewMode} notify={notify}>
            {content.flow.headingLine2}
          </Editable>
        </h2>
        <Editable
          path={['flow', 'paragraph']}
          active={previewMode}
          notify={notify}
          as="p"
          className="mx-auto mt-4 max-w-xl leading-relaxed text-gray-600"
        >
          {content.flow.paragraph}
        </Editable>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {content.flow.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <Editable
                path={['flow', 'steps', i]}
                active={previewMode}
                notify={notify}
                className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold shadow-sm"
              >
                {step}
              </Editable>
              {i < content.flow.steps.length - 1 && <span className="text-[var(--site-blue)]">→</span>}
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`${pillBlue} mt-9${previewMode ? ' outline-dashed outline-2 outline-white/60' : ''}`}
          onClick={
            previewMode
              ? (e) => {
                  e.preventDefault();
                  notify(['flow', 'button']);
                }
              : openLogin
          }
        >
          {content.flow.button}
        </button>
      </div>

      {/* PRICING */}
      <section id="pricing" className="px-[6vw] py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Editable
            path={['pricing', 'eyebrow']}
            active={previewMode}
            notify={notify}
            className="text-sm font-bold uppercase tracking-widest text-[var(--site-blue)]"
          >
            {content.pricing.eyebrow}
          </Editable>
          <Editable
            path={['pricing', 'heading']}
            active={previewMode}
            notify={notify}
            as="h2"
            className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            {content.pricing.heading}
          </Editable>
          <Editable path={['pricing', 'paragraph']} active={previewMode} notify={notify} as="p" className="mt-4 text-gray-600">
            {content.pricing.paragraph}
          </Editable>
        </div>

        {rechargeNotice && (
          <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-ia-gold-tint bg-ia-gold-tint/40 px-5 py-4 text-center text-sm font-medium text-[var(--site-blue)]">
            {rechargeNotice}
          </div>
        )}

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-7 lg:grid-cols-3">
          {content.pricing.plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-3xl border p-9 text-center shadow-sm ${cardHover} ${
                pricingMeta[i].popular ? 'border-[var(--site-blue)] bg-ia-gold-tint/40' : 'border-gray-100 bg-white'
              }`}
            >
              {pricingMeta[i].popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--site-blue)] px-5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-lg shadow-ia-gold-tint">
                  Most Popular
                </span>
              )}
              <Editable
                path={['pricing', 'plans', i, 'name']}
                active={previewMode}
                notify={notify}
                as="h4"
                className="text-xs font-extrabold uppercase tracking-widest text-gray-500"
              >
                {plan.name}
              </Editable>
              <Editable
                path={['pricing', 'plans', i, 'amount']}
                active={previewMode}
                notify={notify}
                as="div"
                className="mt-3 text-4xl font-extrabold text-[var(--site-navy)]"
              >
                {plan.amount}
              </Editable>
              <div className="mt-2 text-sm font-bold text-[var(--site-green)]">
                <Editable path={['pricing', 'plans', i, 'credits']} active={previewMode} notify={notify}>
                  {plan.credits}
                </Editable>{' '}
                {plan.bonus && (
                  <Editable path={['pricing', 'plans', i, 'bonus']} active={previewMode} notify={notify} className="text-[var(--site-blue)]">
                    {plan.bonus}
                  </Editable>
                )}
              </div>
              <ul className="mt-7 space-y-3 text-left">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="mt-0.5 text-[var(--site-green)]">✓</span>
                    <Editable path={['pricing', 'plans', i, 'features', fi]} active={previewMode} notify={notify}>
                      {f}
                    </Editable>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`${pricingMeta[i].btnClass} mt-8${previewMode ? ' outline-dashed outline-2 outline-current' : ''}`}
                onClick={
                  previewMode
                    ? (e) => {
                        e.preventDefault();
                        notify(['pricing', 'plans', i, 'amount']);
                      }
                    : () => handleRecharge(plan.name)
                }
              >
                Recharge {plan.amount}
              </button>
            </div>
          ))}
        </div>

        <Editable
          path={['pricing', 'note']}
          active={previewMode}
          notify={notify}
          as="div"
          className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center text-sm leading-relaxed text-gray-600"
        >
          {content.pricing.note}
        </Editable>

        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-between gap-6 rounded-2xl border border-gray-100 bg-gradient-to-r from-[#2E6FD8]/5 to-blue-50 p-7">
          <div className="flex items-center gap-4">
            <div className="grid h-[52px] w-[52px] flex-none place-items-center rounded-2xl bg-[#2E6FD8]/10 text-2xl text-[#2E6FD8]">
              🌐
            </div>
            <div>
              <Editable
                path={['pricing', 'domainCrossSell', 'title']}
                active={previewMode}
                notify={notify}
                as="strong"
                className="block text-[var(--site-navy)]"
              >
                {content.pricing.domainCrossSell.title}
              </Editable>
              <Editable
                path={['pricing', 'domainCrossSell', 'desc']}
                active={previewMode}
                notify={notify}
                className="text-sm text-gray-600"
              >
                {content.pricing.domainCrossSell.desc}
              </Editable>
            </div>
          </div>
          <Editable
            path={['pricing', 'domainCrossSell', 'price']}
            active={previewMode}
            notify={notify}
            className="whitespace-nowrap text-xl font-extrabold text-[var(--site-blue)]"
          >
            {content.pricing.domainCrossSell.price}
          </Editable>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="bg-gray-50 px-[6vw] py-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-gray-100 bg-white p-9 shadow-sm sm:p-12">
          <h2 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight">
            <span className="text-[var(--site-green)]">🛡️</span>
            <Editable path={['compliance', 'heading']} active={previewMode} notify={notify}>
              {content.compliance.heading}
            </Editable>
          </h2>
          <Editable
            path={['compliance', 'paragraph']}
            active={previewMode}
            notify={notify}
            as="p"
            className="mt-3 leading-relaxed text-gray-600"
          >
            {content.compliance.paragraph}
          </Editable>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {content.compliance.items.map((item, i) => (
              <div key={i} className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <span className="text-lg text-[var(--site-blue)]">{complianceMeta[i].icon}</span>
                <p className="text-sm leading-relaxed text-gray-600">
                  <Editable path={['compliance', 'items', i, 'lead']} active={previewMode} notify={notify} as="b" className="text-[var(--site-navy)]">
                    {item.lead}
                  </Editable>{' '}
                  <Editable path={['compliance', 'items', i, 'desc']} active={previewMode} notify={notify}>
                    {item.desc}
                  </Editable>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-[6vw] py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          <Editable path={['finalCta', 'headingLine1']} active={previewMode} notify={notify}>
            {content.finalCta.headingLine1}
          </Editable>
          <br />
          <Editable path={['finalCta', 'headingLine2Prefix']} active={previewMode} notify={notify}>
            {content.finalCta.headingLine2Prefix}
          </Editable>{' '}
          <Editable
            path={['finalCta', 'headingLine2Highlight']}
            active={previewMode}
            notify={notify}
            className="text-[var(--site-blue)]"
          >
            {content.finalCta.headingLine2Highlight}
          </Editable>
          .
        </h2>
        <Editable
          path={['finalCta', 'paragraph']}
          active={previewMode}
          notify={notify}
          as="p"
          className="mt-4 text-lg text-gray-600"
        >
          {content.finalCta.paragraph}
        </Editable>
        <button
          type="button"
          className={`${pillBlue} mt-8 px-8 py-4 text-base${previewMode ? ' outline-dashed outline-2 outline-white/60' : ''}`}
          onClick={
            previewMode
              ? (e) => {
                  e.preventDefault();
                  notify(['finalCta', 'button']);
                }
              : openLogin
          }
        >
          {content.finalCta.button} <span aria-hidden>→</span>
        </button>
      </section>

      <SiteFooter />
    </div>
  );
}
