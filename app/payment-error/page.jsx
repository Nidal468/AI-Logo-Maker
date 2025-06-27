'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiAlertTriangle } from 'react-icons/fi';

export default function PaymentErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <FiAlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Processing Issue</h1>
          <p className="text-gray-600 text-center">
            We encountered a problem while processing your payment or updating your subscription.
          </p>
        </div>
        
        <div className="mb-6 bg-gray-50 p-4 rounded-md">
          <h2 className="font-medium text-gray-800 mb-2">What happened?</h2>
          <p className="text-sm text-gray-600">
            Your payment might have been processed by Stripe, but we had trouble updating your account. 
            Don't worry - if your payment went through, our team will ensure your subscription is activated.
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Link 
            href="/pricing"
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-center font-medium hover:bg-gray-200 transition-colors"
          >
            Return to Pricing
          </Link>
          <Link 
            href="/contact"
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-center font-medium hover:bg-primary-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}