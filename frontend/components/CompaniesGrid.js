export default function CompaniesGrid({ companies }) {
  if (!companies?.length) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {companies.map((name) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur"
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-extrabold text-[var(--tc-dark)]">
            {name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 3)
              .join('')
              .toUpperCase()}
          </div>
          <span className="text-xs font-bold text-white/85">{name}</span>
        </div>
      ))}
    </div>
  );
}
