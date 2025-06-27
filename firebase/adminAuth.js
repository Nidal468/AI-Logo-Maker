// firebase/adminAuth.js

// We are not using Firebase Auth or Firestore for these dummy functions anymore.
// import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { auth, db } from './config'; // db might be needed if other functions in this file use it.

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '12345678'; // This is the hardcoded password

// In-memory flag to simulate login state.
// In a real app, this would be managed by Firebase Auth state or a proper session mechanism.
let isDummyAdminLoggedIn = false;

export async function loginAdmin(email, password) {
  console.log('Attempting dummy admin login with email:', email);

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    isDummyAdminLoggedIn = true;
    console.log('Dummy admin login successful for:', email);
    // Return a fixed dummy user object
    return {
      uid: 'admin-dummy-uid-001',
      email: ADMIN_EMAIL,
      displayName: 'Super Admin (Dummy)',
      // Add any other user properties your application might expect
      // For example, if your AdminLayout or other components expect userType:
      userType: 'admin',
    };
  } else {
    isDummyAdminLoggedIn = false;
    console.warn('Dummy admin login failed: Invalid credentials.');
    throw new Error('Invalid admin credentials. Please use the hardcoded values.');
  }
}

export async function logoutAdmin() {
  console.log('Attempting dummy admin logout.');
  isDummyAdminLoggedIn = false;
  // Simulate async operation if needed, though not strictly necessary here
  return Promise.resolve();
}

export async function checkAdminAuth() {
  console.log('Checking dummy admin auth status. Currently logged in:', isDummyAdminLoggedIn);
  // Return the state of our in-memory flag
  return isDummyAdminLoggedIn;
}

// This function remains a placeholder as its original purpose was for backend setup.
// With dummy auth, it's less relevant but kept for structural consistency if needed.
export async function ensureAdminExists() {
  try {
    console.log('ensureAdminExists (dummy mode): This function is a placeholder and does not interact with a backend in dummy mode.');
    // If you needed to ensure the dummy admin "exists" in some local context,
    // you could add logic here, but typically it's not needed for this dummy setup.
  } catch (error) {
    console.error("Error in ensureAdminExists (dummy placeholder):", error);
  }
}
