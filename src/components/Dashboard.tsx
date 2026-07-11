import { useState, useEffect } from 'react';
import { Report, User as UserType } from '../types';
import {
  User, Play, Briefcase, Award, Clock, FileText, ArrowRight, BookOpen,
  AlertCircle, Sparkles, TrendingUp, BarChart2, Star, Filter, ArrowUpDown, ChevronRight, Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface DashboardProps {
  token: string;
  user: UserType;
  onRefreshUser: () => void;
  onStartSession: (type: 'hr' | 'technical' | 'aptitude', jobRole: string) => void;
  onViewReport: (report: Report) => void;
}

export default function Dashboard({ token, user, onRefreshUser, onStartSession, onViewReport }: DashboardProps) {
  const [selectedType, setSelectedType] = useState<'hr' | 'technical' | 'aptitude'>('technical');
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDashboardTab, setActiveDashboardTab] = useState<'setup' | 'history'>('setup');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showTechnicalTrend, setShowTechnicalTrend] = useState(false);
  const [showCommunicationTrend, setShowCommunicationTrend] = useState(false);
  const [showGrammarTrend, setShowGrammarTrend] = useState(false);
  const [showConfidenceTrend, setShowConfidenceTrend] = useState(false);

  const jobRoles = [
    'Software Engineer',
    'Data Analyst',
    'AI/ML Engineer'
  ];

  const interviewTypes = [
    {
      id: 'technical',
      title: 'Technical Interview',
      desc: 'Coding models, architectural principles, databases, and core language structures.',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700',
      accent: 'blue'
    },
    {
      id: 'hr',
      title: 'HR & Behavioral',
      desc: 'Assess situational judgement, professional goals, cultural fit, and communication depth.',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      accent: 'slate'
    },
    {
      id: 'aptitude',
      title: 'Aptitude & Logic',
      desc: 'Analytical deduction, mathematical riddles, and logical algorithmic puzzles.',
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-100',
      text: 'text-indigo-700',
      accent: 'indigo'
    }
  ];

  useEffect(() => {
    fetchHistory();
    onRefreshUser();
  }, [token]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load interview history.');
      const data = await res.json();
      setReports(data.sort((a: Report, b: Report) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStreakCard = () => {
    const currentStreak = user?.currentStreak || 0;
    const longestStreak = user?.longestStreak || 0;
    const activityDates = user?.activityDates || [];

    // Generate the last 7 days (including today) to show a calendar strip
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString(undefined, { weekday: 'narrow' }); // e.g., 'M', 'T', 'W'...
      const dayNum = d.getDate();
      const isActive = activityDates.includes(dateStr);
      last7Days.push({ dateStr, dayName, dayNum, isActive });
    }

    // Milestones definition
    const milestones = [
      { days: 1, name: "Novice Preparer", icon: "🎓", desc: "Started the journey" },
      { days: 3, name: "Consistency Champ", icon: "🌟", desc: "3 days of preparation" },
      { days: 7, name: "Interview Warrior", icon: "🔥", desc: "7 days of preparation" },
      { days: 14, name: "Unstoppable Mindset", icon: "👑", desc: "14 days of preparation" }
    ];

    return (
      <div id="streak-card" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <Zap size={18} className="fill-orange-500 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">Practice Streak</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">Daily Motivation</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-display text-orange-600">{currentStreak}</span>
            <span className="text-xs text-slate-400 font-bold ml-1">days</span>
          </div>
        </div>

        {/* Calendar Grid representing the last 7 days */}
        <div className="mb-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2.5">Weekly Tracker</p>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {last7Days.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-slate-400 mb-1">{day.dayName}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    day.isActive
                      ? 'bg-orange-500 text-white shadow-sm ring-4 ring-orange-50'
                      : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
                  }`}
                  title={day.isActive ? `Active on ${day.dateStr}` : `Inactive on ${day.dateStr}`}
                >
                  {day.isActive ? (
                    <Zap size={10} className="fill-white" />
                  ) : (
                    day.dayNum
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Badges list */}
        <div className="border-t border-slate-100 pt-4 mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2.5">Unlocked Badges</p>
          <div className="grid grid-cols-2 gap-2">
            {milestones.map((m, idx) => {
              const isUnlocked = currentStreak >= m.days || longestStreak >= m.days;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isUnlocked
                      ? 'bg-orange-50/40 border-orange-200 text-orange-950 shadow-2xs'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="text-xl block mb-1">{m.icon}</span>
                  <span className="text-[10px] font-bold block leading-tight">{m.name}</span>
                  <span className="text-[8px] text-slate-500 font-medium mt-0.5 block">{m.days} Day {m.days === 1 ? 'Streak' : 'Goal'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak Stats (Longest Streak, Next Target) */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            <span>Longest Streak:</span>
            <span className="font-bold text-slate-800 ml-1">{longestStreak} days</span>
          </div>
          <div className="text-slate-400 font-medium">
            {currentStreak === 0 ? (
              <span>Practice today!</span>
            ) : (
              <span>Keep it up! 🔥</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const averageScore = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length)
    : 0;

  return (
    <div id="dashboard-container" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Hero Welcome / Summary row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-10">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} className="animate-pulse" />
              Practice Environment Is Ready
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              Elevate Your Interview Performance
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              Conduct high-fidelity mock interviews, record answers via voice, and receive instant, state-of-the-art grading reports across Technical Depth, Grammar, and Confidence.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Briefcase size={14} />
              AI Adaptive Questioning Active
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Award size={14} />
              Gemini Evaluation Connected
            </div>
          </div>
        </div>

        {/* Global stats widget */}
        <div className="rounded-2xl bg-blue-950 text-white p-6 flex flex-col justify-between shadow-xl shadow-blue-950/10 border border-blue-900/40">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">Your Progression</p>
            <h2 className="font-display text-lg font-semibold mt-1">Practice Scorecard</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="border-r border-slate-800 pr-4">
              <p className="text-[10px] font-semibold text-blue-400 uppercase">Sessions Completed</p>
              <p className="text-3xl font-display font-bold mt-1 text-slate-50">{reports.length}</p>
            </div>
            <div className="pl-2">
              <p className="text-[10px] font-semibold text-blue-400 uppercase">Average Grade</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <p className="text-3xl font-display font-bold text-slate-50">{averageScore}</p>
                <span className="text-xs text-blue-400 font-semibold">/100</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-300 border-t border-slate-800 pt-3">
            {reports.length > 0 
              ? 'Excellent progress! Try taking another role-specific technical test.' 
              : 'Complete your first interview to begin mapping your progress.'}
          </div>
        </div>
      </div>

      {/* Analytics Calculations */}
      {(() => {
        const totalReports = reports.length;
        const avgTech = totalReports > 0 ? Math.round(reports.reduce((sum, r) => sum + (r.technicalScore ?? 0), 0) / totalReports) : 0;
        const avgComm = totalReports > 0 ? Math.round(reports.reduce((sum, r) => sum + (r.communicationScore ?? 0), 0) / totalReports) : 0;
        const avgGrammar = totalReports > 0 ? Math.round(reports.reduce((sum, r) => sum + (r.grammarScore ?? 0), 0) / totalReports) : 0;
        const avgConf = totalReports > 0 ? Math.round(reports.reduce((sum, r) => sum + (r.confidenceScore ?? 0), 0) / totalReports) : 0;
        const avgKeywords = totalReports > 0 ? Math.round(reports.reduce((sum, r) => sum + (r.keywordMatchScore ?? 0), 0) / totalReports) : 0;

        const highestScore = totalReports > 0 ? Math.max(...reports.map(r => r.overallScore)) : 0;

        const chartData = [...reports]
          .reverse()
          .map((r, i) => ({
            index: i + 1,
            name: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: r.overallScore,
            technical: r.technicalScore ?? 0,
            communication: r.communicationScore ?? 0,
            grammar: r.grammarScore ?? 0,
            confidence: r.confidenceScore ?? 0,
            role: r.jobRole,
          }));

        const filteredReports = reports.filter(r => {
          const matchRole = filterRole === 'all' || r.jobRole === filterRole;
          const matchType = filterType === 'all' || r.type === filterType;
          return matchRole && matchType;
        }).sort((a, b) => {
          if (sortBy === 'newest') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (sortBy === 'oldest') {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          if (sortBy === 'highest') {
            return b.overallScore - a.overallScore;
          }
          if (sortBy === 'lowest') {
            return a.overallScore - b.overallScore;
          }
          return 0;
        });

        return (
          <>
            {/* Dashboard Tabs */}
            <div className="flex border-b border-slate-200 mb-8">
              <button
                id="btn-tab-setup"
                type="button"
                onClick={() => setActiveDashboardTab('setup')}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all cursor-pointer ${
                  activeDashboardTab === 'setup'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Play size={15} />
                Simulator Setup
              </button>
              <button
                id="btn-tab-history"
                type="button"
                onClick={() => setActiveDashboardTab('history')}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all cursor-pointer ${
                  activeDashboardTab === 'history'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock size={15} />
                Session History
                {reports.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full font-bold">
                    {reports.length}
                  </span>
                )}
              </button>
            </div>

            {activeDashboardTab === 'setup' ? (
              /* Configuration & Setup */
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main interactive mock builder */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                    <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 mb-5">
                      1. Setup Your Mock Session
                    </h2>

                    {/* Selector for Job Roles */}
                    <div className="mb-6">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Target Job Role</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {jobRoles.map((role) => (
                          <button
                            id={`btn-role-select-${role.replace(/\s+/g, '-').toLowerCase()}`}
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                              selectedRole === role
                                ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-100'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <span className={`text-xs font-semibold ${selectedRole === role ? 'text-blue-700' : 'text-slate-500'}`}>
                              Target Role
                            </span>
                            <span className="text-sm font-bold text-slate-900 mt-1">{role}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selector for Interview Types */}
                    <div className="mb-8">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Interview Category</label>
                      <div className="grid grid-cols-1 gap-4">
                        {interviewTypes.map((type) => (
                          <button
                            id={`btn-type-select-${type.id}`}
                            key={type.id}
                            type="button"
                            onClick={() => setSelectedType(type.id as any)}
                            className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                              selectedType === type.id
                                ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-100'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                              selectedType === type.id ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {type.id[0].toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{type.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{type.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Launch Action */}
                    <button
                      id="btn-launch-interview"
                      type="button"
                      onClick={() => onStartSession(selectedType, selectedRole)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 text-sm shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all cursor-pointer"
                    >
                      <Play size={16} fill="white" />
                      Begin {selectedRole} Mock Session
                    </button>
                  </div>
                </div>

                {/* Historical Session Sidebar */}
                <div className="space-y-6">
                  {renderStreakCard()}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                    <h3 className="font-display text-md font-bold text-slate-900 flex items-center gap-2 mb-4">
                      <Clock size={16} className="text-slate-400" />
                      Interview History
                    </h3>

                    {loading ? (
                      <div className="flex justify-center py-10">
                        <span className="text-sm text-slate-400 font-medium">Loading session history...</span>
                      </div>
                    ) : error ? (
                      <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200/50">
                        <AlertCircle size={16} className="shrink-0" />
                        {error}
                      </div>
                    ) : reports.length === 0 ? (
                      <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200">
                        <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="text-xs font-semibold text-slate-700">No mock records found</p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Start an interview session above to get professional scorecard metrics.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                        {reports.map((report) => (
                          <div
                            id={`report-card-${report.id}`}
                            key={report.id}
                            className="group rounded-xl border border-slate-200 bg-white p-3.5 hover:border-blue-300 hover:shadow-sm hover:shadow-blue-50/30 transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 leading-none">{report.jobRole}</h4>
                                <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full mt-1.5 capitalize">
                                  {report.type}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="flex items-baseline justify-end gap-0.5 leading-none">
                                  <span className="text-sm font-bold text-slate-900">{report.overallScore}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">/100</span>
                                </div>
                                <span className="text-[9px] text-slate-400 font-medium block mt-1.5">
                                  {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>

                            <button
                              id={`btn-view-report-${report.id}`}
                              type="button"
                              onClick={() => onViewReport(report)}
                              className="flex w-full items-center justify-center gap-1 mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-slate-500 group-hover:text-blue-700 group-hover:border-blue-100 transition-colors cursor-pointer"
                            >
                              <BookOpen size={12} />
                              View Feedback Report
                              <ArrowRight size={10} className="ml-0.5 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Session History & Progression View */
              <div className="space-y-8">
                {reports.length === 0 ? (
                  <div className="text-center py-16 px-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
                    <Clock className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="font-display text-lg font-bold text-slate-900">No History Available</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                      Complete a structured mock interview in the simulator to unlock historical progression timelines, average skill charts, and overall scorecards.
                    </p>
                    <button
                      id="btn-history-empty-goto-setup"
                      type="button"
                      onClick={() => setActiveDashboardTab('setup')}
                      className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 text-xs shadow-md shadow-blue-200 transition-all cursor-pointer"
                    >
                      <Play size={12} />
                      Set Up Mock Session Now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column: Chart and Matched Interviews Log */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Score Progress Chart */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest block">Progression Map</span>
                            <h3 className="font-display text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                              <TrendingUp size={16} className="text-blue-500" />
                              Overall Score Trend Over Time
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-semibold text-slate-600">
                            <span>Highest Score achieved:</span>
                            <span className="text-blue-700 font-bold">{highestScore}/100</span>
                          </div>
                        </div>

                        {/* Interactive Metric Toggles */}
                        {chartData.length >= 2 && (
                          <div className="flex flex-wrap gap-2 mb-5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center px-2">Compare Skills:</span>
                            <button
                              id="btn-toggle-tech-trend"
                              type="button"
                              onClick={() => setShowTechnicalTrend(!showTechnicalTrend)}
                              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                showTechnicalTrend
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              Technical Depth
                            </button>
                            <button
                              id="btn-toggle-comm-trend"
                              type="button"
                              onClick={() => setShowCommunicationTrend(!showCommunicationTrend)}
                              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                showCommunicationTrend
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              Fluency & Delivery
                            </button>
                            <button
                              id="btn-toggle-grammar-trend"
                              type="button"
                              onClick={() => setShowGrammarTrend(!showGrammarTrend)}
                              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                showGrammarTrend
                                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              Grammar & Structure
                            </button>
                            <button
                              id="btn-toggle-conf-trend"
                              type="button"
                              onClick={() => setShowConfidenceTrend(!showConfidenceTrend)}
                              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                showConfidenceTrend
                                  ? 'bg-violet-50 border-violet-200 text-violet-700'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              Confidence Markers
                            </button>
                          </div>
                        )}

                        {chartData.length < 2 ? (
                          <div className="h-[240px] flex items-center justify-center border border-dashed border-slate-100 rounded-xl bg-slate-50/30 p-4 text-center">
                            <p className="text-xs text-slate-400 font-medium max-w-sm">
                              Only 1 interview completed. Graph visualization requires at least 2 sessions to map trendlines. Take another session to see progress!
                            </p>
                          </div>
                        ) : (
                          <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                                  labelStyle={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '11px', marginBottom: '4px' }}
                                  itemStyle={{ fontSize: '11px', padding: '1px 0', color: '#cbd5e1' }}
                                />
                                {chartData.length > 0 && (
                                  <Legend
                                    verticalAlign="top"
                                    height={36}
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#475569' }}
                                  />
                                )}
                                <Line
                                  type="monotone"
                                  dataKey="score"
                                  stroke="#2563eb"
                                  strokeWidth={3}
                                  dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4, fill: '#ffffff' }}
                                  activeDot={{ r: 6, strokeWidth: 0, fill: '#1d4ed8' }}
                                  name="Overall Score"
                                />
                                {showTechnicalTrend && (
                                  <Line
                                    type="monotone"
                                    dataKey="technical"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    dot={{ stroke: '#6366f1', strokeWidth: 1.5, r: 3, fill: '#ffffff' }}
                                    activeDot={{ r: 5 }}
                                    name="Technical Score"
                                  />
                                )}
                                {showCommunicationTrend && (
                                  <Line
                                    type="monotone"
                                    dataKey="communication"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    dot={{ stroke: '#10b981', strokeWidth: 1.5, r: 3, fill: '#ffffff' }}
                                    activeDot={{ r: 5 }}
                                    name="Fluency Score"
                                  />
                                )}
                                {showGrammarTrend && (
                                  <Line
                                    type="monotone"
                                    dataKey="grammar"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    dot={{ stroke: '#f59e0b', strokeWidth: 1.5, r: 3, fill: '#ffffff' }}
                                    activeDot={{ r: 5 }}
                                    name="Grammar Score"
                                  />
                                )}
                                {showConfidenceTrend && (
                                  <Line
                                    type="monotone"
                                    dataKey="confidence"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    dot={{ stroke: '#8b5cf6', strokeWidth: 1.5, r: 3, fill: '#ffffff' }}
                                    activeDot={{ r: 5 }}
                                    name="Confidence Score"
                                  />
                                )}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      {/* Log view with Filters and Search */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                        {/* Header and filters controls */}
                        <div className="border-b border-slate-100 pb-5 mb-6">
                          <h3 className="font-display text-base font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                            <BarChart2 size={16} className="text-blue-600" />
                            Session History & Report Cards
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Role Filter */}
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Filter by Role</label>
                              <div className="relative">
                                <select
                                  id="select-history-role"
                                  value={filterRole}
                                  onChange={(e) => setFilterRole(e.target.value)}
                                  className="w-full text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer"
                                >
                                  <option value="all">All Roles</option>
                                  {jobRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                                  <Filter size={12} />
                                </div>
                              </div>
                            </div>

                            {/* Category Filter */}
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Filter by Type</label>
                              <div className="relative">
                                <select
                                  id="select-history-type"
                                  value={filterType}
                                  onChange={(e) => setFilterType(e.target.value)}
                                  className="w-full text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer"
                                >
                                  <option value="all">All Categories</option>
                                  <option value="technical">Technical Round</option>
                                  <option value="hr">HR & Behavioral</option>
                                  <option value="aptitude">Aptitude & Logic</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                                  <Filter size={12} />
                                </div>
                              </div>
                            </div>

                            {/* Sort Selection */}
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Sort Sessions</label>
                              <div className="relative">
                                <select
                                  id="select-history-sort"
                                  value={sortBy}
                                  onChange={(e) => setSortBy(e.target.value)}
                                  className="w-full text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer"
                                >
                                  <option value="newest">Newest First</option>
                                  <option value="oldest">Oldest First</option>
                                  <option value="highest">Highest Score</option>
                                  <option value="lowest">Lowest Score</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                                  <ArrowUpDown size={12} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* List Area */}
                        {filteredReports.length === 0 ? (
                          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200">
                            <FileText className="mx-auto text-slate-300 mb-2" size={28} />
                            <p className="text-xs font-semibold text-slate-700">No records matched</p>
                            <p className="text-[11px] text-slate-400 mt-1">Adjust your filters to discover older session evaluations.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {filteredReports.map((report) => (
                              <div
                                key={report.id}
                                id={`history-report-card-${report.id}`}
                                className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                              >
                                <div className="space-y-1 text-left">
                                  <div className="flex flex-wrap gap-2 items-center">
                                    <h4 className="text-sm font-bold text-slate-900">{report.jobRole}</h4>
                                    <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
                                      {report.type}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">
                                    Taken on {new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </p>
                                  {report.answers && (
                                    <span className="text-[11px] text-slate-500 font-medium block">
                                      Completed {report.answers.length} dynamic questioning rounds.
                                    </span>
                                  )}
                                </div>

                                {/* Mini breakdowns */}
                                <div className="grid grid-cols-2 xs:grid-cols-4 gap-x-4 gap-y-1.5 py-1.5 px-3 bg-slate-50 rounded-xl border border-slate-100 max-w-sm w-full sm:w-auto">
                                  <div>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase block leading-none">Technical</span>
                                    <span className="text-xs font-bold text-slate-700">{report.technicalScore ?? 0}%</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase block leading-none">Grammar</span>
                                    <span className="text-xs font-bold text-slate-700">{report.grammarScore ?? 0}%</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase block leading-none">Fluency</span>
                                    <span className="text-xs font-bold text-slate-700">{report.communicationScore ?? 0}%</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase block leading-none">Confidence</span>
                                    <span className="text-xs font-bold text-slate-700">{report.confidenceScore ?? 0}%</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3.5 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-3.5 sm:pt-0">
                                  <div className="text-right">
                                    <div className="flex items-baseline justify-end gap-0.5 leading-none">
                                      <span className="text-base font-bold text-slate-900">{report.overallScore}</span>
                                      <span className="text-[10px] text-slate-400 font-semibold">/100</span>
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider block mt-1 px-1.5 py-0.5 rounded ${
                                      report.overallScore >= 85 ? 'text-blue-700 bg-blue-50' :
                                      report.overallScore >= 70 ? 'text-amber-700 bg-amber-50' :
                                      'text-rose-700 bg-rose-50'
                                    }`}>
                                      {report.overallScore >= 85 ? 'Excellent' :
                                       report.overallScore >= 70 ? 'Good' : 'Needs Review'}
                                    </span>
                                  </div>

                                  <button
                                    id={`btn-history-view-report-${report.id}`}
                                    type="button"
                                    onClick={() => onViewReport(report)}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-pointer shadow-2xs group-hover:border-blue-100"
                                    title="View Feedback Report"
                                  >
                                    <BookOpen size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Skill Average meters & Streaks */}
                    <div className="space-y-6">
                      {renderStreakCard()}
                      {/* Skill Breakdown */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                        <h3 className="font-display text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                          <Star size={16} className="text-amber-500" />
                          Average Skill Breakdown
                        </h3>

                        <div className="space-y-4">
                          {/* Skill meter 1 */}
                          <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-600">Technical Depth</span>
                              <span className="text-slate-900">{avgTech}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${avgTech}%` }} />
                            </div>
                          </div>

                          {/* Skill meter 2 */}
                          <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-600">Grammar & Structure</span>
                              <span className="text-slate-900">{avgGrammar}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${avgGrammar}%` }} />
                            </div>
                          </div>

                          {/* Skill meter 3 */}
                          <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-600">Fluency & Delivery</span>
                              <span className="text-slate-900">{avgComm}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${avgComm}%` }} />
                            </div>
                          </div>

                          {/* Skill meter 4 */}
                          <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-600">Confidence Markers</span>
                              <span className="text-slate-900">{avgConf}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${avgConf}%` }} />
                            </div>
                          </div>

                          {/* Skill meter 5 */}
                          <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-600">Keyword Alignment</span>
                              <span className="text-slate-900">{avgKeywords}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-slate-700 h-full rounded-full transition-all duration-500" style={{ width: `${avgKeywords}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Recommendation based on metrics */}
                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">Advisory</span>
                          <p className="text-[11px] text-slate-500 leading-relaxed text-left">
                            {avgTech < 80
                              ? "Your technical articulation could use some deeper keywords. Try completing technical round mock sessions."
                              : "Excellent technical depth. Keep testing other roles to extend structural flexibility."}
                          </p>
                        </div>
                      </div>

                      {/* Training Achievements / Stats card */}
                      <div className="rounded-2xl border border-slate-200 bg-blue-950 text-white p-6 shadow-xs relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-[0.05] pointer-events-none transform translate-y-4 translate-x-4">
                          <Zap size={200} />
                        </div>
                        <h3 className="font-display text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider">
                          Simulation Achievements
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-blue-200 mt-0.5">
                              <Zap size={15} />
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold block">Estimated Training Time</span>
                              <span className="text-[11px] text-slate-300 mt-0.5 block font-mono">{totalReports * 15} mins of heavy simulator active training.</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-blue-200 mt-0.5">
                              <Award size={15} />
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold block">Optimal Target Category</span>
                              <span className="text-[11px] text-slate-300 mt-0.5 block">
                                {reports.filter(r => r.overallScore >= 80).map(r => r.type).filter((v, i, self) => self.indexOf(v) === i).join(', ') || 'Evaluating...'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
