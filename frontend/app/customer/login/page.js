'use client';
import { useState } from 'react';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';

const inputClasses =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-ia-navy outline-none transition-colors focus:border-ia-green';

export default function CustomerLoginPage() {
  const [mode, setMode] = useState('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '' });

  async function handleSignup(e) {
    e.preventDefault();
    setStatus({ loading: true, error: '' });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus({ loading: false, error: data.error || 'Could not sign up' });
      return;
    }

    localStorage.setItem('customerToken', data.token);
    localStorage.setItem('customerName', data.customer.name);
    window.location.href = '/';
  }

  async function handleLogin(e) {
    e.preventDefault();
    setStatus({ loading: true, error: '' });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus({ loading: false, error: data.error || 'Login failed' });
      return;
    }

    localStorage.setItem('customerToken', data.token);
    localStorage.setItem('customerName', data.customer.name);
    window.location.href = '/';
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-green-50/60 to-white">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`rounded-xl py-2.5 text-sm font-bold transition-all duration-300 ${
                mode === 'signup' ? 'bg-ia-green text-white shadow' : 'bg-transparent text-gray-500'
              }`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-xl py-2.5 text-sm font-bold transition-all duration-300 ${
                mode === 'login' ? 'bg-ia-green text-white shadow' : 'bg-transparent text-gray-500'
              }`}
            >
              Log in
            </button>
          </div>

          <h1 className="mt-6 text-2xl font-bold text-ia-navy">
            {mode === 'signup' ? 'Customer sign up' : 'Customer login'}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {mode === 'signup'
              ? "Tell us a bit about yourself and we'll be in touch."
              : 'Log in to see your details.'}
          </p>

          {mode === 'signup' ? (
            <form onSubmit={handleSignup} className="mt-6 space-y-3.5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
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
              <button
                type="submit"
                disabled={status.loading}
                className="mt-1.5 w-full rounded-xl bg-ia-green px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:-translate-y-0.5 hover:bg-ia-green-soft disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {status.loading ? 'Signing up...' : 'Sign up'}
              </button>
            </form>
          ) : (
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
              <button
                type="submit"
                disabled={status.loading}
                className="mt-1.5 w-full rounded-xl bg-ia-green px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:-translate-y-0.5 hover:bg-ia-green-soft disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {status.loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          )}

          {status.error && <p className="mt-4 text-sm text-red-500">{status.error}</p>}
        </div>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
