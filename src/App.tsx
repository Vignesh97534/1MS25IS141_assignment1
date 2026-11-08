/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ChatDrawer } from './components/ChatDrawer';
import { PaperAnalysis, PaperMetadata } from './types/research';

export default function App() {
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [metadata, setMetadata] = useState<PaperMetadata | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const performAnalysis = async (payload: {
    pdfBase64?: string;
    sampleId?: string;
    rawText?: string;
    filename?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setLoadingStep('Extracting PDF text and document structure...');

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStep('Running few-shot prompt synthesis with Gemini 3.8 Flash...');
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('Deconstructing problem, methodology, findings & limitations...');
      }, 3500);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze the research paper.');
      }

      setAnalysis(data.analysis);
      setMetadata(data.metadata || null);
      setExtractedText(data.extractedText || '');
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || 'An unexpected error occurred during paper analysis.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleAnalyzePdf = (base64: string, filename: string) => {
    performAnalysis({ pdfBase64: base64, filename });
  };

  const handleAnalyzeSample = (sampleId: string) => {
    performAnalysis({ sampleId });
  };

  const handleAnalyzeText = (text: string, title?: string) => {
    performAnalysis({ rawText: text, filename: title || 'pasted_research_paper.txt' });
  };

  const handleNewUpload = () => {
    setAnalysis(null);
    setMetadata(null);
    setExtractedText('');
    setError(null);
    setIsChatOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* App Header */}
      <Header
        analysis={analysis}
        metadata={metadata}
        onNewUpload={handleNewUpload}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {!analysis ? (
          <UploadSection
            onAnalyzePdf={handleAnalyzePdf}
            onAnalyzeSample={handleAnalyzeSample}
            onAnalyzeText={handleAnalyzeText}
            isLoading={isLoading}
            loadingStep={loadingStep}
            error={error}
            onClearError={() => setError(null)}
          />
        ) : (
          <AnalysisDashboard
            analysis={analysis}
            metadata={metadata}
            extractedText={extractedText}
            onOpenChat={() => setIsChatOpen(true)}
          />
        )}
      </main>

      {/* Paper-Grounded Interactive Chatbot Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        analysis={analysis}
        extractedText={extractedText}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} ResearchMate – AI Research Paper Agent for Students & Scholars</p>
          <p className="flex items-center space-x-1">
            <span>Powered by</span>
            <span className="text-indigo-400 font-semibold">Google Gemini 3.8 Flash</span>
            <span>• Few-Shot Academic Rigor</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
