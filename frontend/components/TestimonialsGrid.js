const avatarColors = ['bg-[var(--tc-primary)]', 'bg-[var(--tc-dark)]', 'bg-[var(--tc-secondary)]'];

export default function TestimonialsGrid({ testimonials }) {
  if (!testimonials?.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-5">
      {testimonials.map((t, i) => (
        <div
          key={t._id}
          className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
        >
          {typeof t.rating === 'number' && (
            <div className="mb-3.5 flex gap-0.5 text-[var(--tc-primary)]">
              {Array.from({ length: 5 }).map((_, j) => (
                <span key={j}>{j < t.rating ? '★' : '☆'}</span>
              ))}
            </div>
          )}
          <p className="text-sm italic leading-relaxed text-gray-700">&ldquo;{t.message}&rdquo;</p>
          <div className="mt-5 flex items-center gap-3">
            {t.photoUrl ? (
              <img
                src={t.photoUrl}
                alt={t.clientName}
                className="h-10 w-10 flex-none rounded-full object-cover"
              />
            ) : (
              <span
                className={`grid h-10 w-10 flex-none place-items-center rounded-full ${avatarColors[i % avatarColors.length]} text-sm font-bold text-white`}
              >
                {t.clientName?.[0] || '?'}
              </span>
            )}
            <div>
              <p className="text-sm font-bold text-[var(--tc-dark)]">{t.clientName}</p>
              {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
