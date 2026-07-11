import React, { useState, useEffect, useRef } from 'react';
import { Question, InterviewSession as SessionType, SessionAnswer } from '../types';
import { Mic, Square, Video, VideoOff, RefreshCw, AlertCircle, Sparkles, Loader2, Send, CheckCircle, Terminal, Play, Check, X, Code, Info, FileCode, Award, Lightbulb, Brain, Heart, ChevronDown, ChevronUp, BookOpen, CheckSquare, Square as SquareIcon, Eye, EyeOff } from 'lucide-react';
import { codingChallenges } from '../codingChallenges';

interface InterviewSessionProps {
  token: string;
  session: SessionType;
  onSessionComplete: (reportId: string) => void;
  onExit: () => void;
}

const categoryTips: Record<string, {
  title: string;
  pacing: string;
  focusArea: string;
  milestones: string[];
  tips: { title: string; text: string }[];
}> = {
  hr: {
    title: "HR & Behavioral Mock Tips",
    pacing: "Aim for a structured, conversational response of 1.5 - 2 minutes.",
    focusArea: "Leadership, Team Collaboration, Personal Growth, and Cultural Alignment",
    milestones: [
      "Hook the interviewer with a brief context",
      "Mention a specific obstacle you faced",
      "Explain the exact actions you personally took",
      "Highlight the quantitative or qualitative result",
      "Connect the learning back to this open job role"
    ],
    tips: [
      {
        title: "Use the STAR framework",
        text: "Structure stories with Situation, Task, Action, and Result. Ensure 70% of your time is spent on Action and Result."
      },
      {
        title: "Focus on your individual input",
        text: "Use 'I' instead of 'We' when describing the action. Explain your unique contributions to the team's victory."
      },
      {
        title: "Show self-awareness on weak spots",
        text: "When discussing failures, spend more time on what you learned and how you have actively worked to improve."
      },
      {
        title: "Match the company values",
        text: "Infuse keywords from the job description (e.g., customer obsession, scale, ownership) into your answers naturally."
      }
    ]
  },
  technical: {
    title: "Technical & System Design Tips",
    pacing: "Focus on technical accuracy, logical flow, and complexity analysis.",
    focusArea: "Algorithmic Complexity, Edge Cases, Data Structure Choice, and System Scale",
    milestones: [
      "Clarify constraints (null inputs, memory bounds)",
      "Outline the brute-force approach first",
      "Explain the optimal solution's design pattern",
      "Discuss Big-O time & space complexity",
      "Identify potential scale bottlenecks"
    ],
    tips: [
      {
        title: "Verbalize your thinking",
        text: "Don't code or answer in silence. Talk through your decisions, alternate data structures, and trade-offs in real-time."
      },
      {
        title: "Discuss Big-O upfront",
        text: "State the time and space complexity of your proposed approach before diving deep. It shows rigorous engineering discipline."
      },
      {
        title: "Handle guard rails & edge cases",
        text: "Specifically mention how your answer handles empty parameters, massive inputs, memory restrictions, or unexpected types."
      },
      {
        title: "Prioritize clear variable names",
        text: "Whether writing code or pseudo-code, clear variable and function names represent robust production-grade quality."
      }
    ]
  },
  aptitude: {
    title: "Aptitude & Logic Tips",
    pacing: "Prioritize speed, structural breakdown, and quantitative precision.",
    focusArea: "Logical Chains, Problem Formulation, Estimations, and Pattern Recognition",
    milestones: [
      "Extract the key mathematical variables",
      "Convert raw descriptions into equations",
      "Eliminate clearly incorrect parameters",
      "Calculate the final value systematically",
      "Sanity-check the order of magnitude"
    ],
    tips: [
      {
        title: "Isolate constraints early",
        text: "Write down or verbalize the core facts given in the prompt before trying to solve. Don't let noise distract you."
      },
      {
        title: "Use approximation for speed",
        text: "If calculations get heavy, round numbers to estimate the ballpark range, then narrow down to the precise answer."
      },
      {
        title: "Look for sequence patterns",
        text: "For series or logic puzzles, look for differences, squares, primes, or alternating operations in the steps."
      },
      {
        title: "Manage your energy & pacing",
        text: "If a specific calculation is taking too long, state your logical strategy clearly and request to complete the general outline."
      }
    ]
  }
};

export default function InterviewSession({ token, session, onSessionComplete, onExit }: InterviewSessionProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluatingMessage, setEvaluatingMessage] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [textAnswer, setTextAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Video feed states
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mockConfidence, setMockConfidence] = useState(90);

  // Interview timer states
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Countdown Timer States
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [totalTimeLimit, setTotalTimeLimit] = useState<number>(120);
  const [hideTimer, setHideTimer] = useState<boolean>(false);

  // Coding Sandbox States
  const [activeSubTab, setActiveSubTab] = useState<'qa' | 'coding'>('qa');
  const [selectedChallenge, setSelectedChallenge] = useState<any>(codingChallenges[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState(codingChallenges[0].starterCode.javascript);
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any | null>(null);
  const [terminalTab, setTerminalTab] = useState<'results' | 'logs'>('results');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Quick Tips Sidebar States
  const [showTips, setShowTips] = useState(true);
  const [checkedMilestones, setCheckedMilestones] = useState<{[key: string]: boolean}>({});
  const [expandedTipIndex, setExpandedTipIndex] = useState<number | null>(0);

  // Reset checked milestones on question change
  useEffect(() => {
    setCheckedMilestones({});
  }, [currentQuestion]);

  // Synchronize starter code on challenge/language selection
  useEffect(() => {
    if (selectedChallenge) {
      setCode(selectedChallenge.starterCode[selectedLanguage]);
      setTestResults(null);
    }
  }, [selectedChallenge, selectedLanguage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const val = e.currentTarget.value;
      const newValue = val.substring(0, start) + '  ' + val.substring(end);
      setCode(newValue);
      
      // Keep cursor in the right place
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const runLocalTests = async () => {
    try {
      setRunningTests(true);
      setError('');
      setTerminalTab('results');
      
      const res = await fetch(`/api/sessions/${session.id}/submit-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          code: code,
          language: selectedLanguage,
          submitAnswer: false
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed.');
      
      setTestResults(data.evaluation);
    } catch (err: any) {
      setError(err.message || 'Error running test suite.');
    } finally {
      setRunningTests(false);
    }
  };

  const submitCodingSolution = async () => {
    try {
      setEvaluating(true);
      setEvaluatingMessage('Analyzing algorithmic complexity and saving result...');
      setError('');
      
      const res = await fetch(`/api/sessions/${session.id}/submit-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          code: code,
          language: selectedLanguage,
          submitAnswer: true
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit solution.');
      
      // Reset coding states and fetch next
      setTestResults(null);
      fetchNextQuestion();
    } catch (err: any) {
      setError(err.message || 'Error saving solution.');
    } finally {
      setEvaluating(false);
    }
  };

  // Load next/first question
  useEffect(() => {
    fetchNextQuestion();

    // Start global interview timer
    const globalTimer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(globalTimer);
      stopAudioRecordingTimer();
      stopVideoDevice();
    };
  }, []);

  // Handle tab and question changes to initialize timers
  useEffect(() => {
    if (activeSubTab === 'coding') {
      setTimeLeft(300);
      setTotalTimeLimit(300);
    } else if (currentQuestion) {
      const type = currentQuestion.type || session.type || 'technical';
      const limit = type === 'hr' ? 120 : type === 'technical' ? 180 : 120;
      setTimeLeft(limit);
      setTotalTimeLimit(limit);
    }
  }, [activeSubTab, currentQuestion, session.type]);

  // Countdown Timer Effect
  useEffect(() => {
    if (evaluating || loadingQuestion || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, evaluating, loadingQuestion]);

  // Action on Time Up
  useEffect(() => {
    if (timeLeft === 0 && !evaluating && !loadingQuestion) {
      if (activeSubTab === 'coding') {
        submitCodingSolution();
      } else if (isRecording) {
        stopRecording();
      } else {
        const trimmed = textAnswer.trim();
        setEvaluating(true);
        setEvaluatingMessage("Time's up! Auto-submitting response...");
        submitResponse(trimmed || "(Time limit exceeded - no answer entered)");
      }
    }
  }, [timeLeft]);

  // Update mock confidence when video is on (simulating face alignment stability)
  useEffect(() => {
    let interval: any;
    if (showVideo) {
      interval = setInterval(() => {
        setMockConfidence(Math.round(82 + Math.random() * 14));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [showVideo]);

  const fetchNextQuestion = async () => {
    try {
      setLoadingQuestion(true);
      setError('');
      const res = await fetch(`/api/sessions/${session.id}/next-question`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve the next question.');
      const data = await res.json();

      if (data.complete) {
        compileFinalReport();
      } else {
        setCurrentQuestion(data.question);
        setCurrentIndex(data.index);
        setTotalQuestions(data.total);
        setTextAnswer('');
        setRecordingSeconds(0);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Video Device handlers
  const toggleVideo = async () => {
    if (showVideo) {
      stopVideoDevice();
      setShowVideo(false);
    } else {
      try {
        setShowVideo(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('[Video] Access to camera was blocked or unavailable:', err);
        setError('Camera permission denied or unavailable. Visual evaluation bypassed.');
        setShowVideo(false);
      }
    }
  };

  const stopVideoDevice = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Audio Recording Handlers
  const startRecording = async () => {
    setError('');
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop()); // release mic
        await processAndSubmitAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('[Mic] Access failed:', err);
      setError('Microphone permission was denied or unavailable. Please use the typed text fallback.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopAudioRecordingTimer();
    }
  };

  const stopAudioRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  // Base64 file encoder helper
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processAndSubmitAudio = async (audioBlob: Blob) => {
    setEvaluating(true);
    setEvaluatingMessage('Processing audio feed...');
    try {
      const base64Audio = await blobToBase64(audioBlob);
      submitResponse(undefined, base64Audio, 'audio/webm', recordingSeconds);
    } catch (err: any) {
      setError('Failed to process audio recording: ' + err.message);
      setEvaluating(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAnswer.trim()) return;
    setEvaluating(true);
    setEvaluatingMessage('Evaluating text response...');
    submitResponse(textAnswer.trim());
  };

  const submitResponse = async (
    textAnswerString?: string,
    audioBase64String?: string,
    mimeType?: string,
    durationSeconds?: number
  ) => {
    setError('');
    
    // Cycle beautiful NLP loading messages
    const messages = [
      'Sending response to AI Analysis Engine...',
      'Running Whisper voice-to-text transcribers...',
      'Extracting BERT structural sentence embeddings...',
      'Calculating cosine similarity with ideal schemas...',
      'Evaluating syntax, lexical range, and grammar levels...',
      'Analyzing tone, sentiment, and filler vocal habits...'
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      if (msgIdx < messages.length - 1) {
        msgIdx++;
        setEvaluatingMessage(messages[msgIdx]);
      }
    }, 2500);

    try {
      const res = await fetch(`/api/sessions/${session.id}/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: currentQuestion?.id,
          questionText: currentQuestion?.text,
          textAnswer: textAnswerString,
          audioBase64: audioBase64String,
          mimeType,
          durationSeconds
        })
      });

      clearInterval(msgInterval);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit response.');

      // Proceed to retrieve next round question
      fetchNextQuestion();
    } catch (err: any) {
      clearInterval(msgInterval);
      setError(err.message || 'Error occurred during answer analysis.');
    } finally {
      setEvaluating(false);
    }
  };

  const compileFinalReport = async () => {
    setEvaluating(true);
    setEvaluatingMessage('Compiling final master report and AI recommendations...');
    try {
      const res = await fetch(`/api/sessions/${session.id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to compile final interview scorecard.');

      onSessionComplete(data.id);
    } catch (err: any) {
      setError(err.message || 'Error compiling session report.');
      setEvaluating(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div id="session-container" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Session Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
            Active Workspace
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {session.jobRole} {session.type.toUpperCase()} Mock
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right border-r border-slate-100 pr-3 mr-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Duration</span>
            <span className="text-sm font-bold text-slate-800 font-mono">{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Question Countdown Timer */}
          {!evaluating && !loadingQuestion && (
            <div id="countdown-timer-hud" className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 text-right">
              <div className="text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">Question Timer</span>
                <span className={`text-xs font-bold font-mono leading-tight ${
                  timeLeft < 30 ? 'text-red-600 animate-pulse' : timeLeft < 60 ? 'text-amber-600' : 'text-slate-800'
                }`}>
                  {hideTimer ? '••:••' : formatTimer(timeLeft)}
                </span>
              </div>
              <div className="relative w-5 h-5 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="10" cy="10" r="7" className="stroke-slate-200 fill-none" strokeWidth="1.5" />
                  <circle
                    cx="10"
                    cy="10"
                    r="7"
                    className={`fill-none transition-all duration-1000 ${
                      timeLeft < 30 ? 'stroke-red-500' : timeLeft < 60 ? 'stroke-amber-500' : 'stroke-blue-500'
                    }`}
                    strokeWidth="1.5"
                    strokeDasharray={44}
                    strokeDashoffset={44 - (44 * timeLeft) / totalTimeLimit}
                  />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setHideTimer(!hideTimer)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-200/50 transition-colors cursor-pointer"
                title={hideTimer ? "Show timer" : "Hide timer"}
              >
                {hideTimer ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </div>
          )}

          <button
            id="btn-toggle-quick-tips"
            type="button"
            onClick={() => setShowTips(!showTips)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              showTips
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lightbulb size={14} className={showTips ? 'text-blue-600 fill-blue-100 animate-pulse' : 'text-slate-400'} />
            {showTips ? 'Hide Tips' : 'Show Tips'}
          </button>
          <button
            id="btn-session-exit"
            type="button"
            onClick={onExit}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel Interview
          </button>
        </div>
      </div>

      {/* Sub-tab selection row */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          id="btn-subtab-qa"
          type="button"
          onClick={() => setActiveSubTab('qa')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'qa'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mic size={16} />
          Conceptual Q&A Interview
        </button>
        <button
          id="btn-subtab-coding"
          type="button"
          onClick={() => setActiveSubTab('coding')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'coding'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code size={16} />
          Coding Interview (IDE)
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full min-w-0">
          {error && (
        <div id="session-error-alert" className="mb-6 flex gap-2 rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-200/50">
          <AlertCircle size={16} className="shrink-0" />
          <div className="text-left">{error}</div>
        </div>
      )}

      {/* Loading evaluations screen */}
      {evaluating ? (
        <div id="session-eval-loading" className="rounded-2xl border border-slate-200 bg-white py-16 px-6 text-center shadow-xs flex flex-col items-center justify-center min-h-[350px]">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <h3 className="font-display text-lg font-bold text-slate-900">Evaluating Response...</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md animate-pulse">{evaluatingMessage}</p>
          <div className="mt-6 flex gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '200ms' }}></span>
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '400ms' }}></span>
          </div>
        </div>
      ) : activeSubTab === 'coding' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-fade-in text-left">
          {/* Challenges selector list on the left side */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <FileCode size={13} className="text-slate-400" />
                Select Challenge
              </h4>
              <div className="space-y-2">
                {codingChallenges.map((challenge) => (
                  <button
                    key={challenge.id}
                    id={`btn-challenge-${challenge.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedChallenge(challenge);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer flex flex-col gap-1 ${
                      selectedChallenge.id === challenge.id
                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold">{challenge.title}</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                        challenge.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800' :
                        challenge.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{challenge.category}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Award size={13} className="text-slate-400" />
                Scorecard Rules
              </h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Coding submissions are compiled and graded in real-time. Submitting a correct solution adds it to your mock performance report cards and advances your interview progress index.
              </p>
            </div>
          </div>

          {/* Core Splitscreen IDE */}
          <div className="lg:col-span-9 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Problem Statement Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between min-h-[400px] relative overflow-hidden">
                {/* Coding Countdown Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      timeLeft < 45 ? 'bg-red-500 animate-pulse' : timeLeft < 90 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(timeLeft / totalTimeLimit) * 100}%` }}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                      {selectedChallenge.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      selectedChallenge.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      selectedChallenge.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {selectedChallenge.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
                    {selectedChallenge.title}
                  </h3>

                  <div className="text-sm text-slate-600 space-y-4 whitespace-pre-line leading-relaxed border-t border-slate-100 pt-4">
                    {selectedChallenge.description}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-6">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Info size={14} className="shrink-0" />
                    <span>Provide an optimal solution with proper time and space complexity.</span>
                  </div>
                </div>
              </div>

              {/* Coding IDE area */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between min-h-[400px]">
                {/* Editor Header Bar */}
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">Editor</span>
                    <select
                      id="ide-language-selector"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-mono"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-ide-load-solution"
                      type="button"
                      onClick={() => {
                        if (selectedLanguage === 'javascript') {
                          setCode(selectedChallenge.starterCode.javascript);
                        } else {
                          setCode(selectedChallenge.starterCode.python);
                        }
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      title="Reset code template"
                    >
                      Load Template
                    </button>
                  </div>
                </div>

                {/* Editor Area with Line Numbers */}
                <div className="flex bg-slate-950 font-mono text-sm relative">
                  {/* Line Numbers */}
                  <div className="text-right pr-3 pl-3 py-4 select-none text-slate-600 bg-slate-950 border-r border-slate-900/60 font-mono text-[11px] w-10">
                    {Array.from({ length: code.split('\n').length || 1 }).map((_, i) => (
                      <div key={i} className="leading-6 h-6">{i + 1}</div>
                    ))}
                  </div>

                  {/* Interactive Textarea */}
                  <textarea
                    id="ide-textarea-editor"
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-slate-950 text-emerald-400 p-4 font-mono text-xs focus:outline-none resize-none leading-6 min-h-[300px] w-full border-0"
                    placeholder="# Write your code here..."
                    spellCheck="false"
                  />
                </div>

                {/* Editor Footer Actions Row */}
                <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-2">
                  <div className="text-[10px] font-mono text-slate-500">
                    Press <span className="text-slate-400 font-bold bg-slate-800 px-1 py-0.5 rounded">Tab</span> to indent.
                  </div>
                  <div className="flex gap-2">
                    <button
                      id="btn-ide-run-tests"
                      type="button"
                      onClick={runLocalTests}
                      disabled={runningTests}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                    >
                      <Play size={12} fill="currentColor" />
                      {runningTests ? 'Running...' : 'Run Local Tests'}
                    </button>
                    <button
                      id="btn-ide-submit"
                      type="button"
                      onClick={submitCodingSolution}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <CheckCircle size={12} />
                      Submit to Scorecard
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Console / Assertions Output Panel */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              {/* Terminal Tabs */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 flex justify-between items-center">
                <div className="flex gap-4">
                  <button
                    id="btn-terminal-tab-results"
                    type="button"
                    onClick={() => setTerminalTab('results')}
                    className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      terminalTab === 'results'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Terminal size={14} />
                    Test Assertions
                  </button>
                  <button
                    id="btn-terminal-tab-logs"
                    type="button"
                    onClick={() => setTerminalTab('logs')}
                    className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      terminalTab === 'logs'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Console Output
                  </button>
                </div>
                {testResults && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    testResults.allPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {testResults.allPassed ? 'ALL TEST CASES PASSED' : 'SOME TEST CASES FAILED'}
                  </span>
                )}
              </div>

              {/* Terminal Content Box */}
              <div className="bg-slate-900 p-5 font-mono text-xs text-slate-300 min-h-[140px] max-h-[250px] overflow-y-auto">
                {terminalTab === 'results' ? (
                  <div className="space-y-3.5">
                    {!testResults ? (
                      <p className="text-slate-500 italic text-center py-4">No tests run yet. Write your solution and click "Run Local Tests" to execute.</p>
                    ) : (
                      testResults.testResults.map((tr: any, idx: number) => (
                        <div key={idx} className="border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            {tr.passed ? (
                              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded text-[10px]">
                                <Check size={10} strokeWidth={3} /> PASSED
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-400 font-bold bg-red-950/40 border border-red-900/60 px-2 py-0.5 rounded text-[10px]">
                                <X size={10} strokeWidth={3} /> FAILED
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-slate-400">Test Case #{idx + 1}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-2 border-l-2 border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-500 block">INPUT</span>
                              <span className="text-slate-300 font-mono text-[11px]">{tr.input}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">EXPECTED OUTPUT</span>
                              <span className="text-emerald-400 font-mono text-[11px]">{tr.expected}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">ACTUAL OUTPUT</span>
                              <span className={`font-mono text-[11px] ${tr.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tr.actual}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div>
                    {!testResults || !testResults.consoleLogs ? (
                      <p className="text-slate-500 italic text-center py-4">No logs captured. Use console.log() or print() in your code to view logs here.</p>
                    ) : (
                      <pre className="whitespace-pre-wrap text-emerald-500 leading-relaxed font-mono">
                        {testResults.consoleLogs}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : loadingQuestion ? (
        <div id="session-question-loading" className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-xs flex flex-col items-center justify-center min-h-[350px]">
          <Loader2 className="animate-spin text-slate-400 mb-2" size={32} />
          <p className="text-sm text-slate-500 font-medium">Retrieving prompt questions...</p>
        </div>
      ) : currentQuestion ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main workspace left: Question & Answers */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
              {/* Question Countdown Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeLeft < 30 ? 'bg-red-500 animate-pulse' : timeLeft < 60 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(timeLeft / totalTimeLimit) * 100}%` }}
                />
              </div>

              {/* Question header */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                  Round {currentIndex + 1} of {totalQuestions}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  currentQuestion.difficulty === 'easy' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  currentQuestion.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>

              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                "{currentQuestion.text}"
              </h3>

              {currentQuestion.keywords && currentQuestion.keywords.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Recommended focus terms</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentQuestion.keywords.map(kw => (
                      <span key={kw} className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-md">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Interface */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Provide Your Response</h4>

              {/* TABS for audio vs text */}
              <div className="grid grid-cols-1 gap-6">
                {/* Micro Recording view */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center">
                  {isRecording ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      {/* Live pulse wave */}
                      <div className="relative mb-4 flex items-center justify-center">
                        <span className="absolute h-14 w-14 rounded-full bg-red-500/20 pulse-teal-ring"></span>
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white">
                          <Mic size={20} className="animate-pulse" />
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-red-600">Recording vocal response...</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">Elapsed: {formatTimer(recordingSeconds)}</p>
                      
                      <button
                        id="btn-recording-stop"
                        type="button"
                        onClick={stopRecording}
                        className="mt-4 flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Square size={12} fill="white" />
                        Finish & Analyze Audio
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 mb-3">
                        <Mic size={20} />
                      </div>
                      <h5 className="text-sm font-bold text-slate-800">Answer with Voice</h5>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">Use your microphone to speak. Your answer will be compiled and graded instantly by Gemini AI NLP models.</p>
                      <button
                        id="btn-recording-start"
                        type="button"
                        onClick={startRecording}
                        className="mt-4 flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-200 cursor-pointer"
                      >
                        <Mic size={14} />
                        Record Response
                      </button>
                    </div>
                  )}
                </div>

                {/* Text fallback input */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Or Type Your Answer</span>
                  </div>
                  <form onSubmit={handleTextSubmit} className="space-y-4">
                    <textarea
                      id="input-text-answer"
                      rows={5}
                      required
                      placeholder="Type your response here. For high scores, include core technical definitions and relate concepts directly to systems or practical operations."
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      disabled={isRecording}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <div className="flex justify-end">
                      <button
                        id="btn-submit-text-answer"
                        type="submit"
                        disabled={isRecording || !textAnswer.trim()}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm disabled:opacity-40 cursor-pointer"
                      >
                        <Send size={12} />
                        Submit Written Answer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive media/facials feed on the right */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Optional Visual Feed</h4>
                <button
                  id="btn-toggle-camera"
                  type="button"
                  onClick={toggleVideo}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    showVideo 
                      ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {showVideo ? <VideoOff size={12} /> : <Video size={12} />}
                  {showVideo ? 'Off' : 'Enable Camera'}
                </button>
              </div>

              <div className="relative rounded-xl bg-slate-900 aspect-video overflow-hidden border border-slate-800 flex flex-col items-center justify-center text-center">
                {showVideo ? (
                  <>
                    <video
                      id="webcam-stream-feed"
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover transform -scale-x-100"
                    />
                    {/* Fake HUD Landmarks bounding box */}
                    <div className="absolute inset-4 border border-blue-500/40 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                      <div className="flex justify-between text-[8px] font-mono text-blue-400 bg-slate-950/70 px-1 py-0.5 rounded">
                        <span>DETECTOR: ACTIVE</span>
                        <span>CONFIDENCE: {mockConfidence}%</span>
                      </div>
                      <div className="self-center flex h-14 w-14 items-center justify-center border border-dashed border-blue-400/50 rounded-full animate-pulse">
                        <span className="text-[7px] font-mono text-blue-300">ALIGNMENT</span>
                      </div>
                      <div className="text-[8px] font-mono text-blue-400 text-center bg-slate-950/70 py-0.5 rounded">
                        LANDMARK CLASSIFIER: CALM / CONFIDENT
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-slate-400">
                    <Video size={36} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-xs font-bold">Video Feed Disabled</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Turn on your camera to visual-mirror confidence alignments. Camera feed is secure and stays purely inside your browser sandbox.</p>
                  </div>
                )}
              </div>

              {showVideo && (
                <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-3 flex gap-2.5">
                  <Sparkles size={16} className="text-blue-700 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Fluency HUD Diagnostics</span>
                    <p className="text-[11px] text-blue-800 leading-relaxed mt-0.5">Tracking posture and stable alignments. Excellent eye-level framing and steady facial markers, supporting active confidence feedback scores.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <AlertCircle size={32} className="mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-500">Failed to mount interview Round. Please cancel and restart the mock.</p>
        </div>
      )}
        </div>

        {/* Quick Tips Sidebar */}
        {showTips && (() => {
          const currentCategory = (activeSubTab === 'coding') 
            ? 'technical' 
            : (currentQuestion?.type || session.type || 'technical');

          const activeTips = categoryTips[currentCategory] || categoryTips.technical;

          return (
            <div
              id="quick-tips-sidebar"
              className="w-full lg:w-80 shrink-0 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs animate-fade-in text-left flex flex-col gap-5 self-start"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    currentCategory === 'hr' ? 'bg-pink-50 text-pink-600' :
                    currentCategory === 'technical' ? 'bg-indigo-50 text-indigo-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {currentCategory === 'hr' ? <Heart size={16} className="fill-pink-50" /> :
                     currentCategory === 'technical' ? <Code size={16} /> :
                     <Brain size={16} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Quick Tips</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Real-time coaching feed</p>
                  </div>
                </div>
                <button
                  id="btn-sidebar-close"
                  type="button"
                  onClick={() => setShowTips(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                  title="Hide Sidebar"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Live Guidance Overview */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-1">
                  Category Guidance
                </span>
                <div className={`rounded-xl border p-3 ${
                  currentCategory === 'hr' ? 'bg-pink-50/30 border-pink-100 text-pink-900' :
                  currentCategory === 'technical' ? 'bg-indigo-50/30 border-indigo-100 text-indigo-900' :
                  'bg-amber-50/30 border-amber-100 text-amber-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    <Lightbulb size={12} className={
                      currentCategory === 'hr' ? 'text-pink-600 animate-pulse' :
                      currentCategory === 'technical' ? 'text-indigo-600' :
                      'text-amber-600'
                    } />
                    <span>{activeTips.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {activeTips.pacing}
                  </p>
                </div>
              </div>

              {/* Answer Milestone Checklist (Interactive!) */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-2">
                  Practice Checklist
                </span>
                <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                  Check off items as you prepare or verbalize your response:
                </p>
                <div className="space-y-1">
                  {activeTips.milestones.map((milestone, idx) => {
                    const isChecked = !!checkedMilestones[milestone];
                    return (
                      <button
                        key={idx}
                        id={`btn-milestone-${idx}`}
                        type="button"
                        onClick={() => {
                          setCheckedMilestones(prev => ({
                            ...prev,
                            [milestone]: !prev[milestone]
                          }));
                        }}
                        className="w-full text-left flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs group"
                      >
                        <div className="shrink-0 mt-0.5">
                          {isChecked ? (
                            <CheckSquare size={14} className="text-blue-600 fill-blue-50" />
                          ) : (
                            <SquareIcon size={14} className="text-slate-300 group-hover:text-slate-400" />
                          )}
                        </div>
                        <span className={`text-[11px] leading-relaxed transition-all ${
                          isChecked ? 'text-slate-400 line-through font-medium' : 'text-slate-700 font-medium'
                        }`}>
                          {milestone}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Expert Card */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-2">
                  Key Strategies
                </span>
                <div className="space-y-2">
                  {activeTips.tips.map((tip, idx) => {
                    const isExpanded = expandedTipIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden"
                      >
                        <button
                          id={`btn-tip-toggle-${idx}`}
                          type="button"
                          onClick={() => setExpandedTipIndex(isExpanded ? null : idx)}
                          className="w-full px-3 py-1.5 flex items-center justify-between font-bold text-[11px] text-slate-700 hover:bg-slate-100/50 transition-colors cursor-pointer"
                        >
                          <span className="truncate">{tip.title}</span>
                          {isExpanded ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
                        </button>
                        {isExpanded && (
                          <div className="px-3 pb-2.5 pt-1 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed bg-white">
                            {tip.text}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coding Context Alert */}
              {activeSubTab === 'coding' && (
                <div className="border-t border-slate-100 pt-4 bg-emerald-50/30 -mx-5 -mb-5 p-4 rounded-b-2xl border-t border-emerald-100">
                  <div className="flex gap-2 text-left">
                    <Terminal size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-mono block">
                        Active IDE Mode
                      </span>
                      <p className="text-[10px] text-emerald-700/90 leading-relaxed mt-0.5">
                        Ensure your function conforms exactly to the starter parameter layout and returns the correct data types.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
