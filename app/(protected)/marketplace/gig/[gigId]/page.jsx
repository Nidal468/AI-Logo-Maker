import { Suspense } from 'react';
import { getGigById } from '@/firebase/firestore';
import { getCurrentUserData } from '@/firebase/auth';
import GigDetails from '@/components/marketplace/GigDetails';
import Loading from '@/components/common/Loading';

export async function generateMetadata({ params }) {
  try {
    const gig = await getGigById(params.gigId);
    return {
      title: `${gig.title} | Freelance Marketplace`,
      description: gig.description.substring(0, 160),
    };
  } catch (error) {
    return {
      title: 'Service Details | Freelance Marketplace',
      description: 'View service details and place your order.',
    };
  }
}

async function getGigDetails(gigId) {
  try {
    const gig = await getGigById(gigId);
    const seller = await getCurrentUserData(gig.sellerId);
    return { gig, seller };
  } catch (error) {
    console.error('Error fetching gig details:', error);
    return { error: 'Failed to load gig details' };
  }
}

export default async function GigDetailsPage({ params }) {
  const { gigId } = params;
  const { gig, seller, error } = await getGigDetails(gigId);
  
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Service Not Found</h2>
        <p className="text-gray-600 mb-6">The service you're looking for might have been removed or doesn't exist.</p>
        <a href="/marketplace" className="text-primary-600 hover:text-primary-700 font-medium">
          Browse other services
        </a>
      </div>
    );
  }
  
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <GigDetails gig={gig} seller={seller} />
      </Suspense>
    </div>
  );
}