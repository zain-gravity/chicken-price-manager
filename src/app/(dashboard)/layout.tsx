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
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <p className="text-stone-500 font-medium">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const tabs = [
    { name: 'Prices', icon: '📋', path: '/dashboard' },
    { name: 'History', icon: '📅', path: '/history' },
    { name: 'Preview', icon: '👁️', path: '/preview' },
    { name: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-10 flex items-center justify-between px-4">
        <div className="font-bold text-lg text-stone-900">🐔 Chicken Price Manager</div>
        <button 
          onClick={() => signOut()}
          className="text-stone-500 hover:text-red-600 font-medium px-3 py-2 rounded-xl min-h-[48px] flex items-center justify-center transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 mt-16 pb-20 px-4 py-6 w-full max-w-3xl mx-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-stone-200 z-10 flex items-center justify-around px-2 sm:hidden pb-safe">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || (pathname?.startsWith(tab.path) && tab.path !== '/dashboard') || (tab.path === '/dashboard' && pathname === '/');
          return (
            <Link 
              key={tab.path} 
              href={tab.path}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] relative ${isActive ? 'text-red-600' : 'text-stone-500'}`}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.name}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-red-600 rounded-b-full"></div>
              )}
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
