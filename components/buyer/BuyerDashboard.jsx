'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getBuyerOrders, getAllGigs } from '@/firebase/firestore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import OrderItem from '@/components/orders/OrderItem';
import GigCard from '@/components/marketplace/GigCard';
import { FiArrowRight, FiPackage, FiClock, FiCheck, FiX, FiTrendingUp, FiStar, FiShoppingBag } from 'react-icons/fi';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendedServices, setRecommendedServices] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch orders
        const orders = await getBuyerOrders(user.uid);
        
        // Calculate stats
        const activeOrdersCount = orders.filter(order => 
          ['pending', 'in_progress', 'revision'].includes(order.status)
        ).length;
        
        const completedOrdersCount = orders.filter(order => 
          order.status === 'completed'
        ).length;
        
        const cancelledOrdersCount = orders.filter(order => 
          order.status === 'cancelled'
        ).length;
        
        setStats({
          activeOrders: activeOrdersCount,
          completedOrders: completedOrdersCount,
          cancelledOrders: cancelledOrdersCount,
        });
        
        // Get recent orders
        const sortedOrders = [...orders].sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        
        setRecentOrders(sortedOrders.slice(0, 3));
        
        // Fetch recommended services (just using all gigs for now)
        const { gigs } = await getAllGigs(null, 6);
        setRecommendedServices(gigs);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-primary-600 to-purple-600 p-6 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-10 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -mb-10 -ml-10"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white">Welcome back, {user?.displayName || 'there'}!</h2>
          <p className="mt-2 text-indigo-100">Track your orders and discover services tailored for you.</p>
          <Button 
            href="/marketplace"
            variant='outline'
            className="mt-4 bg-white text-black  hover:bg-indigo-50 border-0 shadow-md hover:shadow-lg transition-all"
          >
            <FiShoppingBag className="mr-2" /> Browse Marketplace
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-3 mr-4 shadow-md">
            <FiClock className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Orders</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{stats.activeOrders}</h3>
          </div>
        </Card>
        
        <Card className="flex items-center p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="rounded-full bg-gradient-to-r from-green-500 to-green-600 p-3 mr-4 shadow-md">
            <FiCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed Orders</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">{stats.completedOrders}</h3>
          </div>
        </Card>
        
        <Card className="flex items-center p-6 border-l-4 border-amber-500 hover:shadow-md transition-shadow">
          <div className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 p-3 mr-4 shadow-md">
            <FiX className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Cancelled Orders</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">{stats.cancelledOrders}</h3>
          </div>
        </Card>
      </div>
      
      {/* Recent Orders */}
      <Card className="shadow-md overflow-hidden border border-gray-100 hover:border-primary-100 transition-colors">
        <div className="bg-gradient-to-r from-indigo-50 to-primary-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <span className="w-1.5 h-6 bg-primary-600 rounded-full mr-2"></span>
            Recent Orders
          </h3>
          <Link 
            href="/buyer/orders" 
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center bg-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all"
          >
            View All <FiArrowRight className="ml-1" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.length > 0 ? (
            recentOrders.map(order => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                <OrderItem order={order} userType="buyer" />
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-gradient-to-r from-gray-50 to-indigo-50">
              <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <FiPackage className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
              <Button 
                href="/marketplace" 
                className="mt-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-black shadow-md hover:shadow-lg border-0 transition-all"
              >
                Browse Services
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {/* Recommended Services */}
      <Card className="shadow-md overflow-hidden border border-gray-100 hover:border-primary-100 transition-colors">
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <span className="w-1.5 h-6 bg-purple-600 rounded-full mr-2"></span>
            Recommended For You
          </h3>
          <Link 
            href="/marketplace" 
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center bg-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all"
          >
            View All <FiArrowRight className="ml-1" />
          </Link>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-white to-indigo-50/30">
          {recommendedServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedServices.slice(0, 3).map(gig => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <FiStar className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-gray-600 mb-4">We're finding the perfect services for you.</p>
              <Button 
                href="/marketplace" 
                className="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg border-0 transition-all"
              >
                Explore Marketplace
              </Button>
            </div>
          )}
        </div>
        
        {/* Additional Highlights Section */}
        {recommendedServices.length > 0 && (
          <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50 p-4">
            <div className="flex flex-wrap justify-around gap-4 text-center">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-2 mr-2">
                  <FiTrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Trending Services</span>
              </div>
              <div className="flex items-center">
                <div className="rounded-full bg-amber-100 p-2 mr-2">
                  <FiStar className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm text-gray-700">Top Rated Sellers</span>
              </div>
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2 mr-2">
                  <FiPackage className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Express Delivery</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BuyerDashboard;