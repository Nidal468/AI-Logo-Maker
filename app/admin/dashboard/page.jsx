// app/admin/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/firebase/config';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { 
  FiUsers, FiShoppingBag, FiGrid, FiDollarSign, FiTrendingUp, 
  FiCalendar, FiAlertCircle, FiArrowRight, FiActivity, FiBarChart2,
  FiExternalLink, FiClock
} from 'react-icons/fi';

// Dashboard Stats Card Component
const StatCard = ({ title, value, icon: Icon, change, changeType, linkTo }) => {
  return (
    <Link href={linkTo || '#'} className="block group transition-all">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group-hover:border-indigo-100 h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-gradient-to-br from-indigo-100/30 to-transparent rounded-full"></div>
        
        <div className="flex justify-between items-start">
          <div className="z-10">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-3xl font-bold mt-2 text-gray-800">{value}</h3>
            
            {change && (
              <div className={`flex items-center mt-3 text-xs font-medium ${
                changeType === 'increase' ? 'text-emerald-600' : 
                changeType === 'decrease' ? 'text-rose-600' : 'text-amber-600'
              }`}>
                <FiTrendingUp className={`h-3 w-3 mr-1 ${
                  changeType === 'decrease' ? 'transform rotate-180' : ''
                }`} />
                <span>{change} from last period</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        <div className="mt-6 pt-3 border-t border-gray-50 flex items-center text-xs text-indigo-600 font-medium group-hover:text-indigo-700 transition-colors">
          <span>View details</span>
          <FiArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

// Recent Activity Item Component
const ActivityItem = ({ type, title, time, status }) => {
  let statusColor;
  let statusBg;
  let Icon;
  
  switch (status) {
    case 'completed':
      statusColor = 'text-emerald-700';
      statusBg = 'bg-emerald-50';
      break;
    case 'pending':
      statusColor = 'text-amber-700';
      statusBg = 'bg-amber-50';
      break;
    case 'cancelled':
      statusColor = 'text-rose-700';
      statusBg = 'bg-rose-50';
      break;
    default:
      statusColor = 'text-gray-700';
      statusBg = 'bg-gray-50';
  }
  
  switch (type) {
    case 'order':
      Icon = FiShoppingBag;
      break;
    case 'user':
      Icon = FiUsers;
      break;
    case 'service':
      Icon = FiGrid;
      break;
    default:
      Icon = FiCalendar;
  }
  
  return (
    <div className="flex items-center py-3.5 group hover:bg-gray-50 rounded-lg transition-colors px-2 -mx-2 cursor-pointer">
      <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 mr-4 group-hover:bg-indigo-100 transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <div className="flex items-center mt-0.5">
          <FiClock className="text-gray-400 h-3 w-3 mr-1" />
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>
      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor} ${statusBg}`}>
        {status}
      </div>
    </div>
  );
};

// User Card Component
const UserCard = ({ user, formatDate }) => {
  const initial = user.displayName?.charAt(0) || user.email?.charAt(0) || 'U';
  const colors = ['bg-indigo-100 text-indigo-800', 'bg-emerald-100 text-emerald-800', 
                  'bg-sky-100 text-sky-800', 'bg-amber-100 text-amber-800', 
                  'bg-violet-100 text-violet-800'];
  const colorIndex = user.id.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];
  
  return (
    <div className="py-3.5 flex items-center hover:bg-gray-50 rounded-lg transition-colors px-2 -mx-2 cursor-pointer group">
      <div className={`h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center font-medium mr-3 group-hover:shadow-sm transition-shadow`}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.displayName || 'Unnamed User'}
        </p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>
      <div className="flex items-center text-xs text-gray-500">
        <FiClock className="h-3 w-3 mr-1" />
        {formatDate(user.createdAt)}
      </div>
    </div>
  );
};

// Summary Stat Component
const SummaryStat = ({ title, value, description, color, icon: Icon }) => {
  return (
    <div className={`p-5 rounded-xl ${color.bg} border ${color.border}`}>
      <div className="flex items-center mb-2">
        <div className={`mr-2 ${color.iconBg} p-1.5 rounded-md`}>
          <Icon className={`h-5 w-5 ${color.icon}`} />
        </div>
        <h3 className={`font-medium ${color.title}`}>{title}</h3>
      </div>
      <p className={`text-xl font-semibold ${color.value}`}>{value}</p>
      <p className={`text-sm mt-1 ${color.description}`}>{description}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    usersCount: '...',
    ordersCount: '...',
    servicesCount: '...',
    revenue: '...',
    recentUsers: [],
    recentOrders: [],
    userGrowth: '...',
    orderGrowth: '...',
    isLoading: true,
    error: null
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get total users count
        const usersQuery = collection(db, 'users');
        const usersSnapshot = await getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;
        
        // Get recent users
        const recentUsersQuery = query(
          collection(db, 'users'), 
          orderBy('createdAt', 'desc'), 
          limit(5)
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const recentUsers = recentUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        // Get total orders count
        const ordersQuery = collection(db, 'orders');
        const ordersSnapshot = await getDocs(ordersQuery);
        const totalOrders = ordersSnapshot.size;
        
        // Get recent orders
        const recentOrdersQuery = query(
          collection(db, 'orders'), 
          orderBy('createdAt', 'desc'), 
          limit(5)
        );
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
        const recentOrders = recentOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        // Get total gigs/services count
        const gigsQuery = collection(db, 'gigs');
        const gigsSnapshot = await getDocs(gigsQuery);
        const totalGigs = gigsSnapshot.size;
        
        // Calculate total revenue
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
          const orderData = doc.data();
          if (orderData.status === 'completed' && orderData.gigPrice) {
            totalRevenue += orderData.gigPrice;
          }
        });
        
        // Calculate growth (for a real app, you'd compare with previous period)
        // This is a simple placeholder calculation
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const recentUsersQuery2 = query(
          collection(db, 'users'),
          where('createdAt', '>', Timestamp.fromDate(twoWeeksAgo))
        );
        const recentUsersSnapshot2 = await getDocs(recentUsersQuery2);
        const userGrowth = (recentUsersSnapshot2.size / totalUsers * 100).toFixed(1);
        
        const recentOrdersQuery2 = query(
          collection(db, 'orders'),
          where('createdAt', '>', Timestamp.fromDate(twoWeeksAgo))
        );
        const recentOrdersSnapshot2 = await getDocs(recentOrdersQuery2);
        const orderGrowth = (recentOrdersSnapshot2.size / totalOrders * 100).toFixed(1);
        
        setStats({
          usersCount: totalUsers,
          ordersCount: totalOrders,
          servicesCount: totalGigs,
          revenue: totalRevenue.toFixed(2),
          recentUsers,
          recentOrders,
          userGrowth,
          orderGrowth,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(prevState => ({
          ...prevState,
          isLoading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (stats.error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 my-4">
        <div className="flex items-center">
          <FiAlertCircle className="h-6 w-6 text-rose-500 mr-3" />
          <h3 className="text-lg font-medium text-rose-800">Error Loading Dashboard</h3>
        </div>
        <p className="mt-2 text-sm text-rose-700">{stats.error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-rose-100 text-rose-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div className="flex flex-col justify-between sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of platform performance and recent activity</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
            <FiBarChart2 className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
            <FiActivity className="h-4 w-4 mr-2" />
            Live View
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.isLoading ? '...' : stats.usersCount} 
          icon={FiUsers} 
          change={`${stats.userGrowth}%`}
          changeType="increase"
          linkTo="/admin/users"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.isLoading ? '...' : stats.ordersCount} 
          icon={FiShoppingBag} 
          change={`${stats.orderGrowth}%`}
          changeType="increase"
          linkTo="/admin/orders"
        />
        <StatCard 
          title="Active Services" 
          value={stats.isLoading ? '...' : stats.servicesCount} 
          icon={FiGrid} 
          linkTo="/admin/services"
        />
        <StatCard 
          title="Total Revenue" 
          value={stats.isLoading ? '...' : `$${stats.revenue}`} 
          icon={FiDollarSign}
          linkTo="/admin/finances" 
        />
      </div>
      
      {/* Recent Activity & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-medium text-gray-800">Recent Users</h2>
            <Link href="/admin/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center">
              View All
              <FiExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-6">
            {stats.isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : stats.recentUsers.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {stats.recentUsers.map(user => (
                  <UserCard key={user.id} user={user} formatDate={formatDate} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-gray-50 rounded-lg">
                <FiUsers className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="mt-2 text-gray-500 font-medium">No recent users found</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-medium text-gray-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center">
              View All
              <FiExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-6">
            {stats.isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : stats.recentOrders.length > 0 ? (
              <div className="space-y-1">
                {stats.recentOrders.map(order => (
                  <ActivityItem
                    key={order.id}
                    type="order"
                    title={order.gigTitle || `Order #${order.id.slice(0, 8)}`}
                    time={formatDate(order.createdAt)}
                    status={order.status}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-gray-50 rounded-lg">
                <FiShoppingBag className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="mt-2 text-gray-500 font-medium">No recent orders found</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Platform Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-medium text-gray-800">Platform Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryStat 
              title="User Engagement" 
              value={stats.isLoading ? 'Loading...' : `${stats.userGrowth}% growth`}
              description="New user acquisition rate"
              color={{
                bg: 'bg-blue-50',
                border: 'border-blue-100',
                title: 'text-blue-800',
                value: 'text-blue-900',
                description: 'text-blue-600',
                icon: 'text-blue-500',
                iconBg: 'bg-blue-100'
              }}
              icon={FiUsers}
            />
            
            <SummaryStat 
              title="Order Conversion" 
              value={stats.isLoading ? 'Loading...' : 
                `${(stats.ordersCount / (stats.usersCount || 1)).toFixed(1)} orders/user`}
              description="Average orders per user"
              color={{
                bg: 'bg-emerald-50',
                border: 'border-emerald-100',
                title: 'text-emerald-800',
                value: 'text-emerald-900',
                description: 'text-emerald-600',
                icon: 'text-emerald-500',
                iconBg: 'bg-emerald-100'
              }}
              icon={FiShoppingBag}
            />
            
            <SummaryStat 
              title="Revenue Growth" 
              value={stats.isLoading ? 'Loading...' : 
                `$${(stats.revenue / (stats.ordersCount || 1)).toFixed(2)}/order`}
              description="Average revenue per order"
              color={{
                bg: 'bg-violet-50',
                border: 'border-violet-100',
                title: 'text-violet-800',
                value: 'text-violet-900',
                description: 'text-violet-600',
                icon: 'text-violet-500',
                iconBg: 'bg-violet-100'
              }}
              icon={FiDollarSign}
            />
          </div>
        </div>
      </div>
      
      {/* Additional Section for Completeness */}
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm border border-indigo-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-indigo-900">Enhance Your Admin Experience</h3>
            <p className="text-indigo-700 mt-1">Upgrade to access advanced analytics and automated reports</p>
          </div>
          <div>
            <button className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm inline-flex items-center">
              <span>Explore Premium Features</span>
              <FiArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}