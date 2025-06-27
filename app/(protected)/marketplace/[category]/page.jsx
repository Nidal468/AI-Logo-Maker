import { Suspense } from 'react';
import SearchBar from '@/components/marketplace/SearchBar';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import GigList from '@/components/marketplace/GigList';
import Loading from '@/components/common/Loading';

export async function generateMetadata({ params }) {
  const category = params.category;
  const formattedCategory = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  return {
    title: `${formattedCategory} Services - Marketplace`,
    description: `Browse and discover professional ${formattedCategory.toLowerCase()} services from our talented freelancers.`,
  };
}

export default function CategoryPage({ params }) {
  const category = params.category;
  const formattedCategory = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{formattedCategory} Services</h1>
        <SearchBar placeholder={`Search ${formattedCategory.toLowerCase()} services...`} />
      </div>
      
      <CategoryFilter className="mb-6" />
      
      <Suspense fallback={<Loading />}>
        <GigList category={category} />
      </Suspense>
    </div>
  );
}