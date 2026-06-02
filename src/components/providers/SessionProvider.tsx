'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

/**
 * Session Provider Wrapper
 * 
 * Client Component wrapper for NextAuth SessionProvider
 * Allows useSession hook to work in client components
 * 
 * Requirements: 11.2
 */
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
