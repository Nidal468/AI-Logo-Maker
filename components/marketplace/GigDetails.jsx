'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Assuming AuthContext path
import { format, isValid } from 'date-fns';
import { FiStar, FiHeart, FiClock, FiRepeat, FiUser, FiCalendar, FiCheck, FiInfo, FiPackage, FiMessageSquare, FiAlertTriangle } from 'react-icons/fi';
import Button from '@/components/common/Button'; // Assuming Button component path
import Modal from '@/components/common/Modal'; // Assuming Modal component path
import { createOrder, getUserProfile, getOrCreateConversation } from '@/firebase/firestore'; // Added getUserProfile, getOrCreateConversation
import { toast } from 'react-toastify';

const GigDetails = ({ gig, seller }) => {
  // --- State ---
  const [selectedImage, setSelectedImage] = useState(gig?.images?.[0]?.url || '');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false); // State for chat initiation
  const [componentError, setComponentError] = useState('');

  // --- Hooks ---
  const { user, userProfile, isAuthenticated } = useAuth();
  const router = useRouter();

  // --- Effects ---
   useEffect(() => {
    setSelectedImage(gig?.images?.[0]?.url || '');
   }, [gig?.images]);

   useEffect(() => {
    setComponentError('');
   }, [gig, seller]);


  // --- Handlers ---
  const handleOrderNow = () => {
    setComponentError('');
    if (!isAuthenticated || !user) {
      toast.info('Please log in or sign up to place an order.');
      router.push(`/login?redirect=/gig/${gig?.id || ''}`);
      return;
    }
    if (userProfile?.userType === 'seller') {
      toast.error('Sellers cannot place orders.'); return;
    }
    if (user?.uid === gig?.sellerId) {
        toast.error("You cannot order your own gig."); return;
    }
    if (!gig?.id || gig.price === undefined || !seller?.displayName || !gig?.sellerId) {
        setComponentError("Cannot proceed: Essential service/seller details missing.");
        toast.error("Cannot proceed: Missing details.");
        return;
    }
    setIsOrderModalOpen(true);
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setComponentError('');
    console.log("Placing Order - Checking Data:", { userId: user?.uid, gigId: gig?.id, sellerUid: seller?.uid, gigPrice: gig?.price });

    if (!user?.uid || !gig?.id || !seller?.uid || gig.price === undefined || gig.price === null) {
        const missing = [];
        if (!user?.uid) missing.push("Buyer ID");
        if (!gig?.id) missing.push("Service ID");
        if (!seller?.uid) missing.push("Seller ID");
        if (gig?.price === undefined || gig?.price === null) missing.push("Price");
        const errorMsg = `Missing required information: ${missing.join(', ')}. Please refresh.`;
        toast.error(errorMsg); setComponentError(`Order cannot be placed. ${errorMsg}`);
        setIsOrderModalOpen(false); setIsPlacingOrder(false); return;
    }

    try {
      const orderData = {
        gigId: gig.id, gigTitle: gig.title || 'Untitled Gig', gigImage: gig.images?.[0]?.url || '',
        gigPrice: gig.price, sellerId: seller.uid, sellerName: seller.displayName || 'Unknown Seller',
        sellerImage: seller.profileImage || '', buyerId: user.uid,
        buyerName: userProfile?.displayName || user.displayName || 'Unknown Buyer',
        buyerImage: userProfile?.profileImage || '', deliveryTime: gig.deliveryTime || 1,
        requirements: '', messages: [], revisions: gig.revisions ?? 'Unlimited',
      };
      console.log("Order Data Prepared:", orderData);
      const orderId = await createOrder(orderData);
      console.log("Order Created Successfully, ID:", orderId);
      toast.success('Order placed successfully!');
      setIsOrderModalOpen(false);
      router.push(`/buyer/orders/${orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(`Failed to place order: ${error.message || 'Please try again.'}`);
      setComponentError(`Order failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // **NEW:** Handler for Contact Seller / Start Chat
  const handleContactSeller = async () => {
    setComponentError('');
    if (!isAuthenticated || !user || !userProfile) {
      toast.info('Please log in to contact the seller.');
      router.push(`/login?redirect=/gig/${gig?.id || ''}`);
      return;
    }
     if (!seller?.uid) {
         toast.error("Seller information is missing. Cannot start chat.");
         setComponentError("Seller details unavailable.");
         return;
     }
     if (user.uid === seller.uid) {
         toast.info("You cannot contact yourself."); // Should be disabled anyway
         return;
     }

    setIsStartingChat(true);
    try {
        // Prepare user info
        const currentUserInfo = {
            displayName: userProfile.displayName || user.displayName || 'Me',
            profileImage: userProfile.profileImage || user.photoURL || '',
        };
        // Seller info is already available in the 'seller' prop
        const sellerInfo = {
            displayName: seller.displayName || 'Seller',
            profileImage: seller.profileImage || '',
        };

        console.log(`Initiating chat between ${user.uid} and ${seller.uid}`);
        const conversationId = await getOrCreateConversation(
            user.uid,
            seller.uid,
            currentUserInfo,
            sellerInfo
        );
        console.log(`Conversation ID: ${conversationId}`);

        // Determine the correct messages path based on current user's type
        const messagesBasePath = userProfile.userType === 'seller' ? '/seller/messages' : '/buyer/messages';
        const chatUrl = `${messagesBasePath}?contact=${seller.uid}`;

        toast.success("Starting chat...");
        router.push(chatUrl);

    } catch (error) {
        console.error("Error starting chat:", error);
        toast.error(`Could not start chat: ${error.message}`);
        setComponentError(`Could not start chat: ${error.message}`);
    } finally {
        setIsStartingChat(false);
    }
  };


  // --- Utility Functions ---
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    let date;
    try {
      if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
        date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      } else if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
         date = timestamp;
      } else { return 'Invalid Format'; }
      if (!isValid(date)) { return 'Invalid Date'; }
      return format(date, 'MMMM d, yyyy'); // Changed format slightly
    } catch (error) { console.error("Error in formatDate:", error); return 'Date Error'; }
  };

  // --- Render Logic ---
  if (!gig || !seller) { // Keep the loading/initial check
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
         <FiAlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
         <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Service Details...</h2>
         <p className="text-gray-500">
            { !gig && "Waiting for service information." }
            { gig && !seller && "Waiting for seller information." }
         </p>
      </div>
    );
  }

  const isOwnGig = user?.uid === gig.sellerId;
  const sellerProfileLink = `/seller/${seller?.uid || seller?.id || gig.sellerId}`; // Prefer uid

  // **FIX:** Determine correct messages path
  const messagesBasePath = userProfile?.userType === 'seller' ? '/seller/messages' : '/buyer/messages';
  // Construct the final chat link (used if Button doesn't handle onClick)
  // const chatLink = isAuthenticated ? `${messagesBasePath}?contact=${seller?.uid || seller?.id}` : `/login?redirect=/gig/${gig?.id || ''}`;


  return (
    <div className="container mx-auto px-4 py-8">
       {componentError && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-md border border-red-200 flex items-center">
            <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{componentError}</span>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="sr-only">Gig Images</h2>
            <div className="mb-4">
              <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden border">
                {selectedImage ? (
                  <Image key={selectedImage} src={selectedImage} alt={gig.title || 'Gig main image'} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw" onError={(e) => { e.target.onerror = null; const placeholderUrl = `https://placehold.co/1280x720/e2e8f0/9ca3af?text=Image+Not+Available`; e.target.src = placeholderUrl; if (selectedImage === e.target.currentSrc || !selectedImage) { setSelectedImage(placeholderUrl); } }} />
                ) : ( <div className="flex items-center justify-center h-full text-gray-400"> <FiPackage className="w-16 h-16 " /> <span className="ml-2">No Image</span> </div> )}
              </div>
            </div>
            {gig.images && gig.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
                {gig.images.map((image, index) => (
                  <button key={image.url || index} className={`relative aspect-square bg-gray-100 rounded-md cursor-pointer overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${selectedImage === image.url ? 'border-primary-500 ring-1 ring-primary-500' : 'border-transparent hover:border-gray-400'}`} onClick={() => setSelectedImage(image.url)} aria-label={`View image ${index + 1}`}>
                    <Image src={image.url} alt={`${gig.title || 'Gig thumbnail'} ${index + 1}`} fill className="object-cover" sizes="15vw" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/e2e8f0/9ca3af?text=N/A`; }} />
                    {selectedImage === image.url && ( <div className="absolute inset-0 border-2 border-primary-600 rounded-md pointer-events-none"></div> )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
             <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{gig.title || 'Gig Title Not Available'}</h1>
             <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-6 border-b pb-4">
                <Link href={sellerProfileLink} className="flex items-center group mr-2 shrink-0">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 border group-hover:border-primary-500 transition">
                         {seller?.profileImage ? ( <Image src={seller.profileImage} alt={seller.displayName || 'Seller'} fill className="object-cover" onError={(e) => { e.target.style.display='none'; }} /> ) : ( <div className="w-full h-full bg-gray-200 flex items-center justify-center"><FiUser className="w-4 h-4 text-gray-500" /></div> )}
                    </div>
                    <span className="font-medium text-gray-800 group-hover:text-primary-600 transition line-clamp-1">{seller?.displayName || 'Seller Name'}</span>
                </Link>
                <span className="hidden sm:inline text-gray-300">|</span>
                <div className="flex items-center shrink-0"> <FiStar className="w-4 h-4 text-yellow-400 mr-1" /> <span className="font-semibold text-gray-800">{gig.rating?.toFixed(1) || 'New'}</span> <span className="ml-1">({gig.reviewCount || 0} reviews)</span> </div>
                <span className="hidden sm:inline text-gray-300">|</span>
                <div className="flex items-center shrink-0"> <FiClock className="w-4 h-4 text-gray-500 mr-1" /> <span>{gig.orderCount || 0} Orders in Queue</span> </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start p-3 bg-gray-50 rounded-md border"> <FiClock className="w-5 h-5 text-primary-600 mr-3 mt-1 flex-shrink-0" /> <div> <p className="text-sm font-medium text-gray-800">Delivery Time</p> <p className="text-sm text-gray-600">{gig.deliveryTime || 'N/A'} day{gig.deliveryTime === 1 ? '' : 's'}</p> </div> </div>
                <div className="flex items-start p-3 bg-gray-50 rounded-md border"> <FiRepeat className="w-5 h-5 text-primary-600 mr-3 mt-1 flex-shrink-0" /> <div> <p className="text-sm font-medium text-gray-800">Revisions</p> <p className="text-sm text-gray-600">{gig.revisions ?? 'Unlimited'}</p> </div> </div>
              </div>
          </div>

          {/* About */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"> <FiInfo className="w-5 h-5 mr-2 text-primary-600"/> About This Service </h2>
            <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 whitespace-pre-wrap break-words"> {gig.description || 'No description provided.'} </div>
          </div>

          {/* Features */}
          {gig.features && gig.features.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"> <FiPackage className="w-5 h-5 mr-2 text-primary-600"/> What's Included </h2>
              <ul className="space-y-3">
                {gig.features.map((feature, index) => ( <li key={index} className="flex items-start"> <FiCheck className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" /> <span className="text-gray-700 break-words">{feature}</span> </li> ))}
              </ul>
            </div>
          )}
        </div> {/* End Left Column */}

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pricing Box */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-6">
             <div className="pb-4 mb-4 border-b"> <h3 className="text-2xl font-bold text-gray-900 mb-1">${gig.price?.toFixed(2) || '0.00'}</h3> <p className="text-gray-600 text-sm"> Standard Package </p> </div>
             <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center text-gray-700"> <FiClock className="w-4 h-4 text-gray-500 mr-2 shrink-0" /> <span>{gig.deliveryTime || 'N/A'} day{gig.deliveryTime === 1 ? '' : 's'} delivery</span> </div>
                <div className="flex items-center text-gray-700"> <FiRepeat className="w-4 h-4 text-gray-500 mr-2 shrink-0" /> <span>{gig.revisions ?? 'Unlimited'} revision{gig.revisions === 1 ? '' : 's'}</span> </div>
                 {gig.features?.[0] && ( <div className="flex items-start text-gray-700"> <FiCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" /> <span className="line-clamp-1">{gig.features[0]}</span> </div> )}
                 {gig.features?.[1] && ( <div className="flex items-start text-gray-700"> <FiCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" /> <span className="line-clamp-1">{gig.features[1]}</span> </div> )}
             </div>
             <div className="space-y-3">
                <Button onClick={handleOrderNow} fullWidth size="lg" disabled={isOwnGig || isPlacingOrder} className={isOwnGig ? '!bg-gray-300 !text-gray-500 !border-gray-300 !cursor-not-allowed' : ''} aria-label={isOwnGig ? "This is your own gig" : `Continue to order for $${gig.price?.toFixed(2)}`}> {isOwnGig ? 'This is Your Gig' : `Continue ($${gig.price?.toFixed(2)})`} </Button>
                <Button variant="outline" fullWidth disabled={isOwnGig} aria-label="Add to favorites"> <FiHeart className="mr-2" /> Add to Favorites </Button>
             </div>
          </div>

          {/* Seller Info Box */}
          {!isOwnGig && seller && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-start mb-4">
                    <div className="mr-4 flex-shrink-0">
                        <Link href={sellerProfileLink} className="block relative w-14 h-14 bg-gray-200 rounded-full overflow-hidden border hover:border-primary-500 transition">
                             {seller.profileImage ? ( <Image src={seller.profileImage} alt={seller.displayName || 'Seller'} fill className="object-cover" onError={(e) => { e.target.style.display='none'; }} /> ) : ( <div className="w-full h-full flex items-center justify-center"><FiUser className="w-7 h-7 text-gray-500" /></div> )}
                        </Link>
                    </div>
                    <div className="flex-grow min-w-0">
                        <Link href={sellerProfileLink} className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition block truncate"> {seller.displayName || 'Seller Name'} </Link>
                        <p className="text-sm text-gray-600 mb-1 truncate"> {seller.title || 'Freelancer'} </p>
                        <div className="flex items-center text-sm text-gray-600"> <FiStar className="w-4 h-4 text-yellow-400 mr-1 shrink-0" /> <span className="font-medium">{seller.rating?.toFixed(1) || 'New'}</span> <span className="mx-1.5">•</span> <span>{seller.reviewCount || 0} reviews</span> </div>
                    </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-4 border-t pt-3 mt-3"> <FiCalendar className="w-4 h-4 mr-2 shrink-0" /> <span>Member since {formatDate(seller.createdAt)}</span> </div>
                {/* **FIX: Use onClick instead of href for dynamic chat initiation** */}
                <Button
                    onClick={handleContactSeller}
                    variant="outline"
                    fullWidth
                    isLoading={isStartingChat}
                    disabled={isStartingChat || !isAuthenticated} // Disable if not logged in
                >
                     <FiMessageSquare className="mr-2"/> Contact Seller
                </Button>
            </div>
          )}
           {!isOwnGig && !seller && ( // Show placeholder if seller data failed to load
             <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center"> <FiUser className="w-10 h-10 text-gray-400 mx-auto mb-3" /> <p className="text-sm text-gray-500">Seller information unavailable.</p> </div>
           )}
        </div> {/* End Right Column */}

      </div> {/* End Grid */}

      {/* Order Modal */}
      <Modal isOpen={isOrderModalOpen} onClose={() => !isPlacingOrder && setIsOrderModalOpen(false)} title="Confirm Your Order" size="md" footer={ <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 space-y-2 sm:space-y-0"> <Button variant="outline" onClick={() => setIsOrderModalOpen(false)} disabled={isPlacingOrder} className="w-full sm:w-auto"> Cancel </Button> <Button onClick={handlePlaceOrder} isLoading={isPlacingOrder} disabled={isPlacingOrder} className="w-full sm:w-auto"> {isPlacingOrder ? 'Processing...' : `Confirm & Pay $${gig.price?.toFixed(2)}`} </Button> </div> } >
        <div className="space-y-4 p-1">
          <div className="flex items-center p-3 bg-gray-50 rounded-md border">
             <div className="relative w-16 h-12 rounded overflow-hidden mr-4 border flex-shrink-0 bg-gray-200">
                 {gig.images?.[0]?.url ? ( <Image src={gig.images[0].url} alt="Gig image" fill className="object-cover" onError={(e) => { e.target.style.display='none'; }}/> ) : ( <div className="w-full h-full flex items-center justify-center"><FiPackage className="w-6 h-6 text-gray-400" /></div> )}
             </div>
             <div className='min-w-0'> <p className="text-sm text-gray-500">Service</p> <p className="font-medium text-gray-800 line-clamp-2">{gig.title}</p> </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded border"> <p className="text-gray-500 mb-1">Delivery</p> <p className="font-medium text-gray-800">{gig.deliveryTime} day{gig.deliveryTime === 1 ? '' : 's'}</p> </div>
              <div className="bg-gray-50 p-3 rounded border"> <p className="text-gray-500 mb-1">Revisions</p> <p className="font-medium text-gray-800">{gig.revisions ?? 'Unlimited'}</p> </div>
          </div>
          <div className="flex items-center justify-between border-t pt-4 mt-4"> <h3 className="text-lg font-medium text-gray-800">Total Price:</h3> <p className="text-xl font-semibold text-primary-600">${gig.price?.toFixed(2)}</p> </div>
          <div className="border-t pt-4 mt-4"> <p className="text-gray-600 text-xs"> By confirming, you agree to the Terms of Service. You'll provide project requirements on the next page. Payment will be processed securely. </p> </div>
        </div>
      </Modal>
    </div> // End Container
  );
};

export default GigDetails;
