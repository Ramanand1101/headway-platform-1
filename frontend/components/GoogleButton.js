'use client';
import { useEffect, useRef, useState } from 'react';

let gisScriptPromise = null;
function loadGoogleScript() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return gisScriptPromise;
}

// user.phonenumbers.read is a sensitive scope — Google only grants it to
// accounts added as "Test users" on the OAuth consent screen until the
// app passes verification.
const SCOPE = 'openid email profile https://www.googleapis.com/auth/user.phonenumbers.read';

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="flex-none">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.61z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.69A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.16.27-1.69V4.98H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.02l2.97-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.98l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

// Renders a Google sign-in button on Google Identity Services' Authorization
// Code flow (popup mode) — needed (instead of the simpler One Tap ID-token
// flow) because we request the phone-number scope in addition to basic
// profile info. Falls back to a disabled placeholder until
// NEXT_PUBLIC_GOOGLE_CLIENT_ID is set. When `locked` is true, clicking fires
// `onLockedClick` instead of opening the Google popup.
export default function GoogleButton({ onCode, text = 'Continue with Google', locked = false, onLockedClick }) {
  const [ready, setReady] = useState(false);
  const codeClientRef = useRef(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.oauth2) return;
        codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: SCOPE,
          ux_mode: 'popup',
          // Forces the full consent screen every time, instead of Google
          // silently reusing a prior narrower grant (e.g. from before the
          // phone-number scope existed) that would omit the new scope.
          prompt: 'consent',
          callback: (response) => {
            if (response.code) onCode(response.code);
          }
        });
        setReady(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [clientId, onCode]);

  function handleClick() {
    if (locked) {
      onLockedClick?.();
      return;
    }
    codeClientRef.current?.requestCode();
  }

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        title="Google sign-in is being configured"
        className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-gray-200 bg-gray-50 p-3.5 text-sm font-bold text-gray-400"
      >
        Continue with Google (coming soon)
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!ready}
      className={`flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white p-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
        locked ? 'opacity-60' : ''
      }`}
    >
      <GoogleLogo />
      {text}
    </button>
  );
}
