'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

const TYPES = [
  { key: 'image', label: 'Images' },
  { key: 'carousel', label: 'Carousels' },
  { key: 'reel', label: 'Reels' }
];

const CATEGORIES = [
  { key: 'life', label: 'Life' },
  { key: 'health', label: 'Health' },
  { key: 'general', label: 'General' }
];

export default function CreativesLibraryPage() {
  const [activeType, setActiveType] = useState('image');
  const [activeCategory, setActiveCategory] = useState('life');
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ uploading: false, progress: '', error: '' });
  // Headline/description edits, keyed by creative id — kept separate from
  // `creatives` so typing doesn't refetch/rerender the whole grid.
  const [drafts, setDrafts] = useState({});
  const [saveStatus, setSaveStatus] = useState({});

  function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, ...extra };
  }

  function loadCreatives(type, category) {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/creatives?type=${type}&category=${category}`, {
      headers: authHeaders()
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load creatives');
        return data;
      })
      .then((data) => {
        const list = data.creatives || [];
        setCreatives(list);
        setDrafts(
          Object.fromEntries(list.map((c) => [c._id, { title: c.title || '', description: c.description || '' }]))
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setError('');
    loadCreatives(activeType, activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, activeCategory]);

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';

    setUploadStatus({ uploading: true, progress: `Uploading 1 of ${files.length}...`, error: '' });

    // One request per file (not batched) so a big multi-select never trips
    // the hosting platform's per-request body size limit.
    for (let i = 0; i < files.length; i += 1) {
      setUploadStatus({ uploading: true, progress: `Uploading ${i + 1} of ${files.length}...`, error: '' });
      const formData = new FormData();
      formData.append('images', files[i]);
      formData.append('category', activeCategory);
      formData.append('type', activeType);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/creatives`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadStatus({ uploading: false, progress: '', error: data.error || `Could not upload ${files[i].name}` });
        loadCreatives(activeType, activeCategory);
        return;
      }
    }

    setUploadStatus({ uploading: false, progress: '', error: '' });
    loadCreatives(activeType, activeCategory);
  }

  async function handleDelete(id) {
    setCreatives((prev) => prev.filter((c) => c._id !== id));
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/creatives/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
  }

  function updateDraft(id, field, value) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function handleSave(id) {
    setSaveStatus((prev) => ({ ...prev, [id]: 'saving' }));
    const draft = drafts[id] || {};
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/creatives/${id}`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title: draft.title, description: draft.description })
    });
    if (res.ok) {
      setSaveStatus((prev) => ({ ...prev, [id]: 'saved' }));
      setTimeout(() => setSaveStatus((prev) => ({ ...prev, [id]: '' })), 1500);
    } else {
      setSaveStatus((prev) => ({ ...prev, [id]: 'error' }));
    }
  }

  const typeLabel = TYPES.find((t) => t.key === activeType)?.label;
  const categoryLabel = CATEGORIES.find((c) => c.key === activeCategory)?.label;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Creatives library</h1>
          <p className="mt-2 text-gray-500">
            Marketing content shared with every advisor&apos;s Content Library, organized by format and insurance
            line. Add a headline and description so advisors know what each piece is for.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveType(t.key)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  activeType === t.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === cat.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="font-semibold text-gray-900">
                {typeLabel} · {categoryLabel}
              </p>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${creatives.length} item${creatives.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <label className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700">
              {uploadStatus.uploading
                ? uploadStatus.progress
                : `+ Upload ${activeType === 'reel' ? 'videos' : activeType === 'carousel' ? 'file' : 'images'}`}
              <input
                type="file"
                accept={activeType === 'reel' ? 'video/*' : activeType === 'carousel' ? 'image/*,application/pdf' : 'image/*'}
                multiple
                onChange={handleUpload}
                disabled={uploadStatus.uploading}
                className="hidden"
              />
            </label>
          </div>
          {uploadStatus.error && <p className="mt-2 text-sm text-red-600">{uploadStatus.error}</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <div className="mt-6 space-y-4">
            {creatives.map((creative) => {
              const draft = drafts[creative._id] || { title: '', description: '' };
              const status = saveStatus[creative._id];
              return (
                <div
                  key={creative._id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row"
                >
                  <div className="relative h-32 w-32 flex-none overflow-hidden rounded-lg bg-gray-50">
                    {creative.format === 'pdf' ? (
                      <a
                        href={creative.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-red-500 hover:bg-gray-100"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-8 w-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
                          <path strokeLinecap="round" d="M15 4v4h4" />
                        </svg>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wide">PDF</span>
                      </a>
                    ) : creative.type === 'reel' ? (
                      <video src={creative.imageUrl} className="h-full w-full object-cover" muted controls />
                    ) : (
                      <img src={creative.imageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      value={draft.title}
                      onChange={(e) => updateDraft(creative._id, 'title', e.target.value)}
                      placeholder="Headline, e.g. 'Term insurance made simple'"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-primary-600"
                    />
                    <textarea
                      value={draft.description}
                      onChange={(e) => updateDraft(creative._id, 'description', e.target.value)}
                      placeholder="Description — what this piece is about, or a ready-made caption."
                      rows={2}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-600"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSave(creative._id)}
                        disabled={status === 'saving'}
                        className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
                      >
                        {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved ✓' : 'Save'}
                      </button>
                      {status === 'error' && <span className="text-xs text-red-600">Could not save</span>}
                      <button
                        onClick={() => handleDelete(creative._id)}
                        className="ml-auto text-xs font-bold text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && creatives.length === 0 && (
            <p className="mt-6 text-sm text-gray-400">Nothing here yet — upload some above.</p>
          )}
        </div>
      </main>
    </div>
  );
}
