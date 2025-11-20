
import React, { useState } from 'react';
import { FlowDiagram } from './FlowDiagram';
import { SparklesIcon } from './icons';

interface ObjectiveStepProps {
  files: File[];
  onSubmit: (objective: string, persona: string) => void;
  onBack: () => void;
}

const presetObjectives = [
    "Increase onboarding completion rate",
    "Reduce drop-off in the checkout process",
    "Improve usability for first-time users",
    "Enhance clarity and information hierarchy",
];

export const PERSONAS = [
  { id: 'standard', label: 'Standard Design Review', description: 'Balanced analysis of usability, visuals, and best practices.' },
  { id: 'conversion', label: 'Conversion Optimizer', description: 'Ruthless focus on funnel drop-off, CTAs, and business metrics.' },
  { id: 'accessibility', label: 'Accessibility Audit', description: 'Strict WCAG 2.1 compliance, contrast, and screen-reader friendliness.' },
  { id: 'copy', label: 'Content & Copywriter', description: 'Focus on tone of voice, clarity, and information architecture.' },
];

export const ObjectiveStep: React.FC<ObjectiveStepProps> = ({ files, onSubmit, onBack }) => {
  const [objective, setObjective] = useState('');
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0].id);

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
             <label htmlFor="objective" className="block text-sm font-medium text-slate-700 mb-2">
                Analysis Objective
            </label>
            <textarea
                id="objective"
                rows={4}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm placeholder:text-slate-400 bg-white text-dark p-3 border"
                placeholder="e.g., 'Increase conversion' or 'Improve user engagement...'"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
            />
            <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2">Quick presets:</p>
                <div className="flex flex-wrap gap-2">
                    {presetObjectives.slice(0, 3).map((preset) => (
                        <button key={preset} onClick={() => setObjective(preset)} className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                            {preset}
                        </button>
                    ))}
                </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                Review Persona
            </label>
            <div className="grid grid-cols-1 gap-3">
              {PERSONAS.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`relative flex items-start p-3 rounded-lg border cursor-pointer transition-all ${selectedPersona === p.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                         <p className={`text-sm font-medium ${selectedPersona === p.id ? 'text-primary' : 'text-slate-900'}`}>
                          {p.label}
                        </p>
                        {selectedPersona === p.id && (
                          <SparklesIcon className="w-4 h-4 text-primary" />
                        )}
                    </div>
                   
                    <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
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
          onClick={() => onSubmit(objective, selectedPersona)}
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
