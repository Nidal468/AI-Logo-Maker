import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

export async function registerUser(email, password, name, userType) {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, { displayName: name });
    
    // Create a document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName: name,
      userType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profileCompleted: false,
      subscription: {
        status: 'free',
        plan: 'free',
        creditsRemaining: 3, // Free tier gets 3 free credits
        expiresAt: null
      }
    });
    
    return user;
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error in loginUser:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error in logoutUser:", error);
    throw error;
  }
}

export async function getCurrentUserData(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.warn("User document does not exist in Firestore");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function updateUserSubscription(userId, subscriptionData) {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      subscription: subscriptionData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating user subscription:", error);
    throw error;
  }
}

export async function decrementUserCredits(userId) {
  try {
    // This would typically be done with a Cloud Function or a transaction
    // for production to prevent race conditions
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      'subscription.creditsRemaining': firebase.firestore.FieldValue.increment(-1),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error decrementing user credits:", error);
    throw error;
  }
}