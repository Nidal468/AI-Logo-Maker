import SignupForm from '@/components/auth/SignupForm';

export const metadata = {
  title: 'Sign Up - Freelance Marketplace',
  description: 'Create a new account',
};

export default function SignupPage() {
  return (


        <div className="min-h-screen">
       <SignupForm />
    </div>
  );
}