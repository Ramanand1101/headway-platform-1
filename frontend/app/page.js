import HomePageClient from './HomePageClient';
import { defaultHomepageContent } from '../lib/homepageContent';

// Fetched server-side (not in a client useEffect) specifically so the very
// first HTML the browser receives already has the real banner images and
// admin-edited copy — no visible swap from a placeholder/default to the
// real content once the client mounts.
async function getBannerUrls() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/banners`, { cache: 'no-store' });
    if (!res.ok) return {};
    const data = await res.json();
    const byKey = {};
    (data.banners || []).forEach((b) => {
      byKey[b.key] = b.imageUrl;
    });
    return byKey;
  } catch {
    return {};
  }
}

async function getHomepageContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/content/homepage`, { cache: 'no-store' });
    if (!res.ok) return defaultHomepageContent;
    const data = await res.json();
    if (!data.content) return defaultHomepageContent;
    // Shallow-merge over the code defaults (not just the saved override on
    // its own) — an admin save from before a new top-level section (e.g.
    // `about`, `ctaBanner`) existed in the code wouldn't have that key at
    // all, and rendering it as `undefined` crashes the page instead of
    // just falling back to the section's default copy.
    return {
      ...defaultHomepageContent,
      ...data.content,
      navLinks: data.content.navLinks?.length ? data.content.navLinks : defaultHomepageContent.navLinks
    };
  } catch {
    return defaultHomepageContent;
  }
}

export default async function HomePage() {
  const [bannerUrls, content] = await Promise.all([getBannerUrls(), getHomepageContent()]);
  return <HomePageClient initialBannerUrls={bannerUrls} initialContent={content} />;
}
