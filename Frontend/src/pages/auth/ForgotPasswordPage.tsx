import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <Card className="shadow-modal">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-ink tracking-tight">Reset Password</h2>
        <p className="text-xs text-ink-muted mt-1">
          Enter your email and we&apos;ll send you instructions to reset your password
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-4 space-y-3 animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-ink">Check your inbox</p>
          <p className="text-xs text-ink-muted">
            If an account exists for <span className="font-bold text-ink">{email}</span>, you will receive password reset instructions.
          </p>
          <Link to="/login" className="inline-block mt-4">
            <Button variant="secondary" size="sm" pill leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
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

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Send Reset Link
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </Card>
  );
};
