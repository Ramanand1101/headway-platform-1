import Link from 'next/link';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function excerpt(text, length = 120) {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

export default function BlogTeaser({ posts }) {
  if (!posts?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.slice(0, 3).map((post) => (
        <Link
          key={post._id}
          href={`/blog/${post.slug}`}
          className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {formatDate(post.publishedAt || post.createdAt)}
          </p>
          <h4 className="mt-2 text-base font-bold text-[var(--tc-dark)] group-hover:text-[var(--tc-primary)]">
            {post.title}
          </h4>
          <p className="mt-2 flex-1 text-sm text-gray-500">{excerpt(post.body)}</p>
          <span className="mt-4 text-sm font-bold text-[var(--tc-primary)]">Read Article →</span>
        </Link>
      ))}
    </div>
  );
}
