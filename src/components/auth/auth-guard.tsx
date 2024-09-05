'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { paths } from '@/paths'; // Adjust the import based on your project structure
import { logger } from '@/lib/default-logger'; // Adjust the import based on your project structure

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);
  // const [error, setError] = React.useState<string | null>(null);

  const checkPermissions = (): void => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    const publicPaths: string[] = [paths.home, paths.auth.signIn, paths.auth.resetPassword, paths.auth.forgotPassword];

    if (publicPaths.includes(pathname)) {
      setIsChecking(false);
      if (user || token) {
        router.replace(paths.dashboard.dashboard);
      }
      return;
    }

    if (!user || !token) {
      logger.debug('[AuthGuard]: User is not logged in or token is missing, redirecting to sign in');
      router.replace(paths.auth.signIn);
      return;
    }

    setIsChecking(false);
  };

  React.useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  if (isChecking) {
    return null; // You can show a loading spinner here if desired
  }

  // if (error) {
  //   return <Alert color="error">{error}</Alert>;
  // }

  return <>{children}</>;
}
