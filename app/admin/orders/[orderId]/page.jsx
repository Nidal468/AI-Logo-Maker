'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiArrowLeft, FiEdit, FiSave, FiUser, FiShoppingBag, FiCalendar, FiDollarSign,
  FiCheckCircle, FiXCircle, FiClock, FiMessageSquare, FiPaperclip, FiTruck, FiRepeat, 
  FiAlertCircle, FiInfo, FiBriefcase, FiExternalLink, FiChevronRight, FiSend, FiEye,
  FiTarget, FiLink, FiClipboard, FiPhoneCall, FiMail, FiCornerUpRight, FiMoreHorizontal
} from 'react-icons/fi';

// Helper to format dates
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

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
  let colorClasses = '';
  let Icon = FiClock;

  switch(status) {
    case 'pending':
      colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200';
      Icon = FiClock;
      break;
    case 'processing':
    case 'in progress':
      colorClasses = 'bg-sky-50 text-sky-700 border border-sky-200';
      Icon = FiTruck;
      break;
    case 'completed':
    case 'delivered':
      colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      Icon = FiCheckCircle;
      break;
    case 'cancelled':
    case 'rejected':
      colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200';
      Icon = FiXCircle;
      break;
    case 'revision':
      colorClasses = 'bg-orange-50 text-orange-700 border border-orange-200';
      Icon = FiRepeat;
      break;
    default:
      colorClasses = 'bg-gray-50 text-gray-700 border border-gray-200';
  }

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${colorClasses}`}>
      <Icon className="mr-1.5 h-4 w-4" />
      <span className="text-sm font-medium capitalize">{status}</span>
    </div>
  );
};

// Detail Item component
const DetailItem = ({ label, value, icon: Icon, isLink = false, href = '#', copyable = false }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-medium text-gray-500 flex items-center mb-1">
        {Icon && <Icon className="h-4 w-4 text-gray-400 mr-2" />}
        {label}
      </dt>
      <dd className="text-sm text-gray-900 mt-1 flex items-center">
        {isLink ? (
          <Link href={href} className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center">
            {value}
            <FiExternalLink className="ml-1 h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="mr-2">{value}</span>
        )}
        {copyable && (
          <button 
            onClick={handleCopy} 
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <FiCheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <FiClipboard className="h-4 w-4" />
            )}
          </button>
        )}
      </dd>
    </div>
  );
};

// Timeline Entry Component
const TimelineEntry = ({ title, description, date, status = null, icon: Icon = FiClock }) => {
  let statusColor = '';
  switch(status) {
    case 'completed':
    case 'delivered':
      statusColor = 'text-emerald-600 bg-emerald-100';
      break;
    case 'pending':
      statusColor = 'text-amber-600 bg-amber-100';
      break;
    case 'cancelled':
    case 'rejected':
      statusColor = 'text-rose-600 bg-rose-100';
      break;
    default:
      statusColor = 'text-gray-600 bg-gray-100';
  }
  
  return (
    <div className="flex mb-6 last:mb-0">
      <div className={`flex-shrink-0 h-9 w-9 rounded-full ${statusColor} flex items-center justify-center mr-3`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        {date && <p className="mt-1 text-xs text-gray-400">{date}</p>}
      </div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ icon: Icon, label, onClick, variant = 'primary', disabled = false }) => {
  const baseClasses = "flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  let variantClasses = "";
  
  switch(variant) {
    case 'primary':
      variantClasses = "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500";
      break;
    case 'secondary':
      variantClasses = "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-indigo-500";
      break;
    case 'success':
      variantClasses = "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500";
      break;
    case 'danger':
      variantClasses = "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500";
      break;
    default:
      variantClasses = "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500";
  }
  
  if (disabled) {
    variantClasses = "bg-gray-300 text-gray-500 cursor-not-allowed";
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
    >
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {label}
    </button>
  );
};

export default function OrderDetailsPage({ params }) {
  const { orderId } = params;
  const router = useRouter();
  const { user: adminUser } = useAuth();

  const [order, setOrder] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [seller, setSeller] = useState(null);
  const [gig, setGig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdateMessage, setStatusUpdateMessage] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchOrderData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orderDocRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderDocRef);

      if (!orderDoc.exists()) {
        setError('Order not found.');
        toast.error('Order not found.');
        setIsLoading(false);
        router.push('/admin/orders');
        return;
      }
      
      const orderData = { id: orderDoc.id, ...orderDoc.data() };
      setOrder(orderData);
      setNewStatus(orderData.status);

      // Fetch Buyer, Seller, and Gig details
      const [buyerDoc, sellerDoc, gigDoc] = await Promise.all([
        getDoc(doc(db, 'users', orderData.buyerId)),
        getDoc(doc(db, 'users', orderData.sellerId)),
        getDoc(doc(db, 'gigs', orderData.gigId)),
      ]);

      if (buyerDoc.exists()) setBuyer({ id: buyerDoc.id, ...buyerDoc.data() });
      if (sellerDoc.exists()) setSeller({ id: sellerDoc.id, ...sellerDoc.data() });
      if (gigDoc.exists()) setGig({ id: gigDoc.id, ...gigDoc.data() });

    } catch (err) {
      console.error("Error fetching order details:", err);
      setError('Failed to fetch order details. ' + err.message);
      toast.error('Failed to fetch order details.');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId, fetchOrderData]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus || newStatus === order.status) {
      toast.info("Please select a new status or the status is unchanged.");
      return;
    }
    
    setIsUpdatingStatus(true);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        statusMessage: statusUpdateMessage || `Status updated to ${newStatus} by admin.`,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      setOrder(prevOrder => ({ 
        ...prevOrder, 
        status: newStatus, 
        statusMessage: statusUpdateMessage || `Status updated to ${newStatus} by admin.`,
        updatedAt: new Date() // Temporary date until we refetch
      }));
      
      toast.success(`Order status updated to ${newStatus}.`);
      setStatusUpdateMessage('');
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error('Failed to update order status: ' + error.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const generateOrderTimeline = (order) => {
    if (!order) return [];
    
    const timeline = [
      {
        title: "Order Created",
        description: `Order placed for ${order.gigTitle || "service"}`,
        date: formatDate(order.createdAt, true),
        icon: FiShoppingBag,
        status: "completed"
      }
    ];
    
    if (order.status === 'pending' || ['processing', 'in progress', 'delivered', 'completed', 'revision'].includes(order.status)) {
      timeline.push({
        title: "Order Processing",
        description: "Seller has received the order",
        date: formatDate(order.updatedAt || order.createdAt, true),
        icon: FiTruck,
        status: "completed"
      });
    }
    
    if (['in progress', 'delivered', 'completed', 'revision'].includes(order.status)) {
      timeline.push({
        title: "Work In Progress",
        description: "Seller is working on the order",
        date: formatDate(order.updatedAt, true),
        icon: FiTarget,
        status: "completed"
      });
    }
    
    if (['delivered', 'completed', 'revision'].includes(order.status)) {
      timeline.push({
        title: "Order Delivered",
        description: "Seller has delivered the order",
        date: formatDate(order.updatedAt, true),
        icon: FiTruck,
        status: "completed"
      });
    }
    
    if (order.status === 'completed') {
      timeline.push({
        title: "Order Completed",
        description: "Buyer has accepted the delivery",
        date: formatDate(order.updatedAt, true),
        icon: FiCheckCircle,
        status: "completed"
      });
    }
    
    if (order.status === 'revision') {
      timeline.push({
        title: "Revision Requested",
        description: order.statusMessage || "Buyer has requested revisions",
        date: formatDate(order.updatedAt, true),
        icon: FiRepeat,
        status: "pending"
      });
    }
    
    if (['cancelled', 'rejected'].includes(order.status)) {
      timeline.push({
        title: `Order ${order.status === 'cancelled' ? 'Cancelled' : 'Rejected'}`,
        description: order.statusMessage || `The order has been ${order.status}`,
        date: formatDate(order.updatedAt, true),
        icon: FiXCircle,
        status: "cancelled"
      });
    }
    
    return timeline;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl mb-6" role="alert">
          <div className="flex items-center mb-1">
            <FiAlertCircle className="h-5 w-5 mr-2 text-rose-500" />
            <strong className="font-bold text-rose-700">Error:</strong>
          </div>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => router.push('/admin/orders')}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return <p className="text-center p-10">Order data could not be loaded.</p>;
  }

  const orderStatusOptions = ['pending', 'processing', 'in progress', 'delivered', 'completed', 'revision', 'cancelled', 'rejected'];
  const timeline = generateOrderTimeline(order);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header with navigation and status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-800 mb-2 inline-flex items-center text-sm font-medium"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiShoppingBag className="mr-3 h-6 w-6 text-indigo-600"/> 
            Order Details
          </h1>
          <div className="flex items-center mt-1.5">
            <span className="text-xs bg-indigo-50 text-indigo-700 py-1 px-2 rounded-md font-mono mr-3">
              #{order.id.substring(0,8)}...
            </span>
            <button 
              onClick={() => navigator.clipboard.writeText(order.id)}
              className="text-gray-500 hover:text-indigo-600 p-1"
              title="Copy Order ID"
            >
              <FiClipboard className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:items-end space-y-2">
          <OrderStatusBadge status={order.status} />
          <p className="text-xs text-gray-500">Last Updated: {formatDate(order.updatedAt, true)}</p>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timeline' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('communication')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'communication' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Communication
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Info */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h2>
            
            <dl className="divide-y divide-gray-100">
              <DetailItem 
                label="Service" 
                value={order.gigTitle || gig?.title || 'N/A'} 
                icon={FiShoppingBag} 
                isLink={!!gig} 
                href={gig ? `/admin/services/${gig.id}` : '#'} 
              />
              <DetailItem 
                label="Buyer" 
                value={buyer?.displayName || order.buyerName || order.buyerId} 
                icon={FiUser} 
                isLink={!!buyer} 
                href={buyer ? `/admin/users/${buyer.id}` : '#'} 
              />
              <DetailItem 
                label="Seller" 
                value={seller?.displayName || order.sellerName || order.sellerId} 
                icon={FiBriefcase} 
                isLink={!!seller} 
                href={seller ? `/admin/users/${seller.id}` : '#'} 
              />
              <DetailItem 
                label="Order Date" 
                value={formatDate(order.createdAt, true)} 
                icon={FiCalendar} 
              />
              <DetailItem 
                label="Price" 
                value={`$${order.gigPrice?.toFixed(2) || '0.00'}`} 
                icon={FiDollarSign} 
              />
              {order.deliveryDate && (
                <DetailItem 
                  label="Expected Delivery" 
                  value={formatDate(order.deliveryDate)} 
                  icon={FiTruck} 
                />
              )}
              {order.statusMessage && (
                <DetailItem 
                  label="Status Note" 
                  value={order.statusMessage} 
                  icon={FiInfo} 
                />
              )}
              {order.requirements && (
                <div className="py-3 border-b border-gray-100 last:border-0">
                  <dt className="text-sm font-medium text-gray-500 flex items-center mb-1.5">
                    <FiPaperclip className="h-4 w-4 text-gray-400 mr-2" />
                    Buyer Requirements
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap border border-gray-100">
                    {order.requirements}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Status Update & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Status</h3>
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div>
                  <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select
                    id="newStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                  >
                    {orderStatusOptions.map(statusOpt => (
                      <option key={statusOpt} value={statusOpt}>
                        {statusOpt.charAt(0).toUpperCase() + statusOpt.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="statusUpdateMessage" className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                  <textarea
                    id="statusUpdateMessage"
                    rows="3"
                    value={statusUpdateMessage}
                    onChange={(e) => setStatusUpdateMessage(e.target.value)}
                    className="block w-full shadow-sm sm:text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Reason for status change or message to parties involved..."
                  />
                </div>
                <ActionButton
                  icon={FiSave}
                  label={isUpdatingStatus ? "Updating..." : "Update Status"}
                  disabled={isUpdatingStatus || newStatus === order.status}
                  variant="primary"
                  onClick={handleStatusUpdate}
                />
              </form>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/admin/messages?conversationUserId=${order.buyerId}&secondUserId=${order.sellerId}&orderId=${order.id}`}
                  className="flex items-center justify-center w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <FiMessageSquare className="mr-2 h-4 w-4" /> View Conversation
                </Link>
                
                <ActionButton
                  icon={FiMail}
                  label="Contact Buyer"
                  variant="secondary"
                  onClick={() => window.location.href = `mailto:${buyer?.email || ''}`}
                />
                
                <ActionButton
                  icon={FiPhoneCall}
                  label="Contact Seller"
                  variant="secondary"
                  onClick={() => window.location.href = `mailto:${seller?.email || ''}`}
                />
                
                {order.status !== 'cancelled' && (
                  <ActionButton
                    icon={FiXCircle}
                    label="Cancel Order"
                    variant="danger"
                    onClick={() => {
                      setNewStatus('cancelled');
                      setStatusUpdateMessage('Order cancelled by admin.');
                      // You could auto-submit here or let admin confirm
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Timeline</h2>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <TimelineEntry
                  key={index}
                  title={item.title}
                  description={item.description}
                  date={item.date}
                  status={item.status}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Timeline Note</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    rows="3"
                    className="block w-full shadow-sm sm:text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add a note to the order timeline..."
                  />
                </div>
                <ActionButton
                  icon={FiCornerUpRight}
                  label="Add Note"
                  variant="primary"
                  onClick={() => {
                    // Add note logic here
                    toast.info("Note functionality to be implemented");
                  }}
                />
              </form>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'communication' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Communication</h2>
            <div className="flex flex-col items-center justify-center py-10 px-6 bg-gray-50 rounded-lg border border-gray-100">
              <FiMessageSquare className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-gray-700 font-medium text-lg">No messages yet</h3>
              <p className="text-gray-500 text-center mt-1 max-w-md">
                When buyer and seller communicate, their messages will appear here.
              </p>
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiEye className="mr-2 h-4 w-4" />
                Go to Message Center
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {buyer && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="h-9 w-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-medium mr-3">
                      {(buyer.displayName?.[0] || 'B').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">{buyer.displayName || 'Unnamed Buyer'}</h4>
                      <p className="text-xs text-gray-500 truncate">{buyer.email}</p>
                    </div>
                    <Link 
                      href={`/admin/users/${buyer.id}`}
                      className="text-indigo-600 hover:text-indigo-900 p-1.5 hover:bg-indigo-50 rounded-full transition-colors"
                    >
                      <FiExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                )}
                
                {seller && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-medium mr-3">
                      {(seller.displayName?.[0] || 'S').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">{seller.displayName || 'Unnamed Seller'}</h4>
                      <p className="text-xs text-gray-500 truncate">{seller.email}</p>
                    </div>
                    <Link 
                      href={`/admin/users/${seller.id}`}
                      className="text-indigo-600 hover:text-indigo-900 p-1.5 hover:bg-indigo-50 rounded-full transition-colors"
                    >
                      <FiExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Related Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gig && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-800">Service Details</h4>
              <Link 
                href={`/admin/services/${gig.id}`} 
                className="text-indigo-600 hover:text-indigo-800"
                title="View full service details"
              >
                <FiExternalLink className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center mb-2.5">
                <div className="h-8 w-8 bg-indigo-100 rounded-md flex items-center justify-center text-indigo-600 mr-3">
                  <FiShoppingBag className="h-4 w-4" />
                </div>
                <h5 className="text-gray-900 font-medium leading-tight">{gig.title}</h5>
              </div>
              {gig.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{gig.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm font-medium">{gig.category || 'Uncategorized'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-sm font-medium">${gig.price?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            
            <Link 
              href={`/admin/services/${gig.id}`}
              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center mt-1"
            >
              View Complete Service Details <FiChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        )}
        
        {buyer && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-800">Buyer Profile</h4>
              <Link 
                href={`/admin/users/${buyer.id}`} 
                className="text-indigo-600 hover:text-indigo-800"
                title="View full buyer profile"
              >
                <FiExternalLink className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
              <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-medium mr-3">
                {(buyer.displayName?.[0] || 'B').toUpperCase()}
              </div>
              <div>
                <h5 className="text-gray-900 font-medium">{buyer.displayName || 'Unnamed Buyer'}</h5>
                <p className="text-xs text-gray-500">{buyer.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-medium">{buyer.createdAt ? formatDate(buyer.createdAt) : 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Orders</p>
                <p className="text-sm font-medium">{buyer.orderCount || '0'}</p>
              </div>
            </div>
            
            <Link 
              href={`/admin/users/${buyer.id}`}
              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center mt-1"
            >
              View Full Buyer Profile <FiChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        )}
        
        {seller && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-800">Seller Profile</h4>
              <Link 
                href={`/admin/users/${seller.id}`} 
                className="text-indigo-600 hover:text-indigo-800"
                title="View full seller profile"
              >
                <FiExternalLink className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
              <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-medium mr-3">
                {(seller.displayName?.[0] || 'S').toUpperCase()}
              </div>
              <div>
                <h5 className="text-gray-900 font-medium">{seller.displayName || 'Unnamed Seller'}</h5>
                <p className="text-xs text-gray-500">{seller.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-medium">{seller.createdAt ? formatDate(seller.createdAt) : 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Services</p>
                <p className="text-sm font-medium">{seller.gigCount || '0'}</p>
              </div>
            </div>
            
            <Link 
              href={`/admin/users/${seller.id}`}
              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center mt-1"
            >
              View Full Seller Profile <FiChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
      
      {/* Actions Panel */}
      <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-indigo-900">Need more options?</h3>
            <p className="text-sm text-indigo-700">Access additional order management tools and actions</p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none transition-colors">
              <FiMoreHorizontal className="h-4 w-4 mr-2" />
              More Options
            </button>
            <Link 
              href="/admin/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}