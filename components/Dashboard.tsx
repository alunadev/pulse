import React, { useState } from 'react';
import { Project, Workflow } from '../types';
import { PulseIcon, BuildingOfficeIcon, SparklesIcon } from './icons';

interface DashboardProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: (name: string, description: string) => void;
  onSelectWorkflow: (workflow: Workflow) => void;
  onCreateWorkflow: (projectId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  activeProject, 
  onSelectProject, 
  onCreateProject,
  onSelectWorkflow,
  onCreateWorkflow
}) => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName, newProjectDesc);
      setIsCreatingProject(false);
      setNewProjectName('');
      setNewProjectDesc('');
    }
  };

  // LEVEL 1: Project Selection
  if (!activeProject) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
             <p className="text-sm text-gray-500 mt-1">Manage your product lines and analysis workspaces.</p>
           </div>
           <button 
             onClick={() => setIsCreatingProject(true)}
             className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md shadow-sm hover:bg-primaryHover transition-colors"
           >
             + New Project
           </button>
        </div>

        {isCreatingProject && (
          <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
             <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Project Name</label>
                  <input 
                    type="text" 
                    value={newProjectName} 
                    onChange={e => setNewProjectName(e.target.value)} 
                    className="w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary border px-3 py-2"
                    placeholder="e.g. Consumer iOS App" 
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <input 
                    type="text" 
                    value={newProjectDesc} 
                    onChange={e => setNewProjectDesc(e.target.value)} 
                    className="w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary border px-3 py-2"
                    placeholder="Brief description of this workspace" 
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsCreatingProject(false)} className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                  <button type="submit" className="px-3 py-2 text-xs font-medium bg-primary text-white rounded-md hover:bg-primaryHover">Create Project</button>
                </div>
             </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {projects.map(project => (
             <div 
               key={project.id} 
               onClick={() => onSelectProject(project)}
               className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col h-40"
             >
               <div className="flex items-start justify-between mb-4">
                 <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                    <BuildingOfficeIcon className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{project.workflows.length} flows</span>
               </div>
               <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors">{project.name}</h3>
               <p className="text-xs text-gray-500 mt-1 line-clamp-2">{project.description || 'No description provided.'}</p>
             </div>
           ))}
           
           {projects.length === 0 && !isCreatingProject && (
             <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
               <PulseIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
               <p className="text-sm">No projects yet. Create one to get started.</p>
             </div>
           )}
        </div>
      </div>
    );
  }

  // LEVEL 2: Workflow Selection (Inside a Project)
  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
       <div className="flex items-center justify-between mb-8">
           <div>
             <div className="flex items-center gap-2 mb-1">
               <span onClick={() => onSelectProject(null as any)} className="text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Projects</span>
               <span className="text-gray-300">/</span>
               <span className="text-xs font-medium text-gray-900">{activeProject.name}</span>
             </div>
             <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
             <p className="text-sm text-gray-500 mt-1">Select a user flow to analyze or create a new one.</p>
           </div>
           <button 
             onClick={() => onCreateWorkflow(activeProject.id)}
             className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md shadow-sm hover:bg-primaryHover transition-colors flex items-center gap-2"
           >
             <SparklesIcon className="w-4 h-4" /> New Analysis
           </button>
       </div>

       <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
           <thead>
             <tr className="border-b border-gray-100 bg-gray-50/50">
               <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Workflow Name</th>
               <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
               <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated</th>
               <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {activeProject.workflows.map(workflow => (
               <tr key={workflow.id} className="hover:bg-gray-50 transition-colors group">
                 <td className="py-4 px-5">
                   <button onClick={() => onSelectWorkflow(workflow)} className="text-sm font-medium text-gray-900 hover:text-primary text-left">
                     {workflow.name}
                   </button>
                   <div className="text-[10px] text-gray-400 mt-0.5">{workflow.files.length} screens</div>
                 </td>
                 <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                      workflow.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      workflow.status === 'analyzing' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                    </span>
                 </td>
                 <td className="py-4 px-5 text-xs text-gray-500 font-mono">
                   {workflow.updatedAt.toLocaleDateString()}
                 </td>
                 <td className="py-4 px-5 text-right">
                    <button 
                      onClick={() => onSelectWorkflow(workflow)}
                      className="text-xs font-medium text-gray-600 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Open
                    </button>
                 </td>
               </tr>
             ))}
             {activeProject.workflows.length === 0 && (
               <tr>
                 <td colSpan={4} className="py-12 text-center text-sm text-gray-500">
                   No workflows found. Start a new analysis to begin.
                 </td>
               </tr>
             )}
           </tbody>
         </table>
       </div>
    </div>
  );
};