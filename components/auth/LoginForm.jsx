'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff, FiX, FiShield, FiCheckCircle, FiUsers, FiZap } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/firebase/auth';

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');

    try {
      await loginUser(data.email, data.password);
      router.push(redirectPath);
    } catch (error) {
      console.error(error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Website presentation */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              Trusted Freelance Marketplace
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Connect with verified professionals and create stunning AI assets. 
              Built with European privacy standards and security at its core.
            </p>
          </div>

          {/* EU Compliance & Security */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiShield className="mr-2 text-green-600" />
              EU Compliant & Secure
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <FiCheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">GDPR Compliant</div>
                  <div className="text-sm text-gray-600">Full compliance with EU data protection regulations</div>
                </div>
              </div>
              <div className="flex items-start">
                <FiCheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Bank-Level Security</div>
                  <div className="text-sm text-gray-600">256-bit SSL encryption for all transactions</div>
                </div>
              </div>
              <div className="flex items-start">
                <FiCheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Verified Freelancers</div>
                  <div className="text-sm text-gray-600">All professionals undergo thorough verification</div>
                </div>
              </div>
            </div>
          </div>

          {/* Credits System Explanation */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiZap className="mr-2 text-amber-600" />
              How Credits Work
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• <strong>Free users:</strong> 5 free AI asset generations per month</p>
              <p>• <strong>Premium users:</strong> 100+ credits monthly for unlimited creations</p>
              <p>• <strong>Credits never expire</strong> and roll over to next month</p>
              <p>• <strong>Marketplace services</strong> use secure payment system (no credits needed)</p>
            </div>
          </div>

          {/* Team Touch */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiUsers className="mr-2 text-primary-600" />
              Meet Our Team
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-indigo-100 border-2 border-white flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600">AR</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-white flex items-center justify-center">
                  <span className="text-sm font-semibold text-green-600">SK</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-white flex items-center justify-center">
                  <span className="text-sm font-semibold text-purple-600">MT</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Built by a passionate team of 15+ developers and designers
                </p>
                <Link href="/about" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Learn more about us →
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Trusted Freelancers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">3M+</div>
              <div className="text-sm text-gray-600">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">15M+</div>
              <div className="text-sm text-gray-600">AI Assets Created</div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-md mx-auto">
          {/* Welcome Popup */}
{showWelcomePopup && (
  <div className="mb-6 bg-gradient-to-r from-amber-100 to-amber-100 text-white rounded-lg shadow-sm relative p-6 border border-amber-200">
     
    <button
      onClick={() => setShowWelcomePopup(false)}
      className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
    >
      <FiX className="w-5 h-5" />
    </button>
    <h3 className="font-semibold mb-1 text-gray-900">Welcome Back! 🎉</h3>
    <p className="text-sm text-gray-900">
      Log in to access your dashboard and continue creating amazing projects.
    </p>
  </div>
)}

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8  space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 ">Sign In</h2>
              <p className="mt-2 text-sm text-gray-600">
                Access your account to manage projects and create AI assets
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiMail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors`}
                    {...register('password', {
                      required: 'Password is required',
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
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
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                  {...register('remember')}
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Keep me signed in
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg hover:from-primary-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                New to our platform?{' '}
                <Link 
                  href="/signup" 
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Trust indicators */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center">
                  <FiShield className="w-4 h-4 mr-1 text-green-600" />
                  GDPR Compliant
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-1 text-blue-600" />
                  SSL Secured
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;