export default function GoogleBusinessCard({ advisorName, googleBusiness, bare = false }) {
  const gmb = googleBusiness || {};
  const wrapperClasses = bare ? 'bg-white p-7' : 'rounded-2xl border border-gray-100 bg-white p-7 shadow-sm';

  return (
    <div className={wrapperClasses}>
      {!bare && (
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--tc-primary)]">Verified on Google</p>
      )}
      {gmb.rating && (
        <div className={`flex items-center gap-4 ${bare ? '' : 'mt-4'}`}>
          <p className="text-3xl font-extrabold text-[var(--tc-dark)]">{gmb.rating}</p>
          <div>
            <div className="flex gap-0.5 text-[var(--tc-primary)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < Math.round(gmb.rating) ? '★' : '☆'}</span>
              ))}
            </div>
            {typeof gmb.reviewCount === 'number' && (
              <p className="text-xs text-gray-500">{gmb.reviewCount} Google Reviews</p>
            )}
          </div>
        </div>
      )}
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        {advisorName} is a verified business on Google. Read what real clients say, get directions, or leave your own
        review in under a minute.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {gmb.reviewLink && (
          <a
            href={gmb.reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--tc-dark)] px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
          >
            Write a Review
          </a>
        )}
        {gmb.mapsLink && (
          <a
            href={gmb.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--tc-dark)] px-5 py-2.5 text-xs font-bold text-[var(--tc-dark)] transition hover:bg-[var(--tc-dark)] hover:text-white"
          >
            View on Google
          </a>
        )}
      </div>
    </div>
  );
}
