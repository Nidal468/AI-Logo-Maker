'use client';

import { useState } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiTruck, FiRefreshCw } from 'react-icons/fi';

const OrderProgress = ({ status }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: FiClock },
    { key: 'in_progress', label: 'In Progress', icon: FiRefreshCw },
    { key: 'delivered', label: 'Delivered', icon: FiTruck },
    { key: 'completed', label: 'Completed', icon: FiCheckCircle },
  ];
  
  // Define the index of the current step
  const getCurrentStepIndex = () => {
    if (status === 'cancelled') return -1;
    if (status === 'revision') return 1; // Revision is considered as in progress
    
    const stepIndex = steps.findIndex(step => step.key === status);
    return stepIndex >= 0 ? stepIndex : 0;
  };
  
  const currentStepIndex = getCurrentStepIndex();
  
  return (
    <div className="py-4">
      {status === 'cancelled' ? (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2 text-red-600">
            <FiXCircle className="h-6 w-6" />
            <span className="font-medium">Order Cancelled</span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
            <div 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
              style={{ width: `${Math.max(5, ((currentStepIndex + 1) / steps.length) * 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={`
                    rounded-full h-8 w-8 flex items-center justify-center
                    ${isActive
                      ? isCompleted
                        ? 'bg-primary-500 text-white'
                        : 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`mt-2 text-xs ${isActive ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderProgress;