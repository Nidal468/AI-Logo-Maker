'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiMenu, FiX, FiUsers, FiShoppingBag, FiMessageSquare, 
  FiDollarSign, FiSettings, FiLogOut, FiBarChart2, 
  FiGrid, FiHome, FiShield
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { checkAdminAuth, logoutAdmin } from '@/firebase/adminAuth';
import { toast } from 'react-toastify';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const verifyAdmin = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          router.push('/admin');
          return;
        }
        
        const isAdminUser = await checkAdminAuth();
        setIsAdmin(isAdminUser);
        
        if (!isAdminUser) {
          toast.error('You do not have admin access');
          router.push('/admin');
        }
      } catch (error) {
        console.error('Admin verification error:', error);
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAdmin();
  }, [user, router]);
  
  const handleLogout = async () => {
    try {
      await logoutAdmin();
      toast.success('Logged out successfully');
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };
  
  // Define navigation items
  const navItems = [
    { 
      label: 'Dashboard', 
      icon: FiBarChart2, 
      href: '/admin/dashboard' 
    },
    { 
      label: 'Users', 
      icon: FiUsers, 
      href: '/admin/users' 
    },
    { 
      label: 'Orders', 
      icon: FiShoppingBag, 
      href: '/admin/orders' 
    },
    { 
      label: 'Services', 
      icon: FiGrid, 
      href: '/admin/services' 
    },
    { 
      label: 'Messages', 
      icon: FiMessageSquare, 
      href: '/admin/messages' 
    },
    { 
      label: 'Finances', 
      icon: FiDollarSign, 
      href: '/admin/finances' 
    },
    { 
      label: 'Settings', 
      icon: FiSettings, 
      href: '/admin/settings' 
    },
  ];
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Router will redirect
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-indigo-800 text-white transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-30 shadow-lg`}
      >
        <div className="flex items-center justify-between h-16 px-4">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <FiShield className="h-6 w-6 text-white" />
              <span className="font-bold text-lg">Admin Portal</span>
            </div>
          ) : (
            <FiShield className="h-6 w-6 text-white mx-auto" />
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white p-1 rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            {isSidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        
        <div className="mt-6">
          <div className="px-4 mb-6">
            <Link
              href="/admin/dashboard"
              className="flex items-center p-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              <FiHome className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Admin Home</span>}
            </Link>
          </div>
          
          <div className="px-4 py-2 text-xs text-indigo-300 uppercase">
            {isSidebarOpen ? 'Management' : ''}
          </div>
          
          <nav className="mt-1 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center py-2 px-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-indigo-700 text-white' 
                      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                  }`}
                >
                  <item.icon className={`${isSidebarOpen ? 'mr-3' : 'mx-auto'} h-5 w-5 ${isActive ? 'text-white' : 'text-indigo-300'}`} />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-4">
          <button 
            onClick={handleLogout}
            className={`flex items-center ${isSidebarOpen ? 'w-full' : 'justify-center'} p-2 text-indigo-100 rounded-md hover:bg-indigo-700 hover:text-white transition-colors`}
          >
            <FiLogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 ease-in-out`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-800">
              {navItems.find(item => item.href === pathname)?.label || 'Admin Portal'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.email || 'Admin'}
            </span>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;