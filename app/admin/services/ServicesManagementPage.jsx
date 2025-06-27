// app/admin/services/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/firebase/config'; // Ensure this path is correct
import { collection, getDocs, query, orderBy, where, limit, startAfter, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FiSearch, FiFilter, FiEye, FiAlertCircle, FiGrid, FiCheckSquare, FiXSquare, FiDollarSign, FiTag, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Gig Status Badge Component
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

// Gig Row Component
const GigRow = ({ gig, onViewDetails, onToggleStatus }) => {
  const createdAt = gig.createdAt?.toDate ?
    new Date(gig.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
    'Unknown';

  const isActionable = gig.status !== 'deleted'; // Can't modify 'deleted' gigs directly here

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <Link href={`/admin/services/${gig.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
          {gig.id.substring(0, 8)}...
        </Link>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 truncate" style={{maxWidth: '250px'}} title={gig.title}>
            {gig.title || 'N/A'}
        </div>
        <div className="text-xs text-gray-500">
            Category: {gig.category || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{gig.sellerName || gig.sellerId?.substring(0,10)+'...'}</div>
        {gig.sellerId &&
            <Link href={`/admin/users/${gig.sellerId}`} className="text-xs text-indigo-500 hover:underline">View Seller</Link>
        }
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${gig.price?.toFixed(2) || '0.00'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <GigStatusBadge status={gig.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {createdAt}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center space-x-2">
            <button
                onClick={() => onViewDetails(gig.id)}
                className="text-indigo-600 hover:text-indigo-900"
                title="View gig details"
            >
                <FiEye className="h-5 w-5" />
            </button>
            {isActionable && gig.status !== 'active' && (
                <button
                    onClick={() => onToggleStatus(gig.id, 'active')}
                    className="text-green-600 hover:text-green-900"
                    title="Approve/Activate Gig"
                >
                    <FiCheckSquare className="h-5 w-5" />
                </button>
            )}
            {isActionable && gig.status === 'active' && (
                 <button
                    onClick={() => onToggleStatus(gig.id, 'paused')}
                    className="text-orange-600 hover:text-orange-900"
                    title="Pause Gig"
                >
                    <FiAlertCircle className="h-5 w-5" />
                </button>
            )}
            {isActionable && gig.status !== 'rejected' && (
                <button
                    onClick={() => onToggleStatus(gig.id, 'rejected')}
                    className="text-red-600 hover:text-red-900"
                    title="Reject Gig"
                >
                    <FiXSquare className="h-5 w-5" />
                </button>
            )}
        </div>
      </td>
    </tr>
  );
};

export default function ServicesManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [filteredGigs, setFilteredGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [hasMoreGigs, setHasMoreGigs] = useState(true);
  const ITEMS_PER_PAGE = 15;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [sellerIdFilter, setSellerIdFilter] = useState(searchParams.get('sellerId') || ''); // For linking from user page

  // Define categories (you might want to fetch this dynamically or have a more robust list)
  const gigCategories = ['Graphics & Design', 'Digital Marketing', 'Writing & Translation', 'Video & Animation', 'Music & Audio', 'Programming & Tech', 'Business', 'Lifestyle', 'AI Services'];


  const fetchGigs = useCallback(async (loadMore = false) => {
    setIsLoading(true);
    setError(null);

    try {
      let q = query(collection(db, 'gigs'), orderBy('createdAt', 'desc'));

      if (statusFilter !== 'all') {
        q = query(q, where('status', '==', statusFilter));
      }
      if (categoryFilter !== 'all') {
        q = query(q, where('category', '==', categoryFilter));
      }
      if (sellerIdFilter) {
        q = query(q, where('sellerId', '==', sellerIdFilter));
      }
      // Note: Firestore requires an index for compound queries with range/inequality filters on different fields.
      // If you add more complex filtering (e.g., price range), ensure your Firestore indexes are set up.

      if (loadMore && lastVisibleDoc) {
        q = query(q, startAfter(lastVisibleDoc), limit(ITEMS_PER_PAGE));
      } else {
        q = query(q, limit(ITEMS_PER_PAGE));
      }

      const querySnapshot = await getDocs(q);
      const fetchedGigs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        // You might want to fetch sellerName here if not already on the gig document
      }));

      setLastVisibleDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMoreGigs(fetchedGigs.length === ITEMS_PER_PAGE);

      if (loadMore) {
        setGigs(prevGigs => [...prevGigs, ...fetchedGigs]);
        setFilteredGigs(prevGigs => [...prevGigs, ...fetchedGigs]);
      } else {
        setGigs(fetchedGigs);
        setFilteredGigs(fetchedGigs);
      }

    } catch (err) {
      console.error('Error fetching gigs:', err);
      setError('Failed to load services. ' + err.message);
      toast.error('Could not load services.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter, sellerIdFilter, lastVisibleDoc]); // Added sellerIdFilter and lastVisibleDoc

  useEffect(() => {
    fetchGigs();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, sellerIdFilter]); // Removed fetchGigs from dependency array to avoid re-triggering on its own change

  // Client-side search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGigs(gigs);
      return;
    }
    const lowercasedSearch = searchTerm.toLowerCase();
    const results = gigs.filter(gig =>
      gig.id.toLowerCase().includes(lowercasedSearch) ||
      (gig.title && gig.title.toLowerCase().includes(lowercasedSearch)) ||
      (gig.sellerName && gig.sellerName.toLowerCase().includes(lowercasedSearch)) ||
      (gig.sellerId && gig.sellerId.toLowerCase().includes(lowercasedSearch)) ||
      (gig.category && gig.category.toLowerCase().includes(lowercasedSearch))
    );
    setFilteredGigs(results);
  }, [gigs, searchTerm]);

  const handleLoadMore = () => {
    if (hasMoreGigs && !isLoading) {
      fetchGigs(true);
    }
  };

  const handleViewDetails = (gigId) => {
    router.push(`/admin/services/${gigId}`);
  };

  const handleToggleGigStatus = async (gigId, newStatus) => {
    const gigToUpdate = gigs.find(g => g.id === gigId);
    if (!gigToUpdate) {
        toast.error("Gig not found for status update.");
        return;
    }

    const originalStatus = gigToUpdate.status;
    // Optimistically update UI
    const updateGigInState = (id, status) => {
        const updater = (prev) => prev.map(g => g.id === id ? { ...g, status: status } : g);
        setGigs(updater);
        setFilteredGigs(updater);
    };
    updateGigInState(gigId, newStatus);


    try {
        const gigRef = doc(db, 'gigs', gigId);
        await updateDoc(gigRef, {
            status: newStatus,
            updatedAt: serverTimestamp(),
            // Optionally, add a field for who changed the status or a reason
            // lastAdminAction: { statusChange: newStatus, adminId: 'currentAdminId', timestamp: serverTimestamp() }
        });
        toast.success(`Gig status successfully updated to ${newStatus.replace('_', ' ')}.`);
    } catch (error) {
        console.error(`Error updating gig ${gigId} status to ${newStatus}:`, error);
        toast.error(`Failed to update gig status. ${error.message}`);
        // Rollback optimistic update
        updateGigInState(gigId, originalStatus);
    }
  };
  
  const handleFilterChange = () => {
      setLastVisibleDoc(null); // Reset pagination
      setGigs([]); // Clear current gigs
      setFilteredGigs([]);
      // The useEffect for statusFilter, categoryFilter, etc., will trigger fetchGigs
  };

  // This useEffect handles re-fetching when filters change.
  useEffect(handleFilterChange, [statusFilter, categoryFilter, sellerIdFilter]);


  return (
    <div className="space-y-6" style={{maxWidth:"95%",margin:"auto",marginTop:"2%"}}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center"><FiGrid className="mr-3 h-7 w-7 text-indigo-600"/>Services (Gigs) Management</h1>
        {/* <Link href="/admin/services/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
            <FiPlusCircle className="h-4 w-4" /> Add New Service
        </Link> */}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <FiAlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
          <button
            onClick={() => fetchGigs()} // Re-fetch initial set
            className="mt-2 bg-red-100 text-red-800 px-3 py-1 rounded-md text-xs font-medium hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ID, Title, Seller, Category..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="paused">Paused</option>
              <option value="rejected">Rejected</option>
              <option value="deleted">Deleted</option>
              {/* Add other statuses as needed */}
            </select>
          </div>
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {gigCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
           <div>
            <input
                type="text"
                placeholder="Filter by Seller ID"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={sellerIdFilter}
                onChange={(e) => setSellerIdFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Gigs Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {isLoading && filteredGigs.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : !isLoading && filteredGigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <FiGrid className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No services found.</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters, or add new services.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gig ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text--500 uppercase tracking-wider">Created</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGigs.map(gig => (
                    <GigRow
                      key={gig.id}
                      gig={gig}
                      onViewDetails={handleViewDetails}
                      onToggleStatus={handleToggleGigStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {hasMoreGigs && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load More Services'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
