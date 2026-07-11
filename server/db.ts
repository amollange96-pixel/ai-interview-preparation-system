import fs from 'fs';
import path from 'path';
import { User, Question, InterviewSession, SessionAnswer, Report, DashboardStats } from '../src/types';
import { seedQuestions } from '../src/seedQuestions';

const DB_FILE = path.join(process.cwd(), 'database_storage.json');

interface DatabaseState {
  users: User[];
  passwords: { [userId: string]: string }; // Simple hash-like plain text for seed/mock auth (safe in local sandbox)
  questions: Question[];
  sessions: InterviewSession[];
  answers: SessionAnswer[];
  reports: Report[];
}

class Database {
  private state: DatabaseState = {
    users: [],
    passwords: {},
    questions: [],
    sessions: [],
    answers: [],
    reports: []
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        this.state = JSON.parse(content);
        console.log(`[DB] Database loaded successfully with ${this.state.questions.length} questions, ${this.state.users.length} users, ${this.state.reports.length} reports.`);
      } else {
        this.initializeDefaultData();
      }
    } catch (err) {
      console.error('[DB] Failed to load database, initializing empty:', err);
      this.initializeDefaultData();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB] Failed to save database:', err);
    }
  }

  private initializeDefaultData() {
    console.log('[DB] Initializing default seed data...');
    this.state = {
      users: [
        { id: 'u1', username: 'candidate', email: 'user@interviewprep.com', role: 'user' },
        { id: 'u2', username: 'admin', email: 'admin@interviewprep.com', role: 'admin' }
      ],
      passwords: {
        'u1': 'password',
        'u2': 'password'
      },
      questions: [...seedQuestions],
      sessions: [],
      answers: [],
      reports: []
    };
    this.save();
  }

  // --- Users CRUD ---
  getUsers(): User[] {
    return this.state.users;
  }

  getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getPasswordForUser(userId: string): string | undefined {
    return this.state.passwords[userId];
  }

  createUser(user: Omit<User, 'id'>, password: string): User {
    const newUser: User = {
      ...user,
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      activityDates: [new Date().toISOString().split('T')[0]],
      currentStreak: 1,
      longestStreak: 1
    };
    this.state.users.push(newUser);
    this.state.passwords[newUser.id] = password;
    this.save();
    return newUser;
  }

  deleteUser(id: string) {
    this.state.users = this.state.users.filter(u => u.id !== id);
    delete this.state.passwords[id];
    this.save();
  }

  calculateStreaks(dates: string[]): { currentStreak: number; longestStreak: number } {
    if (!dates || dates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // unique and sorted ascending
    const uniqueDates = Array.from(new Set(dates)).sort();
    
    // Calculate longest streak
    let longestStreak = 1;
    let tempLongest = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempLongest++;
      } else if (diffDays > 1) {
        if (tempLongest > longestStreak) {
          longestStreak = tempLongest;
        }
        tempLongest = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempLongest);

    // Calculate current streak using UTC dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const hasToday = uniqueDates.includes(todayStr);
    const hasYesterday = uniqueDates.includes(yesterdayStr);

    let currentStreak = 0;
    if (hasToday || hasYesterday) {
      // Start from either today or yesterday (whichever is active/present)
      const checkDate = new Date(hasToday ? todayStr : yesterdayStr);
      let streak = 0;
      let iterations = 0;
      const maxIterations = uniqueDates.length;

      while (iterations < maxIterations) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(checkStr)) {
          streak++;
          checkDate.setUTCDate(checkDate.getUTCDate() - 1);
          iterations++;
        } else {
          break;
        }
      }
      currentStreak = streak;
    }

    return { currentStreak, longestStreak };
  }

  registerUserActivity(userId: string, dateStr?: string): User | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    if (!user.activityDates) {
      user.activityDates = [];
    }

    // Default to server YYYY-MM-DD if dateStr not provided
    const targetDate = dateStr || new Date().toISOString().split('T')[0];

    if (!user.activityDates.includes(targetDate)) {
      user.activityDates.push(targetDate);
      user.activityDates.sort(); // Keep sorted ascending
    }

    // Recalculate streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(user.activityDates);
    user.currentStreak = currentStreak;
    user.longestStreak = longestStreak;

    this.save();
    return user;
  }

  // --- Questions CRUD ---
  getQuestions(): Question[] {
    return this.state.questions;
  }

  getQuestionById(id: string): Question | undefined {
    return this.state.questions.find(q => q.id === id);
  }

  createQuestion(question: Omit<Question, 'id'>): Question {
    const newQuestion: Question = {
      ...question,
      id: 'q_' + Math.random().toString(36).substr(2, 9)
    };
    this.state.questions.push(newQuestion);
    this.save();
    return newQuestion;
  }

  updateQuestion(id: string, updates: Partial<Question>): Question | undefined {
    const index = this.state.questions.findIndex(q => q.id === id);
    if (index === -1) return undefined;
    this.state.questions[index] = {
      ...this.state.questions[index],
      ...updates
    };
    this.save();
    return this.state.questions[index];
  }

  deleteQuestion(id: string): boolean {
    const lenBefore = this.state.questions.length;
    this.state.questions = this.state.questions.filter(q => q.id !== id);
    const deleted = this.state.questions.length < lenBefore;
    if (deleted) this.save();
    return deleted;
  }

  // --- Interview Sessions ---
  createSession(session: Omit<InterviewSession, 'id' | 'createdAt' | 'currentQuestionIndex'>): InterviewSession {
    const newSession: InterviewSession = {
      ...session,
      id: 's_' + Math.random().toString(36).substr(2, 9),
      currentQuestionIndex: 0,
      createdAt: new Date().toISOString()
    };
    this.state.sessions.push(newSession);
    this.save();
    return newSession;
  }

  getSessionById(id: string): InterviewSession | undefined {
    return this.state.sessions.find(s => s.id === id);
  }

  updateSession(id: string, updates: Partial<InterviewSession>): InterviewSession | undefined {
    const index = this.state.sessions.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.state.sessions[index] = {
      ...this.state.sessions[index],
      ...updates
    };
    this.save();
    return this.state.sessions[index];
  }

  getSessionsByUserId(userId: string): InterviewSession[] {
    return this.state.sessions.filter(s => s.userId === userId);
  }

  // --- Session Answers ---
  createAnswer(answer: Omit<SessionAnswer, 'id' | 'createdAt'>): SessionAnswer {
    const newAnswer: SessionAnswer = {
      ...answer,
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.state.answers.push(newAnswer);
    this.save();
    return newAnswer;
  }

  getAnswersBySessionId(sessionId: string): SessionAnswer[] {
    return this.state.answers.filter(a => a.sessionId === sessionId);
  }

  // --- Reports ---
  createReport(report: Omit<Report, 'id' | 'createdAt'>): Report {
    const newReport: Report = {
      ...report,
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.state.reports.push(newReport);
    this.save();
    return newReport;
  }

  getReportById(id: string): Report | undefined {
    return this.state.reports.find(r => r.id === id);
  }

  getReportBySessionId(sessionId: string): Report | undefined {
    return this.state.reports.find(r => r.sessionId === sessionId);
  }

  getReportsByUserId(userId: string): Report[] {
    return this.state.reports.filter(r => r.userId === userId);
  }

  getReports(): Report[] {
    return this.state.reports;
  }

  // --- Dashboard Statistics ---
  getDashboardStats(): DashboardStats {
    const reports = this.state.reports;
    const totalSessions = reports.length;
    const averageScore = totalSessions > 0
      ? Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / totalSessions)
      : 0;

    const sessionsByRole: { [key: string]: number } = {};
    const sessionsByType: { [key: string]: number } = {};

    reports.forEach(r => {
      sessionsByRole[r.jobRole] = (sessionsByRole[r.jobRole] || 0) + 1;
      sessionsByType[r.type] = (sessionsByType[r.type] || 0) + 1;
    });

    // Score trends (last 7 reports sorted by date)
    const scoreTrend = [...reports]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-7)
      .map(r => ({
        date: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: r.overallScore
      }));

    return {
      totalSessions,
      averageScore,
      sessionsByRole,
      sessionsByType,
      scoreTrend
    };
  }
}

export const db = new Database();
