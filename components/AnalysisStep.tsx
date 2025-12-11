import React, { useState, useEffect } from 'react';
import { PulseLoader } from './icons';

interface AnalysisStepProps {
  objective: string;
  fileCount: number;
}

const loadingMessages = [
  "Initializing Gemini 3 Pro Reasoning...",
  "Analyzing visual hierarchy and components...",
  "Reasoning about user interaction patterns...",
  "Evaluating against persona constraints...",
  "Identifying friction points and opportunities...",
  "Simulating user journeys...",
  "Synthesizing actionable recommendations...",
  "Finalizing your strategic report...",
];

export const AnalysisStep: React.FC<AnalysisStepProps> = ({ objective, fileCount }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="w-full max-w-lg mx-auto text-center mt-12">
      <div className="py-8 relative">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
          <div className="relative">
            <PulseLoader className="w-16 h-16 mx-auto text-primary" />
          </div>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-4">Analyzing Flow</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
        Processing <span className="font-semibold text-gray-700">{fileCount} screens</span> for objective: <span className="text-primary">{objective}</span>
      </p>

      <div className="mt-8 flex justify-center">
          <div className="px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-xs font-mono text-primary animate-pulse">
              {loadingMessages[currentMessageIndex]}
          </div>
      </div>
    </div>
  );
};