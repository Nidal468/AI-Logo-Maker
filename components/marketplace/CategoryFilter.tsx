'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const categories = [
  { id: 'all', name: 'All Categories', path: '/marketplace' },
  { id: 'web-development', name: 'Web Development', path: '/marketplace/web-development' },
  { id: 'graphic-design', name: 'Graphic Design', path: '/marketplace/graphic-design' },
  { id: 'content-writing', name: 'Content Writing', path: '/marketplace/content-writing' },
  { id: 'digital-marketing', name: 'Digital Marketing', path: '/marketplace/digital-marketing' },
  { id: 'video-animation', name: 'Video & Animation', path: '/marketplace/video-animation' },
];

const CategoryFilter = ({ className = '' }) => {
  const pathname = usePathname();

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="min-w-max flex space-x-2 p-1">
        {categories.map((category) => {
          const isActive = 
            (category.id === 'all' && pathname === '/marketplace') ||
            (category.id !== 'all' && pathname === category.path);
            
          return (
            <Link
              key={category.id}
              href={category.path}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;