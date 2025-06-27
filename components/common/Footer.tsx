import Link from 'next/link';
import Image from 'next/image';
import { FiGlobe, FiHeart } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Left side - Brand with Logo */}
          <div className="flex-1">
            <Link href="/" className="flex items-center space-x-3">
              <Image 
                src="/dlogo.png" 
                alt="Logo" 
                width={50} 
                height={50} 
                className="rounded-lg"
              />
             
            </Link>
            <p className="mt-2 text-gray-300 text-sm max-w-md">
              Connect with skilled freelancers worldwide 🌍
            </p>
          </div>
          
          {/* Center - Quick Links */}
          <div className="flex flex-wrap gap-6 md:gap-8">
            <Link 
              href="/about" 
              className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200 text-sm font-medium"
            >
              About Us
            </Link>
            <Link 
              href="/marketplace" 
              className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200 text-sm font-medium"
            >
              Browse Services
            </Link>
            <Link 
              href="/marketplace" 
              className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200 text-sm font-medium"
            >
              Find Freelancers
            </Link>
          </div>
          
          {/* Right side - Language */}
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <FiGlobe className="h-4 w-4 text-indigo-300" />
            <span className="ml-2 text-sm font-medium">🇩🇰 Danish</span>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-6 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm flex items-center">
            © {currentYear} Made with <FiHeart className="mx-1 h-4 w-4 text-red-400" /> for freelancers
          </p>
          <div className="mt-2 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;