'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSellerOrders, getGigsBySellerId } from '@/firebase/firestore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import OrderItem from '@/components/orders/OrderItem';
import GigCard from '@/components/marketplace/GigCard';
import { 
  FiArrowRight, 
  FiShoppingBag, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiDollarSign, 
  FiTrendingUp, 
  FiBarChart2,
  FiPlusCircle,
  FiRefreshCw,
  FiAward,
  FiStar
} from 'react-icons/fi';

const SellerDashboard = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalEarnings: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try { 
        setLoading(true);
        
        // Fetch orders
        const orders = await getSellerOrders(user.uid);
        
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
        
        const earnings = orders
          .filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + (order.gigPrice || 0), 0);
        
        setStats({
          activeOrders: activeOrdersCount,
          completedOrders: completedOrdersCount,
          cancelledOrders: cancelledOrdersCount,
          totalEarnings: earnings,
        });
        
        // Get recent orders
        const sortedOrders = [...orders].sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        
        setRecentOrders(sortedOrders.slice(0, 3));
        
        // Fetch gigs
        const gigs = await getGigsBySellerId(user.uid);
        setServices(gigs);
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 p-6 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-10 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -mb-10 -ml-10"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <FiAward className="h-6 w-6 text-yellow-300 mr-2" />
            <h2 className="text-xl font-bold text-black">Seller Dashboard</h2>
          </div>
          <p className="text-indigo-400 mb-4">Welcome back, {userProfile?.displayName || user?.displayName || 'there'}! Manage your services and orders.</p>
          <div className="flex flex-wrap gap-3 mt-3">
            <Button 
              variant="outline"
              href="/seller/gigs/create"
              className="bg-white text-primary-700 hover:bg-indigo-50 border-0 shadow-md hover:shadow-lg flex items-center transition-all"
            >
              <FiPlusCircle className="mr-2" /> Create Service
            </Button>
            <Button 
              href="#s"
              variant="outline"
              className="bg-transparent text-black border-white hover:bg-white/10 flex items-center transition-all"
            >
              <FiBarChart2 className="mr-2" /> View Performance
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Overview with enhanced styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-3 mr-4 shadow-md text-white">
            <FiShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Orders</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{stats.activeOrders}</h3>
          </div>
        </Card>
        
        <Card className="flex items-center p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="rounded-full bg-gradient-to-br from-green-500 to-green-600 p-3 mr-4 shadow-md text-white">
            <FiCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed Orders</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">{stats.completedOrders}</h3>
          </div>
        </Card>
        
        <Card className="flex items-center p-6 border-l-4 border-amber-500 hover:shadow-md transition-shadow">
          <div className="rounded-full bg-gradient-to-br from-amber-500 to-amber-600 p-3 mr-4 shadow-md text-white">
            <FiX className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Cancelled Orders</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">{stats.cancelledOrders}</h3>
          </div>
        </Card>
        
        <Card className="flex items-center p-6 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div className="rounded-full bg-gradient-to-br from-purple-500 to-purple-600 p-3 mr-4 shadow-md text-white">
            <FiDollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">${stats.totalEarnings}</h3>
          </div>
        </Card>
      </div>
      
      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="shadow-md overflow-hidden border border-gray-100 hover:border-primary-100 transition-colors h-full">
            <div className="bg-gradient-to-r from-indigo-50 to-primary-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <span className="w-1.5 h-6 bg-primary-600 rounded-full mr-2"></span>
                Recent Orders
              </h3>
              <Link 
                href="/seller/orders" 
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center bg-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all"
              >
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <OrderItem order={order} userType="seller" />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-gradient-to-r from-gray-50 to-indigo-50 h-full">
                  <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <FiShoppingBag className="h-8 w-8 text-primary-600" />
                  </div>
                  <p className="text-gray-600 mb-4">No orders yet. Create attractive services to get started!</p>
                  <Button 
                    href="/seller/gigs/create" 
                    className="mt-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md hover:shadow-lg border-0 transition-all"
                  >
                    Create New Service
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Performance Overview */}
        <div className="lg:col-span-1">
          <Card className="shadow-md overflow-hidden border border-gray-100 hover:border-primary-100 transition-colors h-full">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <span className="w-1.5 h-6 bg-purple-600 rounded-full mr-2"></span>
                Performance
              </h3>
            </div>
            <div className="p-6 bg-white">
              <div className="space-y-4">
                {/* Completion Rate */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                    <span className="text-sm font-semibold text-purple-700">
                      {stats.completedOrders + stats.cancelledOrders > 0 
                        ? Math.round((stats.completedOrders / (stats.completedOrders + stats.cancelledOrders)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.completedOrders + stats.cancelledOrders > 0 
                          ? Math.round((stats.completedOrders / (stats.completedOrders + stats.cancelledOrders)) * 100)
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Rating */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Average Rating</span>
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar key={star} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Response Time */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Avg. Response Time</span>
                    <span className="text-sm font-semibold text-indigo-700">2 hours</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link 
                  href="#" 
                  className="flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 text-primary-700 rounded-lg border border-indigo-100 hover:shadow-md transition-all"
                >
                  <FiTrendingUp className="mr-2" /> View Detailed Analytics
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Your Services */}
      <Card className="shadow-md overflow-hidden border border-gray-100 hover:border-primary-100 transition-colors">
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <span className="w-1.5 h-6 bg-purple-600 rounded-full mr-2"></span>
            Your Services
          </h3>
          <div className="flex space-x-2">
            <Link 
              href="/seller/gigs" 
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center bg-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all"
            >
              View All <FiArrowRight className="ml-1" />
            </Link>
            <Link 
              href="/seller/gigs/create" 
              className="text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 flex items-center px-3 py-1 rounded-full shadow-sm hover:shadow transition-all"
            >
              <FiPlusCircle className="mr-1" /> New
            </Link>
          </div>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-white to-indigo-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length > 0 ? (
              services.slice(0, 3).map(gig => (
                <GigCard key={gig.id} gig={gig} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <div className="mx-auto w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <FiShoppingBag className="h-10 w-10 text-primary-600" />
                </div>
                <p className="text-gray-700 text-lg font-medium mb-2">No services yet</p>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Create your first service to start selling your skills to clients worldwide.</p>
                <Button 
                  href="/seller/gigs/create"
                  className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl border-0 transition-all"
                >
                  <FiPlusCircle className="mr-2" /> Create Your First Service
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Tips Section */}
        {services.length > 0 && (
          <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50 p-4">
            <div className="flex flex-wrap justify-around gap-4 text-center">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-2 mr-2">
                  <FiRefreshCw className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Update services regularly</span>
              </div>
              <div className="flex items-center">
                <div className="rounded-full bg-amber-100 p-2 mr-2">
                  <FiClock className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm text-gray-700">Respond quickly to inquiries</span>
              </div>
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2 mr-2">
                  <FiStar className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Deliver high quality work</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SellerDashboard;