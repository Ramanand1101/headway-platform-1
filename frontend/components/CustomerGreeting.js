'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CustomerGreeting({ variant = 'link' }) {
  const [name, setName] = useState(null);

  useEffect(() => {
    setName(localStorage.getItem('customerName'));
  }, []);

  function logout() {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerName');
    setName(null);
  }

  const linkClasses =
    variant === 'button'
      ? 'rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-primary-300 hover:text-primary-600'
      : 'text-sm font-medium text-gray-600 hover:text-primary-600';

  if (name) {
    return (
      <div className="flex items-center gap-3">
        <span className={variant === 'button' ? 'text-sm font-medium text-gray-700' : 'text-sm text-gray-600'}>
          Hi, {name}
        </span>
        <button onClick={logout} className={linkClasses}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <Link href="/customer/login" className={linkClasses}>
      Customer login
    </Link>
  );
}
