import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Download, 
  FileText, 
  Upload, 
  MessageSquare, 
  ChevronDown,
  Check,
  BookOpen
} from 'lucide-react';
import { PaperAnalysis, PaperMetadata } from '../types/research';
import { generateTextReport, downloadTextFile, downloadMarkdownFile } from '../utils/exportReport';

interface HeaderProps {
  analysis: PaperAnalysis | null;
  metadata: PaperMetadata | null;
  onNewUpload: () => void;
  onOpenChat: () => void;
  isChatOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  analysis,
  metadata,
  onNewUpload,
  onOpenChat,
  isChatOpen
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadTxt = () => {
    if (!analysis) return;
    const txt = generateTextReport(analysis, metadata || undefined);
    const safeTitle = (analysis.title || 'research_analysis')
      .slice(0, 30)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    downloadTextFile(`${safeTitle}_analysis_report.txt`, txt);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
    setShowExportMenu(false);
  };

  const handleDownloadMd = () => {
    if (!analysis) return;
    const safeTitle = (analysis.title || 'research_analysis')
      .slice(0, 30)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    downloadMarkdownFile(`${safeTitle}_analysis_report.md`, analysis, metadata || undefined);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
    setShowExportMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onNewUpload}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  Research<span className="text-indigo-400">Mate</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI Research Paper Agent & Student Analyst</p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {analysis && (
              <>
                {/* Chatbot toggle button */}
                <button
                  type="button"
                  onClick={onOpenChat}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isChatOpen
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                  title="Ask questions to the Paper AI Chatbot"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5 text-indigo-300" />
                  <span className="hidden md:inline">Paper</span> Chatbot
                </button>

                {/* Download Menu */}
                <div className="relative">
                  <div className="inline-flex rounded-lg shadow-sm">
                    <button
                      type="button"
                      onClick={handleDownloadTxt}
                      className="inline-flex items-center px-3 py-1.5 rounded-l-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition shadow-sm"
                      title="Download Analysis as Text File (.txt)"
                    >
                      {downloadSuccess ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5 text-emerald-200" />
                          Downloaded!
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1.5" />
                          Download Report (.txt)
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="inline-flex items-center px-2 py-1.5 rounded-r-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm border-l border-emerald-800 transition"
                      aria-label="Export options"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Export Formats
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadTxt}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-white text-left transition"
                      >
                        <FileText className="w-4 h-4 mr-2.5 text-emerald-400" />
                        <div>
                          <p className="font-medium">Plain Text (.txt)</p>
                          <p className="text-xs text-slate-400">Structured ASCII format</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadMd}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-white text-left transition"
                      >
                        <BookOpen className="w-4 h-4 mr-2.5 text-indigo-400" />
                        <div>
                          <p className="font-medium">Markdown (.md)</p>
                          <p className="text-xs text-slate-400">Formatted for Obsidian & Notion</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload another paper button */}
                <button
                  type="button"
                  onClick={onNewUpload}
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium border border-slate-700 transition"
                  title="Upload or pick another research paper"
                >
                  <Upload className="w-4 h-4 mr-1.5 text-slate-400" />
                  New Paper
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
