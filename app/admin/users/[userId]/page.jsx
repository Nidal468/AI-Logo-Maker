// app/admin/users/[userId]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { collection, getDocs, query,getDoc, orderBy, where, limit, startAfter, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config'; // Ensure this path is correct
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiUser, FiMail, FiCalendar, FiTag, FiCheck, FiX,
  FiArrowLeft, FiEdit, FiSave, FiShoppingBag, FiGrid,
  FiMessageSquare, FiAlertCircle, FiInfo, FiDollarSign, FiBriefcase, FiEye, FiToggleLeft, FiToggleRight
} from 'react-icons/fi';

// Summary Card Component
const SummaryCard = ({ icon: Icon, title, value, bgColor = 'bg-blue-50', textColor = 'text-blue-700', link }) => {
  const content = (
    <div className={`${bgColor} rounded-lg p-4 flex items-start shadow hover:shadow-md transition-shadow`}>
      <div className={`p-2 mr-3 rounded-full ${bgColor.replace('-50', '-100')} ${textColor}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-600">{title}</p>
        <p className={`text-lg font-semibold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
  return link ? <Link href={link}>{content}</Link> : content;
};


// Activity Item Component
const ActivityItem = ({ icon: Icon, title, description, date, status, color = 'text-gray-700', linkTo }) => {
  const itemContent = (
    <div className="flex items-start py-3 hover:bg-gray-50 px-2 rounded-md">
      <div className={`p-2 rounded-full bg-gray-100 ${color} mr-3 mt-1`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {date && <span className="text-xs text-gray-500">{date}</span>}
        </div>
        {description && <p className="text-xs text-gray-500 mt-1 truncate">{description}</p>}
        {status && (
          <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${status === 'completed' || status === 'active' ? 'bg-green-100 text-green-800' :
              status === 'cancelled' || status === 'deleted' || status === 'inactive' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'}`}
          >
            {status}
          </span>
        )}
      </div>
      {linkTo && <FiEye className="h-5 w-5 text-gray-400 ml-2 hover:text-indigo-600"/>}
    </div>
  );
  return linkTo ? <Link href={linkTo}>{itemContent}</Link> : itemContent;
};


export default function UserDetailsPage({ params }) {
  const { userId } = params;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setError('User not found');
          toast.error('User not found');
          setIsLoading(false);
          router.push('/admin/users');
          return;
        }

        const userData = { uid: userDoc.id, ...userDoc.data() };
        setUser(userData);
        reset({
          displayName: userData.displayName || '',
          email: userData.email || '',
          userType: userData.userType || 'buyer',
          profileCompleted: userData.profileCompleted || false,
          disabled: userData.disabled || false,
          bio: userData.bio || '',
          location: userData.location || '',
          website: userData.website || '',
        });

        // Fetch Orders
        const buyerOrdersQuery = query(collection(db, 'orders'), where('buyerId', '==', userId), orderBy('createdAt', 'desc'), limit(5));
        const sellerOrdersQuery = query(collection(db, 'orders'), where('sellerId', '==', userId), orderBy('createdAt', 'desc'), limit(5));

        const [buyerOrdersSnapshot, sellerOrdersSnapshot] = await Promise.all([
          getDocs(buyerOrdersQuery),
          getDocs(sellerOrdersQuery)
        ]);

        const buyerOrdersData = buyerOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Purchased' }));
        const sellerOrdersData = sellerOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Sold' }));
        setOrders([...buyerOrdersData, ...sellerOrdersData].sort((a,b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0) ).slice(0,10) );


        // Fetch Gigs if user is a seller
        if (userData.userType === 'seller') {
          const gigsQuery = query(collection(db, 'gigs'), where('sellerId', '==', userId), orderBy('createdAt', 'desc'), limit(5));
          const gigsSnapshot = await getDocs(gigsQuery);
          setGigs(gigsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Failed to fetch user data. ' + err.message);
        toast.error('Failed to fetch user data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, reset, router]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        displayName: data.displayName,
        // email: data.email, // Email update should be handled via Firebase Auth for security
        userType: data.userType,
        profileCompleted: data.profileCompleted,
        disabled: data.disabled,
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        updatedAt: serverTimestamp()
      };
      await updateDoc(userRef, updateData);
      setUser(prevUser => ({ ...prevUser, ...updateData, email: data.email })); // Keep local email in sync
      toast.success('User profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!user) return;
    const newDisabledStatus = !user.disabled;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        disabled: newDisabledStatus,
        updatedAt: serverTimestamp()
      });
      setUser(prevUser => ({ ...prevUser, disabled: newDisabledStatus }));
      setValue('disabled', newDisabledStatus); // Update form value
      toast.success(`User ${newDisabledStatus ? 'disabled' : 'enabled'} successfully.`);
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error('Failed to update user status: ' + error.message);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => router.push('/admin/users')}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Users List
        </button>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="container mx-auto p-4">
            <p>User not found.</p>
            <button
                onClick={() => router.push('/admin/users')}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
            >
                <FiArrowLeft className="mr-2" /> Back to Users List
            </button>
        </div>
    );
  }

  const totalOrdersAsBuyer = orders.filter(o => o.type === 'Purchased').length;
  const totalOrdersAsSeller = orders.filter(o => o.type === 'Sold').length;

  return (
    <div className="container mx-auto p-4 space-y-6" style={{maxWidth:"95%",margin:"auto",marginTop:"2%"}}>
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
        <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
            isEditing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
        >
            {isEditing ? <FiX className="mr-2" /> : <FiEdit className="mr-2" />}
            {isEditing ? 'Cancel Edit' : 'Edit User'}
        </button>
      </div>

      {/* User Info and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
          {user.profileImage ? (
            <Image src={user.profileImage} alt={user.displayName || 'User'} width={128} height={128} className="rounded-full mx-auto mb-4" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <FiUser className="h-16 w-16 text-indigo-600" />
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-800">{user.displayName || 'N/A'}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className={`mt-2 px-3 py-1 inline-block text-xs font-semibold rounded-full ${
            user.userType === 'seller' ? 'bg-green-100 text-green-800' :
            user.userType === 'buyer' ? 'bg-blue-100 text-blue-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {user.userType?.toUpperCase()}
          </p>
          <div className="mt-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                user.disabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
                {user.disabled ? 'Disabled' : 'Active'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-3">Joined: {formatDate(user.createdAt)}</p>
           <button
            onClick={handleToggleUserStatus}
            title={user.disabled ? 'Enable User Account' : 'Disable User Account'}
            className={`mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              user.disabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              user.disabled ? 'focus:ring-green-500' : 'focus:ring-red-500'
            }`}
          >
            {user.disabled ? <FiToggleRight className="mr-2 h-5 w-5" /> : <FiToggleLeft className="mr-2 h-5 w-5" />}
            {user.disabled ? 'Enable User' : 'Disable User'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SummaryCard icon={FiShoppingBag} title="Orders as Buyer" value={totalOrdersAsBuyer} bgColor="bg-blue-50" textColor="text-blue-700" link={`/admin/orders?buyerId=${userId}`} />
          <SummaryCard icon={FiBriefcase} title="Orders as Seller" value={totalOrdersAsSeller} bgColor="bg-green-50" textColor="text-green-700" link={`/admin/orders?sellerId=${userId}`} />
          <SummaryCard icon={FiGrid} title="Services/Gigs" value={gigs.length} bgColor="bg-yellow-50" textColor="text-yellow-700" link={`/admin/services?sellerId=${userId}`} />
          <SummaryCard icon={FiDollarSign} title="Total Spent (Approx)" value="$TODO" bgColor="bg-red-50" textColor="text-red-700" />
          <SummaryCard icon={FiDollarSign} title="Total Earned (Approx)" value="$TODO" bgColor="bg-teal-50" textColor="text-teal-700" />
           <SummaryCard icon={FiCheck} title="Profile Complete" value={user.profileCompleted ? 'Yes' : 'No'} bgColor={user.profileCompleted ? 'bg-green-50' : 'bg-red-50'} textColor={user.profileCompleted ? 'text-green-700' : 'text-red-700'} />
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
              <input type="text" id="displayName" {...register('displayName', { required: 'Display name is required' })}
                className={`mt-1 block w-full px-3 py-2 border ${errors.displayName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
              {errors.displayName && <p className="text-xs text-red-500 mt-1">{errors.displayName.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Cannot be changed here)</label>
              <input type="email" id="email" {...register('email')} readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">User Type</label>
              <select id="userType" {...register('userType')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
             <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea id="bio" {...register('bio')} rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
            </div>
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" id="location" {...register('location')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                <input type="url" id="website" {...register('website')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
                <input id="profileCompleted" type="checkbox" {...register('profileCompleted')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <label htmlFor="profileCompleted" className="ml-2 block text-sm text-gray-900">Profile Completed</label>
            </div>
            <div className="flex items-center">
                <input id="disabled" type="checkbox" {...register('disabled')}
                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                <label htmlFor="disabled" className="ml-2 block text-sm text-gray-900">Account Disabled</label>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : <><FiSave className="inline mr-2" /> Save Changes</>}
            </button>
          </div>
        </form>
      )}

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity (Last 10)</h3>
        {orders.length > 0 || (user.userType === 'seller' && gigs.length > 0) ? (
          <div className="divide-y divide-gray-100">
            {orders.map(order => (
              <ActivityItem
                key={`order-${order.id}`}
                icon={order.type === 'Purchased' ? FiShoppingBag : FiBriefcase}
                title={`${order.type}: ${order.gigTitle || 'Order for Gig ID ' + order.gigId.substring(0,6)}`}
                description={`Order ID: ${order.id.substring(0,8)}... | Price: $${order.gigPrice}`}
                date={formatDate(order.createdAt)}
                status={order.status}
                color={order.type === 'Purchased' ? 'text-blue-600' : 'text-green-600'}
                linkTo={`/admin/orders/${order.id}`}
              />
            ))}
            {user.userType === 'seller' && gigs.map(gig => (
              <ActivityItem
                key={`gig-${gig.id}`}
                icon={FiGrid}
                title={`Gig: ${gig.title}`}
                description={`Category: ${gig.category} | Price: $${gig.price}`}
                date={formatDate(gig.createdAt)}
                status={gig.status}
                color="text-yellow-600"
                linkTo={`/admin/services/${gig.id}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recent activity found for this user.</p>
        )}
      </div>
    </div>
  );
}