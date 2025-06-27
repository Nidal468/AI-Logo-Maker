'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiImage, FiX, FiShield, FiCheckCircle, FiUsers, FiZap, FiStar, FiTrendingUp } from 'react-icons/fi';
import { registerUser } from '@/firebase/auth';

const SignupForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('buyer');
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const router = useRouter();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');

    try {
      await registerUser(data.email, data.password, data.name, userType);
      const redirectPath = userType === 'seller' ? '/seller/dashboard' : '/buyer/dashboard';
      router.push(redirectPath);
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please use a different email or log in.');
      } else {
        setError('An error occurred during signup. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: FiZap,
      title: 'Free AI Credits',
      description: 'Get 5 free AI asset generations every month'
    },
    {
      icon: FiShield,
      title: 'Secure Platform',
      description: 'Your data is protected with bank-level security'
    },
    {
      icon: FiUsers,
      title: 'Verified Community',
      description: 'Connect with 10K+ verified professionals'
    },
    {
      icon: FiTrendingUp,
      title: 'Growing Network',
      description: 'Join 3M+ users creating amazing projects'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Platform benefits */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              Join Our Growing Community
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Whether you're looking to hire talent or showcase your skills, 
              we provide the tools and security you need to succeed.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <benefit.icon className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* EU Compliance & Security */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiShield className="mr-2 text-green-600" />
              Why Choose Us?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <FiCheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">GDPR Compliant</div>
                  <div className="text-sm text-gray-600">Your privacy is protected by EU standards</div>
                </div>
              </div>
              <div className="flex items-start">
                <FiCheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Instant AI Assets</div>
                  <div className="text-sm text-gray-600">Create professional designs in seconds</div>
                </div>
              </div>
              <div className="flex items-start">
                <FiCheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Quality Guarantee</div>
                  <div className="text-sm text-gray-600">Money-back guarantee on all services</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Active Freelancers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">3M+</div>
              <div className="text-sm text-gray-600">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">4.8★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Right side - Signup form */}
        <div className="w-full max-w-md mx-auto">
          {/* Welcome Popup */}
          {showWelcomePopup && (
            <div className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-lg shadow-lg relative">
              <button
                onClick={() => setShowWelcomePopup(false)}
                className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
              <h3 className="font-semibold mb-1 text-yellow-200">Get Started Today! 🚀</h3>
              <p className="text-sm text-green-100">
                Create your account and get 5 free AI credits to start building amazing projects.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
              <p className="mt-2 text-sm text-gray-600">
                Join thousands of satisfied users worldwide
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* User Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">I want to:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`px-4 py-3 text-sm font-medium border rounded-lg transition-all ${
                      userType === 'buyer' 
                        ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-300'
                    }`}
                    onClick={() => setUserType('buyer')}
                  >
                    <FiUser className="w-4 h-4 mx-auto mb-1" />
                    Buy Services
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-3 text-sm font-medium border rounded-lg transition-all ${
                      userType === 'seller' 
                        ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-300'
                    }`}
                    onClick={() => setUserType('seller')}
                  >
                    <FiStar className="w-4 h-4 mx-auto mb-1" />
                    Sell Services
                  </button>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiUser className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-3 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors`}
                    {...register('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiMail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                    })}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
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
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-3 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors`}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'The passwords do not match'
                    })}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              {/* Free Credits Section */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiZap className="mr-2 text-amber-600" /> Welcome Bonus!
                </h3>
                <p className="text-sm text-gray-600">
                  Get <strong>5 free AI credits</strong> when you join as a {userType}. 
                  Create professional logos, social media posts, and more instantly!
                </p>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                  {...register('terms', { required: 'You must accept the terms and conditions' })}
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

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
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>

            {/* Trust indicators */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center">
                  <FiShield className="w-4 h-4 mr-1 text-green-600" />
                  GDPR Protected
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

export default SignupForm;