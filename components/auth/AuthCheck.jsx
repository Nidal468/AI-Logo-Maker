'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/common/Loading';

const AuthCheck = ({ children }) => {
  const { isAuthenticated, loading, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not authenticated, redirect to login
    if (!isAuthenticated && !pathname.includes('/login') && !pathname.includes('/signup')) {
      router.push('/login');
      return;
    }

    // Authenticated but trying to access auth pages
    if (isAuthenticated && (pathname.includes('/login') || pathname.includes('/signup'))) {
      const redirectPath = userProfile?.userType === 'seller' ? '/seller/dashboard' : '/buyer/dashboard';
      router.push(redirectPath);
      return;
    }

    // Check for route access based on user type
    if (isAuthenticated && userProfile) {
      const isSeller = userProfile.userType === 'seller';
      const isBuyer = userProfile.userType === 'buyer';

      // Prevent seller from accessing buyer routes
      if (isSeller && pathname.includes('/buyer/')) {
        router.push('/seller/dashboard');
        return;
      }

      // Prevent buyer from accessing seller routes
      if (isBuyer && pathname.includes('/seller/')) {
        router.push('/buyer/dashboard');
        return;
      }
    }
  }, [loading, isAuthenticated, pathname, router, userProfile]);

  if (loading) {
    return <Loading />;
  }

  return children;
};

export default AuthCheck;