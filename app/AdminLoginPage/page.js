// components/admin/AdminLoginPage.jsx (or your actual path)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiLogIn } from 'react-icons/fi';
import { loginAdmin } from '@/firebase/adminAuth'; // Ensure this path is correct
import { toast } from 'react-toastify';

const AdminLoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: 'admin@gmail.com', // Pre-filled for convenience
      password: '12345678'     // Pre-filled for convenience
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(''); // For general form errors
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(''); // Clear previous general errors

    try {
      await loginAdmin(data.email, data.password);
      toast.success('Admin login successful! Redirecting...');
      router.push('/admin/dashboard'); // Navigate to admin dashboard on success
    } catch (err) {
      // More specific error handling based on the error message from loginAdmin
      console.error("Login error:", err);
      const errorMessage = err.message || 'An unknown error occurred during login.';
      setError(errorMessage); // Display the error message from loginAdmin
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 text-slate-800 flex flex-col items-center justify-center p-4 font-sans">
      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl shadow-2xl border border-gray-200">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-indigo-600 p-3 rounded-full mb-4 shadow-lg">
            <FiShield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-indigo-600 tracking-tight">Admin Portal</h1>
          <p className="mt-2 text-sm text-slate-600">
            Secure access for platform administrators.
          </p>
        </div>

        {/* General Error Message Area */}
        {error && (
          <div className="mb-6 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <FiMail className="w-5 h-5 text-slate-400" />
              </div>
              <input
                id="email"
                type="email"
                className={`w-full pl-11 pr-3 py-2.5 bg-white border ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} rounded-md shadow-sm placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-1 sm:text-sm transition-colors duration-150`}
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required.',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address format.',
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <FiLock className="w-5 h-5 text-slate-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-11 pr-10 py-2.5 bg-white border ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} rounded-md shadow-sm placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-1 sm:text-sm transition-colors duration-150`}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required.',
                })}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-700 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-150 ease-in-out group"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              <>
                <FiLogIn className="w-5 h-5 mr-2 -ml-1 group-hover:translate-x-1 transition-transform duration-150" />
                Log in to Admin Portal
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">
            This is a restricted area. All access attempts are logged.
          </p>
        </div>
      </div>

      {/* Optional: A small branding footer for the page itself */}
      <footer className="mt-10 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Your Marketplace Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminLoginPage;
