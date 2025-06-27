import BuyerDashboard from '@/components/buyer/BuyerDashboard';

export const metadata = {
  title: 'Buyer Dashboard - Freelance Marketplace',
  description: 'Track your orders and discover services.',
};

export default function BuyerDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Track your orders and discover services tailored for you.
        </p>
      </div>
      
      <BuyerDashboard />
    </div>
  );
}