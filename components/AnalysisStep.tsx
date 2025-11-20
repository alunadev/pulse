
import React, { useState, useEffect } from 'react';

interface AnalysisStepProps {
  objective: string;
  fileCount: number;
}

const loadingMessages = [
  "Initializing Gemini 2.5 Flash Thinking...",
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
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>

      <h1 className="text-3xl font-bold text-dark mt-8">AI Thinking in Progress</h1>
      <p className="text-slate-600 mt-2 text-lg">
        Pulse is analyzing your <span className="font-semibold">{fileCount} screens</span> to help you <span className="font-semibold text-primary">{objective}</span>.
      </p>

      <div className="mt-8 h-6 text-slate-500 font-medium transition-opacity duration-500">
        {loadingMessages[currentMessageIndex]}
      </div>

      <p className="text-sm text-slate-400 mt-12">This might take up to 30 seconds for deep reasoning...</p>
    </div>
  );
};
