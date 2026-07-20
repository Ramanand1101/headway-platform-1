import { micrositeCopy } from '../lib/advisorMicrositeCopyDefaults';

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
    <section id="top" className="scroll-mt-20 bg-white px-6 pb-14 pt-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          {badges.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tc-primary-tint)] px-3.5 py-1.5 text-xs font-bold text-[var(--tc-primary)]"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>
          )}

          <h1
            data-field="micrositeContent.heroHeadline"
            className="text-[clamp(2.1rem,4.6vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-[var(--tc-dark)]"
          >
            {micrositeCopy(advisor, 'heroHeadline')}
          </h1>
          <p data-field="bio" className="mt-5 max-w-md text-gray-500">
            {advisor.bio ||
              `Personalized insurance solutions for individuals, families — explained clearly, chosen wisely.`}
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <a
              href="#contact"
              data-field="micrositeContent.heroCtaPrimary"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--tc-primary)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--tc-primary-dark)]"
            >
              {micrositeCopy(advisor, 'heroCtaPrimary')} <span aria-hidden>↗</span>
            </a>
            {advisor.whatsappNumber && (
              <a
                href={`https://wa.me/${advisor.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                data-field="micrositeContent.heroCtaSecondary"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--tc-dark)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
              >
                {micrositeCopy(advisor, 'heroCtaSecondary')}
              </a>
            )}
          </div>

          {avgRating && (
            <div className="mt-8">
              <p className="text-sm font-extrabold text-[var(--tc-dark)]">
                {avgRating} <span className="text-[var(--tc-primary)]">★★★★★</span>
              </p>
              <p className="text-xs text-gray-500">From {reviewCount}+ Reviews</p>
            </div>
          )}
        </div>

        <div data-field="micrositeImages.hero" className="relative">
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
            <div className="absolute -bottom-5 -left-5 max-w-[12rem] rounded-2xl bg-white px-5 py-3.5 shadow-xl">
              <p className="text-sm font-extrabold leading-tight text-[var(--tc-primary)]">{statPill.name}</p>
              {statPill.description && (
                <p className="mt-0.5 text-[0.65rem] font-bold leading-tight text-gray-500">{statPill.description}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
