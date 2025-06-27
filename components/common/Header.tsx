'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FiMenu,
  FiX,
  FiUser,
  FiBell,
  FiMessageSquare,
  FiLogOut,
  FiGrid,
  FiShoppingBag,
  FiSettings,
  FiChevronDown,
  FiZap,
  FiHeart,
  FiStar,
  FiPower
} from 'react-icons/fi';
import Button from './Button';
import TranslateButton from '../TranslateButton/page';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, userProfile, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMenus();
  };

  // Check if user has premium status
  const isPremium = userProfile?.subscription?.status === 'active';
  const creditsRemaining = userProfile?.subscription?.creditsRemaining || 0;

  return (
    <header className={`sticky top-0 z-30 w-full transition-all duration-300 ${isScrolled
      ? 'bg-white shadow-md'
      : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo only */}
          <div className="flex items-center">
            <div className="flex-shrink-0">

              {/* Logo with dynamic routing */}
              <div className="flex-shrink-0">
                <Link href={
                  isAuthenticated
                    ? userProfile?.userType === 'seller'
                      ? '/seller/dashboard'
                      : '/buyer/dashboard'
                    : "/"
                }>
                  <img
                    style={{ width: "70px", cursor: "pointer" }}
                    src="/dlogo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link
              href="/marketplace"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer hover:scale-105 ${pathname === '/marketplace'
                ? 'text-primary-700 bg-primary-50 shadow-sm'
                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              title="Browse available services"
            >
              Browse Services
            </Link>

            <Link
              href="/booking"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer hover:scale-105 ${pathname === '/booking'
                ? 'text-primary-700 bg-primary-50 shadow-sm'
                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              title="Book a service"
            >
              Booking
            </Link>

            {userProfile?.userType === 'seller' && (
              <Link
                href="/seller/dashboard"
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer hover:scale-105 ${pathname.includes('/seller')
                  ? 'text-primary-700 bg-primary-50 shadow-sm'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                title="Manage your seller account"
              >
                Seller Dashboard
              </Link>
            )}

            <Link
              href="/generate-assets"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer hover:scale-105 group ${pathname === '/generate-assets'
                ? 'text-primary-700 bg-primary-50 shadow-sm'
                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              title="Generate AI-powered assets"
            >
              <span className="flex items-center">
                <FiZap className="mr-1 h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                AI Generator
              </span>
            </Link>
          </nav>

          {/* Right side - Credits, Profile Menu, Translate, Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Credits display for premium users */}
            {isAuthenticated && isPremium && creditsRemaining > 0 && (
              <div className="hidden md:block px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100 rounded-full border border-amber-200 cursor-default" title={`You have ${creditsRemaining} credits remaining`}>
                <div className="flex items-center text-amber-700 text-xs font-medium">
                  <FiZap className="mr-1 h-3.5 w-3.5 animate-pulse" />
                  {creditsRemaining} credits
                </div>
              </div>
            )}

            {/* Profile Menu for authenticated users */}
            {isAuthenticated ? (
              <div className="hidden md:block relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 p-1.5 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group"
                  title="Profile menu - Click to expand"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-indigo-100 rounded-full flex items-center justify-center overflow-hidden border border-primary-100 group-hover:border-primary-200 transition-colors">
                    {user?.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <FiChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''} group-hover:text-gray-600`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-1 z-10 border border-gray-200">
                    {/* User info at top */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50/30">
                      <p className="text-sm font-medium text-gray-900">{user?.displayName || 'User'}</p>
                      <p className="text-xs text-gray-600 truncate">{user?.email}</p>

                      {/* Premium badge if applicable */}
                      {isPremium && (
                        <div className="mt-2 flex items-center text-xs text-primary-700 bg-primary-50 rounded-full py-0.5 px-2 border border-primary-100 w-fit">
                          <FiStar className="mr-1 h-3 w-3 text-amber-500" /> Premium Account
                        </div>
                      )}
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {userProfile?.userType === 'seller' ? (
                        <>
                          <Link
                            href="/seller/dashboard"
                            onClick={closeMenus}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center">
                              <FiGrid className="mr-3 h-4 w-4 text-primary-600 group-hover:text-primary-700" />
                              <span className="group-hover:text-gray-900">Seller Dashboard</span>
                            </div>
                          </Link>
                          <Link
                            href="/seller/gigs"
                            onClick={closeMenus}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center">
                              <FiShoppingBag className="mr-3 h-4 w-4 text-indigo-600 group-hover:text-indigo-700" />
                              <span className="group-hover:text-gray-900">My Services</span>
                            </div>
                          </Link>
                        </>
                      ) : (
                        <Link
                          href="/buyer/dashboard"
                          onClick={closeMenus}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center">
                            <FiGrid className="mr-3 h-4 w-4 text-primary-600 group-hover:text-primary-700" />
                            <span className="group-hover:text-gray-900">Buyer Dashboard</span>
                          </div>
                        </Link>
                      )}

                      <Link
                        href="./profile"
                        onClick={closeMenus}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center">
                          <FiUser className="mr-3 h-4 w-4 text-gray-600 group-hover:text-gray-700" />
                          <span className="group-hover:text-gray-900">Profile Settings</span>
                        </div>
                      </Link>

                      <Link
                        href="./profile"
                        onClick={closeMenus}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center">
                          <FiSettings className="mr-3 h-4 w-4 text-gray-600 group-hover:text-gray-700" />
                          <span className="group-hover:text-gray-900">Account Settings</span>
                        </div>
                      </Link>
                    </div>

                    {/* Logout button - prominently displayed */}
                    <div className="py-1 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer group"
                        title="Sign out of your account"
                      >
                        <div className="flex items-center">
                          <FiLogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                          <span className="font-medium group-hover:text-red-700">Sign Out</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Auth buttons for non-authenticated users */
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-all cursor-pointer hover:scale-105"
                  title="Sign in to your account"
                >
                  Log in
                </Link>

                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 rounded-full transition-all cursor-pointer hover:scale-105 text-black shadow-md"
                  title="Create a new account"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Translate Button */}
            <TranslateButton />

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                title={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {isMenuOpen ? (
                  <FiX className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <FiMenu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg py-3">
          <div className="px-4 space-y-1">
            {/* User info if authenticated */}
            {isAuthenticated && (
              <div className="pt-2 pb-4 mb-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center mr-3 border border-primary-100">
                    {user?.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user?.displayName || 'User'}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                </div>

                {/* Credits for premium users */}
                {isPremium && creditsRemaining > 0 && (
                  <div className="mt-3 flex items-center text-sm text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
                    <FiZap className="mr-2 h-4 w-4 text-amber-500" />
                    <span>{creditsRemaining} credits remaining</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation links */}
            <Link
              href="/marketplace"
              onClick={closeMenus}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group ${pathname === '/marketplace'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`}
            >
              <FiShoppingBag className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Browse Services</span>
            </Link>

            <Link
              href="/generate-assets"
              onClick={closeMenus}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group ${pathname === '/generate-assets'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`}
            >
              <FiZap className="mr-3 h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>AI Generator</span>
            </Link>

            {isAuthenticated ? (
              <>
                {userProfile?.userType === 'seller' ? (
                  <>
                    <Link
                      href="/seller/dashboard"
                      onClick={closeMenus}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group ${pathname.includes('/seller/dashboard')
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                        }`}
                    >
                      <FiGrid className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>Seller Dashboard</span>
                    </Link>
                    <Link
                      href="/seller/gigs"
                      onClick={closeMenus}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group ${pathname.includes('/seller/gigs')
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                        }`}
                    >
                      <FiShoppingBag className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>My Services</span>
                    </Link>
                    <Link
                      href="/seller/orders"
                      onClick={closeMenus}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group ${pathname.includes('/seller/orders')
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                        }`}
                    >
                      <FiBell className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>Orders</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/buyer/dashboard"
                      onClick={closeMenus}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group ${pathname.includes('/buyer/dashboard')
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                        }`}
                    >
                      <FiGrid className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>Buyer Dashboard</span>
                    </Link>
                    <Link
                      href="/buyer/orders"
                      onClick={closeMenus}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group ${pathname.includes('/buyer/orders')
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                        }`}
                    >
                      <FiBell className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>My Orders</span>
                    </Link>
                  </>
                )}

                <div className="pt-2 border-t border-gray-100 mt-2">
                  <Link
                    href="/profile"
                    onClick={closeMenus}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors cursor-pointer group"
                  >
                    <FiUser className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={closeMenus}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors cursor-pointer group"
                  >
                    <FiSettings className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Prominent logout button for mobile */}
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer group border border-red-200 hover:border-red-300"
                  >
                    <FiPower className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-gray-100 mt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 border border-gray-200 transition-colors cursor-pointer hover:scale-105"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMenus}
                  className="flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 transition-colors cursor-pointer hover:scale-105"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;