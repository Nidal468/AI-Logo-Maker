'use client';

import { useState, useEffect } from 'react';
import { getAllGigs } from '@/firebase/firestore';
import GigCard from './GigCard';
import Loading from '@/components/common/Loading';
import Button from '@/components/common/Button';

const GigList = ({ initialGigs = [], category = null }) => {
  const [gigs, setGigs] = useState(initialGigs);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (initialGigs.length === 0) {
      loadGigs();
    }
  }, [category]);

  const loadGigs = async () => {
    try {
      setLoading(true);
      const { gigs: newGigs, lastDoc: newLastDoc } = await getAllGigs(null, 9, category);
      setGigs(newGigs);
      setLastDoc(newLastDoc);
      setHasMore(newGigs.length === 9); // If we got less than requested, there are no more
    } catch (error) {
      console.error('Error loading gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreGigs = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const { gigs: newGigs, lastDoc: newLastDoc } = await getAllGigs(lastDoc, 9, category);
      setGigs([...gigs, ...newGigs]);
      setLastDoc(newLastDoc);
      setHasMore(newGigs.length === 9); // If we got less than requested, there are no more
    } catch (error) {
      console.error('Error loading more gigs:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <Loading text="Loading services..." />;
  }

  if (gigs.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
        <p className="text-gray-600">
          {category 
            ? `There are no services available in this category at the moment.` 
            : `There are no services available at the moment.`}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gigs.map((gig) => (
          <GigCard key={gig.id} gig={gig} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <Button 
            onClick={loadMoreGigs} 
            variant="outline"
            isLoading={loadingMore}
            disabled={loadingMore}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default GigList;