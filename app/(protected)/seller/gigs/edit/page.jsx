import { getGigById } from '@/firebase/firestore';
import GigForm from '@/components/seller/GigForm';

export async function generateMetadata({ params }) {
  try {
    const gig = await getGigById(params.gigId);
    return {
      title: `Edit ${gig.title} - Freelance Marketplace`,
      description: 'Edit your service details.',
    };
  } catch (error) {
    return {
      title: 'Edit Service - Freelance Marketplace',
      description: 'Edit your service details.',
    };
  }
}

export default function EditGigPage({ params }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
        <p className="text-gray-600 mt-1">
          Update your service details and offerings.
        </p>
      </div>
      
      <GigForm gigId={params.gigId} />
    </div>
  );
}