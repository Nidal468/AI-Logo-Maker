'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import {
  FiCheck, FiBriefcase, FiDollarSign, FiClock, FiStar, FiUsers,
  FiShield, FiTag, FiImage, FiFeather, FiTrendingUp, FiCpu,
  FiThumbsUp, FiAward, FiCodesandbox
} from 'react-icons/fi';

export default function HomePage() {
  const { isAuthenticated, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const redirectPath = userProfile?.userType === 'seller'
        ? '/seller/dashboard'
        : '/buyer/dashboard';
      router.push(redirectPath);
    }
  }, [loading, isAuthenticated, userProfile, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section with Animated Background */}
        <section className="relative overflow-hidden py-20 lg:py-28">
          {/* Enhanced multi-layered background with vibrant colors */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* First pattern layer - dots */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%235D48E3" fill-opacity="0.4" fill-rule="evenodd"/%3E%3C/svg%3E")',
              backgroundSize: '20px'
            }}></div>

            {/* Second pattern layer - waves */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="30" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 15C5 9 10 9 15 15C20 21 25 21 30 15C35 9 40 9 45 15C50 21 55 21 60 15C65 9 70 9 75 15C80 21 85 21 90 15C95 9 100 9 105 15V30H0V15Z" fill="%23FF6A95" fill-opacity="0.6"/%3E%3C/svg%3E")',
              backgroundSize: '100px 30px',
              backgroundPosition: 'bottom'
            }}></div>

            {/* Shimmering gradient overlay */}
            <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-yellow-300 via-transparent to-cyan-300"></div>

            {/* Animated floating shapes */}
            <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 opacity-20 animate-float"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-red-400 opacity-10 animate-float-delay"></div>
            <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 opacity-15 animate-float-slow"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="lg:pr-12">
                  <div className="inline-block rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700 mb-6 shadow-sm border border-indigo-100">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                      Freelance Services Marketplace
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                    <span className="block">Find The Perfect</span>
                    <span className="relative">
                      <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Freelance Services
                      </span>
                      <svg className="absolute bottom-0 w-full h-3 text-pink-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0 5 Q 25 0, 50 5 Q 75 10, 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                      </svg>
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                    Connect with talented freelancers within minutes. Maintain quality, boost your business, and generate stunning AI assets with ease.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      href="/signup"
                      size="lg"
                      fullWidth={false}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg border-0"
                    >
                      Get Started
                    </Button>
                    <Button
                      href="/marketplace"
                      variant="outline"
                      size="lg"
                      fullWidth={false}
                      className="px-8 py-3 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    >
                      Explore Marketplace
                    </Button>
                    <Button
                      href="/generate-assets"
                      variant="light"
                      size="lg"
                      fullWidth={false}
                      className="px-8 py-3 flex items-center gap-2 bg-gradient-to-r from-green-50 to-cyan-50 text-teal-700 border border-teal-200 hover:shadow-md hover:from-green-100 hover:to-cyan-100"
                    >
                      <FiImage className="h-5 w-5" /> Free Logo Generator
                    </Button>
                  </div>
                  <div className="mt-8 flex items-center">
                    <div className="flex -space-x-3">
                      {['https://randomuser.me/api/portraits/women/32.jpg',
                        'https://randomuser.me/api/portraits/men/44.jpg',
                        'https://randomuser.me/api/portraits/women/68.jpg',
                        'https://randomuser.me/api/portraits/men/75.jpg'].map((avatar, i) => (
                          <div key={i} className="inline-block h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden">
                            <Image
                              src={avatar}
                              alt="User avatar"
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                    </div>
                    <div className="ml-4 text-sm font-medium text-gray-700 bg-white bg-opacity-50 px-4 py-1.5 rounded-full shadow-sm">
                      Trusted by 10,000+ businesses worldwide
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                {/* Hero showcase with enhanced floating elements */}
                <div className="relative mx-auto h-[400px] w-full max-w-lg">
                  {/* Main image with glass morphism effect */}
                  <div className="relative z-10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
                    <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm border border-white border-opacity-30"></div>
                    <div className="aspect-w-16 aspect-h-9 w-full">
                      {/* Replace with your actual image */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <div className="relative text-white">
                          <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-lg transform rotate-3"></div>
                          <div className="relative z-10 text-2xl font-bold px-8 py-4">Platform Preview</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating elements - cards with enhanced visual effects */}
                  <div className="absolute top-0 right-0 transform -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-white rounded-lg shadow-xl p-3 animate-float-slow z-20 backdrop-filter backdrop-blur-sm border border-indigo-100">
                    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                      <FiCodesandbox className="h-10 w-10" />
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-0 transform translate-y-1/3 -translate-x-1/4 w-40 h-24 bg-white rounded-lg shadow-xl p-3 animate-float z-20 backdrop-filter backdrop-blur-sm border border-teal-100">
                    <div className="h-full bg-gradient-to-br from-green-50 to-teal-100 rounded-lg flex flex-col items-center justify-center text-teal-600">
                      <FiImage className="h-6 w-6 mb-1" />
                      <span className="text-xs font-semibold">AI Image Generation</span>
                    </div>
                  </div>

                  <div className="absolute top-1/2 right-0 transform translate-x-1/3 w-36 h-24 bg-white rounded-lg shadow-xl p-3 animate-float-delay z-20 backdrop-filter backdrop-blur-sm border border-purple-100">
                    <div className="h-full bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg flex flex-col items-center justify-center text-purple-600">
                      <FiFeather className="h-6 w-6 mb-1" />
                      <span className="text-xs font-semibold">Creative Services</span>
                    </div>
                  </div>

                  {/* Additional floating element */}
                  <div className="absolute bottom-1/4 right-1/4 transform rotate-6 w-28 h-20 bg-white rounded-lg shadow-xl p-2 animate-float-slow z-20 backdrop-filter backdrop-blur-sm border border-yellow-100">
                    <div className="h-full bg-gradient-to-br from-yellow-50 to-amber-100 rounded-lg flex flex-col items-center justify-center text-amber-600">
                      <FiStar className="h-6 w-6 mb-1" />
                      <span className="text-xs font-semibold">Premium Quality</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">3M+</div>
                <p className="text-gray-600">Active Users</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
                <p className="text-gray-600">Freelancers</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">15M+</div>
                <p className="text-gray-600">AI Assets Generated</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">4.8</div>
                <p className="text-gray-600">Star Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Image Generation Feature Highlight */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: FiImage, title: "Logo Design", desc: "Custom brand logos" },
                      { icon: FiFeather, title: "Social Media", desc: "Posts, stories, covers" },
                      { icon: FiCpu, title: "AI Powered", desc: "Advanced algorithms" },
                      { icon: FiTag, title: "Free Tier", desc: "Try before you buy" }
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-lg">
                        <item.icon className="h-6 w-6 text-primary-600 mb-2" />
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Button
                      href="/generate-assets"
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      Generate Free Assets Now
                    </Button>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="lg:pl-12">
                  <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    AI-Powered Generator
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Create Stunning Visual Assets with AI
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">
                    Whether you need a professional logo, social media graphics, or marketing materials, our AI-powered generator creates stunning visuals in seconds.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Create logos, banners, and social media posts",
                      "Both free and premium options available",
                      "Customize and edit to match your brand",
                      "Download in high resolution formats"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <FiCheck className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="ml-3 text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Services */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Popular Professional Services
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Browse through our most sought-after services from top-rated freelancers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Service Category 1 */}
              <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-cyan-500 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-black">Web Development</h3>
                    <p className="text-black text-sm mt-1">Build your online presence</p>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <FiCheck className="mr-2 text-green-500" /> Website Development
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FiCheck className="mr-2 text-green-500" /> E-commerce Solutions
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FiCheck className="mr-2 text-green-500" /> Web Application
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Button href="/marketplace/category/web-development" variant="outline" className="w-full">
                      Explore Web Development
                    </Button>
                  </div>
                </div>
              </div>

              {/* Service Category 2 */}
              <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-black">Graphic Design</h3>
                    <p className="text-black text-sm mt-1">Make your brand stand out</p>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <FiCheck className="mr-2 text-green-500" /> Logo Design
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FiCheck className="mr-2 text-green-500" /> Brand Identity
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FiCheck className="mr-2 text-green-500" /> Social Media Graphics
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Button href="/marketplace/category/graphic-design" variant="outline" className="w-full">
                      Explore Graphic Design
                    </Button>
                  </div>
                </div>
              </div>

              {/* Service Category 3 */}
              <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 bg-gradient-to-r from-amber-500 to-orange-500 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-black">Content Writing</h3>
                    <p className="text-black text-sm mt-1">Engage your audience</p>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <FiCheck className="mr-2 text-green-500" /> Blog Posts
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FiCheck className="mr-2 text-green-500" /> Website Copy
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FiCheck className="mr-2 text-green-500" /> Product Descriptions
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Button href="/marketplace/category/content-writing" variant="outline" className="w-full">
                      Explore Content Writing
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-12">
              <Button href="/marketplace" size="lg" variant="outline">
                Browse All Categories
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform makes it easy to find, order, and receive exactly what you need
              </p>
            </div>

            <div className="relative">
              {/* Process timeline connector */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-primary-200 transform -translate-y-1/2 z-0"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Step 1 */}
                <div className="bg-white p-8 rounded-xl shadow-lg relative z-10">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto -mt-16 mb-6 border-4 border-white shadow-md">
                    <FiBriefcase className="h-10 w-10 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-center">1. Find the perfect service</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Browse through various services and find the one that matches your needs. Filter by category, price, or ratings.
                  </p>
                  <div className="text-center">
                    <Button href="/marketplace" variant="light" size="sm">
                      Start Browsing
                    </Button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-8 rounded-xl shadow-lg relative z-10">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto -mt-16 mb-6 border-4 border-white shadow-md">
                    <FiDollarSign className="h-10 w-10 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-center">2. Place an order</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Contact the seller and place your order with your specific requirements. Pay securely through our platform.
                  </p>
                  <div className="text-center">
                    <Button href="/signup" variant="light" size="sm">
                      Create Account
                    </Button>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-8 rounded-xl shadow-lg relative z-10">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto -mt-16 mb-6 border-4 border-white shadow-md">
                    <FiClock className="h-10 w-10 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-center">3. Get your work done</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Receive your completed work and request revisions if needed. Release payment only when you're satisfied.
                  </p>
                  <div className="text-center">
                    <Button href="/how-it-works" variant="light" size="sm">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose Our Platform
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We provide the tools and security you need for successful freelance projects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: FiUsers,
                  title: "Talented Freelancers",
                  desc: "Access to vetted professionals across various skills and specialties."
                },
                {
                  icon: FiShield,
                  title: "Secure Payments",
                  desc: "Your payment is held in escrow until you approve the delivered work."
                },
                {
                  icon: FiStar,
                  title: "Quality Guaranteed",
                  desc: "All freelancers are rated and reviewed by real clients like you."
                },
                {
                  icon: FiCpu,
                  title: "AI-Powered Tools",
                  desc: "Generate professional assets quickly with our advanced AI technology."
                },
                {
                  icon: FiThumbsUp,
                  title: "24/7 Support",
                  desc: "Our customer support team is available to help at any time."
                },
                {
                  icon: FiAward,
                  title: "Money Back Guarantee",
                  desc: "Not satisfied with the work? Get your money back, guaranteed."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Asset Generator Section */}
        <section className="py-16 bg-gradient-to-br from-primary-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 p-8 lg:p-12">
                  <div className="bg-green-100 text-green-700 inline-block px-3 py-1 rounded-full text-sm font-semibold mb-6">
                    Free Feature
                  </div>
                  <h2 className="text-3xl font-bold mb-6">
                    Generate Free AI Assets
                  </h2>
                  <p className="text-gray-700 mb-8">
                    Try our AI asset generator for free! Create professional logos, social media graphics, and marketing materials in seconds.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <FiCheck className="h-5 w-5 text-green-500 mr-3" />
                      <span>No design skills required</span>
                    </li>
                    <li className="flex items-center">
                      <FiCheck className="h-5 w-5 text-green-500 mr-3" />
                      <span>Free credits for new users</span>
                    </li>
                    <li className="flex items-center">
                      <FiCheck className="h-5 w-5 text-green-500 mr-3" />
                      <span>Premium options available</span>
                    </li>
                    <li className="flex items-center">
                      <FiCheck className="h-5 w-5 text-green-500 mr-3" />
                      <span>Easy to customize and download</span>
                    </li>
                  </ul>
                  <div>
                    <Button
                      href="/generate-assets"
                      size="lg"
                      className="bg-gradient-to-r text-black from-primary-600 to-primary-700 shadow-lg hover:from-primary-700 hover:to-primary-800"
                    >
                      <FiImage className="mr-2 h-5 w-5" /> Try Free Logo Generator
                    </Button>
                  </div>
                </div>
                <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-8 lg:p-12">
                  <div className="relative w-full max-w-xs mx-auto">
                    {/* Main showcase image */}
                    <div className="bg-white p-3 rounded-lg shadow-lg">
                      <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded">
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <FiImage className="h-12 w-12 mx-auto text-primary-600 mb-3" />
                            <div className="text-sm font-medium text-gray-900">AI Generated Logo</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating elements */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white p-2 rounded-lg shadow-lg rotate-6 animate-float">
                      <div className="h-full bg-yellow-50 rounded flex items-center justify-center text-yellow-600">
                        <FiImage className="h-10 w-10" />
                      </div>
                    </div>

                    <div className="absolute -bottom-4 -left-8 w-28 h-16 bg-white p-2 rounded-lg shadow-lg -rotate-6 animate-float-delay">
                      <div className="h-full bg-green-50 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-green-700">Ready to use!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Our Users Say
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Join thousands of satisfied clients who have found the perfect freelancers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Marketing Director",
                  company: "TechStart Inc.",
                  image: "/images/testimonial1.jpg",
                  quote: "The AI asset generator saved us countless hours of design work. We were able to create professional branding materials in minutes!"
                },
                {
                  name: "Michael Chen",
                  role: "Small Business Owner",
                  company: "Chen's Bistro",
                  image: "/images/testimonial2.jpg",
                  quote: "I found an amazing graphic designer through the marketplace who helped rebrand my restaurant. The whole process was seamless."
                },
                {
                  name: "Jessica Williams",
                  role: "Freelance Writer",
                  company: "Self-employed",
                  image: "/images/testimonial3.jpg",
                  quote: "As a freelancer, this platform has connected me with quality clients and steady work. The payment protection gives me peace of mind."
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-lg shadow border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map(star => (
                        <FiStar key={star} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Ready to start your project?
              </h2>
              <p className="text-xl text-primary-100 mb-10">
                Join thousands of satisfied clients and find the perfect freelancer for your needs,
                or try our AI asset generator to create stunning visuals instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  href="/signup"
                  variant="light"
                  size="lg"
                  className="px-8 py-4 bg-white text-primary-700 hover:bg-primary-50"
                >
                  Create Account
                </Button>
                <Button
                  href="/generate-assets"
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-black border-white hover:bg-primary-500"
                >
                  Try Free Logo Generator
                </Button>
              </div>
              <p className="mt-6 text-primary-100 text-sm">
                No credit card required to get started
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}