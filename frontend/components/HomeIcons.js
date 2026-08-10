// Clean stroke-based line icons for the homepage — replaces emoji (⏱️🎁🚀
// etc.) with a consistent icon system, matching the flat/professional look
// of fintech marketing sites (Stripe/Plaid/Ramp) instead of a casual,
// template-y feel. Same viewBox/stroke conventions as MobileActionBar.js's
// icons so the whole app shares one visual language.

function base(props) {
  return { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, ...props };
}

export function ClockIcon(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function GiftIcon(props) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="9" width="17" height="4" rx="1" />
      <path strokeLinecap="round" d="M5 13v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7M12 9v12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9c-1-3-3-4.5-4.5-3.5S6.5 8 9 9M12 9c1-3 3-4.5 4.5-3.5S17.5 8 15 9" />
    </svg>
  );
}

export function AssetsIcon(props) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 9.5h17M8 5.5v-2M16 5.5v-2" />
    </svg>
  );
}

export function RocketIcon(props) {
  return (
    <svg {...base(props)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5c3 1.5 5 4.8 5 8.5 0 2-1 4-2.3 5.3l-.7 3.2-4-1.3-4 1.3-.7-3.2C4 15 3 13 3 11 3 7.3 5 4 8 2.5c1.3-.6 2.7-.6 4 0Z" />
      <circle cx="12" cy="10.5" r="2" />
      <path strokeLinecap="round" d="M9 18.5c0 1.4-1 2.5-2.5 2.5M15 18.5c0 1.4 1 2.5 2.5 2.5" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg {...base(props)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path strokeLinecap="round" d="m20 20-4.3-4.3" />
    </svg>
  );
}

export function ShieldIcon(props) {
  return (
    <svg {...base(props)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5 4.5 5.5v6c0 5 3.2 8.5 7.5 10 4.3-1.5 7.5-5 7.5-10v-6L12 2.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4.5" />
    </svg>
  );
}

export function ChatIcon(props) {
  return (
    <svg {...base(props)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5h16v10.5H9l-4 3.5v-3.5H4V5.5Z" />
      <path strokeLinecap="round" d="M8 9.5h8M8 12.5h5" />
    </svg>
  );
}

export function CalendarIcon(props) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path strokeLinecap="round" d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
      <circle cx="8.2" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ReelIcon(props) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="4" width="17" height="16" rx="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9.3v5.4l4.5-2.7L10 9.3Z" />
    </svg>
  );
}

export function ImageIcon(props) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 15.5 15.5 11 6 19" />
    </svg>
  );
}

export function PinIcon(props) {
  return (
    <svg {...base(props)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5s6.5-5.6 6.5-11A6.5 6.5 0 0 0 5.5 10.5c0 5.4 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </svg>
  );
}

export function BanIcon(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="m6.5 6.5 11 11" />
    </svg>
  );
}

export function CheckCircleIcon(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12.3 2.4 2.4 4.6-5.4" />
    </svg>
  );
}

export function UploadIcon(props) {
  return (
    <svg {...base(props)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5v-10M8 9l4-4 4 4" />
      <path strokeLinecap="round" d="M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function LockIcon(props) {
  return (
    <svg {...base(props)}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" />
      <path strokeLinecap="round" d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function HandshakeIcon(props) {
  return (
    <svg {...base(props)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12.5 6 9l3.5 3-1.7 1.7a1.2 1.2 0 0 0 1.7 1.7L13 12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.5 12.5 18 9l-3.5 3 1.7 1.7a1.2 1.2 0 0 1-1.7 1.7L11 15" />
      <path strokeLinecap="round" d="M6 9 9 6M18 9l-3-3" />
    </svg>
  );
}

export function GlobeIcon(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M3.5 12h17M12 3.5c2.2 2.3 3.5 5.3 3.5 8.5s-1.3 6.2-3.5 8.5c-2.2-2.3-3.5-5.3-3.5-8.5S9.8 5.8 12 3.5Z" />
    </svg>
  );
}

export function BlogIcon(props) {
  return (
    <svg {...base(props)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path strokeLinecap="round" d="M15 4v4h4M8 12h8M8 15.5h8M8 19h5" />
    </svg>
  );
}
