const platformMeta = {
  instagram: { label: 'Instagram', icon: '📷' },
  facebook: { label: 'Facebook', icon: 'f' },
  linkedin: { label: 'LinkedIn', icon: 'in' },
  youtube: { label: 'YouTube', icon: '▶' },
  whatsapp: { label: 'WhatsApp', icon: '💬' }
};

export default function SocialGrid({ advisor }) {
  const links = {
    instagram: advisor.socialLinks?.instagram || (advisor.instagram?.connected && advisor.instagram.username
      ? `https://instagram.com/${advisor.instagram.username}`
      : ''),
    facebook: advisor.socialLinks?.facebook,
    linkedin: advisor.socialLinks?.linkedin,
    youtube: advisor.socialLinks?.youtube,
    whatsapp: advisor.whatsappNumber ? `https://wa.me/${advisor.whatsappNumber}` : ''
  };

  const entries = Object.entries(links).filter(([, url]) => url);
  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {entries.map(([key, url]) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--tc-primary-tint)] text-lg font-extrabold text-[var(--tc-primary)]">
            {platformMeta[key].icon}
          </div>
          <span className="text-sm font-bold text-[var(--tc-dark)]">{platformMeta[key].label}</span>
        </a>
      ))}
    </div>
  );
}
