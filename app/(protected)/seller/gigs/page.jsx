'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Assuming path
import { getGigsBySellerId } from '@/firebase/firestore'; // Assuming path
import GigCard from '@/components/marketplace/GigCard'; // Assuming path
import Card from '@/components/common/Card'; // Assuming path
import Button from '@/components/common/Button'; // Assuming path
import Loading from '@/components/common/Loading'; // Assuming path
import { FiPlus, FiAlertTriangle } from 'react-icons/fi'; // Added icon

export default function SellerGigsPage() {
  const { user, loading: authLoading } = useAuth(); // Get auth loading state if available
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading gigs data
  const [error, setError] = useState(null); // State for storing fetch errors

  useEffect(() => {
    // Function to fetch gigs
    const fetchGigs = async (userId) => {
      console.log(`Fetching gigs for sellerId: ${userId}`);
      setError(null); // Clear previous errors
      setLoading(true);
      try {
        const fetchedGigs = await getGigsBySellerId(userId);
        console.log('Fetched Gigs:', fetchedGigs); // Log the result
        setGigs(fetchedGigs || []); // Ensure gigs is always an array
      } catch (err) {
        console.error('Error fetching seller gigs:', err);
        setError(err.message || 'Failed to load your services. Please try again.');
        setGigs([]); // Clear gigs on error
      } finally {
        setLoading(false);
      }
    };

    // Wait for authentication to potentially finish and user object to be available
    if (!authLoading) {
      if (user?.uid) {
        fetchGigs(user.uid);
      } else {
        // If auth is done but user is null/undefined, they are not logged in
        console.log('User not logged in or UID not available.');
        setLoading(false); // Stop loading as there's no user to fetch for
        setGigs([]); // Ensure gigs are empty
        // setError("Please log in to view your services."); // Optional: Show login message
      }
    } else {
        console.log("Waiting for authentication...");
        // Keep loading true while auth is loading
        setLoading(true);
    }

  }, [user, authLoading]); // Rerun effect when user or authLoading state changes

  // Display loading state (covers both auth loading and data loading)
  if (loading) {
    return <Loading message="Loading your services..." />;
  }

  // Display error state
  if (error) {
    return (
        <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
            <FiAlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Services</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            {/* Optional: Add a retry button */}
            {/* <Button onClick={() => user?.uid && fetchGigs(user.uid)}>Retry</Button> */}
        </div>
    );
  }

  // Display main content
  return (
    <div className="container mx-auto px-4 py-8"> {/* Added container and padding */}
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600 mt-1">
            Manage and create your service listings.
          </p>
        </div>
        <Button href="/seller/gigs/create" className="flex-shrink-0"> {/* Prevent button shrinking */}
          <FiPlus className="mr-2" /> Create New Service
        </Button>
      </div>

      {/* Gigs Grid or Empty State */}
      {gigs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* Adjusted grid columns */}
          {gigs.map((gig) => (
            // Ensure GigCard is robust enough to handle potential missing fields in 'gig'
            <GigCard key={gig.id} gig={gig} isSellerView={true} /> // Pass isSellerView if GigCard needs it
          ))}
        </div>
      ) : (
        // Empty State Card
        <Card className="!py-12 !px-6 text-center"> {/* Use ! to override potential Card defaults */}
           <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No services found</h3>
          <p className="mt-1 text-sm text-gray-500 mb-6">
            Get started by creating your first service listing.
          </p>
          <Button href="/seller/gigs/create">
            <FiPlus className="mr-2" /> Create Your First Service
          </Button>
        </Card>
      )}
    </div>
  );
}
