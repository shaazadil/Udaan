import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import {
  UdaanLogo,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconCheck,
} from '../../components/brand/Icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('shaaz.adil@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMsg, setForgotMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await apiClient.post<any>('/auth/login', {
        email: email.trim(),
        password,
      });

      localStorage.setItem('udaan_user_id', String(user.id));
      localStorage.setItem('udaan_user_name', user.name);
      localStorage.setItem('udaan_user_email', user.email);
      localStorage.setItem('udaan_target_role', user.targetRole);
      window.dispatchEvent(new Event('udaan_user_changed'));

      navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Authentication failed. Please verify your credentials or register a new account.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-ivory font-sans">
      {/* Left Editorial Panel */}
      <div className="lg:col-span-5 bg-gradient-to-b from-charcoal-deep via-forest-dark to-charcoal p-8 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Subtle geometric line grid accent */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(#F8F7F3 1px, transparent 1px), linear-gradient(90deg, #F8F7F3 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <Link to="/" className="inline-block focus:outline-none">
            <UdaanLogo size={36} variant="cinematic" showTagline={false} />
          </Link>
        </div>

        <div className="relative z-10 my-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-saffron mb-3 block">
            Welcome Back
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight mb-4">
            Every next chapter starts with a step.
          </h2>
          <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md">
            Pick up where you left off. Your skills, learning journey, interview history, and career progress are waiting for you.
          </p>

          <div className="mt-8 space-y-3 pt-6 border-t border-white/10 text-xs text-white/80">
            <div className="flex items-center gap-2.5">
              <span className="text-saffron"><IconCheck size={14} /></span>
              <span>Deterministic skill matching &amp; gap identification</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-saffron"><IconCheck size={14} /></span>
              <span>Groq AI accelerated mock interview evaluations</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-saffron"><IconCheck size={14} /></span>
              <span>Grounded knowledge library with MySQL persistence</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/40">
          UDAAN Platform · Turn Potential Into Progress
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-serif font-bold text-charcoal">
              Welcome back.
            </h1>
            <p className="text-sm text-neutral-muted mt-1">
              Sign in to continue your career development journey.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-status-error-bg text-status-error border border-status-error/20 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {forgotMsg && (
            <div className="mb-6 p-3.5 rounded-lg bg-status-info-bg text-status-info border border-status-info/20 text-xs leading-relaxed">
              Password reset via email is currently under campus server configuration. Please sign in with sample user: <strong>aarav.sharma@example.com</strong>.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMsg(true)}
                  className="text-xs text-forest hover:text-forest-deep transition-colors focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white text-charcoal placeholder:text-neutral-muted/70 text-sm rounded-lg border border-neutral-border px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-charcoal focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full justify-center shadow-subtle"
              icon={<IconArrowRight size={16} />}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-border text-center text-xs text-neutral-muted">
            New to UDAAN?{' '}
            <Link
              to="/register"
              className="font-semibold text-forest hover:text-forest-deep transition-colors"
            >
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
