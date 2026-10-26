import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { UdaanLogo, IconArrowRight, IconClose } from '../components/brand/Icons';
import { Button } from '../components/ui/Button';

export const PublicLayout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-white font-sans selection:bg-forest selection:text-white flex flex-col">
      {/* Cinematic Top Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-charcoal-deep/95 backdrop-blur-md border-b border-white/10 shadow-cinematic py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between gap-6">
          {/* Brand Logos: Manipal University Jaipur + UDAAN */}
          <div className="flex items-center gap-4 lg:gap-5 flex-shrink-0">
            <a
              href="https://jaipur.manipal.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center opacity-90 hover:opacity-100 transition-opacity focus:outline-none"
              title="Manipal University Jaipur"
            >
              <img
                src="/muj_logo_transparent.png"
                alt="Manipal University Jaipur"
                className="h-7 lg:h-8 w-auto object-contain"
              />
            </a>
            <div className="h-5 w-px bg-white/20" />
            <Link to="/" className="focus:outline-none flex items-center">
              <UdaanLogo size={32} variant="cinematic" showTagline={false} />
            </Link>
          </div>

          {/* Center Navigation Links with balanced spacing */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9 text-sm font-medium text-white/75">
            <button
              onClick={() => scrollToSection('problem')}
              className="hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none"
            >
              The Challenge
            </button>
            <button
              onClick={() => scrollToSection('modules')}
              className="hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none"
            >
              Intelligence Modules
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('preview')}
              className="hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none"
            >
              Platform Preview
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3 lg:gap-4 flex-shrink-0">
            <Link
              to="/login"
              className="text-sm font-medium text-white/80 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Button
              size="sm"
              variant="saffron"
              rounded="full"
              onClick={() => navigate('/register')}
              icon={<IconArrowRight size={14} />}
              iconPosition="right"
              className="px-5 shadow-sm"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white/80 hover:text-white focus:outline-none p-2"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? (
              <IconClose size={24} />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-charcoal-deep border-b border-white/10 px-6 py-6 space-y-4">
            <button
              onClick={() => scrollToSection('problem')}
              className="block w-full text-left text-base text-white/80 hover:text-white py-1"
            >
              The Challenge
            </button>
            <button
              onClick={() => scrollToSection('modules')}
              className="block w-full text-left text-base text-white/80 hover:text-white py-1"
            >
              Intelligence Modules
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="block w-full text-left text-base text-white/80 hover:text-white py-1"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('preview')}
              className="block w-full text-left text-base text-white/80 hover:text-white py-1"
            >
              Platform Preview
            </button>
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <Link
                to="/login"
                className="w-full text-center text-sm font-medium text-white/90 py-2.5 rounded-lg border border-white/20"
              >
                Sign In
              </Link>
              <Button
                size="md"
                variant="saffron"
                className="w-full justify-center"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/register');
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Public Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-charcoal-deep border-t border-white/10 py-16 px-6 md:px-12 text-neutral-subtle">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <UdaanLogo size={34} variant="cinematic" showTagline={true} />
            <p className="text-sm text-neutral-subtle max-w-sm leading-relaxed mt-3">
              UDAAN (उड़ान) is an Indian-centric AI-powered career intelligence platform designed to help students and early-career professionals turn potential into progress.
            </p>
            <div className="pt-2 text-xs text-white/40">
              © {new Date().getFullYear()} UDAAN Career Technologies. Built for India's ambitious builders.
            </div>
          </div>

          <div>
            <h5 className="text-xs uppercase font-semibold text-white tracking-wider mb-4">
              Intelligence Modules
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/career" className="hover:text-white transition-colors">Career Intelligence</Link>
              </li>
              <li>
                <Link to="/skills" className="hover:text-white transition-colors">Skill Intelligence</Link>
              </li>
              <li>
                <Link to="/interviews" className="hover:text-white transition-colors">Interview Intelligence</Link>
              </li>
              <li>
                <Link to="/knowledge" className="hover:text-white transition-colors">Knowledge Intelligence</Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase font-semibold text-white tracking-wider mb-4">
              Architecture &amp; Data
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-white/70">Java 21 Spring Boot</span></li>
              <li><span className="text-white/70">MySQL 8.4 (20 Tables)</span></li>
              <li><span className="text-white/70">Groq LLM Acceleration</span></li>
              <li><span className="text-white/70">Deterministic Scoring</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase font-semibold text-white tracking-wider mb-4">
              Access
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Register Account</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Candidate Console</Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
