'use client';
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheck, FiLoader, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState('');
  
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/payment-success');
      return;
    }

    const fetchPaymentStatus = async () => {
      try {
        const planId = searchParams.get('plan');
        const paymentIntentId = searchParams.get('payment_intent');
        
        if (!planId || !paymentIntentId) {
          setError('Missing plan or payment information');
          setLoading(false);
          return;
        }

        // Verify the payment and update subscription
        const response = await fetch('/api/update-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            planId: planId,
            paymentIntentId: paymentIntentId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to update subscription');
        }

        // Set the plan and fetch latest user profile
        setPlan(planId);
        if (refreshUserProfile) {
          await refreshUserProfile();
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error processing payment success:', err);
        setError(err.message || 'Failed to process payment confirmation');
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [user, router, searchParams, refreshUserProfile]);

  // Get plan name
  const getPlanName = (planId) => {
    const planNames = {
      'basic': 'Basic',
      'pro': 'Professional',
    };
    return planNames[planId] || planId;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <FiLoader className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing your payment</h2>
            <p className="text-gray-500">Please wait while we confirm your subscription...</p>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <FiAlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Payment Error</h2>
            <p className="text-red-600 text-center mb-4">{error}</p>
            <div className="flex justify-center">
              <Link 
                href="/pricing"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Return to Pricing
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p className="text-primary-100 mt-1">
                Your {getPlanName(plan)} plan is now active
              </p>
            </div>
            
            <div className="p-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FiCheck className="h-6 w-6 text-green-600" />
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Thank you for your subscription</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Your account has been updated with your new subscription benefits.
                </p>
                
                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">What's included:</h4>
                  
                  {plan === 'basic' && (
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <FiCheck className="text-green-500 mr-2" /> 10 generation credits monthly
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="text-green-500 mr-2" /> All social media assets
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="text-green-500 mr-2" /> High-resolution downloads
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="text-green-500 mr-2" /> Commercial usage rights
                      </li>
                    </ul>
                  )}
                  
                  {plan === 'pro' && (
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <FiCheck className="text-green-500 mr-2" /> 20 generation credits monthly
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="text-green-500 mr-2" /> All asset types & marketing materials
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="text-green-500 mr-2" /> Ultra-high resolution downloads
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="text-green-500 mr-2" /> Advanced editing tools
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="text-green-500 mr-2" /> Priority support
                      </li>
                    </ul>
                  )}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Link
                    href="/generate-assets"
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Start Creating Assets <FiArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}