'use client';

import { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext'; // Adjust path if needed
import Card from '@/components/common/Card'; // Adjust path if needed
import Button from '@/components/common/Button'; // Adjust path if needed
import { FiSave, FiLoader, FiAlertCircle } from 'react-icons/fi';

const PaymentMethodForm = () => {
  // Hooks to interact with Stripe and get user context
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth(); // Get user for userId

  // State for loading status and error messages
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle form submission
  const handleSubmit = async (event) => {
    // Prevent default browser form submission
    event.preventDefault();
    // Clear any previous error messages
    setErrorMessage('');

    // Ensure Stripe.js and Elements are loaded, and user is logged in
    if (!stripe || !elements || !user) {
      console.error("Stripe.js Elements not loaded or user not authenticated.");
      setErrorMessage("Payment system is not ready or you are not logged in. Please refresh.");
      return;
    }

    // Set loading state
    setIsProcessing(true);

    try {
      // --- Step 1: Trigger client-side validation and preparation ---
      // This is crucial and must be called before async work like fetching
      const { error: submitError } = await elements.submit();
      if (submitError) {
        // Show validation error (e.g., incomplete form) to the customer
        setErrorMessage(submitError.message);
        toast.error(submitError.message || "Please check your card details.");
        setIsProcessing(false); // Stop processing
        return;
      }

      // --- Step 2: Call the Next.js API route to create SetupIntent ---
      // This backend endpoint securely creates the SetupIntent using your secret key
      console.log(`Calling Next.js API route '/api/stripepayment' for user: ${user.uid}`);
      const response = await fetch('/api/stripepayment', { // Use your specific API route path
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }), // Send necessary data to backend
      });

      // Parse the response from the API route
      const data = await response.json();

      // Handle errors returned from the API route
      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to initialize payment setup.');
      }

      // Extract the client secret needed to confirm the setup
      const clientSecret = data.clientSecret;

      // Validate the client secret format
       if (typeof clientSecret !== 'string' || !clientSecret.startsWith('seti_')) {
           console.error("API route returned invalid clientSecret:", clientSecret);
           throw new Error("Received invalid payment setup secret from server.");
       }

      console.log("Obtained clientSecret via API route:", clientSecret);

      // --- Step 3: Confirm the SetupIntent on the client ---
      // This uses the clientSecret and the prepared Elements instance
      const { error: stripeError, setupIntent } = await stripe.confirmSetup({
        elements, // The Elements instance, prepared by elements.submit()
        clientSecret, // The secret obtained from your backend API route
        confirmParams: {
          // URL to redirect to after successful setup or authentication
          return_url: `/`,
        },
        // redirect: 'if_required', // Uncomment for automatic redirection (often preferred)
      });

      // --- Handle potential errors during confirmation ---
      if (stripeError) {
        // This usually means issues like card declined, insufficient funds, etc.
        console.error("Stripe confirmation error:", stripeError);
        setErrorMessage(stripeError.message || "An unexpected error occurred during setup.");
        toast.error(stripeError.message || "Failed to save payment method.");
      } else if (setupIntent?.status === 'succeeded') {
        // Setup was successful
        console.log("SetupIntent succeeded:", setupIntent);
        toast.success('Payment method saved successfully!');
        setErrorMessage(''); // Clear errors on success
        // Optionally redirect the user or update the UI here
        // e.g., router.push('/buyer/payment-methods');
      } else if (setupIntent) {
        // Handle other potential statuses if needed (e.g., 'processing', 'requires_action')
        console.warn("SetupIntent status:", setupIntent.status);
        setErrorMessage(`Payment method status: ${setupIntent.status}. Please wait or try again.`);
      }

    } catch (error) {
      // Catch errors from the fetch call, JSON parsing, or other unexpected issues
      console.error("Error during payment setup process:", error);
      const message = error.message || "An unexpected error occurred.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      // Reset loading state regardless of success or failure
      setIsProcessing(false);
    }
  };

  // Render the form
  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Display error messages */}
        {errorMessage && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-200 flex items-center">
            <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Stripe Payment Element for collecting card details */}
        <div className="p-2 border border-gray-200 rounded-md shadow-sm">
           <PaymentElement id="payment-element" />
        </div>

        {/* Submit button area */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            type="submit"
            // Disable button while processing or if Stripe isn't ready
            disabled={!stripe || !elements || isProcessing}
            isLoading={isProcessing} // Show loading indicator if available in Button component
            className="w-full sm:w-auto"
          >
            <FiSave className="mr-2" />
            {isProcessing ? 'Saving...' : 'Save Payment Method'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PaymentMethodForm;
