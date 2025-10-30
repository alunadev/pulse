import React, { useState } from 'react';
import { Step, AnalysisReport } from './types';
import { UploadStep } from './components/UploadStep';
import { ObjectiveStep } from './components/ObjectiveStep';
import { AnalysisStep } from './components/AnalysisStep';
import { ReportStep } from './components/ReportStep';
import { analyzeFlow } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [objective, setObjective] = useState<string>('');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setStep('objective');
  };

  const handleObjectiveSubmit = async (selectedObjective: string) => {
    setObjective(selectedObjective);
    setStep('analyzing');
    setError(null);
    setReport(null);

    try {
      const result = await analyzeFlow(files, selectedObjective);
      setReport(result);
      setStep('report');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during analysis.');
      // Fallback to objective step on error
      setStep('objective');
    }
  };
  
  const handleRefineAnalysis = async (feedback: string) => {
    if (!report) return;
    setError(null); // Clear previous errors
    
    try {
      const newReport = await analyzeFlow(files, objective, {
        previousReport: report,
        userFeedback: feedback,
      });
      setReport(newReport);
    } catch (err: any) {
       // Re-throw the error so the component can catch it
       throw err;
    }
  };

  const handleStartOver = () => {
    setStep('upload');
    setFiles([]);
    setObjective('');
    setReport(null);
    setError(null);
  };
  
  const handleBackToUpload = () => {
      setStep('upload');
  };

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return <UploadStep onFilesSelect={handleFilesSelect} />;
      case 'objective':
        return <ObjectiveStep files={files} onSubmit={handleObjectiveSubmit} onBack={handleBackToUpload} />;
      case 'analyzing':
        return <AnalysisStep objective={objective} fileCount={files.length} />;
      case 'report':
        return <ReportStep report={report} files={files} onStartOver={handleStartOver} onRefine={handleRefineAnalysis} />;
      default:
        return <UploadStep onFilesSelect={handleFilesSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 transition-all duration-300">
       <header className="absolute top-0 left-0 p-6 flex items-center space-x-2">
          <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.25C11.5858 2.25 11.25 2.58579 11.25 3V6.34967C10.231 6.55132 9.28285 7.0143 8.46482 7.69617L6.01472 5.82843C5.71166 5.59219 5.28834 5.6412 5.0521 5.94426L3.0521 8.94426C2.81586 9.24732 2.86487 9.67064 3.16793 9.91371L5.34315 11.5355C5.2845 11.6853 5.25 11.8413 5.25 12C5.25 12.1587 5.2845 12.3147 5.34315 12.4645L3.16793 14.0863C2.86487 14.3294 2.81586 14.7527 3.0521 15.0557L5.0521 18.0557C5.28834 18.3588 5.71166 18.4078 6.01472 18.1716L8.46482 16.3038C9.28285 16.9857 10.231 17.4487 11.25 17.6503V21C11.25 21.4142 11.5858 21.75 12 21.75C12.4142 21.75 12.75 21.4142 12.75 21V17.6503C13.769 17.4487 14.7172 16.9857 15.5352 16.3038L17.9853 18.1716C18.2883 18.4078 18.7117 18.3588 18.9479 18.0557L20.9479 15.0557C21.1841 14.7527 21.1351 14.3294 20.8321 14.0863L18.6569 12.4645C18.7155 12.3147 18.75 12.1587 18.75 12C18.75 11.8413 18.7155 11.6853 18.6569 11.5355L20.8321 9.91371C21.1351 9.67064 21.1841 9.24732 20.9479 8.94426L18.9479 5.94426C18.7117 5.6412 18.2883 5.59219 17.9853 5.82843L15.5352 7.69617C14.7172 7.0143 13.769 6.55132 12.75 6.34967V3C12.75 2.58579 12.4142 2.25 12 2.25ZM12 9.75C13.2426 9.75 14.25 10.7574 14.25 12C14.25 13.2426 13.2426 14.25 12 14.25C10.7574 14.25 9.75 13.2426 9.75 12C9.75 10.7574 10.7574 9.75 12 9.75Z" fill="currentColor"/>
          </svg>
          <span className="font-bold text-xl text-slate-800">Pulse</span>
      </header>
      <main className="w-full">
        {error && step === 'objective' && (
          <div className="max-w-3xl mx-auto mb-4 p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg">
            <strong>Analysis Failed:</strong> {error}
          </div>
        )}
        {renderStep()}
      </main>
    </div>
  );
};

export default App;