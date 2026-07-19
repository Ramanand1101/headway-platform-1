'use client';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import GoogleButton from '../../../components/GoogleButton';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';

const inputClasses =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-ia-navy outline-none transition-colors focus:border-ia-blue';

function ConsentBox({ consent, setConsent }) {
  return (
    <label className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-gray-50 p-3 text-[0.72rem] font-medium text-gray-600 shadow-sm">
      <input
        type="checkbox"
        checked={consent}
        onChange={(e) => setConsent(e.target.checked)}
        className="mt-0.5 flex-none accent-ia-blue"
      />
      <span>
        I have read and agree to the{' '}
        <Link
          href="/advisor-declaration"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-ia-blue underline hover:text-ia-blue-soft"
        >
          Advisor Declaration
        </Link>
        .
      </span>
    </label>
  );
}

export default function AdvisorLoginPage() {
  const [mode, setMode] = useState('login');
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: '' });

  const [loginConsent, setLoginConsent] = useState(false);
  const [signupConsent, setSignupConsent] = useState(false);

  function switchMode(next) {
    setMode(next);
    setStatus({ loading: false, error: '' });
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginConsent) {
      setStatus({ loading: false, error: 'Please tick that you agree to the Advisor Declaration to continue.' });
      return;
    }
    setStatus({ loading: true, error: '' });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus({ loading: false, error: data.error || 'Login failed' });
      return;
    }

    localStorage.setItem('token', data.token);
    window.location.href = '/advisor/dashboard';
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (!signupConsent) {
      setStatus({ loading: false, error: 'Please tick that you agree to the Advisor Declaration to continue.' });
      return;
    }
    setStatus({ loading: true, error: '' });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/advisor-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: slug.trim().toLowerCase(), name, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus({ loading: false, error: data.error || 'Sign up failed' });
      return;
    }

    localStorage.setItem('token', data.token);

    if (photo) {
      const formData = new FormData();
      formData.append('photo', photo);
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advisor/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.token}` },
        body: formData
      });
    }

    window.location.href = '/advisor/dashboard#profile';
  }

  function handleGoogleLocked() {
    setStatus({ loading: false, error: 'Please tick that you agree to the Advisor Declaration above first.' });
  }

  const handleGoogleCode = useCallback(async (code) => {
    setStatus({ loading: true, error: '' });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus({ loading: false, error: data.error || 'Google sign-in failed' });
      return;
    }

    localStorage.setItem('token', data.token);
    window.location.href = data.isNewAccount ? '/advisor/dashboard#profile' : '/advisor/dashboard';
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50/60 to-white">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-xl py-2.5 text-sm font-bold transition-all duration-300 ${
                mode === 'login' ? 'bg-ia-blue text-white shadow' : 'bg-transparent text-gray-500'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`rounded-xl py-2.5 text-sm font-bold transition-all duration-300 ${
                mode === 'signup' ? 'bg-ia-blue text-white shadow' : 'bg-transparent text-gray-500'
              }`}
            >
              Sign up
            </button>
          </div>

          <h1 className="mt-6 text-2xl font-bold text-ia-navy">
            {mode === 'login' ? 'Advisor login' : 'Create your advisor site'}
          </h1>
          {mode === 'signup' && (
            <p className="mt-1.5 text-sm text-gray-500">
              Pick a slug and you&apos;ll go live immediately — fill in the rest of your
              profile after. Or continue with Google and we&apos;ll set it up for you automatically.
            </p>
          )}

          {mode === 'login' ? (
            <>
              <form onSubmit={handleLogin} className="mt-6 space-y-3.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className={inputClasses}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className={inputClasses}
                />

                <ConsentBox consent={loginConsent} setConsent={setLoginConsent} />

                <GoogleButton
                  onCode={handleGoogleCode}
                  locked={!loginConsent}
                  onLockedClick={handleGoogleLocked}
                />

                <button
                  type="submit"
                  disabled={status.loading}
                  className="mt-1.5 w-full rounded-xl bg-ia-blue px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-ia-gold-tint transition hover:-translate-y-0.5 hover:bg-ia-blue-soft disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {status.loading ? 'Logging in...' : 'Log in'}
                </button>
              </form>
            </>
          ) : (
            <>
              <form onSubmit={handleSignup} className="mt-6 space-y-3.5">
                <div className="flex items-center gap-4">
                  {photo ? (
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="Preview"
                      className="h-16 w-16 rounded-full object-cover ring-4 ring-blue-50"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ia-gold-tint/40 text-xl font-semibold text-ia-blue ring-4 ring-blue-50">
                      {name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <label className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
                      {photo ? 'Change photo' : 'Add photo (optional)'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1.5 text-[0.65rem] text-gray-400">Recommended size: 400×400px, square</p>
                  </div>
                </div>

                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={`Slug — e.g. priya (priya.${process.env.NEXT_PUBLIC_BASE_DOMAIN})`}
                  required
                  className={inputClasses}
                />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  className={inputClasses}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className={inputClasses}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className={inputClasses}
                />

                <ConsentBox consent={signupConsent} setConsent={setSignupConsent} />

                <GoogleButton
                  onCode={handleGoogleCode}
                  text="Sign up with Google"
                  locked={!signupConsent}
                  onLockedClick={handleGoogleLocked}
                />

                <button
                  type="submit"
                  disabled={status.loading}
                  className="mt-1.5 w-full rounded-xl bg-ia-blue px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-ia-gold-tint transition hover:-translate-y-0.5 hover:bg-ia-blue-soft disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {status.loading ? 'Creating your site...' : 'Sign up'}
                </button>
              </form>
            </>
          )}

          {status.error && <p className="mt-4 text-sm text-red-500">{status.error}</p>}
        </div>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
