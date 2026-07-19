import { notFound } from 'next/navigation';
import { fetchAdvisorProfile } from '../../../lib/api';
import AdvisorAbout from '../../../components/AdvisorAbout';
import VisionMission from '../../../components/VisionMission';
import FAQAccordion from '../../../components/FAQAccordion';
import AchievementsGrid from '../../../components/AchievementsGrid';
import { defaultVision, defaultMission, defaultMissionPillars } from '../../../lib/advisorMicrositeDefaults';

export default async function AboutPage({ params }) {
  const data = await fetchAdvisorProfile(params.advisorSlug);
  if (!data) notFound();

  const { advisor } = data;

  return (
    <main>
      <AdvisorAbout advisor={advisor} />

      <VisionMission
        advisor={advisor}
        vision={advisor.vision || defaultVision}
        mission={advisor.mission || defaultMission}
        missionPillars={advisor.missionPillars?.length ? advisor.missionPillars : defaultMissionPillars}
        visionImage={advisor.micrositeImages?.vision}
        missionImage={advisor.micrositeImages?.mission}
      />

      {advisor.faqs?.length > 0 && (
        <section className="bg-gray-50 px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 italic text-gray-500">Clear answers to help you feel confident about insurance decisions.</p>
            </div>
            <FAQAccordion faqs={advisor.faqs} />
          </div>
        </section>
      )}

      {advisor.achievements?.length > 0 && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-[var(--tc-primary)]">My Achievements</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl">
                Recognised for Trust &amp; Results
              </h2>
            </div>
            <AchievementsGrid achievements={advisor.achievements} />
          </div>
        </section>
      )}
    </main>
  );
}
