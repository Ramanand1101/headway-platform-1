import { micrositeCopy } from '../lib/advisorMicrositeCopyDefaults';

export default function AdvisorAbout({ advisor }) {
  const role = advisor.specialization?.[0] ? `${advisor.specialization[0]} Specialist` : 'Independent Insurance Consultant';
  const aboutImage = advisor.micrositeImages?.about || advisor.photoUrl;

  const facts = [
    advisor.irdaiLicenseNumber && 'IRDAI Licensed Advisor',
    ...(advisor.credentials || []),
    advisor.yearsExperience && `${advisor.yearsExperience} Years Experience`,
    advisor.achievements?.[0] && `${advisor.achievements[0].value} ${advisor.achievements[0].label}`
  ].filter(Boolean);

  return (
    <section id="about" className="scroll-mt-20 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div
          data-field="micrositeContent.aboutEyebrow"
          className="eyebrow mb-3.5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--tc-primary)]"
        >
          <span className="inline-block h-0.5 w-5 rounded bg-[var(--tc-primary)]" />
          {micrositeCopy(advisor, 'aboutEyebrow')}
        </div>
        <h2 data-field="name" className="text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl">
          Meet {advisor.name}
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div data-field="micrositeImages.about" className="relative mx-auto w-full max-w-sm">
            {aboutImage ? (
              <img
                src={aboutImage}
                alt={advisor.name}
                referrerPolicy="no-referrer"
                className="aspect-square w-full rounded-2xl object-cover shadow-sm"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-[var(--tc-dark)] text-6xl font-extrabold text-white/20">
                {advisor.name?.[0] || 'A'}
              </div>
            )}
            {advisor.yearsExperience && (
              <span className="absolute left-3.5 top-3.5 rounded-full bg-[var(--tc-primary)] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                {advisor.yearsExperience} Years Experience
              </span>
            )}
          </div>

          <div data-field="aboutMe">
            {advisor.aboutMe || advisor.bio ? (
              <p className="leading-relaxed text-gray-600">{advisor.aboutMe || advisor.bio}</p>
            ) : (
              <p className="leading-relaxed text-gray-400">
                I'm an independent insurance advisor dedicated to helping people make smart, informed choices about
                their coverage. My goal is not to sell policies, but to protect what matters most to you.
              </p>
            )}

            {facts.length > 0 && (
              <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {facts.map((fact) => (
                  <li
                    key={fact}
                    className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-bold text-[var(--tc-dark)] shadow-sm"
                  >
                    <span className="text-[var(--tc-primary)]">✓</span>
                    {fact}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-7 border-t border-gray-100 pt-5">
              <p className="font-bold text-[var(--tc-dark)]">{advisor.name}</p>
              <p className="text-sm italic text-gray-500">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
