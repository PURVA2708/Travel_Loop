import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      if (res.data.success && res.data.data) {
        setAuth(res.data.data);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'user' | 'admin') => {
    if (role === 'user') {
      setEmail('alex@globetrotter.com');
      setPassword('Password123!');
    } else {
      setEmail('admin@globetrotter.com');
      setPassword('Password123!');
    }
  };

  return (
    <Card className="shadow-modal">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-ink tracking-tight">Welcome back</h2>
        <p className="text-xs text-ink-muted mt-1">
          Sign in to access your planned trips and saved wishlist
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-danger text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
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
          <div className="flex justify-end mt-1.5">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-ink-muted hover:text-brand-dark transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Helper */}
      <div className="mt-6 pt-4 border-t border-ink-border/20">
        <p className="text-[11px] font-semibold text-ink-muted text-center mb-2">
          ⚡ Quick Hackathon Demo Logins:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('user')}
            className="py-1.5 px-2 rounded-lg bg-surface border border-ink-border/30 hover:border-brand text-xs font-semibold text-ink transition-colors"
          >
            Demo User (Alex)
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="py-1.5 px-2 rounded-lg bg-surface border border-ink-border/30 hover:border-brand text-xs font-semibold text-ink transition-colors"
          >
            Admin (Sarah)
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
