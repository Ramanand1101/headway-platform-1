'use client';
import { useState } from 'react';

export default function ContactForm({ advisorSlug, interestOptions = [] }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);

  function toggleInterest(option) {
    setSelectedInterests((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.target);
    const businessName = form.get('businessName');
    const message = [businessName && `Business: ${businessName}`, form.get('message')].filter(Boolean).join('\n');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        advisorSlug,
        name: `${form.get('firstName')} ${form.get('lastName')}`.trim(),
        phone: form.get('phone'),
        email: form.get('email'),
        interest: selectedInterests.join(', '),
        message
      })
    });

    if (!res.ok) {
      setError('Could not send your message — please try again in a moment.');
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-600">
        Thanks — we&apos;ll get back to you shortly.
      </p>
    );
  }

  const inputClasses =
    'mt-1.5 w-full border-0 border-b border-gray-200 bg-transparent px-0 pb-2 pt-0.5 text-sm font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-400 outline-none transition focus:border-[var(--tc-primary)]';
  const labelClasses = 'text-xs font-semibold text-gray-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClasses}>First name *</label>
          <input name="firstName" placeholder="First name" required className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Last name *</label>
          <input name="lastName" placeholder="Last name" required className={inputClasses} />
        </div>
      </div>

      <div>
        <label className={labelClasses}>Business Name (if applicable)</label>
        <input name="businessName" placeholder="Business name" className={inputClasses} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClasses}>Email *</label>
          <input name="email" type="email" placeholder="Email" required className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Phone</label>
          <input name="phone" type="tel" placeholder="Phone number" className={inputClasses} />
        </div>
      </div>

      {interestOptions.length > 0 && (
        <div>
          <label className={labelClasses}>Type of Insurance *</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {interestOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(option)}
                  onChange={() => toggleInterest(option)}
                  className="accent-[var(--tc-primary)]"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelClasses}>Message *</label>
        <textarea name="message" placeholder="Message" rows={4} required className={inputClasses} />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-[var(--tc-primary)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--tc-primary-dark)]"
      >
        Send Message
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
