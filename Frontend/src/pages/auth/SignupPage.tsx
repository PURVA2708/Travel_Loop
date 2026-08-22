import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signupRequest } from '@/features/auth/api';
import { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { user, accessToken } = await signupRequest({ name, email, password });
      setSession(accessToken, user);
      navigate('/trips');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Signup failed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-surface-white p-8 shadow-md">
        <h1 className="font-display text-2xl font-extrabold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink/60">Start planning your first GlobeTrotter trip.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
