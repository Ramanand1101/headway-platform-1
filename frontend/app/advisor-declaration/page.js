import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

export const metadata = {
  title: 'Advisor Declaration — InsuranceAdvise.in'
};

export default function AdvisorDeclarationPage() {
  return (
    <div className="min-h-screen bg-white text-ia-navy">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Advisor Declaration</h1>
        <p className="mt-2 text-sm text-gray-500">
          Every advisor must read and agree to this declaration before creating an account.
        </p>

        <div className="mt-8 space-y-7 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-ia-navy">1. IRDAI licensing</h2>
            <p className="mt-2">
              I confirm that I am an IRDAI-licensed insurance advisor, and that I will keep my license
              current and in good standing for as long as I use InsuranceAdvise.in.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ia-navy">2. Platform-only role</h2>
            <p className="mt-2">
              I understand that InsuranceAdvise.in is a technology platform only. It is not an insurer,
              insurance intermediary, agent, broker or web aggregator, does not sell, solicit, advertise,
              recommend or compare insurance products, and receives no commission from any insurance
              transaction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ia-navy">3. My responsibility</h2>
            <p className="mt-2">
              I am solely responsible for my own professional conduct, for all content published under my
              name on my microsite or connected social accounts, and for my compliance with applicable
              IRDAI regulations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ia-navy">4. Data consent</h2>
            <p className="mt-2">
              I consent to my data being processed in accordance with InsuranceAdvise.in&apos;s Privacy
              Policy and the Digital Personal Data Protection Act, 2023 (DPDP Act).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ia-navy">5. Social publishing authorisation</h2>
            <p className="mt-2">
              I authorise InsuranceAdvise.in to publish content to any social media accounts I connect,
              only when and as I instruct it to from my advisor dashboard — never automatically or without
              my direct action.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
