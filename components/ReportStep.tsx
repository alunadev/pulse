
import React, { useState } from 'react';
import { AnalysisReport, Recommendation, AccessibilitySeverity } from '../types';
import { CheckCircleIcon, SparklesIcon, SpinnerIcon, TargetIcon, ThumbsUpIcon, BuildingOfficeIcon, ChartBarIcon, AccessibilityIcon } from './icons';
import { FlowDiagram } from './FlowDiagram';
import { PrioritizationMatrix } from './PrioritizationMatrix';

interface ReportStepProps {
  report: AnalysisReport | null;
  files: File[];
  onStartOver: () => void;
  onRefine: (feedback: string) => Promise<void>;
}

const ImpactEffortTag: React.FC<{
  label: string;
  value: 'High' | 'Medium' | 'Low';
}> = ({ label, value }) => {
    const colorClasses = {
        High: 'bg-red-100 text-red-800',
        Medium: 'bg-yellow-100 text-yellow-800',
        Low: 'bg-green-100 text-green-800',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[value]}`}>
            {label}: {value}
        </span>
    );
};

const SeverityTag: React.FC<{ severity: AccessibilitySeverity }> = ({ severity }) => {
    const colorClasses = {
        Critical: 'bg-red-100 text-red-800',
        Serious: 'bg-orange-100 text-orange-800',
        Moderate: 'bg-yellow-100 text-yellow-800',
        Minor: 'bg-sky-100 text-sky-800',
    };
     return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[severity]}`}>
            {severity}
        </span>
    );
};

const ScoreDonut: React.FC<{ score: number }> = ({ score }) => {
  const percentage = score * 10;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const scoreColor =
    score >= 8
      ? 'text-emerald-500'
      : score >= 5
      ? 'text-amber-500'
      : 'text-red-500';

  return (
    <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
      <svg className="absolute w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-slate-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className={scoreColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
      <span className="absolute bottom-6 text-sm text-slate-500">/ 10</span>
    </div>
  );
};


const RefineAnalysis: React.FC<{ onRefine: (feedback: string) => Promise<void> }> = ({ onRefine }) => {
    const [feedback, setFeedback] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRefineClick = async () => {
        if (!feedback.trim()) return;
        setIsRefining(true);
        setError(null);
        try {
            await onRefine(feedback);
            setFeedback(''); // Clear input on success
        } catch (e: any) {
            setError(e.message || 'Failed to refine the analysis. Please try again.');
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm mt-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Refine Analysis</h2>
            <p className="text-slate-600 mb-4 text-sm">Not quite right? Provide feedback and let the AI try again.</p>
            
            <textarea
                rows={3}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder:text-slate-400"
                placeholder="e.g., 'Focus more on the checkout button's color' or 'Are there better examples than Figma for this?'"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isRefining}
            />

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            <div className="mt-4 text-right">
                <button
                    onClick={handleRefineClick}
                    disabled={!feedback.trim() || isRefining}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                    {isRefining ? (
                        <>
                            <SpinnerIcon />
                            Refining...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5"/>
                            Refine with AI
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};


export const ReportStep: React.FC<ReportStepProps> = ({ report, files, onStartOver, onRefine }) => {
  const [highlightedRecIndex, setHighlightedRecIndex] = useState<number | null>(null);

  if (!report) {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Analysis Failed</h2>
            <p className="text-slate-600 mt-2">We couldn't generate a report. Please try again.</p>
            <button onClick={onStartOver} className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
                Start Over
            </button>
        </div>
    );
  }

  const previews = files.map(file => URL.createObjectURL(file));

  const handleRecommendationClick = (index: number) => {
    const element = document.getElementById(`rec-${index}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedRecIndex(index);
        setTimeout(() => {
            setHighlightedRecIndex(null);
        }, 2500); // Highlight for 2.5 seconds
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-800">UX Analysis Report</h1>
        <button onClick={onStartOver} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-all">
          New Analysis
        </button>
      </div>

      <div className="mb-8 bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Analyzed User Flow</h2>
        <FlowDiagram previews={previews} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Executive Summary</h2>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <ScoreDonut score={report.overallScore} />
                    <p className="text-slate-600 mt-2">{report.generalAnalysis}</p>
                </div>
            </div>

            {/* Prioritization Matrix */}
             <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <ChartBarIcon />
                    <h2 className="text-2xl font-semibold text-slate-800">Prioritization Matrix</h2>
                </div>
                <p className="text-slate-600 mb-6 text-sm">Here's a strategic overview of the recommendations based on their potential impact and the effort required to implement them. Click an item to jump to its details.</p>
                <PrioritizationMatrix recommendations={report.recommendations} onRecommendationClick={handleRecommendationClick} />
            </div>

            {/* Recommendations */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <TargetIcon />
                    <h2 className="text-2xl font-semibold text-slate-800">Actionable Recommendations</h2>
                </div>
                <div className="space-y-6">
                {report.recommendations.map((rec, index) => (
                    <div 
                        key={index} 
                        id={`rec-${index}`} 
                        className={`border border-slate-200 rounded-xl shadow-sm transition-all duration-1000 ease-in-out ${highlightedRecIndex === index ? 'bg-indigo-50 shadow-indigo-200 shadow-lg' : 'bg-white'}`}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="text-lg font-semibold text-slate-900">{rec.title}</h3>
                                <span className="flex-shrink-0 text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">Screen {rec.screenIndex + 1}</span>
                            </div>
                            <p className="mt-2 text-slate-600">{rec.description}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <ImpactEffortTag label="Impact" value={rec.impact} />
                                <ImpactEffortTag label="Effort" value={rec.effort} />
                            </div>
                        </div>
                         {previews[rec.screenIndex] && (
                            <div className="bg-slate-50 p-4 border-t border-slate-200">
                                <img src={previews[rec.screenIndex]} alt={`Screen ${rec.screenIndex + 1}`} className="max-h-80 mx-auto rounded-lg border border-slate-300" />
                            </div>
                         )}
                    </div>
                ))}
                </div>
            </div>
        </div>

        <div className="space-y-8 lg:mt-0">
            {/* What's Working Well */}
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                 <div className="flex items-center gap-3 mb-4">
                    <ThumbsUpIcon />
                    <h2 className="text-xl font-semibold text-slate-800">What's Working Well</h2>
                </div>
                <ul className="space-y-3">
                    {report.positivePoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircleIcon />
                            <span className="ml-2 text-slate-600">{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Benchmarks */}
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <BuildingOfficeIcon />
                    <h2 className="text-xl font-semibold text-slate-800">Best Practice Benchmarks</h2>
                </div>
                <div className="space-y-5">
                {report.benchmarks.map((benchmark, index) => (
                    <div key={index}>
                        <h4 className="font-semibold text-slate-800">{benchmark.company}</h4>
                        <p className="text-slate-600 text-sm mt-1">{benchmark.description}</p>
                    </div>
                ))}
                </div>
            </div>
            
            {/* Accessibility Scan */}
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <AccessibilityIcon />
                    <h2 className="text-xl font-semibold text-slate-800">Accessibility Scan</h2>
                </div>
                 <div className="space-y-5">
                    {report.accessibilityReport && report.accessibilityReport.length > 0 ? (
                        report.accessibilityReport.map((issue, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-semibold text-slate-800">{issue.title}</h4>
                                    <SeverityTag severity={issue.severity} />
                                </div>
                                 <p className="text-xs text-slate-500 mt-1">Screen {issue.screenIndex + 1}</p>
                                <p className="text-slate-600 text-sm mt-2">{issue.description}</p>
                                <p className="text-sm mt-2 font-medium text-indigo-700 bg-indigo-50 p-2 rounded-md">Recommendation: <span className="font-normal text-slate-700">{issue.recommendation}</span></p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500 italic">No accessibility issues were automatically detected.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
       <RefineAnalysis onRefine={onRefine} />
    </div>
  );
};
