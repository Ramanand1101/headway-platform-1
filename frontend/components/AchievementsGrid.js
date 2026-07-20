const icons = ['🏆', '👨‍👩‍👧', '💰', '⏱️', '🛡️', '⭐'];

export default function AchievementsGrid({ achievements }) {
  if (!achievements?.length) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {achievements.map((a, i) =>
        a.imageUrl ? (
          <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <img src={a.imageUrl} alt={a.name} className="h-40 w-full object-cover sm:h-48" />
            <div className="p-3">
              <p className="text-sm font-extrabold leading-tight text-[var(--tc-dark)]">{a.name}</p>
              {a.description && <p className="mt-1 text-xs text-gray-500">{a.description}</p>}
            </div>
          </div>
        ) : (
          <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[var(--tc-primary-tint)] text-xl">
              {icons[i % icons.length]}
            </div>
            <div>
              <p className="text-sm font-extrabold leading-tight text-[var(--tc-dark)]">{a.name}</p>
              {a.description && <p className="mt-1 text-xs text-gray-500">{a.description}</p>}
            </div>
          </div>
        )
      )}
    </div>
  );
}
