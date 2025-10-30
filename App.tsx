
import React, { useState } from 'react';
import { Step, AnalysisReport } from './types';
import { UploadStep } from './components/UploadStep';
import { ObjectiveStep } from './components/ObjectiveStep';
import { AnalysisStep } from './components/AnalysisStep';
import { ReportStep } from './components/ReportStep';
import { analyzeFlow } from './services/geminiService';
import { PulseLogo } from './components/icons';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [sourceType, setSourceType] = useState<'images' | 'video'>('images');
  const [objective, setObjective] = useState<string>('');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelect = (selectedFiles: File[], type: 'images' | 'video') => {
    setFiles(selectedFiles);
    setSourceType(type);
    setStep('objective');
  };

  const handleObjectiveSubmit = async (selectedObjective: string) => {
    setObjective(selectedObjective);
    setStep('analyzing');
    setError(null);
    setReport(null);

    try {
      const result = await analyzeFlow(files, selectedObjective, sourceType);
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
      const newReport = await analyzeFlow(files, objective, sourceType, {
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
    setSourceType('images');
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
       <header className="absolute top-0 left-0 p-4 sm:p-6">
          <PulseLogo />
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
