import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@globetrotter.app');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const authData = res.data.data || res.data;
      if (authData) {
        setAuth(authData);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'user' | 'admin') => {
    if (role === 'user') {
      setEmail('demo@globetrotter.app');
      setPassword('password123');
    } else {
      setEmail('admin@globetrotter.com');
      setPassword('password123');
    }
  };

  return (
    <Card className="shadow-modal">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">Welcome back</h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          Sign in to access your trips, multi-city itineraries, and budget tracking.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs font-medium text-danger animate-in fade-in">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none hover:text-ink"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <div className="mt-1.5 flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-ink-muted hover:text-brand-dark transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" className="mt-2 w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Helper */}
      <div className="mt-6 border-t border-ink-border/20 pt-4">
        <p className="mb-2 flex items-center justify-center gap-1 text-center text-[11px] font-semibold text-ink-muted">
          <Zap className="h-3 w-3" /> Quick Demo Logins:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('user')}
            className="rounded-lg border border-ink-border/30 bg-surface px-2 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand"
          >
            Demo Traveler
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="rounded-lg border border-ink-border/30 bg-surface px-2 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand"
          >
            Admin Sarah
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-ink-muted">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-bold text-ink hover:text-brand-dark transition-colors">
          Sign up now
        </Link>
      </div>
    </Card>
  );
};

export default LoginPage;
