const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Sends the advisor slug as a header so the backend's resolveTenant
// middleware can identify which advisor this request is for.
export async function fetchAdvisorProfile(slug) {
  const res = await fetch(`${API_URL}/api/advisor/profile`, {
    headers: { 'x-tenant-host': `${slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}` },
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchAdvisorContent(slug) {
  const res = await fetch(`${API_URL}/api/content`, {
    headers: { 'x-tenant-host': `${slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}` },
    cache: 'no-store'
  });
  if (!res.ok) return { posts: [] };
  return res.json();
}

export async function fetchBlogPost(slug, postSlug) {
  const res = await fetch(`${API_URL}/api/content/post/${postSlug}`, {
    headers: { 'x-tenant-host': `${slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}` },
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchAdvisorTestimonials(slug) {
  const res = await fetch(`${API_URL}/api/advisor/testimonials`, {
    headers: { 'x-tenant-host': `${slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}` },
    cache: 'no-store'
  });
  if (!res.ok) return { testimonials: [] };
  return res.json();
}

// Generic admin-editable content store (see SiteContent model) — used here
// for the admin-set default Vision/Mission text every advisor starts with.
export async function fetchSiteContent(page) {
  const res = await fetch(`${API_URL}/api/site/content/${page}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.content;
}
