'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, shopName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
      
      // Auto sign in
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Account created but failed to sign in automatically.');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full">
      <h2 className="text-xl font-bold text-stone-900 mb-6 text-center">Create Account</h2>
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && !error && (
        <div className="mb-6 bg-green-50 text-green-600 p-3 rounded-lg text-sm">
          Account created successfully! Signing you in...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="shopName">
            Shop Name
          </label>
          <input
            id="shopName"
            type="text"
            required
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full h-12 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
            placeholder="My Chicken Shop"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-12 px-4 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}
