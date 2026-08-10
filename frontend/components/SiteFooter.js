import Link from 'next/link';
import Logo from './Logo';

const columns = [
  {
    title: 'Platform',
    links: [
      ['/#why', 'Why a Website'],
      ['/#free', "It's Free"],
      ['/#platform', 'Platform'],
      ['/#pricing', 'Credits']
    ]
  },
  {
    title: 'Account',
    links: [
      ['/advisor/login', 'Advisor Login'],
      ['/advisor/login', 'Create Your Free Website'],
      ['/customer/login', 'Customer Login']
    ]
  },
  {
    title: 'Legal',
    links: [
      ['/privacy', 'Privacy Policy'],
      ['/terms', 'Terms of Service'],
      ['/advisor-declaration', 'Advisor Declaration']
    ]
  }
];

// Shared marketing-site footer — used on every platform page except the
// advisor microsites (those render their own advisor-branded footer).
export default function SiteFooter() {
  return (
    <footer className="bg-[var(--site-navy)] px-[6vw] pb-8 pt-14 text-white">
      <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold">
            <Logo size="sm" />
          </Link>
          <p className="mt-3 max-w-sm text-sm text-white/80">
            The technology platform that helps licensed insurance advisors build their digital presence — website,
            content and social publishing in one place.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([href, label]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-white/90 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-xs leading-relaxed text-white/80">
        <strong className="text-white">Platform Disclaimer:</strong> InsuranceAdvise.in is a technology
        platform that provides website-building and content-publishing software to independent, IRDAI-licensed
        insurance advisors. InsuranceAdvise.in is not an insurer, insurance intermediary, agent, broker or web
        aggregator. We do not sell, solicit, advertise, recommend or compare insurance products, and we receive no
        commission from any insurance transaction. Each advisor microsite is operated by the respective advisor,
        who is solely responsible for its content, their professional conduct and compliance with applicable IRDAI
        regulations. All platform content is provided for the advisor&apos;s marketing use, subject to the
        advisor&apos;s review, approval and consent before publication. Insurance is a subject matter of
        solicitation — customers should evaluate their own needs and read all policy documents carefully before
        purchase.
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-white/70 sm:flex-row">
        <p>© {new Date().getFullYear()} InsuranceAdvise.in. All rights reserved.</p>
        <div className="flex gap-5">
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
