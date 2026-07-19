import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogPost } from '../../../../lib/api';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export default async function BlogPostPage({ params }) {
  const data = await fetchBlogPost(params.advisorSlug, params.slug);
  if (!data) notFound();

  const { post } = data;

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/blog" className="text-sm font-bold text-[var(--tc-primary)] hover:opacity-80">
        ← Back to all posts
      </Link>

      <article className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
          {formatDate(post.publishedAt || post.createdAt)}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--tc-dark)] sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-8 space-y-4 whitespace-pre-line text-lg leading-relaxed text-gray-700">
          {post.body}
        </div>
      </article>
    </main>
  );
}
