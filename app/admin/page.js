'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { checkAdminAuth } from '@/firebase/adminAuth';
import AdminLoginPage from '../AdminLoginPage/page';

export default function Admin() {

  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const isAdmin = await checkAdminAuth();
          if (isAdmin) {
            router.push('/admin/dashboard');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };
    
    if (!loading) {
      checkAdmin();
    }
  }, [user, loading, router]);
  
  // Show loading state if auth is still being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // If user is not authenticated or not an admin, show login page
  return <AdminLoginPage />;
}