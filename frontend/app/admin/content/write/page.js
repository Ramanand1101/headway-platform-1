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
  const [imageUrl, setImageUrl] = useState('');
  const [posts, setPosts] = useState([]);
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [imageStatus, setImageStatus] = useState({ working: false, error: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });
  const [advisorsError, setAdvisorsError] = useState('');

  function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, ...extra };
  }

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor`, { headers: authHeaders() })
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/all/${advisorId}`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []));
  }, [advisorId, status.success]);

  async function handleDraft() {
    setDrafting(true);
    setDraftError('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/draft/${advisorId}`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ topic })
    });
    const data = await res.json();

    if (!res.ok) {
      setDraftError(data.error || 'Could not draft with AI');
      setDrafting(false);
      return;
    }

    setTitle(data.draft.title);
    setBody(data.draft.body);
    setImageUrl(data.draft.imageUrl || '');
    setDrafting(false);
  }

  // Regenerates just the image for whatever title/topic is currently set —
  // handy if the auto-generated one from "Draft with AI" doesn't fit.
  async function handleRegenerateImage() {
    setImageStatus({ working: true, error: '' });
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/draft/${advisorId}`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ topic: topic || title })
    });
    const data = await res.json();
    if (!res.ok) {
      setImageStatus({ working: false, error: data.error || 'Could not generate image' });
      return;
    }
    if (!data.draft.imageUrl) {
      setImageStatus({
        working: false,
        error: 'No image came back — check OPENAI_API_KEY is set on the backend.'
      });
      return;
    }
    setImageUrl(data.draft.imageUrl);
    setImageStatus({ working: false, error: '' });
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImageStatus({ working: true, error: '' });

    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/list-image`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      setImageStatus({ working: false, error: data.error || 'Could not upload image' });
      return;
    }
    setImageUrl(data.url);
    setImageStatus({ working: false, error: '' });
  }

  async function handlePublish(e) {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/manual/${advisorId}`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title, body, imageUrl })
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus({ loading: false, error: data.error || 'Could not publish', success: '' });
      return;
    }

    setStatus({ loading: false, error: '', success: 'Published to the blog.' });
    setTopic('');
    setTitle('');
    setBody('');
    setImageUrl('');
  }

  async function handleDelete(postId) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/${postId}`, {
      method: 'DELETE',
      headers: authHeaders()
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
            Let AI draft it — text and a matching image, in one click — then edit and publish. Or write it fully
            yourself.
          </p>

          <div className="mt-8">
            <label className="text-sm font-medium text-gray-700">Advisor (website)</label>
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
              Draft with AI — text + image (optional)
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
              <label className="text-sm font-medium text-gray-700">Featured image</label>
              <div className="mt-1 flex items-center gap-3">
                <div className="h-20 w-32 flex-none overflow-hidden rounded-lg bg-gray-100">
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[0.65rem] text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleRegenerateImage}
                    disabled={imageStatus.working || !advisorId}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    {imageStatus.working ? 'Working...' : '✨ Generate with AI'}
                  </button>
                  <label className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-center text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50">
                    Upload my own
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {imageStatus.error && <p className="mt-1 text-xs text-red-600">{imageStatus.error}</p>}
            </div>

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
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 flex-none overflow-hidden rounded-lg bg-gray-100">
                        {post.imageUrl && <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{post.title}</p>
                        <p className="text-xs text-gray-400">
                          {post.status} · {formatDate(post.publishedAt || post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="flex-none text-sm text-red-500 hover:text-red-700"
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
