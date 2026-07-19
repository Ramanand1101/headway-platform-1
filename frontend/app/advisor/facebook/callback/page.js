'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CallbackInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState({ loading: true, error: '' });
  const [pagePicker, setPagePicker] = useState(null); // { pages, userAccessToken }
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorDescription = searchParams.get('error_description');

    if (errorDescription) {
      setStatus({ loading: false, error: errorDescription });
      return;
    }
    if (!code) {
      setStatus({ loading: false, error: 'Missing authorization code from Facebook.' });
      return;
    }

    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code })
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setStatus({ loading: false, error: data.error || 'Could not connect Facebook' });
          return;
        }
        if (data.needsPageSelection) {
          setPagePicker({ pages: data.pages, userAccessToken: data.userAccessToken });
          setStatus({ loading: false, error: '' });
          return;
        }
        window.location.href = '/advisor/dashboard#social';
      })
      .catch(() => setStatus({ loading: false, error: 'Could not connect Facebook' }));
  }, [searchParams]);

  async function choosePage(pageId) {
    setSelecting(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/facebook/select-page`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pageId, userAccessToken: pagePicker.userAccessToken })
    });
    const data = await res.json();
    if (!res.ok) {
      setSelecting(false);
      setStatus({ loading: false, error: data.error || 'Could not connect the selected Page' });
      return;
    }
    window.location.href = '/advisor/dashboard#social';
  }

  if (pagePicker) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50/60 to-white px-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100">
          <h1 className="text-lg font-bold text-ia-navy">Choose a Facebook Page</h1>
          <p className="mt-2 text-sm text-gray-500">You manage more than one Page. Pick the one to connect.</p>
          <div className="mt-5 space-y-2.5">
            {pagePicker.pages.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={selecting}
                onClick={() => choosePage(p.id)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-bold transition hover:bg-gray-50 disabled:opacity-60"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50/60 to-white px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100">
        {status.loading ? (
          <>
            <h1 className="text-lg font-bold text-ia-navy">Connecting your Facebook Page...</h1>
            <p className="mt-2 text-sm text-gray-500">Just a moment.</p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold text-ia-navy">Couldn&apos;t connect Facebook</h1>
            <p className="mt-2 text-sm text-red-500">{status.error}</p>
            <Link
              href="/advisor/dashboard#social"
              className="mt-5 inline-block rounded-xl bg-ia-blue px-5 py-2.5 text-sm font-bold text-white"
            >
              Back to dashboard
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function FacebookCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  );
}
