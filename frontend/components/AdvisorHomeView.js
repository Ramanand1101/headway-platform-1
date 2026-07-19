'use client';
import { useEffect, useState } from 'react';
import AdvisorHero from './AdvisorHero';
import TickerBar from './TickerBar';
import AdvisorAbout from './AdvisorAbout';
import VisionMission from './VisionMission';
import FAQAccordion from './FAQAccordion';
import ServicesGrid from './ServicesGrid';
import CompaniesGrid from './CompaniesGrid';
import AchievementsGrid from './AchievementsGrid';
import GoogleBusinessCard from './GoogleBusinessCard';
import SocialGrid from './SocialGrid';
import TestimonialsGrid from './TestimonialsGrid';
import BlogTeaser from './BlogTeaser';
import ContactForm from './ContactForm';
import { defaultVision, defaultMission, defaultMissionPillars, defaultServices } from '../lib/advisorMicrositeDefaults';
import { micrositeCopy } from '../lib/advisorMicrositeCopyDefaults';

// Renders every homepage section from `advisor`/`testimonials`/`posts` state.
// In live-preview mode (embedded from the advisor dashboard) it overrides
// that state via postMessage instead of the server-fetched initial values,
// so edits show up instantly before the advisor saves.
export default function AdvisorHomeView({ advisorSlug, initialAdvisor, initialTestimonials, initialPosts }) {
  const [advisor, setAdvisor] = useState(initialAdvisor);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [posts] = useState(initialPosts);

  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
    if (!isPreview) return;

    function handleMessage(e) {
      if (e.data?.type === 'advisor-preview-content') {
        setAdvisor(e.data.advisor);
        if (e.data.testimonials) setTestimonials(e.data.testimonials);
      }
    }
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'advisor-preview-ready', part: 'home' }, '*');
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Admin-only editing aid: elements tagged with data-field="X" (e.g. bio,
  // vision, micrositeImages.hero) notify the parent dashboard when clicked,
  // so it can jump straight to that field in the editor. Inert for a regular
  // advisor viewing their own preview — the dashboard only acts on this
  // message while in admin impersonation mode.
  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
    if (!isPreview) return;

    function handleClick(e) {
      const target = e.target.closest('[data-field]');
      if (target) window.parent.postMessage({ type: 'advisor-preview-click', field: target.dataset.field }, '*');
    }
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  const serviceCards = advisor.serviceOfferings?.length
    ? advisor.serviceOfferings
    : advisor.services?.length
      ? advisor.services.map((title) => ({ title }))
      : defaultServices;

  const achievementsImage = advisor.micrositeImages?.achievements || advisor.photoUrl;

  const contactRows = [
    advisor.contactNumber && { label: 'Mobile Number', value: advisor.contactNumber, icon: '📞' },
    advisor.email && { label: 'Email ID', value: advisor.email, icon: '✉️' },
    advisor.officeAddress && { label: 'Office Address', value: advisor.officeAddress, icon: '📍' }
  ].filter(Boolean);

  return (
    <main>
      <AdvisorHero advisor={advisor} testimonials={testimonials} />
      <TickerBar advisor={advisor} />

      {/* 1. About Me */}
      <AdvisorAbout advisor={advisor} />

      {/* 2 & 3. Vision + Mission */}
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
              <h2
                data-field="micrositeContent.faqHeading"
                className="text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl"
              >
                {micrositeCopy(advisor, 'faqHeading')}
              </h2>
              <p data-field="micrositeContent.faqSubtext" className="mt-2 italic text-gray-500">
                {micrositeCopy(advisor, 'faqSubtext')}
              </p>
            </div>
            <FAQAccordion faqs={advisor.faqs} />
          </div>
        </section>
      )}

      {/* 4. Services */}
      {serviceCards.length > 0 && (
        <section id="services" className="scroll-mt-20 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <span
                data-field="micrositeContent.servicesEyebrow"
                className="text-sm font-bold uppercase tracking-widest text-[var(--tc-primary)]"
              >
                {micrositeCopy(advisor, 'servicesEyebrow')}
              </span>
              <h2
                data-field="micrositeContent.servicesHeading"
                className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl"
              >
                {micrositeCopy(advisor, 'servicesHeading')}
              </h2>
              <p data-field="micrositeContent.servicesSubtext" className="mx-auto mt-2 max-w-lg text-gray-500">
                {micrositeCopy(advisor, 'servicesSubtext')}
              </p>
            </div>
            <ServicesGrid items={serviceCards} />
          </div>
        </section>
      )}

      {/* 5. Companies I Work With */}
      {advisor.companiesWorkedWith?.length > 0 && (
        <section id="companies" className="scroll-mt-20 bg-[var(--tc-dark)] px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <span
                data-field="micrositeContent.companiesEyebrow"
                className="text-sm font-bold uppercase tracking-widest text-[var(--tc-primary)]"
              >
                {micrositeCopy(advisor, 'companiesEyebrow')}
              </span>
              <h2
                data-field="micrositeContent.companiesHeading"
                className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
              >
                {micrositeCopy(advisor, 'companiesHeading')}
              </h2>
              <p data-field="micrositeContent.companiesSubtext" className="mx-auto mt-2 max-w-lg text-white/60">
                {micrositeCopy(advisor, 'companiesSubtext')}
              </p>
            </div>
            <CompaniesGrid companies={advisor.companiesWorkedWith} />
          </div>
        </section>
      )}

      {/* 6. Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="scroll-mt-20 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <span
                data-field="micrositeContent.testimonialsEyebrow"
                className="text-sm font-bold uppercase tracking-widest text-[var(--tc-primary)]"
              >
                {micrositeCopy(advisor, 'testimonialsEyebrow')}
              </span>
              <h2
                data-field="micrositeContent.testimonialsHeading"
                className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl"
              >
                {micrositeCopy(advisor, 'testimonialsHeading')}
              </h2>
              <p data-field="micrositeContent.testimonialsSubtext" className="mx-auto mt-2 max-w-lg text-gray-500">
                {micrositeCopy(advisor, 'testimonialsSubtext')}
              </p>
            </div>
            <TestimonialsGrid testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* 7. Achievements */}
      {advisor.achievements?.length > 0 && (
        <section id="achievements" className="scroll-mt-20 bg-gray-50 px-6 py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div data-field="micrositeImages.achievements" className="mx-auto w-full max-w-md">
              {achievementsImage ? (
                <img
                  src={achievementsImage}
                  alt={advisor.name}
                  referrerPolicy="no-referrer"
                  className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-[var(--tc-dark)] text-6xl font-extrabold text-white/20 shadow-sm">
                  🏆
                </div>
              )}
            </div>
            <div>
              <span
                data-field="micrositeContent.achievementsEyebrow"
                className="text-sm font-bold uppercase tracking-widest text-[var(--tc-primary)]"
              >
                {micrositeCopy(advisor, 'achievementsEyebrow')}
              </span>
              <h2
                data-field="micrositeContent.achievementsHeading"
                className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl"
              >
                {micrositeCopy(advisor, 'achievementsHeading')}
              </h2>
              <div className="mt-7">
                <AchievementsGrid achievements={advisor.achievements} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog (bonus, beyond the 9 standard sections) */}
      {posts?.length > 0 && (
        <section id="blog" className="scroll-mt-20 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-[var(--tc-primary)]">From My Blog</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl">
                Insurance Insights, Explained Simply
              </h2>
            </div>
            <BlogTeaser posts={posts} />
          </div>
        </section>
      )}

      {/* 8. Contact Me */}
      <section id="contact" className="scroll-mt-20 bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span
              data-field="micrositeContent.contactEyebrow"
              className="text-sm font-bold uppercase tracking-widest text-[var(--tc-primary)]"
            >
              {micrositeCopy(advisor, 'contactEyebrow')}
            </span>
            <h2
              data-field="micrositeContent.contactHeading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl"
            >
              {micrositeCopy(advisor, 'contactHeading')}
            </h2>
            <p data-field="micrositeContent.contactSubtext" className="mx-auto mt-2 max-w-lg text-gray-500">
              {micrositeCopy(advisor, 'contactSubtext')}
            </p>
          </div>

          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 shadow-sm lg:grid-cols-[380px_1fr]">
            <div className="relative flex flex-col justify-center overflow-hidden bg-[var(--tc-dark)] p-8 text-white">
              <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/5" />
              <h3 data-field="micrositeContent.contactInfoTitle" className="text-xl font-bold">
                {micrositeCopy(advisor, 'contactInfoTitle')}
              </h3>
              <p data-field="micrositeContent.contactInfoSubtext" className="mt-2 text-sm text-white/60">
                {micrositeCopy(advisor, 'contactInfoSubtext')}
              </p>
              {contactRows.length > 0 ? (
                <div className="relative mt-8 space-y-5">
                  {contactRows.map((row) => (
                    <div key={row.label} className="flex items-start gap-3.5">
                      <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-white/10 text-lg">
                        {row.icon}
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-white/40">{row.label}</p>
                        <p className="text-sm font-bold text-white">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="relative mt-8 text-sm text-white/50">Contact details coming soon.</p>
              )}
            </div>

            <div className="bg-white p-8">
              <h3 data-field="micrositeContent.contactFormTitle" className="text-lg font-bold text-[var(--tc-dark)]">
                {micrositeCopy(advisor, 'contactFormTitle')}
              </h3>
              <p data-field="micrositeContent.contactFormSubtext" className="mt-1 text-sm text-gray-500">
                {micrositeCopy(advisor, 'contactFormSubtext')}
              </p>
              <div className="mt-5">
                <ContactForm advisorSlug={advisorSlug} interestOptions={advisor.services || []} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Google Business Profile */}
      {(advisor.googleBusiness?.rating ||
        advisor.googleBusiness?.reviewLink ||
        advisor.googleBusiness?.mapsLink ||
        advisor.officeAddress) && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <span
                data-field="micrositeContent.googleEyebrow"
                className="text-sm font-bold uppercase tracking-widest text-[var(--tc-primary)]"
              >
                {micrositeCopy(advisor, 'googleEyebrow')}
              </span>
              <h2
                data-field="micrositeContent.googleHeading"
                className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl"
              >
                {micrositeCopy(advisor, 'googleHeading')}
              </h2>
              <p data-field="micrositeContent.googleSubtext" className="mx-auto mt-2 max-w-lg text-gray-500">
                {micrositeCopy(advisor, 'googleSubtext')}
              </p>
            </div>
            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 shadow-sm lg:grid-cols-2">
              <GoogleBusinessCard advisorName={advisor.name} googleBusiness={advisor.googleBusiness} bare />
              {advisor.officeAddress && (
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(advisor.officeAddress)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office location map"
                  className="min-h-[280px] w-full border-0"
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* 10. Follow Me on Social Media */}
      <section id="social" className="scroll-mt-20 bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span
              data-field="micrositeContent.socialEyebrow"
              className="text-sm font-bold uppercase tracking-widest text-[var(--tc-primary)]"
            >
              {micrositeCopy(advisor, 'socialEyebrow')}
            </span>
            <h2
              data-field="micrositeContent.socialHeading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl"
            >
              {micrositeCopy(advisor, 'socialHeading')}
            </h2>
          </div>
          <SocialGrid advisor={advisor} />
        </div>
      </section>
    </main>
  );
}
