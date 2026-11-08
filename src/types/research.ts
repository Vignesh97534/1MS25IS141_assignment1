export interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface KeyFinding {
  headline: string;
  detail: string;
}

export interface Limitation {
  category: string;
  description: string;
}

export interface FutureDirection {
  area: string;
  recommendation: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface PaperAnalysis {
  title: string;
  authors?: string;
  field: string;
  year?: string;
  summary: string;
  researchProblem: string;
  researchObjectives: string[];
  methodology: {
    overview: string;
    datasetOrMaterials: string;
    systemArchitecture: string;
    evaluationMetrics: string;
    workflowSteps: WorkflowStep[];
  };
  keyFindings: KeyFinding[];
  limitations: Limitation[];
  futureResearchScope: FutureDirection[];
  glossary: GlossaryTerm[];
  studyQuiz: QuizQuestion[];
}

export interface PaperMetadata {
  filename: string;
  pageCount: number;
  wordCount: number;
  charCount: number;
  readingTimeMinutes: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SamplePaper {
  id: string;
  title: string;
  authors: string;
  domain: string;
  year: string;
  summarySnippet: string;
}
