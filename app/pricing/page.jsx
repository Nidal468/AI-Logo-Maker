'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheck, FiLoader, FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { PaymentModal } from '@/app/pricing/PaymentModal';

export default function PricingPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Basic features for individuals just getting started',
      features: [
        '3 free generation credits',
        'Basic social media assets only',
        'Standard resolution downloads',
        'Basic editing tools',
      ],
      limitations: [
        'No marketing materials',
        'No product designs',
        'No premium asset types',
        'Watermarked downloads',
      ],
      buttonText: 'Current Plan',
      disabled: true,
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 10,
      description: 'Perfect for creators and small businesses',
      features: [
        '10 generation credits monthly',
        'All social media assets',
        'High-resolution downloads',
        'Basic editing tools',
        'Commercial usage rights',
      ],
      limitations: [
        'Limited marketing materials',
        'No product designs',
      ],
      buttonText: 'Get Started',
      disabled: false,
      recommended: false,
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 20,
      description: 'Everything you need for professional content creation',
      features: [
        '20 generation credits monthly',
        'All asset types (including marketing materials)',
        'Ultra-high resolution downloads',
        'Advanced editing tools',
        'Priority support',
        'Commercial usage rights',
        'Bulk generation',
      ],
      limitations: [],
      buttonText: 'Get Started',
      disabled: false,
      recommended: true,
    },
  ];

  const handleSelectPlan = (plan) => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    // Free plan doesn't need payment
    if (plan.price === 0) {
      // For free plan, we'd update directly through the API
      updateFreePlan(plan.id);
      return;
    }

    setSelectedPlan(plan);
    setPaymentModalOpen(true);
  };

  const updateFreePlan = async (planId) => {
    try {
      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          planId: planId,
        }),
      });

      if (response.ok) {
        // Redirect to generate assets page after successful update
        router.push('/generate-assets');
      } else {
        console.error('Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  // Determine current plan
  const currentPlan = userProfile?.subscription?.plan || 'free';

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            Choose the right plan for your needs
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            All plans include access to our AI-powered asset generator. Upgrade for more features and credits.
          </p>
        </div>

        <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            
            return (
              <div 
                key={plan.id} 
                className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${
                  plan.recommended 
                    ? 'border-primary-500 ring-2 ring-primary-500' 
                    : 'border-gray-200'
                } ${isCurrentPlan ? 'border-green-500 bg-green-50/30' : ''}`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-6 -mt-3 inline-flex rounded-full bg-primary-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  
                  <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
                    <span className="ml-1 text-xl font-semibold">/month</span>
                  </div>
                  
                  <p className="mt-6 text-gray-500">{plan.description}</p>

                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <div className="flex-shrink-0">
                          <FiCheck className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">{feature}</p>
                      </li>
                    ))}
                    
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-start">
                        <div className="flex-shrink-0">
                          <FiX className="h-5 w-5 text-red-500" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">{limitation}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrentPlan || plan.disabled}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      isCurrentPlan
                        ? 'bg-green-100 text-green-800 cursor-default' 
                        : plan.recommended
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      plan.buttonText
                    )}
                  </button>
                </div>

                {isCurrentPlan && (
                  <div className="mt-3 flex items-center justify-center text-sm text-green-600">
                    <FiCheck className="h-4 w-4 mr-1" />
                    <span>Active subscription</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-base text-gray-500">
            All plans come with a 7-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
        />
      )}
    </div>
  );
}