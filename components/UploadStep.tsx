
import React, { useState, useCallback } from 'react';
import { UploadIcon, SparklesIcon } from './icons';

interface UploadStepProps {
  onFilesSelect: (files: File[]) => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({ onFilesSelect }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));
      const sortedFiles = [...files, ...newFiles].sort((a, b) => a.name.localeCompare(b.name));
      setFiles(sortedFiles);

      const newPreviews = sortedFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    if (files.length > 0) {
      onFilesSelect(files);
    }
  };
  
  const handleRemoveImage = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      const newPreviews = previews.filter((_, i) => i !== index);
      setFiles(newFiles);
      setPreviews(newPreviews);
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-center">
      <SparklesIcon className="w-12 h-12 mx-auto text-indigo-500" />
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-4">Analyze Your User Flow</h1>
      <p className="text-slate-600 mt-2 text-lg">Upload your app screenshots to get an instant AI-powered UX analysis.</p>

      <div className="mt-8">
        <label
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative block w-full border-2 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 border-dashed'} rounded-xl p-8 text-center cursor-pointer transition-colors duration-200`}
        >
          <div className="flex flex-col items-center">
            <UploadIcon />
            <span className="mt-2 block text-base font-medium text-slate-700">
              Drag & Drop your screenshots here
            </span>
            <span className="text-slate-500 text-sm">or</span>
            <span className="text-indigo-600 font-semibold hover:text-indigo-500">
              Click to browse files
            </span>
          </div>
          <input
            type="file"
            multiple
            accept="image/png, image/jpeg, image/webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {previews.length > 0 && (
        <div className="mt-8 text-left">
          <h2 className="font-semibold text-slate-700">Your Flow ({previews.length} screens)</h2>
          <p className="text-sm text-slate-500">Files are automatically sorted by name. Rename them (e.g., 01_screen, 02_screen) to set the correct order.</p>
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {previews.map((src, index) => (
              <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                   <button onClick={() => handleRemoveImage(index)} className="w-8 h-8 rounded-full bg-white/80 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <button
          onClick={handleSubmit}
          disabled={files.length === 0}
          className="w-full sm:w-auto px-12 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none transition-all"
        >
          Next: Define Objective
        </button>
      </div>
    </div>
  );
};
