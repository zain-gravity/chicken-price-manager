import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-5xl mb-2 block">🐔</span>
            <h1 className="text-2xl font-bold text-stone-900">Chicken Price Manager</h1>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
