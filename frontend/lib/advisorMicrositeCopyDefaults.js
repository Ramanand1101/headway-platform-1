// Default copy for template text on the advisor microsite that isn't backed
// by an advisor data field (headings, eyebrows, paragraphs, button labels).
// Each key is overridable per-advisor via `advisor.micrositeContent[key]`,
// editable only from the admin's "Enter as Advisor" view (see
// app/advisor/dashboard/page.js). Regular advisors don't see this — their
// microsite just uses these defaults unless an admin has customised them.
export const micrositeCopyDefaults = {
  heroHeadline: 'Insurance Advice You Can Trust',
  heroCtaPrimary: 'Get In Touch',
  heroCtaSecondary: '📞 Call Now',

  aboutEyebrow: 'About Me',

  visionMissionEyebrow: 'What Drives Me',
  visionMissionHeading: 'My Vision & Mission',
  visionMissionSubtext: 'Every plan I recommend is guided by these two simple ideas.',

  faqHeading: 'Frequently Asked Questions',
  faqSubtext: 'Clear answers to help you feel confident about insurance decisions.',

  servicesEyebrow: 'My Services',
  servicesHeading: 'Insurance Plans I Help You Choose',
  servicesSubtext: 'A complete range of protection & investment solutions, matched to your life stage and goals.',

  companiesEyebrow: 'Partner Insurers',
  companiesHeading: 'Companies I Work With',
  companiesSubtext: "I'm empanelled with India's most trusted insurers, so my advice stays 100% unbiased.",

  testimonialsEyebrow: 'Client Voices',
  testimonialsHeading: 'What My Customers Say About Me',
  testimonialsSubtext: "Real feedback from families I've had the privilege to advise.",

  achievementsEyebrow: 'My Achievements',
  achievementsHeading: 'Recognised for Trust & Results',

  contactEyebrow: 'Get In Touch',
  contactHeading: 'Contact Me',
  contactSubtext: 'Have a question about a plan, claim, or renewal? Reach out — I personally respond within a few hours.',
  contactInfoTitle: 'Contact Information',
  contactInfoSubtext: 'Have a question about a plan, claim, or renewal? Reach out — I personally respond within a few hours.',
  contactFormTitle: 'Send Me a Message',
  contactFormSubtext: "Fill this in and I'll get back to you personally — no call centre, no spam.",

  googleEyebrow: 'Verified on Google',
  googleHeading: 'Google Business Profile',
  googleSubtext: 'Check real reviews from my clients, or drop one of your own after we work together.',

  socialEyebrow: 'Stay Connected',
  socialHeading: 'Follow Me on Social Media'
};

export function micrositeCopy(advisor, key) {
  return advisor?.micrositeContent?.[key] || micrositeCopyDefaults[key];
}
