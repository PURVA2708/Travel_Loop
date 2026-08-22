import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/signup', {
        name,
        email,
        password,
      });
      if (res.data.success && res.data.data) {
        setAuth(res.data.data);
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-modal">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-ink tracking-tight">Create an account</h2>
        <p className="text-xs text-ink-muted mt-1">
          Join GlobeTrotter to discover destinations & create itineraries
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
          label="Full Name"
          type="text"
          placeholder="Maya Lin"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="maya@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 6 characters"
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

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Create Free Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-ink-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-ink hover:text-brand-dark transition-colors">
          Sign in
        </Link>
      </div>
    </Card>
  );
};
