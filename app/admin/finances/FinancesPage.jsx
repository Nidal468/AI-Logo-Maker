// app/admin/finances/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase/config'; // Ensure this path is correct
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { FiDollarSign, FiTrendingUp, FiCalendar, FiFilter, FiDownload, FiAlertCircle, FiCheckCircle, FiClock, FiList } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Link from 'next/link';

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

// Helper to format dates
const formatDate = (timestamp, includeTime = false) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleDateString('en-US', options);
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, period, isLoading }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {isLoading ? (
          <div className="mt-1 h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <h3 className="text-3xl font-bold mt-1 text-gray-800">{value}</h3>
        )}
        {period && !isLoading && <p className="text-xs text-gray-400 mt-1">{period}</p>}
      </div>
      <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

// Transaction Row Component
const TransactionRow = ({ transaction }) => {
  const transactionDate = transaction.completedAt?.toDate ? formatDate(transaction.completedAt, true) : formatDate(transaction.updatedAt, true); // Prefer completedAt if available
  const orderDate = formatDate(transaction.createdAt);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <Link href={`/admin/orders/${transaction.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
          #{transaction.id.substring(0, 8)}...
        </Link>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 truncate" style={{maxWidth: '200px'}} title={transaction.gigTitle}>
            {transaction.gigTitle || 'N/A'}
        </div>
        <div className="text-xs text-gray-500">Order Date: {orderDate}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(transaction.gigPrice)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {transactionDate}
      </td>
       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <Link href={`/admin/users/${transaction.buyerId}`} className="text-indigo-600 hover:underline">
            {transaction.buyerName || transaction.buyerId.substring(0,10)+'...'}
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
         <Link href={`/admin/users/${transaction.sellerId}`} className="text-indigo-600 hover:underline">
            {transaction.sellerName || transaction.sellerId.substring(0,10)+'...'}
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {transaction.paymentMethod && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{transaction.paymentMethod}</span>}
      </td>
    </tr>
  );
};


export default function FinancesPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedPeriod, setSelectedPeriod] = useState('all_time'); // 'all_time', 'this_month', 'last_month', 'custom'

  const fetchFinancialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ordersRef = collection(db, 'orders');
      // For financial calculations, we are typically interested in 'completed' orders
      let q = query(ordersRef, where('status', '==', 'completed'));

      // Apply date filtering for transactions list if a custom range is set for it
      // For stats, we'll calculate based on all completed orders then filter for periods
      
      if (selectedPeriod === 'custom' && dateRange.startDate && dateRange.endDate) {
          const start = Timestamp.fromDate(new Date(dateRange.startDate));
          // Add one day to endDate to include the whole day
          const end = new Date(dateRange.endDate);
          end.setDate(end.getDate() + 1);
          const endTimestamp = Timestamp.fromDate(end);
          q = query(q, where('updatedAt', '>=', start), where('updatedAt', '<', endTimestamp));
      }
      // Always order by when it was completed/updated for transaction list
      q = query(q, orderBy('updatedAt', 'desc'));


      const querySnapshot = await getDocs(q);
      const fetchedOrders = [];
      querySnapshot.forEach(doc => {
        fetchedOrders.push({ id: doc.id, ...doc.data() });
      });
      
      setTransactions(fetchedOrders);
      setFilteredTransactions(fetchedOrders); // Initially, filtered is all fetched

      // Calculate Stats from ALL completed orders (not just the date-filtered list for display)
      const allCompletedOrdersSnapshot = await getDocs(query(collection(db, 'orders'), where('status', '==', 'completed')));
      let totalRevenue = 0;
      let revenueThisMonth = 0;
      let revenueLastMonth = 0;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of last month

      allCompletedOrdersSnapshot.forEach(doc => {
        const order = doc.data();
        if (order.gigPrice) {
          totalRevenue += order.gigPrice;
          const orderCompletedDate = order.updatedAt?.toDate(); // Assuming 'updatedAt' for completed orders reflects completion date
          if (orderCompletedDate) {
            if (orderCompletedDate >= startOfMonth) {
              revenueThisMonth += order.gigPrice;
            }
            if (orderCompletedDate >= startOfLastMonth && orderCompletedDate <= endOfLastMonth) {
              revenueLastMonth += order.gigPrice;
            }
          }
        }
      });

      setStats({
        totalRevenue,
        revenueThisMonth,
        revenueLastMonth,
        totalTransactions: allCompletedOrdersSnapshot.size,
        avgTransactionValue: allCompletedOrdersSnapshot.size > 0 ? totalRevenue / allCompletedOrdersSnapshot.size : 0,
      });

    } catch (err) {
      console.error("Error fetching financial data:", err);
      setError('Failed to load financial data. ' + err.message);
      toast.error('Could not load financial data.');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate, selectedPeriod]); // Dependencies for refetching

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);
  
  const handleDateRangeChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const applyDateFilter = () => {
      setSelectedPeriod('custom'); // This will trigger fetchFinancialData via useEffect
      // Or call fetchFinancialData directly if you prefer
  };
  
  const handlePeriodChange = (e) => {
      const period = e.target.value;
      setSelectedPeriod(period);
      if (period !== 'custom') {
          setDateRange({ startDate: '', endDate: ''}); // Clear custom dates
          // fetchFinancialData will be called by useEffect due to selectedPeriod change
      }
  };

  // Function to export data (basic CSV example)
  const exportTransactionsToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.info("No transactions to export.");
      return;
    }
    const headers = ["Order ID", "Gig Title", "Price", "Completion Date", "Buyer ID", "Seller ID", "Payment Method"];
    const rows = filteredTransactions.map(t => [
      t.id,
      `"${t.gigTitle?.replace(/"/g, '""') || 'N/A'}"`, // Handle commas/quotes in title
      t.gigPrice || 0,
      t.updatedAt?.toDate ? t.updatedAt.toDate().toISOString() : 'N/A',
      t.buyerId,
      t.sellerId,
      t.paymentMethod || 'N/A'
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financial_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported successfully!");
  };


  return (
    <div className="space-y-8" style={{maxWidth:"95%",margin:"auto",marginTop:"2%"}}>
      <h1 className="text-3xl font-bold text-gray-900 flex items-center"><FiDollarSign className="mr-3 h-8 w-8 text-indigo-600"/>Financial Overview</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <FiAlertCircle className="inline h-5 w-5 mr-2"/>
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={FiDollarSign} period="All Time" isLoading={isLoading} />
        <StatCard title="Revenue This Month" value={formatCurrency(stats.revenueThisMonth)} icon={FiTrendingUp} period={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} isLoading={isLoading} />
        <StatCard title="Revenue Last Month" value={formatCurrency(stats.revenueLastMonth)} icon={FiTrendingUp} period={new Date(new Date().setMonth(new Date().getMonth()-1)).toLocaleString('default', { month: 'long', year: 'numeric' })} isLoading={isLoading} />
        <StatCard title="Total Transactions" value={stats.totalTransactions.toLocaleString()} icon={FiList} period="Completed Orders" isLoading={isLoading} />
        <StatCard title="Avg. Transaction Value" value={formatCurrency(stats.avgTransactionValue)} icon={FiDollarSign} period="All Time" isLoading={isLoading} />
        {/* Add more StatCards as needed, e.g., Pending Payouts, Fees Collected */}
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 space-y-4 md:space-y-0 md:flex md:justify-between md:items-center">
        <div className="flex flex-wrap items-center gap-4">
          <FiFilter className="h-5 w-5 text-gray-500" />
          <select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all_time">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
          {selectedPeriod === 'custom' && (
            <>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button 
                onClick={applyDateFilter}
                className="bg-indigo-500 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-600"
                disabled={isLoading || !dateRange.startDate || !dateRange.endDate}
              >
                Apply Filter
              </button>
            </>
          )}
        </div>
        <button
          onClick={exportTransactionsToCSV}
          className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 flex items-center gap-2"
          disabled={isLoading || filteredTransactions.length === 0}
        >
          <FiDownload className="h-4 w-4" /> Export Transactions
        </button>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-800 p-6 border-b border-gray-200">Recent Completed Transactions</h2>
        {isLoading && filteredTransactions.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : !isLoading && filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <FiDollarSign className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No transactions found for the selected period.</p>
            <p className="text-sm text-gray-400">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gig Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map(transaction => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </tbody>
            </table>
          </div>
        )}
         {/* Pagination for transactions could be added here if the list becomes very long and server-side pagination is implemented for transactions */}
      </div>
    </div>
  );
}
