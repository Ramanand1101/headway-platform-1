'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

export default function CompanyDirectoryPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ uploading: false, error: '' });

  function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, ...extra };
  }

  function loadCompanies() {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`, { headers: authHeaders() })
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
    loadCompanies();
  }, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!nameDraft.trim()) {
      setUploadStatus({ uploading: false, error: 'Type the company name first, then choose a logo file.' });
      return;
    }

    setUploadStatus({ uploading: true, error: '' });
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('name', nameDraft.trim());

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      setUploadStatus({ uploading: false, error: data.error || 'Could not upload logo' });
      return;
    }

    setCompanies((prev) => [...prev, data.company].sort((a, b) => a.name.localeCompare(b.name)));
    setNameDraft('');
    setUploadStatus({ uploading: false, error: '' });
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

          <div className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Company name
              </label>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="e.g. LIC of India"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500"
              />
            </div>
            <label className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700">
              {uploadStatus.uploading ? 'Uploading...' : '+ Upload logo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploadStatus.uploading}
                className="hidden"
              />
            </label>
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
            <p className="mt-6 text-sm text-gray-400">No companies yet — add one above.</p>
          )}
        </div>
      </main>
    </div>
  );
}
