const icons = ['🏆', '👨‍👩‍👧', '💰', '⏱️', '🛡️', '⭐'];

export default function AchievementsGrid({ achievements }) {
  if (!achievements?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {achievements.map((a, i) => (
        <div key={i} className="flex items-start gap-3.5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[var(--tc-primary-tint)] text-xl">
            {icons[i % icons.length]}
          </div>
          <div>
            <p className="text-lg font-extrabold leading-tight text-[var(--tc-dark)]">{a.value}</p>
            <p className="text-xs font-bold text-gray-500">{a.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
