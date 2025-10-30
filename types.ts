
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
