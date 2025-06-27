'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiChevronDown, FiChevronUp, FiUser, FiZap, FiStar, FiActivity, FiSettings } from 'react-icons/fi';

// Enhanced SidebarItem component with more attractive styling
const SidebarItem = ({ href, icon: Icon, label, isActive, hasChildren, children }) => {
  const [isOpen, setIsOpen] = useState(isActive);

  // Automatically open dropdown if a child link is active
  useEffect(() => {
    if (hasChildren && children) {
      const childIsActive = React.Children.toArray(children).some(
        (child) => child.props.isActive
      );
      if (childIsActive) {
        setIsOpen(true);
      }
    }
  }, [children, hasChildren]);

  if (hasChildren) {
    return (
      <div className="px-3 my-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center w-full px-4 py-3 text-sm rounded-xl transition-all duration-200 group ${
            isActive
              ? 'text-primary-700 bg-gradient-to-r from-primary-50 to-indigo-50 font-medium shadow-sm border border-primary-100'
              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 border border-transparent'
          }`}
          aria-expanded={isOpen}
        >
          {Icon && (
            <div className={`flex-shrink-0 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-primary-500'}`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <span className="flex-1 text-left">{label}</span>
          <div className={`flex-shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <FiChevronDown className={`h-4 w-4 ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-400'}`} />
          </div>
        </button>

        {isOpen && (
          <div className="mt-1 ml-2 pl-6 border-l-2 border-primary-100 space-y-1">
            {children}
          </div>
        )}
      </div>
    );
  }

  // Standard Link Item with enhanced styling
  return (
    <div className="px-3 my-1">
      <Link
        href={href || '#'}
        className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 group ${
          isActive
            ? 'text-primary-700 bg-gradient-to-r from-primary-50 to-indigo-50 font-medium shadow-sm border border-primary-100'
            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 border border-transparent hover:border-gray-100'
        }`}
      >
        {Icon && (
          <div className={`flex-shrink-0 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-primary-500'}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <span className="truncate">{label}</span>
        
        {isActive && (
          <div className="ml-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
          </div>
        )}
      </Link>
    </div>
  );
};

// Main Sidebar component with professional design
const Sidebar = ({ items = [] }) => {
  const pathname = usePathname();
  const { user, userProfile } = useAuth();

  // Determine the correct profile link based on user type
  const profileLink = userProfile?.userType === 'seller'
    ? '/seller/profile'
    : '/buyer/profile';

  // Get the profile image URL
  const profileImageUrl = userProfile?.profileImage || user?.photoURL || null;
  
  // Get user's remaining credits
  const creditsRemaining = userProfile?.subscription?.creditsRemaining || 0;
  const isPremium = userProfile?.subscription?.status === 'active';

  return (
    <div className="fixed h-screen top-0 w-64 flex-shrink-0 bg-white border-r border-gray-200 shadow-sm z-20">
      <div className="flex flex-col h-full">
        {/* Logo Area with Gradient */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100 flex-shrink-0">
          <div className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent text-xl font-bold">
            Marketplace
          </div>
        </div>

        {/* Premium Badge (if applicable) */}
        {isPremium && (
          <div className="mx-4 my-3">
            <div className="bg-gradient-to-r from-indigo-50 to-primary-50 border border-primary-100 rounded-lg px-4 py-2 flex items-center">
              <FiStar className="text-primary-500 h-4 w-4 mr-2" />
              <span className="text-xs font-medium text-primary-700">Premium Account</span>
            </div>
          </div>
        )}

        {/* Navigation Area with enhanced spacing */}
        <nav className="flex-1 pt-3 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="px-3 mb-2">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider pl-4 mb-2">
              Main Menu
            </div>
          </div>
          
          {items.map((item, index) => {
            // Determine if the item or any of its children are active
            const isParentActive = item.submenu && item.submenu.some(sub => pathname?.startsWith(sub.href));
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/') || isParentActive;

            return (
              <SidebarItem
                key={item.href || index}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                hasChildren={item.submenu && item.submenu.length > 0}
              >
                {item.submenu && item.submenu.map((subItem, subIndex) => (
                  <SidebarItem
                    key={subItem.href || subIndex}
                    href={subItem.href}
                    icon={subItem.icon}
                    label={subItem.label}
                    isActive={pathname === subItem.href || pathname?.startsWith(subItem.href + '/')}
                  />
                ))}
              </SidebarItem>
            );
          })}
          
          {/* Activity Section */}
          {/* <div className="px-3 mb-2 mt-6">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider pl-4 mb-2">
              Activity
            </div>
          </div> */}
          
          <div className="px-3 my-1">
            {/* <Link
              href="/notifications"
              className="flex items-center px-4 py-3 text-sm rounded-xl text-gray-700 hover:text-primary-600 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200 group"
            >
              <div className="flex-shrink-0 mr-3 text-gray-500 group-hover:text-primary-500">
                <FiActivity className="h-5 w-5" />
              </div>
              <span className="truncate">Notifications</span>
              
              {creditsRemaining > 0 && (
                <div className="ml-auto bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 text-xs font-medium">
                  New
                </div>
              )}
            </Link> */}
          </div>
        </nav>

        {/* Enhanced Profile Section */}
        <div className="mt-auto border-t border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50">
          {/* Credits Display (if applicable) */}
          {creditsRemaining > 0 && (
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">Available Credits</div>
                <div className="flex items-center text-primary-700 font-semibold">
                  <FiZap className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  <span>{creditsRemaining}</span>
                </div>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-primary-500 to-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, creditsRemaining * 5)}%` }}></div>
              </div>
            </div>
          )}
          
          <div className="p-4">
            <Link
              href={profileLink}
              className="flex items-center p-3 rounded-xl hover:bg-white/80 transition-colors duration-200 group shadow-sm border border-gray-100"
            >
              {/* Enhanced Profile Picture */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-primary-100 group-hover:border-primary-300 transition-colors shadow-sm">
                {profileImageUrl ? (
                  <Image
                    key={profileImageUrl}
                    src={profileImageUrl}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="40px"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100">
                    {userProfile?.displayName ? (
                      <span className="text-primary-700 font-semibold text-sm">
                        {userProfile.displayName.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <FiUser className="w-5 h-5 text-primary-500" />
                    )}
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="ml-3 min-w-0 flex-grow">
                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-primary-700">
                  {userProfile?.displayName || user?.displayName || 'User'}
                </p>
                <div className="flex items-center">
                  <p className="text-xs text-gray-500 capitalize">
                    {userProfile?.userType || 'User'}
                  </p>
                </div>
              </div>
              
              {/* Settings Icon */}
              <div className="ml-auto flex-shrink-0 text-gray-400 group-hover:text-primary-500">
                <FiSettings className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;