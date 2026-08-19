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
    // Top-level merge over the defaults — content saved before a new
    // section (e.g. testimonials/contact/insights) was added to the schema
    // won't have that key at all, and the homepage would crash rendering
    // `content.thatSection.whatever` on undefined without this fallback.
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
