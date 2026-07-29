// Recognizable brand glyphs for each platform (not the official trademarked
// artwork, just simplified equivalents) — used wherever we show "which
// platform is this" instead of a generic letter/emoji placeholder.

export function InstagramIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#ig-gradient)" />
      <circle cx="12" cy="12" r="4.2" stroke="white" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
      <defs>
        <linearGradient id="ig-gradient" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEE140" />
          <stop offset="0.35" stopColor="#F6693A" />
          <stop offset="0.65" stopColor="#D6249F" />
          <stop offset="1" stopColor="#6228D7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function FacebookIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="#1877F2" />
      <path
        d="M13.6 20v-6.6h2.2l.33-2.57h-2.53v-1.64c0-.74.2-1.25 1.27-1.25h1.36V5.6c-.24-.03-1.04-.1-1.98-.1-1.96 0-3.3 1.2-3.3 3.4v1.9H8.5v2.57h2.46V20h2.64Z"
        fill="white"
      />
    </svg>
  );
}

export function LinkedInIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="#0A66C2" />
      <path
        d="M7.8 10.2h2.15V17H7.8v-6.8Zm1.08-3.45a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM11.6 10.2h2.06v.93h.03c.29-.54 1-1.11 2.05-1.11 2.19 0 2.6 1.44 2.6 3.32V17h-2.15v-3.3c0-.79-.02-1.8-1.1-1.8-1.1 0-1.27.86-1.27 1.75V17H11.6v-6.8Z"
        fill="white"
      />
    </svg>
  );
}

export function YouTubeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="2" y="4.5" width="20" height="15" rx="4" fill="#FF0000" />
      <path d="M10 8.6 15.5 12 10 15.4V8.6Z" fill="white" />
    </svg>
  );
}

export function WhatsAppIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="10" fill="#25D366" />
      <path
        d="M12 6.4a5.6 5.6 0 0 0-4.77 8.55L6.4 17.6l2.72-.8A5.6 5.6 0 1 0 12 6.4Zm0 1.3a4.3 4.3 0 0 1 3.65 6.57l-.16.26.1 1.7-1.66-.15-.25.14A4.3 4.3 0 1 1 12 7.7Z"
        fill="white"
      />
      <path
        d="M10.1 9.9c.13-.29.27-.3.4-.3h.32c.1 0 .25 0 .37.29.15.35.5 1.2.54 1.29.04.09.07.19.01.3-.06.13-.1.2-.19.3-.1.1-.2.24-.29.32-.1.1-.2.2-.09.4.11.2.5.85 1.1 1.37.75.68 1.37.9 1.57 1 .2.1.32.08.44-.05.13-.13.5-.58.63-.78.13-.2.27-.16.44-.1.18.07 1.16.55 1.36.65.2.1.33.15.38.24.05.08.05.5-.11.98-.16.48-.9.92-1.26.98-.33.06-.75.08-1.2-.08-.28-.1-.63-.22-1.09-.42-1.9-.83-3.15-2.73-3.25-2.86-.09-.13-.77-1.03-.77-1.97 0-.93.49-1.39.66-1.58Z"
        fill="white"
      />
    </svg>
  );
}

export const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
  youtube: YouTubeIcon,
  whatsapp: WhatsAppIcon
};
