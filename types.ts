
export type Step = 'upload' | 'objective' | 'analyzing' | 'report';

export interface Recommendation {
  title: string;
  description: string;
  screenIndex: number;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
}

export interface Benchmark {
  company: string;
  description: string;
}

export type AccessibilitySeverity = 'Critical' | 'Serious' | 'Moderate' | 'Minor';

export interface AccessibilityIssue {
  title: string;
  description: string;
  recommendation: string;
  screenIndex: number;
  severity: AccessibilitySeverity;
}

export interface AnalysisReport {
  overallScore: number;
  generalAnalysis: string;
  positivePoints: string[];
  recommendations: Recommendation[];
  benchmarks: Benchmark[];
  accessibilityReport: AccessibilityIssue[];
}

// --- Hierarchy Definitions (Supabase-ready) ---

export type WorkflowStatus = 'draft' | 'analyzing' | 'completed';

export interface Workflow {
  id: string;
  projectId: string;
  name: string;
  updatedAt: Date;
  status: WorkflowStatus;
  // In a real DB, these would be separate tables or JSONB columns
  step: Step;
  files: File[]; 
  objective: string;
  persona: string;
  sourceType: 'images' | 'video';
  report: AnalysisReport | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  workflows: Workflow[]; // In a real DB, this is a relation, not a direct property
}
