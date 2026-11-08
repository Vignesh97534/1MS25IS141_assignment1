import React, { useState } from 'react';
import { 
  FileText, 
  Target, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Compass, 
  HelpCircle, 
  BookOpen, 
  Copy, 
  Check, 
  Download, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Brain,
  Search,
  ListOrdered
} from 'lucide-react';
import { PaperAnalysis, PaperMetadata } from '../types/research';
import { generateTextReport, downloadTextFile } from '../utils/exportReport';

interface AnalysisDashboardProps {
  analysis: PaperAnalysis;
  metadata: PaperMetadata | null;
  extractedText: string;
  onOpenChat: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  analysis,
  metadata,
  extractedText,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<
    'all' | 'summary' | 'problem' | 'methodology' | 'findings' | 'limitations' | 'study' | 'raw'
  >('all');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [rawTextSearch, setRawTextSearch] = useState('');

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadTxt = () => {
    const txt = generateTextReport(analysis, metadata || undefined);
    const safeTitle = (analysis.title || 'research_analysis')
      .slice(0, 30)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    downloadTextFile(`${safeTitle}_analysis_report.txt`, txt);
  };

  const handleQuizSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const filteredRawText = rawTextSearch
    ? extractedText
        .split('\n')
        .filter(line => line.toLowerCase().includes(rawTextSearch.toLowerCase()))
        .join('\n')
    : extractedText;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Paper Header / Metadata Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {analysis.field || 'Academic Research'}
              </span>
              {analysis.year && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Published: {analysis.year}
                </span>
              )}
              {metadata && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {metadata.pageCount} Pages • ~{metadata.wordCount.toLocaleString()} Words
                </span>
              )}
              {metadata?.readingTimeMinutes && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  ~{metadata.readingTimeMinutes} min reading time
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug font-serif">
              {analysis.title}
            </h1>

            {analysis.authors && (
              <p className="text-sm text-slate-400 font-sans">
                <span className="font-semibold text-slate-300">Authors:</span> {analysis.authors}
              </p>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="flex flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/40 transition active:scale-95"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report (.txt)
            </button>
            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-950/40 transition active:scale-95"
            >
              <Brain className="w-4 h-4 mr-2" />
              Ask Paper Chatbot
            </button>
          </div>
        </div>

        {/* Quick Tab Selector */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {[
            { id: 'all', label: 'Complete Analysis', icon: Sparkles },
            { id: 'summary', label: '1. Summary', icon: FileText },
            { id: 'problem', label: '2. Problem & Objectives', icon: Target },
            { id: 'methodology', label: '3. Methodology', icon: Layers },
            { id: 'findings', label: '4. Key Findings', icon: TrendingUp },
            { id: 'limitations', label: '5. Limitations & Future Scope', icon: AlertTriangle },
            { id: 'study', label: '6. Student Study Guide & Quiz', icon: HelpCircle },
            { id: 'raw', label: 'Raw Extracted Text', icon: BookOpen },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 mr-1.5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: RESEARCH SUMMARY */}
      {(activeTab === 'all' || activeTab === 'summary') && (
        <section id="summary" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-sans">Research Paper Summary</h2>
                <p className="text-xs text-slate-400">High-level executive distillation and core contribution</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(analysis.summary, 'summary')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Copy Summary"
            >
              {copiedSection === 'summary' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-base text-slate-200 leading-relaxed font-serif text-lg bg-slate-950/40 p-5 rounded-xl border border-slate-800/80">
              {analysis.summary}
            </p>
          </div>
        </section>
      )}

      {/* SECTION 2 & 3: RESEARCH PROBLEM & OBJECTIVES */}
      {(activeTab === 'all' || activeTab === 'problem') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Research Problem */}
          <section id="problem" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-sans">Research Problem</h2>
                    <p className="text-xs text-slate-400">Core scientific challenge & literature gap</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(analysis.researchProblem, 'problem')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Copy Research Problem"
                >
                  {copiedSection === 'problem' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <p className="text-sm text-slate-200 leading-relaxed">
                  {analysis.researchProblem}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-500 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
              Addresses the bottleneck why prior literature was insufficient.
            </div>
          </section>

          {/* Research Objectives */}
          <section id="objectives" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <ListOrdered className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-sans">Research Objectives</h2>
                    <p className="text-xs text-slate-400">Explicit targets, hypotheses, and milestones</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(analysis.researchObjectives.join('\n'), 'objectives')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Copy Objectives"
                >
                  {copiedSection === 'objectives' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-2.5">
                {analysis.researchObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <span className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-500 flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
              Provides testable goals that guide the experimental framework.
            </div>
          </section>
        </div>
      )}

      {/* SECTION 4: METHODOLOGY & WORKFLOW */}
      {(activeTab === 'all' || activeTab === 'methodology') && (
        <section id="methodology" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-sans">Methodology & Experimental Setup</h2>
                <p className="text-xs text-slate-400">Architectures, datasets, experimental controls & workflow</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(JSON.stringify(analysis.methodology, null, 2), 'methodology')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Copy Methodology"
            >
              {copiedSection === 'methodology' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Overview text */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              Methodological Overview
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              {analysis.methodology.overview}
            </p>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                Data / Materials Cohort
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.methodology.datasetOrMaterials}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-1">
                System & Architecture
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.methodology.systemArchitecture}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Evaluation Metrics
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.methodology.evaluationMetrics}
              </p>
            </div>
          </div>

          {/* Visual Workflow Steps Roadmap */}
          {analysis.methodology.workflowSteps && analysis.methodology.workflowSteps.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center">
                <ChevronRight className="w-4 h-4 mr-1 text-indigo-400" />
                Step-by-Step Experimental Workflow
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {analysis.methodology.workflowSteps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 relative hover:border-indigo-500/40 transition group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Stage 0{step.stepNumber}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-indigo-300 transition">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECTION 5: KEY FINDINGS */}
      {(activeTab === 'all' || activeTab === 'findings') && (
        <section id="findings" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-sans">Key Findings & Empirical Results</h2>
                <p className="text-xs text-slate-400">Quantified outcomes, benchmarks, and statistical discoveries</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(analysis.keyFindings.map(k => `${k.headline}: ${k.detail}`).join('\n'), 'findings')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Copy Key Findings"
            >
              {copiedSection === 'findings' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.keyFindings.map((finding, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-950/50 border border-slate-800/90 hover:border-emerald-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white">{finding.headline}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-7">
                    {finding.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 6 & 7: LIMITATIONS & FUTURE RESEARCH SCOPE */}
      {(activeTab === 'all' || activeTab === 'limitations') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Limitations */}
          <section id="limitations" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-sans">Research Limitations</h2>
                  <p className="text-xs text-slate-400">Threats to validity, biases & constraints</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(analysis.limitations.map(l => `[${l.category}] ${l.description}`).join('\n'), 'limitations')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="Copy Limitations"
              >
                {copiedSection === 'limitations' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-3">
              {analysis.limitations.map((lim, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-1.5">
                    {lim.category}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {lim.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Future Scope */}
          <section id="futureScope" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-sans">Future Research Scope</h2>
                  <p className="text-xs text-slate-400">Recommended follow-ups & open questions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(analysis.futureResearchScope.map(f => `${f.area}: ${f.recommendation}`).join('\n'), 'futureScope')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="Copy Future Scope"
              >
                {copiedSection === 'futureScope' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-3">
              {analysis.futureResearchScope.map((scope, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <h3 className="text-xs font-bold text-indigo-300">{scope.area}</h3>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed pl-4">
                    {scope.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* SECTION 8: STUDENT STUDY GUIDE & COMPREHENSION QUIZ */}
      {(activeTab === 'all' || activeTab === 'study') && (
        <section id="study" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-sans">Student Study Guide & Self-Quiz</h2>
                <p className="text-xs text-slate-400">Terminology glossary and interactive comprehension check</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              For Learners & Researchers
            </span>
          </div>

          {/* Key Terminology Glossary */}
          {analysis.glossary && analysis.glossary.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-indigo-400" />
                Key Academic Concepts Decoded
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.glossary.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                    <h4 className="text-xs font-bold text-indigo-400 mb-1 font-mono">
                      {item.term}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Comprehension Quiz */}
          {analysis.studyQuiz && analysis.studyQuiz.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center">
                <HelpCircle className="w-4 h-4 mr-2 text-emerald-400" />
                Quick Comprehension Check
              </h3>

              <div className="space-y-6">
                {analysis.studyQuiz.map((q, qIndex) => {
                  const hasAnswered = selectedQuizAnswers[qIndex] !== undefined;
                  const selectedIdx = selectedQuizAnswers[qIndex];
                  const isCorrect = selectedIdx === q.correctOptionIndex;

                  return (
                    <div key={qIndex} className="p-5 rounded-xl bg-slate-950/40 border border-slate-800/90 space-y-3">
                      <div className="flex items-start space-x-2">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          Q{qIndex + 1}
                        </span>
                        <p className="text-sm font-semibold text-white">{q.question}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIndex) => {
                          const isOptionSelected = selectedIdx === optIndex;
                          const isOptionCorrect = optIndex === q.correctOptionIndex;

                          let buttonStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

                          if (hasAnswered) {
                            if (isOptionCorrect) {
                              buttonStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200';
                            } else if (isOptionSelected) {
                              buttonStyle = 'bg-rose-950/70 border-rose-500 text-rose-200';
                            } else {
                              buttonStyle = 'bg-slate-900/40 border-slate-850 text-slate-500 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              type="button"
                              onClick={() => handleQuizSelect(qIndex, optIndex)}
                              className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${buttonStyle}`}
                            >
                              <span>{opt}</span>
                              {hasAnswered && isOptionCorrect && (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                          isCorrect ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300' : 'bg-slate-900 border border-slate-800 text-slate-300'
                        }`}>
                          <span className="font-bold mr-1">
                            {isCorrect ? 'Correct!' : 'Explanation:'}
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* EXTRACTED RAW TEXT VIEWER */}
      {activeTab === 'raw' && (
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-400" />
                Raw Extracted Paper Text
              </h2>
              <p className="text-xs text-slate-400">
                Inspected text layer parsed from the PDF document ({extractedText.length.toLocaleString()} characters)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter text..."
                  value={rawTextSearch}
                  onChange={(e) => setRawTextSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
                />
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(extractedText, 'rawText')}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                {copiedSection === 'rawText' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                Copy Text
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
            {filteredRawText || 'No text matches your search query.'}
          </div>
        </section>
      )}
    </div>
  );
};
