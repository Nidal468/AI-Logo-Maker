// app/admin/users/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/firebase/config';
import { collection, getDocs, query, orderBy, where, limit, startAfter, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FiSearch, FiFilter, FiEdit, FiEye, FiAlertCircle, FiUser, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

// User Row Component
const UserRow = ({ user, onViewDetails, onToggleStatus }) => {
  const createdAt = user.createdAt?.toDate ? 
    new Date(user.createdAt.toDate()).toLocaleDateString() : 
    'Unknown';
  
  const userTypeColor = {
    'buyer': 'bg-blue-100 text-blue-800',
    'seller': 'bg-green-100 text-green-800',
    'admin': 'bg-purple-100 text-purple-800',
  }[user.userType] || 'bg-gray-100 text-gray-800';
  
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 mr-3">
            {user.profileImage ? (
              <img src={user.profileImage} alt="" className="h-10 w-10 rounded-full" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FiUser className="h-5 w-5 text-indigo-600" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.displayName || 'Unnamed User'}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${userTypeColor}`}>
          {user.userType || 'Unknown'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {createdAt}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.profileCompleted ? 
          <span className="text-green-600 flex items-center">
            <FiCheckCircle className="h-4 w-4 mr-1" /> Complete
          </span> : 
          <span className="text-amber-600">Incomplete</span>
        }
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(user.uid)}
            className="text-indigo-600 hover:text-indigo-900"
            title="View details"
          >
            <FiEye className="h-5 w-5" />
          </button>
          <button
            onClick={() => onToggleStatus(user)}
            className={`${user.disabled ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
            title={user.disabled ? 'Enable user' : 'Disable user'}
          >
            {user.disabled ? 
              <FiCheckCircle className="h-5 w-5" /> : 
              <FiAlertCircle className="h-5 w-5" />
            }
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  
  // Fetch users from Firestore
  const fetchUsers = useCallback(async (lastDoc = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Base query
      let usersQuery;
      
      if (lastDoc) {
        usersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(20)
        );
      } else {
        usersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      }
      
      // Apply userType filter if not 'all'
      if (userTypeFilter !== 'all') {
        usersQuery = query(
          collection(db, 'users'),
          where('userType', '==', userTypeFilter),
          orderBy('createdAt', 'desc'),
          lastDoc ? startAfter(lastDoc) : limit(20)
        );
      }
      
      const querySnapshot = await getDocs(usersQuery);
      
      // Check if there are more results
      setHasMore(querySnapshot.docs.length === 20);
      
      // Set the last document for pagination
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      
      const fetchedUsers = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      
      if (lastDoc) {
        setUsers(prevUsers => [...prevUsers, ...fetchedUsers]);
      } else {
        setUsers(fetchedUsers);
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      toast.error('Could not load users');
    } finally {
      setIsLoading(false);
    }
  }, [userTypeFilter]);
  
  // Fetch users when component mounts or filters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, userTypeFilter]);
  
  // Filter users when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      return;
    }
    
    const lowercasedSearch = searchTerm.toLowerCase();
    const results = users.filter(user => 
      (user.displayName && user.displayName.toLowerCase().includes(lowercasedSearch)) ||
      (user.email && user.email.toLowerCase().includes(lowercasedSearch))
    );
    
    setFilteredUsers(results);
  }, [users, searchTerm]);
  
  // Handle loading more users
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchUsers(lastVisible);
    }
  };
  
  // Handle viewing user details
  const handleViewDetails = (userId) => {
    // Navigate to user details page
    window.location.href = `/admin/users/${userId}`;
  };
  
  // Handle toggling user status (enable/disable)
  const handleToggleStatus = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        disabled: !user.disabled,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.uid === user.uid ? { ...u, disabled: !user.disabled } : u
        )
      );
      
      toast.success(
        user.disabled ? 
        `User ${user.displayName || user.email} has been enabled` : 
        `User ${user.displayName || user.email} has been disabled`
      );
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };
  
  return (
    <div className="space-y-6" style={{maxWidth:"95%",margin:"auto",marginTop:"2%"}}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Link
          href="/admin/users/export" // You'll implement export functionality later
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
        >
          <FiArrowRight className="h-4 w-4" />
          Export Users
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <FiAlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
          <button 
            onClick={() => fetchUsers()} 
            className="mt-2 bg-red-100 text-red-800 px-3 py-1 rounded-md text-xs font-medium hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 min-w-fit">
            <FiFilter className="h-5 w-5 text-gray-400" />
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {isLoading && users.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <FiUser className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profile
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <UserRow
                      key={user.uid}
                      user={user}
                      onViewDetails={handleViewDetails}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load More Users'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}