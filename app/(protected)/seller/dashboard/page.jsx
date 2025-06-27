import SellerDashboard from '@/components/seller/SellerDashboard';

export const metadata = {
  title: 'Seller Dashboard - Freelance Marketplace',
  description: 'Manage your services, orders, and track your performance.',
};

export default function SellerDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage your services, track orders, and analyze your performance.
        </p>
      </div>
      
      <SellerDashboard />
    </div>
  );
}