import { notFound } from 'next/navigation';

// Server-rendered so WhatsApp/Facebook/LinkedIn's link-preview crawlers
// (which don't run client JS) see real Open Graph tags — this is what
// turns a shared link into an image+headline+description card instead of
// a bare URL. The dashboard's share buttons link here instead of straight
// to the raw Cloudinary file.
async function getCreative(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/creatives/${id}/public`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.creative;
}

export async function generateMetadata({ params }) {
  const creative = await getCreative(params.id);
  if (!creative) return { title: 'Content not found — InsuranceAdvise.in' };

  const title = creative.title || 'Shared via InsuranceAdvise.in';
  const description = creative.description || 'Insurance content shared via InsuranceAdvise.in';
  const isReel = creative.type === 'reel';
  const isPdf = creative.format === 'pdf';
  // Reels store a pre-generated poster frame (thumbnailUrl, made via ffmpeg
  // at upload time) — WhatsApp/Facebook/LinkedIn need a real image to show
  // anything, a raw video URL alone won't render a preview in most of them.
  // PDFs have no equivalent thumbnail, so the card just falls back to
  // title/description with no image rather than a broken/fake one.
  const thumbnail = isPdf ? null : isReel ? creative.thumbnailUrl : creative.imageUrl;
  const images = thumbnail ? [thumbnail] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: isReel ? 'video.other' : 'website',
      ...(isReel ? { videos: [{ url: creative.imageUrl, type: 'video/mp4' }] } : {})
    },
    twitter: { card: 'summary_large_image', title, description, images }
  };
}

export default async function SharedCreativePage({ params }) {
  const creative = await getCreative(params.id);
  if (!creative) notFound();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-6 py-12 text-center">
      {creative.format === 'pdf' ? (
        <a
          href={creative.imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 rounded-2xl bg-white px-10 py-12 text-red-500 shadow-lg"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-16 w-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
            <path strokeLinecap="round" d="M15 4v4h4" />
          </svg>
          <span className="text-sm font-bold uppercase tracking-wide">Open PDF</span>
        </a>
      ) : creative.type === 'reel' ? (
        <video
          src={creative.imageUrl}
          controls
          autoPlay
          muted
          className="max-h-[70vh] max-w-full rounded-2xl shadow-lg"
        />
      ) : (
        <img
          src={creative.imageUrl}
          alt={creative.title || 'Shared content'}
          className="max-h-[70vh] max-w-full rounded-2xl shadow-lg"
        />
      )}
      {(creative.title || creative.description) && (
        <div className="max-w-md">
          {creative.title && <h1 className="text-xl font-extrabold text-gray-900">{creative.title}</h1>}
          {creative.description && <p className="mt-2 text-sm text-gray-600">{creative.description}</p>}
        </div>
      )}
      <a
        href="https://insuranceadvise.in"
        className="text-xs font-bold uppercase tracking-widest text-[#C9972E] hover:underline"
      >
        Shared via InsuranceAdvise.in
      </a>
    </div>
  );
}
