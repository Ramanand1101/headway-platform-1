import { notFound } from 'next/navigation';
import { fetchAdvisorProfile } from '../../../lib/api';
import ServicesGrid from '../../../components/ServicesGrid';
import { defaultServices } from '../../../lib/advisorMicrositeDefaults';

export default async function ServicesPage({ params }) {
  const data = await fetchAdvisorProfile(params.advisorSlug);
  if (!data) notFound();

  const { advisor } = data;
  const serviceCards = advisor.serviceOfferings?.length
    ? advisor.serviceOfferings
    : advisor.services?.length
      ? advisor.services.map((title) => ({ title }))
      : defaultServices;

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl">
          Explore Our Insurance Services
        </h1>
        <p className="mt-2 italic text-gray-500">Find the right coverage for your life, home, business and more.</p>
      </div>

      {serviceCards.length > 0 ? (
        <div className="mx-auto mt-12 max-w-6xl">
          <ServicesGrid items={serviceCards} />
        </div>
      ) : (
        <p className="mt-10 text-center text-gray-400">No services listed yet.</p>
      )}
    </main>
  );
}
