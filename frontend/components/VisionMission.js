import { micrositeCopy } from '../lib/advisorMicrositeCopyDefaults';

export default function VisionMission({ advisor, vision, mission, missionPillars, visionImage, missionImage }) {
  if (!vision && !mission) return null;

  return (
    <section className="border-y border-gray-100 bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <span
            data-field="micrositeContent.visionMissionEyebrow"
            className="text-sm font-bold uppercase tracking-widest text-[var(--tc-primary)]"
          >
            {micrositeCopy(advisor, 'visionMissionEyebrow')}
          </span>
          <h2
            data-field="micrositeContent.visionMissionHeading"
            className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl"
          >
            {micrositeCopy(advisor, 'visionMissionHeading')}
          </h2>
          <p data-field="micrositeContent.visionMissionSubtext" className="mx-auto mt-2 max-w-lg text-gray-500">
            {micrositeCopy(advisor, 'visionMissionSubtext')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {vision && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
              {visionImage && (
                <img
                  data-field="micrositeImages.vision"
                  src={visionImage}
                  alt="Vision"
                  className="h-32 w-full object-cover sm:h-36"
                />
              )}
              <div className="p-8">
                {!visionImage && (
                  <div
                    data-field="micrositeImages.vision"
                    className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gray-100 text-xl text-[var(--tc-dark)]"
                  >
                    🎯
                  </div>
                )}
                <h3 className="text-xl font-bold text-[var(--tc-dark)]">My Vision</h3>
                <p data-field="vision" className="mt-3 leading-relaxed text-gray-600">
                  {vision}
                </p>
              </div>
            </div>
          )}
          {mission && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
              {missionImage && (
                <img
                  data-field="micrositeImages.mission"
                  src={missionImage}
                  alt="Mission"
                  className="h-32 w-full object-cover sm:h-36"
                />
              )}
              <div className="p-8">
                {!missionImage && (
                  <div
                    data-field="micrositeImages.mission"
                    className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[var(--tc-primary-tint)] text-xl text-[var(--tc-primary)]"
                  >
                    🧭
                  </div>
                )}
                <h3 className="text-xl font-bold text-[var(--tc-dark)]">My Mission</h3>
                <p data-field="mission" className="mt-3 leading-relaxed text-gray-600">
                  {mission}
                </p>
                {missionPillars?.length > 0 && (
                  <div data-field="missionPillars" className="mt-5 space-y-2.5">
                    {missionPillars.map((pillar) => (
                      <div key={pillar} className="flex items-start gap-2.5 text-sm font-semibold text-[var(--tc-dark)]">
                        <span className="mt-0.5 text-[var(--tc-primary)]">✓</span>
                        {pillar}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
