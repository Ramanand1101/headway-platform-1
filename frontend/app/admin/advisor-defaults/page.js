'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

// Admin-set default Vision & Mission text + photos — every advisor's
// dashboard prefills these until they replace or clear them with their own.
// Stored generically via SiteContent (page key: "advisor-defaults"), same
// mechanism as the homepage editor.
export default function AdvisorDefaultsPage() {
  const [vision, setVision] = useState('');
  const [mission, setMission] = useState('');
  const [visionImage, setVisionImage] = useState('');
  const [missionImage, setMissionImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ saving: false, error: '', success: '' });
  const [imageStatus, setImageStatus] = useState({});

  function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, ...extra };
  }

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/content/advisor-defaults`)
      .then((res) => res.json())
      .then((data) => {
        setVision(data.content?.vision || '');
        setMission(data.content?.mission || '');
        setVisionImage(data.content?.visionImage || '');
        setMissionImage(data.content?.missionImage || '');
      })
      .finally(() => setLoading(false));
  }, []);

  // Uploads a file and gets back a hosted URL — reuses the same generic
  // list-image endpoint the advisor dashboard uses for company logos etc.
  async function uploadImageFile(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/list-image`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not upload photo');
    return data.url;
  }

  async function handleImageChange(field, setField, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageStatus((prev) => ({ ...prev, [field]: { uploading: true, error: '' } }));
    try {
      const url = await uploadImageFile(file);
      setField(url);
      setImageStatus((prev) => ({ ...prev, [field]: { uploading: false, error: '' } }));
    } catch (err) {
      setImageStatus((prev) => ({ ...prev, [field]: { uploading: false, error: err.message } }));
    }
  }

  async function handleSave() {
    setStatus({ saving: true, error: '', success: '' });
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/site/content/advisor-defaults`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        data: { vision: vision.trim(), mission: mission.trim(), visionImage, missionImage }
      })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus({ saving: false, error: data.error || 'Could not save', success: '' });
      return;
    }
    setStatus({ saving: false, error: '', success: 'Saved — new advisors will see this from now on.' });
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Advisor default Vision &amp; Mission</h1>
          <p className="mt-2 text-gray-500">
            Shown pre-filled in every advisor&apos;s Edit Profile until they replace it with their own or clear it.
            Advisors who&apos;ve already saved their own text/photo are unaffected.
          </p>

          {loading ? (
            <p className="mt-8 text-sm text-gray-400">Loading...</p>
          ) : (
            <div className="mt-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Default vision statement
                </label>
                <textarea
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500"
                />
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-16 w-28 flex-none overflow-hidden rounded-lg bg-gray-100">
                    {visionImage ? (
                      <img src={visionImage} alt="Vision" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-gray-400">
                        No photo
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50">
                    {imageStatus.visionImage?.uploading ? 'Uploading...' : visionImage ? 'Replace photo' : 'Upload photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange('visionImage', setVisionImage, e)}
                      disabled={imageStatus.visionImage?.uploading}
                      className="hidden"
                    />
                  </label>
                  {visionImage && (
                    <button
                      type="button"
                      onClick={() => setVisionImage('')}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {imageStatus.visionImage?.error && (
                  <p className="mt-1 text-xs text-red-600">{imageStatus.visionImage.error}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Default mission statement
                </label>
                <textarea
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500"
                />
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-16 w-28 flex-none overflow-hidden rounded-lg bg-gray-100">
                    {missionImage ? (
                      <img src={missionImage} alt="Mission" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-gray-400">
                        No photo
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50">
                    {imageStatus.missionImage?.uploading ? 'Uploading...' : missionImage ? 'Replace photo' : 'Upload photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange('missionImage', setMissionImage, e)}
                      disabled={imageStatus.missionImage?.uploading}
                      className="hidden"
                    />
                  </label>
                  {missionImage && (
                    <button
                      type="button"
                      onClick={() => setMissionImage('')}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {imageStatus.missionImage?.error && (
                  <p className="mt-1 text-xs text-red-600">{imageStatus.missionImage.error}</p>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={status.saving}
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
              >
                {status.saving ? 'Saving...' : 'Save defaults'}
              </button>
              {status.error && <p className="text-sm text-red-600">{status.error}</p>}
              {status.success && <p className="text-sm text-green-600">{status.success}</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
