import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';

interface LoginSignupProps {
  onAuthSuccess: (user: User, token: string) => void;
}

export default function LoginSignup({ onAuthSuccess }: LoginSignupProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin 
      ? { email, password }
      : { username, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type: 'candidate' | 'admin') => {
    if (type === 'candidate') {
      setEmail('user@interviewprep.com');
      setPassword('password');
      setIsLogin(true);
    } else {
      setEmail('admin@interviewprep.com');
      setPassword('password');
      setIsLogin(true);
    }
  };

  return (
    <div id="login-container" className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 animate-fade-in">
        {/* Logo and Greeting */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <span className="font-display text-2xl font-bold">i</span>
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {isLogin ? 'Sign in to practice mock interviews' : 'Get started with personalized interview coaching'}
          </p>
        </div>

        {/* Demo Fast Logins */}
        <div className="mt-6 rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Test Accounts</p>
          <div className="flex gap-2 justify-center">
            <button
              id="btn-fast-user"
              type="button"
              onClick={() => fillCredentials('candidate')}
              className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/50 px-2.5 py-1 rounded-md transition-colors"
            >
              Candidate Login
            </button>
            <button
              id="btn-fast-admin"
              type="button"
              onClick={() => fillCredentials('admin')}
              className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 px-2.5 py-1 rounded-md transition-colors"
            >
              Admin Login
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div id="auth-error-alert" className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200/50">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <UserIcon size={16} />
                </span>
                <input
                  id="input-username"
                  type="text"
                  required
                  placeholder="john_doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                id="input-email"
                type="email"
                required
                placeholder="example@interviewprep.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                id="input-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-sm shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-300/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle link */}
        <p className="mt-6 text-center text-xs text-slate-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            id="btn-auth-toggle"
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-blue-600 hover:text-blue-700 underline focus:outline-none cursor-pointer"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}
