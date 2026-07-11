import { User } from '../types';
import { LogOut, User as UserIcon, Shield, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ user, onLogout, activeTab, setActiveTab }: NavbarProps) {
  if (!user) return null;

  return (
    <nav id="navbar-container" className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-200">
              <div className="w-3.5 h-3.5 bg-white rounded-sm"></div>
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-slate-800 block leading-none">
                PrepCoach <span className="text-blue-600 font-medium text-sm">AI</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mt-0.5">
                AI Interview System
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-6">
            <button
              id="btn-nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>

            {user.role === 'admin' && (
              <button
                id="btn-nav-admin"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'text-indigo-700 bg-indigo-50/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Shield size={16} />
                Admin Panel
              </button>
            )}

            {/* Profile Dropdown & Logout */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <UserIcon size={16} />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-none mb-0.5">{user.username}</p>
                  <p className="text-[10px] font-medium text-slate-500 leading-none capitalize">{user.role}</p>
                </div>
              </div>

              <button
                id="btn-nav-logout"
                onClick={onLogout}
                title="Logout"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
