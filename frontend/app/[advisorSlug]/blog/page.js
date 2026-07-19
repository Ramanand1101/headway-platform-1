import Link from 'next/link';
import { fetchAdvisorContent } from '../../../lib/api';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function excerpt(text, length = 160) {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

export default async function BlogPage({ params }) {
  const { posts } = await fetchAdvisorContent(params.advisorSlug);

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-sm font-bold uppercase tracking-widest text-[var(--tc-primary)]">Insights</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl">
        Latest updates
      </h1>
      <p className="mt-3 text-gray-500">
        Practical, jargon-free tips on money, tax and investing.
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-gray-500">No posts published yet — check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {formatDate(post.publishedAt || post.createdAt)}
              </p>
              <h2 className="mt-2 text-lg font-bold text-[var(--tc-dark)] group-hover:text-[var(--tc-primary)]">
                {post.title}
              </h2>
              <p className="mt-2 flex-1 text-sm text-gray-600">{excerpt(post.body)}</p>
              <span className="mt-4 text-sm font-bold text-[var(--tc-primary)]">
                Read more →
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
