'use client';

import { AuthProvider } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function AuthLayout({ children }) {
  const pathname = usePathname();
  
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">
          <header className="px-4 py-4 bg-white shadow-xs">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold text-primary-600">
                Freelance Marketplace
              </Link>
              
              {(pathname !== '/login' && pathname !== '/signup') && (
                <Link href="/" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                  <FiArrowLeft className="mr-1" />
                  Back to home
                </Link>
              )}
            </div>
          </header>
          
          <main className="flex-grow">
            {children}
          </main>
          
          <footer className="py-6 bg-white border-t">
            <div className="container mx-auto px-4">
              <p className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Freelance Marketplace. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </AuthProvider>
  );
}