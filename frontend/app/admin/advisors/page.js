'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

const inputClasses =
  'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

const PAGE_SIZE = 20;

export default function AdminAdvisorsPage() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [popupSlug, setPopupSlug] = useState(null);
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '' });

  // Debounce the search box so we're not hitting the backend on every
  // keystroke; typing a new query always jumps back to page 1.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (search) params.set('q', search);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setAdvisors(data.advisors || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total ?? (data.advisors || []).length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search]);

  function openPopup(slug) {
    setPopupSlug(slug);
    setCreds({ email: '', password: '' });
    setStatus({ loading: false, error: '' });
  }

  function closePopup() {
    setPopupSlug(null);
  }

  async function verifyAndEnter(e) {
    e.preventDefault();
    setStatus({ loading: true, error: '' });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/${popupSlug}/admin-enter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus({ loading: false, error: data.error || 'Could not verify admin credentials' });
      return;
    }

    // Keep the admin's own panel token so "Back to Admin" (shown in the
    // advisor dashboard while impersonating) can restore it.
    const adminToken = localStorage.getItem('token');
    if (adminToken) localStorage.setItem('adminToken', adminToken);
    localStorage.setItem('token', data.token);
    // "Edit Profile" is the actual split-view editor (form + live preview
    // side-by-side, updating in real time) — the closest match to the
    // homepage editor experience, unlike "My Website" which is just a link banner.
    window.location.href = '/advisor/dashboard#profile';
  }

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900">Advisor microsites</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Click any advisor's microsite link, confirm your admin login, then edit their full website
            — text, photos, data and buttons — same as the homepage editor.
          </p>

          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search advisors by name or slug..."
            className={`${inputClasses} mt-6 max-w-sm`}
          />

          <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {loading ? (
              <p className="p-5 text-sm text-gray-400">Loading advisors...</p>
            ) : advisors.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No advisors found.</p>
            ) : (
              advisors.map((a) => (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => openPopup(a.slug)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-primary-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">{a.name}</p>
                    <p className="truncate text-xs font-medium text-primary-600">
                      {a.slug}.{baseDomain}
                    </p>
                  </div>
                  <span className="flex-none text-xs font-bold text-gray-400">Open editor →</span>
                </button>
              ))
            )}
          </div>

          {!loading && total > 0 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                Page {page} of {totalPages} — {total} advisor{total === 1 ? '' : 's'} total
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {popupSlug && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && closePopup()}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900">Confirm admin login</h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter your admin credentials to edit <strong>{popupSlug}</strong>'s website.
            </p>

            <form onSubmit={verifyAndEnter} className="mt-5 space-y-3">
              <input
                type="email"
                value={creds.email}
                onChange={(e) => setCreds((c) => ({ ...c, email: e.target.value }))}
                placeholder="Admin email"
                required
                className={inputClasses}
              />
              <input
                type="password"
                value={creds.password}
                onChange={(e) => setCreds((c) => ({ ...c, password: e.target.value }))}
                placeholder="Admin password"
                required
                className={inputClasses}
              />
              {status.error && <p className="text-sm text-red-500">{status.error}</p>}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={closePopup}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status.loading}
                  className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
                >
                  {status.loading ? 'Verifying...' : 'Enter editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
