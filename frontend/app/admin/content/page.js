'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

export default function GenerateContentPage() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [results, setResults] = useState({});
  const [topics, setTopics] = useState({});
  const [advisorsError, setAdvisorsError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Could not load advisors');
        }
        return data;
      })
      .then((data) => setAdvisors(data.advisors || []))
      .catch((err) => setAdvisorsError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function generate(advisorId) {
    setGeneratingId(advisorId);
    setResults((prev) => ({ ...prev, [advisorId]: null }));

    const token = localStorage.getItem('token');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/content/generate/${advisorId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: topics[advisorId] || '',
          publish: true
        })
      }
    );
    const data = await res.json();

    setResults((prev) => ({
      ...prev,
      [advisorId]: res.ok
        ? { ok: true, post: data.post }
        : { ok: false, error: data.error || 'Generation failed' }
    }));
    setGeneratingId(null);
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Generate content
          </h1>
          <p className="mt-2 text-gray-500">
            Give a topic (or leave blank for a general tip). The post publishes
            immediately and shows up on the advisor&apos;s blog page.
          </p>

          {loading ? (
            <p className="mt-8 text-gray-500">Loading advisors...</p>
          ) : advisorsError ? (
            <p className="mt-8 text-sm text-red-600">
              {advisorsError} — try logging out and back in.
            </p>
          ) : advisors.length === 0 ? (
            <p className="mt-8 text-gray-500">No advisors yet.</p>
          ) : (
            <div className="mt-8 space-y-3">
              {advisors.map((advisor) => {
                const id = advisor._id;
                const result = results[id];
                return (
                  <div
                    key={advisor.slug}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{advisor.name}</p>
                      <p className="text-sm text-gray-500">
                        {advisor.slug}.{process.env.NEXT_PUBLIC_BASE_DOMAIN}
                        {advisor.city ? ` · ${advisor.city}` : ''}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <input
                        value={topics[id] || ''}
                        onChange={(e) =>
                          setTopics((prev) => ({ ...prev, [id]: e.target.value }))
                        }
                        placeholder="Topic (e.g. tax-saving before March)"
                        className="min-w-[240px] flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        onClick={() => generate(id)}
                        disabled={generatingId === id}
                        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
                      >
                        {generatingId === id ? 'Generating...' : 'Generate & publish'}
                      </button>
                    </div>

                    {result?.ok && (
                      <div className="mt-4 rounded-xl bg-primary-50 p-4">
                        <p className="text-sm font-medium text-primary-900">
                          {result.post.title}
                        </p>
                        <p className="mt-1 text-sm text-primary-800">
                          {result.post.body}
                        </p>
                        <p className="mt-2 text-xs font-medium text-primary-600">
                          ✓ Published — live on{' '}
                          {advisor.slug}.{process.env.NEXT_PUBLIC_BASE_DOMAIN}/blog
                        </p>
                      </div>
                    )}
                    {result && !result.ok && (
                      <p className="mt-3 text-sm text-red-600">{result.error}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
