import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import {
  UdaanLogo,
  IconOverview,
  IconCareer,
  IconSkills,
  IconInterviews,
  IconKnowledge,
  IconProfile,
  IconHistory,
  IconSettings,
  IconSignOut,
  IconClose,
  IconRefresh,
} from '../components/brand/Icons';
import { Badge } from '../components/ui/Badge';

interface UserItem {
  id: number;
  name: string;
  email: string;
  targetRole: string;
}

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Dynamic user state synchronized with localStorage
  const [userId, setUserId] = useState(localStorage.getItem('udaan_user_id') || '3');
  const [userName, setUserName] = useState(localStorage.getItem('udaan_user_name') || 'Shaaz Adil');
  const [targetRole, setTargetRole] = useState(localStorage.getItem('udaan_target_role') || 'Full Stack Developer');

  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const syncUser = () => {
    setUserId(localStorage.getItem('udaan_user_id') || '3');
    setUserName(localStorage.getItem('udaan_user_name') || 'Shaaz Adil');
    setTargetRole(localStorage.getItem('udaan_target_role') || 'Full Stack Developer');
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('udaan_user_changed', syncUser);

    // Fetch all registered users for quick demo switching
    apiClient
      .get<UserItem[]>('/auth/users')
      .then((users) => setAllUsers(users))
      .catch((err) => console.error('Failed to load user list:', err));

    return () => window.removeEventListener('udaan_user_changed', syncUser);
  }, []);

  const handleSwitchUser = (user: UserItem) => {
    localStorage.setItem('udaan_user_id', String(user.id));
    localStorage.setItem('udaan_user_name', user.name);
    localStorage.setItem('udaan_user_email', user.email);
    localStorage.setItem('udaan_target_role', user.targetRole);
    window.dispatchEvent(new Event('udaan_user_changed'));
    setIsSwitcherOpen(false);
    window.location.reload();
  };

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: <IconOverview size={18} /> },
    { label: 'Career Intelligence', to: '/career', icon: <IconCareer size={18} /> },
    { label: 'Skill Intelligence', to: '/skills', icon: <IconSkills size={18} /> },
    { label: 'Interview Intelligence', to: '/interviews', icon: <IconInterviews size={18} /> },
    { label: 'Knowledge Intelligence', to: '/knowledge', icon: <IconKnowledge size={18} /> },
    { label: 'Career Profile', to: '/profile', icon: <IconProfile size={18} /> },
    { label: 'History & Insights', to: '/history', icon: <IconHistory size={18} /> },
    { label: 'Settings', to: '/settings', icon: <IconSettings size={18} /> },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('udaan_user_id');
    navigate('/login');
  };

  const currentNav = navItems.find((item) => location.pathname.startsWith(item.to));
  const currentTitle = currentNav ? currentNav.label : 'Candidate Console';

  return (
    <div className="min-h-screen bg-ivory text-charcoal font-sans flex antialiased">
      {/* =======================================================================
          SIDEBAR — PERSISTENT DESKTOP NAVIGATION
          Clean warm ivory / white surface, neutral border, forest-green indicator
          ======================================================================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-border flex-shrink-0 z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-border">
          <NavLink to="/dashboard" className="focus:outline-none">
            <UdaanLogo size={32} variant="dark" showTagline={true} />
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'bg-forest-surface text-forest font-semibold'
                    : 'text-neutral-muted hover:text-charcoal hover:bg-ivory-warm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex-shrink-0 ${
                      isActive ? 'text-forest' : 'text-neutral-muted'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-forest rounded-r" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card, Live Switcher & Sign Out */}
        <div className="p-4 border-t border-neutral-border bg-ivory/50 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-forest">
              Active Candidate ID #{userId}
            </span>
            {allUsers.length > 1 && (
              <button
                type="button"
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="text-[11px] text-forest font-semibold hover:underline flex items-center gap-1 focus:outline-none"
              >
                <IconRefresh size={11} /> Switch
              </button>
            )}
          </div>

          {/* Quick Account Switcher Popover */}
          {isSwitcherOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl border border-neutral-border shadow-elevated p-2 z-50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-muted px-2 py-1 block">
                MySQL Registered Users
              </span>
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUser(u)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    String(u.id) === String(userId)
                      ? 'bg-forest-surface text-forest font-bold'
                      : 'hover:bg-ivory text-charcoal'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-[10px] text-neutral-muted">{u.targetRole}</div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-muted">#{u.id}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
              {userName.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-charcoal truncate">
                {userName}
              </div>
              <div className="text-[11px] text-neutral-muted truncate">
                {targetRole}
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-status-error hover:bg-status-error-bg rounded-md transition-colors focus:outline-none"
          >
            <IconSignOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =======================================================================
          MOBILE DRAWER NAVIGATION
          ======================================================================= */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative w-72 bg-white flex flex-col h-full z-10 border-r border-neutral-border shadow-elevated">
            <div className="p-5 border-b border-neutral-border flex items-center justify-between">
              <UdaanLogo size={28} variant="dark" />
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="text-neutral-muted hover:text-charcoal p-1"
              >
                <IconClose size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-forest-surface text-forest font-semibold'
                        : 'text-neutral-muted hover:text-charcoal hover:bg-ivory-warm'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-neutral-border">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 text-xs text-status-error font-medium p-2 hover:bg-status-error-bg rounded"
              >
                <IconSignOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MAIN WORKSPACE & TOP BAR
          ======================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-neutral-border px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden text-neutral-muted hover:text-charcoal p-1 focus:outline-none"
              aria-label="Open navigation"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-semibold text-charcoal tracking-tight">
                {currentTitle}
              </h1>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-muted">
                <span>UDAAN Console</span>
                <span>/</span>
                <span className="text-forest font-medium">{currentTitle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="forest" size="sm" icon={<span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />}>
              MySQL 8.4 Connected
            </Badge>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-border">
              <span className="text-xs font-semibold text-charcoal bg-forest-surface px-2.5 py-1 rounded-md border border-forest/20">
                {userName} · {targetRole}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
