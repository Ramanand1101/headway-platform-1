'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

const statusStyles = {
  new: 'bg-amber-50 text-amber-700',
  contacted: 'bg-blue-50 text-blue-700',
  converted: 'bg-green-50 text-green-700'
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HomepageLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage-leads`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setLeads(data.leads || []))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
    const token = localStorage.getItem('token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage-leads/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Website enquiries</h1>
          <p className="mt-2 text-gray-500">
            Submissions from the homepage&apos;s &quot;Claim Free Website&quot; contact form — prospective advisors
            who haven&apos;t signed up yet.
          </p>

          {loading ? (
            <p className="mt-8 text-sm text-gray-400">Loading...</p>
          ) : leads.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-10 text-center text-sm text-gray-500">
              No enquiries yet.
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-[0.7rem] font-extrabold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">IRDAI License</th>
                    <th className="px-5 py-3.5">City</th>
                    <th className="px-5 py-3.5">Message</th>
                    <th className="px-5 py-3.5">Received</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="border-t border-gray-100 bg-white">
                      <td className="px-5 py-4">
                        <span className="block font-semibold">{lead.name}</span>
                        {lead.phone && <span className="mt-0.5 block text-xs text-gray-400">{lead.phone}</span>}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{lead.irdaiLicenseNumber || '—'}</td>
                      <td className="px-5 py-4 text-gray-600">{lead.city || '—'}</td>
                      <td className="max-w-[220px] truncate px-5 py-4 text-gray-600">{lead.message || '—'}</td>
                      <td className="px-5 py-4 text-gray-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-5 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead._id, e.target.value)}
                          className={`rounded-full border-none px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide outline-none ${statusStyles[lead.status]}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
