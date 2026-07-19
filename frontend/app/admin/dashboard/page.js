'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

// Advisor's self-service dashboard: review AI-drafted content before it publishes.
export default function DashboardPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []));
  }, []);

  async function approve(id) {
    const token = localStorage.getItem('token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/${id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    setPosts((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Pending content</h1>

          {posts.length === 0 ? (
            <p className="mt-6 text-gray-500">Nothing pending review right now.</p>
          ) : (
            <div className="mt-8 space-y-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                  <p className="mt-2 text-gray-600">{post.body}</p>
                  <button
                    onClick={() => approve(post._id)}
                    className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
                  >
                    Approve &amp; publish
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
