'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../../components/AdminSidebar';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export default function WriteBlogPage() {
  const [advisors, setAdvisors] = useState([]);
  const [advisorId, setAdvisorId] = useState('');
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posts, setPosts] = useState([]);
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });
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
      .then((data) => {
        setAdvisors(data.advisors || []);
        if (data.advisors?.length) setAdvisorId(data.advisors[0]._id);
      })
      .catch((err) => setAdvisorsError(err.message));
  }, []);

  useEffect(() => {
    if (!advisorId) return;
    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/all/${advisorId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []));
  }, [advisorId, status.success]);

  async function handleDraft() {
    setDrafting(true);
    setDraftError('');

    const token = localStorage.getItem('token');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/content/draft/${advisorId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      }
    );
    const data = await res.json();

    if (!res.ok) {
      setDraftError(data.error || 'Could not draft with AI');
      setDrafting(false);
      return;
    }

    setTitle(data.draft.title);
    setBody(data.draft.body);
    setDrafting(false);
  }

  async function handlePublish(e) {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    const token = localStorage.getItem('token');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/content/manual/${advisorId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, body })
      }
    );
    const data = await res.json();

    if (!res.ok) {
      setStatus({ loading: false, error: data.error || 'Could not publish', success: '' });
      return;
    }

    setStatus({ loading: false, error: '', success: 'Published to the blog.' });
    setTopic('');
    setTitle('');
    setBody('');
  }

  async function handleDelete(postId) {
    const token = localStorage.getItem('token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }

  const inputClasses =
    'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Write a blog post
          </h1>
          <p className="mt-2 text-gray-500">
            Let AI draft it, then edit and publish — or write it fully yourself.
          </p>

          <div className="mt-8">
            <label className="text-sm font-medium text-gray-700">Advisor</label>
            {advisorsError ? (
              <p className="mt-1 text-sm text-red-600">
                {advisorsError} — try logging out and back in.
              </p>
            ) : (
              <select
                value={advisorId}
                onChange={(e) => setAdvisorId(e.target.value)}
                className={`mt-1 ${inputClasses}`}
              >
                {advisors.length === 0 && <option value="">Loading advisors...</option>}
                {advisors.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.slug})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-primary-100 bg-primary-50 p-5">
            <label className="text-sm font-medium text-primary-900">
              Draft with AI (optional)
            </label>
            <div className="mt-2 flex flex-wrap gap-3">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic — e.g. tax-saving before March (leave blank for a general tip)"
                className={`min-w-[240px] flex-1 ${inputClasses}`}
              />
              <button
                type="button"
                onClick={handleDraft}
                disabled={drafting || !advisorId}
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
              >
                {drafting ? 'Drafting...' : 'Draft with AI'}
              </button>
            </div>
            {draftError && <p className="mt-2 text-sm text-red-600">{draftError}</p>}
            <p className="mt-2 text-xs text-primary-700">
              This only fills the fields below — nothing is published until you hit Publish.
            </p>
          </div>

          <form onSubmit={handlePublish} className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="5 tax-saving tips before March"
                required
                className={`mt-1 ${inputClasses}`}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Post</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                placeholder="Write the full post here, or draft with AI above and edit it."
                required
                className={`mt-1 ${inputClasses}`}
              />
            </div>

            <button
              type="submit"
              disabled={status.loading || !advisorId}
              className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
            >
              {status.loading ? 'Publishing...' : 'Publish'}
            </button>

            {status.error && <p className="text-sm text-red-600">{status.error}</p>}
            {status.success && (
              <p className="rounded-xl bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700">
                {status.success}
              </p>
            )}
          </form>

          {posts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-sm font-medium uppercase tracking-wide text-gray-400">
                Posts for this advisor
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
        </div>
      </main>
    </div>
  );
}
