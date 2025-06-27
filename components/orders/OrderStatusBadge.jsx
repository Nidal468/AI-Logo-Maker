import { FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiTruck } from 'react-icons/fi';

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      icon: FiClock,
    },
    in_progress: {
      label: 'In Progress',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: FiRefreshCw,
    },
    delivered: {
      label: 'Delivered',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: FiTruck,
    },
    completed: {
      label: 'Completed',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: FiCheckCircle,
    },
    cancelled: {
      label: 'Cancelled',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: FiXCircle,
    },
    revision: {
      label: 'Revision',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      icon: FiRefreshCw,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;