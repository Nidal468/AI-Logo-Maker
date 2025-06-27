'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiCalendar, 
  FiCheck, 
  FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import Cal, { getCalApi } from '@calcom/embed-react';

// Main BookingSystem component
export default function BookingSystem() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // Updated services for design and marketplace offerings
  const services = [
    {
      id: 'logo-design',
      name: 'Logo Design',
      description: 'Custom logo design for your brand with multiple revisions and concepts',
      price: 75,
      duration: '30 min',
      calLink: 'usman-pervaiz-szc11q/30min'
    },
    {
      id: 'marketplace-setup',
      name: 'Marketplace Setup Help',
      description: 'Expert guidance on setting up your seller or buyer account on our marketplace',
      price: 60,
      duration: '30 min',
      calLink: 'usman-pervaiz-szc11q/30min'
    },
    {
      id: 'ai-generation',
      name: 'AI Image Generation',
      description: 'Learn how to effectively use our AI tools to generate logos and brand assets',
      price: 100,
      duration: '30 min',
      calLink: 'usman-pervaiz-szc11q/30min'
    },
    {
      id: 'marketplace-strategy',
      name: 'Marketplace Success Strategy',
      description: 'Strategic planning to maximize your success as a seller on our platform',
      price: 85,
      duration: '30 min',
      calLink: 'usman-pervaiz-szc11q/30min'
    },
  ];

  // Initialize Cal.com booking widget with the official package
  useEffect(() => {
    (async function() {
      const cal = await getCalApi();
      cal("ui", { 
        styles: { 
          branding: { 
            brandColor: "#3182ce" 
          } 
        },
        hideEventTypeDetails: false,
        layout: "month_view",
        overlayCalendar: true
      });
    })();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle service selection
  const handleSelectService = (service) => {
    setSelectedService(service);
  };

  // Handle form submission - simplified for Cal.com integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push('/login?redirect=/booking');
      return;
    }
    
    if (selectedService && selectedService.calLink) {
      window.Cal("openModal", { calLink: selectedService.calLink });
    }
  };

  // Validate current step
  const isStepValid = () => {
    return !!selectedService;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Booking</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Schedule a session
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Book a design service or marketplace support session with our experts
          </p>
        </div>

        {/* Main content */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200">
          {/* Service Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Service</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${
                      selectedService?.id === service.id
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/30'
                    }
                  `}
                >
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-primary-600 font-semibold">${service.price}</span>
                    <span className="text-gray-500 text-sm">{service.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedService && (
              <div className="mt-8">
                <Cal
                  calLink={selectedService.calLink}
                  style={{ width: "100%", height: "100%", minHeight: "600px", overflow: "scroll" }}
                  config={{
                    layout: "month_view",
                    hideEventTypeDetails: false,
                    theme: "light",
                    overlayCalendar: true,
                    styles: { 
                      branding: { 
                        brandColor: "#3182ce" 
                      } 
                    }
                  }}
                />
              </div>
            )}

            {!selectedService && (
              <div className="mt-8 text-center text-gray-500 p-8 border border-dashed border-gray-300 rounded-md">
                <FiCalendar className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2">Select a service to view available booking times</p>
              </div>
            )}
          </div>

          {/* Success message */}
          {bookingSuccess && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FiCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Booking Successful!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your session has been booked. You'll receive a confirmation email shortly.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Redirecting to your bookings...
              </p>
            </div>
          )}
        </div>

        {/* Additional info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need to reschedule? You can manage your bookings from your account dashboard.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Have questions? Contact our support team at support@example.com
          </p>
        </div>
      </div>
    </div>
  );
}