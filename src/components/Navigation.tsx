'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Settings } from 'lucide-react';

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
                <div className="flex items-center gap-2">
                  <Link href="/settings" className="flex items-center gap-1.5 text-xs text-tan hover:text-forest transition-colors p-1 rounded-lg hover:bg-forest/5" title="Settings">
                    <Settings className="w-4 h-4" />
                    <span className="hide-mobile font-medium">{user?.email?.split('@')[0]}</span>
                  </Link>
                  <div className="w-px h-3 bg-gray-300 mx-1"></div>
                  <button
                    onClick={() => signOut()}
                    className="btn btn-ghost text-xs px-2"
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
