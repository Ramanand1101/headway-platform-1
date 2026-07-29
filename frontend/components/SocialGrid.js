import { socialIcons } from './SocialIcons';

const platformMeta = {
  instagram: { label: 'Instagram' },
  facebook: { label: 'Facebook' },
  linkedin: { label: 'LinkedIn' },
  youtube: { label: 'YouTube' },
  whatsapp: { label: 'WhatsApp' }
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
      {entries.map(([key, url]) => {
        const Icon = socialIcons[key];
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl">
              <Icon className="h-12 w-12" />
            </div>
            <span className="text-sm font-bold text-[var(--tc-dark)]">{platformMeta[key].label}</span>
          </a>
        );
      })}
    </div>
  );
}
