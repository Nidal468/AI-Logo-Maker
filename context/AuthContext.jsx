'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/firebase/config';
import { 
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import { getCurrentUserData } from '@/firebase/auth';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      if (authUser) {
        setUser(authUser);
        try {
          const userData = await getCurrentUserData(authUser.uid);
          setUserProfile(userData);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign out user
  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update user profile in context
  const updateProfile = (data) => {
    setUserProfile(prevState => ({
      ...prevState,
      ...data
    }));
  };

  const value = {
    user,
    userProfile,
    loading,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isProfileComplete: userProfile?.profileCompleted || false,
    isSeller: userProfile?.userType === 'seller',
    isBuyer: userProfile?.userType === 'buyer',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);