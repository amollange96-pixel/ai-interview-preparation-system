import React, { useState, useEffect } from 'react';
import { Question, Report, User } from '../types';
import { Plus, Trash2, Edit2, Download, AlertCircle, CheckCircle, Shield, Users, BarChart3, BookOpen, Layers, Sparkles, Loader2, Save } from 'lucide-react';

interface AdminDashboardProps {
  token: string;
}

export default function AdminDashboard({ token }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'questions' | 'stats' | 'users'>('questions');
  
  // State for questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form states for creating/editing questions
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'hr' | 'technical' | 'aptitude'>('technical');
  const [qJobRole, setQJobRole] = useState('Software Engineer');
  const [qDifficulty, setQDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [qIdealAnswer, setQIdealAnswer] = useState('');
  const [qKeywordsStr, setQKeywordsStr] = useState('');

  // Stats / Reports state
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // UI feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQuestions();
    fetchStats();
    fetchReports();
    fetchUsers();
  }, [token]);

  // --- Fetch Methods ---
  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const res = await fetch('/api/questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setQuestions(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setReports(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      // Simulating retrieval or fetching from an admin list route
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      }); // Mock retrieving users from storage
      setUsers([
        { id: 'u1', username: 'candidate', email: 'user@interviewprep.com', role: 'user' },
        { id: 'u2', username: 'admin', email: 'admin@interviewprep.com', role: 'admin' }
      ]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // --- Question CRUD actions ---
  const handleAddOrUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const keywords = qKeywordsStr.split(',').map(k => k.trim()).filter(Boolean);
    const payload = {
      text: qText,
      type: qType,
      jobRole: qJobRole,
      difficulty: qDifficulty,
      idealAnswer: qIdealAnswer,
      keywords
    };

    const endpoint = editingQuestionId 
      ? `/api/admin/questions/${editingQuestionId}`
      : '/api/admin/questions';
    
    const method = editingQuestionId ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to persist question.');

      setSuccess(editingQuestionId ? 'Question updated successfully!' : 'New question added successfully!');
      resetQuestionForm();
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setQText(q.text);
    setQType(q.type);
    setQJobRole(q.jobRole);
    setQDifficulty(q.difficulty);
    setQIdealAnswer(q.idealAnswer);
    setQKeywordsStr(q.keywords.join(', '));
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove question.');

      setSuccess('Question deleted successfully!');
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setQText('');
    setQType('technical');
    setQJobRole('Software Engineer');
    setQDifficulty('medium');
    setQIdealAnswer('');
    setQKeywordsStr('');
    setShowAddForm(false);
  };

  // --- Export Reports list to CSV ---
  const handleExportCSV = () => {
    if (reports.length === 0) {
      alert('No sessions available to export.');
      return;
    }

    const headers = ['Report ID', 'Job Role', 'Category', 'Overall Score', 'Technical Score', 'Communication Score', 'Grammar Score', 'Confidence Score', 'Keyword Score', 'Created At'];
    const rows = reports.map(r => [
      r.id,
      `"${r.jobRole}"`,
      r.type,
      r.overallScore,
      r.technicalScore,
      r.communicationScore,
      r.grammarScore,
      r.confidenceScore,
      r.keywordMatchScore,
      r.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Global_Interview_Metrics_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="admin-container" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in text-left">
      {/* Header and statistics */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono flex items-center gap-1.5">
            <Shield size={14} />
            Administrator Workspace
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Platform Management
          </h1>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 mb-8 gap-4">
        {[
          { id: 'questions', label: 'Question Bank', icon: BookOpen },
          { id: 'stats', label: 'Analytics & Reports', icon: BarChart3 },
          { id: 'users', label: 'User Directory', icon: Users }
        ].map(tab => (
          <button
            id={`tab-admin-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 font-medium text-sm transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div id="admin-error-alert" className="mb-6 flex gap-2 rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-200/50">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div id="admin-success-alert" className="mb-6 flex gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-600 border border-emerald-200/50">
          <CheckCircle size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* QUESTION BANK TAB PANEL */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-md font-bold text-slate-900">Manage Practice Questions</h3>
            {!showAddForm && (
              <button
                id="btn-admin-add-question"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={14} />
                Add New Question
              </button>
            )}
          </div>

          {/* Form slide-over or collapsible box */}
          {showAddForm && (
            <form onSubmit={handleAddOrUpdateQuestion} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-display text-sm font-bold text-slate-900">
                  {editingQuestionId ? 'Modify Question Parameters' : 'Register New Mock Question'}
                </h4>
                <button
                  id="btn-admin-cancel-form"
                  type="button"
                  onClick={resetQuestionForm}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Job Role</label>
                  <select
                    id="select-form-jobrole"
                    value={qJobRole}
                    onChange={(e) => setQJobRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="AI/ML Engineer">AI/ML Engineer</option>
                    <option value="General">General / All roles</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Interview Type</label>
                  <select
                    id="select-form-type"
                    value={qType}
                    onChange={(e) => setQType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="technical">Technical</option>
                    <option value="hr">HR & Behavioral</option>
                    <option value="aptitude">Aptitude & Logic</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Difficulty Level</label>
                  <select
                    id="select-form-difficulty"
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Question Prompt Text</label>
                <input
                  id="input-form-text"
                  type="text"
                  required
                  placeholder="e.g., Explain the difference between synchronous and asynchronous code?"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Ideal Reference Answer</label>
                <textarea
                  id="input-form-idealanswer"
                  rows={3}
                  required
                  placeholder="Define technical concepts concisely. Mention core architectures, protocols, or structural models for Gemini's semantic similarity evaluation."
                  value={qIdealAnswer}
                  onChange={(e) => setQIdealAnswer(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Required Keywords (comma-separated)</label>
                <input
                  id="input-form-keywords"
                  type="text"
                  placeholder="e.g., event loop, non-blocking, callback, single-threaded"
                  value={qKeywordsStr}
                  onChange={(e) => setQKeywordsStr(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  id="btn-form-cancel"
                  type="button"
                  onClick={resetQuestionForm}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 font-bold bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-form-save"
                  type="submit"
                  className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs font-bold cursor-pointer"
                >
                  <Save size={12} />
                  {editingQuestionId ? 'Save Question' : 'Register Question'}
                </button>
              </div>
            </form>
          )}

          {/* List of current questions */}
          {loadingQuestions ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
              <Loader2 className="animate-spin text-slate-400 mx-auto" size={24} />
              <p className="text-xs text-slate-400 mt-2 font-medium">Retrieving questions...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  id={`admin-question-row-${q.id}`}
                  key={q.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1 pr-4 max-w-2xl">
                    <div className="flex flex-wrap gap-2.5 items-center">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {q.jobRole}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {q.type}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        q.difficulty === 'easy' ? 'bg-blue-50 text-blue-700' :
                        q.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">"{q.text}"</h4>
                    <p className="text-[10px] text-slate-500 italic max-w-xl truncate leading-normal">Ideal Answer: "{q.idealAnswer}"</p>
                    {q.keywords && q.keywords.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap pt-1">
                        {q.keywords.map(kw => (
                          <span key={kw} className="text-[9px] text-slate-400 border border-slate-200/60 bg-slate-50/50 px-1.5 py-0.2 rounded-md font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      id={`btn-admin-edit-q-${q.id}`}
                      onClick={() => startEditQuestion(q)}
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      id={`btn-admin-delete-q-${q.id}`}
                      onClick={() => handleDeleteQuestion(q.id)}
                      title="Delete"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS & GLOBAL REPORTS TAB PANEL */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          {/* Statistics summary row */}
          {loadingStats ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
              <Loader2 className="animate-spin text-slate-400 mx-auto" size={24} />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mock sessions executed</span>
                <span className="text-3xl font-display font-bold text-slate-900 block mt-1">{stats.totalSessions}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Global Average Score</span>
                <span className="text-3xl font-display font-bold text-slate-900 block mt-1">{stats.averageScore}%</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Active Roles</span>
                <span className="text-3xl font-display font-bold text-slate-900 block mt-1">{Object.keys(stats.sessionsByRole).length}</span>
              </div>
            </div>
          ) : null}

          {/* Table of all submitted reports */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex justify-between items-center">
              <h4 className="font-display text-sm font-bold text-slate-900">All Completed Interview Sessions</h4>
              <button
                id="btn-admin-export-csv"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                <Download size={12} />
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500 border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="px-4 py-3">Report ID</th>
                    <th className="px-4 py-3">Target Job Role</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Technical</th>
                    <th className="px-4 py-3">Delivery</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-normal">
                        No complete scorecard reports available.
                      </td>
                    </tr>
                  ) : (
                    reports.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">{r.id}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{r.jobRole}</td>
                        <td className="px-4 py-3 uppercase text-[10px] font-bold text-slate-500">{r.type}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{r.overallScore}%</td>
                        <td className="px-4 py-3">{r.technicalScore}%</td>
                        <td className="px-4 py-3">{r.communicationScore}%</td>
                        <td className="px-4 py-3 text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USER DIRECTORY TAB PANEL */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h3 className="font-display text-md font-bold text-slate-900">Platform User Directory</h3>

          {loadingUsers ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
              <Loader2 className="animate-spin text-slate-400 mx-auto" size={24} />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-500 border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Security Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/30">
                      <td className="px-4 py-3 font-mono font-bold text-slate-400">{u.id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{u.username}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
