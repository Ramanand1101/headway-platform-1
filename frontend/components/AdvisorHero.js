import { micrositeCopy } from '../lib/advisorMicrositeCopyDefaults';
import Reveal from './Reveal';
import CountUp from './CountUp';

export default function AdvisorHero({ advisor, testimonials = [] }) {
  const ratings = testimonials.map((t) => t.rating).filter((r) => typeof r === 'number');
  const avgRating = advisor.googleBusiness?.rating || (ratings.length
    ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
    : null);
  const reviewCount = advisor.googleBusiness?.reviewCount || testimonials.length;
  const heroImage = advisor.micrositeImages?.hero || advisor.photoUrl;

  const badges = [
    ...(advisor.credentials || []),
    advisor.irdaiLicenseNumber && !advisor.credentials?.some((c) => /irdai/i.test(c)) && 'IRDAI Licensed',
    advisor.city
  ].filter(Boolean);

  const statPill = advisor.achievements?.[0];

  return (
    <section id="top" className="relative scroll-mt-20 overflow-hidden bg-white px-6 pb-16 pt-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-[var(--tc-primary-tint)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/2 h-72 w-72 rounded-full bg-[var(--tc-secondary-tint)] opacity-70 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          {badges.length > 0 && (
            <Reveal className="mb-5 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tc-primary-tint)] px-3.5 py-1.5 text-xs font-bold text-[var(--tc-primary)]"
                >
                  ✓ {badge}
                </span>
              ))}
            </Reveal>
          )}

          <Reveal delay={80}>
            <h1
              data-field="micrositeContent.heroHeadline"
              className="text-[clamp(2.1rem,4.6vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-[var(--tc-dark)]"
            >
              {micrositeCopy(advisor, 'heroHeadline')}
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p data-field="bio" className="mt-5 max-w-md text-gray-500">
              {advisor.bio ||
                `Personalized insurance solutions for individuals, families — explained clearly, chosen wisely.`}
            </p>
          </Reveal>

          <Reveal delay={200} className="mt-8 flex flex-wrap gap-3.5">
            <a
              href="#contact"
              data-field="micrositeContent.heroCtaPrimary"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--tc-primary)] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-[var(--tc-primary)]/30 transition hover:-translate-y-0.5 hover:bg-[var(--tc-primary-dark)] hover:shadow-md"
            >
              {micrositeCopy(advisor, 'heroCtaPrimary')} <span aria-hidden>↗</span>
            </a>
            {advisor.whatsappNumber && (
              <a
                href={`https://wa.me/${advisor.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                data-field="micrositeContent.heroCtaSecondary"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--tc-dark)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
              >
                {micrositeCopy(advisor, 'heroCtaSecondary')}
              </a>
            )}
          </Reveal>

          {avgRating && (
            <Reveal delay={260} className="mt-8">
              <p className="text-sm font-extrabold text-[var(--tc-dark)]">
                <CountUp value={avgRating} decimals={1} /> <span className="text-[var(--tc-primary)]">★★★★★</span>
              </p>
              <p className="text-xs text-gray-500">
                From <CountUp value={reviewCount} />+ Reviews
              </p>
            </Reveal>
          )}
        </div>

        <Reveal delay={120} className="relative" as="div">
          <div data-field="micrositeImages.hero" className="relative">
            <div
              aria-hidden
              className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-[var(--tc-primary)]/25 via-[var(--tc-secondary)]/10 to-transparent blur-xl"
            />
            {heroImage ? (
              <img
                src={heroImage}
                alt={advisor.name}
                referrerPolicy="no-referrer"
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-[var(--tc-dark)] text-6xl font-extrabold text-white/20 shadow-lg">
                {advisor.name?.[0] || 'A'}
              </div>
            )}
            {statPill?.name && (
              <div className="absolute -bottom-5 -left-5 max-w-[12rem] rounded-2xl bg-white px-5 py-3.5 shadow-xl transition hover:-translate-y-1">
                <p className="text-sm font-extrabold leading-tight text-[var(--tc-primary)]">{statPill.name}</p>
                {statPill.description && (
                  <p className="mt-0.5 text-[0.65rem] font-bold leading-tight text-gray-500">
                    {statPill.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
