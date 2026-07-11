import { useState, useEffect } from 'react';
import { User, InterviewSession as SessionType, Report } from './types';
import Navbar from './components/Navbar';
import LoginSignup from './components/LoginSignup';
import Dashboard from './components/Dashboard';
import InterviewSession from './components/InterviewSession';
import PerformanceReport from './components/PerformanceReport';
import AdminDashboard from './components/AdminDashboard';
import { Shield, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Routing navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeSession, setActiveSession] = useState<SessionType | null>(null);
  const [activeReport, setActiveReport] = useState<Report | null>(null);

  // Restore authenticated session on page load
  useEffect(() => {
    restoreSession();
  }, []);

  const clearStoredSession = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const restoreSession = async () => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUserRaw = localStorage.getItem('auth_user');

    if (!storedToken) {
      setLoading(false);
      return;
    }

    let storedUser: User | null = null;
    if (storedUserRaw) {
      try {
        storedUser = JSON.parse(storedUserRaw) as User;
        setUser(storedUser);
        setToken(storedToken);
      } catch {
        clearStoredSession();
      }
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        const restoredUser = data.user as User;
        setUser(restoredUser);
        setToken(storedToken);
        localStorage.setItem('auth_user', JSON.stringify(restoredUser));
      } else {
        // Stale or invalid token
        clearStoredSession();
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('[App] Failed to restore session:', err);
      if (!storedUser) {
        clearStoredSession();
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (authUser: User, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    clearStoredSession();
    setActiveSession(null);
    setActiveReport(null);
    setActiveTab('dashboard');
  };

  const handleStartSession = async (type: 'hr' | 'technical' | 'aptitude', jobRole: string) => {
    setError('');
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, jobRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start interview session.');

      setActiveSession(data);
      setActiveTab('interview');
    } catch (err: any) {
      setError(err.message || 'Error starting session');
    }
  };

  const handleSessionComplete = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/session/${activeSession?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to retrieve report scorecard.');

      setActiveReport(data);
      setActiveSession(null);
      setActiveTab('report');
    } catch (err: any) {
      console.error('[App] Failed to fetch report details:', err);
      setActiveTab('dashboard');
    }
  };

  const handleViewReport = (report: Report) => {
    setActiveReport(report);
    setActiveTab('report');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600 mb-3" size={32} />
        <span className="text-sm text-slate-500 font-semibold">Restoring session parameters...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation bar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActiveSession(null);
          setActiveReport(null);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 w-full">
        {error && (
          <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className="flex gap-2 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-200/50">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Content routing panels */}
        {!user ? (
          <LoginSignup onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                token={token!}
                user={user}
                onRefreshUser={restoreSession}
                onStartSession={handleStartSession}
                onViewReport={handleViewReport}
              />
            )}

            {activeTab === 'admin' && user.role === 'admin' && (
              <AdminDashboard token={token!} />
            )}

            {activeTab === 'interview' && activeSession && (
              <InterviewSession
                token={token!}
                session={activeSession}
                onSessionComplete={handleSessionComplete}
                onExit={() => {
                  setActiveSession(null);
                  setActiveTab('dashboard');
                }}
              />
            )}

            {activeTab === 'report' && activeReport && (
              <PerformanceReport
                report={activeReport}
                onRestart={() => {
                  setActiveReport(null);
                  setActiveTab('dashboard');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer block (No margin telemetry / status indicator clutter) */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400 print:hidden mt-auto">
        <p>© 2026 PrepCoach Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}
