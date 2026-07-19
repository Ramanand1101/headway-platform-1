import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

export const metadata = {
  title: 'Terms of Service — InsuranceAdvise.in'
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-ia-navy">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: 10 July 2026</p>

      <div className="mt-8 space-y-7 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-bold text-ia-navy">1. Who we are</h2>
          <p className="mt-2">
            InsuranceAdvise.in is a technology platform that provides website-building and content-publishing
            software to independent, IRDAI-licensed insurance advisors. InsuranceAdvise.in is not an insurer,
            insurance intermediary, agent, broker or web aggregator. We do not sell, solicit, advertise, recommend
            or compare insurance products, and we receive no commission from any insurance transaction.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">2. Advisor accounts</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>You must be an IRDAI-licensed insurance advisor to create an advisor account.</li>
            <li>You are responsible for the accuracy of the information on your microsite and for keeping your login credentials secure.</li>
            <li>Each advisor microsite is operated by the respective advisor, who is solely responsible for its content, their professional conduct, and compliance with applicable IRDAI regulations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">3. Content &amp; publishing</h2>
          <p className="mt-2">
            All platform content (blog templates, social media posts, etc.) is provided for the advisor&apos;s
            marketing use, subject to the advisor&apos;s own review, approval and consent before publication. When
            you connect a social media account, we publish to it only on your explicit instruction.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">4. Acceptable use</h2>
          <p className="mt-2">
            You agree not to use the platform for any unlawful purpose, to misrepresent your IRDAI licensing
            status, or to publish false or misleading claims about insurance products through your microsite.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">5. Plans &amp; credits</h2>
          <p className="mt-2">
            Some features (AI content generation, premium templates) are limited by plan tier and credit balance.
            We may change plan features and pricing with reasonable notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">6. Limitation of liability</h2>
          <p className="mt-2">
            The platform is provided &quot;as is&quot;. We are not liable for any insurance advice, recommendation,
            or transaction that takes place between an advisor and their client — that relationship, and all
            related regulatory obligations, remain solely between the advisor and their client.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">7. Governing law</h2>
          <p className="mt-2">
            These terms are governed by the laws of India. Any disputes will be subject to the exclusive
            jurisdiction of the courts having competent authority over our place of business.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">8. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Write to us at{' '}
            <a href="mailto:headwaytalentconsulting@gmail.com" className="font-semibold text-ia-blue hover:underline">
              headwaytalentconsulting@gmail.com
            </a>
            . See also our{' '}
            <Link href="/privacy" className="font-semibold text-ia-blue hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
