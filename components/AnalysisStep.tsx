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
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="py-8">
        <PulseLoader className="w-24 h-24 mx-auto text-primary" />
      </div>

      <h1 className="text-3xl font-bold text-dark mt-4">AI Thinking in Progress</h1>
      <p className="text-slate-600 mt-2 text-lg">
        Pulse is analyzing your <span className="font-semibold">{fileCount} screens</span> to help you <span className="font-semibold text-primary">{objective}</span>.
      </p>

      <div className="mt-8 h-6 text-slate-500 font-medium transition-opacity duration-500 animate-pulse">
        {loadingMessages[currentMessageIndex]}
      </div>

      <p className="text-sm text-slate-400 mt-12">This might take a minute for deep reasoning...</p>
    </div>
  );
};