'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

const CATEGORIES = [
  { key: 'life', label: 'Life' },
  { key: 'health', label: 'Health' },
  { key: 'general', label: 'General' },
  { key: 'mutual-funds', label: 'Mutual Funds' }
];

export default function CreativesLibraryPage() {
  const [activeCategory, setActiveCategory] = useState('life');
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ uploading: false, progress: '', error: '' });

  function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, ...extra };
  }

  function loadCategory(category) {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/creatives?category=${category}`, {
      headers: authHeaders()
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load creatives');
        return data;
      })
      .then((data) => setCreatives(data.creatives || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setError('');
    loadCategory(activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/creatives`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadStatus({ uploading: false, progress: '', error: data.error || `Could not upload ${files[i].name}` });
        loadCategory(activeCategory);
        return;
      }
    }

    setUploadStatus({ uploading: false, progress: '', error: '' });
    loadCategory(activeCategory);
  }

  async function handleDelete(id) {
    setCreatives((prev) => prev.filter((c) => c._id !== id));
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/creatives/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Creatives library</h1>
          <p className="mt-2 text-gray-500">
            Marketing images shared with every advisor&apos;s Content Library, organized by insurance line.
          </p>

          <div className="mt-8 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
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
              <p className="font-semibold text-gray-900">{CATEGORIES.find((c) => c.key === activeCategory)?.label} folder</p>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${creatives.length} image${creatives.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <label className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700">
              {uploadStatus.uploading ? uploadStatus.progress : '+ Upload images'}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={uploadStatus.uploading}
                className="hidden"
              />
            </label>
          </div>
          {uploadStatus.error && <p className="mt-2 text-sm text-red-600">{uploadStatus.error}</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {creatives.map((creative) => (
              <div key={creative._id} className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                <img src={creative.imageUrl} alt="" className="aspect-square w-full object-cover" />
                <button
                  onClick={() => handleDelete(creative._id)}
                  className="absolute right-2 top-2 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-bold text-red-500 opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {!loading && creatives.length === 0 && (
            <p className="mt-6 text-sm text-gray-400">No images in this folder yet — upload some above.</p>
          )}
        </div>
      </main>
    </div>
  );
}
