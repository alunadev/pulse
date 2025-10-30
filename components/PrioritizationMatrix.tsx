import React from 'react';
import { Recommendation } from '../types';

interface PrioritizationMatrixProps {
  recommendations: Recommendation[];
  onRecommendationClick: (index: number) => void;
}

const Quadrant: React.FC<{
  title: string;
  items: { rec: Recommendation; originalIndex: number }[];
  bgColor: string;
  onClick: (index: number) => void;
}> = ({ title, items, bgColor, onClick }) => (
  <div className={`rounded-lg p-4 ${bgColor} min-h-[12rem] flex flex-col`}>
    <h3 className="font-bold text-slate-800">{title}</h3>
    <div className="mt-3 space-y-2 flex-1">
      {items.length > 0 ? (
        items.map(({ rec, originalIndex }) => (
          <button
            key={originalIndex}
            onClick={() => onClick(originalIndex)}
            className="w-full text-left p-2 bg-white/70 rounded-md shadow-sm hover:bg-white hover:shadow-md transition-all text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            title={rec.title}
          >
            <p className="truncate">
              <span className="font-semibold">S{rec.screenIndex + 1}:</span> {rec.title}
            </p>
          </button>
        ))
      ) : (
        <p className="text-sm text-slate-500 italic h-full flex items-center justify-center">None</p>
      )}
    </div>
  </div>
);

export const PrioritizationMatrix: React.FC<PrioritizationMatrixProps> = ({ recommendations, onRecommendationClick }) => {
  const indexedRecommendations = recommendations.map((rec, index) => ({ rec, originalIndex: index }));

  const getQuadrant = (rec: Recommendation) => {
    const isHighImpact = rec.impact !== 'Low';
    const isHighEffort = rec.effort === 'High';
    if (isHighImpact && !isHighEffort) return 'quickWins';
    if (isHighImpact && isHighEffort) return 'majorProjects';
    if (!isHighImpact && !isHighEffort) return 'fillIns';
    if (!isHighImpact && isHighEffort) return 'timeSinks';
    return 'fillIns';
  };

  const quadrants = indexedRecommendations.reduce(
    (acc, item) => {
      const quadrant = getQuadrant(item.rec);
      acc[quadrant].push(item);
      return acc;
    },
    {
      quickWins: [],
      majorProjects: [],
      fillIns: [],
      timeSinks: [],
    } as Record<string, { rec: Recommendation; originalIndex: number }[]>
  );

  return (
    <div className="flex w-full">
        {/* Y-AXIS LABELS */}
        <div className="flex flex-col justify-between items-center w-12 py-10 text-center">
            <span className="text-sm font-semibold text-slate-600">High</span>
            <span className="transform -rotate-90 whitespace-nowrap text-sm font-semibold text-slate-600">Impact</span>
            <span className="text-sm font-semibold text-slate-600">Low</span>
        </div>

        {/* MATRIX & X-AXIS */}
        <div className="flex-1">
            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                {/* Top Left: Quick Wins (High Impact, Low Effort) */}
                <Quadrant
                    title="🟢 Quick Wins"
                    items={quadrants.quickWins}
                    bgColor="bg-emerald-100/70"
                    onClick={onRecommendationClick}
                />

                {/* Top Right: Major Projects (High Impact, High Effort) */}
                <Quadrant
                    title="🔵 Major Projects"
                    items={quadrants.majorProjects}
                    bgColor="bg-sky-100/70"
                    onClick={onRecommendationClick}
                />

                {/* Bottom Left: Fill-ins (Low Impact, Low Effort) */}
                <Quadrant
                    title="🟡 Fill-ins"
                    items={quadrants.fillIns}
                    bgColor="bg-amber-100/70"
                    onClick={onRecommendationClick}
                />

                {/* Bottom Right: Time Sinks (Low Impact, High Effort) */}
                <Quadrant
                    title="🔴 Time Sinks"
                    items={quadrants.timeSinks}
                    bgColor="bg-red-100/70"
                    onClick={onRecommendationClick}
                />
            </div>
            
            {/* X-AXIS LABELS */}
            <div className="grid grid-cols-2 text-center mt-2">
                <span className="text-sm font-semibold text-slate-600">Low Effort</span>
                <span className="text-sm font-semibold text-slate-600">High Effort</span>
            </div>
        </div>
    </div>
  );
};