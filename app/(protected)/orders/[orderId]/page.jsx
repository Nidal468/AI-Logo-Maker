import { getOrderById } from '@/firebase/firestore'; // Assuming path
import OrderDetails from '@/components/orders/OrderDetails'; // Assuming path
import Button from '@/components/common/Button'; // **Import Button**
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi'; // **Import Icon**
import Link from 'next/link'; // Import Link for error state

export async function generateMetadata({ params }) {
  try {
    const order = await getOrderById(params.orderId);
    // Handle case where order is not found gracefully
    if (!order) {
      return { title: 'Order Not Found | Freelance Marketplace' };
    }
    return {
      title: `Order #${order.id.slice(0, 8)} | Freelance Marketplace`, // Use shorter ID
      description: `Details for order ${order.id.slice(0, 8)}: ${order.gigTitle || 'View order details'}.`.substring(0, 160), // Improved description
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: 'Order Details | Freelance Marketplace',
      description: 'View order details and manage your order.',
    };
  }
}

async function getOrderData(orderId) {
  try {
    const order = await getOrderById(orderId);
    // Return null for order if not found, let page handle it
    return { order: order || null };
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    // Return specific error message
    return { error: `Failed to load order details. ${error.message || ''}` };
  }
}

export default async function OrderDetailsPage({ params }) {
  const { orderId } = params;
  const { order, error } = await getOrderData(orderId);

  // Handle Error or Not Found State
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
        <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          {error ? 'Error Loading Order' : 'Order Not Found'}
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          {error || "We couldn't find the order you're looking for. It might have been removed or the link is incorrect."}
        </p>

      </div>
    );
  }

  // Render Order Details
  return (
    // Added container and padding for consistency
    <div className="container mx-auto px-4 py-8">
      {/* **Updated Header Section with Back Button** */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Title and Description */}
        <div>
          <div style={{ width: "200px" }}>

          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            View and manage your order progress and communication.
          </p>
        </div>
        {/* Back Button */}

      </div>

      {/* Render the Client Component with Order Data */}
      {/* Note: The OrderDetails component itself already has another back button inside */}
      <OrderDetails order={order} />
    </div>
  );
}
