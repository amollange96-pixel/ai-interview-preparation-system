import { Report } from '../types';
import { Award, Check, ChevronDown, ChevronUp, Download, ArrowLeft, RefreshCw, FileText, CheckCircle, Flame, Star, Zap } from 'lucide-react';
import { useState } from 'react';

interface PerformanceReportProps {
  report: Report;
  onRestart: () => void;
}

export default function PerformanceReport({ report, onRestart }: PerformanceReportProps) {
  const [expandedAnswerId, setExpandedAnswerId] = useState<string | null>(null);

  const toggleAnswerExpand = (id: string) => {
    setExpandedAnswerId(prev => (prev === id ? null : id));
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-blue-700 bg-blue-50 border border-blue-100';
    if (score >= 70) return 'text-amber-700 bg-amber-50 border border-amber-100';
    return 'text-rose-700 bg-rose-50 border border-rose-100';
  };

  const getScoreBarBg = (score: number) => {
    if (score >= 85) return 'bg-blue-600';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // Export report data as a clean Markdown file
  const handleExportText = () => {
    const divider = '='.repeat(40);
    let md = `
${divider}
INTERVIEW PREP COACH PERFORMANCE REPORT
${divider}
Role target: ${report.jobRole}
Category: ${report.type.toUpperCase()}
Date: ${new Date(report.createdAt).toLocaleString()}

OVERALL INTERVIEW GRADE: ${report.overallScore}/100

DETAILED METRICS BREAKDOWN:
- Technical Comprehension: ${report.technicalScore}%
- Structured Communication: ${report.communicationScore}%
- Language & Grammar: ${report.grammarScore}%
- Presence & Confidence: ${report.confidenceScore}%
- Required Keywords matched: ${report.keywordMatchScore}%

${divider}
EXECUTIVE ACTION SUGGESTIONS:
${report.suggestions.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

${divider}
QUESTION & ANSWER DETAILS:
`;

    report.answers.forEach((ans, idx) => {
      md += `
Round ${idx + 1}: ${ans.questionText}
User Answer: "${ans.rawText}"
Feedback: ${ans.feedback}
Sub-Scores:
  * Technical: ${ans.subScores.technical}/100
  * Communication: ${ans.subScores.communication}/100
  * Grammar: ${ans.subScores.grammar}/100
  * Confidence: ${ans.subScores.confidence}/100
  * Keyword match: ${ans.subScores.keywordMatch}/100
- - - - - - - - - - - - - - - - - - - - - - -
`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.jobRole.replace(/\s+/g, '_')}_Interview_Report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="report-details-container" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in print:bg-white print:p-0">
      {/* Report Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-8 print:hidden">
        <div>
          <button
            id="btn-report-back"
            onClick={onRestart}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-2 focus:outline-none"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Interview Scorecard
          </h1>
          <p className="text-xs font-mono text-blue-600 uppercase tracking-wider mt-1.5 font-semibold">
            {report.jobRole} • {report.type} Evaluated on {new Date(report.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="btn-report-export"
            type="button"
            onClick={handleExportText}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download size={14} />
            Export Markdown
          </button>
          <button
            id="btn-report-restart"
            type="button"
            onClick={onRestart}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-200 transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            Practice Again
          </button>
        </div>
      </div>

      {/* Main Grid: Grade & Breakdown */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Grade Card & Suggestions */}
        <div className="md:col-span-1 space-y-6">
          {/* Main Grade Circle Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Overall Score</h3>
            <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border-8 border-slate-50 bg-slate-50/50">
              {/* Fake gradient track */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-600/10"></div>
              <div className="text-center">
                <span className="text-4xl font-display font-bold text-slate-900 leading-none">{report.overallScore}</span>
                <span className="text-xs text-slate-400 font-semibold block mt-0.5">/ 100</span>
              </div>
            </div>

            <div className="mt-5">
              <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${
                report.overallScore >= 85 ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                report.overallScore >= 70 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                {report.overallScore >= 85 ? 'EXCELLENT FIT' :
                 report.overallScore >= 70 ? 'COMPETENT / PASSING' :
                 'DEVELOPMENT NEEDED'}
              </span>
            </div>
          </div>

          {/* AI Master Suggestions Card */}
          <div className="rounded-2xl border border-blue-900/40 bg-blue-950 text-blue-100 p-6 shadow-md shadow-blue-950/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-4">
              <Zap size={14} className="text-blue-400" />
              Executive Recommendations
            </h3>
            <div className="space-y-4">
              {report.suggestions && report.suggestions.map((s, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 text-blue-200 font-mono text-[10px] font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-blue-200 leading-relaxed text-left">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Skill Breakdown & Q&A */}
        <div className="md:col-span-2 space-y-6">
          {/* Detailed Skill Metrics card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-display text-md font-bold text-slate-900 mb-5">Sub-Scores Analysis</h3>
            
            <div className="space-y-4">
              {/* Metric Row */}
              {[
                { name: 'Technical Depth', value: report.technicalScore, desc: 'Comprehension, factual accuracy, and technical completeness.' },
                { name: 'Structured Communication', value: report.communicationScore, desc: 'Pacing, clarity, and logical organization of assertions.' },
                { name: 'Grammar & Syntax', value: report.grammarScore, desc: 'Syntactic flow, vocabulary range, and grammatical correctness.' },
                { name: 'Vocal/Textual Confidence', value: report.confidenceScore, desc: 'Presence, decisiveness, and minimal filler words.' },
                { name: 'Keyword Coverage', value: report.keywordMatchScore, desc: 'Degree to which recommended keywords are matched or covered.' }
              ].map((metric) => (
                <div key={metric.name} className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{metric.name}</span>
                      <span className="text-[10px] text-slate-400 block leading-tight">{metric.desc}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-mono">{metric.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getScoreBarBg(metric.value)} transition-all`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Question and Answers accordion section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-display text-md font-bold text-slate-900 mb-4">Question & Answer Logs</h3>

            <div className="space-y-3">
              {report.answers && report.answers.map((ans, idx) => {
                const isExpanded = expandedAnswerId === ans.id;
                const answerScore = Math.round(
                  (ans.subScores.technical * 0.35) +
                  (ans.subScores.communication * 0.25) +
                  (ans.subScores.grammar * 0.20) +
                  (ans.subScores.confidence * 0.20)
                );

                return (
                  <div
                    id={`answer-log-row-${ans.id}`}
                    key={ans.id}
                    className="rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-slate-300 transition-all"
                  >
                    {/* Header trigger row */}
                    <button
                      id={`btn-toggle-log-row-${ans.id}`}
                      type="button"
                      onClick={() => toggleAnswerExpand(ans.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/50 transition-colors focus:outline-none cursor-pointer"
                    >
                      <div className="pr-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Round {idx + 1}</span>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug mt-1">"{ans.questionText}"</h4>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className={`rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold ${getScoreColor(answerScore)}`}>
                          {answerScore} pt
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </button>

                    {/* Expandable answer details */}
                    {isExpanded && (
                      <div className="bg-slate-50/60 border-t border-slate-100 p-4 space-y-4 animate-fade-in text-left">
                        {/* The Transcript */}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Candidate Transcript</span>
                          <p className="text-xs text-slate-800 italic leading-relaxed mt-1.5 p-3 rounded-lg border border-slate-200/50 bg-white">
                            "{ans.rawText}"
                          </p>
                        </div>

                        {/* Speech speed indicator if applicable */}
                        {ans.speakingSpeed && (
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/30 w-fit">
                            <Flame size={14} className="text-orange-500 animate-pulse" />
                            <span>Speaking Velocity: <strong className="text-slate-800">{ans.speakingSpeed} WPM</strong></span>
                            <span className="text-[10px] text-slate-400">
                              ({ans.speakingSpeed >= 110 && ans.speakingSpeed <= 150 ? 'Ideal pacing' : ans.speakingSpeed < 110 ? 'Slightly slow' : 'Slightly fast'})
                            </span>
                          </div>
                        )}

                        {/* Granular Feedback */}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Round Diagnostics</span>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">{ans.feedback}</p>
                        </div>

                        {/* Matrix subscores block */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 border-t border-slate-200/50 pt-3">
                          {[
                            { name: 'Technical', val: ans.subScores.technical },
                            { name: 'Delivery', val: ans.subScores.communication },
                            { name: 'Grammar', val: ans.subScores.grammar },
                            { name: 'Presence', val: ans.subScores.confidence },
                            { name: 'Keywords', val: ans.subScores.keywordMatch }
                          ].map((item) => (
                            <div key={item.name} className="rounded-lg bg-white border border-slate-200/50 p-2 text-center">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">{item.name}</span>
                              <span className="text-sm font-display font-bold text-slate-900 block mt-1">{item.val}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
