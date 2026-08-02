'use client';
import Link from 'next/link';

// Sticky bottom action bar shown on mobile only (matches the common
// e-commerce "Account / Cart / Chat / Call" pattern) — swaps "Cart" for
// "Enquire" since this is a service site, not a store. Hidden on desktop,
// where the header/footer contact options already cover this.
function AccountIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function EnquireIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5h16v10H8l-4 3.5v-3.5H4v-10Z" />
      <path strokeLinecap="round" d="M8 9.5h8M8 12.5h5" />
    </svg>
  );
}

function CallIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4.5h3.5l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 3.5 6.1 1.5 1.5 0 0 1 5 4.5Z" />
    </svg>
  );
}

export default function MobileActionBar({ advisor }) {
  const phone = advisor?.contactNumber || advisor?.whatsappNumber;

  const items = [
    { key: 'account', label: 'Account', Icon: AccountIcon, href: '/customer/login' },
    { key: 'enquire', label: 'Enquire', Icon: EnquireIcon, href: '/#contact' }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-gray-100 bg-white px-2 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] sm:hidden">
      {items.map(({ key, label, Icon, href }) => (
        <Link key={key} href={href} className="flex flex-col items-center gap-1 py-1 text-[var(--tc-dark)]">
          <Icon className="h-6 w-6" />
          <span className="text-[0.65rem] font-bold">{label}</span>
        </Link>
      ))}

      {advisor?.whatsappNumber ? (
        <a
          href={`https://wa.me/${advisor.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-1 text-[var(--tc-dark)]"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#25D366] text-sm text-white">💬</span>
          <span className="text-[0.65rem] font-bold">Chat</span>
        </a>
      ) : (
        <span className="flex flex-col items-center gap-1 py-1 text-gray-300">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gray-100 text-sm">💬</span>
          <span className="text-[0.65rem] font-bold">Chat</span>
        </span>
      )}

      {phone ? (
        <a href={`tel:${phone}`} className="flex flex-col items-center gap-1 py-1 text-[var(--tc-dark)]">
          <CallIcon className="h-6 w-6" />
          <span className="text-[0.65rem] font-bold">Call</span>
        </a>
      ) : (
        <span className="flex flex-col items-center gap-1 py-1 text-gray-300">
          <CallIcon className="h-6 w-6" />
          <span className="text-[0.65rem] font-bold">Call</span>
        </span>
      )}
    </nav>
  );
}
