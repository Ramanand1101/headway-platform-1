export default function TickerBar({ advisor }) {
  const items = [
    'Your peace of mind is our priority',
    'Smart advice. Real protection.',
    'Book your free consultation today',
    advisor.email && `Email: ${advisor.email}`,
    advisor.contactNumber && `Call: ${advisor.contactNumber}`
  ].filter(Boolean);

  if (items.length === 0) return null;

  const track = [...items, ...items];

  return (
    <div className="overflow-hidden bg-[var(--tc-dark-alt)] py-2.5">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-xs font-semibold text-white/70">
        {track.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            {item}
            <span className="text-[var(--tc-primary)]" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
