'use client';
import { useEffect, useRef, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';
import { defaultHomepageContent } from '../../../lib/homepageContent';
import { homepageThemes } from '../../../lib/homepageThemes';

const capImageKeys = ['cap-reels', 'cap-carousels', 'cap-posts'];

// Quick-fill shortcuts for the nav menu editor — picking one fills both the
// label and the link, which the admin can still rename/redirect afterward.
const navPresets = [
  { label: 'Home', href: '/' },
  { label: 'Why a Website', href: '/#why' },
  { label: "It's Free", href: '/#free' },
  { label: 'Platform', href: '/#platform' },
  { label: 'Credits', href: '/#pricing' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Advisor Login', href: '/advisor/login' },
  { label: 'Advisor Declaration', href: '/advisor-declaration' },
  { label: 'Customer Login', href: '/customer/login' }
];

// Immutable set-by-path helper, e.g. setPath(content, ['hero','slides',0,'tag'], 'New tag').
function setPath(obj, path, value) {
  if (path.length === 0) return value;
  const [key, ...rest] = path;
  const base = Array.isArray(obj) ? [...obj] : { ...obj };
  base[key] = setPath(obj ? obj[key] : undefined, rest, value);
  return base;
}

// Same id scheme used by the preview iframe's click-to-locate messages
// (['hero','slides',0,'tag'] -> 'field-hero-slides-0-tag') so a click in the
// live preview can scroll straight to its matching field here.
function fieldId(path) {
  return `field-${path.join('-')}`;
}

function Field({ id, label, value, onChange, textarea = false, rows = 2, highlighted = false }) {
  const inputClasses = `mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition ${
    highlighted ? 'border-ia-blue ring-2 ring-ia-blue/40' : 'border-gray-200 focus:border-ia-blue'
  }`;
  return (
    <label id={id} className="block scroll-mt-24">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      {textarea ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={inputClasses} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClasses} />
      )}
    </label>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-extrabold text-gray-900">{title}</h2>
      {desc && <p className="mt-1 text-xs text-gray-500">{desc}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function ImageSlot({ id, label, size, imageUrl, uploading, error, onUpload, square = false, highlighted = false }) {
  return (
    <div
      id={id}
      className={`flex scroll-mt-24 flex-col gap-3 rounded-lg border border-dashed bg-white p-3 transition sm:flex-row sm:items-center ${
        highlighted ? 'border-ia-blue ring-2 ring-ia-blue/40' : 'border-gray-200'
      }`}
    >
      <div className={`h-16 flex-none overflow-hidden rounded-lg bg-gray-100 ${square ? 'w-16 p-2' : 'w-24'}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={label} className={square ? 'h-full w-full object-contain' : 'h-full w-full object-cover'} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-gray-400">No image</div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-500">{label}</p>
        {size && <p className="mt-0.5 text-[0.65rem] text-gray-400">Recommended size: {size}</p>}
        <label className="mt-1.5 inline-block cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
          {uploading ? 'Uploading...' : imageUrl ? 'Replace photo' : 'Upload photo'}
          <input type="file" accept="image/*" onChange={(e) => onUpload(e.target.files?.[0])} disabled={uploading} className="hidden" />
        </label>
        {error && <p className="mt-1 text-[0.65rem] text-red-600">{error}</p>}
      </div>
    </div>
  );
}

// One row of the nav menu editor — used for both top-level items and
// dropdown sub-items. `sub` shrinks the styling and hides "Add sub-item"
// since dropdowns only go one level deep.
function NavItemRow({ item, onLabelChange, onHrefChange, onNewTabChange, onPresetChange, onMoveUp, onMoveDown, onRemove, onAddChild, sub = false }) {
  return (
    <div className={`rounded-lg border bg-white p-3 ${sub ? 'border-gray-100' : 'border-gray-200'}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="text-[0.65rem] font-semibold text-gray-500">Label</span>
            <input
              type="text"
              value={item.label}
              onChange={(e) => onLabelChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 outline-none transition focus:border-ia-blue"
            />
          </label>
          <label className="block">
            <span className="text-[0.65rem] font-semibold text-gray-500">Link</span>
            <input
              type="text"
              value={item.href}
              onChange={(e) => onHrefChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 outline-none transition focus:border-ia-blue"
            />
          </label>
        </div>
        <div className="flex flex-none items-center gap-1 pt-1 sm:pt-5">
          <button type="button" onClick={onMoveUp} title="Move up" className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700">
            ↑
          </button>
          <button type="button" onClick={onMoveDown} title="Move down" className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700">
            ↓
          </button>
          <button type="button" onClick={onRemove} title="Delete" className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600">
            ✕
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <select
          defaultValue=""
          onChange={(e) => {
            onPresetChange(e.target.value);
            e.target.value = '';
          }}
          className="rounded-lg border border-gray-200 px-2 py-1 text-[0.7rem] font-medium text-gray-600 outline-none focus:border-ia-blue"
        >
          <option value="" disabled>
            Quick-fill from page...
          </option>
          {navPresets.map((p) => (
            <option key={p.href} value={p.href}>
              {p.label} ({p.href})
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-[0.7rem] font-medium text-gray-500">
          <input type="checkbox" checked={!!item.newTab} onChange={(e) => onNewTabChange(e.target.checked)} className="accent-ia-blue" />
          Open in new tab
        </label>
        {!sub && (
          <button type="button" onClick={onAddChild} className="ml-auto text-[0.7rem] font-bold text-ia-blue hover:underline">
            + Add sub-item
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomepageContentPage() {
  const [content, setContent] = useState(defaultHomepageContent);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ saving: false, error: '', success: '' });
  const iframeRef = useRef(null);
  const [previewReadyTick, setPreviewReadyTick] = useState(0);
  const [bannerUrls, setBannerUrls] = useState({});
  const [uploadingKey, setUploadingKey] = useState(null);
  const [bannerErrors, setBannerErrors] = useState({});
  const [highlightedId, setHighlightedId] = useState(null);

  function loadBanners() {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/banners`)
      .then((res) => res.json())
      .then((data) => {
        const byKey = {};
        (data.banners || []).forEach((b) => {
          byKey[b.key] = b.imageUrl;
        });
        setBannerUrls(byKey);
      });
  }

  useEffect(() => {
    loadBanners();
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/content/homepage`)
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setContent({ ...data.content, navLinks: data.content.navLinks?.length ? data.content.navLinks : defaultHomepageContent.navLinks });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // The preview iframe (app/page.js in ?preview=1 mode) announces itself once
  // mounted (we then push draft content/images to it), and posts back here
  // whenever the admin clicks something in the preview — we scroll to and
  // highlight the matching field so edits and preview stay connected both ways.
  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type === 'homepage-preview-ready') {
        setPreviewReadyTick((t) => t + 1);
        return;
      }
      if (e.data?.type === 'homepage-preview-click' && Array.isArray(e.data.path)) {
        const id = fieldId(e.data.path);
        setHighlightedId(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => setHighlightedId((cur) => (cur === id ? null : cur)), 2500);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (previewReadyTick === 0) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'homepage-preview-content', content, bannerUrls },
      '*'
    );
  }, [content, bannerUrls, previewReadyTick]);

  function set(path, value) {
    setContent((prev) => setPath(prev, path, value));
  }

  function newNavItem(label) {
    return { id: `nav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label, href: '/', newTab: false, children: [] };
  }

  function addNavLink() {
    setContent((prev) => ({ ...prev, navLinks: [...(prev.navLinks || []), newNavItem('New menu item')] }));
  }

  function removeNavLink(index) {
    setContent((prev) => ({ ...prev, navLinks: prev.navLinks.filter((_, i) => i !== index) }));
  }

  function moveNavLink(index, dir) {
    setContent((prev) => {
      const links = [...prev.navLinks];
      const target = index + dir;
      if (target < 0 || target >= links.length) return prev;
      [links[index], links[target]] = [links[target], links[index]];
      return { ...prev, navLinks: links };
    });
  }

  function addNavChild(index) {
    setContent((prev) => {
      const links = [...prev.navLinks];
      links[index] = { ...links[index], children: [...(links[index].children || []), newNavItem('New sub-item')] };
      return { ...prev, navLinks: links };
    });
  }

  function removeNavChild(index, childIndex) {
    setContent((prev) => {
      const links = [...prev.navLinks];
      links[index] = { ...links[index], children: links[index].children.filter((_, i) => i !== childIndex) };
      return { ...prev, navLinks: links };
    });
  }

  function moveNavChild(index, childIndex, dir) {
    setContent((prev) => {
      const links = [...prev.navLinks];
      const children = [...links[index].children];
      const target = childIndex + dir;
      if (target < 0 || target >= children.length) return prev;
      [children[childIndex], children[target]] = [children[target], children[childIndex]];
      links[index] = { ...links[index], children };
      return { ...prev, navLinks: links };
    });
  }

  function applyNavPreset(path, presetHref) {
    const preset = navPresets.find((p) => p.href === presetHref);
    if (!preset) return;
    setContent((prev) => {
      let next = setPath(prev, [...path, 'href'], preset.href);
      next = setPath(next, [...path, 'label'], preset.label);
      return next;
    });
  }

  async function handleUploadImage(key, file) {
    if (!file) return;
    setUploadingKey(key);
    setBannerErrors((prev) => ({ ...prev, [key]: '' }));

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/banners/${key}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();

    if (!res.ok) {
      setBannerErrors((prev) => ({ ...prev, [key]: data.error || 'Could not upload image' }));
      setUploadingKey(null);
      return;
    }

    setBannerUrls((prev) => ({ ...prev, [key]: data.banner.imageUrl }));
    setUploadingKey(null);
  }

  async function handleSave() {
    setStatus({ saving: true, error: '', success: '' });
    const token = localStorage.getItem('token');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/content/homepage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: content })
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus({ saving: false, error: data.error || 'Could not save changes', success: '' });
      return;
    }
    setStatus({ saving: false, error: '', success: 'Homepage updated — changes are live now.' });
    setTimeout(() => setStatus((s) => ({ ...s, success: '' })), 4000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 px-6 py-16">
          <p className="text-gray-500">Loading homepage content...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="max-w-3xl">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Homepage editor</h1>
            <p className="mt-2 text-gray-500">
              Edit every headline, paragraph, button label and photo on the public homepage from one place. Text
              changes go live when you hit Save; photos go live the moment you upload them. Click anything in the
              live preview on the right to jump straight to its field here.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <Section title="Homepage color palette" desc="Pick a color theme for the public homepage — changes go live the moment you hit Save.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(homepageThemes).map(([key, theme]) => {
                  const active = (content.themeKey || 'classic-navy') === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set(['themeKey'], key)}
                      className={`flex items-center gap-3 rounded-xl border-2 bg-white p-3 text-left transition ${
                        active ? 'border-ia-blue' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-none -space-x-1.5">
                        {[theme.colors.navy, theme.colors.blue, theme.colors.green].map((color, i) => (
                          <span key={i} className="h-6 w-6 rounded-full ring-2 ring-white" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-gray-900">{theme.label}</p>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Site branding" desc="The logo shown in the nav bar, footer and login pages across the whole site.">
              <ImageSlot
                id={fieldId(['image', 'site-logo'])}
                highlighted={highlightedId === fieldId(['image', 'site-logo'])}
                label="Site logo — falls back to the 🛡️ shield emoji until uploaded"
                size="512×512px, square, transparent PNG"
                imageUrl={bannerUrls['site-logo']}
                uploading={uploadingKey === 'site-logo'}
                error={bannerErrors['site-logo']}
                onUpload={(file) => handleUploadImage('site-logo', file)}
                square
              />
            </Section>

            <Section title="Navigation menu" desc="The links in the top nav bar. Add, remove, reorder or nest items into dropdowns — changes go live on Save.">
              <div className="space-y-3">
                {(content.navLinks || []).map((link, i) => (
                  <div key={link.id} className="space-y-2">
                    <NavItemRow
                      item={link}
                      onLabelChange={(v) => set(['navLinks', i, 'label'], v)}
                      onHrefChange={(v) => set(['navLinks', i, 'href'], v)}
                      onNewTabChange={(v) => set(['navLinks', i, 'newTab'], v)}
                      onPresetChange={(href) => applyNavPreset(['navLinks', i], href)}
                      onMoveUp={() => moveNavLink(i, -1)}
                      onMoveDown={() => moveNavLink(i, 1)}
                      onRemove={() => removeNavLink(i)}
                      onAddChild={() => addNavChild(i)}
                    />
                    {link.children?.length > 0 && (
                      <div className="ml-6 space-y-2 border-l-2 border-gray-100 pl-3">
                        {link.children.map((child, ci) => (
                          <NavItemRow
                            key={child.id}
                            item={child}
                            sub
                            onLabelChange={(v) => set(['navLinks', i, 'children', ci, 'label'], v)}
                            onHrefChange={(v) => set(['navLinks', i, 'children', ci, 'href'], v)}
                            onNewTabChange={(v) => set(['navLinks', i, 'children', ci, 'newTab'], v)}
                            onPresetChange={(href) => applyNavPreset(['navLinks', i, 'children', ci], href)}
                            onMoveUp={() => moveNavChild(i, ci, -1)}
                            onMoveDown={() => moveNavChild(i, ci, 1)}
                            onRemove={() => removeNavChild(i, ci)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addNavLink}
                className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-bold text-gray-600 transition hover:border-ia-blue hover:text-ia-blue"
              >
                + Add menu item
              </button>
            </Section>

            <Section title="Hero carousel" desc="The 4 rotating slides at the top of the homepage — photo and text together.">
              <div id={fieldId(['heroOverlayOpacity'])} className="scroll-mt-24 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Photo overlay darkness (for text readability)</span>
                  <span className="text-xs font-bold text-gray-700">{content.heroOverlayOpacity ?? 70}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={content.heroOverlayOpacity ?? 70}
                  onChange={(e) => set(['heroOverlayOpacity'], Number(e.target.value))}
                  className="mt-2 w-full accent-ia-blue"
                />
                <p className="mt-1 text-[0.65rem] text-gray-400">
                  Higher = darker overlay, more legible text but a dimmer photo. Lower = brighter photo, less contrast for text.
                </p>
              </div>
              {content.hero.slides.map((slide, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-gray-400">Slide {i + 1}</p>
                  <div className="space-y-3">
                    <ImageSlot
                      id={fieldId(['image', `hero-${i + 1}`])}
                      highlighted={highlightedId === fieldId(['image', `hero-${i + 1}`])}
                      label={`Slide ${i + 1} background photo`}
                      size="1920×1080px, landscape, full-bleed"
                      imageUrl={bannerUrls[`hero-${i + 1}`]}
                      uploading={uploadingKey === `hero-${i + 1}`}
                      error={bannerErrors[`hero-${i + 1}`]}
                      onUpload={(file) => handleUploadImage(`hero-${i + 1}`, file)}
                    />
                    <Field
                      id={fieldId(['hero', 'slides', i, 'tag'])}
                      highlighted={highlightedId === fieldId(['hero', 'slides', i, 'tag'])}
                      label="Tag"
                      value={slide.tag}
                      onChange={(v) => set(['hero', 'slides', i, 'tag'], v)}
                    />
                    <Field
                      id={fieldId(['hero', 'slides', i, 'headlineLine1'])}
                      highlighted={highlightedId === fieldId(['hero', 'slides', i, 'headlineLine1'])}
                      label="Headline — line 1"
                      value={slide.headlineLine1}
                      onChange={(v) => set(['hero', 'slides', i, 'headlineLine1'], v)}
                    />
                    <Field
                      id={fieldId(['hero', 'slides', i, 'headlineLine2'])}
                      highlighted={highlightedId === fieldId(['hero', 'slides', i, 'headlineLine2'])}
                      label="Headline — line 2 (highlighted)"
                      value={slide.headlineLine2}
                      onChange={(v) => set(['hero', 'slides', i, 'headlineLine2'], v)}
                    />
                    <Field
                      id={fieldId(['hero', 'slides', i, 'text'])}
                      highlighted={highlightedId === fieldId(['hero', 'slides', i, 'text'])}
                      label="Body text"
                      textarea
                      rows={3}
                      value={slide.text}
                      onChange={(v) => set(['hero', 'slides', i, 'text'], v)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        id={fieldId(['hero', 'slides', i, 'primary'])}
                        highlighted={highlightedId === fieldId(['hero', 'slides', i, 'primary'])}
                        label="Primary button"
                        value={slide.primary}
                        onChange={(v) => set(['hero', 'slides', i, 'primary'], v)}
                      />
                      <Field
                        id={fieldId(['hero', 'slides', i, 'secondary'])}
                        highlighted={highlightedId === fieldId(['hero', 'slides', i, 'secondary'])}
                        label="Secondary button (optional)"
                        value={slide.secondary}
                        onChange={(v) => set(['hero', 'slides', i, 'secondary'], v)}
                      />
                    </div>
                    <Field
                      id={fieldId(['hero', 'slides', i, 'chip'])}
                      highlighted={highlightedId === fieldId(['hero', 'slides', i, 'chip'])}
                      label="Chip / badge text (optional)"
                      value={slide.chip}
                      onChange={(v) => set(['hero', 'slides', i, 'chip'], v)}
                    />
                  </div>
                </div>
              ))}
            </Section>

            <Section title="Trust strip" desc="The 4 stats shown right under the hero.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {content.trustStrip.map((item, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="space-y-3">
                      <Field
                        id={fieldId(['trustStrip', i, 'value'])}
                        highlighted={highlightedId === fieldId(['trustStrip', i, 'value'])}
                        label="Value"
                        value={item.value}
                        onChange={(v) => set(['trustStrip', i, 'value'], v)}
                      />
                      <Field
                        id={fieldId(['trustStrip', i, 'label'])}
                        highlighted={highlightedId === fieldId(['trustStrip', i, 'label'])}
                        label="Label"
                        value={item.label}
                        onChange={(v) => set(['trustStrip', i, 'label'], v)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title='"Why a website" section' desc="Section intro plus 4 reason cards.">
              <Field
                id={fieldId(['whyWebsite', 'eyebrow'])}
                highlighted={highlightedId === fieldId(['whyWebsite', 'eyebrow'])}
                label="Eyebrow"
                value={content.whyWebsite.eyebrow}
                onChange={(v) => set(['whyWebsite', 'eyebrow'], v)}
              />
              <Field
                id={fieldId(['whyWebsite', 'heading'])}
                highlighted={highlightedId === fieldId(['whyWebsite', 'heading'])}
                label="Heading"
                value={content.whyWebsite.heading}
                onChange={(v) => set(['whyWebsite', 'heading'], v)}
              />
              <Field
                id={fieldId(['whyWebsite', 'paragraph'])}
                highlighted={highlightedId === fieldId(['whyWebsite', 'paragraph'])}
                label="Paragraph"
                textarea
                value={content.whyWebsite.paragraph}
                onChange={(v) => set(['whyWebsite', 'paragraph'], v)}
              />
              {content.whyWebsite.cards.map((card, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-gray-400">Card {i + 1}</p>
                  <div className="space-y-3">
                    <Field
                      id={fieldId(['whyWebsite', 'cards', i, 'title'])}
                      highlighted={highlightedId === fieldId(['whyWebsite', 'cards', i, 'title'])}
                      label="Title"
                      value={card.title}
                      onChange={(v) => set(['whyWebsite', 'cards', i, 'title'], v)}
                    />
                    <Field
                      id={fieldId(['whyWebsite', 'cards', i, 'desc'])}
                      highlighted={highlightedId === fieldId(['whyWebsite', 'cards', i, 'desc'])}
                      label="Description"
                      textarea
                      value={card.desc}
                      onChange={(v) => set(['whyWebsite', 'cards', i, 'desc'], v)}
                    />
                    <Field
                      id={fieldId(['whyWebsite', 'cards', i, 'stat'])}
                      highlighted={highlightedId === fieldId(['whyWebsite', 'cards', i, 'stat'])}
                      label="Stat line"
                      value={card.stat}
                      onChange={(v) => set(['whyWebsite', 'cards', i, 'stat'], v)}
                    />
                  </div>
                </div>
              ))}
            </Section>

            <Section title='"How is this free?" section' desc="Explanation copy, the 4-item checklist and its button.">
              <ImageSlot
                id={fieldId(['image', 'free-image'])}
                highlighted={highlightedId === fieldId(['image', 'free-image'])}
                label="Section photo, next to the 'FREE — Website + Hosting' badge"
                size="1200×900px, 4:3"
                imageUrl={bannerUrls['free-image']}
                uploading={uploadingKey === 'free-image'}
                error={bannerErrors['free-image']}
                onUpload={(file) => handleUploadImage('free-image', file)}
              />
              <Field
                id={fieldId(['freeSection', 'eyebrow'])}
                highlighted={highlightedId === fieldId(['freeSection', 'eyebrow'])}
                label="Eyebrow"
                value={content.freeSection.eyebrow}
                onChange={(v) => set(['freeSection', 'eyebrow'], v)}
              />
              <Field
                id={fieldId(['freeSection', 'heading'])}
                highlighted={highlightedId === fieldId(['freeSection', 'heading'])}
                label="Heading"
                value={content.freeSection.heading}
                onChange={(v) => set(['freeSection', 'heading'], v)}
              />
              <Field
                id={fieldId(['freeSection', 'paragraph'])}
                highlighted={highlightedId === fieldId(['freeSection', 'paragraph'])}
                label="Paragraph"
                textarea
                value={content.freeSection.paragraph}
                onChange={(v) => set(['freeSection', 'paragraph'], v)}
              />
              {content.freeSection.checklist.map((item, i) => (
                <div key={i} className="grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <Field
                    id={fieldId(['freeSection', 'checklist', i, 'bold'])}
                    highlighted={highlightedId === fieldId(['freeSection', 'checklist', i, 'bold'])}
                    label={`Checklist ${i + 1} — bold lead-in`}
                    value={item.bold}
                    onChange={(v) => set(['freeSection', 'checklist', i, 'bold'], v)}
                  />
                  <Field
                    id={fieldId(['freeSection', 'checklist', i, 'rest'])}
                    highlighted={highlightedId === fieldId(['freeSection', 'checklist', i, 'rest'])}
                    label={`Checklist ${i + 1} — rest of sentence`}
                    value={item.rest}
                    onChange={(v) => set(['freeSection', 'checklist', i, 'rest'], v)}
                  />
                </div>
              ))}
              <Field
                id={fieldId(['freeSection', 'button'])}
                highlighted={highlightedId === fieldId(['freeSection', 'button'])}
                label="Button label"
                value={content.freeSection.button}
                onChange={(v) => set(['freeSection', 'button'], v)}
              />
            </Section>

            <Section title="Platform capabilities" desc="Intro plus the 3 content-type cards.">
              <Field
                id={fieldId(['capabilities', 'eyebrow'])}
                highlighted={highlightedId === fieldId(['capabilities', 'eyebrow'])}
                label="Eyebrow"
                value={content.capabilities.eyebrow}
                onChange={(v) => set(['capabilities', 'eyebrow'], v)}
              />
              <Field
                id={fieldId(['capabilities', 'heading'])}
                highlighted={highlightedId === fieldId(['capabilities', 'heading'])}
                label="Heading"
                value={content.capabilities.heading}
                onChange={(v) => set(['capabilities', 'heading'], v)}
              />
              <Field
                id={fieldId(['capabilities', 'paragraph'])}
                highlighted={highlightedId === fieldId(['capabilities', 'paragraph'])}
                label="Paragraph"
                textarea
                value={content.capabilities.paragraph}
                onChange={(v) => set(['capabilities', 'paragraph'], v)}
              />
              {content.capabilities.cards.map((card, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-gray-400">Card {i + 1}</p>
                  <div className="space-y-3">
                    <ImageSlot
                      id={fieldId(['image', capImageKeys[i]])}
                      highlighted={highlightedId === fieldId(['image', capImageKeys[i]])}
                      label={`Card ${i + 1} photo`}
                      size="800×450px, landscape"
                      imageUrl={bannerUrls[capImageKeys[i]]}
                      uploading={uploadingKey === capImageKeys[i]}
                      error={bannerErrors[capImageKeys[i]]}
                      onUpload={(file) => handleUploadImage(capImageKeys[i], file)}
                    />
                    <Field
                      id={fieldId(['capabilities', 'cards', i, 'title'])}
                      highlighted={highlightedId === fieldId(['capabilities', 'cards', i, 'title'])}
                      label="Title"
                      value={card.title}
                      onChange={(v) => set(['capabilities', 'cards', i, 'title'], v)}
                    />
                    <Field
                      id={fieldId(['capabilities', 'cards', i, 'desc'])}
                      highlighted={highlightedId === fieldId(['capabilities', 'cards', i, 'desc'])}
                      label="Description"
                      textarea
                      value={card.desc}
                      onChange={(v) => set(['capabilities', 'cards', i, 'desc'], v)}
                    />
                  </div>
                </div>
              ))}
            </Section>

            <Section title="Platform flow banner" desc="The blue/green banner with the 4 flow steps.">
              <Field
                id={fieldId(['flow', 'headingLine1'])}
                highlighted={highlightedId === fieldId(['flow', 'headingLine1'])}
                label="Heading — line 1"
                value={content.flow.headingLine1}
                onChange={(v) => set(['flow', 'headingLine1'], v)}
              />
              <Field
                id={fieldId(['flow', 'headingLine2'])}
                highlighted={highlightedId === fieldId(['flow', 'headingLine2'])}
                label="Heading — line 2"
                value={content.flow.headingLine2}
                onChange={(v) => set(['flow', 'headingLine2'], v)}
              />
              <Field
                id={fieldId(['flow', 'paragraph'])}
                highlighted={highlightedId === fieldId(['flow', 'paragraph'])}
                label="Paragraph"
                textarea
                value={content.flow.paragraph}
                onChange={(v) => set(['flow', 'paragraph'], v)}
              />
              <div className="grid grid-cols-2 gap-3">
                {content.flow.steps.map((step, i) => (
                  <Field
                    key={i}
                    id={fieldId(['flow', 'steps', i])}
                    highlighted={highlightedId === fieldId(['flow', 'steps', i])}
                    label={`Step ${i + 1}`}
                    value={step}
                    onChange={(v) => set(['flow', 'steps', i], v)}
                  />
                ))}
              </div>
              <Field
                id={fieldId(['flow', 'button'])}
                highlighted={highlightedId === fieldId(['flow', 'button'])}
                label="Button label"
                value={content.flow.button}
                onChange={(v) => set(['flow', 'button'], v)}
              />
            </Section>

            <Section title="Pricing" desc="Intro copy, the 3 plans, the credit-rule note and the custom-domain block.">
              <Field
                id={fieldId(['pricing', 'eyebrow'])}
                highlighted={highlightedId === fieldId(['pricing', 'eyebrow'])}
                label="Eyebrow"
                value={content.pricing.eyebrow}
                onChange={(v) => set(['pricing', 'eyebrow'], v)}
              />
              <Field
                id={fieldId(['pricing', 'heading'])}
                highlighted={highlightedId === fieldId(['pricing', 'heading'])}
                label="Heading"
                value={content.pricing.heading}
                onChange={(v) => set(['pricing', 'heading'], v)}
              />
              <Field
                id={fieldId(['pricing', 'paragraph'])}
                highlighted={highlightedId === fieldId(['pricing', 'paragraph'])}
                label="Paragraph"
                textarea
                value={content.pricing.paragraph}
                onChange={(v) => set(['pricing', 'paragraph'], v)}
              />
              {content.pricing.plans.map((plan, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-gray-400">
                    Plan {i + 1} — {plan.name}
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        id={fieldId(['pricing', 'plans', i, 'name'])}
                        highlighted={highlightedId === fieldId(['pricing', 'plans', i, 'name'])}
                        label="Plan name"
                        value={plan.name}
                        onChange={(v) => set(['pricing', 'plans', i, 'name'], v)}
                      />
                      <Field
                        id={fieldId(['pricing', 'plans', i, 'amount'])}
                        highlighted={highlightedId === fieldId(['pricing', 'plans', i, 'amount'])}
                        label="Amount"
                        value={plan.amount}
                        onChange={(v) => set(['pricing', 'plans', i, 'amount'], v)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        id={fieldId(['pricing', 'plans', i, 'credits'])}
                        highlighted={highlightedId === fieldId(['pricing', 'plans', i, 'credits'])}
                        label="Credits line"
                        value={plan.credits}
                        onChange={(v) => set(['pricing', 'plans', i, 'credits'], v)}
                      />
                      <Field
                        id={fieldId(['pricing', 'plans', i, 'bonus'])}
                        highlighted={highlightedId === fieldId(['pricing', 'plans', i, 'bonus'])}
                        label="Bonus text (optional)"
                        value={plan.bonus}
                        onChange={(v) => set(['pricing', 'plans', i, 'bonus'], v)}
                      />
                    </div>
                    {plan.features.map((f, fi) => (
                      <Field
                        key={fi}
                        id={fieldId(['pricing', 'plans', i, 'features', fi])}
                        highlighted={highlightedId === fieldId(['pricing', 'plans', i, 'features', fi])}
                        label={`Feature ${fi + 1}`}
                        value={f}
                        onChange={(v) => set(['pricing', 'plans', i, 'features', fi], v)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <Field
                id={fieldId(['pricing', 'note'])}
                highlighted={highlightedId === fieldId(['pricing', 'note'])}
                label="Credit-rule note"
                textarea
                value={content.pricing.note}
                onChange={(v) => set(['pricing', 'note'], v)}
              />
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-gray-400">Custom domain cross-sell</p>
                <div className="space-y-3">
                  <Field
                    id={fieldId(['pricing', 'domainCrossSell', 'title'])}
                    highlighted={highlightedId === fieldId(['pricing', 'domainCrossSell', 'title'])}
                    label="Title"
                    value={content.pricing.domainCrossSell.title}
                    onChange={(v) => set(['pricing', 'domainCrossSell', 'title'], v)}
                  />
                  <Field
                    id={fieldId(['pricing', 'domainCrossSell', 'desc'])}
                    highlighted={highlightedId === fieldId(['pricing', 'domainCrossSell', 'desc'])}
                    label="Description"
                    value={content.pricing.domainCrossSell.desc}
                    onChange={(v) => set(['pricing', 'domainCrossSell', 'desc'], v)}
                  />
                  <Field
                    id={fieldId(['pricing', 'domainCrossSell', 'price'])}
                    highlighted={highlightedId === fieldId(['pricing', 'domainCrossSell', 'price'])}
                    label="Price"
                    value={content.pricing.domainCrossSell.price}
                    onChange={(v) => set(['pricing', 'domainCrossSell', 'price'], v)}
                  />
                </div>
              </div>
            </Section>

            <Section title="Compliance section" desc="The 'technology platform only' box with 4 disclosure items.">
              <Field
                id={fieldId(['compliance', 'heading'])}
                highlighted={highlightedId === fieldId(['compliance', 'heading'])}
                label="Heading"
                value={content.compliance.heading}
                onChange={(v) => set(['compliance', 'heading'], v)}
              />
              <Field
                id={fieldId(['compliance', 'paragraph'])}
                highlighted={highlightedId === fieldId(['compliance', 'paragraph'])}
                label="Paragraph"
                textarea
                value={content.compliance.paragraph}
                onChange={(v) => set(['compliance', 'paragraph'], v)}
              />
              {content.compliance.items.map((item, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="space-y-3">
                    <Field
                      id={fieldId(['compliance', 'items', i, 'lead'])}
                      highlighted={highlightedId === fieldId(['compliance', 'items', i, 'lead'])}
                      label={`Item ${i + 1} — lead`}
                      value={item.lead}
                      onChange={(v) => set(['compliance', 'items', i, 'lead'], v)}
                    />
                    <Field
                      id={fieldId(['compliance', 'items', i, 'desc'])}
                      highlighted={highlightedId === fieldId(['compliance', 'items', i, 'desc'])}
                      label={`Item ${i + 1} — description`}
                      textarea
                      value={item.desc}
                      onChange={(v) => set(['compliance', 'items', i, 'desc'], v)}
                    />
                  </div>
                </div>
              ))}
            </Section>

            <Section title="Final call to action">
              <Field
                id={fieldId(['finalCta', 'headingLine1'])}
                highlighted={highlightedId === fieldId(['finalCta', 'headingLine1'])}
                label="Heading — line 1"
                value={content.finalCta.headingLine1}
                onChange={(v) => set(['finalCta', 'headingLine1'], v)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id={fieldId(['finalCta', 'headingLine2Prefix'])}
                  highlighted={highlightedId === fieldId(['finalCta', 'headingLine2Prefix'])}
                  label="Heading — line 2 (before highlight)"
                  value={content.finalCta.headingLine2Prefix}
                  onChange={(v) => set(['finalCta', 'headingLine2Prefix'], v)}
                />
                <Field
                  id={fieldId(['finalCta', 'headingLine2Highlight'])}
                  highlighted={highlightedId === fieldId(['finalCta', 'headingLine2Highlight'])}
                  label="Heading — highlighted word"
                  value={content.finalCta.headingLine2Highlight}
                  onChange={(v) => set(['finalCta', 'headingLine2Highlight'], v)}
                />
              </div>
              <Field
                id={fieldId(['finalCta', 'paragraph'])}
                highlighted={highlightedId === fieldId(['finalCta', 'paragraph'])}
                label="Paragraph"
                value={content.finalCta.paragraph}
                onChange={(v) => set(['finalCta', 'paragraph'], v)}
              />
              <Field
                id={fieldId(['finalCta', 'button'])}
                highlighted={highlightedId === fieldId(['finalCta', 'button'])}
                label="Button label"
                value={content.finalCta.button}
                onChange={(v) => set(['finalCta', 'button'], v)}
              />
            </Section>

            <Section title="Advisor login popup" desc="The modal that opens from every 'Get Started' button.">
              <Field
                id={fieldId(['loginModal', 'title'])}
                highlighted={highlightedId === fieldId(['loginModal', 'title'])}
                label="Title"
                value={content.loginModal.title}
                onChange={(v) => set(['loginModal', 'title'], v)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id={fieldId(['loginModal', 'subtitle'])}
                  highlighted={highlightedId === fieldId(['loginModal', 'subtitle'])}
                  label="Subtitle text"
                  value={content.loginModal.subtitle}
                  onChange={(v) => set(['loginModal', 'subtitle'], v)}
                />
                <Field
                  id={fieldId(['loginModal', 'subtitleLink'])}
                  highlighted={highlightedId === fieldId(['loginModal', 'subtitleLink'])}
                  label="Subtitle link text"
                  value={content.loginModal.subtitleLink}
                  onChange={(v) => set(['loginModal', 'subtitleLink'], v)}
                />
              </div>
              <Field
                id={fieldId(['loginModal', 'declaration'])}
                highlighted={highlightedId === fieldId(['loginModal', 'declaration'])}
                label="Advisor declaration (legal text)"
                textarea
                rows={5}
                value={content.loginModal.declaration}
                onChange={(v) => set(['loginModal', 'declaration'], v)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id={fieldId(['loginModal', 'consentLabel'])}
                  highlighted={highlightedId === fieldId(['loginModal', 'consentLabel'])}
                  label="Consent checkbox label"
                  value={content.loginModal.consentLabel}
                  onChange={(v) => set(['loginModal', 'consentLabel'], v)}
                />
                <Field
                  id={fieldId(['loginModal', 'consentPrompt'])}
                  highlighted={highlightedId === fieldId(['loginModal', 'consentPrompt'])}
                  label="Prompt before declaration is read"
                  value={content.loginModal.consentPrompt}
                  onChange={(v) => set(['loginModal', 'consentPrompt'], v)}
                />
              </div>
              <Field
                id={fieldId(['loginModal', 'submitButton'])}
                highlighted={highlightedId === fieldId(['loginModal', 'submitButton'])}
                label="Submit button label"
                value={content.loginModal.submitButton}
                onChange={(v) => set(['loginModal', 'submitButton'], v)}
              />
            </Section>
          </div>

          <div className="sticky bottom-0 z-40 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 px-5 py-4 shadow-xl backdrop-blur-sm">
            <div>
              {status.success ? (
                <p className="text-sm font-medium text-ia-green">{status.success}</p>
              ) : status.error ? (
                <p className="text-sm font-medium text-red-500">{status.error}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  Text changes go live only after you hit Save — photos go live the moment you upload them.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={status.saving}
              className="w-full flex-1 rounded-xl bg-ia-blue px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-ia-blue-soft disabled:opacity-60 sm:w-auto sm:flex-none"
            >
              {status.saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        <div className="hidden xl:block">
          <div className="sticky top-16 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
              <span className="text-xs font-bold text-gray-500">Live preview</span>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[0.6rem] font-extrabold text-ia-green">
                Click anything to jump to its field
              </span>
            </div>
            <iframe
              ref={iframeRef}
              src="/?preview=1"
              title="Homepage live preview"
              className="h-[calc(100vh-9rem)] w-full border-0"
            />
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
