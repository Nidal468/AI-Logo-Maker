'use client';
export const dynamic = 'force-dynamic'

import { usePathname } from 'next/navigation';
import AuthCheck from '@/components/auth/AuthCheck';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Sidebar from '@/components/common/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { 
  FiGrid, 
  FiShoppingBag, 
  FiList, 
  FiMessageSquare, 
  FiUser, 
  FiSettings,
  FiHeart,
  FiFileText,
  FiCreditCard
} from 'react-icons/fi';

export default function ProtectedLayout({ children }) {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  
  // Define sidebar items based on user type
  const sellerSidebarItems = [
    {
      href: '/seller/dashboard',
      icon: FiGrid,
      label: 'Dashboard',
    },
    {
      href: '/seller/gigs',
      icon: FiShoppingBag,
      label: 'My Services',
      submenu: [
        {
          href: '/seller/gigs',
          label: 'All Services',
        },
        {
          href: '/seller/gigs/create',
          label: 'Create New',
        },
      ],
    },
    {
      href: '/seller/orders',
      icon: FiList,
      label: 'Orders',
    },
    {
      href: '/seller/messages',
      icon: FiMessageSquare,
      label: 'Messages',
    },
    {
      href: '/seller/profile',
      icon: FiUser,
      label: 'Profile',
    },
    
  ];
  
  const buyerSidebarItems = [
    {
      href: '/buyer/dashboard',
      icon: FiGrid,
      label: 'Dashboard',
    },
    {
      href: '/buyer/orders',
      icon: FiList,
      label: 'My Orders',
    },
    {
      href: '/buyer/messages',
      icon: FiMessageSquare,
      label: 'Messages',
    },
    {
      href: '/buyer/payments',
      icon: FiCreditCard,
      label: 'Payment Methods',
    },
    {
      href: '/buyer/profile',
      icon: FiUser,
      label: 'Profile',
    },

  ];
  
  const marketplaceSidebarItems = [
    {
      href: '/marketplace',
      icon: FiGrid,
      label: 'All Categories',
    },
    {
      href: '/marketplace/web-development',
      icon: FiFileText,
      label: 'Web Development',
    },
    {
      href: '/marketplace/graphic-design',
      icon: FiFileText,
      label: 'Graphic Design',
    },
    {
      href: '/marketplace/content-writing',
      icon: FiFileText,
      label: 'Content Writing',
    },
    {
      href: '/marketplace/digital-marketing',
      icon: FiFileText,
      label: 'Digital Marketing',
    },
    {
      href: '/marketplace/video-animation',
      icon: FiFileText,
      label: 'Video & Animation',
    },
  ];
  
  // Determine which sidebar items to use
  let sidebarItems = [];
  let showSidebar = true;
  
  if (pathname.startsWith('/seller')) {
    sidebarItems = sellerSidebarItems;
  } else if (pathname.startsWith('/buyer')) {
    sidebarItems = buyerSidebarItems;
  } else if (pathname.startsWith('/marketplace')) {
    sidebarItems = marketplaceSidebarItems;
  } else {
    showSidebar = false;
  }
  
  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex">
          {showSidebar && (
            <div className="hidden md:block w-64 flex-shrink-0">
              <Sidebar items={sidebarItems} />
            </div>
          )}
          <main className="flex-grow ">
            <div className="container mx-auto px-4 py-6" style={{background:"white"}}>
              {children}
            </div>
          </main>
        </div>
        {/* <Footer /> */}
      </div>
    </AuthCheck>
  );
}