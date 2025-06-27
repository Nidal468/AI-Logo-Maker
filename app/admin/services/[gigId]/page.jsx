// app/admin/services/[gigId]/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // For displaying gig images
import { collection, getDocs, query, orderBy, where,getDoc, limit, startAfter, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config'; // Ensure this path is correct
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiArrowLeft, FiEdit, FiSave, FiGrid, FiTag, FiDollarSign, FiUser, FiCalendar, FiCheckSquare, FiXSquare,
  FiImage, FiFileText, FiList, FiAlertCircle, FiClock, FiEye, FiPaperclip, FiPackage, FiMessageSquare,
  FiRepeat
} from 'react-icons/fi';

const GigStatusBadge = ({ status }) => {
    let colorClasses = 'bg-gray-100 text-gray-800';
    if (status === 'active') colorClasses = 'bg-green-100 text-green-800';
    else if (status === 'pending_approval') colorClasses = 'bg-yellow-100 text-yellow-800';
    else if (status === 'rejected') colorClasses = 'bg-red-100 text-red-800';
    else if (status === 'paused' || status === 'disabled') colorClasses = 'bg-orange-100 text-orange-800';
    else if (status === 'deleted') colorClasses = 'bg-stone-100 text-stone-800';
  
  
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>
        {status ? status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
      </span>
    );
  };
// Helper to format dates (can be moved to a utils file)
const formatDate = (timestamp, includeTime = false) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleDateString('en-US', options);
};

// Detail Item component (can be shared)
const DetailItem = ({ label, value, icon: Icon, isLink = false, href = '#', preformatted = false }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500 flex items-center">
      {Icon && <Icon className="h-5 w-5 text-gray-400 mr-2" />}
      {label}
    </dt>
    <dd className={`mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 ${preformatted ? 'whitespace-pre-wrap bg-gray-50 p-2 rounded-md' : ''}`}>
      {isLink ? (
        <Link href={href} className="text-indigo-600 hover:text-indigo-800 hover:underline">
          {value}
        </Link>
      ) : (
        value
      )}
    </dd>
  </div>
);

// Define categories (consistent with the list page or fetched dynamically)
const gigCategories = ['Graphics & Design', 'Digital Marketing', 'Writing & Translation', 'Video & Animation', 'Music & Audio', 'Programming & Tech', 'Business', 'Lifestyle', 'AI Services'];
const gigStatusOptions = ['active', 'pending_approval', 'paused', 'rejected', 'deleted']; // Admin manageable statuses


export default function ServiceDetailPage({ params }) {
  const { gigId } = params;
  const router = useRouter();

  const [gig, setGig] = useState(null);
  const [seller, setSeller] = useState(null);
  const [relatedOrders, setRelatedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm();

  const fetchGigData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const gigDocRef = doc(db, 'gigs', gigId);
      const gigDoc = await getDoc(gigDocRef);

      if (!gigDoc.exists()) {
        setError('Service (Gig) not found.');
        toast.error('Service not found.');
        setIsLoading(false);
        // router.push('/admin/services'); // Option: redirect if not found
        return;
      }
      const gigData = { id: gigDoc.id, ...gigDoc.data() };
      setGig(gigData);

      // Reset form with gig data
      reset({
        title: gigData.title || '',
        description: gigData.description || '',
        category: gigData.category || '',
        price: gigData.price || 0,
        tags: Array.isArray(gigData.tags) ? gigData.tags.join(', ') : '',
        deliveryTime: gigData.deliveryTime || 1,
        revisions: gigData.revisions || 0,
        status: gigData.status || 'pending_approval',
        // Add other fields as necessary
      });

      // Fetch Seller details
      if (gigData.sellerId) {
        const sellerDocRef = doc(db, 'users', gigData.sellerId);
        const sellerDoc = await getDoc(sellerDocRef);
        if (sellerDoc.exists()) {
          setSeller({ id: sellerDoc.id, ...sellerDoc.data() });
        }
      }

      // Fetch related orders (optional, can be intensive)
      const ordersQuery = query(collection(db, 'orders'), where('gigId', '==', gigId), orderBy('createdAt', 'desc'), limit(5));
      const ordersSnapshot = await getDocs(ordersQuery);
      setRelatedOrders(ordersSnapshot.docs.map(d => ({id: d.id, ...d.data()})));


    } catch (err) {
      console.error("Error fetching service details:", err);
      setError('Failed to fetch service details. ' + err.message);
      toast.error('Failed to fetch service details.');
    } finally {
      setIsLoading(false);
    }
  }, [gigId, reset]);

  useEffect(() => {
    if (gigId) {
      fetchGigData();
    }
  }, [gigId, fetchGigData]);

  const onSubmitForm = async (data) => {
    setIsSubmitting(true);
    try {
      const gigRef = doc(db, 'gigs', gigId);
      const updateData = {
        title: data.title,
        description: data.description,
        category: data.category,
        price: parseFloat(data.price) || 0,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        deliveryTime: parseInt(data.deliveryTime) || 1,
        revisions: parseInt(data.revisions) || 0,
        status: data.status,
        updatedAt: serverTimestamp(),
        // Potentially adminNotes or reasonForEdit
        // lastEditedByAdmin: 'adminUserId', // If tracking admin actions
      };
      await updateDoc(gigRef, updateData);
      setGig(prevGig => ({ ...prevGig, ...updateData, price: parseFloat(data.price), deliveryTime: parseInt(data.deliveryTime), revisions: parseInt(data.revisions) })); // Update local state
      toast.success('Service details updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating service details:", error);
      toast.error('Failed to update service: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => router.push('/admin/services')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Services List
        </button>
      </div>
    );
  }

  if (!gig) {
    return <p className="text-center p-10">Service data could not be loaded or does not exist.</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6" style={{maxWidth:"95%",margin:"auto",marginTop:"2%"}}>
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 truncate max-w-xl" title={gig.title}>Service: {gig.title}</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
            isEditing
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isEditing ? <FiXSquare className="mr-2" /> : <FiEdit className="mr-2" />}
          {isEditing ? 'Cancel Edit' : 'Edit Service'}
        </button>
      </div>

      {/* Gig Details View or Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Edit Service Information</h2>
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" id="title" {...register('title', { required: 'Title is required' })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" {...register('description', { required: 'Description is required' })} rows="5"
              className={`mt-1 block w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}></textarea>
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select id="category" {...register('category', { required: 'Category is required' })}
                className={`mt-1 block w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}>
                <option value="">Select Category</option>
                {gigCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
              <Controller
                name="price"
                control={control}
                rules={{ required: "Price is required", min: { value: 0.01, message: "Price must be positive" } }}
                render={({ field }) => (
                  <input type="number" id="price" {...field} step="0.01"
                    className={`mt-1 block w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
                )}
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
            <input type="text" id="tags" {...register('tags')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Time */}
            <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">Delivery Time (days)</label>
                <Controller
                    name="deliveryTime"
                    control={control}
                    rules={{ required: "Delivery time is required", min: { value: 1, message: "Minimum 1 day" } }}
                    render={({ field }) => (
                        <input type="number" id="deliveryTime" {...field} min="1"
                            className={`mt-1 block w-full px-3 py-2 border ${errors.deliveryTime ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
                    )}
                />
                {errors.deliveryTime && <p className="text-xs text-red-500 mt-1">{errors.deliveryTime.message}</p>}
            </div>

            {/* Revisions */}
            <div>
                <label htmlFor="revisions" className="block text-sm font-medium text-gray-700">Revisions</label>
                 <Controller
                    name="revisions"
                    control={control}
                    rules={{ required: "Number of revisions is required", min: { value: 0, message: "Cannot be negative" } }}
                    render={({ field }) => (
                        <input type="number" id="revisions" {...field} min="0"
                            className={`mt-1 block w-full px-3 py-2 border ${errors.revisions ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
                    )}
                />
                {errors.revisions && <p className="text-xs text-red-500 mt-1">{errors.revisions.message}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" {...register('status', { required: 'Status is required' })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}>
              {gigStatusOptions.map(stat => <option key={stat} value={stat}>{stat.replace('_',' ').toUpperCase()}</option>)}
            </select>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => { setIsEditing(false); reset(); /* Reset to original values */ fetchGigData(); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : <><FiSave className="inline mr-2" /> Save Changes</>}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Service Details</h2>
            <GigStatusBadge status={gig.status} />
          </div>
          <dl className="divide-y divide-gray-200">
            <DetailItem label="Gig ID" value={gig.id} icon={FiGrid} />
            <DetailItem label="Title" value={gig.title} icon={FiEdit} />
            <DetailItem label="Description" value={gig.description} icon={FiFileText} preformatted />
            <DetailItem label="Category" value={gig.category} icon={FiTag} />
            <DetailItem label="Price" value={`$${gig.price?.toFixed(2)}`} icon={FiDollarSign} />
            <DetailItem label="Tags" value={Array.isArray(gig.tags) ? gig.tags.join(', ') : 'N/A'} icon={FiList} />
            <DetailItem label="Delivery Time" value={`${gig.deliveryTime} day(s)`} icon={FiClock} />
            <DetailItem label="Revisions" value={gig.revisions ?? 'N/A'} icon={FiRepeat} />
            {seller && <DetailItem label="Seller" value={seller.displayName || seller.email} icon={FiUser} isLink href={`/admin/users/${seller.id}`} />}
            <DetailItem label="Created At" value={formatDate(gig.createdAt, true)} icon={FiCalendar} />
            <DetailItem label="Last Updated" value={formatDate(gig.updatedAt, true)} icon={FiCalendar} />
             {gig.images && gig.images.length > 0 && (
                <div className="py-3">
                    <dt className="text-sm font-medium text-gray-500 flex items-center mb-2">
                        <FiImage className="h-5 w-5 text-gray-400 mr-2" />
                        Images
                    </dt>
                    <dd className="mt-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {gig.images.map((image, index) => (
                            <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
                                <Image src={image.url || 'https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image'} alt={`Gig Image ${index + 1}`} layout="fill" objectFit="cover" onError={(e) => e.currentTarget.src='https://placehold.co/300x300/e2e8f0/94a3b8?text=Error'}/>
                            </div>
                        ))}
                    </dd>
                </div>
            )}
          </dl>
        </div>
      )}

      {/* Related Orders */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders for this Service (Max 5)</h3>
        {relatedOrders.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {relatedOrders.map(order => (
              <li key={order.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    <Link href={`/admin/orders/${order.id}`}>Order ID: #{order.id.substring(0,8)}...</Link>
                  </p>
                  <p className="text-xs text-gray-500">
                    Buyer: <Link href={`/admin/users/${order.buyerId}`} className="hover:underline">{order.buyerName || order.buyerId.substring(0,8)}...</Link> | Status: {order.status}
                  </p>
                </div>
                <span className="text-sm text-gray-700">${order.gigPrice?.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No recent orders found for this service.</p>
        )}
      </div>

       {/* Admin Actions Log (Placeholder) */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Actions Log</h3>
            <p className="text-sm text-gray-500">Feature to log admin changes to this gig (e.g., status updates, edits) can be implemented here.</p>
            {/* Example Log Item:
            <div className="text-xs text-gray-400 mt-1">
                [Timestamp] Admin 'admin_username' changed status from 'pending' to 'active'.
            </div>
            */}
        </div>

    </div>
  );
}
