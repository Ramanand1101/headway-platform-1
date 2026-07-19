'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Logo from '../../../components/Logo';
import { micrositeThemes } from '../../../lib/micrositeThemes';
import { decodeToken } from '../../../lib/auth';
import { micrositeCopyDefaults } from '../../../lib/advisorMicrositeCopyDefaults';

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
function SocialIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
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
  { key: 'social', label: 'Social Accounts', Icon: SocialIcon },
  { key: 'library', label: 'Content Library', Icon: LibraryIcon },
  { key: 'leads', label: 'My Leads', Icon: LeadsIcon },
  { key: 'recharge', label: 'Recharge Credits', Icon: RechargeIcon }
];

const profileInputClasses =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-ia-navy outline-none ring-2 ring-transparent transition-all focus:border-ia-blue focus:ring-ia-blue/10';
const profileLabelClasses = 'text-sm font-semibold text-gray-700';

const pricingPlans = [
  { name: 'Starter', amount: '₹500', credits: '50 Credits · 5 posts' },
  { name: 'Growth', amount: '₹1,000', credits: '110 Credits · 11 posts', bonus: '(+10%)', popular: true },
  { name: 'Authority', amount: '₹2,000', credits: '240 Credits · 24 posts', bonus: '(+20%)' }
];

const socialPlatforms = [
  { key: 'instagram', name: 'Instagram', desc: 'Reels, carousels and posts to your feed', color: 'bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600', available: true },
  { key: 'facebook', name: 'Facebook', desc: 'Publish straight to your Facebook Page', color: 'bg-[#1877F2]', available: true },
  { key: 'linkedin', name: 'LinkedIn', desc: 'Build authority with professionals', color: 'bg-[#0A66C2]', available: false },
  { key: 'youtube', name: 'YouTube', desc: 'Publish Shorts, grow with video', color: 'bg-[#FF0000]', available: false }
];

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

const tabKeys = ['overview', 'website', 'profile', 'social', 'library', 'leads', 'recharge'];

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
    specialization: '',
    services: '',
    email: '',
    officeAddress: '',
    irdaiLicenseNumber: '',
    yearsExperience: '',
    credentials: '',
    vision: '',
    mission: '',
    missionPillars: '',
    companiesWorkedWith: '',
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
  const [achievements, setAchievements] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [profileStatus, setProfileStatus] = useState({ saving: false, error: '', success: '' });
  const [slugEditorOpen, setSlugEditorOpen] = useState(false);
  const [slugInput, setSlugInput] = useState('');
  const [slugCheck, setSlugCheck] = useState({ checking: false, available: null, reason: '', suggestions: [] });
  const [slugSaveStatus, setSlugSaveStatus] = useState({ saving: false, error: '', success: '' });
  const [photoStatus, setPhotoStatus] = useState({ uploading: false, error: '' });
  const [micrositeImages, setMicrositeImages] = useState({});
  const [micrositeImageStatus, setMicrositeImageStatus] = useState({});
  const [libraryImages, setLibraryImages] = useState([]);
  const [libraryPreviewUrl, setLibraryPreviewUrl] = useState(null);
  const [libraryUploadStatus, setLibraryUploadStatus] = useState({
    uploading: false,
    error: '',
    progress: '',
    percent: 0
  });
  const previewIframeRef = useRef(null);
  const [previewReadyTick, setPreviewReadyTick] = useState(0);

  const [igMedia, setIgMedia] = useState([]);
  const [igInsights, setIgInsights] = useState([]);
  const [igDataErrors, setIgDataErrors] = useState({ media: '', insights: '', conversations: '' });
  const [igPublishForm, setIgPublishForm] = useState({ caption: '', file: null });
  const [igPublishStatus, setIgPublishStatus] = useState({ posting: false, error: '' });
  const [igComments, setIgComments] = useState({});
  const [igCommentsOpenFor, setIgCommentsOpenFor] = useState(null);
  const [igReplyDrafts, setIgReplyDrafts] = useState({});
  const [igConversations, setIgConversations] = useState([]);
  const [igMessages, setIgMessages] = useState({});
  const [igConversationOpenFor, setIgConversationOpenFor] = useState(null);
  const [igMessageDrafts, setIgMessageDrafts] = useState({});

  const [fbPosts, setFbPosts] = useState([]);
  const [fbInsights, setFbInsights] = useState([]);
  const [fbPublishForm, setFbPublishForm] = useState({ caption: '', file: null });
  const [fbPublishStatus, setFbPublishStatus] = useState({ posting: false, error: '' });
  const [fbComments, setFbComments] = useState({});
  const [fbCommentsOpenFor, setFbCommentsOpenFor] = useState(null);
  const [fbReplyDrafts, setFbReplyDrafts] = useState({});
  const [fbConversations, setFbConversations] = useState([]);
  const [fbMessages, setFbMessages] = useState({});
  const [fbConversationOpenFor, setFbConversationOpenFor] = useState(null);
  const [fbMessageDrafts, setFbMessageDrafts] = useState({});

  function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, ...extra };
  }

  function loadAll() {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/me`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setAdvisor(data.advisor);
        if (data.advisor) {
          setProfileForm({
            name: data.advisor.name || '',
            city: data.advisor.city || '',
            bio: data.advisor.bio || '',
            aboutMe: data.advisor.aboutMe || '',
            contactNumber: data.advisor.contactNumber || '',
            whatsappNumber: data.advisor.whatsappNumber || '',
            specialization: (data.advisor.specialization || []).join(', '),
            services: (data.advisor.services || []).join(', '),
            email: data.advisor.email || '',
            officeAddress: data.advisor.officeAddress || '',
            irdaiLicenseNumber: data.advisor.irdaiLicenseNumber || '',
            yearsExperience: data.advisor.yearsExperience || '',
            credentials: (data.advisor.credentials || []).join(', '),
            vision: data.advisor.vision || '',
            mission: data.advisor.mission || '',
            missionPillars: (data.advisor.missionPillars || []).join(', '),
            companiesWorkedWith: (data.advisor.companiesWorkedWith || []).join(', '),
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
          setMicrositeImages(data.advisor.micrositeImages || {});
          setMicrositeContentForm(data.advisor.micrositeContent || {});
          setLibraryImages(data.advisor.contentLibraryImages || []);
          setServiceOfferings(
            data.advisor.serviceOfferings?.length ? data.advisor.serviceOfferings : []
          );
          setAchievements(data.advisor.achievements || []);
          setFaqs(data.advisor.faqs || []);
        }
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/mine`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads || []);
        setLoading(false);
      });
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
    if (advisor?.instagram?.connected) {
      loadInstagramData();
    }
  }, [advisor?.instagram?.connected]);

  useEffect(() => {
    if (advisor?.facebook?.connected) {
      loadFacebookData();
    }
  }, [advisor?.facebook?.connected]);

  useEffect(() => {
    if (!libraryPreviewUrl) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setLibraryPreviewUrl(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [libraryPreviewUrl]);

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
      specialization: profileForm.specialization.split(',').map((s) => s.trim()).filter(Boolean),
      services: profileForm.services.split(',').map((s) => s.trim()).filter(Boolean),
      email: profileForm.email,
      officeAddress: profileForm.officeAddress,
      irdaiLicenseNumber: profileForm.irdaiLicenseNumber,
      yearsExperience: profileForm.yearsExperience,
      credentials: profileForm.credentials.split(',').map((s) => s.trim()).filter(Boolean),
      vision: profileForm.vision,
      mission: profileForm.mission,
      missionPillars: profileForm.missionPillars.split(',').map((s) => s.trim()).filter(Boolean),
      companiesWorkedWith: profileForm.companiesWorkedWith.split(',').map((s) => s.trim()).filter(Boolean),
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
      achievements: achievements.filter((a) => a.value.trim() || a.label.trim()),
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
  }, [previewReadyTick, profileForm, serviceOfferings, achievements, faqs, micrositeImages, micrositeContentForm, advisor]);

  function updateProfileField(field, value) {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
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

  function addAchievement() {
    setAchievements((prev) => [...prev, { value: '', label: '' }]);
  }
  function updateAchievement(i, field, value) {
    setAchievements((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  }
  function removeAchievement(i) {
    setAchievements((prev) => prev.filter((_, idx) => idx !== i));
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

  const LIBRARY_MAX_DIMENSION = 1920; // longest side, in px — plenty for reels/carousels
  const LIBRARY_TARGET_BYTES = 1.5 * 1024 * 1024; // aim to land comfortably under the 4MB server limit

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  }

  function canvasToBlob(canvas, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  }

  // Resizes/re-encodes a photo client-side before upload so large camera
  // photos don't hit the server's per-file size limit or eat mobile data.
  // Animated GIFs are left untouched (canvas would flatten them to one frame).
  async function compressImageForLibrary(file) {
    if (file.type === 'image/gif' || file.size <= LIBRARY_TARGET_BYTES) return file;

    try {
      const img = await loadImageFromFile(file);
      const scale = Math.min(1, LIBRARY_MAX_DIMENSION / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

      let quality = 0.82;
      let blob = await canvasToBlob(canvas, quality);
      while (blob && blob.size > LIBRARY_TARGET_BYTES && quality > 0.4) {
        quality -= 0.12;
        blob = await canvasToBlob(canvas, quality);
      }

      if (!blob || blob.size >= file.size) return file;

      const jpgName = file.name.replace(/\.\w+$/, '') + '.jpg';
      return new File([blob], jpgName, { type: 'image/jpeg' });
    } catch {
      return file; // couldn't decode (e.g. unsupported format) — fall back to the original
    }
  }

  // fetch() has no upload-progress event, so byte-level progress needs XHR.
  function uploadFileWithProgress(url, formData, headers, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(event.loaded);
      };
      xhr.onload = () => {
        let data = {};
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          // non-JSON error body (e.g. a platform-level 413); fall through with data = {}
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.error || `Upload failed (${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });
  }

  async function handleLibraryImagesChange(e) {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;

    setLibraryUploadStatus({ uploading: true, error: '', progress: 'Preparing photos...', percent: 0 });

    const files = [];
    for (let i = 0; i < rawFiles.length; i += 1) {
      files.push(await compressImageForLibrary(rawFiles[i]));
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    let bytesDoneBeforeCurrent = 0;

    // Uploaded one at a time (not batched into a single request) so a
    // multi-photo selection never exceeds the hosting platform's per-request
    // body size limit, regardless of how many files the advisor picks.
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const formData = new FormData();
      formData.append('images', file);

      const reportProgress = (loaded) => {
        const percent = Math.min(100, Math.round(((bytesDoneBeforeCurrent + loaded) / totalBytes) * 100));
        setLibraryUploadStatus({
          uploading: true,
          error: '',
          percent,
          progress: `Uploading ${i + 1} of ${files.length} — ${percent}% done, ${100 - percent}% left`
        });
      };
      reportProgress(0);

      try {
        const data = await uploadFileWithProgress(
          `${process.env.NEXT_PUBLIC_API_URL}/api/advisor/content-library`,
          formData,
          authHeaders(),
          reportProgress
        );
        setLibraryImages(data.advisor.contentLibraryImages || []);
      } catch (err) {
        setLibraryUploadStatus({
          uploading: false,
          error: err.message || `Could not upload ${file.name}`,
          progress: '',
          percent: 0
        });
        e.target.value = '';
        return;
      }

      bytesDoneBeforeCurrent += file.size;
    }

    setLibraryUploadStatus({ uploading: false, error: '', progress: '', percent: 0 });
    e.target.value = '';
  }

  async function handleLibraryImageDelete(url) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/content-library`, {
      method: 'DELETE',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (res.ok) {
      setLibraryImages(data.advisor.contentLibraryImages || []);
    }
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
        specialization: profileForm.specialization
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        services: profileForm.services
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        email: profileForm.email.trim(),
        officeAddress: profileForm.officeAddress.trim(),
        irdaiLicenseNumber: profileForm.irdaiLicenseNumber.trim(),
        yearsExperience: profileForm.yearsExperience.trim(),
        credentials: profileForm.credentials
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        vision: profileForm.vision.trim(),
        mission: profileForm.mission.trim(),
        missionPillars: profileForm.missionPillars
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        companiesWorkedWith: profileForm.companiesWorkedWith
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
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
        achievements: achievements.filter((a) => a.value.trim() || a.label.trim()),
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

  const metricLabels = {
    reach: 'Reach',
    profile_views: 'Profile views',
    page_impressions: 'Page impressions',
    page_engaged_users: 'Engaged users'
  };
  function metricLabel(name) {
    return metricLabels[name] || name;
  }

  function connectInstagram() {
    if (!process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID) {
      showToast('Instagram connect is being configured — check back soon.', true);
      return;
    }
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID,
      redirect_uri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI,
      scope:
        'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights',
      response_type: 'code'
    });
    window.location.href = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  }

  function connectFacebook() {
    if (!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
      showToast('Facebook connect is being configured — check back soon.', true);
      return;
    }
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
      redirect_uri: process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI,
      scope:
        'pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,pages_manage_metadata,pages_messaging',
      response_type: 'code'
    });
    window.location.href = `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
  }

  async function disconnectFacebook() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/disconnect`, {
      method: 'POST',
      headers: authHeaders()
    });
    const data = await res.json();
    if (res.ok) {
      setAdvisor(data.advisor);
      setFbPosts([]);
      setFbInsights([]);
      showToast('Facebook disconnected.');
    }
  }

  async function disconnectInstagram() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/instagram/disconnect`, {
      method: 'POST',
      headers: authHeaders()
    });
    const data = await res.json();
    if (res.ok) {
      setAdvisor(data.advisor);
      setIgMedia([]);
      setIgInsights([]);
      showToast('Instagram disconnected.');
    }
  }

  function loadInstagramData() {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/instagram/media`, { headers: authHeaders() })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setIgMedia(data.media || []);
        setIgDataErrors((prev) => ({ ...prev, media: ok ? '' : data.error || 'Could not load posts' }));
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/instagram/insights`, { headers: authHeaders() })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setIgInsights(data.insights || []);
        setIgDataErrors((prev) => ({ ...prev, insights: ok ? data.error || '' : data.error || 'Could not load insights' }));
      });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/instagram/conversations`, { headers: authHeaders() })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        setIgConversations(data.conversations || []);
        setIgDataErrors((prev) => ({
          ...prev,
          conversations: ok ? '' : data.error || 'Could not load conversations'
        }));
      });
  }

  async function handleIgPublish(e) {
    e.preventDefault();
    if (!igPublishForm.file) return;

    setIgPublishStatus({ posting: true, error: '' });

    const formData = new FormData();
    formData.append('image', igPublishForm.file);
    formData.append('caption', igPublishForm.caption);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/instagram/publish`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();

    if (!res.ok) {
      setIgPublishStatus({ posting: false, error: data.error || 'Could not publish post' });
      return;
    }

    setIgPublishStatus({ posting: false, error: '' });
    setIgPublishForm({ caption: '', file: null });
    showToast('Published to Instagram.');
    loadInstagramData();
  }

  function toggleComments(mediaId) {
    if (igCommentsOpenFor === mediaId) {
      setIgCommentsOpenFor(null);
      return;
    }
    setIgCommentsOpenFor(mediaId);
    if (!igComments[mediaId]) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/instagram/media/${mediaId}/comments`, {
        headers: authHeaders()
      })
        .then((res) => res.json())
        .then((data) => setIgComments((prev) => ({ ...prev, [mediaId]: data.comments || [] })));
    }
  }

  async function handleReplySubmit(commentId) {
    const message = (igReplyDrafts[commentId] || '').trim();
    if (!message) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/advisor/instagram/comments/${commentId}/reply`,
      {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ message })
      }
    );

    if (res.ok) {
      setIgReplyDrafts((d) => ({ ...d, [commentId]: '' }));
      showToast('Reply sent.');
    } else {
      showToast('Could not send reply.', true);
    }
  }

  function toggleConversation(conversationId) {
    if (igConversationOpenFor === conversationId) {
      setIgConversationOpenFor(null);
      return;
    }
    setIgConversationOpenFor(conversationId);
    if (!igMessages[conversationId]) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/instagram/conversations/${conversationId}/messages`, {
        headers: authHeaders()
      })
        .then((res) => res.json())
        .then((data) => setIgMessages((prev) => ({ ...prev, [conversationId]: data.messages || [] })));
    }
  }

  async function handleSendMessage(conversationId, recipientId) {
    const message = (igMessageDrafts[conversationId] || '').trim();
    if (!message || !recipientId) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/advisor/instagram/conversations/${conversationId}/reply`,
      {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ recipientId, message })
      }
    );

    if (res.ok) {
      setIgMessageDrafts((d) => ({ ...d, [conversationId]: '' }));
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/instagram/conversations/${conversationId}/messages`, {
        headers: authHeaders()
      })
        .then((r) => r.json())
        .then((data) => setIgMessages((prev) => ({ ...prev, [conversationId]: data.messages || [] })));
      showToast('Message sent.');
    } else {
      showToast('Could not send message.', true);
    }
  }

  function loadFacebookData() {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/posts`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setFbPosts(data.posts || []));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/insights`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setFbInsights(data.insights || []));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/conversations`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setFbConversations(data.conversations || []));
  }

  async function handleFbPublish(e) {
    e.preventDefault();
    if (!fbPublishForm.file) return;

    setFbPublishStatus({ posting: true, error: '' });

    const formData = new FormData();
    formData.append('image', fbPublishForm.file);
    formData.append('caption', fbPublishForm.caption);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/publish`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();

    if (!res.ok) {
      setFbPublishStatus({ posting: false, error: data.error || 'Could not publish post' });
      return;
    }

    setFbPublishStatus({ posting: false, error: '' });
    setFbPublishForm({ caption: '', file: null });
    showToast('Published to Facebook.');
    loadFacebookData();
  }

  function toggleFbComments(postId) {
    if (fbCommentsOpenFor === postId) {
      setFbCommentsOpenFor(null);
      return;
    }
    setFbCommentsOpenFor(postId);
    if (!fbComments[postId]) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/posts/${postId}/comments`, {
        headers: authHeaders()
      })
        .then((res) => res.json())
        .then((data) => setFbComments((prev) => ({ ...prev, [postId]: data.comments || [] })));
    }
  }

  async function handleFbReplySubmit(commentId) {
    const message = (fbReplyDrafts[commentId] || '').trim();
    if (!message) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/comments/${commentId}/reply`,
      {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ message })
      }
    );

    if (res.ok) {
      setFbReplyDrafts((d) => ({ ...d, [commentId]: '' }));
      showToast('Reply sent.');
    } else {
      showToast('Could not send reply.', true);
    }
  }

  function toggleFbConversation(conversationId) {
    if (fbConversationOpenFor === conversationId) {
      setFbConversationOpenFor(null);
      return;
    }
    setFbConversationOpenFor(conversationId);
    if (!fbMessages[conversationId]) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/conversations/${conversationId}/messages`, {
        headers: authHeaders()
      })
        .then((res) => res.json())
        .then((data) => setFbMessages((prev) => ({ ...prev, [conversationId]: data.messages || [] })));
    }
  }

  async function handleFbSendMessage(conversationId, recipientId) {
    const message = (fbMessageDrafts[conversationId] || '').trim();
    if (!message || !recipientId) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/conversations/${conversationId}/reply`,
      {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ recipientId, message })
      }
    );

    if (res.ok) {
      setFbMessageDrafts((d) => ({ ...d, [conversationId]: '' }));
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/conversations/${conversationId}/messages`, {
        headers: authHeaders()
      })
        .then((r) => r.json())
        .then((data) => setFbMessages((prev) => ({ ...prev, [conversationId]: data.messages || [] })));
      showToast('Message sent.');
    } else {
      showToast('Could not send message.', true);
    }
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
                    <h3 className="text-sm font-extrabold text-ia-navy">Microsite photos</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Optional — each section falls back to your profile photo above until you upload its own.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        { key: 'hero', label: 'Hero banner', size: '1200×900px, 4:3 landscape' },
                        { key: 'about', label: 'About Me photo', size: '1000×1000px, square' },
                        { key: 'achievements', label: 'Achievements photo', size: '1200×900px, 4:3 landscape' }
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
                          className={`mt-1.5 ${profileInputClasses}`}
                        />
                      </div>
                      <div>
                        <label className={profileLabelClasses}>WhatsApp number</label>
                        <input
                          value={profileForm.whatsappNumber}
                          onChange={(e) => updateProfileField('whatsappNumber', e.target.value)}
                          className={`mt-1.5 ${profileInputClasses}`}
                        />
                      </div>
                    </div>

                    <div id="field-bio" className="scroll-mt-24">
                      <label className={profileLabelClasses}>Short bio (shown next to your name on the homepage)</label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => updateProfileField('bio', e.target.value)}
                        rows={3}
                        className={`mt-1.5 ${profileInputClasses} ${
                          highlightedField === 'field-bio' ? 'border-ia-blue ring-2 ring-ia-blue/40' : ''
                        }`}
                      />
                    </div>

                    <div id="field-aboutMe" className="scroll-mt-24">
                      <label className={profileLabelClasses}>About Me (the longer story shown in your About section)</label>
                      <textarea
                        value={profileForm.aboutMe}
                        onChange={(e) => updateProfileField('aboutMe', e.target.value)}
                        rows={5}
                        className={`mt-1.5 ${profileInputClasses} ${
                          highlightedField === 'field-aboutMe' ? 'border-ia-blue ring-2 ring-ia-blue/40' : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label className={profileLabelClasses}>Specialization (comma separated)</label>
                      <input
                        value={profileForm.specialization}
                        onChange={(e) => updateProfileField('specialization', e.target.value)}
                        className={`mt-1.5 ${profileInputClasses}`}
                      />
                    </div>

                    <div>
                      <label className={profileLabelClasses}>Services (comma separated)</label>
                      <input
                        value={profileForm.services}
                        onChange={(e) => updateProfileField('services', e.target.value)}
                        className={`mt-1.5 ${profileInputClasses}`}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={profileLabelClasses}>Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => updateProfileField('email', e.target.value)}
                          className={`mt-1.5 ${profileInputClasses}`}
                        />
                      </div>
                      <div>
                        <label className={profileLabelClasses}>IRDAI license number</label>
                        <input
                          value={profileForm.irdaiLicenseNumber}
                          onChange={(e) => updateProfileField('irdaiLicenseNumber', e.target.value)}
                          className={`mt-1.5 ${profileInputClasses}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={profileLabelClasses}>Office address</label>
                      <input
                        value={profileForm.officeAddress}
                        onChange={(e) => updateProfileField('officeAddress', e.target.value)}
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
                        <label className={profileLabelClasses}>Credential badges (comma separated)</label>
                        <input
                          value={profileForm.credentials}
                          onChange={(e) => updateProfileField('credentials', e.target.value)}
                          placeholder="IRDAI Licensed, MDRT Member"
                          className={`mt-1.5 ${profileInputClasses}`}
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

                    <div>
                      <label className={profileLabelClasses}>Companies worked with (comma separated)</label>
                      <input
                        value={profileForm.companiesWorkedWith}
                        onChange={(e) => updateProfileField('companiesWorkedWith', e.target.value)}
                        placeholder="LIC of India, HDFC Life, ICICI Prudential"
                        className={`mt-1.5 ${profileInputClasses}`}
                      />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <h3 className="text-sm font-extrabold text-ia-navy">Social links</h3>
                      <div className="mt-4 grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className={profileLabelClasses}>LinkedIn URL</label>
                          <input
                            value={profileForm.linkedin}
                            onChange={(e) => updateProfileField('linkedin', e.target.value)}
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>Facebook URL</label>
                          <input
                            value={profileForm.facebook}
                            onChange={(e) => updateProfileField('facebook', e.target.value)}
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>YouTube URL</label>
                          <input
                            value={profileForm.youtube}
                            onChange={(e) => updateProfileField('youtube', e.target.value)}
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>Instagram URL</label>
                          <input
                            value={profileForm.instagramUrl}
                            onChange={(e) => updateProfileField('instagramUrl', e.target.value)}
                            placeholder="Optional — separate from Connect Instagram above"
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
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>"Write a review" link</label>
                          <input
                            value={profileForm.gmbReviewLink}
                            onChange={(e) => updateProfileField('gmbReviewLink', e.target.value)}
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                        <div>
                          <label className={profileLabelClasses}>Google Maps link</label>
                          <input
                            value={profileForm.gmbMapsLink}
                            onChange={(e) => updateProfileField('gmbMapsLink', e.target.value)}
                            className={`mt-1.5 ${profileInputClasses}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-ia-navy">Service cards</h3>
                        <button
                          type="button"
                          onClick={addServiceOffering}
                          className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ia-blue shadow-sm hover:bg-ia-gold-tint/40"
                        >
                          + Add service
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Shown as cards on your microsite. Leave empty to just show the plain services list above.
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
                        Key stat cards, e.g. value "600+", label "Families Protected".
                      </p>
                      <div className="mt-4 space-y-3">
                        {achievements.map((a, i) => (
                          <div
                            key={i}
                            className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-3"
                          >
                            <input
                              value={a.value}
                              onChange={(e) => updateAchievement(i, 'value', e.target.value)}
                              placeholder="Value, e.g. 600+"
                              className={`sm:flex-1 ${profileInputClasses}`}
                            />
                            <input
                              value={a.label}
                              onChange={(e) => updateAchievement(i, 'label', e.target.value)}
                              placeholder="Label, e.g. Families Protected"
                              className={`sm:flex-1 ${profileInputClasses}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeAchievement(i)}
                              className="flex-none self-end rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100 sm:self-auto"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
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

              {/* SOCIAL ACCOUNTS */}
              {activeTab === 'social' && (
              <section id="social" className="mb-12 scroll-mt-24">
                <h2 className="mb-1.5 text-lg font-extrabold">Social Accounts</h2>
                <p className="mb-5 text-sm text-gray-500">
                  Connect once, publish forever. Publishing happens only on your instruction.
                </p>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {socialPlatforms.map((p) => {
                    const isInstagram = p.key === 'instagram';
                    const isFacebook = p.key === 'facebook';
                    const connected =
                      (isInstagram && advisor?.instagram?.connected) ||
                      (isFacebook && advisor?.facebook?.connected);
                    return (
                      <div
                        key={p.key}
                        className="relative rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-transform duration-300 hover:-translate-y-1.5"
                      >
                        <span
                          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[0.6rem] font-extrabold tracking-wide ${
                            connected ? 'bg-green-50 text-ia-green' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {connected ? 'CONNECTED' : p.available ? 'SETUP NEEDED' : 'COMING SOON'}
                        </span>
                        <div className={`mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl text-2xl text-white shadow-lg ${p.color}`}>
                          {p.key === 'instagram' && '📷'}
                          {p.key === 'facebook' && 'f'}
                          {p.key === 'linkedin' && 'in'}
                          {p.key === 'youtube' && '▶'}
                        </div>
                        <h4 className="text-sm font-bold">{p.name}</h4>
                        <p className="mt-1 min-h-[32px] text-xs text-gray-500">
                          {connected
                            ? isInstagram
                              ? `@${advisor.instagram.username}`
                              : advisor.facebook.pageName
                            : p.desc}
                        </p>
                        {isInstagram || isFacebook ? (
                          connected ? (
                            <button
                              type="button"
                              onClick={isInstagram ? disconnectInstagram : disconnectFacebook}
                              className="mt-3.5 w-full rounded-xl bg-red-50 py-2.5 text-xs font-bold text-red-500 transition hover:bg-red-100"
                            >
                              Disconnect
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={isInstagram ? connectInstagram : connectFacebook}
                              className="mt-3.5 w-full rounded-xl bg-ia-blue py-2.5 text-xs font-bold text-white transition hover:bg-ia-blue-soft"
                            >
                              Connect {p.name}
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => showToast(`${p.name} publishing is coming soon.`, true)}
                            className="mt-3.5 w-full rounded-xl bg-gray-100 py-2.5 text-xs font-bold transition hover:bg-gray-200"
                          >
                            Notify Me
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {advisor?.instagram?.connected && (
                  <div className="mt-8 space-y-6">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-sm font-extrabold">Insights</h3>
                      {igDataErrors.insights && (
                        <p className="mb-3 text-xs text-red-500">{igDataErrors.insights}</p>
                      )}
                      {igInsights.length === 0 ? (
                        <p className="text-xs text-gray-400">No insights available yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                          {igInsights.map((metric) => (
                            <div key={metric.name} className="rounded-xl bg-gray-50 p-4 text-center">
                              <p className="text-2xl font-extrabold text-ia-navy">
                                {metric.values?.[0]?.value ?? '—'}
                              </p>
                              <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-gray-400">
                                {metricLabel(metric.name)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-sm font-extrabold">New Instagram Post</h3>
                      <form onSubmit={handleIgPublish} className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setIgPublishForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                          className="block w-full text-xs text-gray-500"
                        />
                        <p className="text-[0.65rem] text-gray-400">Recommended size: 1080×1080px, square (Instagram feed format)</p>
                        <textarea
                          value={igPublishForm.caption}
                          onChange={(e) => setIgPublishForm((f) => ({ ...f, caption: e.target.value }))}
                          placeholder="Write a caption..."
                          rows={3}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-ia-blue"
                        />
                        <button
                          type="submit"
                          disabled={igPublishStatus.posting || !igPublishForm.file}
                          className="rounded-xl bg-ia-blue px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60"
                        >
                          {igPublishStatus.posting ? 'Publishing...' : 'Publish to Instagram'}
                        </button>
                        {igPublishStatus.error && <p className="text-xs text-red-500">{igPublishStatus.error}</p>}
                      </form>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-sm font-extrabold">Recent Posts</h3>
                      {igDataErrors.media && <p className="mb-3 text-xs text-red-500">{igDataErrors.media}</p>}
                      {igMedia.length === 0 ? (
                        <p className="text-xs text-gray-400">No posts yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                          {igMedia.map((m) => (
                            <div key={m.id} className="overflow-hidden rounded-xl border border-gray-100">
                              {m.media_url && (
                                <img
                                  src={m.thumbnail_url || m.media_url}
                                  alt=""
                                  className="aspect-square w-full object-cover"
                                />
                              )}
                              <div className="p-3">
                                <p className="line-clamp-2 text-xs text-gray-600">{m.caption || '(no caption)'}</p>
                                <p className="mt-1.5 text-[0.65rem] text-gray-400">
                                  ❤️ {m.like_count ?? 0} · 💬 {m.comments_count ?? 0}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => toggleComments(m.id)}
                                  className="mt-2 w-full rounded-lg bg-gray-100 px-3 py-1.5 text-[0.65rem] font-bold hover:bg-gray-200"
                                >
                                  {igCommentsOpenFor === m.id ? 'Hide comments' : 'View comments'}
                                </button>

                                {igCommentsOpenFor === m.id && (
                                  <div className="mt-3 space-y-2.5 border-t border-gray-100 pt-3">
                                    {(igComments[m.id] || []).length === 0 ? (
                                      <p className="text-xs text-gray-400">No comments yet.</p>
                                    ) : (
                                      igComments[m.id].map((c) => (
                                        <div key={c.id} className="rounded-lg bg-gray-50 p-3">
                                          <p className="text-xs">
                                            <span className="font-bold">@{c.username}</span> {c.text}
                                          </p>
                                          <div className="mt-2 flex gap-2">
                                            <input
                                              value={igReplyDrafts[c.id] || ''}
                                              onChange={(e) =>
                                                setIgReplyDrafts((d) => ({ ...d, [c.id]: e.target.value }))
                                              }
                                              placeholder="Reply..."
                                              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-ia-blue"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleReplySubmit(c.id)}
                                              className="flex-none rounded-lg bg-ia-blue px-3 py-1.5 text-xs font-bold text-white"
                                            >
                                              Reply
                                            </button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-sm font-extrabold">Messages</h3>
                      {igDataErrors.conversations && (
                        <p className="mb-3 text-xs text-red-500">{igDataErrors.conversations}</p>
                      )}
                      {igConversations.length === 0 ? (
                        <p className="text-xs text-gray-400">No conversations yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {igConversations.map((c) => (
                            <div key={c.id} className="rounded-xl border border-gray-100 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="min-w-0 flex-1 truncate text-xs font-bold">
                                  @{c.participant?.username || 'Unknown user'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => toggleConversation(c.id)}
                                  className="flex-none rounded-lg bg-gray-100 px-3 py-1.5 text-[0.65rem] font-bold hover:bg-gray-200"
                                >
                                  {igConversationOpenFor === c.id ? 'Hide' : 'Open'}
                                </button>
                              </div>

                              {igConversationOpenFor === c.id && (
                                <div className="mt-3 space-y-2.5 border-t border-gray-100 pt-3">
                                  {(igMessages[c.id] || []).length === 0 ? (
                                    <p className="text-xs text-gray-400">No messages yet.</p>
                                  ) : (
                                    igMessages[c.id]
                                      .slice()
                                      .reverse()
                                      .map((m) => (
                                        <div key={m.id} className="rounded-lg bg-gray-50 p-3">
                                          <p className="text-xs">
                                            <span className="font-bold">@{m.from?.username}</span> {m.message}
                                          </p>
                                        </div>
                                      ))
                                  )}
                                  <div className="mt-2 flex gap-2">
                                    <input
                                      value={igMessageDrafts[c.id] || ''}
                                      onChange={(e) =>
                                        setIgMessageDrafts((d) => ({ ...d, [c.id]: e.target.value }))
                                      }
                                      placeholder="Reply..."
                                      className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-ia-blue"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSendMessage(c.id, c.participant?.id)}
                                      className="rounded-lg bg-ia-blue px-3 py-1.5 text-xs font-bold text-white"
                                    >
                                      Send
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {advisor?.facebook?.connected && (
                  <div className="mt-8 space-y-6">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-sm font-extrabold">Insights</h3>
                      {fbInsights.length === 0 ? (
                        <p className="text-xs text-gray-400">No insights available yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                          {fbInsights.map((metric) => (
                            <div key={metric.name} className="rounded-xl bg-gray-50 p-4 text-center">
                              <p className="text-2xl font-extrabold text-ia-navy">
                                {metric.values?.[0]?.value ?? '—'}
                              </p>
                              <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-gray-400">
                                {metricLabel(metric.name)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-sm font-extrabold">New Facebook Post</h3>
                      <form onSubmit={handleFbPublish} className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFbPublishForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                          className="block w-full text-xs text-gray-500"
                        />
                        <textarea
                          value={fbPublishForm.caption}
                          onChange={(e) => setFbPublishForm((f) => ({ ...f, caption: e.target.value }))}
                          placeholder="Write a caption..."
                          rows={3}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-ia-blue"
                        />
                        <button
                          type="submit"
                          disabled={fbPublishStatus.posting || !fbPublishForm.file}
                          className="rounded-xl bg-ia-blue px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60"
                        >
                          {fbPublishStatus.posting ? 'Publishing...' : 'Publish to Facebook'}
                        </button>
                        {fbPublishStatus.error && <p className="text-xs text-red-500">{fbPublishStatus.error}</p>}
                      </form>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-sm font-extrabold">Recent Posts</h3>
                      {fbPosts.length === 0 ? (
                        <p className="text-xs text-gray-400">No posts yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                          {fbPosts.map((post) => (
                            <div key={post.id} className="overflow-hidden rounded-xl border border-gray-100">
                              {post.full_picture && (
                                <img src={post.full_picture} alt="" className="aspect-square w-full object-cover" />
                              )}
                              <div className="p-3">
                                <p className="line-clamp-2 text-xs text-gray-600">{post.message || '(no caption)'}</p>
                                <p className="mt-1.5 text-[0.65rem] text-gray-400">
                                  👍 {post.likes?.summary?.total_count ?? 0} · 💬{' '}
                                  {post.comments?.summary?.total_count ?? 0}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => toggleFbComments(post.id)}
                                  className="mt-2 w-full rounded-lg bg-gray-100 px-3 py-1.5 text-[0.65rem] font-bold hover:bg-gray-200"
                                >
                                  {fbCommentsOpenFor === post.id ? 'Hide comments' : 'View comments'}
                                </button>

                                {fbCommentsOpenFor === post.id && (
                                  <div className="mt-3 space-y-2.5 border-t border-gray-100 pt-3">
                                    {(fbComments[post.id] || []).length === 0 ? (
                                      <p className="text-xs text-gray-400">No comments yet.</p>
                                    ) : (
                                      fbComments[post.id].map((c) => (
                                        <div key={c.id} className="rounded-lg bg-gray-50 p-3">
                                          <p className="text-xs">
                                            <span className="font-bold">{c.from?.name || 'Someone'}</span>{' '}
                                            {c.message}
                                          </p>
                                          <div className="mt-2 flex gap-2">
                                            <input
                                              value={fbReplyDrafts[c.id] || ''}
                                              onChange={(e) =>
                                                setFbReplyDrafts((d) => ({ ...d, [c.id]: e.target.value }))
                                              }
                                              placeholder="Reply..."
                                              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-ia-blue"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleFbReplySubmit(c.id)}
                                              className="flex-none rounded-lg bg-ia-blue px-3 py-1.5 text-xs font-bold text-white"
                                            >
                                              Reply
                                            </button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 text-sm font-extrabold">Messages</h3>
                      {fbConversations.length === 0 ? (
                        <p className="text-xs text-gray-400">No conversations yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {fbConversations.map((c) => (
                            <div key={c.id} className="rounded-xl border border-gray-100 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="min-w-0 flex-1 truncate text-xs font-bold">
                                  {c.participant?.name || 'Unknown user'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => toggleFbConversation(c.id)}
                                  className="flex-none rounded-lg bg-gray-100 px-3 py-1.5 text-[0.65rem] font-bold hover:bg-gray-200"
                                >
                                  {fbConversationOpenFor === c.id ? 'Hide' : 'Open'}
                                </button>
                              </div>

                              {fbConversationOpenFor === c.id && (
                                <div className="mt-3 space-y-2.5 border-t border-gray-100 pt-3">
                                  {(fbMessages[c.id] || []).length === 0 ? (
                                    <p className="text-xs text-gray-400">No messages yet.</p>
                                  ) : (
                                    fbMessages[c.id]
                                      .slice()
                                      .reverse()
                                      .map((m) => (
                                        <div key={m.id} className="rounded-lg bg-gray-50 p-3">
                                          <p className="text-xs">
                                            <span className="font-bold">{m.from?.name}</span> {m.message}
                                          </p>
                                        </div>
                                      ))
                                  )}
                                  <div className="mt-2 flex gap-2">
                                    <input
                                      value={fbMessageDrafts[c.id] || ''}
                                      onChange={(e) =>
                                        setFbMessageDrafts((d) => ({ ...d, [c.id]: e.target.value }))
                                      }
                                      placeholder="Reply..."
                                      className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-ia-blue"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleFbSendMessage(c.id, c.participant?.id)}
                                      className="rounded-lg bg-ia-blue px-3 py-1.5 text-xs font-bold text-white"
                                    >
                                      Send
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
              )}

              {/* CONTENT LIBRARY */}
              {activeTab === 'library' && (
              <section id="library" className="mb-12 scroll-mt-24">
                <h2 className="mb-1.5 text-lg font-extrabold">Content Library</h2>
                <p className="mb-5 text-sm text-gray-500">
                  Upload photos here to use in your reels, carousels and posters.
                </p>

                <div className="mb-5">
                  <label className="inline-block cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold shadow-sm transition hover:bg-gray-50">
                    {libraryUploadStatus.uploading ? 'Uploading...' : '+ Upload photos'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleLibraryImagesChange}
                      disabled={libraryUploadStatus.uploading}
                      className="hidden"
                    />
                  </label>
                  {libraryUploadStatus.error && (
                    <p className="mt-2 text-sm text-red-500">{libraryUploadStatus.error}</p>
                  )}
                </div>

                {libraryUploadStatus.uploading && (
                  <div className="mb-5 max-w-sm">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-indigo-600 transition-all duration-150"
                        style={{ width: `${libraryUploadStatus.percent}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">{libraryUploadStatus.progress}</p>
                  </div>
                )}

                {libraryImages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                    <p className="text-3xl">🎬</p>
                    <p className="mt-3 font-semibold">No photos uploaded yet</p>
                    <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500">
                      Upload one or more photos to use in your personalised reels, carousels and posters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {libraryImages.map((url) => (
                      <div key={url} className="group relative overflow-hidden rounded-xl border border-gray-200">
                        <img
                          src={url}
                          alt="Content library upload"
                          onClick={() => setLibraryPreviewUrl(url)}
                          className="aspect-square w-full cursor-zoom-in object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleLibraryImageDelete(url)}
                          className="absolute right-1.5 top-1.5 hidden rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-white group-hover:block"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {libraryPreviewUrl && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
                    onClick={() => setLibraryPreviewUrl(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setLibraryPreviewUrl(null)}
                      className="absolute right-5 top-5 rounded-full bg-white/10 px-3 py-1.5 text-lg font-bold text-white hover:bg-white/20"
                    >
                      ✕
                    </button>
                    <img
                      src={libraryPreviewUrl}
                      alt="Content library preview"
                      onClick={(e) => e.stopPropagation()}
                      className="max-h-full max-w-full rounded-lg object-contain"
                    />
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
                  Every activity — reel, carousel or image — costs a flat 10 credits. Bigger packs earn bonus credits.
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
    </div>
  );
}
