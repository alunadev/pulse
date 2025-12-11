import React, { useState } from 'react';
import { AnalysisReport, Project, Workflow } from './types';
import { UploadStep } from './components/UploadStep';
import { ObjectiveStep } from './components/ObjectiveStep';
import { AnalysisStep } from './components/AnalysisStep';
import { ReportStep } from './components/ReportStep';
import { Dashboard } from './components/Dashboard';
import { analyzeFlow } from './services/geminiService';
import { PulseIcon } from './components/icons';

// --- MOCK DATABASE ---
const MOCK_PROJECTS: Project[] = [
  { 
    id: 'p1', 
    name: 'Consumer iOS App', 
    description: 'Main checkout and onboarding flows for the V2 release.', 
    createdAt: new Date(),
    workflows: []
  },
  { 
    id: 'p2', 
    name: 'Merchant Dashboard', 
    description: 'B2B analytics and reporting interfaces.', 
    createdAt: new Date(),
    workflows: []
  }
];

// Reusable NavItem component for the sidebar
const NavItem: React.FC<{ active: boolean; label: string; icon?: React.ReactNode; onClick?: () => void; disabled?: boolean }> = ({ active, label, icon, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            active
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-transparent'
        }`}
    >
        {icon || <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-primary' : 'bg-gray-300'}`}></div>}
        {label}
    </button>
);

const App: React.FC = () => {
  // --- HIERARCHY STATE ---
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derived State
  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const activeWorkflow = activeProject?.workflows.find(w => w.id === activeWorkflowId) || null;

  // --- ACTIONS ---

  const handleCreateProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date(),
      workflows: []
    };
    setProjects([...projects, newProject]);
    setActiveProjectId(newProject.id); // Auto-select
  };

  const handleCreateWorkflow = (projectId: string) => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      projectId,
      name: `Untitled Analysis ${Math.floor(Math.random() * 1000)}`,
      updatedAt: new Date(),
      status: 'draft',
      step: 'upload',
      files: [],
      objective: '',
      persona: 'standard',
      sourceType: 'images',
      report: null
    };

    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return { ...p, workflows: [newWorkflow, ...p.workflows] }; // Add to top
      }
      return p;
    }));
    setActiveWorkflowId(newWorkflow.id);
  };

  // Helper to update the active workflow state generically
  const updateActiveWorkflow = (updates: Partial<Workflow>) => {
    if (!activeProjectId || !activeWorkflowId) return;

    setProjects(projects.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          workflows: p.workflows.map(w => 
            w.id === activeWorkflowId ? { ...w, ...updates, updatedAt: new Date() } : w
          )
        };
      }
      return p;
    }));
  };

  // --- WORKFLOW STEP HANDLERS (Level 3 Logic) ---

  const handleFilesSelect = (selectedFiles: File[], type: 'images' | 'video') => {
    updateActiveWorkflow({
      files: selectedFiles,
      sourceType: type,
      step: 'objective',
      name: activeWorkflow?.name.startsWith('Untitled') ? `Analysis ${selectedFiles.length} screens` : activeWorkflow?.name
    });
  };

  const handleObjectiveSubmit = async (selectedObjective: string, selectedPersona: string) => {
    updateActiveWorkflow({
      objective: selectedObjective,
      persona: selectedPersona,
      step: 'analyzing',
      status: 'analyzing'
    });
    setError(null);

    try {
      if (!activeWorkflow) return;
      // We pass the new values directly because state update is async and might not be ready yet
      const result = await analyzeFlow(activeWorkflow.files, selectedObjective, activeWorkflow.sourceType, selectedPersona);
      
      updateActiveWorkflow({
        report: result,
        step: 'report',
        status: 'completed'
      });
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during analysis.');
      updateActiveWorkflow({ step: 'objective', status: 'draft' });
    }
  };
  
  const handleRefineAnalysis = async (feedback: string) => {
    if (!activeWorkflow || !activeWorkflow.report) return;
    setError(null);
    try {
      const newReport = await analyzeFlow(activeWorkflow.files, activeWorkflow.objective, activeWorkflow.sourceType, activeWorkflow.persona, {
        previousReport: activeWorkflow.report,
        userFeedback: feedback,
      });
      updateActiveWorkflow({ report: newReport });
    } catch (err: any) {
       throw err;
    }
  };

  const handleStartOver = () => {
      // Create a fresh workflow instead of resetting the current one? 
      // Or just reset current one. Let's reset current for simplicity as per old behavior.
      updateActiveWorkflow({
          step: 'upload',
          files: [],
          objective: '',
          report: null,
          status: 'draft',
          sourceType: 'images'
      });
      setError(null);
  };
  
  const handleBackToUpload = () => {
    updateActiveWorkflow({ step: 'upload' });
  };


  // --- VIEW RENDERING ---

  const renderSidebarContent = () => {
    if (!activeProject) {
      // Level 1: Root Sidebar
      return (
        <>
            <div className="flex-1 overflow-y-auto px-2 pb-4 pt-4">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Workspace</div>
                <NavItem active={true} label="All Projects" onClick={() => {}} />
            </div>
            {/* Sidebar Footer (New Project) */}
             <div className="p-3 border-t border-gray-200 bg-white space-y-4">
                <button 
                    onClick={() => { /* Triggered via Dashboard component mainly */ }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm opacity-50 cursor-default"
                >
                    <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">+</span>
                         </div>
                        <span className="text-xs font-medium text-gray-400">Select a Project</span>
                    </div>
                </button>
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                        <span className="text-[10px] text-gray-500 font-medium">No Project Selected</span>
                    </div>
                    <span className="text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-medium">v2.1</span>
                </div>
            </div>
        </>
      );
    }

    if (activeProject && !activeWorkflow) {
        // Level 2: Project Sidebar
        return (
            <>
                <div className="p-3">
                    <button onClick={() => setActiveProjectId(null)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors mb-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Projects
                    </button>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-md">
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Current Project</div>
                        <div className="text-sm font-semibold text-gray-900 truncate">{activeProject.name}</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 pb-4">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-2">Navigation</div>
                    <NavItem active={true} label="Workflows" onClick={() => {}} />
                    <NavItem active={false} label="Project Settings" disabled onClick={() => {}} />
                </div>

                 <div className="p-3 border-t border-gray-200 bg-white space-y-4">
                     <button 
                        onClick={() => handleCreateWorkflow(activeProject.id)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <span className="text-primary font-bold text-sm">+</span>
                            </div>
                            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">New Workflow</span>
                        </div>
                    </button>
                     <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] text-gray-500 font-medium">Project Active</span>
                        </div>
                        <span className="text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-medium">v2.1</span>
                    </div>
                 </div>
            </>
        )
    }

    // Level 3: Workflow Sidebar (The original view)
    if (activeWorkflow) {
        return (
            <>
                 <div className="p-3">
                    <button onClick={() => setActiveWorkflowId(null)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors mb-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to {activeProject?.name}
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-2 pb-4">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Analysis Steps</div>
                    <nav className="space-y-0.5">
                        <NavItem 
                            active={activeWorkflow.step === 'upload'} 
                            label="Source Upload" 
                            onClick={() => activeWorkflow.status !== 'analyzing' && updateActiveWorkflow({ step: 'upload' })}
                            disabled={activeWorkflow.status === 'analyzing'}
                        />
                        <NavItem 
                            active={activeWorkflow.step === 'objective'} 
                            label="Define Objective" 
                            onClick={() => activeWorkflow.files.length > 0 && activeWorkflow.status !== 'analyzing' && updateActiveWorkflow({ step: 'objective' })}
                            disabled={activeWorkflow.files.length === 0 || activeWorkflow.status === 'analyzing'}
                        />
                        <NavItem 
                            active={activeWorkflow.step === 'analyzing'} 
                            label="AI Processing" 
                            disabled={true}
                        />
                        <NavItem 
                            active={activeWorkflow.step === 'report'} 
                            label="Insights Report" 
                            onClick={() => activeWorkflow.report && updateActiveWorkflow({ step: 'report' })}
                            disabled={!activeWorkflow.report}
                        />
                    </nav>
                </div>

                {/* Bottom Status & Actions */}
                <div className="p-3 border-t border-gray-200 bg-white space-y-4">
                    <button 
                        onClick={handleStartOver}
                        disabled={activeWorkflow.status === 'analyzing'}
                        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-gray-200 transition-all text-left group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">Reset Workflow</span>
                        </div>
                    </button>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${activeWorkflow.status === 'analyzing' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                            <span className="text-[10px] text-gray-500 font-medium">{activeWorkflow.status === 'analyzing' ? 'Processing...' : 'System Ready'}</span>
                        </div>
                        <span className="text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-medium">v2.1</span>
                    </div>
                </div>
            </>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-900">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20 transition-all duration-300">
            {/* Header */}
            <div className="h-14 flex items-center px-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <PulseIcon className="w-6 h-6 text-primary" />
                    <span className="text-sm font-bold tracking-tight text-gray-900">PULSE</span>
                </div>
            </div>

            {renderSidebarContent()}
        </aside>

        {/* Main Content Shell */}
        <main className="flex-1 flex flex-col relative min-w-0 bg-gray-50">
            {/* Conditional Toolbar */}
            {activeWorkflow && (
                 <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-sm font-semibold text-gray-900">
                            {activeWorkflow.step === 'upload' && 'Upload Assets'}
                            {activeWorkflow.step === 'objective' && 'Configuration'}
                            {activeWorkflow.step === 'analyzing' && 'Deep Analysis'}
                            {activeWorkflow.step === 'report' && 'Analysis Results'}
                        </h1>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <span className="text-xs text-gray-400">
                            {activeWorkflow.name}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         {/* Toolbar actions */}
                    </div>
                </header>
            )}

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden relative">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Scrollable Content */}
                <div className="absolute inset-0 overflow-y-auto">
                     {/* 
                        ROUTING LOGIC 
                        If activeWorkflow exists -> Show Editor
                        Else -> Show Dashboard (Projects or Workflow List)
                     */}
                     {!activeWorkflow ? (
                         <Dashboard 
                            projects={projects}
                            activeProject={activeProject}
                            onSelectProject={(p) => setActiveProjectId(p ? p.id : null)}
                            onCreateProject={handleCreateProject}
                            onSelectWorkflow={(w) => setActiveWorkflowId(w.id)}
                            onCreateWorkflow={handleCreateWorkflow}
                         />
                     ) : (
                         <div className="p-8">
                            <div className="max-w-6xl mx-auto">
                                {error && activeWorkflow.step === 'objective' && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {error}
                                </div>
                                )}
                                
                                {activeWorkflow.step === 'upload' && <UploadStep onFilesSelect={handleFilesSelect} />}
                                {activeWorkflow.step === 'objective' && <ObjectiveStep files={activeWorkflow.files} onSubmit={handleObjectiveSubmit} onBack={handleBackToUpload} />}
                                {activeWorkflow.step === 'analyzing' && <AnalysisStep objective={activeWorkflow.objective} fileCount={activeWorkflow.files.length} />}
                                {activeWorkflow.step === 'report' && <ReportStep report={activeWorkflow.report} files={activeWorkflow.files} onStartOver={handleStartOver} onRefine={handleRefineAnalysis} />}
                            </div>
                         </div>
                     )}
                </div>
            </div>
        </main>
    </div>
  );
};

export default App;