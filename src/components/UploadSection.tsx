import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  Cpu, 
  Sun, 
  BrainCircuit, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  BookMarked,
  FileCode,
  CheckCircle2
} from 'lucide-react';
import { SamplePaper } from '../types/research';

interface UploadSectionProps {
  onAnalyzePdf: (base64: string, filename: string) => void;
  onAnalyzeSample: (sampleId: string) => void;
  onAnalyzeText: (text: string, title?: string) => void;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  onClearError: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onAnalyzePdf,
  onAnalyzeSample,
  onAnalyzeText,
  isLoading,
  loadingStep,
  error,
  onClearError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [samplePapers, setSamplePapers] = useState<SamplePaper[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [manualText, setManualText] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [localFileError, setLocalFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch sample papers on mount
  useEffect(() => {
    fetch('/api/sample-papers')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.papers) {
          setSamplePapers(data.papers);
        }
      })
      .catch(err => console.error('Failed to load sample papers:', err));
  }, []);

  const handleFileProcess = (file: File) => {
    setLocalFileError(null);
    onClearError();

    // Validate file type
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setLocalFileError('Invalid file type. Please upload a valid PDF research paper document (.pdf).');
      return;
    }

    // Validate size (max 35MB)
    const maxSize = 35 * 1024 * 1024;
    if (file.size > maxSize) {
      setLocalFileError('File size exceeds the 35MB limit. Please upload a smaller research paper or extract sections.');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onAnalyzePdf(result, file.name);
    };
    reader.onerror = () => {
      setLocalFileError('Failed to read the PDF file. Please ensure it is not locked or corrupted.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim() || manualText.trim().length < 50) {
      setLocalFileError('Please enter at least 50 characters of paper text (abstract, introduction, or full paper body).');
      return;
    }
    setLocalFileError(null);
    onAnalyzeText(manualText, manualTitle);
  };

  const sampleIcons: Record<string, React.ReactNode> = {
    'sample-ml-healthcare': <Cpu className="w-5 h-5 text-indigo-400" />,
    'sample-renewable-energy': <Sun className="w-5 h-5 text-amber-400" />,
    'sample-transformer-nlp': <BrainCircuit className="w-5 h-5 text-emerald-400" />,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
          Few-Shot Prompt Engineered Academic Engine
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
          Decipher Complex Research Papers with <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">Gemini AI</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
          Upload any academic PDF to extract research objectives, methodologies, quantified findings, limitations, and future directions. Interrogate the paper with a grounded AI chat agent.
        </p>
      </div>

      {/* Error Banner */}
      {(error || localFileError) && (
        <div className="mb-8 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 flex items-start space-x-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-rose-300">Analysis Error</p>
            <p className="mt-0.5">{error || localFileError}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLocalFileError(null);
              onClearError();
            }}
            className="text-xs text-rose-400 hover:text-rose-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Overlay / Progress Modal */}
      {isLoading && (
        <div className="mb-10 p-8 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-sky-500/10 to-emerald-500/5 animate-pulse" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="w-16 h-16 rounded-2xl border-4 border-indigo-500/30 border-t-indigo-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 font-sans">
              Analyzing Research Paper
            </h3>
            <p className="text-sm text-indigo-300 font-medium mb-4">
              {loadingStep || 'Synthesizing academic content...'}
            </p>

            {/* Step Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 max-w-xl mx-auto text-xs text-slate-400">
              <span className="flex items-center text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> PDF Parsing
              </span>
              <span className="text-slate-600">→</span>
              <span className="flex items-center text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Few-Shot Framework
              </span>
              <span className="text-slate-600">→</span>
              <span className="flex items-center text-slate-300">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-sky-400 animate-pulse" /> Extracting 7 Core Sections
              </span>
            </div>
            
            <p className="text-xs text-slate-500 mt-5 italic max-w-md">
              "ResearchMate uses calibrated few-shot peer-review prompting to extract problem, methodology, findings & limitations."
            </p>
          </div>
        </div>
      )}

      {/* Main Upload Card */}
      {!isLoading && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm mb-12">
          {/* Tab Selector */}
          <div className="flex border-b border-slate-800 bg-slate-950/40">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center transition border-b-2 ${
                activeTab === 'upload'
                  ? 'border-indigo-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Upload className="w-4 h-4 mr-2 text-indigo-400" />
              Upload Research Paper (PDF)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center transition border-b-2 ${
                activeTab === 'text'
                  ? 'border-indigo-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <FileCode className="w-4 h-4 mr-2 text-emerald-400" />
              Paste Paper Text / Abstract
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'upload' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                      : 'border-slate-700 hover:border-indigo-500/70 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center shadow-inner mb-4 group-hover:scale-105 transition">
                    <FileText className="w-8 h-8 text-indigo-400" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">
                    Drag and drop your academic PDF here
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Or <span className="text-indigo-400 font-semibold underline underline-offset-2">browse files</span> from your computer
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      PDF Format (.pdf)
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                      Up to 35 MB
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center">
                      <BookMarked className="w-3.5 h-3.5 mr-1 text-amber-400" />
                      Full Articles, Preprints & Theses
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleManualTextSubmit} className="space-y-4">
                <div>
                  <label htmlFor="paper-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Paper Title (Optional)
                  </label>
                  <input
                    id="paper-title"
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Scalable Multi-Head Attention for Machine Translation"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="paper-body" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Paper Content / Sections / Abstract *
                  </label>
                  <textarea
                    id="paper-body"
                    rows={8}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Paste the abstract, methodology, results, or full text of the academic paper here..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 font-mono text-xs transition"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Tip: You can paste text directly from arXiv preprints, PubMed abstracts, or thesis chapters.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!manualText.trim()}
                  className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-emerald-300" />
                  Analyze Pasted Research Text
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Curated Sample Papers Showcase */}
      {!isLoading && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center">
                <BookMarked className="w-5 h-5 mr-2 text-indigo-400" />
                Or Try Sample Research Papers
              </h2>
              <p className="text-xs text-slate-400">
                1-click demo to test the few-shot analysis engine with benchmark papers
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Instant 1-Click
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {samplePapers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => onAnalyzeSample(paper.id)}
                className="group relative p-5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-indigo-500/40 transition">
                      {sampleIcons[paper.id] || <FileText className="w-5 h-5 text-indigo-400" />}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                      {paper.year}
                    </span>
                  </div>

                  <span className="inline-block text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                    {paper.domain}
                  </span>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-2 leading-snug mb-2">
                    {paper.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {paper.summarySnippet}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-300 group-hover:text-indigo-400 transition">
                  <span>Analyze Paper</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Few-Shot Prompting Academic Assurance */}
      <div className="mt-12 p-6 rounded-2xl bg-slate-900/30 border border-slate-800/60">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
          Few-Shot Prompt Engineering Architecture
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          ResearchMate conditions Gemini 3.8 Flash with structured few-shot exemplars across machine learning, materials science, and computational linguistics. Every target paper is systematically dissected into seven peer-review pillars: Research Problem, Objectives, Methodology, Quantified Findings, Limitations, and Future Scope.
        </p>
      </div>
    </div>
  );
};
