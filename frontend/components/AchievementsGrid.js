const icons = ['🏆', '👨‍👩‍👧', '💰', '⏱️', '🛡️', '⭐'];

export default function AchievementsGrid({ achievements }) {
  if (!achievements?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {achievements.map((a, i) =>
        a.imageUrl ? (
          <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <img src={a.imageUrl} alt={a.name} className="h-56 w-full object-cover sm:h-64" />
            <div className="p-5">
              <p className="text-lg font-extrabold leading-tight text-[var(--tc-dark)]">{a.name}</p>
              {a.description && <p className="mt-1 text-sm text-gray-500">{a.description}</p>}
            </div>
          </div>
        ) : (
          <div key={i} className="flex items-start gap-3.5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[var(--tc-primary-tint)] text-xl">
              {icons[i % icons.length]}
            </div>
            <div>
              <p className="text-lg font-extrabold leading-tight text-[var(--tc-dark)]">{a.name}</p>
              {a.description && <p className="mt-1 text-xs text-gray-500">{a.description}</p>}
            </div>
          </div>
        )
      )}
    </div>
  );
}
