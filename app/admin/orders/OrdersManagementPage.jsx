// app/admin/orders/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/firebase/config';
import { collection, getDocs, query, orderBy, where, limit, startAfter, Timestamp } from 'firebase/firestore';
import { 
  FiSearch, FiFilter, FiEye, FiAlertCircle, FiShoppingBag, 
  FiArrowRight, FiCalendar, FiUser, FiBriefcase, FiDownload, 
  FiRefreshCw, FiChevronDown, FiSliders, FiX, FiPlus, FiBook,
  FiCheckCircle,
  FiClock,
  FiXCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
  let colorClasses = '';
  
  switch(status) {
    case 'pending':
      colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200';
      break;
    case 'processing':
    case 'in progress':
      colorClasses = 'bg-sky-50 text-sky-700 border border-sky-200';
      break;
    case 'completed':
    case 'delivered':
      colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      break;
    case 'cancelled':
    case 'rejected':
      colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200';
      break;
    case 'revision':
      colorClasses = 'bg-orange-50 text-orange-700 border border-orange-200';
      break;
    default:
      colorClasses = 'bg-gray-50 text-gray-700 border border-gray-200';
  }

  return (
    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>
      {status}
    </span>
  );
};

// Order Row Component
const OrderRow = ({ order, onViewDetails }) => {
  const createdAt = order.createdAt?.toDate ?
    new Date(order.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
    'Unknown';

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4">
        <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center group">
          <span className="text-xs bg-indigo-50 text-indigo-700 py-1 px-2 rounded-md font-mono">#{order.id.substring(0, 8)}</span>
          <FiArrowRight className="h-3.5 w-3.5 ml-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 h-9 w-9 bg-indigo-100 rounded-md flex items-center justify-center text-indigo-600">
            <FiShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={order.gigTitle}>
              {order.gigTitle || 'Untitled Service'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Gig: <Link href={`/admin/services/${order.gigId}`} className="text-indigo-500 hover:underline">{order.gigId?.substring(0,6)}...</Link>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-7 w-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-medium mr-2">
            {(order.buyerName?.[0] || 'B').toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium">{order.buyerName || 'Unknown Buyer'}</div>
            <Link href={`/admin/users/${order.buyerId}`} className="text-xs text-indigo-500 hover:underline">
              View Profile
            </Link>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-7 w-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-medium mr-2">
            {(order.sellerName?.[0] || 'S').toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium">{order.sellerName || 'Unknown Seller'}</div>
            <Link href={`/admin/users/${order.sellerId}`} className="text-xs text-indigo-500 hover:underline">
              View Profile
            </Link>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-gray-900">${order.gigPrice?.toFixed(2) || '0.00'}</div>
      </td>
      <td className="px-6 py-4">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <FiCalendar className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
          {createdAt}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-3 justify-end">
          <button
            onClick={() => onViewDetails(order.id)}
            className="text-indigo-600 hover:text-indigo-900 p-1.5 hover:bg-indigo-50 rounded-full transition-colors"
            title="View order details"
          >
            <FiEye className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Filter Badge Component
const FilterBadge = ({ label, onClear }) => (
  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 mr-2">
    {label}
    <button onClick={onClear} className="ml-1.5 text-indigo-500 hover:text-indigo-700 focus:outline-none">
      <FiX className="h-3.5 w-3.5" />
    </button>
  </div>
);

export default function OrdersManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 15;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [dateFilter, setDateFilter] = useState(''); // e.g., 'today', 'last7days', 'last30days'
  const [buyerIdFilter, setBuyerIdFilter] = useState(searchParams.get('buyerId') || '');
  const [sellerIdFilter, setSellerIdFilter] = useState(searchParams.get('sellerId') || '');
  const [showFilters, setShowFilters] = useState(false);
  
  const fetchOrders = useCallback(async (loadMore = false) => {
    setIsLoading(true);
    setError(null);

    try {
      let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

      if (statusFilter !== 'all') {
        q = query(q, where('status', '==', statusFilter));
      }
      if (buyerIdFilter) {
        q = query(q, where('buyerId', '==', buyerIdFilter));
      }
      if (sellerIdFilter) {
        q = query(q, where('sellerId', '==', sellerIdFilter));
      }

      if (dateFilter) {
        const now = new Date();
        let startDate;
        if (dateFilter === 'today') {
            startDate = new Date(now.setHours(0,0,0,0));
        } else if (dateFilter === 'last7days') {
            startDate = new Date(now.setDate(now.getDate() - 7));
            startDate.setHours(0,0,0,0);
        } else if (dateFilter === 'last30days') {
            startDate = new Date(now.setDate(now.getDate() - 30));
            startDate.setHours(0,0,0,0);
        }
        if(startDate) {
            q = query(q, where('createdAt', '>=', Timestamp.fromDate(startDate)));
        }
      }


      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible), limit(ITEMS_PER_PAGE));
      } else {
        q = query(q, limit(ITEMS_PER_PAGE));
      }

      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(fetchedOrders.length === ITEMS_PER_PAGE);

      if (loadMore) {
        setOrders(prevOrders => [...prevOrders, ...fetchedOrders]);
        setFilteredOrders(prevOrders => [...prevOrders, ...fetchedOrders]);
      } else {
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      }

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. ' + err.message);
      toast.error('Could not load orders.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, dateFilter, lastVisible, buyerIdFilter, sellerIdFilter]);


  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateFilter, buyerIdFilter, sellerIdFilter]); 

  // Client-side search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
      return;
    }
    const lowercasedSearch = searchTerm.toLowerCase();
    const results = orders.filter(order =>
      order.id.toLowerCase().includes(lowercasedSearch) ||
      (order.gigTitle && order.gigTitle.toLowerCase().includes(lowercasedSearch)) ||
      (order.buyerName && order.buyerName.toLowerCase().includes(lowercasedSearch)) ||
      (order.sellerName && order.sellerName.toLowerCase().includes(lowercasedSearch))
    );
    setFilteredOrders(results);
  }, [orders, searchTerm]);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchOrders(true);
    }
  };

  const handleViewDetails = (orderId) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleFilterChange = () => {
      setLastVisible(null); // Reset pagination
      setOrders([]); // Clear current orders
      setFilteredOrders([]);
      // The useEffect for statusFilter, dateFilter, etc., will trigger fetchOrders
  };

  const handleFilterClear = (filterType) => {
    switch(filterType) {
      case 'status':
        setStatusFilter('all');
        break;
      case 'date':
        setDateFilter('');
        break;
      case 'buyer':
        setBuyerIdFilter('');
        break;
      case 'seller':
        setSellerIdFilter('');
        break;
      case 'all':
        setStatusFilter('all');
        setDateFilter('');
        setBuyerIdFilter('');
        setSellerIdFilter('');
        setSearchTerm('');
        break;
    }
  };

  useEffect(handleFilterChange, [statusFilter, dateFilter, buyerIdFilter, sellerIdFilter]);

  const activeFiltersCount = [
    statusFilter !== 'all' ? 1 : 0,
    dateFilter ? 1 : 0,
    buyerIdFilter ? 1 : 0,
    sellerIdFilter ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiShoppingBag className="mr-3 h-6 w-6 text-indigo-600"/>
            Order Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all orders across the platform</p>
        </div>
        
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors">
            <FiDownload className="h-4 w-4 mr-2" />
            Export
          </button>
          <Link href="/admin/orders/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors">
            <FiPlus className="h-4 w-4 mr-2" />
            New Order
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center">
            <FiAlertCircle className="h-5 w-5 text-rose-500 mr-3" />
            <h3 className="text-sm font-medium text-rose-800">{error}</h3>
          </div>
          <button
            onClick={() => fetchOrders()}
            className="mt-2 bg-rose-100 text-rose-800 px-3 py-1 rounded-md text-xs font-medium hover:bg-rose-200 transition-colors"
          >
            <FiRefreshCw className="inline-block mr-1 h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {/* Search and Filters Row */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders by ID, title, buyer or seller name..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2.5 border ${showFilters ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-gray-300 bg-white text-gray-700'} rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none transition-colors`}
            >
              <FiSliders className="h-4 w-4 mr-2" />
              Filters {activeFiltersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold">
                  {activeFiltersCount}
                </span>
              )}
              <FiChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center">
              <span className="text-sm text-gray-500 mr-2">Active filters:</span>
              {statusFilter !== 'all' && (
                <FilterBadge 
                  label={`Status: ${statusFilter}`} 
                  onClear={() => handleFilterClear('status')} 
                />
              )}
              {dateFilter && (
                <FilterBadge 
                  label={`Date: ${dateFilter === 'today' ? 'Today' : dateFilter === 'last7days' ? 'Last 7 days' : 'Last 30 days'}`} 
                  onClear={() => handleFilterClear('date')} 
                />
              )}
              {buyerIdFilter && (
                <FilterBadge 
                  label={`Buyer: ${buyerIdFilter.substring(0, 8)}...`} 
                  onClear={() => handleFilterClear('buyer')} 
                />
              )}
              {sellerIdFilter && (
                <FilterBadge 
                  label={`Seller: ${sellerIdFilter.substring(0, 8)}...`} 
                  onClear={() => handleFilterClear('seller')} 
                />
              )}
              
              {activeFiltersCount > 1 && (
                <button 
                  onClick={() => handleFilterClear('all')}
                  className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 border-b border-gray-100 bg-gray-50/30 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Order Status</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="in progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="revision">Revision</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Date Range</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Buyer ID</label>
              <input
                type="text"
                placeholder="Enter Buyer ID"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={buyerIdFilter}
                onChange={(e) => setBuyerIdFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Seller ID</label>
              <input
                type="text"
                placeholder="Enter Seller ID"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={sellerIdFilter}
                onChange={(e) => setSellerIdFilter(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading && filteredOrders.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : !isLoading && filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <FiShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-gray-700 text-lg font-medium">No orders found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button 
              onClick={() => handleFilterClear('all')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gig Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredOrders.map(order => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-700 mr-2"></div>
                      Loading more orders...
                    </>
                  ) : (
                    <>
                      Load More Orders
                      <FiChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Order Summary Statistics Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Order Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-indigo-700 font-medium">Total Orders</h4>
              <div className="bg-indigo-100 p-2 rounded-md">
                <FiBook className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-indigo-900">{orders.length || '0'}</p>
            <p className="text-sm text-indigo-600 mt-1">
              {orders.length > 0 ? 'Showing filtered results' : 'No orders match your filters'}
            </p>
          </div>
          
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-emerald-700 font-medium">Completed</h4>
              <div className="bg-emerald-100 p-2 rounded-md">
                <FiCheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-900">
              {orders.filter(order => order.status === 'completed' || order.status === 'delivered').length}
            </p>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-amber-700 font-medium">Pending</h4>
              <div className="bg-amber-100 p-2 rounded-md">
                <FiClock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-900">
              {orders.filter(order => order.status === 'pending' || order.status === 'processing' || order.status === 'in progress').length}
            </p>
          </div>
          
          <div className="bg-rose-50 rounded-lg p-4 border border-rose-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-rose-700 font-medium">Cancelled</h4>
              <div className="bg-rose-100 p-2 rounded-md">
                <FiXCircle className="h-5 w-5 text-rose-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-rose-900">
              {orders.filter(order => order.status === 'cancelled' || order.status === 'rejected').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}