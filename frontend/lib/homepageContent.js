// Single source of truth for the homepage's default copy. The homepage
// (app/page.js) renders this unless the admin has saved overrides via
// /admin/homepage, and the admin editor (app/admin/homepage/page.js) uses
// this same shape to pre-fill its form. Keep both in sync with this shape.
export const defaultHomepageContent = {
  themeKey: 'navy-gold',
  heroOverlayOpacity: 70,
  // Top nav — editable at /admin/homepage. Each item is { id, label, href,
  // newTab, children }; items with a non-empty `children` array render as a
  // dropdown (desktop) / accordion (mobile) instead of a plain link.
  navLinks: [
    { id: 'nav-why', label: 'Why a Website', href: '/#why', newTab: false, children: [] },
    { id: 'nav-free', label: "It's Free", href: '/#free', newTab: false, children: [] },
    { id: 'nav-platform', label: 'Platform', href: '/#platform', newTab: false, children: [] },
    { id: 'nav-pricing', label: 'Credits', href: '/#pricing', newTab: false, children: [] }
  ],
  hero: {
    slides: [
      {
        tag: 'The Tech Platform for Insurance Advisors',
        headlineLine1: 'Your clients search you online.',
        headlineLine2: 'What do they find?',
        text: 'InsuranceAdvise.in gives every insurance advisor a premium personal website and a complete social media engine — in one platform, with zero technical skill needed.',
        primary: 'Get My Free Website',
        secondary: 'See a Live Microsite',
        secondaryHref: '',
        chip: 'Free website + 50 free credits on signup'
      },
      {
        tag: 'Website in 10 Minutes',
        headlineLine1: 'A premium website.',
        headlineLine2: 'Absolutely free.',
        text: 'Answer a few simple questions about your practice — your microsite goes live instantly at yourname.insuranceadvise.in. Hosting, SSL and maintenance included. No developer. No cost.',
        primary: 'Create My Website Now',
        secondary: '',
        secondaryHref: '',
        chip: 'No card required. Free forever plan.'
      },
      {
        tag: 'Social Media on Autopilot',
        headlineLine1: 'Reels. Carousels. Posters.',
        headlineLine2: 'Published in one click.',
        text: 'Pick from ready-made insurance content pieces, personalised with your name and photo — and publish directly to your Instagram and Facebook from your dashboard. Just 10 credits per post.',
        primary: 'Start Posting Today',
        secondary: '',
        secondaryHref: '',
        chip: '50 free credits = your first 5 posts free'
      },
      {
        tag: 'One Platform. Total Control.',
        headlineLine1: 'Run your website and social media',
        headlineLine2: 'from one dashboard.',
        text: 'Website, content, publishing, leads — everything an advisor needs to look professional and stay visible, managed from a single login. You focus on clients; the platform handles the digital work.',
        primary: 'Join the Platform',
        secondary: 'See Credit Plans',
        secondaryHref: '#pricing',
        chip: ''
      }
    ]
  },
  trustStrip: [
    { value: '10 Minutes', label: 'From signup to live website' },
    { value: '50 Free Credits', label: 'Given to every new advisor' },
    { value: '1,000+ Assets', label: 'Reels, carousels and posters' },
    { value: 'Direct Publishing', label: 'Straight to your social handles' }
  ],
  whyWebsite: {
    eyebrow: 'Why Every Advisor Needs a Website',
    heading: "Referrals got you here. They won't get you further.",
    paragraph:
      "Today's client checks you online before they trust you with their family's future. Without a digital presence, you're invisible to the next generation of policyholders.",
    cards: [
      {
        title: 'Clients Google you first',
        desc: 'Before the first meeting, prospects search your name. A professional website is the difference between credibility and doubt.',
        stat: 'First impressions are now digital'
      },
      {
        title: 'Trust before you speak',
        desc: 'Your license, experience, awards and client testimonials — visible upfront, working for you 24 hours a day.',
        stat: 'Authority builds trust'
      },
      {
        title: 'Leads while you sleep',
        desc: 'Built-in WhatsApp button, call button and enquiry form turn every visitor into a potential client — captured automatically.',
        stat: 'Every visit is an opportunity'
      },
      {
        title: 'Stay visible daily',
        desc: 'Consistent social media presence keeps you top-of-mind. When someone thinks insurance, they should think of you.',
        stat: 'Consistency builds recall'
      }
    ]
  },
  freeSection: {
    eyebrow: 'How Is This Free?',
    heading: 'Your website costs you nothing. Ever.',
    paragraph:
      'We believe every licensed advisor deserves a professional digital presence. So the platform gives you the complete website free — and you only spend credits when you publish marketing content. Simple, fair, transparent.',
    checklist: [
      {
        bold: 'Free premium microsite',
        rest: 'at yourname.insuranceadvise.in — design, hosting, SSL and maintenance included'
      },
      { bold: '50 free credits on signup', rest: '— enough for your first 5 social media posts, on us' },
      {
        bold: 'Pay only when you publish',
        rest: '— every activity (reel, carousel or image post) costs a flat 10 credits'
      },
      {
        bold: 'No hidden charges',
        rest: '— no setup fee, no maintenance fee, no lock-in. Recharge credits only when you need them'
      }
    ],
    button: 'Claim My Free Website'
  },
  capabilities: {
    eyebrow: 'Everything In One Place',
    heading: 'Your entire digital presence. One login.',
    paragraph:
      'Any advisor — regardless of technical skill — can now run their complete website and social media directly from this platform.',
    cards: [
      {
        title: 'Reels',
        desc: 'Short, trust-building videos on term plans, health cover, myths and more — personalised with your identity and published to your handles in one click.'
      },
      {
        title: 'Carousels',
        desc: 'Swipeable educational posts that position you as the expert — awareness topics, claim guidance, financial planning basics, festival campaigns.'
      },
      {
        title: 'Image Posts',
        desc: "Premium posters, greetings and quote cards for every occasion — keep your feed alive and your name in every client's mind."
      }
    ]
  },
  flow: {
    headingLine1: 'Website. Content. Publishing. Leads.',
    headingLine2: 'All from one dashboard.',
    paragraph:
      'Connect your Instagram and Facebook once. After that, everything happens here — no switching apps, no downloading files, no manual uploads.',
    steps: ['Your Website', 'Content Library', 'Direct Publishing', 'Leads To You'],
    button: 'Get Onboarded Free'
  },
  pricing: {
    eyebrow: 'Credits and Recharge Plans',
    heading: 'Start free. Recharge only when you publish.',
    paragraph:
      'Every new advisor gets 50 free credits. Each activity — reel, carousel or image post — costs a flat 10 credits. When credits run out, recharge in seconds.',
    plans: [
      {
        name: 'Starter',
        amount: '₹500',
        credits: '50 Credits · 5 posts',
        bonus: '',
        features: ['Any mix of reels, carousels or images', 'Personalised with your identity', 'Credits valid for 3 months']
      },
      {
        name: 'Growth',
        amount: '₹1,000',
        credits: '110 Credits · 11 posts',
        bonus: '(+10% bonus)',
        features: ['Roughly 2-3 posts every week', 'Priority content requests', 'Credits valid for 6 months']
      },
      {
        name: 'Authority',
        amount: '₹2,000',
        credits: '240 Credits · 24 posts',
        bonus: '(+20% bonus)',
        features: ['Daily visibility, always-on presence', 'Monthly posting calendar included', 'Credits valid for 12 months']
      }
    ],
    note: "Simple credit rule: every activity costs 10 credits — whether it's a reel, a carousel or an image post. Your free 50 credits mean your first 5 posts cost nothing.",
    domainCrossSell: {
      title: 'Want your own domain? (www.yourname.com)',
      desc: 'Registration, DNS setup, SSL and connection to your microsite — fully handled for you',
      price: '₹6,000 one-time'
    }
  },
  compliance: {
    heading: 'A technology platform. Nothing more, nothing less.',
    paragraph:
      'InsuranceAdvise.in is a software platform for licensed insurance advisors. We provide the technology — the advisor owns their practice, their content and their client relationships.',
    items: [
      {
        lead: 'We do not sell or solicit insurance.',
        desc: 'The platform never recommends, compares or promotes any insurance product or insurer.'
      },
      {
        lead: 'Licensed advisors only.',
        desc: 'Advisors confirm their IRDAI license during onboarding and remain solely responsible for their professional conduct.'
      },
      {
        lead: 'Advisor-approved publishing.',
        desc: "Content is published only on the advisor's explicit instruction, to the advisor's own connected accounts, under the advisor's name."
      },
      {
        lead: 'Data protection first.',
        desc: 'Lead and client data is processed with explicit consent in line with the Digital Personal Data Protection Act, 2023.'
      }
    ]
  },
  finalCta: {
    headingLine1: 'Your next client is searching online right now.',
    headingLine2Prefix: 'Make sure they find',
    headingLine2Highlight: 'you',
    paragraph: 'Free website. 50 free credits. Live in 10 minutes.',
    button: 'Get Started Free'
  },
  loginModal: {
    title: 'Advisor Login',
    subtitle: 'Get your free website and 50 free credits. New here?',
    subtitleLink: 'Create your free website',
    declaration:
      'I confirm that I am an IRDAI-licensed insurance advisor. I understand that InsuranceAdvise.in is a technology platform only; I am solely responsible for my professional conduct, for all content published under my name, and for compliance with applicable IRDAI regulations. I consent to my data being processed per the Privacy Policy (DPDP Act, 2023) and authorise publishing to social media accounts I connect, only on my instruction.',
    consentLabel: 'I agree to the declaration above.',
    consentPrompt: 'Scroll up to read the full declaration to continue.',
    submitButton: 'Login and Get Started'
  }
};
