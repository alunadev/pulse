import React from 'react';

interface FlowDiagramProps {
  previews: string[];
}

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ previews }) => {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="inline-flex items-center space-x-4 p-2">
        {previews.map((src, index) => (
          <React.Fragment key={index}>
            <div className="flex-shrink-0 text-center">
              <img
                src={src}
                alt={`Screen ${index + 1}`}
                className="h-48 sm:h-56 rounded-lg border-2 border-slate-200 shadow-sm object-contain bg-slate-100"
              />
              <p className="mt-2 text-sm font-medium text-slate-600">Screen {index + 1}</p>
            </div>
            {index < previews.length - 1 && (
              <div className="flex-shrink-0">
                <ArrowRightIcon />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};