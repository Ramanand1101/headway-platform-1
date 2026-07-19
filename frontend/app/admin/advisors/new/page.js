'use client';
import { useState } from 'react';
import AdminSidebar from '../../../../components/AdminSidebar';

const inputClasses =
  'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';
const labelClasses = 'text-sm font-medium text-gray-700';

export default function NewAdvisorPage() {
  const [form, setForm] = useState({
    slug: '',
    name: '',
    city: '',
    bio: '',
    contactNumber: '',
    whatsappNumber: '',
    specialization: '',
    services: ''
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const [file, setFile] = useState(null);
  const [bulkStatus, setBulkStatus] = useState({ loading: false, error: '', result: null });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function downloadTemplate() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/template`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'advisor-template.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  async function handleBulkUpload(e) {
    e.preventDefault();
    if (!file) return;

    setBulkStatus({ loading: true, error: '', result: null });

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();

    if (!res.ok) {
      setBulkStatus({ loading: false, error: data.error || 'Upload failed', result: null });
      return;
    }

    setBulkStatus({ loading: false, error: '', result: data });
    setFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/onboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        slug: form.slug.trim().toLowerCase(),
        name: form.name.trim(),
        city: form.city.trim(),
        bio: form.bio.trim(),
        contactNumber: form.contactNumber.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
        specialization: form.specialization
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        services: form.services
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus({ loading: false, error: data.error || 'Could not add advisor', success: '' });
      return;
    }

    setStatus({
      loading: false,
      error: '',
      success: `${data.advisor.name} is live at ${data.advisor.slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`
    });
    setForm({
      slug: '',
      name: '',
      city: '',
      bio: '',
      contactNumber: '',
      whatsappNumber: '',
      specialization: '',
      services: ''
    });
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Add advisors</h1>
          <p className="mt-2 text-gray-500">
            Add one advisor below, or upload many at once with a CSV.
          </p>

          <div className="mt-8 rounded-2xl border border-primary-100 bg-primary-50 p-6">
            <h2 className="text-sm font-semibold text-primary-900">Bulk upload via CSV</h2>
            <p className="mt-1 text-sm text-primary-700">
              Download the template — every column and an example row are already filled in.
              Delete the example row, add your advisors, then upload it below.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={downloadTemplate}
                className="rounded-lg border border-primary-300 bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm transition hover:bg-primary-100"
              >
                ↓ Download template CSV
              </button>
            </div>

            <form onSubmit={handleBulkUpload} className="mt-4 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-700"
              />
              <button
                type="submit"
                disabled={bulkStatus.loading || !file}
                className="rounded-lg bg-primary-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-800 disabled:opacity-60"
              >
                {bulkStatus.loading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </form>

            {bulkStatus.error && <p className="mt-3 text-sm text-red-600">{bulkStatus.error}</p>}
            {bulkStatus.result && (
              <div className="mt-4 rounded-xl bg-white p-4 text-sm">
                <p className="font-medium text-primary-700">
                  ✓ {bulkStatus.result.created.length} advisor
                  {bulkStatus.result.created.length === 1 ? '' : 's'} added and live.
                </p>
                {bulkStatus.result.skipped.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-gray-600">
                      {bulkStatus.result.skipped.length} row
                      {bulkStatus.result.skipped.length === 1 ? '' : 's'} skipped:
                    </p>
                    <ul className="mt-1 list-inside list-disc text-gray-500">
                      {bulkStatus.result.skipped.map((s, i) => (
                        <li key={i}>
                          {s.slug || '(blank slug)'} — {s.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Or add one manually
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClasses}>Slug (subdomain) *</label>
                <input
                  value={form.slug}
                  onChange={(e) => update('slug', e.target.value)}
                  placeholder="priya"
                  required
                  className={`mt-1 ${inputClasses}`}
                />
              </div>
              <div>
                <label className={labelClasses}>Full name *</label>
                <input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Priya Sharma"
                  required
                  className={`mt-1 ${inputClasses}`}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClasses}>City</label>
                <input
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  placeholder="Mumbai"
                  className={`mt-1 ${inputClasses}`}
                />
              </div>
              <div>
                <label className={labelClasses}>Contact number</label>
                <input
                  value={form.contactNumber}
                  onChange={(e) => update('contactNumber', e.target.value)}
                  placeholder="9876543210"
                  className={`mt-1 ${inputClasses}`}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>WhatsApp number</label>
              <input
                value={form.whatsappNumber}
                onChange={(e) => update('whatsappNumber', e.target.value)}
                placeholder="919876543210"
                className={`mt-1 ${inputClasses}`}
              />
            </div>

            <div>
              <label className={labelClasses}>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
                rows={3}
                placeholder="10+ years helping families plan their finances."
                className={`mt-1 ${inputClasses}`}
              />
            </div>

            <div>
              <label className={labelClasses}>Specialization (comma separated)</label>
              <input
                value={form.specialization}
                onChange={(e) => update('specialization', e.target.value)}
                placeholder="Tax Planning, Insurance"
                className={`mt-1 ${inputClasses}`}
              />
            </div>

            <div>
              <label className={labelClasses}>Services (comma separated)</label>
              <input
                value={form.services}
                onChange={(e) => update('services', e.target.value)}
                placeholder="Tax Saving, Retirement Planning"
                className={`mt-1 ${inputClasses}`}
              />
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
            >
              {status.loading ? 'Adding...' : 'Add advisor'}
            </button>

            {status.error && <p className="text-sm text-red-600">{status.error}</p>}
            {status.success && (
              <p className="rounded-xl bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700">
                {status.success}
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
