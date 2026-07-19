function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 4 6v6c0 5.2 3.4 9.4 8 10 4.6-.6 8-4.8 8-10V6l-8-4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function GraduationCapIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrendingUpIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17 9 11l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21V8l7-4 7 4v13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 21v-6h4v6M9 9h.01M9 13h.01M9 17h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Match a service card to a relevant icon by keyword, falling back to a
// rotation through all six so every card still looks distinct.
const keywordIcons = [
  { test: /life/i, Icon: ShieldIcon },
  { test: /health|medical/i, Icon: HeartIcon },
  { test: /child|education/i, Icon: GraduationCapIcon },
  { test: /retirement|pension/i, Icon: ClockIcon },
  { test: /invest|ulip|wealth/i, Icon: TrendingUpIcon },
  { test: /group|corporate|business/i, Icon: BuildingIcon }
];
const iconRotation = [ShieldIcon, HeartIcon, GraduationCapIcon, ClockIcon, TrendingUpIcon, BuildingIcon];
const colorRotation = [
  { bg: 'bg-[var(--tc-primary-tint)]', text: 'text-[var(--tc-primary)]' },
  { bg: 'bg-[var(--tc-secondary-tint)]', text: 'text-[var(--tc-secondary)]' },
  { bg: 'bg-gray-100', text: 'text-[var(--tc-dark)]' }
];

function iconFor(title, i) {
  return keywordIcons.find((k) => k.test.test(title))?.Icon || iconRotation[i % iconRotation.length];
}

export default function ServicesGrid({ items }) {
  if (!items?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const Icon = iconFor(item.title || '', i);
        const color = colorRotation[i % colorRotation.length];
        return (
          <a key={i} href="#contact" className="group bg-white p-7 transition hover:bg-gray-50">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${color.bg} ${color.text}`}>
              <Icon />
            </div>
            <h4 className="mt-4 text-base font-bold text-[var(--tc-dark)]">{item.title}</h4>
            {item.description && <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.description}</p>}
            <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-bold ${color.text}`}>
              Learn more <span className="transition group-hover:translate-x-0.5" aria-hidden>→</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
