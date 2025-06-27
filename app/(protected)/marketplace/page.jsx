import { Suspense } from 'react';
import SearchBar from '@/components/marketplace/SearchBar';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import GigList from '@/components/marketplace/GigList';
import Loading from '@/components/common/Loading';

export const metadata = {
  title: 'Marketplace - Find Services',
  description: 'Browse and discover professional services from our talented freelancers.',
};

export default function MarketplacePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Find Services</h1>
        <SearchBar />
      </div>
      
      <CategoryFilter className="mb-6" />
      
      <Suspense fallback={<Loading />}>
        <GigList />
      </Suspense>
    </div>
  );
}