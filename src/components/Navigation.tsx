'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function Navigation() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  // Don't show nav on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <div className="nav-logo">MP</div>
          <span>Master Plumbing</span>
        </Link>

        <div className="nav-links">
          <Link 
            href="/" 
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          >
            Overview
          </Link>
          <Link 
            href="/study/plumbing-code" 
            className={`nav-link ${pathname.startsWith('/study') ? 'active' : ''}`}
          >
            Flashcards
          </Link>
          <Link 
            href="/resources" 
            className={`nav-link ${pathname === '/resources' ? 'active' : ''}`}
          >
            Resources
          </Link>
          
          {/* User menu */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-tan hide-mobile">
                    {user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="btn btn-ghost text-xs"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/login" className="btn btn-primary text-xs">
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
