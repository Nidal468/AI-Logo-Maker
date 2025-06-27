'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSellerOrders } from '@/firebase/firestore';
import OrderItem from '@/components/orders/OrderItem';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';

export default function SellerOrdersPage() {
  const { user, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const fetchedOrders = await getSellerOrders(user.uid);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return ['pending', 'in_progress', 'revision'].includes(order.status);
    }
    if (activeTab === 'delivered') {
      return order.status === 'delivered';
    }
    if (activeTab === 'completed') {
      return order.status === 'completed';
    }
    if (activeTab === 'cancelled') {
      return order.status === 'cancelled';
    }
    return true;
  });
  
  // Sort orders by creation date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB - dateA;
  });
  
  // Count orders by status
  const orderCounts = {
    all: orders.length,
    active: orders.filter(order => ['pending', 'in_progress', 'revision'].includes(order.status)).length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    completed: orders.filter(order => order.status === 'completed').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length,
  };
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
        <p className="text-gray-600 mt-1">
          View and manage orders from your buyers.
        </p>
      </div>
      
      <Card className="mb-6">
        <div className="border-b overflow-x-auto">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Orders
              <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2.5 rounded-full text-xs">
                {orderCounts.all}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('active')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active
              <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2.5 rounded-full text-xs">
                {orderCounts.active}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('delivered')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'delivered'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Delivered
              <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2.5 rounded-full text-xs">
                {orderCounts.delivered}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('completed')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed
              <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2.5 rounded-full text-xs">
                {orderCounts.completed}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cancelled'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cancelled
              <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2.5 rounded-full text-xs">
                {orderCounts.cancelled}
              </span>
            </button>
          </nav>
        </div>
      </Card>
      
      <div className="space-y-4">
        {sortedOrders.length > 0 ? (
          sortedOrders.map(order => (
            <OrderItem key={order.id} order={order} userType="seller" />
          ))
        ) : (
          <Card>
            <div className="py-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {activeTab === 'all'
                  ? 'You don\'t have any orders yet.'
                  : `You don't have any ${activeTab} orders.`}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}