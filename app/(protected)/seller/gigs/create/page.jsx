import GigForm from '@/components/seller/GigForm';

export const metadata = {
  title: 'Create New Service - Freelance Marketplace',
  description: 'Create a new service to offer to clients.',
};

export default function CreateGigPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create a New Service</h1>
        <p className="text-gray-600 mt-1">
          Provide detailed information about the service you want to offer.
        </p>
      </div>
      
      <GigForm />
    </div>
  );
}