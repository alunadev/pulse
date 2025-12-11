import React, { useState } from 'react';
import { FlowDiagram } from './FlowDiagram';
import { SparklesIcon } from './icons';

interface ObjectiveStepProps {
  files: File[];
  onSubmit: (objective: string, persona: string) => void;
  onBack: () => void;
}

const presetObjectives = [
    "Increase onboarding completion",
    "Reduce checkout drop-off",
    "Improve first-time usability",
    "Clarify info hierarchy",
];

export const PERSONAS = [
  { id: 'standard', label: 'Standard Review', description: 'Balanced analysis of usability & visuals.' },
  { id: 'conversion', label: 'Growth PM', description: 'Focus on funnel drop-off & metrics.' },
  { id: 'accessibility', label: 'Accessibility Audit', description: 'WCAG 2.1 AA compliance check.' },
  { id: 'copy', label: 'UX Writer', description: 'Tone, clarity & microcopy focus.' },
];

export const ObjectiveStep: React.FC<ObjectiveStepProps> = ({ files, onSubmit, onBack }) => {
  const [objective, setObjective] = useState('');
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0].id);

  const previews = files.map(file => URL.createObjectURL(file));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Flow Visualization */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Flow Context</h3>
              <span className="text-xs text-gray-400">{files.length} Screens</span>
          </div>
          <div className="p-6">
              <FlowDiagram previews={previews} />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Objective Input */}
        <div className="md:col-span-2 space-y-4">
             <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="mb-4">
                     <label htmlFor="objective" className="block text-sm font-medium text-gray-900 mb-1">
                        Analysis Objective
                    </label>
                    <p className="text-xs text-gray-500 mb-3">What specific goal are you trying to achieve with this design?</p>
                    <textarea
                        id="objective"
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-gray-900 placeholder:text-gray-400 p-3 border font-sans"
                        placeholder="e.g., Identify friction points preventing users from adding items to cart..."
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                    />
                </div>
                
                <div>
                     <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Quick Presets</span>
                     <div className="flex flex-wrap gap-2">
                        {presetObjectives.map((preset) => (
                            <button 
                                key={preset} 
                                onClick={() => setObjective(preset)} 
                                className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>
             </div>
        </div>

        {/* Persona Selection */}
        <div className="md:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
                 <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Review Persona</h3>
                 </div>
                 <div className="p-3 space-y-2 flex-1 overflow-y-auto">
                    {PERSONAS.map((p) => (
                        <div 
                        key={p.id}
                        onClick={() => setSelectedPersona(p.id)}
                        className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedPersona === p.id 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                            : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-semibold ${selectedPersona === p.id ? 'text-primary' : 'text-gray-900'}`}>{p.label}</span>
                                {selectedPersona === p.id && <SparklesIcon className="w-3 h-3 text-primary" />}
                            </div>
                            <p className="text-[10px] text-gray-500 leading-relaxed">{p.description}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
          <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-4 py-2 bg-white text-gray-700 text-xs font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => onSubmit(objective, selectedPersona)}
                disabled={!objective.trim()}
                className="px-6 py-2 bg-primary text-white text-xs font-medium rounded-md shadow-sm hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <SparklesIcon className="w-4 h-4"/>
                Start Analysis
              </button>
          </div>
      </div>
    </div>
  );
};