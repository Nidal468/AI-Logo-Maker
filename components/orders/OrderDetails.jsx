'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { format, addDays, isValid } from 'date-fns';
import { updateOrderStatus } from '@/firebase/firestore';
import { toast } from 'react-toastify';
import { FiMessageSquare, FiCalendar, FiDollarSign, FiClock, FiAlertCircle, FiInfo, FiClipboard, FiUser, FiPackage } from 'react-icons/fi'; // Added more icons
import OrderStatusBadge from './OrderStatusBadge'; // Assuming path
import OrderProgress from './OrderProgress'; // Assuming path
import Button from '@/components/common/Button'; // Assuming path
import Card from '@/components/common/Card'; // Assuming path (optional, styling can be inline)
import Modal from '@/components/common/Modal'; // Assuming path
import Textarea from '@/components/common/Textarea'; // Assuming path
import Loading from '@/components/common/Loading'; // Assuming path

const OrderDetails = ({ order }) => {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [actionModal, setActionModal] = useState({ open: false, action: '', title: '' });
  const [actionReason, setActionReason] = useState('');
  const [componentError, setComponentError] = useState('');
  const router = useRouter();

  const isSeller = userProfile?.userType === 'seller';
  const isBuyer = userProfile?.userType === 'buyer';

  // --- Utility Functions ---
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    let date;
    try {
      if (timestamp?.seconds) { date = new Date(timestamp.seconds * 1000); }
      else if (timestamp?.toDate) { date = timestamp.toDate(); }
      else if (typeof timestamp === 'number') { date = new Date(timestamp); }
      else if (typeof timestamp === 'string') { date = new Date(timestamp); }
      else if (timestamp instanceof Date) { date = timestamp; }
      else { return 'Invalid Format'; }
      if (!isValid(date)) { return 'Invalid Date'; }
      return format(date, 'MMM d, yyyy'); // Shorter format e.g., Apr 22, 2025
    } catch (error) { console.error("formatDate error:", error); return 'Date Error'; }
  };

  const calculateDueDate = () => {
    const createdAtTimestamp = order?.createdAt;
    const deliveryTimeDays = order?.deliveryTime;
    if (!createdAtTimestamp || deliveryTimeDays === undefined || deliveryTimeDays === null) return 'N/A';
    let createdDate;
    try {
      if (createdAtTimestamp?.seconds) { createdDate = new Date(createdAtTimestamp.seconds * 1000); }
      else if (createdAtTimestamp?.toDate) { createdDate = createdAtTimestamp.toDate(); }
      else if (typeof createdAtTimestamp === 'number') { createdDate = new Date(createdAtTimestamp); }
      else if (typeof createdAtTimestamp === 'string') { createdDate = new Date(createdAtTimestamp); }
      else if (createdAtTimestamp instanceof Date) { createdDate = createdAtTimestamp; }
      else { return 'Invalid Start'; }
      if (!isValid(createdDate)) { return 'Invalid Start'; }
      const due = addDays(createdDate, parseInt(deliveryTimeDays, 10) || 0);
      if (!isValid(due)) { return 'Calc Error'; }
      return format(due, 'MMM d, yyyy'); // Shorter format
    } catch (error) { console.error("calculateDueDate error:", error); return 'Date Error'; }
  };

  // --- Handlers ---
  const handleAction = (action, title) => {
    setComponentError(''); setActionModal({ open: true, action, title }); setActionReason('');
  };

  const handleSubmitAction = async () => {
    if ((actionModal.action === 'revision' || actionModal.action === 'cancelled') && !actionReason.trim()) {
        toast.warn(actionModal.action === 'revision' ? 'Please provide revision details.' : 'Reason is required for cancellation.'); return;
    }
    setIsLoading(true); setComponentError('');
    try {
      await updateOrderStatus(order.id, actionModal.action, actionReason.trim());
      const actionMessages = { 'in_progress': 'Order accepted.', 'delivered': 'Order marked as delivered.', 'completed': 'Order completed.', 'revision': 'Revision request submitted.', 'cancelled': 'Order cancelled.' };
      toast.success(actionMessages[actionModal.action] || 'Order status updated.');
      setActionModal({ open: false, action: '', title: '' });
      router.refresh();
    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMsg = `Failed to update status: ${error.message || 'Please try again.'}`;
      toast.error(errorMsg); setComponentError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI Logic ---
  const getStatusText = () => {
    switch (order?.status) {
      case 'pending': return isSeller ? 'Awaiting acceptance' : 'Waiting for seller';
      case 'in_progress': return isSeller ? 'Work in progress' : 'Seller is working';
      case 'delivered': return isSeller ? 'Awaiting buyer review' : 'Delivered - Please review';
      case 'completed': return 'Order completed';
      case 'cancelled': return 'Order cancelled';
      case 'revision': return isSeller ? 'Revisions requested' : 'Revision requested';
      default: return 'Unknown status';
    }
  };

  const getAvailableActions = () => {
     if (!order?.status || order.status === 'cancelled' || order.status === 'completed') return [];
     if (isSeller) {
       switch (order.status) {
         case 'pending': return [ { action: 'in_progress', label: 'Accept Order', variant: 'primary' }, { action: 'cancelled', label: 'Decline', variant: 'danger' } ];
         case 'in_progress': case 'revision': return [ { action: 'delivered', label: 'Deliver Now', variant: 'primary' } ];
         default: return [];
       }
     }
     if (isBuyer) {
       switch (order.status) {
         case 'pending': return [ { action: 'cancelled', label: 'Cancel Order', variant: 'danger' } ];
         case 'delivered': return [ { action: 'completed', label: 'Accept Delivery', variant: 'primary' }, { action: 'revision', label: 'Request Revision', variant: 'outline' } ];
         default: return [];
       }
     }
     return [];
  };

  // --- Render Logic ---
  if (!order || !order.id) {
      return ( <div className="container mx-auto p-6 text-center"> <FiAlertCircle className="w-10 h-10 mx-auto text-red-500 mb-3" /> <p>Order details could not be loaded.</p> </div> );
  }

  const counterParty = isSeller ? { name: order.buyerName, image: order.buyerImage, id: order.buyerId } : { name: order.sellerName, image: order.sellerImage, id: order.sellerId };
  const counterPartyRole = isSeller ? 'Buyer' : 'Seller';
  const counterPartyProfileLink = isSeller ? `/buyer/${counterParty.id}` : `/seller/${counterParty.id}`; // Adjust link structure as needed

  return (
    <div className="space-y-6 max-w-4xl mx-auto"> {/* Centered and max-width */}
      {componentError && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" /> <span>{componentError}</span>
          </div>
        )}
  
      {/* Using inline styling instead of Card component for more control */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/80">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200">
            {/* Gig Info */}
            <div className="flex items-center gap-4 flex-grow min-w-0">
                <div className="relative w-16 h-12 rounded-md overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
                    {order.gigImage ? ( <Image src={order.gigImage} alt="Service Image" fill className="object-cover" sizes="64px" onError={(e) => e.target.style.display='none'} /> ) : ( <div className="w-full h-full flex items-center justify-center"><FiPackage className="w-6 h-6 text-slate-400" /></div> )}
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Service</p>
                    <h3 className="text-lg font-semibold text-slate-800 line-clamp-2 leading-tight">{order.gigTitle || 'Service Title Missing'}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Order ID: <span className="font-mono">{order.id.slice(0, 8)}...</span></p>
                </div>
            </div>
            {/* Status */}
            <div className="flex-shrink-0 pt-1 sm:pt-0">
                <OrderStatusBadge status={order.status} />
            </div>
        </div>

        {/* Progress & Status Text */}
        <div className="py-5">
            <p className="text-sm text-center font-medium text-slate-600 mb-3">{getStatusText()}</p>
            <OrderProgress status={order.status} />
        </div>

        {/* Details Grid - Enhanced Styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-slate-200">
          {/* Counterparty Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 border">
                  {counterParty.image ? ( <Image src={counterParty.image} alt={counterPartyRole} fill className="object-cover" sizes="40px" onError={(e) => e.target.style.display='none'} /> ) : ( <FiUser className="w-5 h-5 text-slate-400 m-auto" /> )}
              </div>
              <div className="min-w-0">
                  <p className="text-xs text-slate-500">{counterPartyRole}</p>
                  {/* Consider linking to user profile if available */}
                  {/* <Link href={counterPartyProfileLink} className="text-sm font-semibold text-slate-700 hover:text-primary-600 truncate block">{counterParty.name || 'N/A'}</Link> */}
                   <p className="text-sm font-semibold text-slate-700 truncate">{counterParty.name || 'N/A'}</p>
              </div>
          </div>
          {/* Price */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0"> <FiDollarSign className="w-5 h-5" /> </div>
              <div className="min-w-0">
                  <p className="text-xs text-slate-500">Total Price</p>
                  <p className="text-sm font-semibold text-slate-700">${order.gigPrice?.toFixed(2) || 'N/A'}</p>
              </div>
          </div>
           {/* Order Date */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex-shrink-0"> <FiCalendar className="w-5 h-5" /> </div>
              <div className="min-w-0">
                  <p className="text-xs text-slate-500">Order Placed</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDate(order.createdAt)}</p>
              </div>
          </div>
          {/* Due Date */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex-shrink-0"> <FiClock className="w-5 h-5" /> </div>
              <div className="min-w-0">
                  <p className="text-xs text-slate-500">Delivery Due</p>
                  <p className="text-sm font-semibold text-slate-700">{calculateDueDate()}</p>
              </div>
          </div>
        </div>

        {/* Action Buttons Area */}
        {getAvailableActions().length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row flex-wrap gap-3 justify-end items-center">
            {/* Optional: Add a link/button to the main chat page */}
             <Button
                href={isSeller ? `/seller/messages?contact=${order.buyerId}` : `/buyer/messages?contact=${order.sellerId}`}
                variant="ghost"
                size="sm"
                className="mr-auto text-primary-600 hover:text-primary-700" // Position chat button to the left
             >
                <FiMessageSquare className="mr-1.5 h-4 w-4"/> View Conversation
             </Button>

            {getAvailableActions().map((actionDef) => (
              <Button
                key={actionDef.action}
                variant={actionDef.variant}
                onClick={() => handleAction(actionDef.action, actionDef.label)}
                size="md" // Consistent button size
              >
                {actionDef.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => !isLoading && setActionModal({ open: false, action: '', title: '' })}
        title={actionModal.title}
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 space-y-2 sm:space-y-0">
            <Button variant="outline" onClick={() => setActionModal({ open: false, action: '', title: '' })} disabled={isLoading} className="w-full sm:w-auto"> Cancel </Button>
            <Button onClick={handleSubmitAction} isLoading={isLoading} disabled={isLoading || ( (actionModal.action === 'revision' || actionModal.action === 'cancelled') && !actionReason.trim() )} variant={actionModal.action === 'cancelled' ? 'danger' : 'primary'} className="w-full sm:w-auto"> Confirm </Button>
          </div>
        }
      >
        <div className="space-y-4 p-1">
          {(actionModal.action === 'revision' || actionModal.action === 'cancelled') && (
            <div>
              <label htmlFor="actionReason" className="block text-sm font-medium text-slate-700 mb-1">
                {actionModal.action === 'revision' ? 'Revision details*' : 'Reason for cancellation*'}
              </label>
              <Textarea
                id="actionReason" rows={4} value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={actionModal.action === 'revision' ? 'Please provide clear details...' : 'Optional: Provide a reason...'}
                required={actionModal.action === 'revision' || actionModal.action === 'cancelled'}
                error={ (actionModal.action === 'revision' || actionModal.action === 'cancelled') && !actionReason.trim() ? 'Reason is required' : ''}
                textareaClassName="text-sm" // Slightly smaller text in textarea
              />
            </div>
          )}
          {/* Confirmation Text */}
          <p className="text-sm text-slate-600">
            {actionModal.action === 'in_progress' && `Accepting means you agree to deliver by ${calculateDueDate()}.`}
            {actionModal.action === 'delivered' && `This will notify the buyer to review your delivery.`}
            {actionModal.action === 'completed' && `This will mark the order as completed.`}
            {actionModal.action === 'cancelled' && `Are you sure you want to cancel this order? ${actionReason.trim() ? '' : 'Please provide a reason.'}`}
            {actionModal.action === 'revision' && `Submit these revision requests? ${!actionReason.trim() ? 'Please describe the revisions needed.' : ''}`}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;
