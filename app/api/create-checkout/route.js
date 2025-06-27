import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Initialize Stripe
const stripe = new Stripe("sk_test_51RIXRWPNqOmhQQ1vVglqF54S8yepzZskgTAPSM7DLpGggEwZyr3l7RpDYkB9GrsJ9xsqf2ExLeW2fxU7L7MMhzyp00s1d2Tu6g");

export async function POST(req) {
  try {
    const { planId, userId, userEmail } = await req.json();
    
    if (!planId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Verify user exists in our database
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Define the price lookup based on planId
    const PRICE_IDS = {
      basic: process.env.STRIPE_PRICE_BASIC || 'price_basic123', // Replace with actual price IDs
      pro: process.env.STRIPE_PRICE_PRO || 'price_pro123',
    };
    
    const priceId = PRICE_IDS[planId];
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      client_reference_id: userId,
      customer_email: userEmail,
      metadata: {
        userId,
        planId,
      },
    });
    
    return NextResponse.json({ sessionUrl: session.url }, { status: 200 });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}