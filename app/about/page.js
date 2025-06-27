'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    FiUsers,
    FiTarget,
    FiAward,
    FiZap,
    FiShield,
    FiHeart,
    FiTrendingUp,
    FiGlobe,
    FiStar,
    FiCheck
} from 'react-icons/fi';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const AboutUsPage = () => {
    const [activeTab, setActiveTab] = useState('mission');

    const stats = [
        { icon: FiUsers, number: '3M+', label: 'Active Users', color: 'text-blue-600' },
        { icon: FiUsers, number: '10K+', label: 'Skilled Freelancers', color: 'text-green-600' },
        { icon: FiZap, number: '15M+', label: 'AI Assets Generated', color: 'text-purple-600' },
        { icon: FiStar, number: '4.8', label: 'Star Rating', color: 'text-amber-600' },
    ];

const teamMembers = [
  {
    name: 'Alex Rodriguez',
    role: 'CEO & Founder',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Serial entrepreneur with 15+ years in tech, passionate about connecting talent with opportunity.'
  },
  {
    name: 'Sarah Kim',
    role: 'CTO',
  image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    bio: 'AI and machine learning expert leading our innovative asset generation technology.'
  },
  {
    name: 'Michael Thompson',
    role: 'Head of Product',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Product visionary focused on creating seamless user experiences for our global community.'
  },
  {
    name: 'Emily Chen',
    role: 'VP of Operations',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Operations leader ensuring quality and security across our marketplace platform.'
  }
];

    const values = [
        {
            icon: FiHeart,
            title: 'People First',
            description: 'We believe in putting our community of freelancers and clients at the heart of everything we do.'
        },
        {
            icon: FiShield,
            title: 'Trust & Security',
            description: 'Building a safe, secure platform where transactions are protected and relationships thrive.'
        },
        {
            icon: FiZap,
            title: 'Innovation',
            description: 'Constantly pushing boundaries with AI-powered tools and cutting-edge technology solutions.'
        },
        {
            icon: FiTrendingUp,
            title: 'Growth',
            description: 'Empowering businesses and freelancers to scale and achieve their professional goals.'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <Header />
            <section className="bg-gradient-to-br from-primary-50 via-white to-indigo-50 py-20">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                        About Our Platform
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        We're revolutionizing the freelance marketplace by combining human talent with
                        AI-powered tools to deliver exceptional results for businesses worldwide.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission, Vision, Values Tabs */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Foundation</h2>
                        <p className="text-lg text-gray-600">The principles that guide everything we do</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-100 rounded-lg p-1 flex">
                            {['mission', 'vision', 'values'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
                        {activeTab === 'mission' && (
                            <div className="text-center">
                                <FiTarget className="w-16 h-16 text-primary-600 mx-auto mb-6" />
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
                                <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                                    To democratize access to professional services by connecting businesses with
                                    talented freelancers worldwide, while empowering creators with AI-powered tools
                                    that enhance productivity and unleash creative potential.
                                </p>
                            </div>
                        )}

                        {activeTab === 'vision' && (
                            <div className="text-center">
                                <FiGlobe className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h3>
                                <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                                    To become the world's leading platform where human creativity meets artificial
                                    intelligence, creating unlimited opportunities for businesses to grow and
                                    freelancers to thrive in the digital economy.
                                </p>
                            </div>
                        )}

                        {activeTab === 'values' && (
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {values.map((value, index) => (
                                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                            <value.icon className="w-8 h-8 text-primary-600 mb-4" />
                                            <h4 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h4>
                                            <p className="text-gray-600">{value.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Founded in 2020, our platform emerged from a simple observation: businesses
                                    struggled to find quality freelance talent, while skilled professionals
                                    couldn't easily showcase their abilities to the right clients.
                                </p>
                                <p>
                                    We set out to bridge this gap by creating a trusted marketplace that prioritizes
                                    quality, security, and user experience. Our breakthrough came with the integration
                                    of AI-powered asset generation, allowing users to create professional designs
                                    instantly while still connecting with human talent for complex projects.
                                </p>
                                <p>
                                    Today, we've grown into a thriving community of over 3 million users, facilitating
                                    millions of successful projects and generating over 15 million AI assets. But
                                    we're just getting started.
                                </p>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                    <div className="text-2xl font-bold text-primary-600">2020</div>
                                    <div className="text-sm text-gray-600">Platform Founded</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                    <div className="text-2xl font-bold text-green-600">2022</div>
                                    <div className="text-sm text-gray-600">AI Generator Launched</div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:pl-8">
                            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">What Sets Us Apart</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <FiCheck className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold text-gray-900">AI-Powered Innovation</div>
                                            <div className="text-sm text-gray-600">First marketplace to integrate advanced AI asset generation</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <FiCheck className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Vetted Professionals</div>
                                            <div className="text-sm text-gray-600">Rigorous screening process ensures quality talent</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <FiCheck className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Secure Payments</div>
                                            <div className="text-sm text-gray-600">Escrow system protects both clients and freelancers</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <FiCheck className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold text-gray-900">24/7 Support</div>
                                            <div className="text-sm text-gray-600">Round-the-clock assistance for our global community</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
                        <p className="text-lg text-gray-600">The passionate people building the future of freelance work</p>
                    </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
  {teamMembers.map((member, index) => (
    <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
      <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden">
        <Image 
          src={member.image} 
          alt={member.name}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
      <div className="text-primary-600 font-medium mb-3">{member.role}</div>
      <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
    </div>
  ))}
</div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to Join Our Community?</h2>
                    <p className="text-xl text-primary-100 mb-8">
                        Whether you're a business looking for talent or a freelancer ready to showcase your skills,
                        we're here to help you succeed.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="bg-transparent border-2 border-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center
              shadow-md
              "            >
                            Get Started Today
                        </Link>
                        <Link
                            href="/generate-assets"
                            className="bg-transparent border-2 border-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center
              shadow-md
              "
                        >
                            <FiZap className="mr-2" />
                            Try AI Generator
                        </Link>
                    </div>
                </div>
            </section>
            <Footer/>
        </div>
    );
};

export default AboutUsPage;