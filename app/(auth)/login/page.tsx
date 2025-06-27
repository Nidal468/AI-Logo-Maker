import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Login - Freelance Marketplace',
  description: 'Log in to your account and access your dashboard',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <LoginForm />
    </div>
  );
}