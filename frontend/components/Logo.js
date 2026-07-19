'use client';
import { useEffect, useState } from 'react';

const heightClasses = {
  sm: 'h-10',
  md: 'h-14'
};

export default function Logo({ size = 'md', className = '' }) {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/banners`)
      .then((res) => res.json())
      .then((data) => {
        const match = (data.banners || []).find((b) => b.key === 'site-logo');
        if (match) setLogoUrl(match.imageUrl);
      })
      .catch(() => {});
  }, []);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="InsuranceAdvise.in"
        className={`${heightClasses[size]} w-auto flex-none object-contain ${className}`}
      />
    );
  }

  // Fallback shown only until a logo has been uploaded from /admin/homepage
  return (
    <span className={`flex items-center gap-2.5 font-extrabold ${className}`}>
      <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-ia-blue text-lg text-white shadow-md shadow-ia-gold-tint">
        🛡️
      </span>
      <span className="text-current">
        Insurance<span className="text-ia-blue-soft">Advise</span>.in
      </span>
    </span>
  );
}
