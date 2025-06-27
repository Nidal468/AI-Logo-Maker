// src/app/api/stripepayment/route.js (for App Router)
// Or pages/api/stripepayment.js (for Pages Router)

import { NextResponse } from 'next/server'; // Use NextRequest for App Router if needed
// If using Pages Router, use: import type { NextApiRequest, NextApiResponse } from 'next';

// Import the official Stripe Node.js library
import Stripe from 'stripe';

// --- IMPORTANT: Initialize Stripe with your SECRET KEY ---
// --- Use environment variables for security ---
const stripe = new Stripe("sk_test_51RIXRWPNqOmhQQ1vVglqF54S8yepzZskgTAPSM7DLpGggEwZyr3l7RpDYkB9GrsJ9xsqf2ExLeW2fxU7L7MMhzyp00s1d2Tu6g", {
    apiVersion: '2024-04-10', // Use a fixed API version
});

// --- POST Handler for creating SetupIntent ---
export async function POST(request) { // For App Router
// export default async function handler(req: NextApiRequest, res: NextApiResponse) { // For Pages Router
  if (request.method !== 'POST') { // Check method for Pages Router: if (req.method !== 'POST')
    return NextResponse.json({ error: { message: `Method ${request.method} Not Allowed` } }, { status: 405 });
    // Pages Router: res.setHeader('Allow', 'POST'); res.status(405).end('Method Not Allowed'); return;
  }

  try {
    // --- Get userId from request body ---
    const body = await request.json(); // For App Router
    // const { userId } = req.body; // For Pages Router

    const userId = body.userId; // Extract userId

    if (!userId) {
      return NextResponse.json({ error: { message: 'User ID is required.' } }, { status: 400 });
      // Pages Router: res.status(400).json({ error: { message: 'User ID is required.' } }); return;
    }

    console.log(`API route: Creating SetupIntent for user: ${userId}`);

    // --- Create a Stripe SetupIntent ---
    // Optional: Find or create a Stripe Customer associated with the userId
    // const customer = await findOrCreateStripeCustomer(userId); // Implement this function if needed

    const setupIntent = await stripe.setupIntents.create({
      // customer: customer.id, // Associate with customer if using Stripe Customer objects
      // --- REMOVE payment_method_types ---
      // Let Stripe handle payment method types automatically based on your dashboard settings
      // payment_method_types: ['card'], // <-- REMOVE THIS LINE
      automatic_payment_methods: { enabled: true }, // Use automatic payment methods
      metadata: {
        // Store your internal user ID for reference
        user_id: userId,
      },
      // Ensure usage matches frontend Elements options if needed, though often inferred
      // usage: 'off_session', // Often inferred, but can be explicit
    });

    console.log(`API route: SetupIntent ${setupIntent.id} created for user: ${userId}`);

    // --- Send back the client_secret ---
    return NextResponse.json({ clientSecret: setupIntent.client_secret });
    // Pages Router: res.status(200).json({ clientSecret: setupIntent.client_secret });

  } catch (error) {
    console.error('API route error creating SetupIntent:', error);
    // Handle potential Stripe errors
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: { message: errorMessage } }, { status: 500 });
    // Pages Router: res.status(500).json({ error: { message: errorMessage } });
  }
}

