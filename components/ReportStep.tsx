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

const SeverityTag: React.FC<{ severity: AccessibilitySeverity }> = ({ severity }) => {
    const colorClasses = {
        Critical: 'bg-red-50 text-red-700 border-red-200',
        Serious: 'bg-orange-50 text-orange-700 border-orange-200',
        Moderate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        Minor: 'bg-blue-50 text-blue-700 border-blue-200',
    };
     return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${colorClasses[severity]}`}>
            {severity}
        </span>
    );
};

const ScoreDonut: React.FC<{ score: number }> = ({ score }) => {
  const percentage = score * 10;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const scoreColor = score >= 8 ? 'text-emerald-500' : score >= 5 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle className="text-gray-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
        <circle className={scoreColor} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
      </svg>
      <span className={`text-xl font-bold ${scoreColor}`}>{score}</span>
    </div>
  );
};

const RefineBox: React.FC<{ onRefine: (feedback: string) => Promise<void> }> = ({ onRefine }) => {
    const [feedback, setFeedback] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    const handleRefine = async () => {
        if (!feedback.trim()) return;
        setIsRefining(true);
        try { await onRefine(feedback); setFeedback(''); } catch (e) { console.error(e); } finally { setIsRefining(false); }
    };

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Refine Analysis</h4>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="E.g. Focus more on the color contrast..."
                    className="flex-1 text-xs border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    disabled={isRefining}
                />
                <button 
                    onClick={handleRefine}
                    disabled={!feedback.trim() || isRefining}
                    className="bg-gray-900 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                    {isRefining ? '...' : 'Update'}
                </button>
            </div>
        </div>
    );
};

export const ReportStep: React.FC<ReportStepProps> = ({ report, files, onStartOver, onRefine }) => {
  const [highlightedRecIndex, setHighlightedRecIndex] = useState<number | null>(null);

  if (!report) return null;

  const previews = files.map(file => URL.createObjectURL(file));

  const handleRecommendationClick = (index: number) => {
    const element = document.getElementById(`rec-${index}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedRecIndex(index);
        setTimeout(() => setHighlightedRecIndex(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Row: Executive Summary & Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col sm:flex-row gap-6">
               <div className="flex flex-col items-center justify-center border-r border-gray-100 pr-6 min-w-[120px]">
                   <ScoreDonut score={report.overallScore} />
                   <span className="text-xs font-medium text-gray-500 mt-2">Overall Score</span>
               </div>
               <div className="flex-1">
                   <h3 className="text-sm font-semibold text-gray-900 mb-2">Executive Summary</h3>
                   <p className="text-sm text-gray-600 leading-relaxed">{report.generalAnalysis}</p>
                   
                   <div className="mt-4 flex gap-4">
                       {report.positivePoints.map((point, idx) => (
                           <div key={idx} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-medium border border-emerald-100">
                               <CheckCircleIcon className="w-3.5 h-3.5" />
                               {point}
                           </div>
                       ))}
                   </div>
               </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10"><ChartBarIcon className="w-24 h-24 text-primary"/></div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 relative z-10">Matrix</h3>
              <div className="relative z-10 h-full pb-4">
                  <PrioritizationMatrix recommendations={report.recommendations} onRecommendationClick={handleRecommendationClick} />
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column: Recommendations */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center gap-2 mb-2">
                 <TargetIcon className="w-4 h-4 text-primary" />
                 <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Recommendations</h2>
             </div>

             <div className="space-y-4">
                {report.recommendations.map((rec, index) => (
                    <div 
                        key={index} 
                        id={`rec-${index}`} 
                        className={`bg-white border rounded-lg shadow-sm overflow-hidden transition-all duration-500 ${highlightedRecIndex === index ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}
                    >
                        <div className="p-5 flex gap-4">
                             <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-mono font-medium">
                                 S{rec.screenIndex + 1}
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between items-start">
                                     <h3 className="text-sm font-semibold text-gray-900">{rec.title}</h3>
                                     <div className="flex gap-2">
                                         <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${rec.impact === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>Imp: {rec.impact}</span>
                                         <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-gray-50 text-gray-600 border border-gray-200">Eff: {rec.effort}</span>
                                     </div>
                                 </div>
                                 <p className="text-sm text-gray-600 mt-1 leading-relaxed">{rec.description}</p>
                             </div>
                        </div>
                        {/* Inline Preview (Optional) */}
                         <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center gap-4">
                             <span className="text-xs text-gray-400 font-mono">Reference Screen:</span>
                             <div className="h-10 w-auto rounded border border-gray-200 overflow-hidden">
                                 <img src={previews[rec.screenIndex]} className="h-full object-cover" />
                             </div>
                         </div>
                    </div>
                ))}
             </div>
          </div>

          {/* Right Sidebar: Details & Accessibility */}
          <div className="space-y-6">
              
              {/* Benchmarks */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                      <BuildingOfficeIcon className="w-3.5 h-3.5 text-gray-500"/>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry Benchmarks</h3>
                  </div>
                  <div className="p-4 space-y-4">
                      {report.benchmarks.map((b, i) => (
                          <div key={i} className="flex gap-3">
                              <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">{b.company[0]}</div>
                              <div>
                                  <h4 className="text-xs font-bold text-gray-900">{b.company}</h4>
                                  <p className="text-xs text-gray-500 leading-snug mt-0.5">{b.description}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

               {/* Accessibility */}
               <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                      <AccessibilityIcon className="w-3.5 h-3.5 text-gray-500"/>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Accessibility</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                      {report.accessibilityReport.length > 0 ? report.accessibilityReport.map((issue, i) => (
                          <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-xs font-medium text-gray-900">{issue.title}</span>
                                  <SeverityTag severity={issue.severity} />
                              </div>
                              <p className="text-[11px] text-gray-500 leading-snug">{issue.description}</p>
                          </div>
                      )) : (
                          <div className="p-4 text-xs text-gray-400 italic">No critical issues detected.</div>
                      )}
                  </div>
              </div>

              <RefineBox onRefine={onRefine} />

          </div>
      </div>
    </div>
  );
};