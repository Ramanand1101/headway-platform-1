import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

export const metadata = {
  title: 'Privacy Policy — InsuranceAdvise.in'
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-ia-navy">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: 10 July 2026</p>

      <div className="mt-8 space-y-7 text-sm leading-relaxed text-gray-700">
        <p>
          InsuranceAdvise.in (&quot;we&quot;, &quot;us&quot;, &quot;the platform&quot;) is a technology platform that
          provides website-building and content-publishing software to independent, IRDAI-licensed insurance
          advisors. We are not an insurer, insurance intermediary, agent, broker or web aggregator. This policy
          explains what personal data we collect, why, and how it is handled, in line with India&apos;s Digital
          Personal Data Protection Act, 2023 (DPDP Act).
        </p>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">1. Information we collect</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Account details you provide directly: name, email address, password, profile photo, city, bio, contact number.</li>
            <li>
              If you sign in with Google, we receive your name, email address and profile photo from your Google
              account. If you have granted the phone-number permission during sign-in, we also receive the phone
              number associated with your Google account, so you don&apos;t have to type it in manually.
            </li>
            <li>
              If you connect your Instagram account, we receive your Instagram professional (Business/Creator)
              account&apos;s profile info and media, and — only for the actions you take through the platform —
              access to publish posts, read and reply to comments, read and reply to direct messages, and view
              account insights.
            </li>
            <li>Content you create on the platform: blog posts, service listings, leads submitted by your site visitors.</li>
            <li>Basic usage data (pages visited, device/browser type) for security and reliability.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">2. How we use this information</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>To create and operate your advisor account and microsite.</li>
            <li>To pre-fill your profile (name, photo, phone number) so you can go live faster.</li>
            <li>To let prospective clients submit enquiries (leads) to you through your microsite.</li>
            <li>To communicate with you about your account, and to improve the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">3. Sharing of information</h2>
          <p className="mt-2">
            We do not sell personal data. We share data only with service providers that help us run the platform —
            for example Google (sign-in), Meta/Instagram (social publishing, only for advisors who connect their
            account), Cloudinary (photo storage) and our payment processor (for paid plans) — strictly to provide
            their respective services to us. Content you choose to publish on your public microsite (name, photo,
            bio, services) is, by design, visible to your site&apos;s visitors.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">4. Google user data</h2>
          <p className="mt-2">
            Our use of information received from Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ia-blue hover:underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. We only request the minimum Google account information
            needed to create your account and pre-fill your profile, and we do not use this data for advertising.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">5. Instagram / Meta data</h2>
          <p className="mt-2">
            Advisors may optionally connect their Instagram professional (Business or Creator) account to
            InsuranceAdvise.in to manage their social presence from one dashboard. When you connect your account,
            we access only what is needed for the features you use: your Instagram profile info and media (to
            display and manage your content), the ability to publish posts on your behalf (only when you initiate
            a post), comments on your posts (to let you view and reply to them), direct messages sent to your
            account (to let you view and reply to them), and account insights (engagement/reach metrics). We never
            publish, message, or take any action on your Instagram account without your explicit, in-app
            instruction. This data is used solely to operate these features and is not sold, shared for
            advertising, or used for any purpose beyond providing the service to you.
          </p>
          <p className="mt-2">
            You can disconnect your Instagram account at any time from your advisor dashboard, which revokes our
            access immediately. To request deletion of any Instagram-related data we have stored, email us (see
            Contact below) and we will delete it within a reasonable time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">6. Your rights</h2>
          <p className="mt-2">
            You can review and update most of your data any time from your advisor dashboard. You may request
            access to, correction of, or deletion of your personal data by writing to us (see Contact below); we
            will respond within a reasonable time as required under the DPDP Act.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">7. Data retention &amp; security</h2>
          <p className="mt-2">
            We retain account data for as long as your account is active, and take reasonable technical measures
            (encrypted transport, access controls) to protect it. No method of transmission or storage is
            completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ia-navy">8. Contact</h2>
          <p className="mt-2">
            For any privacy questions or requests, contact us at{' '}
            <a href="mailto:headwaytalentconsulting@gmail.com" className="font-semibold text-ia-blue hover:underline">
              headwaytalentconsulting@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
