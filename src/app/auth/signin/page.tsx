'use client';

import { useState, Suspense } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

/**
 * Admin Sign-In Page
 * 
 * Custom NextAuth sign-in page for admin authentication.
 * Provides a branded login form with email/password credentials.
 * Handles authentication via NextAuth CredentialsProvider.
 * 
 * Features:
 * - Branded cafe theme consistent with site design
 * - Form validation and error handling
 * - Loading states during authentication
 * - Automatic redirect after successful login
 * - Callback URL support for protected route access
 * 
 * Requirements: 11.1, 11.2
 */

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
      } else if (result?.ok) {
        // Wait for session to be established
        await getSession();
        // Redirect to callback URL or admin dashboard
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <span className="text-2xl text-white font-bold">C</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
            Admin Sign In
          </h1>
          <p className="text-text-muted font-body">
            Sign in to manage your cafe content
          </p>
        </div>

        {/* Sign-in Form */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-border rounded-lg bg-white 
                         text-text-primary font-body placeholder-text-muted
                         focus:ring-2 focus:ring-primary focus:border-primary
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300 ease-in-out"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-border rounded-lg bg-white 
                         text-text-primary font-body placeholder-text-muted
                         focus:ring-2 focus:ring-primary focus:border-primary
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300 ease-in-out"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 font-body">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-primary text-white rounded-lg py-3 px-4 font-medium
                       transition-all duration-300 ease-in-out
                       hover:bg-primary-hover hover:shadow-md hover:scale-[1.02]
                       active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted font-body">
              Don't have admin access? Contact the site administrator.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-text-muted font-body">
            © 2024 Company Profile Cafe. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Sign In Page Component with Suspense Boundary
 * 
 * Wraps SignInForm in Suspense to handle useSearchParams loading state.
 * This prevents hydration issues with dynamic search params.
 */
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}