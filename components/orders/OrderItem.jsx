import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import OrderStatusBadge from './OrderStatusBadge';
import { FiExternalLink } from 'react-icons/fi';

const OrderItem = ({ order, userType }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM d, yyyy');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-24 sm:h-24 mb-4 sm:mb-0 sm:mr-4">
          {order.gigImage ? (
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-gray-200 rounded-md overflow-hidden">
              <Image
                src={order.gigImage}
                alt={order.gigTitle}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between">
            <div>
              <Link
                href={`/orders/${order.id}`}
                className="text-lg font-medium text-gray-900 hover:text-primary-600"
              >
                {order.gigTitle}
              </Link>
              
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                <span>Order #{order.id.slice(0, 8)}</span>
                <span>•</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              
              <div className="mt-2 flex items-center">
                <span className="mr-2 text-sm text-gray-700">
                  {userType === 'buyer' ? 'Seller:' : 'Buyer:'}
                </span>
                <span className="font-medium">
                  {userType === 'buyer' ? order.sellerName : order.buyerName}
                </span>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-0 flex flex-col items-start sm:items-end">
              <span className="text-lg font-bold text-gray-900">
                ${order.gigPrice}
              </span>
              
              <div className="mt-2">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-500">
              {order.status === 'delivered' ? (
                <span>Delivered on {formatDate(order.updatedAt)}</span>
              ) : (
                <span>Delivery expected by {formatDate(order.dueDate || order.updatedAt)}</span>
              )}
            </div>
            
            <Link
              href={`/orders/${order.id}`}
              className="mt-2 sm:mt-0 flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View Details
              <FiExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;