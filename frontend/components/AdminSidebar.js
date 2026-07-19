'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { decodeToken } from '../lib/auth';

function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </svg>
  );
  
}

function ClipboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3.75h6a1.5 1.5 0 0 1 1.5 1.5V6h1.5A1.5 1.5 0 0 1 19.5 7.5v12A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 6 6h1.5v-.75a1.5 1.5 0 0 1 1.5-1.5Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 13.5 2.25 2.25L15 11.25" />
    </svg>
  );
}

function UserPlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.5a4.5 4.5 0 0 0-9 0M10.5 11.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18.75 8.25v4.5M21 10.5h-4.5"
      />
    </svg>
  );
}

function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 3 1.2 3.3L13.5 7.5l-3.3 1.2L9 12l-1.2-3.3L4.5 7.5l3.3-1.2L9 3ZM17.5 12l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4Z"
      />
    </svg>
  );
}

function PencilIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.86 4.487 1.653 1.653a1.5 1.5 0 0 1 0 2.121L7.24 19.535l-4.243.707.707-4.243L14.94 4.487a1.5 1.5 0 0 1 1.92 0Z"
      />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 19.5a5.25 5.25 0 0 0-10.5 0M12 12.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
      />
    </svg>
  );
}

function PhotoIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75 8.69 9.3a1.5 1.5 0 0 1 2.12 0l6.44 6.45M14.25 13.5l1.19-1.19a1.5 1.5 0 0 1 2.12 0l3.19 3.19M3.75 4.5h16.5A1.5 1.5 0 0 1 21.75 6v12a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5ZM9 9a1.125 1.125 0 1 1-2.25 0A1.125 1.125 0 0 1 9 9Z"
      />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 15l3-3m0 0-3-3m3 3H9"
      />
    </svg>
  );
}

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Pending content', Icon: ClipboardIcon },
  { href: '/admin/advisors', label: 'Manage advisors', Icon: UserIcon },
  { href: '/admin/advisors/new', label: 'Add advisor', Icon: UserPlusIcon },
  { href: '/admin/content', label: 'Generate content', Icon: SparklesIcon },
  { href: '/admin/content/write', label: 'Write blog', Icon: PencilIcon },
  { href: '/admin/homepage', label: 'Homepage editor', Icon: PhotoIcon }
];

const advisorNavItems = [
  { href: '/admin/dashboard', label: 'Pending content', Icon: ClipboardIcon },
  { href: '/admin/blog', label: 'Your blog', Icon: PencilIcon },
  { href: '/advisor/dashboard#profile', label: 'Edit profile', Icon: UserIcon }
];

export default function AdminSidebar() {
  const [expanded, setExpanded] = useState(false);
  const [role, setRole] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    setExpanded(localStorage.getItem('adminSidebarExpanded') === 'true');
    const decoded = decodeToken(localStorage.getItem('token'));
    setRole(decoded?.role || null);
  }, []);

  const navItems = role === 'advisor' ? advisorNavItems : adminNavItems;

  function toggle() {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('adminSidebarExpanded', String(next));
      return next;
    });
  }

  function logout() {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  }

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-none flex-col border-r border-gray-100 bg-white transition-all duration-200 ${
        expanded ? 'w-56' : 'w-16'
      }`}
    >
      <button
        onClick={toggle}
        aria-label="Toggle sidebar"
        className="flex h-14 flex-none items-center justify-center border-b border-gray-100 text-gray-400 hover:text-primary-600"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
              }`}
            >
              <Icon className="h-5 w-5 flex-none" />
              {expanded && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        title="Log out"
        className="flex flex-none items-center gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-400 hover:text-gray-600"
      >
        <LogoutIcon className="h-5 w-5 flex-none" />
        {expanded && <span>Log out</span>}
      </button>
    </aside>
  );
}
