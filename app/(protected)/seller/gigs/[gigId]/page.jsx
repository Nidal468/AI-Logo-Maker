import { getGigById, getUserProfile } from '@/firebase/firestore'; // Assuming getUserProfile exists
import GigDetails from '@/components/marketplace/GigDetails';
import Button from '@/components/common/Button'; // Assuming Button component path
import { FiEdit2, FiTrash2, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link'; // Import Link for navigation

// Generate dynamic metadata for the page (SEO)
export async function generateMetadata({ params }) {
  let gigTitle = 'Service Details'; // Default title
  try {
    // Fetch only the necessary field (title) for metadata if possible
    // This is a simplified example; adjust based on your Firestore structure/rules
    const gig = await getGigById(params.gigId);
    if (gig?.title) {
      gigTitle = gig.title;
    }
    return {
      title: `${gigTitle} - Manage Service | YourAppName`, // More descriptive title
      description: `Review and manage the details for your service: ${gigTitle}.`,
    };
  } catch (error) {
    console.error("Error fetching gig for metadata:", error);
    return {
      title: 'Service Details - Seller View | YourAppName',
      description: 'View and manage your service.',
    };
  }
}

// Fetches the core data for the page on the server
async function getGigData(gigId) {
  try {
    const gig = await getGigById(gigId);
    if (!gig) {
      return { error: 'Gig not found.' };
    }

    // --- Fetch Seller Data ---
    // Option 1: Seller data is embedded in the gig document (as assumed in original code)
    const seller = gig.seller;

    // Option 2: Fetch seller data separately using sellerId (Recommended if sellers have their own collection)
    // let seller = null;
    // if (gig.sellerId) {
    //   try {
    //     seller = await getUserProfile(gig.sellerId); // Use your function to get seller profile
    //   } catch (sellerError) {
    //     console.error("Error fetching seller profile:", sellerError);
    //     // Decide how to handle missing seller: show gig anyway, or return an error?
    //     // For now, we'll proceed without seller data if fetch fails
    //   }
    // }

    if (!seller) {
       console.warn(`Seller data not found or couldn't be fetched for gig ${gigId}. Displaying gig details without seller info.`);
       // You might want to return an error or provide default seller data depending on requirements
       // return { error: 'Seller data could not be loaded for this gig.' };
    }


    // Ensure the fetched gig object includes an ID if it wasn't already there
    if (!gig.id) {
        gig.id = gigId;
    }

    return { gig, seller }; // Return both gig and seller data
  } catch (error) {
    console.error(`Error fetching gig data for ID ${gigId}:`, error);
    // Provide a more specific error message if possible
    return { error: `Failed to load service details. ${error.message || ''}` };
  }
}

// The main page component (Server Component)
export default async function SellerGigDetailsPage({ params }) {
  const { gigId } = params;
  const { gig, seller, error } = await getGigData(gigId); // Fetch data

  // --- Error State ---
  if (error || !gig) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
         <FiAlertTriangle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Oops! Service Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          {error || "We couldn't find the service you're looking for. It might have been removed or the link is incorrect."}
        </p>
        <Button href="/seller/gigs" variant="outline">
            <FiArrowLeft className="mr-2"/>
            Back to My Services
        </Button>
      </div>
    );
  }

  // --- Success State ---
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Service</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Review details, edit, or remove this service listing.
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex space-x-3 flex-shrink-0 w-full md:w-auto">
          <Button
            href={`/seller/gigs/${gigId}/edit`}
            variant="primary" // Use primary for the main edit action
            className="flex-1 md:flex-none" // Make buttons take equal space on mobile
          >
            <FiEdit2 className="mr-1.5" /> Edit
          </Button>
          {/* Delete Button - Needs confirmation logic */}
          <Button
            variant="danger"
            className="flex-1 md:flex-none"
             // onClick={handleDeleteClick} // Add onClick handler for delete confirmation modal
             // Add aria-label for accessibility
             aria-label="Delete service"
          >
            <FiTrash2 className="mr-1.5" /> Delete
          </Button>
          {/* Add Delete Confirmation Modal Here */}
        </div>
      </div>

      {/* Gig Details Component */}
      {/* No need for an extra Card wrapper if GigDetails handles its own styling */}
      <GigDetails gig={gig} seller={seller} />

    </div>
  );
}
