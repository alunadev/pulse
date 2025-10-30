
import React, { useState } from 'react';
import { FlowDiagram } from './FlowDiagram';
import { SparklesIcon } from './icons';

interface ObjectiveStepProps {
  files: File[];
  onSubmit: (objective: string) => void;
  onBack: () => void;
}

const presetObjectives = [
    "Increase onboarding completion rate",
    "Reduce drop-off in the checkout process",
    "Improve usability for first-time users",
    "Enhance clarity and information hierarchy",
];

export const ObjectiveStep: React.FC<ObjectiveStepProps> = ({ files, onSubmit, onBack }) => {
  const [objective, setObjective] = useState('');

  const previews = files.map(file => URL.createObjectURL(file));

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-dark">Define Your Objective</h1>
        <p className="text-slate-600 mt-2 text-lg">What is the primary goal you want to achieve with this user flow?</p>
      </div>
      
      <div className="mt-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="mb-6">
            <h3 className="font-semibold text-slate-700 mb-4">Your Uploaded Flow ({files.length} screens)</h3>
            <FlowDiagram previews={previews} />
        </div>

        <div>
            <label htmlFor="objective" className="block text-sm font-medium text-slate-700">
                Analysis Objective
            </label>
            <textarea
                id="objective"
                rows={4}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm placeholder:text-slate-400 bg-white text-dark"
                placeholder="e.g., 'Increase conversion' or 'Improve user engagement...'"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
            />
        </div>
        
        <div className="mt-4">
            <p className="text-sm text-slate-500 mb-2">Or, start with a preset objective:</p>
            <div className="flex flex-wrap gap-2">
                {presetObjectives.map((preset) => (
                    <button key={preset} onClick={() => setObjective(preset)} className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                        {preset}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => onSubmit(objective)}
          disabled={!objective.trim()}
          className="w-full sm:w-auto px-12 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2"
        >
          <SparklesIcon className="w-5 h-5"/>
          Analyze with AI
        </button>
      </div>
    </div>
  );
};
