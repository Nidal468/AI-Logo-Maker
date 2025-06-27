// pages/buyer/payment-methods/add.js (or your preferred path)
"use client"; // Keep this if using App Router

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { FiCreditCard, FiArrowLeft } from 'react-icons/fi';
import Button from '@/components/common/Button'; // Adjust path if needed
import { useRouter } from 'next/navigation';
// *** Adjust the import path for PaymentMethodForm to match your project structure ***
import PaymentMethodForm from '@/components/PaymentMethodForm/PaymentMethodForm'; // Example path, adjust as needed

// --- IMPORTANT: Replace with your actual Stripe publishable key ---
// Load Stripe outside of the component to avoid recreating it on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RIXRWPNqOmhQQ1vkxfKoBHGPpOMSmCXlCKsmAU5E7IhXoJHKlXQDKrBhEoHGU43F97FvaDqjS1jMnRk8JZdiGcR00TdzPR6HM');

// Metadata can be exported separately in App Router
// export const metadata = {
//   title: 'Add Payment Method - Freelance Marketplace',
//   description: 'Add a new payment method to your account.',
// };

export default function AddPaymentMethodPage() {
  const router = useRouter();

  // --- Corrected Options ---
  // Provide mode, currency, and setupFutureUsage for setup mode
  const options = {
    mode: 'setup', // Specify the mode is 'setup' (for saving payment methods)
    currency: 'usd', // Specify the currency (e.g., 'usd', 'eur'). MUST match backend SetupIntent currency.
    // Optional but recommended: Specify how you intend to use the saved payment method
    setupFutureUsage: 'off_session', // Use 'off_session' if you plan to charge the customer later when they are not present
                                     // Use 'on_session' if you primarily use it with Checkout/PaymentLinks where the user is present

    // Appearance settings remain the same
    appearance: {
      theme: 'stripe',
      labels: 'floating',
      variables: {
        colorPrimary: '#6366f1', // Example: Indigo-500 Tailwind color
        colorBackground: '#ffffff',
        colorText: '#374151', // Example: Gray-700
        colorDanger: '#ef4444', // Example: Red-500
        fontFamily: 'Inter, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
        // ... other appearance variables
      },
    },
    // locale: 'en', // Optional: set locale
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiCreditCard className="mr-3 h-6 w-6 text-primary-600" />
            Add New Payment Method
          </h1>
          <p className="text-gray-600 mt-1">
            Securely save your card details for faster checkouts.
          </p>
        </div>
        <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center"
            aria-label="Go back"
        >
            <FiArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      {/* --- Stripe Elements Provider --- */}
      {/* Pass the corrected options including mode */}
      <Elements stripe={stripePromise} options={options}>
        <PaymentMethodForm />
      </Elements>

      <div className="mt-4 text-center text-xs text-gray-500">
        Powered by Stripe. Your payment information is securely processed.
      </div>
    </div>
  );
}
