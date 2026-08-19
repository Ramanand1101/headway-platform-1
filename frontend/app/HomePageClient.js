'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { defaultHomepageContent } from '../lib/homepageContent';
import { getHomepageTheme, homepageThemeCssVars } from '../lib/homepageThemes';
import MobileActionBar from '../components/MobileActionBar';
import Reveal from '../components/Reveal';
import {
  ClockIcon,
  GiftIcon,
  AssetsIcon,
  RocketIcon,
  SearchIcon,
  ShieldIcon,
  ChatIcon,
  CalendarIcon,
  ReelIcon,
  ImageIcon,
  PinIcon,
  BanIcon,
  CheckCircleIcon,
  UploadIcon,
  LockIcon,
  HandshakeIcon,
  GlobeIcon,
  StarIcon,
  QuoteIcon,
  ArrowUpRightIcon,
  MailIcon,
  PhoneOutlineIcon
} from '../components/HomeIcons';

// Flat, borderless CTAs with a soft lift on hover instead of a glow-shadow —
// closer to Plaid's restrained, whitespace-driven button style than the
// previous heavy colored-shadow pills.
const pillBase =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]';
const pillBlue = `${pillBase} bg-[var(--site-navy)] text-white shadow-sm hover:bg-[var(--site-navy-2)] hover:shadow-md`;
const pillOutline = `${pillBase} border border-gray-300 text-[var(--site-navy)] hover:border-[var(--site-navy)] hover:bg-gray-50`;
const pillGreen = `${pillBase} bg-[var(--site-green)] text-white shadow-sm hover:bg-[var(--site-green-soft)] hover:shadow-md`;
// Subtle border-based hover instead of a heavy drop shadow — cards read as
// flat, bordered surfaces (Plaid-style) rather than floating/elevated ones.
const cardHover = 'transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-sm';

// Non-text presentation metadata that stays fixed in code (icons, colors,
// image keys) — the actual copy comes from `content`, editable at
// /admin/homepage. Arrays below line up by index with the content arrays.
const heroMeta = ['/images/banner-1.jpg', '/images/banner-2.jpg', '/images/banner-3.jpg', '/images/banner-4.jpg'];

const trustMeta = [
  { Icon: ClockIcon, iconClass: 'bg-ia-gold-tint/40 text-[var(--site-blue)]' },
  { Icon: GiftIcon, iconClass: 'bg-green-50 text-[var(--site-green)]' },
  { Icon: AssetsIcon, iconClass: 'bg-[#2E6FD8]/10 text-[#2E6FD8]' },
  { Icon: RocketIcon, iconClass: 'bg-ia-gold-tint/40 text-[var(--site-blue)]' }
];

const whyMeta = [
  { Icon: SearchIcon, iconClass: 'bg-ia-gold-tint/40 text-[var(--site-blue)]' },
  { Icon: ShieldIcon, iconClass: 'bg-green-50 text-[var(--site-green)]' },
  { Icon: ChatIcon, iconClass: 'bg-[#2E6FD8]/10 text-[#2E6FD8]' },
  { Icon: CalendarIcon, iconClass: 'bg-ia-gold-tint/40 text-[var(--site-blue)]' }
];

const capMeta = [
  { key: 'cap-reels', Icon: ReelIcon },
  { key: 'cap-carousels', Icon: ImageIcon },
  { key: 'cap-posts', Icon: PinIcon }
];

const pricingMeta = [
  { popular: false, btnClass: `${pillOutline} w-full justify-center` },
  { popular: true, btnClass: `${pillBlue} w-full justify-center` },
  { popular: false, btnClass: `${pillGreen} w-full justify-center` }
];

const complianceMeta = [{ Icon: BanIcon }, { Icon: CheckCircleIcon }, { Icon: UploadIcon }, { Icon: LockIcon }];

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

// Receives the banners + admin content already resolved server-side (see
// app/page.js) so the very first paint — SSR and hydration alike — already
// shows the real configured content. Nothing here fetches that data on
// mount anymore, which is what used to cause a visible flash of the
// fallback local images/default copy before the real ones swapped in.
export default function HomePageClient({ initialContent, initialBannerUrls }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [rechargeNotice, setRechargeNotice] = useState('');
  const [bannerUrls, setBannerUrls] = useState(initialBannerUrls || {});
  const [content, setContent] = useState(initialContent || defaultHomepageContent);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', irdaiLicenseNumber: '', city: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ submitting: false, error: '', success: false });
  const heroSlides = content.hero.slides;
  const testimonialItems = content.testimonials?.items || [];

  function notify(path) {
    window.parent.postMessage({ type: 'homepage-preview-click', path }, '*');
  }

  // In live-preview mode (embedded as an iframe from /admin/homepage), skip
  // the server-provided content and instead render whatever draft
  // content/images the admin editor pushes via postMessage — so unsaved
  // edits show up instantly.
  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
    if (!isPreview) return;

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

  async function handleContactSubmit(e) {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;
    setContactStatus({ submitting: true, error: '', success: false });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
        signal: AbortSignal.timeout(20000)
      });
      const data = await res.json();
      if (!res.ok) {
        setContactStatus({ submitting: false, error: data.error || 'Could not submit — please try again', success: false });
        return;
      }
      setContactStatus({ submitting: false, error: '', success: true });
      setContactForm({ name: '', phone: '', irdaiLicenseNumber: '', city: '', message: '' });
    } catch (err) {
      setContactStatus({ submitting: false, error: 'Network error — please try again', success: false });
    }
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
    <div className="min-h-screen bg-white pb-16 text-[var(--site-navy)] sm:pb-0" style={homepageThemeCssVars(theme)}>
      <SiteHeader navLinks={content.navLinks} />

      {/* HERO CARD — rounded, inset gradient/photo card (not full-bleed) —
          the "Paynext"-style contained hero rather than an edge-to-edge
          banner: margin on all sides, rounded corners, floats just below
          the sticky pill nav instead of bleeding behind it. */}
      <section className="relative isolate mx-[3vw] mt-4 min-h-[440px] overflow-hidden rounded-[32px] sm:min-h-[480px] lg:min-h-[540px]">
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

      {/* TRUST STRIP — big bold centered stat numbers with vertical
          dividers, no icons. */}
      <Reveal
        as="div"
        className="grid grid-cols-2 gap-y-8 divide-gray-100 border-y border-gray-100 bg-gray-50 px-[6vw] py-12 text-center sm:divide-x lg:grid-cols-4"
      >
        {content.trustStrip.map((item, i) => (
          <div key={i} className="flex flex-col items-center px-3">
            <Editable
              path={['trustStrip', i, 'value']}
              active={previewMode}
              notify={notify}
              as="strong"
              className="block text-2xl font-extrabold leading-tight tracking-tight text-[var(--site-navy)] sm:text-3xl"
            >
              {item.value}
            </Editable>
            <Editable
              path={['trustStrip', i, 'label']}
              active={previewMode}
              notify={notify}
              className="mt-1.5 block text-sm text-gray-500"
            >
              {item.label}
            </Editable>
          </div>
        ))}
      </Reveal>

      {/* WHY A WEBSITE */}
      <section id="why" className="px-[6vw] py-28">
        <Reveal as="div" className="mx-auto mb-14 max-w-2xl text-center">
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
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.whyWebsite.cards.map((item, i) => {
            const WhyIcon = whyMeta[i].Icon;
            return (
            <Reveal
              as="div"
              key={i}
              delay={i * 80}
              className={`rounded-2xl border border-gray-100 bg-white p-7 shadow-sm ${cardHover}`}
            >
              <div className={`grid h-14 w-14 place-items-center rounded-2xl ${whyMeta[i].iconClass}`}>
                <WhyIcon className="h-6 w-6" />
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
            </Reveal>
            );
          })}
        </div>
      </section>

      {/* HOW IT'S FREE */}
      <section id="free" className="bg-gray-50 px-[6vw] py-28">
        <Reveal as="div" className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
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
                  className={`text-[var(--site-navy)] ${previewMode ? 'cursor-pointer' : ''}`}
                  onClick={previewMode ? () => notify(['image', 'free-image']) : undefined}
                >
                  <HandshakeIcon className="h-28 w-28" strokeWidth={1.2} />
                </span>
              )}
            </div>
            <div className="absolute -right-4 -top-4 rounded-2xl bg-gradient-to-br from-[var(--site-green)] to-[var(--site-green-soft)] px-6 py-4 text-center text-white shadow-md sm:-right-6 sm:-top-6">
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
        </Reveal>
      </section>

      {/* PLATFORM CAPABILITIES */}
      <section id="platform" className="px-[6vw] py-28">
        <Reveal as="div" className="mx-auto mb-14 max-w-2xl text-center">
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
        </Reveal>
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
          {content.capabilities.cards.map((cap, i) => {
            const CapIcon = capMeta[i].Icon;
            return (
            <Reveal
              as="div"
              key={i}
              delay={i * 80}
              className={`group relative aspect-[4/5] overflow-hidden rounded-3xl ${cardHover}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--site-navy)] to-[var(--site-navy-2)]">
                {bannerUrls[capMeta[i].key] ? (
                  <img
                    src={bannerUrls[capMeta[i].key]}
                    alt={cap.title}
                    className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${previewMode ? 'cursor-pointer outline-dashed outline-2 outline-transparent hover:outline-[rgb(var(--site-blue-rgb)/60%)]' : ''}`}
                    onClick={previewMode ? () => notify(['image', capMeta[i].key]) : undefined}
                  />
                ) : (
                  <span
                    className={`grid h-full w-full place-items-center text-white/25 ${previewMode ? 'cursor-pointer' : ''}`}
                    onClick={previewMode ? () => notify(['image', capMeta[i].key]) : undefined}
                  >
                    <CapIcon className="h-20 w-20" />
                  </span>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute right-4 top-4 grid h-10 w-10 flex-none place-items-center rounded-full bg-white/90 text-[var(--site-navy)] shadow-sm transition group-hover:bg-[var(--site-blue)] group-hover:text-white">
                <ArrowUpRightIcon className="h-4 w-4" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Content Engine</span>
                <Editable
                  path={['capabilities', 'cards', i, 'title']}
                  active={previewMode}
                  notify={notify}
                  as="h3"
                  className="mt-1.5 text-xl font-extrabold tracking-tight text-white"
                >
                  {cap.title}
                </Editable>
                <Editable
                  path={['capabilities', 'cards', i, 'desc']}
                  active={previewMode}
                  notify={notify}
                  as="p"
                  className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/70"
                >
                  {cap.desc}
                </Editable>
              </div>
            </Reveal>
            );
          })}
        </div>
      </section>

      {/* ONE PLATFORM FLOW */}
      <Reveal
        as="div"
        className="relative mx-[6vw] overflow-hidden rounded-[28px] border border-gray-100 bg-gradient-to-br from-blue-50 to-green-50 px-[6vw] py-14 text-center"
      >
        <div className="bg-grid-pattern pointer-events-none absolute inset-0 -z-10" />
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
      </Reveal>

      {/* PRICING — dark navy section, middle "popular" plan raised on a
          bright accent card with a circular price badge. */}
      <section id="pricing" className="relative isolate overflow-hidden bg-[var(--site-navy)] px-[6vw] py-28 text-white">
        <div className="bg-grid-pattern pointer-events-none absolute inset-0 -z-10 opacity-40" />
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="animate-ia-drift1 absolute -left-24 top-0 h-96 w-96 rounded-full bg-[var(--site-blue)]/15 blur-3xl" />
          <div className="animate-ia-drift2 absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[var(--site-green)]/10 blur-3xl" />
        </div>
        <Reveal as="div" className="mx-auto mb-14 max-w-2xl text-center">
          <Editable
            path={['pricing', 'eyebrow']}
            active={previewMode}
            notify={notify}
            className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--site-blue-soft)]"
          >
            {content.pricing.eyebrow}
          </Editable>
          <Editable
            path={['pricing', 'heading']}
            active={previewMode}
            notify={notify}
            as="h2"
            className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            {content.pricing.heading}
          </Editable>
          <Editable path={['pricing', 'paragraph']} active={previewMode} notify={notify} as="p" className="mt-4 text-white/70">
            {content.pricing.paragraph}
          </Editable>
        </Reveal>

        {rechargeNotice && (
          <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-[var(--site-blue)]/40 bg-[var(--site-blue)]/15 px-5 py-4 text-center text-sm font-medium text-[var(--site-blue-soft)]">
            {rechargeNotice}
          </div>
        )}

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-7 lg:grid-cols-3 lg:items-center">
          {content.pricing.plans.map((plan, i) => (
            <Reveal
              as="div"
              key={i}
              delay={i * 80}
              className={`relative rounded-3xl p-9 text-center transition-all duration-300 hover:-translate-y-1 ${
                pricingMeta[i].popular
                  ? 'bg-gradient-to-br from-[var(--site-blue)] to-[var(--site-blue-soft)] text-[var(--site-navy)] shadow-xl shadow-black/20 lg:scale-105'
                  : 'border border-white/10 bg-white/5 text-white'
              }`}
            >
              {pricingMeta[i].popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--site-navy)] px-5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-sm">
                  Most Popular
                </span>
              )}
              <Editable
                path={['pricing', 'plans', i, 'name']}
                active={previewMode}
                notify={notify}
                as="h4"
                className={`text-xs font-extrabold uppercase tracking-widest ${pricingMeta[i].popular ? 'text-[var(--site-navy)]/70' : 'text-white/60'}`}
              >
                {plan.name}
              </Editable>

              <div
                className={`mx-auto my-6 grid h-32 w-32 place-items-center rounded-full border-2 border-dashed ${
                  pricingMeta[i].popular ? 'border-[var(--site-navy)]/30' : 'border-white/25'
                }`}
              >
                <div>
                  <Editable
                    path={['pricing', 'plans', i, 'amount']}
                    active={previewMode}
                    notify={notify}
                    as="div"
                    className="text-2xl font-extrabold"
                  >
                    {plan.amount}
                  </Editable>
                  <span className={`text-[0.6rem] font-bold uppercase tracking-wide ${pricingMeta[i].popular ? 'text-[var(--site-navy)]/60' : 'text-white/50'}`}>
                    One-time
                  </span>
                </div>
              </div>

              <div className={`text-sm font-bold ${pricingMeta[i].popular ? 'text-[var(--site-navy)]' : 'text-[var(--site-green-soft)]'}`}>
                <Editable path={['pricing', 'plans', i, 'credits']} active={previewMode} notify={notify}>
                  {plan.credits}
                </Editable>{' '}
                {plan.bonus && (
                  <Editable path={['pricing', 'plans', i, 'bonus']} active={previewMode} notify={notify}>
                    {plan.bonus}
                  </Editable>
                )}
              </div>
              <ul className="mt-7 space-y-3 text-left">
                {plan.features.map((f, fi) => (
                  <li key={fi} className={`flex items-start gap-2.5 text-sm ${pricingMeta[i].popular ? 'text-[var(--site-navy)]/90' : 'text-white/80'}`}>
                    <span className={`mt-0.5 ${pricingMeta[i].popular ? 'text-[var(--site-navy)]' : 'text-[var(--site-green-soft)]'}`}>✓</span>
                    <Editable path={['pricing', 'plans', i, 'features', fi]} active={previewMode} notify={notify}>
                      {f}
                    </Editable>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`mt-8 w-full justify-center ${pillBase} ${
                  pricingMeta[i].popular
                    ? 'bg-[var(--site-navy)] text-white hover:bg-[var(--site-navy-2)]'
                    : 'border border-white/25 text-white hover:bg-white hover:text-[var(--site-navy)]'
                }${previewMode ? ' outline-dashed outline-2 outline-current' : ''}`}
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
            </Reveal>
          ))}
        </div>

        <Editable
          path={['pricing', 'note']}
          active={previewMode}
          notify={notify}
          as="div"
          className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm leading-relaxed text-white/70"
        >
          {content.pricing.note}
        </Editable>

        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 p-7">
          <div className="flex items-center gap-4">
            <div className="grid h-[52px] w-[52px] flex-none place-items-center rounded-2xl bg-[var(--site-blue)]/15 text-[var(--site-blue-soft)]">
              <GlobeIcon className="h-6 w-6" />
            </div>
            <div>
              <Editable
                path={['pricing', 'domainCrossSell', 'title']}
                active={previewMode}
                notify={notify}
                as="strong"
                className="block text-white"
              >
                {content.pricing.domainCrossSell.title}
              </Editable>
              <Editable
                path={['pricing', 'domainCrossSell', 'desc']}
                active={previewMode}
                notify={notify}
                className="text-sm text-white/60"
              >
                {content.pricing.domainCrossSell.desc}
              </Editable>
            </div>
          </div>
          <Editable
            path={['pricing', 'domainCrossSell', 'price']}
            active={previewMode}
            notify={notify}
            className="whitespace-nowrap text-xl font-extrabold text-[var(--site-blue-soft)]"
          >
            {content.pricing.domainCrossSell.price}
          </Editable>
        </div>
      </section>

      {/* TESTIMONIALS — split layout: quote on the left with a manual
          prev/next carousel, overlapping circular photo collage on the
          right. */}
      {testimonialItems.length > 0 && (
        <section className="px-[6vw] py-28">
          <Reveal as="div" className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
            <div>
              <Editable
                path={['testimonials', 'eyebrow']}
                active={previewMode}
                notify={notify}
                className="text-sm font-bold uppercase tracking-widest text-[var(--site-blue)]"
              >
                {content.testimonials.eyebrow}
              </Editable>
              <Editable
                path={['testimonials', 'heading']}
                active={previewMode}
                notify={notify}
                as="h2"
                className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                {content.testimonials.heading}
              </Editable>

              <div key={activeTestimonial} className="animate-fade-in mt-8">
                <div className="flex gap-1 text-[var(--site-blue)]">
                  {Array.from({ length: testimonialItems[activeTestimonial].rating || 5 }).map((_, si) => (
                    <StarIcon key={si} className="h-5 w-5" />
                  ))}
                </div>
                <QuoteIcon className="mt-5 h-8 w-8 text-[var(--site-blue)]/25" />
                <Editable
                  path={['testimonials', 'items', activeTestimonial, 'quote']}
                  active={previewMode}
                  notify={notify}
                  as="p"
                  className="mt-3 text-lg leading-relaxed text-gray-700"
                >
                  {testimonialItems[activeTestimonial].quote}
                </Editable>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-ia-gold-tint/40 text-sm font-extrabold text-[var(--site-blue)]">
                    {testimonialItems[activeTestimonial].name?.[0] || 'A'}
                  </div>
                  <div>
                    <Editable
                      path={['testimonials', 'items', activeTestimonial, 'name']}
                      active={previewMode}
                      notify={notify}
                      as="p"
                      className="text-sm font-extrabold text-[var(--site-navy)]"
                    >
                      {testimonialItems[activeTestimonial].name}
                    </Editable>
                    <Editable
                      path={['testimonials', 'items', activeTestimonial, 'role']}
                      active={previewMode}
                      notify={notify}
                      as="p"
                      className="text-xs text-gray-500"
                    >
                      {testimonialItems[activeTestimonial].role}
                    </Editable>
                  </div>
                </div>
              </div>

              {testimonialItems.length > 1 && (
                <div className="mt-8 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTestimonial((i) => (i - 1 + testimonialItems.length) % testimonialItems.length)}
                    aria-label="Previous testimonial"
                    className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 text-[var(--site-navy)] transition hover:border-[var(--site-navy)] hover:bg-gray-50"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTestimonial((i) => (i + 1) % testimonialItems.length)}
                    aria-label="Next testimonial"
                    className="grid h-10 w-10 place-items-center rounded-full bg-[var(--site-navy)] text-white transition hover:bg-[var(--site-navy-2)]"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            <div className="relative mx-auto h-80 w-full max-w-sm sm:h-96">
              <div className="absolute left-0 top-0 h-56 w-56 overflow-hidden rounded-full border-4 border-white shadow-lg sm:h-64 sm:w-64">
                {bannerUrls['testimonial-photo-1'] ? (
                  <img
                    src={bannerUrls['testimonial-photo-1']}
                    alt=""
                    className={`h-full w-full object-cover ${previewMode ? 'cursor-pointer outline-dashed outline-2 outline-transparent hover:outline-[rgb(var(--site-blue-rgb)/60%)]' : ''}`}
                    onClick={previewMode ? () => notify(['image', 'testimonial-photo-1']) : undefined}
                  />
                ) : (
                  <span
                    className={`grid h-full w-full place-items-center bg-gradient-to-br from-blue-50 to-green-50 text-[var(--site-blue)] ${previewMode ? 'cursor-pointer' : ''}`}
                    onClick={previewMode ? () => notify(['image', 'testimonial-photo-1']) : undefined}
                  >
                    <HandshakeIcon className="h-20 w-20" strokeWidth={1.1} />
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 h-44 w-44 overflow-hidden rounded-full border-4 border-white shadow-lg sm:h-52 sm:w-52">
                {bannerUrls['testimonial-photo-2'] ? (
                  <img
                    src={bannerUrls['testimonial-photo-2']}
                    alt=""
                    className={`h-full w-full object-cover ${previewMode ? 'cursor-pointer outline-dashed outline-2 outline-transparent hover:outline-[rgb(var(--site-blue-rgb)/60%)]' : ''}`}
                    onClick={previewMode ? () => notify(['image', 'testimonial-photo-2']) : undefined}
                  />
                ) : (
                  <span
                    className={`grid h-full w-full place-items-center bg-gradient-to-br from-green-50 to-blue-50 text-[var(--site-green)] ${previewMode ? 'cursor-pointer' : ''}`}
                    onClick={previewMode ? () => notify(['image', 'testimonial-photo-2']) : undefined}
                  >
                    <ShieldIcon className="h-16 w-16" strokeWidth={1.1} />
                  </span>
                )}
              </div>
              <div className="absolute right-6 top-6 grid h-14 w-14 place-items-center rounded-2xl bg-white text-[var(--site-green)] shadow-md">
                <StarIcon className="h-6 w-6" />
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* CONTACT — split layout: support info on the left, lead-capture
          form (wired to POST /api/homepage-leads) on the right. */}
      <section id="contact" className="bg-gray-50 px-[6vw] py-28">
        <Reveal as="div" className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <Editable
              path={['contact', 'eyebrow']}
              active={previewMode}
              notify={notify}
              className="text-sm font-bold uppercase tracking-widest text-[var(--site-blue)]"
            >
              {content.contact.eyebrow}
            </Editable>
            <Editable
              path={['contact', 'heading']}
              active={previewMode}
              notify={notify}
              as="h2"
              className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              {content.contact.heading}
            </Editable>

            <div className="mt-9 space-y-3">
              <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-ia-gold-tint/40 text-[var(--site-blue)]">
                  <ClockIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Support hours</p>
                  <Editable path={['contact', 'supportHours']} active={previewMode} notify={notify} as="p" className="text-sm font-semibold text-[var(--site-navy)]">
                    {content.contact.supportHours}
                  </Editable>
                </div>
              </div>

              {content.contact.whatsappNumber && (
                <a
                  href={`https://wa.me/${content.contact.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl bg-[var(--site-navy)] p-5 text-white shadow-sm transition hover:bg-[var(--site-navy-2)]"
                >
                  <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-white/10">
                    <PhoneOutlineIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-white/60">Call or WhatsApp</p>
                    <Editable path={['contact', 'whatsappNumber']} active={previewMode} notify={notify} as="p" className="text-sm font-semibold">
                      {content.contact.whatsappNumber}
                    </Editable>
                  </div>
                </a>
              )}

              <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-green-50 text-[var(--site-green)]">
                  <MailIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Email us today</p>
                  <Editable path={['contact', 'email']} active={previewMode} notify={notify} as="p" className="text-sm font-semibold text-[var(--site-navy)]">
                    {content.contact.email}
                  </Editable>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm sm:p-9">
            <Editable
              path={['contact', 'formTitle']}
              active={previewMode}
              notify={notify}
              as="h3"
              className="text-xs font-extrabold uppercase tracking-widest text-gray-500"
            >
              {content.contact.formTitle}
            </Editable>

            {contactStatus.success ? (
              <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
                <p className="font-bold text-[var(--site-green)]">Thanks — we&apos;ve got your details.</p>
                <p className="mt-1.5 text-sm text-gray-600">Our team will reach out to you shortly.</p>
              </div>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name*"
                    value={contactForm.name}
                    onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--site-blue)]"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number*"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--site-blue)]"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="IRDAI License Number"
                    value={contactForm.irdaiLicenseNumber}
                    onChange={(e) => setContactForm((f) => ({ ...f, irdaiLicenseNumber: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--site-blue)]"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={contactForm.city}
                    onChange={(e) => setContactForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--site-blue)]"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--site-blue)]"
                />
                {contactStatus.error && <p className="text-sm font-medium text-red-600">{contactStatus.error}</p>}
                <button type="submit" disabled={contactStatus.submitting} className={`${pillBlue} w-full justify-center disabled:opacity-60`}>
                  {contactStatus.submitting ? 'Submitting...' : content.contact.submitButton}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </section>

      {/* INSIGHTS / BLOG teaser — trust-building copy cards, not linked to
          live articles (no company blog exists yet, only per-advisor
          microsite blogs). */}
      <section className="px-[6vw] py-28">
        <Reveal as="div" className="mx-auto mb-14 max-w-2xl text-center">
          <Editable
            path={['insights', 'eyebrow']}
            active={previewMode}
            notify={notify}
            className="text-sm font-bold uppercase tracking-widest text-[var(--site-blue)]"
          >
            {content.insights.eyebrow}
          </Editable>
          <Editable
            path={['insights', 'heading']}
            active={previewMode}
            notify={notify}
            as="h2"
            className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            {content.insights.heading}
          </Editable>
        </Reveal>
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          {content.insights.posts.map((post, i) => {
            const key = `insight-${i + 1}`;
            return (
              <Reveal
                as="div"
                key={i}
                delay={i * 80}
                className={`overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm ${cardHover}`}
              >
                <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--site-navy)] to-[var(--site-navy-2)]">
                  {bannerUrls[key] ? (
                    <img
                      src={bannerUrls[key]}
                      alt={post.title}
                      className={`h-full w-full object-cover ${previewMode ? 'cursor-pointer outline-dashed outline-2 outline-transparent hover:outline-[rgb(var(--site-blue-rgb)/60%)]' : ''}`}
                      onClick={previewMode ? () => notify(['image', key]) : undefined}
                    />
                  ) : (
                    <span
                      className={`text-white/25 ${previewMode ? 'cursor-pointer' : ''}`}
                      onClick={previewMode ? () => notify(['image', key]) : undefined}
                    >
                      <SearchIcon className="h-16 w-16" />
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[var(--site-navy)] shadow-sm">
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <Editable path={['insights', 'posts', i, 'author']} active={previewMode} notify={notify} className="text-xs font-bold uppercase tracking-wide text-white/60">
                      {post.author}
                    </Editable>
                  </div>
                </div>
                <div className="p-6">
                  <Editable
                    path={['insights', 'posts', i, 'title']}
                    active={previewMode}
                    notify={notify}
                    as="h3"
                    className="text-lg font-bold tracking-tight"
                  >
                    {post.title}
                  </Editable>
                  <Editable
                    path={['insights', 'posts', i, 'desc']}
                    active={previewMode}
                    notify={notify}
                    as="p"
                    className="mt-2.5 text-sm leading-relaxed text-gray-600"
                  >
                    {post.desc}
                  </Editable>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="bg-gray-50 px-[6vw] py-28">
        <Reveal as="div" className="mx-auto max-w-4xl rounded-3xl border border-gray-100 bg-white p-9 shadow-sm sm:p-12">
          <h2 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight">
            <ShieldIcon className="h-6 w-6 flex-none text-[var(--site-green)]" />
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
            {content.compliance.items.map((item, i) => {
              const ComplianceIcon = complianceMeta[i].Icon;
              return (
              <div key={i} className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <ComplianceIcon className="h-5 w-5 flex-none text-[var(--site-blue)]" />
                <p className="text-sm leading-relaxed text-gray-600">
                  <Editable path={['compliance', 'items', i, 'lead']} active={previewMode} notify={notify} as="b" className="text-[var(--site-navy)]">
                    {item.lead}
                  </Editable>{' '}
                  <Editable path={['compliance', 'items', i, 'desc']} active={previewMode} notify={notify}>
                    {item.desc}
                  </Editable>
                </p>
              </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* FINAL CTA */}
      <section className="px-[6vw] py-28 text-center">
        <Reveal as="h2" className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
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
        </Reveal>
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
      <MobileActionBar
        accountHref="/advisor/login"
        accountLabel="Advisor Login"
        enquireHref="/#contact"
        enquireLabel="Enquire"
        whatsappNumber={content.contact?.whatsappNumber}
        phone={content.contact?.whatsappNumber}
      />
    </div>
  );
}
