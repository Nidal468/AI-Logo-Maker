// src/app/api/stirpePay/route.js

import Stripe from 'stripe';

// Initialize Stripe with your SECRET KEY
const stripe = new Stripe("sk_test_51RIWhwH77MZv8RqxBeFezmaPDP21aBX5iNtGeDyC2vGQJBAefP6kv2sdboS3WcXjOipbb2pSQAXWiupdiYZmApZk00N1GCaSH6", {
  apiVersion: '2024-04-10', // Use latest stable API version
});

// This GET handler can be used for testing the endpoint
export async function GET() {
  return new Response(JSON.stringify({ message: 'Stripe payment API is operational' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, planId, amount } = body;

    // Validate required fields
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!planId) {
      return new Response(JSON.stringify({ error: 'Plan ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a payment intent directly (without customer for simplicity)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 1000, // Default to $10 if no amount provided
      currency: 'usd',
      metadata: {
        userId: userId,
        planId: planId,
      },
      automatic_payment_methods: { enabled: true },
    });

    console.log(`Payment intent ${paymentIntent.id} created for user ${userId}, plan ${planId}`);

    // Return the client secret
    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API route error creating payment intent:', error);

    // Create a proper error response
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create payment intent' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}