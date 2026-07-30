'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';

// Admin-set default Vision & Mission text/photos + FAQs — every advisor's
// dashboard prefills these until they replace, edit or clear them with their
// own. Stored generically via SiteContent (page key: "advisor-defaults"),
// same mechanism as the homepage editor.
export default function AdvisorDefaultsPage() {
  const [vision, setVision] = useState('');
  const [mission, setMission] = useState('');
  const [visionImage, setVisionImage] = useState('');
  const [missionImage, setMissionImage] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ saving: false, error: '', success: '' });
  const [imageStatus, setImageStatus] = useState({});

  function addFaq() {
    setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  }
  function updateFaq(i, field, value) {
    setFaqs((prev) => prev.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)));
  }
  function removeFaq(i) {
    setFaqs((prev) => prev.filter((_, idx) => idx !== i));
  }

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
        setFaqs(data.content?.faqs || []);
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
        data: {
          vision: vision.trim(),
          mission: mission.trim(),
          visionImage,
          missionImage,
          faqs: faqs.filter((f) => f.question.trim())
        }
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
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Advisor defaults</h1>
          <p className="mt-2 text-gray-500">
            Vision, Mission and FAQs shown pre-filled in every advisor&apos;s Edit Profile until they replace, edit
            or clear them with their own. Advisors who&apos;ve already saved their own are unaffected.
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

              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Default FAQs</label>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
                  >
                    + Add FAQ
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Every advisor starts with these — they can edit or delete any of them from their own dashboard.
                </p>
                <div className="mt-4 space-y-3">
                  {faqs.map((faq, i) => (
                    <div key={i} className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="flex-1 space-y-2">
                        <input
                          value={faq.question}
                          onChange={(e) => updateFaq(i, 'question', e.target.value)}
                          placeholder="Question"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                          placeholder="Answer"
                          rows={2}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFaq(i)}
                        className="flex-none self-start rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {faqs.length === 0 && <p className="text-xs text-gray-400">No default FAQs yet.</p>}
                </div>
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
