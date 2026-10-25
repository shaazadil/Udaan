import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UdaanLogo,
  IconArrowRight,
  IconCheck,
} from '../../components/brand/Icons';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await apiClient.post<any>('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        targetRole: targetRole.trim(),
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
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-ivory font-sans">
      {/* Left Editorial Panel */}
      <div className="lg:col-span-5 bg-gradient-to-b from-charcoal-deep via-forest-dark to-charcoal p-8 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
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

        <div className="relative z-10 my-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-saffron mb-3 block">
            Begin Your Career Flight
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight mb-4">
            Turn Potential Into Progress.
          </h2>
          <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md">
            Join hundreds of ambitious engineers aligning their skills with high-growth tech opportunities across India and globally.
          </p>

          <div className="mt-6 space-y-2.5 pt-6 border-t border-white/10 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-saffron"><IconCheck size={14} /></span>
              <span>100% Free for academic and personal career prep</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-saffron"><IconCheck size={14} /></span>
              <span>Personalized Groq LLM study roadmaps</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-saffron"><IconCheck size={14} /></span>
              <span>Live relational storage in MySQL 8.4</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/40">
          UDAAN Platform · India-First Career Intelligence
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-serif font-bold text-charcoal">
              Create your account.
            </h1>
            <p className="text-sm text-neutral-muted mt-1">
              Start building your verified career profile today.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-status-error-bg text-status-error border border-status-error/20 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              required
            />

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav@example.com"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-white text-charcoal text-sm rounded-lg border border-neutral-border px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
              >
                <option value="Senior Backend Engineer">Senior Backend Engineer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Data Engineer">Data Engineer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="DevOps / Cloud Engineer">DevOps / Cloud Engineer</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full justify-center mt-2 shadow-subtle"
              icon={<IconArrowRight size={16} />}
              iconPosition="right"
            >
              Get Started with UDAAN
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-border text-center text-xs text-neutral-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-forest hover:text-forest-deep transition-colors"
            >
              Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
