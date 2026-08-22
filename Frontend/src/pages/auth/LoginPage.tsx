import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginRequest } from '@/features/auth/api';
import { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

/**
 * Minimal scaffold — Screen #1 is Person A's full ownership (forgot
 * password, signup, validation polish). This exists so Trips (Person B)
 * has a real JWT to develop and demo against.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('demo@globetrotter.app');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { user, accessToken } = await loginRequest({ email, password });
      setSession(accessToken, user);
      navigate('/trips');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-surface-white p-8 shadow-md">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Globe<span className="text-brand">Trotter</span>
        </h1>
        <p className="mt-1 text-sm text-ink/60">Log in to plan your next trip.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          New here?{' '}
          <Link to="/signup" className="font-semibold text-ink underline">
            Create an account
          </Link>
        </p>
        <p className="mt-3 rounded-md bg-surface px-3 py-2 text-center text-xs text-ink/50">
          Demo login is pre-filled — seeded via <code>npm run prisma:seed</code>.
        </p>
      </div>
    </div>
  );
}
