'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

const inputClasses =
  'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export default function MyBlogPage() {
  const [advisor, setAdvisor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quickTopic, setQuickTopic] = useState('');
  const [quickStatus, setQuickStatus] = useState({ loading: false, error: '' });

  const [draftTopic, setDraftTopic] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [publishStatus, setPublishStatus] = useState({ loading: false, error: '', success: '' });

  function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, ...extra };
  }

  function loadAll() {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/me`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setAdvisor(data.advisor));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/mine`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadAll();
  }, []);

  const isPremium = advisor?.planTier === 'premium';
  const creditsLeft = advisor?.aiCredits ?? 0;
  const aiBlocked = !isPremium && creditsLeft <= 0;

  async function handleQuickGenerate(e) {
    e.preventDefault();
    setQuickStatus({ loading: true, error: '' });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/mine/generate`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ topic: quickTopic })
    });
    const data = await res.json();

    if (!res.ok) {
      setQuickStatus({ loading: false, error: data.error || 'Could not generate' });
      return;
    }

    setQuickStatus({ loading: false, error: '' });
    setQuickTopic('');
    loadAll();
  }

  async function handleDraft() {
    setDrafting(true);
    setDraftError('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/mine/draft`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ topic: draftTopic })
    });
    const data = await res.json();

    if (!res.ok) {
      setDraftError(data.error || 'Could not draft with AI');
      setDrafting(false);
      return;
    }

    setTitle(data.draft.title);
    setBody(data.draft.body);
    setDrafting(false);
    setAdvisor((prev) => (prev ? { ...prev, aiCredits: data.aiCredits } : prev));
  }

  async function handlePublish(e) {
    e.preventDefault();
    setPublishStatus({ loading: true, error: '', success: '' });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/mine/manual`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title, body })
    });
    const data = await res.json();

    if (!res.ok) {
      setPublishStatus({ loading: false, error: data.error || 'Could not publish', success: '' });
      return;
    }

    setPublishStatus({ loading: false, error: '', success: 'Published to your blog.' });
    setTitle('');
    setBody('');
    setDraftTopic('');
    loadAll();
  }

  async function handleDelete(postId) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/mine/${postId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Your blog</h1>
          <p className="mt-2 text-gray-500">
            Generate posts with AI or write them yourself — they publish straight to your
            live blog.
          </p>

          {loading ? (
            <p className="mt-8 text-gray-500">Loading...</p>
          ) : (
            <>
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    AI credits
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {isPremium ? 'Unlimited (Premium)' : `${creditsLeft} free left`}
                  </p>
                </div>
                {!isPremium && (
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                    {advisor?.planTier || 'basic'} plan
                  </span>
                )}
              </div>

              {aiBlocked && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-sm font-semibold text-amber-900">
                    You&apos;ve used all your free AI posts.
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    Upgrade to Premium for unlimited AI-generated blog posts, plus priority
                    support and a custom domain. You can still write posts yourself for
                    free below.
                  </p>
                  <a
                    href="mailto:headwaytalentconsulting@gmail.com?subject=Upgrade to Premium"
                    className="mt-3 inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700"
                  >
                    Upgrade to Premium
                  </a>
                </div>
              )}

              {!aiBlocked && (
                <form
                  onSubmit={handleQuickGenerate}
                  className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <label className="text-sm font-medium text-gray-700">
                    Quick generate &amp; publish
                  </label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <input
                      value={quickTopic}
                      onChange={(e) => setQuickTopic(e.target.value)}
                      placeholder="Topic (optional)"
                      className={`min-w-[200px] flex-1 ${inputClasses}`}
                    />
                    <button
                      type="submit"
                      disabled={quickStatus.loading}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
                    >
                      {quickStatus.loading ? 'Publishing...' : 'Generate & publish'}
                    </button>
                  </div>
                  {quickStatus.error && (
                    <p className="mt-2 text-sm text-red-600">{quickStatus.error}</p>
                  )}
                </form>
              )}

              <div className="mt-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Or draft, review, then publish
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {!aiBlocked && (
                <div className="mt-6 rounded-2xl border border-primary-100 bg-primary-50 p-5">
                  <label className="text-sm font-medium text-primary-900">Draft with AI</label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <input
                      value={draftTopic}
                      onChange={(e) => setDraftTopic(e.target.value)}
                      placeholder="Topic (optional)"
                      className={`min-w-[200px] flex-1 ${inputClasses}`}
                    />
                    <button
                      type="button"
                      onClick={handleDraft}
                      disabled={drafting}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
                    >
                      {drafting ? 'Drafting...' : 'Draft with AI'}
                    </button>
                  </div>
                  {draftError && <p className="mt-2 text-sm text-red-600">{draftError}</p>}
                  <p className="mt-2 text-xs text-primary-700">
                    Fills the fields below — nothing publishes until you hit Publish.
                  </p>
                </div>
              )}

              <form onSubmit={handlePublish} className="mt-4 space-y-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  required
                  className={inputClasses}
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  placeholder="Write your post here, or draft with AI above and edit it."
                  required
                  className={inputClasses}
                />
                <button
                  type="submit"
                  disabled={publishStatus.loading}
                  className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-60"
                >
                  {publishStatus.loading ? 'Publishing...' : 'Publish'}
                </button>
                {publishStatus.error && (
                  <p className="text-sm text-red-600">{publishStatus.error}</p>
                )}
                {publishStatus.success && (
                  <p className="rounded-xl bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700">
                    {publishStatus.success}
                  </p>
                )}
              </form>

              {posts.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-gray-400">
                    Your posts
                  </h2>
                  <div className="mt-4 space-y-3">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{post.title}</p>
                          <p className="text-xs text-gray-400">
                            {post.status} · {formatDate(post.publishedAt || post.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
