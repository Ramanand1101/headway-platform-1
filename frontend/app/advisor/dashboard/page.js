'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Logo from '../../../components/Logo';
import TagInput from '../../../components/TagInput';
import { socialIcons } from '../../../components/SocialIcons';
import { micrositeThemes } from '../../../lib/micrositeThemes';
import { decodeToken } from '../../../lib/auth';
import { micrositeCopyDefaults } from '../../../lib/advisorMicrositeCopyDefaults';
import { defaultVision, defaultMission } from '../../../lib/advisorMicrositeDefaults';
import { watermarkedUrl, downloadableUrl } from '../../../lib/watermark';
import ChatWidget from '../../../components/ChatWidget';

function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </svg>
  );
}
function OverviewIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function WebsiteIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
    </svg>
  );
}
function ProfileIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M17.25 19.5a5.25 5.25 0 0 0-10.5 0M12 12.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
    </svg>
  );
}
function LibraryIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
function LeadsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function RechargeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 15l3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}

const navItems = [
  { key: 'overview', label: 'Overview', Icon: OverviewIcon },
  { key: 'website', label: 'My Website', Icon: WebsiteIcon },
  { key: 'profile', label: 'Edit Profile', Icon: ProfileIcon },
  { key: 'library', label: 'Content Library', Icon: LibraryIcon },
  { key: 'leads', label: 'My Leads', Icon: LeadsIcon },
  { key: 'recharge', label: 'Recharge Credits', Icon: RechargeIcon }
];

const profileInputClasses =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-ia-navy outline-none ring-2 ring-transparent transition-all focus:border-ia-blue focus:ring-ia-blue/10';
const profileLabelClasses = 'text-sm font-semibold text-gray-700';

const pricingPlans = [
  { name: 'Starter', amount: '₹249', credits: '50 Credits', features: 'Images' },
  { name: 'Growth', amount: '₹499', credits: '110 Credits', features: 'Images + Carousels', popular: true },
  { name: 'Authority', amount: '₹999', credits: '220 Credits', features: 'Images + Carousels + Reels' }
];

const extraCreditsPack = { name: 'Extra Credits', amount: '₹249', credits: '50 Credits', features: 'Top up any time' };

const statusStyles = {
  new: 'bg-ia-gold-tint/40 text-ia-blue',
  'follow-up': 'bg-[#2E6FD8]/10 text-[#2E6FD8]',
  converted: 'bg-green-50 text-ia-green'
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  });
}

const tabKeys = ['overview', 'website', 'profile', 'library', 'leads', 'recharge'];

// Admin-only text overrides, grouped to match the microsite sections they
// belong to. Keys must match lib/advisorMicrositeCopyDefaults.js.
const micrositeCopyGroups = [
  {
    title: 'Hero',
    fields: [
      { key: 'heroHeadline', label: 'Headline' },
      { key: 'heroCtaPrimary', label: 'Primary button' },
      { key: 'heroCtaSecondary', label: 'Secondary button' }
    ]
  },
  { title: 'About', fields: [{ key: 'aboutEyebrow', label: 'Eyebrow' }] },
  {
    title: 'Vision & Mission',
    fields: [
      { key: 'visionMissionEyebrow', label: 'Eyebrow' },
      { key: 'visionMissionHeading', label: 'Heading' },
      { key: 'visionMissionSubtext', label: 'Subtext' }
    ]
  },
  {
    title: 'FAQs',
    fields: [
      { key: 'faqHeading', label: 'Heading' },
      { key: 'faqSubtext', label: 'Subtext' }
    ]
  },
  {
    title: 'Services',
    fields: [
      { key: 'servicesEyebrow', label: 'Eyebrow' },
      { key: 'servicesHeading', label: 'Heading' },
      { key: 'servicesSubtext', label: 'Subtext' }
    ]
  },
  {
    title: 'Companies',
    fields: [
      { key: 'companiesEyebrow', label: 'Eyebrow' },
      { key: 'companiesHeading', label: 'Heading' },
      { key: 'companiesSubtext', label: 'Subtext' }
    ]
  },
  {
    title: 'Testimonials',
    fields: [
      { key: 'testimonialsEyebrow', label: 'Eyebrow' },
      { key: 'testimonialsHeading', label: 'Heading' },
      { key: 'testimonialsSubtext', label: 'Subtext' }
    ]
  },
  {
    title: 'Achievements',
    fields: [
      { key: 'achievementsEyebrow', label: 'Eyebrow' },
      { key: 'achievementsHeading', label: 'Heading' }
    ]
  },
  {
    title: 'Contact',
    fields: [
      { key: 'contactEyebrow', label: 'Eyebrow' },
      { key: 'contactHeading', label: 'Heading' },
      { key: 'contactSubtext', label: 'Subtext' },
      { key: 'contactInfoTitle', label: 'Info card title' },
      { key: 'contactInfoSubtext', label: 'Info card subtext' },
      { key: 'contactFormTitle', label: 'Form title' },
      { key: 'contactFormSubtext', label: 'Form subtext' }
    ]
  },
  {
    title: 'Google reviews',
    fields: [
      { key: 'googleEyebrow', label: 'Eyebrow' },
      { key: 'googleHeading', label: 'Heading' },
      { key: 'googleSubtext', label: 'Subtext' }
    ]
  },
  {
    title: 'Social',
    fields: [
      { key: 'socialEyebrow', label: 'Eyebrow' },
      { key: 'socialHeading', label: 'Heading' }
    ]
  }
];

export default function AdvisorDashboardPage() {
  const [advisor, setAdvisor] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [highlightedField, setHighlightedField] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', warn: false });
  const [activeTab, setActiveTabState] = useState('overview');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  function setActiveTab(tab) {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.replaceState(null, '', `#${tab}`);
  }

  function toggleSidebar() {
    setSidebarExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('advisorSidebarExpanded', String(next));
      return next;
    });
  }

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (tabKeys.includes(hash)) setActiveTabState(hash);
    const stored = localStorage.getItem('advisorSidebarExpanded');
    if (stored !== null) setSidebarExpanded(stored === 'true');
  }, []);

  const [profileForm, setProfileForm] = useState({
    name: '',
    city: '',
    bio: '',
    aboutMe: '',
    contactNumber: '',
    whatsappNumber: '',
    email: '',
    officeAddress: '',
    irdaiLicenseNumber: '',
    yearsExperience: '',
    vision: '',
    mission: '',
    missionPillars: '',
    linkedin: '',
    facebook: '',
    youtube: '',
    instagramUrl: '',
    gmbRating: '',
    gmbReviewCount: '',
    gmbReviewLink: '',
    gmbMapsLink: '',
    themeKey: 'navy-teal'
  });
  // Admin-only overrides for template headings/eyebrows/paragraphs/buttons
  // across the microsite (e.g. the hero headline) — see
  // lib/advisorMicrositeCopyDefaults.js. Regular advisors never see or edit
  // this; unset keys just fall back to the default copy on the microsite.
  const [micrositeContentForm, setMicrositeContentForm] = useState({});
  const [serviceOfferings, setServiceOfferings] = useState([]);
  const [profileTextGenStatus, setProfileTextGenStatus] = useState({});
  const [specializationTags, setSpecializationTags] = useState([]);
  const [credentialTags, setCredentialTags] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyLogoStatus, setCompanyLogoStatus] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [achievementImageStatus, setAchievementImageStatus] = useState({});
  const [faqs, setFaqs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStatus, setReviewStatus] = useState({ savingId: '', adding: false, error: '' });
  const [reviewPhotoStatus, setReviewPhotoStatus] = useState({});
  const [profileStatus, setProfileStatus] = useState({ saving: false, error: '', success: '' });
  const [myBlogPosts, setMyBlogPosts] = useState([]);
  const [blogTopic, setBlogTopic] = useState('');
  const [blogDraft, setBlogDraft] = useState(null);
  const [blogManualForm, setBlogManualForm] = useState({ title: '', body: '' });
  const [blogStatus, setBlogStatus] = useState({ drafting: false, publishing: false, error: '' });
  const [slugEditorOpen, setSlugEditorOpen] = useState(false);
  const [slugInput, setSlugInput] = useState('');
  const [slugCheck, setSlugCheck] = useState({ checking: false, available: null, reason: '', suggestions: [] });
  const [slugSaveStatus, setSlugSaveStatus] = useState({ saving: false, error: '', success: '' });
  const [photoStatus, setPhotoStatus] = useState({ uploading: false, error: '' });
  const [micrositeImages, setMicrositeImages] = useState({});
  const [micrositeImageStatus, setMicrositeImageStatus] = useState({});
  // URLs the advisor has unlocked from the admin-curated Content Library
  // (paid via share/download — see unlockCreativeForAction). Content
  // Library is admin-curated only; advisors don't upload their own photos.
  const [libraryImages, setLibraryImages] = useState([]);
  const [previewCreative, setPreviewCreative] = useState(null);
  const previewIframeRef = useRef(null);
  const [previewReadyTick, setPreviewReadyTick] = useState(0);

  const [creativeType, setCreativeType] = useState('image');
  const [creativeCategory, setCreativeCategory] = useState('life');
  const [creatives, setCreatives] = useState([]);
  const [creativesLoading, setCreativesLoading] = useState(false);
  const [creativeAddStatus, setCreativeAddStatus] = useState({});

  const [companyDirectory, setCompanyDirectory] = useState([]);
  const [companyDirectoryOpen, setCompanyDirectoryOpen] = useState(false);
  const [companyDirectoryCategory, setCompanyDirectoryCategory] = useState('life');
  const [companyDirectoryLoading, setCompanyDirectoryLoading] = useState(false);

  function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, ...extra };
  }

  function loadAll() {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/me`, { headers: authHeaders() }).then((res) => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/content/advisor-defaults`)
        .then((res) => res.json())
        .catch(() => ({ content: null }))
    ])
      .then(([data, defaultsRes]) => {
        const adminDefaults = defaultsRes?.content || {};
        setAdvisor(data.advisor);
        if (data.advisor) {
          setProfileForm({
            name: data.advisor.name || '',
            city: data.advisor.city || '',
            bio: data.advisor.bio || '',
            aboutMe: data.advisor.aboutMe || '',
            contactNumber: data.advisor.contactNumber || '',
            whatsappNumber: data.advisor.whatsappNumber || '',
            email: data.advisor.email || '',
            officeAddress: data.advisor.officeAddress || '',
            irdaiLicenseNumber: data.advisor.irdaiLicenseNumber || '',
            yearsExperience: data.advisor.yearsExperience || '',
            vision: data.advisor.vision || adminDefaults.vision || defaultVision,
            mission: data.advisor.mission || adminDefaults.mission || defaultMission,
            missionPillars: (data.advisor.missionPillars || []).join(', '),
            linkedin: data.advisor.socialLinks?.linkedin || '',
            facebook: data.advisor.socialLinks?.facebook || '',
            youtube: data.advisor.socialLinks?.youtube || '',
            instagramUrl: data.advisor.socialLinks?.instagram || '',
            gmbRating: data.advisor.googleBusiness?.rating ?? '',
            gmbReviewCount: data.advisor.googleBusiness?.reviewCount ?? '',
            gmbReviewLink: data.advisor.googleBusiness?.reviewLink || '',
            gmbMapsLink: data.advisor.googleBusiness?.mapsLink || '',
            themeKey: data.advisor.themeKey || 'navy-teal'
          });
          setSpecializationTags(data.advisor.specialization || []);
          setCredentialTags(data.advisor.credentials || []);
          setMicrositeImages({
            ...data.advisor.micrositeImages,
            vision: data.advisor.micrositeImages?.vision || adminDefaults.visionImage || undefined,
            mission: data.advisor.micrositeImages?.mission || adminDefaults.missionImage || undefined
          });
          setMicrositeContentForm(data.advisor.micrositeContent || {});
          setLibraryImages(data.advisor.contentLibraryImages || []);
          setServiceOfferings(
            data.advisor.serviceOfferings?.length ? data.advisor.serviceOfferings : []
          );
          setCompanies(data.advisor.companiesWorkedWith || []);
          setAchievements(data.advisor.achievements || []);
          setFaqs(data.advisor.faqs?.length ? data.advisor.faqs : adminDefaults.faqs || []);
        }
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/mine`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads || []);
        setLoading(false);
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/me/testimonials`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setReviews(data.testimonials || []));
  }

  useEffect(() => {
    loadAll();
    const decoded = decodeToken(localStorage.getItem('token'));
    setIsImpersonating(Boolean(decoded?.impersonatedBy));
  }, []);

  function backToAdmin() {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      localStorage.setItem('token', adminToken);
      localStorage.removeItem('adminToken');
    }
    window.location.href = '/admin/advisors';
  }

  useEffect(() => {
    if (!previewCreative) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setPreviewCreative(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewCreative]);

  // The preview iframe (the advisor's own microsite in ?preview=1 mode)
  // announces itself via postMessage once mounted; every time it does
  // (including on refresh) we push the current unsaved form state so the
  // live preview reflects edits before the advisor hits Save.
  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type === 'advisor-preview-ready') {
        setPreviewReadyTick((t) => t + 1);
        return;
      }
      // Admin-only: clicking text/a photo in the live preview jumps to and
      // highlights its matching field below, like the homepage editor.
      // Regular advisors never trigger this (isImpersonating is false), so
      // their own dashboard behaves exactly as before.
      if (e.data?.type === 'advisor-preview-click' && isImpersonating) {
        const id = `field-${e.data.field}`;
        // setActiveTab() also does its own window.scrollTo({ top: 0 }), which
        // races against and cancels the scrollIntoView below — so switch tabs
        // directly (bypassing that side effect) instead of using setActiveTab.
        setActiveTabState('profile');
        window.history.replaceState(null, '', '#profile');
        setHighlightedField(id);
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
        setTimeout(() => setHighlightedField((cur) => (cur === id ? null : cur)), 2500);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isImpersonating]);

  function buildDraftAdvisor() {
    return {
      ...advisor,
      name: profileForm.name,
      city: profileForm.city,
      bio: profileForm.bio,
      aboutMe: profileForm.aboutMe,
      contactNumber: profileForm.contactNumber,
      whatsappNumber: profileForm.whatsappNumber,
      specialization: specializationTags,
      services: serviceOfferings.map((o) => o.title.trim()).filter(Boolean),
      email: profileForm.email,
      officeAddress: profileForm.officeAddress,
      irdaiLicenseNumber: profileForm.irdaiLicenseNumber,
      yearsExperience: profileForm.yearsExperience,
      credentials: credentialTags,
      vision: profileForm.vision,
      mission: profileForm.mission,
      missionPillars: profileForm.missionPillars.split(',').map((s) => s.trim()).filter(Boolean),
      companiesWorkedWith: companies.filter((c) => c.name.trim()),
      socialLinks: {
        linkedin: profileForm.linkedin,
        facebook: profileForm.facebook,
        youtube: profileForm.youtube,
        instagram: profileForm.instagramUrl
      },
      googleBusiness: {
        rating: profileForm.gmbRating ? Number(profileForm.gmbRating) : undefined,
        reviewCount: profileForm.gmbReviewCount ? Number(profileForm.gmbReviewCount) : undefined,
        reviewLink: profileForm.gmbReviewLink,
        mapsLink: profileForm.gmbMapsLink
      },
      themeKey: profileForm.themeKey,
      serviceOfferings: serviceOfferings.filter((o) => o.title.trim()),
      achievements: achievements.filter((a) => a.name.trim()),
      faqs: faqs.filter((f) => f.question.trim()),
      micrositeImages,
      micrositeContent: micrositeContentForm,
      photoUrl: advisor?.photoUrl
    };
  }

  useEffect(() => {
    if (previewReadyTick === 0 || !advisor) return;
    previewIframeRef.current?.contentWindow?.postMessage(
      { type: 'advisor-preview-content', advisor: buildDraftAdvisor() },
      '*'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    previewReadyTick,
    profileForm,
    specializationTags,
    credentialTags,
    serviceOfferings,
    companies,
    achievements,
    faqs,
    micrositeImages,
    micrositeContentForm,
    advisor
  ]);

  function updateProfileField(field, value) {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  }

  // "Magic wand" — drafts Short Bio / About Me from the advisor's existing
  // profile fields. Result lands in the normal textarea, still fully editable.
  async function generateProfileText(field) {
    setProfileTextGenStatus((prev) => ({ ...prev, [field]: { generating: true, error: '' } }));
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/generate-profile-text`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ field })
    });
    const data = await res.json();
    if (!res.ok) {
      setProfileTextGenStatus((prev) => ({ ...prev, [field]: { generating: false, error: data.error || 'Could not generate text' } }));
      return;
    }
    updateProfileField(field, data.text);
    setProfileTextGenStatus((prev) => ({ ...prev, [field]: { generating: false, error: '' } }));
  }

  function updateMicrositeContentField(field, value) {
    setMicrositeContentForm((prev) => ({ ...prev, [field]: value }));
  }

  function addServiceOffering() {
    setServiceOfferings((prev) => [...prev, { title: '', description: '' }]);
  }
  function updateServiceOffering(i, field, value) {
    setServiceOfferings((prev) => prev.map((o, idx) => (idx === i ? { ...o, [field]: value } : o)));
  }
  function removeServiceOffering(i) {
    setServiceOfferings((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addCompany() {
    setCompanies((prev) => [...prev, { name: '', logoUrl: '' }]);
  }
  function updateCompany(i, field, value) {
    setCompanies((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  }
  function removeCompany(i) {
    setCompanies((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Admin-curated company logos — loaded lazily the first time the advisor
  // opens the picker (and again whenever the category tab changes).
  function loadCompanyDirectory(category) {
    setCompanyDirectoryLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies?category=${category}`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setCompanyDirectory(data.companies || []))
      .finally(() => setCompanyDirectoryLoading(false));
  }

  function toggleCompanyDirectory() {
    setCompanyDirectoryOpen((prev) => {
      if (!prev) loadCompanyDirectory(companyDirectoryCategory);
      return !prev;
    });
  }

  function selectCompanyDirectoryCategory(category) {
    setCompanyDirectoryCategory(category);
    loadCompanyDirectory(category);
  }

  // Adds a directory pick as a new, already-filled company row — the advisor
  // can still edit the name/logo afterward, same as any manually added row.
  function addCompanyFromDirectory(entry) {
    if (companies.some((c) => c.name.trim().toLowerCase() === entry.name.toLowerCase())) return;
    setCompanies((prev) => [...prev, { name: entry.name, logoUrl: entry.logoUrl }]);
  }

  function addAchievement() {
    setAchievements((prev) => [...prev, { imageUrl: '', name: '', description: '' }]);
  }
  function updateAchievement(i, field, value) {
    setAchievements((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  }
  function removeAchievement(i) {
    setAchievements((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Shared uploader for one-off images inside a repeating list (a company
  // logo, an achievement photo) — hits the generic list-image endpoint and
  // just returns a URL, unlike the fixed-slot microsite-image uploader.
  async function uploadListImageFile(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/list-image`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not upload photo');
    return data.url;
  }

  async function handleCompanyLogoChange(i, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompanyLogoStatus((prev) => ({ ...prev, [i]: { uploading: true, error: '' } }));
    try {
      const url = await uploadListImageFile(file);
      updateCompany(i, 'logoUrl', url);
      setCompanyLogoStatus((prev) => ({ ...prev, [i]: { uploading: false, error: '' } }));
    } catch (err) {
      setCompanyLogoStatus((prev) => ({ ...prev, [i]: { uploading: false, error: err.message } }));
    }
  }

  async function handleAchievementImageChange(i, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAchievementImageStatus((prev) => ({ ...prev, [i]: { uploading: true, error: '' } }));
    try {
      const url = await uploadListImageFile(file);
      updateAchievement(i, 'imageUrl', url);
      setAchievementImageStatus((prev) => ({ ...prev, [i]: { uploading: false, error: '' } }));
    } catch (err) {
      setAchievementImageStatus((prev) => ({ ...prev, [i]: { uploading: false, error: err.message } }));
    }
  }

  // Adds a blank, unsaved review row to edit locally — mirrors
  // addCompany/addAchievement. Nothing hits the server until that row's own
  // Save button is clicked.
  function addReview() {
    setReviews((prev) => [{ _id: null, clientName: '', role: '', photoUrl: '', message: '', rating: 5 }, ...prev]);
  }

  function updateReviewLocal(i, field, value) {
    setReviews((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  async function handleReviewPhotoChange(i, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReviewPhotoStatus((prev) => ({ ...prev, [i]: { uploading: true, error: '' } }));
    try {
      const url = await uploadListImageFile(file);
      updateReviewLocal(i, 'photoUrl', url);
      setReviewPhotoStatus((prev) => ({ ...prev, [i]: { uploading: false, error: '' } }));
    } catch (err) {
      setReviewPhotoStatus((prev) => ({ ...prev, [i]: { uploading: false, error: err.message } }));
    }
  }

  // Saves one review row — creates it (POST) the first time, updates it
  // (PATCH) on every save after that, based on whether it already has an _id.
  async function saveReview(i) {
    const review = reviews[i];
    if (!review.clientName.trim() || !review.message.trim()) {
      setReviewStatus({ savingId: '', adding: false, error: 'Customer name and review text are required' });
      return;
    }

    const isNew = !review._id;
    setReviewStatus({ savingId: isNew ? 'new' : review._id, adding: false, error: '' });

    const body = {
      clientName: review.clientName,
      role: review.role,
      photoUrl: review.photoUrl,
      message: review.message,
      rating: review.rating
    };
    const res = await fetch(
      isNew
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/advisor/me/testimonials`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/advisor/me/testimonials/${review._id}`,
      {
        method: isNew ? 'POST' : 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body)
      }
    );
    const data = await res.json();
    if (!res.ok) {
      setReviewStatus({ savingId: '', adding: false, error: data.error || 'Could not save review' });
      return;
    }
    setReviews((prev) => prev.map((r, idx) => (idx === i ? data.testimonial : r)));
    setReviewStatus({ savingId: '', adding: false, error: '' });
    showToast('Review saved.');
  }

  async function removeReview(i) {
    const review = reviews[i];
    if (review._id) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/me/testimonials/${review._id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
    }
    setReviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addFaq() {
    setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  }
  function updateFaq(i, field, value) {
    setFaqs((prev) => prev.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)));
  }
  function removeFaq(i) {
    setFaqs((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoStatus({ uploading: true, error: '' });

    const formData = new FormData();
    formData.append('photo', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/photo`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();

    if (!res.ok) {
      setPhotoStatus({ uploading: false, error: data.error || 'Could not upload photo' });
      return;
    }

    setAdvisor(data.advisor);
    setPhotoStatus({ uploading: false, error: '' });
  }

  // Advisor-facing Blogs — draftMyContent (free preview) then publishMyDraft
  // (charges 1 AI credit, only at the moment of actually posting).
  useEffect(() => {
    if (activeTab !== 'profile') return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/mine`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setMyBlogPosts(data.posts || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function handleBlogDraft() {
    setBlogStatus({ drafting: false, publishing: false, error: '' });
    setBlogStatus((s) => ({ ...s, drafting: true }));
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/mine/draft`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ topic: blogTopic })
    });
    const data = await res.json();
    if (!res.ok) {
      setBlogStatus({ drafting: false, publishing: false, error: data.error || 'Could not generate a draft' });
      return;
    }
    setBlogDraft(data.draft);
    setBlogStatus({ drafting: false, publishing: false, error: '' });
  }

  async function handleBlogPublish() {
    if (!blogDraft) return;
    setBlogStatus((s) => ({ ...s, publishing: true, error: '' }));
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/mine/publish`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(blogDraft)
    });
    const data = await res.json();
    if (!res.ok) {
      setBlogStatus({ drafting: false, publishing: false, error: data.error || 'Could not post this' });
      return;
    }
    setAdvisor((prev) => (prev ? { ...prev, aiCredits: data.aiCredits } : prev));
    setMyBlogPosts((prev) => [data.post, ...prev]);
    setBlogDraft(null);
    setBlogTopic('');
    setBlogStatus({ drafting: false, publishing: false, error: '' });
    showToast('Posted to your blog.');
  }

  async function handleBlogManualPublish() {
    if (!blogManualForm.title || !blogManualForm.body) return;
    setBlogStatus((s) => ({ ...s, publishing: true, error: '' }));
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/mine/manual`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(blogManualForm)
    });
    const data = await res.json();
    if (!res.ok) {
      setBlogStatus({ drafting: false, publishing: false, error: data.error || 'Could not post this' });
      return;
    }
    setMyBlogPosts((prev) => [data.post, ...prev]);
    setBlogManualForm({ title: '', body: '' });
    setBlogStatus({ drafting: false, publishing: false, error: '' });
    showToast('Posted to your blog.');
  }

  // Applies a chatbot-proposed profile edit (see components/ChatWidget.js)
  // only when the advisor clicks its Insert button — never automatically.
  function handleChatAction(action) {
    if (action.type === 'set_bio' && action.args?.text) {
      updateProfileField('bio', action.args.text);
      setActiveTab('profile');
      showToast('Inserted into Short Bio — remember to Save changes.');
    } else if (action.type === 'set_about_me' && action.args?.text) {
      updateProfileField('aboutMe', action.args.text);
      setActiveTab('profile');
      showToast('Inserted into About Me — remember to Save changes.');
    } else if (action.type === 'add_faq' && action.args?.question && action.args?.answer) {
      setFaqs((prev) => [...prev, { question: action.args.question, answer: action.args.answer }]);
      setActiveTab('profile');
      showToast('FAQ added — remember to Save changes.');
    } else if (action.type === 'set_vision' && action.args?.text) {
      updateProfileField('vision', action.args.text);
      setActiveTab('profile');
      showToast('Inserted into Vision — remember to Save changes.');
    } else if (action.type === 'set_mission' && action.args?.text) {
      updateProfileField('mission', action.args.text);
      setActiveTab('profile');
      showToast('Inserted into Mission — remember to Save changes.');
    }
  }

  async function handleBlogDelete(id) {
    setMyBlogPosts((prev) => prev.filter((p) => p._id !== id));
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/mine/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
  }

  async function handleMicrositeImageChange(section, e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMicrositeImageStatus((prev) => ({ ...prev, [section]: { uploading: true, error: '' } }));

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/microsite-image/${section}`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();

    if (!res.ok) {
      setMicrositeImageStatus((prev) => ({
        ...prev,
        [section]: { uploading: false, error: data.error || 'Could not upload photo' }
      }));
      return;
    }

    setMicrositeImages(data.advisor.micrositeImages || {});
    setMicrositeImageStatus((prev) => ({ ...prev, [section]: { uploading: false, error: '' } }));
  }

  async function handleMicrositeImageRemove(section) {
    setMicrositeImageStatus((prev) => ({ ...prev, [section]: { uploading: true, error: '' } }));
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/microsite-image/${section}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    const data = await res.json();

    if (!res.ok) {
      setMicrositeImageStatus((prev) => ({
        ...prev,
        [section]: { uploading: false, error: data.error || 'Could not remove photo' }
      }));
      return;
    }

    setMicrositeImages(data.advisor.micrositeImages || {});
    setMicrositeImageStatus((prev) => ({ ...prev, [section]: { uploading: false, error: '' } }));
  }

  // Admin-curated creatives (Images/Carousels/Reels × Life/Health/General),
  // shared with every advisor. Loaded lazily when the Content Library tab is open.
  useEffect(() => {
    if (activeTab !== 'library') return;
    setCreativesLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/creatives?type=${creativeType}&category=${creativeCategory}`, {
      headers: authHeaders()
    })
      .then((res) => res.json())
      .then((data) => setCreatives(data.creatives || []))
      .finally(() => setCreativesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, creativeType, creativeCategory]);

  const CREATIVE_COSTS = { image: 10, carousel: 20, reel: 30 };

  function isCreativeUnlocked(creative) {
    return libraryImages.includes(creative.imageUrl);
  }

  // Charges credits (by content type) the first time this creative is
  // shared or downloaded — never before. Already-unlocked creatives are
  // free to share/download again. Returns the creative's real (clean) URL
  // on success so the caller can proceed with the share/download action, or
  // null if the advisor cancelled/couldn't afford it.
  async function unlockCreativeForAction(creative) {
    if (isCreativeUnlocked(creative)) return creative.imageUrl;

    const cost = CREATIVE_COSTS[creative.type] || CREATIVE_COSTS.image;
    if (!window.confirm(`This ${creative.type} costs ${cost} credits. Continue?`)) return null;

    setCreativeAddStatus((prev) => ({ ...prev, [creative._id]: 'adding' }));
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/content-library/from-url`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ creativeId: creative._id })
    });
    const data = await res.json();
    if (res.ok) {
      setAdvisor(data.advisor);
      setLibraryImages(data.advisor.contentLibraryImages || []);
      setCreativeAddStatus((prev) => ({ ...prev, [creative._id]: 'added' }));
      return data.url;
    }

    showToast(data.error || 'Could not unlock this content', true);
    setCreativeAddStatus((prev) => ({ ...prev, [creative._id]: '' }));
    return null;
  }

  async function handleCreativeDownload(creative) {
    const url = await unlockCreativeForAction(creative);
    if (!url) return;
    const link = document.createElement('a');
    link.href = downloadableUrl(url, creative.title);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // Fetches the actual image/video file and hands it to the device's native
  // share sheet so the real file + headline get shared — not just a link.
  // Only worth trying on phones: WhatsApp/Instagram/etc. appear as targets
  // there. On desktop (macOS/Windows) the native share sheet only lists the
  // OS's own apps (Mail, Messages, AirDrop...) — no WhatsApp/Instagram — so
  // using it there would hijack the platform icon away from where it should
  // go. Returns false whenever it can't/shouldn't run, so the caller falls
  // back to the platform-specific web link.
  function isMobileDevice() {
    return typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  async function tryNativeFileShare(url, title, description) {
    if (typeof navigator === 'undefined' || !navigator.share || !isMobileDevice()) return false;
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) return false;
      const blob = await response.blob();
      const isVideo = blob.type.startsWith('video/');
      const ext = blob.type.split('/')[1] || (isVideo ? 'mp4' : 'jpg');
      const file = new File([blob], `insuranceadvise-content.${ext}`, { type: blob.type });

      if (navigator.canShare && !navigator.canShare({ files: [file] })) return false;

      // Full caption (not just description-or-title) — on mobile, whichever
      // app the advisor picks from the native share sheet (Facebook,
      // Instagram, WhatsApp...) receives this text directly via the OS
      // share intent, which is NOT subject to Facebook's web-sharer
      // restriction on prefilling post text — that limitation only applies
      // to the browser-based sharer.php dialog, not native app-to-app shares.
      const caption = [title, description].filter(Boolean).join('\n\n');
      await navigator.share({
        files: [file],
        title: title || undefined,
        text: caption || undefined
      });
      return true;
    } catch (err) {
      // AbortError = advisor closed the share sheet without picking anything
      // — they saw it and chose not to proceed, so treat as handled, not a failure.
      return err?.name === 'AbortError';
    }
  }

  const platformLabels = {
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    youtube: 'YouTube'
  };

  // WhatsApp/Facebook/LinkedIn's web "share" links can't attach a real
  // image file directly — but they DO render a rich preview card
  // (image + title + description) for any link that has Open Graph tags,
  // instead of showing the bare URL as plain text. So we share a link to
  // our own /share/creative/:id page (server-rendered with real OG tags —
  // see that page's generateMetadata) rather than the raw Cloudinary file
  // URL, which has no such tags and would just show as a boring link.
  function creativeShareUrl(creative) {
    return `${window.location.origin}/share/creative/${creative._id}`;
  }

  // Instagram/YouTube have no link-preview or web-share mechanism at all —
  // posting there always requires the advisor to manually upload inside
  // the app, so this is the one place a download is unavoidable. Copies
  // the caption too, so they just need to paste it after attaching the
  // already-downloaded photo.
  async function downloadAndCopyCaption(url, creative, platform) {
    const link = document.createElement('a');
    link.href = downloadableUrl(url, creative.title);
    document.body.appendChild(link);
    link.click();
    link.remove();

    const caption = [creative.title, creative.description].filter(Boolean).join('\n\n');
    if (caption && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(caption);
        showToast(`Photo saved & caption copied — open ${platformLabels[platform]} and post it.`);
        return;
      } catch {
        // clipboard write can fail (permissions/non-secure context) — fall
        // through to the photo-only toast below instead of erroring out.
      }
    }
    showToast(`Photo saved — open ${platformLabels[platform]} to post it.`);
  }

  async function handleCreativeShare(creative, platform) {
    const url = await unlockCreativeForAction(creative);
    if (!url) return;

    const sharedNatively = await tryNativeFileShare(url, creative.title, creative.description);
    if (sharedNatively) return;

    if (platform === 'whatsapp' || platform === 'facebook' || platform === 'linkedin') {
      const shareUrl = creativeShareUrl(creative);
      const caption = [creative.title, creative.description].filter(Boolean).join('\n\n');
      const intent =
        platform === 'whatsapp'
          ? // WhatsApp is the one platform whose share link DOES accept
            // free text, so send the actual caption + link together instead
            // of just the bare link.
            `https://wa.me/?text=${encodeURIComponent(caption ? `${caption}\n\n${shareUrl}` : shareUrl)}`
          : platform === 'facebook'
            ? // Facebook's web sharer intentionally ignores/strips any text
              // meant for the post body (anti-spam policy since ~2018) — a
              // site can only control the link-preview card (image/title/
              // description via Open Graph tags), never prefill "What's on
              // your mind". `quote` is passed as a best-effort; Facebook may
              // or may not use it, and there's no other way around this.
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(caption)}`
            : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(intent, '_blank', 'noopener,noreferrer');

      // Facebook/LinkedIn never let a site prefill their post-text box (only
      // the link-preview card is controllable via Open Graph tags) — copy
      // the caption to the clipboard so the advisor only has to paste it
      // into the box that just opened, instead of typing it out.
      if (platform === 'facebook' || platform === 'linkedin') {
        if (caption && navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(caption);
            showToast('Caption copied — paste it into the post box that just opened.');
          } catch {
            // clipboard write can fail silently (permissions/non-secure
            // context) — the share dialog still opened, so nothing to undo.
          }
        }
      }
      return;
    }

    await downloadAndCopyCaption(url, creative, platform);
  }

  function openSlugEditor() {
    setSlugInput(advisor?.slug || '');
    setSlugCheck({ checking: false, available: null, reason: '', suggestions: [] });
    setSlugSaveStatus({ saving: false, error: '', success: '' });
    setSlugEditorOpen(true);
  }

  // Debounced live-availability check, Gmail-signup style: pause typing for
  // 400ms, then ask the backend if this address is free (and if not, what
  // similar ones are).
  useEffect(() => {
    if (!slugEditorOpen) return;
    const value = slugInput.trim();
    if (!value || value === advisor?.slug) {
      setSlugCheck({ checking: false, available: null, reason: '', suggestions: [] });
      return;
    }
    setSlugCheck((s) => ({ ...s, checking: true }));
    const timer = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/slug-availability?slug=${encodeURIComponent(value)}`, {
        headers: authHeaders()
      })
        .then((res) => res.json())
        .then((data) => setSlugCheck({ checking: false, available: data.available, reason: data.reason || '', suggestions: data.suggestions || [] }))
        .catch(() => setSlugCheck({ checking: false, available: null, reason: '', suggestions: [] }));
    }, 400);
    return () => clearTimeout(timer);
  }, [slugInput, slugEditorOpen]);

  async function handleSlugSave() {
    setSlugSaveStatus({ saving: true, error: '', success: '' });
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/slug`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ slug: slugInput.trim() })
    });
    const data = await res.json();
    if (!res.ok) {
      setSlugSaveStatus({ saving: false, error: data.error || 'Could not update your website address', success: '' });
      return;
    }
    setAdvisor(data.advisor);
    setSlugSaveStatus({ saving: false, error: '', success: 'Website address updated!' });
    setTimeout(() => setSlugEditorOpen(false), 1500);
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileStatus({ saving: true, error: '', success: '' });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/profile`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        name: profileForm.name.trim(),
        city: profileForm.city.trim(),
        bio: profileForm.bio.trim(),
        aboutMe: profileForm.aboutMe.trim(),
        contactNumber: profileForm.contactNumber.trim(),
        whatsappNumber: profileForm.whatsappNumber.trim(),
        specialization: specializationTags,
        services: serviceOfferings.map((o) => o.title.trim()).filter(Boolean),
        email: profileForm.email.trim(),
        officeAddress: profileForm.officeAddress.trim(),
        irdaiLicenseNumber: profileForm.irdaiLicenseNumber.trim(),
        yearsExperience: profileForm.yearsExperience.trim(),
        credentials: credentialTags,
        vision: profileForm.vision.trim(),
        mission: profileForm.mission.trim(),
        missionPillars: profileForm.missionPillars
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        companiesWorkedWith: companies.filter((c) => c.name.trim()),
        socialLinks: {
          linkedin: profileForm.linkedin.trim(),
          facebook: profileForm.facebook.trim(),
          youtube: profileForm.youtube.trim(),
          instagram: profileForm.instagramUrl.trim()
        },
        googleBusiness: {
          rating: profileForm.gmbRating ? Number(profileForm.gmbRating) : undefined,
          reviewCount: profileForm.gmbReviewCount ? Number(profileForm.gmbReviewCount) : undefined,
          reviewLink: profileForm.gmbReviewLink.trim(),
          mapsLink: profileForm.gmbMapsLink.trim()
        },
        serviceOfferings: serviceOfferings.filter((o) => o.title.trim()),
        achievements: achievements.filter((a) => a.name.trim()),
        faqs: faqs.filter((f) => f.question.trim()),
        themeKey: profileForm.themeKey,
        micrositeContent: micrositeContentForm
      })
    });
    const data = await res.json();

    if (!res.ok) {
      setProfileStatus({ saving: false, error: data.error || 'Could not save', success: '' });
      return;
    }

    setAdvisor(data.advisor);
    setProfileStatus({ saving: false, error: '', success: 'Profile updated.' });
  }

  function showToast(msg, warn = false) {
    setToast({ show: true, msg, warn });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 4200);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    window.location.href = '/advisor/login';
  }

  async function updateLeadStatus(id, status) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      showToast('Could not update lead status.', true);
      return;
    }
    const data = await res.json();
    setLeads((prev) => prev.map((l) => (l._id === id ? data.lead : l)));
  }

  const newLeadsCount = leads.filter((l) => l.status === 'new').length;
  const siteUrl = advisor ? `${advisor.slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}` : '';

  return (
    <div className="min-h-screen bg-white text-ia-navy">
      {/* ADMIN MODE — only shown when an admin is editing this advisor's
          dashboard on their behalf via Enter as Advisor. */}
      {isImpersonating && (
        <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-between gap-2 bg-ia-navy px-[4vw] py-2 text-xs font-bold text-white">
          <span>
            Admin Mode — editing {advisor?.name ? `${advisor.name}'s` : "this advisor's"} website on
            their behalf.
          </span>
          <button
            type="button"
            onClick={backToAdmin}
            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/25"
          >
            ← Back to Admin
          </button>
        </div>
      )}

      {/* TOPBAR */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white/90 px-[4vw] py-3.5 shadow-sm shadow-gray-900/[0.02] backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2.5 text-base font-extrabold sm:text-lg">
          <Logo size="sm" />
        </div>
        <div className="flex flex-none items-center gap-2 sm:gap-3.5">
          <div className="hidden items-center gap-2.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-ia-green sm:flex">
            <span className="text-ia-green">●</span>
            <strong>{advisor?.contentCredits ?? '—'}</strong>&nbsp;Credits
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('recharge')}
            className="rounded-xl bg-ia-blue px-3 py-2 text-xs font-bold text-white shadow-lg shadow-ia-gold-tint transition hover:-translate-y-0.5 hover:bg-ia-blue-soft sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Recharge
          </button>
          <div className="h-10 w-10 flex-none overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
            {advisor?.photoUrl ? (
              <img
                src={advisor.photoUrl}
                alt={advisor.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
                {advisor?.name?.[0] || '?'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE TAB STRIP */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveTab(item.key)}
            className={`flex flex-none items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === item.key ? 'bg-ia-blue text-white shadow-md shadow-ia-gold-tint' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <item.Icon className="h-4 w-4 flex-none" />
            {item.label}
          </button>
        ))}
      </div>

      <div
        className={`mx-auto grid max-w-[1500px] grid-cols-1 transition-all duration-200 ${
          sidebarExpanded ? 'lg:grid-cols-[230px_1fr]' : 'lg:grid-cols-[76px_1fr]'
        }`}
      >
        {/* SIDEBAR */}
        <aside className="hidden border-r border-gray-100 px-3 py-7 lg:sticky lg:top-[66px] lg:block lg:h-[calc(100vh-66px)] lg:self-start">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-ia-navy"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              title={item.label}
              className={`mb-1.5 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${
                activeTab === item.key
                  ? 'bg-ia-gold-tint/40 text-ia-blue ring-1 ring-ia-gold-tint'
                  : 'text-gray-600 hover:bg-ia-gold-tint/40 hover:text-ia-navy'
              }`}
            >
              <item.Icon className="h-5 w-5 flex-none text-ia-blue" />
              {sidebarExpanded && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
          <button
            type="button"
            onClick={logout}
            title="Logout"
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
          >
            <LogoutIcon className="h-5 w-5 flex-none" />
            {sidebarExpanded && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </aside>

        {/* MAIN */}
        <main className="px-[3vw] py-9 pb-16">
          {loading ? (
            <p className="text-gray-500">Loading your dashboard...</p>
          ) : (
            <>
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
              <section id="overview" className="mb-12 scroll-mt-24">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Welcome back, <span className="text-ia-blue">{advisor?.name?.split(' ')[0] || 'there'}</span>
                </h1>
                <p className="mt-1.5 text-sm text-gray-500">Here&apos;s how your digital presence is doing.</p>

                <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-3">
                  <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                    <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-green-50 text-xl text-ia-green">
                      💳
                    </div>
                    <div>
                      <strong className="block text-xl font-extrabold">{advisor?.contentCredits ?? 0}</strong>
                      <span className="text-xs text-gray-500">Credits Available</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                    <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[#2E6FD8]/10 text-xl text-[#2E6FD8]">
                      👥
                    </div>
                    <div>
                      <strong className="block text-xl font-extrabold">{leads.length}</strong>
                      <span className="text-xs text-gray-500">Total Leads</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                    <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-ia-gold-tint/40 text-xl text-ia-blue">
                      ✨
                    </div>
                    <div>
                      <strong className="block text-xl font-extrabold">{newLeadsCount}</strong>
                      <span className="text-xs text-gray-500">New Leads</span>
                    </div>
                  </div>
                </div>
              </section>
              )}

              {/* MY WEBSITE */}
              {activeTab === 'website' && (
              <section id="website" className="mb-12 scroll-mt-24">
                <h2 className="mb-5 text-lg font-extrabold">My Website</h2>
                <div className="grid grid-cols-1 gap-5 rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white p-7 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <strong className="text-lg">{siteUrl || 'yourname.insuranceadvise.in'}</strong>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[0.65rem] font-extrabold tracking-wide text-ia-green">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ia-green" />
                        LIVE
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Hosting, SSL and maintenance included free. Your microsite updates instantly when you edit your
                      profile, testimonials or achievements.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href={advisor ? `https://${siteUrl}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold shadow-sm transition hover:bg-gray-50"
                    >
                      View Site
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="rounded-xl bg-ia-blue px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-ia-gold-tint transition hover:-translate-y-0.5 hover:bg-ia-blue-soft"
                    >
                      Edit Profile
                    </button>
                    {!slugEditorOpen && (
                      <button
                        type="button"
                        onClick={openSlugEditor}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold shadow-sm transition hover:bg-gray-50"
                      >
                        Change Address
                      </button>
                    )}
                  </div>
                </div>

                {slugEditorOpen && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-gray-900">Change your website address</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Your old address will stop working immediately — update any links you've shared once you save.
                    </p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                        <input
                          type="text"
                          value={slugInput}
                          onChange={(e) => setSlugInput(e.target.value)}
                          autoFocus
                          className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none"
                        />
                        <span className="flex-none whitespace-nowrap text-sm text-gray-400">
                          .{process.env.NEXT_PUBLIC_BASE_DOMAIN}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSlugSave}
                          disabled={
                            slugSaveStatus.saving ||
                            slugCheck.checking ||
                            slugCheck.available === false ||
                            !slugInput.trim() ||
                            slugInput.trim() === advisor?.slug
                          }
                          className="flex-none rounded-xl bg-ia-blue px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-ia-blue-soft disabled:opacity-50"
                        >
                          {slugSaveStatus.saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlugEditorOpen(false)}
                          className="flex-none rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 min-h-[1.25rem] text-xs font-semibold">
                      {slugCheck.checking && <span className="text-gray-400">Checking availability...</span>}
                      {!slugCheck.checking && slugCheck.available === true && (
                        <span className="text-ia-green">✓ Available</span>
                      )}
                      {!slugCheck.checking && slugCheck.available === false && (
                        <span className="text-red-500">✕ {slugCheck.reason || 'Not available'}</span>
                      )}
                      {slugSaveStatus.error && <span className="block text-red-500">{slugSaveStatus.error}</span>}
                      {slugSaveStatus.success && <span className="block text-ia-green">{slugSaveStatus.success}</span>}
                    </div>

                    {slugCheck.suggestions.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-gray-400">
                          Try one of these instead
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {slugCheck.suggestions.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSlugInput(s)}
                              className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-bold text-gray-700 transition hover:border-ia-blue hover:text-ia-blue"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
              )}

              {/* EDIT PROFILE */}
              {activeTab === 'profile' && (
              <section id="profile" className="mb-12 scroll-mt-24">
                <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div>
                <h2 className={isImpersonating ? 'mb-1.5 text-lg font-extrabold' : 'mb-5 text-lg font-extrabold'}>
                  Edit Profile
                </h2>
                {isImpersonating && (
                  <p className="mb-3.5 text-xs font-semibold text-ia-blue">
                    Admin tip: click any text or photo in the live preview on the right to jump straight to it here.
                  </p>
                )}

                <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-5">
                    {advisor?.photoUrl ? (
                      <img
                        src={advisor.photoUrl}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-50"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ia-gold-tint/40 text-2xl font-semibold text-ia-blue ring-4 ring-gray-50">
                        {profileForm.name?.[0] || '?'}
                      </div>
                    )}
                    <div>
                      <label className="inline-block cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold shadow-sm transition hover:bg-gray-50">
                        {photoStatus.uploading ? 'Uploading...' : 'Change photo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          disabled={photoStatus.uploading}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-1.5 text-[0.65rem] text-gray-400">Recommended size: 400×400px, square</p>
                      {photoStatus.error && <p className="mt-1 text-xs text-red-600">{photoStatus.error}</p>}
                    </div>
                  </div>

                  <div className="mt-7 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                    <h3 className="text-sm font-extrabold text-ia-navy">Update your Profile Photos</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Optional — each section falls back to your profile photo above until you upload its own.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        { key: 'hero', label: 'Landing page photo (Hero banner)', size: '1200×900px, 4:3 landscape' },
                        { key: 'about', label: 'About Me photo', size: '1000×1000px, square' }
                      ].map((slot) => (
                        <div
                          key={slot.key}
                          id={`field-micrositeImages.${slot.key}`}
                          className={`flex scroll-mt-24 items-center gap-3 rounded-xl border bg-white p-3 ${
                            highlightedField === `field-micrositeImages.${slot.key}`
                              ? 'border-ia-blue ring-2 ring-ia-blue/40'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="h-14 w-14 flex-none overflow-hidden rounded-lg bg-gray-100">
                            {micrositeImages[slot.key] ? (
                              <img
                                src={micrositeImages[slot.key]}
                                alt={slot.label}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-gray-400">
                                None
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-ia-navy">{slot.label}</p>
                            <p className="mt-0.5 text-[0.6rem] text-gray-400">{slot.size}</p>
                            <label className="mt-1 inline-block cursor-pointer text-xs font-bold text-ia-blue hover:underline">
                              {micrositeImageStatus[slot.key]?.uploading
                                ? 'Uploading...'
                                : micrositeImages[slot.key]
                                  ? 'Replace'
                                  : 'Upload'}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleMicrositeImageChange(slot.key, e)}
                                disabled={micrositeImageStatus[slot.key]?.uploading}
                                className="hidden"
                              />
                            </label>
                            {micrositeImages[slot.key] && (
                              <button
                                type="button"
                                onClick={() => handleMicrositeImageRemove(slot.key)}
                                disabled={micrositeImageStatus[slot.key]?.uploading}
                                className="mt-1 ml-2 inline-block text-xs font-bold text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            )}
                            {micrositeImageStatus[slot.key]?.error && (
                              <p className="mt-1 text-[0.65rem] text-red-600">{micrositeImageStatus[slot.key].error}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="mt-7 space-y-5">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <h3 className="text-sm font-extrabold text-ia-navy">Microsite theme</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Pick a color &amp; font combination for your public website.
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(micrositeThemes).map(([key, theme]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => updateProfileField('themeKey', key)}
                            className={`flex items-center gap-3 rounded-xl border-2 bg-white p-3 text-left transition ${
                              profileForm.themeKey === key ? 'border-ia-blue' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex flex-none -space-x-1.5">
                              {theme.swatch.map((color, i) => (
                                <span
                                  key={i}
                                  className="h-6 w-6 rounded-full ring-2 ring-white"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-ia-navy">{theme.label}</p>
                              <p className="text-[0.65rem] text-gray-400">{theme.font.family}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div id="field-name" className="scroll-mt-24">
                        <label className={profileLabelClasses}>Full name</label>
                        <input
                          value={profileForm.name}
                          onChange={(e) => updateProfileField('name', e.target.value)}
                          placeholder="e.g. Vinod Kumar"
                          required
                          className={`mt-1.5 ${profileInputClasses} ${
                            highlightedField === 'field-name' ? 'border-ia-blue ring-2 ring-ia-blue/40' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className={profileLabelClasses}>City</label>
                        <input
                          value={profileForm.city}
                          onChange={(e) => updateProfileField('city', e.target.value)}
                          placeholder="e.g. Gurgaon"
                          className={`mt-1.5 ${profileInputClasses}`}
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={profileLabelClasses}>Contact number</label>
                        <input
                          value={profileForm.contactNumber}
                          onChange={(e) => updateProfileField('contactNumber', e.target.value)}
                          placeholder="e.g. 9876543210"
                          className={`mt-1.5 ${profileInputClasses}`}
                        />
                      </div>
                      <div>
                        <label className={profileLabelClasses}>WhatsApp number</label>
                        <input
                          value={profileForm.whatsappNumber}
                          onChange={(e) => updateProfileField('whatsappNumber', e.target.value)}
                          placeholder="e.g. 919876543210 (with country code)"
                          className={`mt-1.5 ${profileInputClasses}`}
                        />
                      </div>
                    </div>

                    <div id="field-bio" className="scroll-mt-24">
                      <div className="flex items-center justify-between">
                        <label className={profileLabelClasses}>Short bio (shown next to your name on the homepage)</label>
                        <button
                          type="button"
                          onClick={() => generateProfileText('bio')}
                          disabled={profileTextGenStatus.bio?.generating}
                          title="Auto-generate from your profile"
                          className="flex-none rounded-lg bg-ia-gold-tint/40 px-2.5 py-1 text-xs font-bold text-ia-blue transition hover:bg-ia-gold-tint disabled:opacity-50"
                        >
                          {profileTextGenStatus.bio?.generating ? 'Generating...' : '✨ Auto-generate'}
                        </button>
                      </div>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => updateProfileField('bio', e.target.value)}
                        placeholder="e.g. I help families choose the right insurance cover, without the jargon."
                        rows={3}
                        className={`mt-1.5 ${profileInputClasses} ${
                          highlightedField === 'field-bio' ? 'border-ia-blue ring-2 ring-ia-blue/40' : ''
                        }`}
                      />
                      {profileTextGenStatus.bio?.error && (
                        <p className="mt-1 text-xs text-red-600">{profileTextGenStatus.bio.error}</p>
                      )}
                    </div>

                    <div id="field-aboutMe" className="scroll-mt-24">
                      <div className="flex items-center justify-between">
                        <label className={profileLabelClasses}>About Me (the longer story shown in your About section)</label>
                        <button
                          type="button"
                          onClick={() => generateProfileText('aboutMe')}
                          disabled={profileTextGenStatus.aboutMe?.generating}
                          title="Auto-generate from your profile"
                          className="flex-none rounded-lg bg-ia-gold-tint/40 px-2.5 py-1 text-xs font-bold text-ia-blue transition hover:bg-ia-gold-tint disabled:opacity-50"
                        >
                          {profileTextGenStatus.aboutMe?.generating ? 'Generating...' : '✨ Auto-generate'}
                        </button>
                      </div>
                      <textarea
                        value={profileForm.aboutMe}
                        onChange={(e) => updateProfileField('aboutMe', e.target.value)}
                        placeholder="Tell clients who you are, how long you've been advising, and how you help them — 2-3 sentences works well."
                        rows={5}
                        className={`mt-1.5 ${profileInputClasses} ${
                          highlightedField === 'field-aboutMe' ? 'border-ia-blue ring-2 ring-ia-blue/40' : ''
                        }`}
                      />
                      {profileTextGenStatus.aboutMe?.error && (
                        <p className="mt-1 text-xs text-red-600">{profileTextGenStatus.aboutMe.error}</p>
                      )}
                    </div>

                    <div>
                      <label className={profileLabelClasses}>Specialization</label>
                      <TagInput
                        value={specializationTags}
                        onChange={setSpecializationTags}
                        placeholder="Type a specialization and press Enter"
                        className="mt-1.5"
                      />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-ia-navy">Services</h3>
                        <button
                          type="button"
                          onClick={addServiceOffering}
                          className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ia-blue shadow-sm hover:bg-ia-gold-tint/40"
                        >
                          + Add service
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Shown as cards on your microsite — these titles are also used as your plain services list
                        wherever that's needed (e.g. the contact form's interest dropdown).
                      </p>
                      <div className="mt-4 space-y-3">
                        {serviceOfferings.map((o, i) => (
                          <div key={i} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3">
                            <div className="flex-1 space-y-2">
                              <input
                                value={o.title}
                                onChange={(e) => updateServiceOffering(i, 'title', e.target.value)}
                                placeholder="Title, e.g. Term Life Insurance"
                                className={profileInputClasses}
                              />
                              <textarea
                                value={o.description}
                                onChange={(e) => updateServiceOffering(i, 'description', e.target.value)}
                                placeholder="Short description"
                                rows={2}
                                className={profileInputClasses}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeServiceOffering(i)}
                              className="flex-none self-start rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={profileLabelClasses}>Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => updateProfileField('email', e.target.value)}
                          placeholder="e.g. vinod@example.com"
                          className={`mt-1.5 ${profileInputClasses}`}
                        />
                      </div>
                      <div>
                        <label className={profileLabelClasses}>IRDAI license number</label>
                        <input
                          value={profileForm.irdaiLicenseNumber}
                          onChange={(e) => updateProfileField('irdaiLicenseNumber', e.target.value)}
                          placeholder="e.g. ABCD12345"
                          className={`mt-1.5 ${profileInputClasses}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={profileLabelClasses}>Office address</label>
                      <input
                        value={profileForm.officeAddress}
                        onChange={(e) => updateProfileField('officeAddress', e.target.value)}
                        placeholder="e.g. 15A, Sector 14, Gurgaon"
                        className={`mt-1.5 ${profileInputClasses}`}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={profileLabelClasses}>Years of experience</label>
                        <input
                          value={profileForm.yearsExperience}
                          onChange={(e) => updateProfileField('yearsExperience', e.target.value)}
                          placeholder="e.g. 14+"
                          className={`mt-1.5 ${profileInputClasses}`}
                        />
                      </div>
                      <div>
                        <label className={profileLabelClasses}>Designation / Club membership badges</label>
                        <TagInput
                          value={credentialTags}
                          onChange={setCredentialTags}
                          placeholder="e.g. IRDAI Licensed, MDRT Member"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <h3 className="text-sm font-extrabold text-ia-navy">Vision &amp; Mission</h3>
                      <p className="mt-1 text-xs text-gray-500">Shown as a two-card section on your microsite.</p>
                      <div className="mt-4 space-y-4">
                        <div id="field-vision" className="scroll-mt-24">
                          <label className={profileLabelClasses}>Vision statement</label>
                          <textarea
                            value={profileForm.vision}
                            onChange={(e) => updateProfileField('vision', e.target.value)}
                            placeholder="e.g. To make every family in my city financially secure."
                            rows={2}
                            className={`mt-1.5 ${profileInputClasses} ${
                              highlightedField === 'field-vision' ? 'border-ia-blue ring-2 ring-ia-blue/40' : ''
                            }`}
                          />
                        </div>
                        <div id="field-mission" className="scroll-mt-24">
                          <label className={profileLabelClasses}>Mission statement</label>
                          <textarea
                            value={profileForm.mission}
                            onChange={(e) => updateProfileField('mission', e.target.value)}
                            placeholder="e.g. To simplify insurance for every client, with honest, no-pressure advice."
                            rows={2}
                            className={`mt-1.5 ${profileInputClasses} ${
                              highlightedField === 'field-mission' ? 'border-ia-blue ring-2 ring-ia-blue/40' : ''
                            }`}
                          />
                        </div>
                        <div id="field-missionPillars" className="scroll-mt-24">
                          <label className={profileLabelClasses}>Mission pillars (comma separated)</label>
                          <input
                            value={profileForm.missionPillars}
                            onChange={(e) => updateProfileField('missionPillars', e.target.value)}
                            placeholder="Clarity over confusion, Client-first recommendations, Long-term security"
                            className={`mt-1.5 ${profileInputClasses} ${
                              highlightedField === 'field-missionPillars' ? 'border-ia-blue ring-2 ring-ia-blue/40' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>Vision &amp; Mission photos (optional)</label>
                          <p className="mt-0.5 text-[0.65rem] text-gray-400">
                            Replaces the default icon with a full-width banner photo on your microsite.
                          </p>
                          <div className="mt-2 grid gap-3 sm:grid-cols-2">
                            {[
                              { key: 'vision', label: 'Vision photo', size: '1200×400px, wide banner (3:1)' },
                              { key: 'mission', label: 'Mission photo', size: '1200×400px, wide banner (3:1)' }
                            ].map((slot) => (
                              <div
                                key={slot.key}
                                id={`field-micrositeImages.${slot.key}`}
                                className={`flex scroll-mt-24 items-center gap-3 rounded-xl border bg-white p-3 ${
                                  highlightedField === `field-micrositeImages.${slot.key}`
                                    ? 'border-ia-blue ring-2 ring-ia-blue/40'
                                    : 'border-gray-200'
                                }`}
                              >
                                <div className="h-12 w-24 flex-none overflow-hidden rounded-lg bg-gray-100">
                                  {micrositeImages[slot.key] ? (
                                    <img
                                      src={micrositeImages[slot.key]}
                                      alt={slot.label}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-gray-400">
                                      None
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-ia-navy">{slot.label}</p>
                                  <p className="mt-0.5 text-[0.6rem] text-gray-400">{slot.size}</p>
                                  <label className="mt-1 inline-block cursor-pointer text-xs font-bold text-ia-blue hover:underline">
                                    {micrositeImageStatus[slot.key]?.uploading
                                      ? 'Uploading...'
                                      : micrositeImages[slot.key]
                                        ? 'Replace'
                                        : 'Upload'}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleMicrositeImageChange(slot.key, e)}
                                      disabled={micrositeImageStatus[slot.key]?.uploading}
                                      className="hidden"
                                    />
                                  </label>
                                  {micrositeImages[slot.key] && (
                                    <button
                                      type="button"
                                      onClick={() => handleMicrositeImageRemove(slot.key)}
                                      disabled={micrositeImageStatus[slot.key]?.uploading}
                                      className="mt-1 ml-2 inline-block text-xs font-bold text-red-500 hover:underline"
                                    >
                                      Remove
                                    </button>
                                  )}
                                  {micrositeImageStatus[slot.key]?.error && (
                                    <p className="mt-1 text-[0.65rem] text-red-600">
                                      {micrositeImageStatus[slot.key].error}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isImpersonating && (
                      <div className="rounded-2xl border border-ia-blue/30 bg-ia-gold-tint/10 p-5">
                        <h3 className="text-sm font-extrabold text-ia-navy">Website text (Admin only)</h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Overrides for headings, buttons and paragraphs across the microsite. Leave a field blank
                          to use the default wording.
                        </p>
                        <div className="mt-4 space-y-5">
                          {micrositeCopyGroups.map((group) => (
                            <div key={group.title}>
                              <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-wide text-gray-400">
                                {group.title}
                              </p>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {group.fields.map((f) => {
                                  const fieldId = `field-micrositeContent.${f.key}`;
                                  return (
                                    <div key={f.key} id={fieldId} className="scroll-mt-24">
                                      <label className={profileLabelClasses}>{f.label}</label>
                                      <input
                                        value={micrositeContentForm[f.key] || ''}
                                        onChange={(e) => updateMicrositeContentField(f.key, e.target.value)}
                                        placeholder={micrositeCopyDefaults[f.key]}
                                        className={`mt-1.5 ${profileInputClasses} ${
                                          highlightedField === fieldId ? 'border-ia-blue ring-2 ring-ia-blue/40' : ''
                                        }`}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <h3 className="text-sm font-extrabold text-ia-navy">Social links</h3>
                      <div className="mt-4 grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className={profileLabelClasses}>LinkedIn URL</label>
                          <input
                            value={profileForm.linkedin}
                            onChange={(e) => updateProfileField('linkedin', e.target.value)}
                            placeholder="https://linkedin.com/in/your-profile"
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>Facebook URL</label>
                          <input
                            value={profileForm.facebook}
                            onChange={(e) => updateProfileField('facebook', e.target.value)}
                            placeholder="https://facebook.com/your-page"
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>YouTube URL</label>
                          <input
                            value={profileForm.youtube}
                            onChange={(e) => updateProfileField('youtube', e.target.value)}
                            placeholder="https://youtube.com/@your-channel"
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>Instagram URL</label>
                          <input
                            value={profileForm.instagramUrl}
                            onChange={(e) => updateProfileField('instagramUrl', e.target.value)}
                            placeholder="https://instagram.com/your-handle"
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <h3 className="text-sm font-extrabold text-ia-navy">Google Business Profile</h3>
                      <div className="mt-4 grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className={profileLabelClasses}>Rating (e.g. 4.9)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={profileForm.gmbRating}
                            onChange={(e) => updateProfileField('gmbRating', e.target.value)}
                            placeholder="4.8"
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>Review count</label>
                          <input
                            type="number"
                            min="0"
                            value={profileForm.gmbReviewCount}
                            onChange={(e) => updateProfileField('gmbReviewCount', e.target.value)}
                            placeholder="e.g. 120"
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>"Write a review" link</label>
                          <input
                            value={profileForm.gmbReviewLink}
                            onChange={(e) => updateProfileField('gmbReviewLink', e.target.value)}
                            placeholder="https://g.page/r/your-business/review"
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>Google Maps link</label>
                          <input
                            value={profileForm.gmbMapsLink}
                            onChange={(e) => updateProfileField('gmbMapsLink', e.target.value)}
                            placeholder="https://maps.app.goo.gl/..."
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <label className={profileLabelClasses}>Company working with</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={toggleCompanyDirectory}
                            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ia-blue shadow-sm hover:bg-ia-gold-tint/40"
                          >
                            {companyDirectoryOpen ? 'Hide directory' : 'Choose from directory'}
                          </button>
                          <button
                            type="button"
                            onClick={addCompany}
                            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ia-blue shadow-sm hover:bg-ia-gold-tint/40"
                          >
                            + Add company
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Insurers you're empanelled with, shown with their logo on your microsite.
                      </p>

                      {companyDirectoryOpen && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
                          <p className="mb-3 text-xs text-gray-500">
                            Pick a logo to add it below — you can still edit the name or replace the logo afterward.
                          </p>
                          <div className="mb-3 flex flex-wrap gap-2">
                            {[
                              { key: 'life', label: 'Life' },
                              { key: 'health', label: 'Health' },
                              { key: 'general', label: 'General' }
                            ].map((cat) => (
                              <button
                                key={cat.key}
                                type="button"
                                onClick={() => selectCompanyDirectoryCategory(cat.key)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                                  companyDirectoryCategory === cat.key
                                    ? 'bg-ia-blue text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                          {companyDirectoryLoading ? (
                            <p className="text-xs text-gray-400">Loading...</p>
                          ) : companyDirectory.length === 0 ? (
                            <p className="text-xs text-gray-400">No companies in this folder yet.</p>
                          ) : (
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                              {companyDirectory.map((entry) => {
                                const alreadyAdded = companies.some(
                                  (c) => c.name.trim().toLowerCase() === entry.name.toLowerCase()
                                );
                                return (
                                  <button
                                    key={entry._id}
                                    type="button"
                                    onClick={() => addCompanyFromDirectory(entry)}
                                    disabled={alreadyAdded}
                                    className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-100 p-2.5 text-center transition hover:border-ia-blue hover:bg-ia-gold-tint/20 disabled:opacity-40"
                                  >
                                    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-gray-50 p-1">
                                      <img src={entry.logoUrl} alt={entry.name} className="h-full w-full object-contain" />
                                    </div>
                                    <span className="text-[0.65rem] font-bold text-gray-700 leading-tight">
                                      {alreadyAdded ? 'Added ✓' : entry.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 space-y-3">
                        {companies.map((c, i) => (
                          <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <div className="h-14 w-14 flex-none overflow-hidden rounded-lg bg-gray-100">
                                {c.logoUrl ? (
                                  <img src={c.logoUrl} alt={c.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-gray-400">
                                    Logo
                                  </div>
                                )}
                              </div>
                              <input
                                value={c.name}
                                onChange={(e) => updateCompany(i, 'name', e.target.value)}
                                placeholder="Company name, e.g. LIC of India"
                                className={`sm:flex-1 ${profileInputClasses}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeCompany(i)}
                                className="flex-none self-end rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100 sm:self-auto"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                              <input
                                value={c.logoUrl}
                                onChange={(e) => updateCompany(i, 'logoUrl', e.target.value)}
                                placeholder="Logo image URL (or upload one instead)"
                                className={`sm:flex-1 ${profileInputClasses}`}
                              />
                              <label className="flex-none cursor-pointer whitespace-nowrap text-xs font-bold text-ia-blue hover:underline">
                                {companyLogoStatus[i]?.uploading ? 'Uploading...' : c.logoUrl ? 'Replace logo' : 'Upload logo'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleCompanyLogoChange(i, e)}
                                  disabled={companyLogoStatus[i]?.uploading}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            {companyLogoStatus[i]?.error && (
                              <p className="mt-1 text-[0.65rem] text-red-600">{companyLogoStatus[i].error}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                <div className="mb-7 rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
                  <h3 className="text-sm font-extrabold text-ia-navy">Blogs</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Write a post for your microsite&apos;s blog.
                  </p>

                  {!blogDraft ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <input
                        value={blogTopic}
                        onChange={(e) => setBlogTopic(e.target.value)}
                        placeholder="Optional topic, e.g. 'Why term insurance matters'"
                        className={`min-w-[220px] flex-1 ${profileInputClasses}`}
                      />
                      <button
                        type="button"
                        onClick={handleBlogDraft}
                        disabled={blogStatus.drafting}
                        className="flex-none rounded-xl bg-ia-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ia-blue-soft disabled:opacity-60"
                      >
                        {blogStatus.drafting ? 'Writing...' : '✨ Write with AI (free preview)'}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      {blogDraft.imageUrl && (
                        <img src={blogDraft.imageUrl} alt="" className="max-h-56 w-full rounded-lg object-cover" />
                      )}
                      <input
                        value={blogDraft.title}
                        onChange={(e) => setBlogDraft((d) => ({ ...d, title: e.target.value }))}
                        className={profileInputClasses}
                      />
                      <textarea
                        value={blogDraft.body}
                        onChange={(e) => setBlogDraft((d) => ({ ...d, body: e.target.value }))}
                        rows={6}
                        className={profileInputClasses}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleBlogPublish}
                          disabled={blogStatus.publishing}
                          className="rounded-xl bg-ia-green px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                        >
                          {blogStatus.publishing ? 'Posting...' : 'Post it'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlogDraft(null)}
                          className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-200"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  )}

                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs font-bold text-ia-blue">
                      Or write manually (always free)
                    </summary>
                    <div className="mt-3 space-y-2.5">
                      <input
                        value={blogManualForm.title}
                        onChange={(e) => setBlogManualForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="Title"
                        className={profileInputClasses}
                      />
                      <textarea
                        value={blogManualForm.body}
                        onChange={(e) => setBlogManualForm((f) => ({ ...f, body: e.target.value }))}
                        placeholder="Write your post..."
                        rows={5}
                        className={profileInputClasses}
                      />
                      <button
                        type="button"
                        onClick={handleBlogManualPublish}
                        disabled={blogStatus.publishing || !blogManualForm.title || !blogManualForm.body}
                        className="rounded-xl bg-ia-navy px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                      >
                        Post it (free)
                      </button>
                    </div>
                  </details>

                  {blogStatus.error && <p className="mt-3 text-xs text-red-500">{blogStatus.error}</p>}

                  {myBlogPosts.length > 0 && (
                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-gray-400">
                        Your posts
                      </h4>
                      <div className="space-y-2">
                        {myBlogPosts.map((post) => (
                          <div
                            key={post._id}
                            className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{post.title}</p>
                              <p className="text-[0.65rem] uppercase tracking-wide text-gray-400">{post.status}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleBlogDelete(post._id)}
                              className="flex-none text-xs font-bold text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-ia-navy">Achievements</h3>
                        <button
                          type="button"
                          onClick={addAchievement}
                          className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ia-blue shadow-sm hover:bg-ia-gold-tint/40"
                        >
                          + Add achievement
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Awards, certificates or recognitions — photo, name, and why you received it.
                      </p>
                      <div className="mt-4 space-y-3">
                        {achievements.map((a, i) => (
                          <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                              <div className="h-14 w-14 flex-none overflow-hidden rounded-lg bg-gray-100">
                                {a.imageUrl ? (
                                  <img src={a.imageUrl} alt={a.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-gray-400">
                                    Photo
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <input
                                    value={a.name}
                                    onChange={(e) => updateAchievement(i, 'name', e.target.value)}
                                    placeholder="Achievement name, e.g. MDRT Top of the Table"
                                    className={`flex-1 ${profileInputClasses}`}
                                  />
                                  <label className="flex-none cursor-pointer whitespace-nowrap text-xs font-bold text-ia-blue hover:underline">
                                    {achievementImageStatus[i]?.uploading
                                      ? 'Uploading...'
                                      : a.imageUrl
                                        ? 'Replace photo'
                                        : 'Upload photo'}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleAchievementImageChange(i, e)}
                                      disabled={achievementImageStatus[i]?.uploading}
                                      className="hidden"
                                    />
                                  </label>
                                  {a.imageUrl && (
                                    <button
                                      type="button"
                                      onClick={() => updateAchievement(i, 'imageUrl', '')}
                                      className="flex-none whitespace-nowrap text-xs font-bold text-red-500 hover:underline"
                                    >
                                      Remove photo
                                    </button>
                                  )}
                                </div>
                                <textarea
                                  value={a.description}
                                  onChange={(e) => updateAchievement(i, 'description', e.target.value)}
                                  placeholder="Why was this given to me?"
                                  rows={2}
                                  className={profileInputClasses}
                                />
                                {achievementImageStatus[i]?.error && (
                                  <p className="text-[0.65rem] text-red-600">{achievementImageStatus[i].error}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAchievement(i)}
                                className="flex-none self-start rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-ia-navy">Customer Reviews</h3>
                        <button
                          type="button"
                          onClick={addReview}
                          className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ia-blue shadow-sm hover:bg-ia-gold-tint/40"
                        >
                          + Add review
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Text reviews shown on your microsite — customer photo is optional. Each review saves on its
                        own with the Save button below it.
                      </p>
                      <div className="mt-4 space-y-3">
                        {reviews.map((r, i) => {
                          const isSaving = r._id ? reviewStatus.savingId === r._id : reviewStatus.savingId === 'new';
                          return (
                            <div key={r._id || `new-${i}`} className="rounded-xl border border-gray-200 bg-white p-3">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="h-14 w-14 flex-none overflow-hidden rounded-full bg-gray-100">
                                  {r.photoUrl ? (
                                    <img src={r.photoUrl} alt={r.clientName} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-gray-400">
                                      Photo
                                    </div>
                                  )}
                                </div>
                                <input
                                  value={r.clientName || ''}
                                  onChange={(e) => updateReviewLocal(i, 'clientName', e.target.value)}
                                  placeholder="Customer name"
                                  className={`sm:flex-1 ${profileInputClasses}`}
                                />
                                <label className="flex-none cursor-pointer whitespace-nowrap text-xs font-bold text-ia-blue hover:underline">
                                  {reviewPhotoStatus[i]?.uploading
                                    ? 'Uploading...'
                                    : r.photoUrl
                                      ? 'Replace photo'
                                      : 'Upload photo'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleReviewPhotoChange(i, e)}
                                    disabled={reviewPhotoStatus[i]?.uploading}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <input
                                  value={r.role || ''}
                                  onChange={(e) => updateReviewLocal(i, 'role', e.target.value)}
                                  placeholder="Role/city (optional)"
                                  className={`sm:flex-1 ${profileInputClasses}`}
                                />
                                <select
                                  value={r.rating ?? 5}
                                  onChange={(e) => updateReviewLocal(i, 'rating', Number(e.target.value))}
                                  className={`sm:w-32 ${profileInputClasses}`}
                                >
                                  {[5, 4, 3, 2, 1].map((n) => (
                                    <option key={n} value={n}>
                                      {n} star{n === 1 ? '' : 's'}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <textarea
                                value={r.message || ''}
                                onChange={(e) => updateReviewLocal(i, 'message', e.target.value)}
                                placeholder="What did they say?"
                                rows={2}
                                className={`mt-2.5 ${profileInputClasses}`}
                              />
                              {reviewPhotoStatus[i]?.error && (
                                <p className="mt-1 text-[0.65rem] text-red-600">{reviewPhotoStatus[i].error}</p>
                              )}
                              <div className="mt-2.5 flex items-center justify-end gap-2">
                                {!r._id && <span className="mr-auto text-[0.65rem] font-bold text-ia-blue">Unsaved</span>}
                                <button
                                  type="button"
                                  onClick={() => saveReview(i)}
                                  disabled={isSaving}
                                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ia-blue shadow-sm hover:bg-ia-gold-tint/40 disabled:opacity-50"
                                >
                                  {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeReview(i)}
                                  className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {reviewStatus.error && <p className="text-[0.65rem] text-red-600">{reviewStatus.error}</p>}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-ia-navy">FAQs</h3>
                        <button
                          type="button"
                          onClick={addFaq}
                          className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ia-blue shadow-sm hover:bg-ia-gold-tint/40"
                        >
                          + Add FAQ
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Common questions clients ask, shown as an accordion on your microsite.
                      </p>
                      <div className="mt-4 space-y-3">
                        {faqs.map((f, i) => (
                          <div key={i} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3">
                            <div className="flex-1 space-y-2">
                              <input
                                value={f.question}
                                onChange={(e) => updateFaq(i, 'question', e.target.value)}
                                placeholder="Question"
                                className={profileInputClasses}
                              />
                              <textarea
                                value={f.answer}
                                onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                                placeholder="Answer"
                                rows={2}
                                className={profileInputClasses}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFaq(i)}
                              className="flex-none self-start rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="sticky bottom-4 z-40 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 px-5 py-4 shadow-xl backdrop-blur-sm">
                      <div>
                        {profileStatus.success ? (
                          <p className="text-sm font-medium text-ia-green">{profileStatus.success}</p>
                        ) : profileStatus.error ? (
                          <p className="text-sm font-medium text-red-600">{profileStatus.error}</p>
                        ) : (
                          <p className="text-sm text-gray-500">Photos go live instantly — hit Save for text changes.</p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={profileStatus.saving}
                        className="w-full flex-1 rounded-xl bg-ia-blue px-6 py-3 text-sm font-bold text-white shadow-lg shadow-ia-gold-tint transition hover:-translate-y-0.5 hover:bg-ia-blue-soft disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto sm:flex-none"
                      >
                        {profileStatus.saving ? 'Saving...' : 'Save changes'}
                      </button>
                    </div>
                  </form>
                </div>
                </div>

                <div className="hidden xl:block">
                  <div className="sticky top-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                      <span className="text-xs font-bold text-gray-500">Live preview</span>
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[0.6rem] font-extrabold text-ia-green">
                        Unsaved edits included
                      </span>
                    </div>
                    {advisor?.slug ? (
                      <iframe
                        ref={previewIframeRef}
                        src={`/${advisor.slug}?preview=1`}
                        title="Microsite live preview"
                        className="h-[calc(100vh-8rem)] w-full border-0"
                      />
                    ) : (
                      <p className="p-5 text-xs text-gray-400">Save your profile once to enable the live preview.</p>
                    )}
                  </div>
                </div>
                </div>
              </section>
              )}

              {/* CONTENT LIBRARY */}
              {activeTab === 'library' && (
              <section id="library" className="mb-12 scroll-mt-24">
                <h2 className="mb-1.5 text-lg font-extrabold">Content Library</h2>
                <p className="mb-5 text-sm text-gray-500">
                  Previewing is always free. Credits are charged only when you share or download a piece of
                  content — {CREATIVE_COSTS.image} for an image, {CREATIVE_COSTS.carousel} for a carousel,{' '}
                  {CREATIVE_COSTS.reel} for a reel.
                </p>

                <div className="mb-10 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'image', label: 'Images' },
                      { key: 'carousel', label: 'Carousels' },
                      { key: 'reel', label: 'Reels' }
                    ].map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setCreativeType(t.key)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                          creativeType === t.key
                            ? 'bg-ia-navy text-white'
                            : 'bg-white text-gray-600 shadow-sm hover:bg-ia-gold-tint/40'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { key: 'life', label: 'Life' },
                      { key: 'health', label: 'Health' },
                      { key: 'general', label: 'General' }
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setCreativeCategory(cat.key)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                          creativeCategory === cat.key
                            ? 'bg-ia-blue text-white'
                            : 'bg-white text-gray-600 shadow-sm hover:bg-ia-gold-tint/40'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {creativesLoading ? (
                    <p className="mt-4 text-xs text-gray-400">Loading...</p>
                  ) : creatives.length === 0 ? (
                    <p className="mt-4 text-xs text-gray-400">Nothing in this folder yet.</p>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {creatives.map((creative) => {
                        const unlocked = isCreativeUnlocked(creative);
                        return (
                          <div key={creative._id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <div className="group relative">
                              {creative.format === 'pdf' ? (
                                <div
                                  onClick={() => setPreviewCreative(creative)}
                                  className="flex aspect-square w-full cursor-zoom-in flex-col items-center justify-center gap-2 bg-gray-50 text-red-500"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
                                    <path strokeLinecap="round" d="M15 4v4h4" />
                                  </svg>
                                  <span className="text-xs font-bold uppercase tracking-wide">PDF Carousel</span>
                                </div>
                              ) : creative.type === 'reel' ? (
                                <video
                                  src={creative.imageUrl}
                                  poster={creative.thumbnailUrl}
                                  muted
                                  playsInline
                                  onClick={() => setPreviewCreative(creative)}
                                  className="aspect-square w-full cursor-zoom-in object-cover"
                                />
                              ) : (
                                <img
                                  src={unlocked ? creative.imageUrl : watermarkedUrl(creative.imageUrl)}
                                  alt=""
                                  onClick={() => setPreviewCreative(creative)}
                                  className="aspect-square w-full cursor-zoom-in object-cover"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => setPreviewCreative(creative)}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100"
                              >
                                <span className="rounded-lg bg-black/70 px-3 py-1.5">👁 Click to Preview</span>
                              </button>
                              {unlocked && (
                                <span className="absolute inset-x-1.5 bottom-1.5 rounded-lg bg-black/70 px-2 py-1.5 text-center text-xs font-bold text-white">
                                  Unlocked ✓
                                </span>
                              )}
                            </div>
                            {(creative.title || creative.description) && (
                              <div className="p-2">
                                {creative.title && (
                                  <p className="truncate text-xs font-bold text-ia-navy">{creative.title}</p>
                                )}
                                {creative.description && (
                                  <p className="mt-0.5 line-clamp-2 text-[0.65rem] text-gray-500">
                                    {creative.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {previewCreative && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setPreviewCreative(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewCreative(null)}
                      className="absolute right-5 top-5 rounded-full bg-white/10 px-3 py-1.5 text-lg font-bold text-white hover:bg-white/20"
                    >
                      ✕
                    </button>

                    {/* Mimics how this will actually look once shared — image, headline
                        and caption together, like a real social post — instead of just a
                        bare image, so the advisor knows what they're posting. */}
                    <div
                      className="flex max-h-[88vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2.5 border-b border-gray-100 px-4 py-3">
                        {advisor?.photoUrl ? (
                          <img src={advisor.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-ia-gold-tint/40 text-xs font-bold text-ia-blue">
                            {advisor?.name?.[0] || 'A'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-ia-navy">{advisor?.name || 'Your Post'}</p>
                          <p className="text-[0.6rem] uppercase tracking-wide text-gray-400">Post preview</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        {previewCreative.format === 'pdf' ? (
                          <iframe
                            key={previewCreative._id}
                            src={`${previewCreative.imageUrl}#toolbar=1&navpanes=0`}
                            title={previewCreative.title || 'PDF preview'}
                            className="h-[70vh] w-full border-0 bg-gray-100"
                          />
                        ) : previewCreative.type === 'reel' ? (
                          <video
                            src={previewCreative.imageUrl}
                            poster={previewCreative.thumbnailUrl}
                            controls
                            autoPlay
                            muted
                            className="aspect-square w-full bg-black object-contain"
                          />
                        ) : (
                          <img
                            src={
                              isCreativeUnlocked(previewCreative)
                                ? previewCreative.imageUrl
                                : watermarkedUrl(previewCreative.imageUrl)
                            }
                            alt="Content preview"
                            className="block max-h-[85vh] w-full object-contain"
                          />
                        )}

                        {(previewCreative.title || previewCreative.description) && (
                          <div className="px-4 py-3">
                            {previewCreative.title && (
                              <p className="text-sm font-extrabold text-ia-navy">{previewCreative.title}</p>
                            )}
                            {previewCreative.description && (
                              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                                {previewCreative.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 border-t border-gray-100 px-4 py-3">
                        {!isCreativeUnlocked(previewCreative) && (
                          <span className="w-full text-[0.65rem] font-bold text-gray-500">
                            {CREATIVE_COSTS[previewCreative.type] || CREATIVE_COSTS.image} credits to share/download
                          </span>
                        )}
                        {['whatsapp', 'facebook', 'linkedin', 'instagram', 'youtube'].map((platform) => {
                          const Icon = socialIcons[platform];
                          return (
                            <button
                              key={platform}
                              type="button"
                              title={`Share to ${platform}`}
                              disabled={creativeAddStatus[previewCreative._id] === 'adding'}
                              onClick={() => handleCreativeShare(previewCreative, platform)}
                              className="h-9 w-9 flex-none overflow-hidden rounded-full shadow-sm transition hover:scale-110 disabled:opacity-50"
                            >
                              {Icon && <Icon className="h-9 w-9" />}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          disabled={creativeAddStatus[previewCreative._id] === 'adding'}
                          onClick={() => handleCreativeDownload(previewCreative)}
                          className="ml-auto flex-none rounded-xl bg-ia-blue px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-ia-blue-soft disabled:opacity-60"
                        >
                          {creativeAddStatus[previewCreative._id] === 'adding' ? 'Please wait...' : '⬇ Download'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              )}

              {/* MY LEADS */}
              {activeTab === 'leads' && (
              <section id="leads" className="mb-12 scroll-mt-24">
                <h2 className="mb-1.5 text-lg font-extrabold">My Leads</h2>
                <p className="mb-5 text-sm text-gray-500">
                  Enquiries from your microsite land here instantly. Follow up in one tap.
                </p>
                {leads.length === 0 ? (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-10 text-center text-sm text-gray-500">
                    No leads yet — enquiries from your website&apos;s contact form will show up here.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left text-[0.7rem] font-extrabold uppercase tracking-wide text-gray-500">
                          <th className="px-5 py-3.5">Lead</th>
                          <th className="px-5 py-3.5">Message</th>
                          <th className="px-5 py-3.5">Received</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <tr key={lead._id} className="border-t border-gray-100 bg-white">
                            <td className="px-5 py-4">
                              <span className="block font-semibold">{lead.name}</span>
                              {lead.phone && <span className="mt-0.5 block text-xs text-gray-400">{lead.phone}</span>}
                            </td>
                            <td className="max-w-[220px] truncate px-5 py-4 text-gray-600">{lead.message || '—'}</td>
                            <td className="px-5 py-4 text-gray-500">{formatDate(lead.createdAt)}</td>
                            <td className="px-5 py-4">
                              <select
                                value={lead.status}
                                onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                                className={`rounded-full border-none px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide outline-none ${statusStyles[lead.status]}`}
                              >
                                <option value="new">New</option>
                                <option value="follow-up">Follow-up</option>
                                <option value="converted">Converted</option>
                              </select>
                            </td>
                            <td className="px-5 py-4">
                              {lead.phone && (
                                <div className="flex gap-2">
                                  <a
                                    href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="WhatsApp"
                                    className="grid h-9 w-9 place-items-center rounded-lg bg-[#25D366] text-white transition hover:scale-110"
                                  >
                                    💬
                                  </a>
                                  <a
                                    href={`tel:${lead.phone}`}
                                    title="Call"
                                    className="grid h-9 w-9 place-items-center rounded-lg bg-ia-blue text-white transition hover:scale-110"
                                  >
                                    📞
                                  </a>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              )}

              {/* RECHARGE */}
              {activeTab === 'recharge' && (
              <section id="recharge" className="mb-4 scroll-mt-24">
                <h2 className="mb-1.5 text-lg font-extrabold">Recharge Credits</h2>
                <p className="mb-5 text-sm text-gray-500">
                  An image costs 10 credits, a carousel 20 credits and a reel 30 credits — charged only when you
                  share or download it, never before.
                </p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {pricingPlans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`relative rounded-2xl border p-7 text-center shadow-sm transition-transform duration-300 hover:-translate-y-1.5 ${
                        plan.popular ? 'border-ia-blue bg-ia-gold-tint/40' : 'border-gray-100 bg-white'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ia-blue px-4 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-white shadow-lg shadow-ia-gold-tint">
                          Most Popular
                        </span>
                      )}
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-500">{plan.name}</h4>
                      <div className="mt-2 text-3xl font-extrabold">{plan.amount}</div>
                      <div className="mt-1.5 text-sm font-bold text-ia-green">
                        {plan.credits} {plan.bonus && <span className="text-ia-blue">{plan.bonus}</span>}
                      </div>
                      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-gray-500">{plan.features}</p>
                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            `Recharge for the ${plan.name} plan is launching soon — payments aren't live yet.`,
                            true
                          )
                        }
                        className="mt-6 w-full rounded-xl bg-ia-blue py-2.5 text-sm font-bold text-white shadow-lg shadow-ia-gold-tint transition hover:-translate-y-0.5 hover:bg-ia-blue-soft"
                      >
                        Recharge {plan.amount}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-gray-200 bg-white p-5">
                  <div>
                    <h4 className="text-sm font-extrabold text-ia-navy">{extraCreditsPack.name}</h4>
                    <p className="mt-1 text-xs text-gray-500">
                      Running low? Top up {extraCreditsPack.credits} for {extraCreditsPack.amount}, any time.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast('Extra credits top-up is launching soon — payments aren\'t live yet.', true)
                    }
                    className="flex-none rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-ia-navy transition hover:bg-gray-200"
                  >
                    Buy {extraCreditsPack.amount}
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center text-sm leading-relaxed text-gray-600">
                  <b className="text-ia-navy">Want your own domain (www.yourname.com)?</b> One-time ₹6,000 —
                  registration, DNS, SSL and connection fully handled. Contact us to request it.
                </div>
              </section>
              )}
            </>
          )}
        </main>
      </div>

      <footer className="bg-ia-navy px-[4vw] py-7 text-center text-xs leading-relaxed text-white/40">
        InsuranceAdvise.in is a technology platform. Content is published only on your instruction, to your own
        connected accounts, under your name. You are responsible for reviewing content before publishing, per your
        advisor agreement and applicable IRDAI regulations.
        <br />
        <Link href="/" className="font-bold text-ia-blue-soft hover:underline">
          Platform Home
        </Link>
        {advisor && (
          <>
            {' '}
            ·{' '}
            <a
              href={`https://${siteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-ia-blue-soft hover:underline"
            >
              View My Microsite
            </a>
          </>
        )}
      </footer>

      {/* TOAST */}
      <div
        className={`fixed bottom-6 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-3 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-2xl transition-all duration-300 ${
          toast.show ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        } ${toast.warn ? 'bg-gradient-to-br from-red-600 to-red-500' : 'bg-gradient-to-br from-ia-green to-ia-green-soft'}`}
      >
        {toast.msg}
      </div>

      <ChatWidget
        context="dashboard"
        onAction={handleChatAction}
        advisorContext={{
          name: profileForm.name,
          city: profileForm.city,
          specialization: specializationTags,
          services: serviceOfferings.map((o) => o.title).filter(Boolean),
          yearsExperience: profileForm.yearsExperience,
          credentials: credentialTags,
          existingBio: profileForm.bio,
          existingAboutMe: profileForm.aboutMe,
          existingVision: profileForm.vision,
          existingMission: profileForm.mission
        }}
      />
    </div>
  );
}
