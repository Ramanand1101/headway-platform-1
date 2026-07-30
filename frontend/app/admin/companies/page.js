'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

const CATEGORIES = [
  { key: 'life', label: 'Life' },
  { key: 'health', label: 'Health' },
  { key: 'general', label: 'General' }
];

// Turns "hdfc-life.png" / "LIC_of_India.jpg" into a readable company name —
// lets a whole folder of logo files get named automatically on bulk upload.
function deriveNameFromFilename(filename) {
  const base = filename.replace(/\.[^/.]+$/, '');
  const spaced = base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return spaced
    .split(' ')
    .map((word) => (word === word.toLowerCase() ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

export default function CompanyDirectoryPage() {
  const [activeCategory, setActiveCategory] = useState('life');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ uploading: false, progress: '', error: '' });

  function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, ...extra };
  }

  function loadCompanies(category) {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies?category=${category}`, { headers: authHeaders() })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load companies');
        return data;
      })
      .then((data) => setCompanies(data.companies || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setError('');
    loadCompanies(activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // Handles both a manual multi-select and a whole-folder pick — either way
  // it's just a FileList of images. A single file keeps the typed name (if
  // any); anything more auto-names each logo from its filename.
  async function handleUpload(e) {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;

    const useTypedName = files.length === 1 && nameDraft.trim();

    setUploadStatus({ uploading: true, progress: `Uploading 1 of ${files.length}...`, error: '' });
    const created = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const name = useTypedName ? nameDraft.trim() : deriveNameFromFilename(file.name);
      setUploadStatus({ uploading: true, progress: `Uploading ${i + 1} of ${files.length} — ${name}`, error: '' });

      const formData = new FormData();
      formData.append('logo', file);
      formData.append('name', name);
      formData.append('category', activeCategory);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadStatus({
          uploading: false,
          progress: '',
          error: `${data.error || 'Upload failed'} (stopped at "${file.name}", ${created.length} of ${files.length} added)`
        });
        setCompanies((prev) => [...prev, ...created].sort((a, b) => a.name.localeCompare(b.name)));
        return;
      }
      created.push(data.company);
    }

    setCompanies((prev) => [...prev, ...created].sort((a, b) => a.name.localeCompare(b.name)));
    setNameDraft('');
    setUploadStatus({ uploading: false, progress: '', error: '' });
  }

  async function handleDelete(id) {
    setCompanies((prev) => prev.filter((c) => c._id !== id));
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Company directory</h1>
          <p className="mt-2 text-gray-500">
            Insurer logos every advisor can pick from for their &quot;Company working with&quot; section, instead of
            sourcing and uploading the same logos themselves.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-100 pb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === cat.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Company name — {CATEGORIES.find((c) => c.key === activeCategory)?.label} folder (only used for a
                  single file; bulk uploads auto-name from the filename)
                </label>
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="e.g. LIC of India"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500"
                />
              </div>
              <label className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700">
                {uploadStatus.uploading ? 'Uploading...' : '+ Upload logos'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  disabled={uploadStatus.uploading}
                  className="hidden"
                />
              </label>
              <label className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50">
                {uploadStatus.uploading ? 'Uploading...' : '📁 Upload whole folder'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  webkitdirectory=""
                  directory=""
                  onChange={handleUpload}
                  disabled={uploadStatus.uploading}
                  className="hidden"
                />
              </label>
            </div>
            {uploadStatus.uploading && <p className="mt-3 text-xs text-gray-500">{uploadStatus.progress}</p>}
          </div>
          {uploadStatus.error && <p className="mt-2 text-sm text-red-600">{uploadStatus.error}</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {companies.map((company) => (
              <div
                key={company._id}
                className="group relative flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm"
              >
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg bg-gray-50 p-2">
                  <img src={company.logoUrl} alt={company.name} className="h-full w-full object-contain" />
                </div>
                <p className="text-xs font-bold text-gray-800">{company.name}</p>
                <button
                  onClick={() => handleDelete(company._id)}
                  className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-[0.65rem] font-bold text-red-500 opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {!loading && companies.length === 0 && (
            <p className="mt-6 text-sm text-gray-400">No companies in this folder yet — upload some above.</p>
          )}
        </div>
      </main>
    </div>
  );
}
