'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import SessionWrapper from '@/components/SessionWrapper';
import { signOut } from 'next-auth/react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-subtle p-8 glass-panel rounded-3xl">
          <p className="text-stone-700 font-medium text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const tabs = [
    { 
      name: 'Dashboard', 
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
      )
    },
    { 
      name: 'History', 
      path: '/history',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      )
    },
    { 
      name: 'Settings', 
      path: '/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      )
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-16 glass-header z-50 flex items-center justify-between px-4 sm:px-8">
        <div className="font-extrabold text-xl text-stone-900 tracking-tight flex items-center gap-2">
          <span className="text-2xl drop-shadow-sm">🐔</span> Chicken Manager
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path || (pathname?.startsWith(tab.path) && tab.path !== '/dashboard') || (tab.path === '/dashboard' && pathname === '/');
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`font-semibold flex items-center gap-2 transition-colors ${
                  isActive ? 'text-red-600' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.icon}
                {tab.name}
              </Link>
            )
          })}
          <button 
            onClick={() => signOut()}
            className="text-stone-600 hover:text-red-600 font-semibold px-4 py-2 glass-panel rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ml-4"
          >
            Logout
          </button>
        </nav>

        {/* Mobile Logout (shows in header since tabs are at bottom) */}
        <button 
          onClick={() => signOut()}
          className="sm:hidden text-stone-600 hover:text-red-600 font-semibold px-3 py-1.5 glass-panel rounded-xl flex items-center justify-center transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 mt-16 sm:mt-24 pb-24 sm:pb-12 px-4 py-6 w-full max-w-4xl mx-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-[72px] glass-header border-t-0 z-50 flex items-center justify-around px-2 sm:hidden pb-safe">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || (pathname?.startsWith(tab.path) && tab.path !== '/dashboard') || (tab.path === '/dashboard' && pathname === '/');
          return (
            <Link 
              key={tab.path} 
              href={tab.path}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${isActive ? 'text-red-600' : 'text-stone-500'}`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-red-50 text-red-600 scale-110 shadow-sm' : ''}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] font-bold mt-1 transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionWrapper>
      <DashboardContent>{children}</DashboardContent>
    </SessionWrapper>
  );
}
