import { notFound } from 'next/navigation';
import { fetchAdvisorProfile } from '../../../lib/api';
import ContactForm from '../../../components/ContactForm';
import GoogleBusinessCard from '../../../components/GoogleBusinessCard';

export default async function ContactPage({ params }) {
  const data = await fetchAdvisorProfile(params.advisorSlug);
  if (!data) notFound();

  const { advisor } = data;
  const contactRows = [
    advisor.email && { label: 'Email', value: advisor.email, icon: '✉️' },
    advisor.contactNumber && { label: 'Phone', value: advisor.contactNumber, icon: '📞' },
    advisor.whatsappNumber && { label: 'WhatsApp', value: advisor.whatsappNumber, icon: '💬' },
    advisor.officeAddress && { label: 'Location', value: advisor.officeAddress, icon: '📍' }
  ].filter(Boolean);

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl">Get in Touch</h1>
        <p className="mt-2 italic text-gray-500">Schedule your free consultation and get clear, honest insurance advice.</p>
        {advisor.whatsappNumber && (
          <a
            href={`https://wa.me/${advisor.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--tc-dark)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
          >
            📞 Call Now
          </a>
        )}
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-14 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--tc-dark)]">Contact Information</h2>
          <p className="mt-1.5 italic text-gray-500">Easy ways to reach out.</p>
          {contactRows.length > 0 && (
            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {contactRows.map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-[var(--tc-primary-tint)] text-base">
                    {row.icon}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{row.label}</p>
                    <p className="text-sm font-semibold text-[var(--tc-dark)]">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
          <h3 className="text-lg font-bold text-[var(--tc-dark)]">Send a Message</h3>
          <p className="mt-1 text-sm italic text-gray-500">Prefer to write instead? I&apos;ll respond personally.</p>
          <div className="mt-5">
            <ContactForm advisorSlug={params.advisorSlug} interestOptions={advisor.services || []} />
          </div>
        </div>
      </div>

      {(advisor.googleBusiness?.rating || advisor.googleBusiness?.reviewLink || advisor.googleBusiness?.mapsLink) && (
        <div className="mx-auto mt-16 max-w-3xl">
          <GoogleBusinessCard advisorName={advisor.name} googleBusiness={advisor.googleBusiness} />
        </div>
      )}
    </main>
  );
}
