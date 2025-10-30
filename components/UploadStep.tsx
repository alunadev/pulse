
import React, { useState, useCallback } from 'react';
import { UploadIcon, SparklesIcon, SpinnerIcon } from './icons';

interface UploadStepProps {
  onFilesSelect: (files: File[], sourceType: 'images' | 'video') => void;
}

const FRAME_CAPTURE_INTERVAL_SECONDS = 1; // Capture one frame per second

const extractFramesFromVideo = (videoFile: File): Promise<File[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const files: File[] = [];

    video.preload = 'metadata';
    video.muted = true;
    video.src = URL.createObjectURL(videoFile);

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const duration = video.duration;
      let currentTime = 0;
      let frameCount = 0;

      const captureFrame = () => {
        if (!context) {
          reject('Could not get canvas context');
          return;
        }

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            const frameFile = new File([blob], `frame_${String(frameCount).padStart(3, '0')}.png`, { type: 'image/png' });
            files.push(frameFile);
            frameCount++;
          }
          
          currentTime += FRAME_CAPTURE_INTERVAL_SECONDS;

          if (currentTime <= duration) {
            video.currentTime = currentTime;
          } else {
            URL.revokeObjectURL(video.src);
            resolve(files);
          }
        }, 'image/png', 0.9);
      };

      video.onseeked = captureFrame;
      
      // Start the process
      video.currentTime = currentTime;
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(video.src);
      reject(e);
    };
  });
};


export const UploadStep: React.FC<UploadStepProps> = ({ onFilesSelect }) => {
  const [uploadMode, setUploadMode] = useState<'images' | 'video'>('images');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setFiles([]);
    setPreviews([]);
    setError(null);
  }

  const handleModeChange = (mode: 'images' | 'video') => {
    setUploadMode(mode);
    resetState();
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    resetState();

    if (uploadMode === 'images') {
        const newFiles = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));
        const sortedFiles = [...files, ...newFiles].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        setFiles(sortedFiles);
        const newPreviews = sortedFiles.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    } else { // video mode
        const videoFile = Array.from(selectedFiles).find(file => file.type.startsWith('video/'));
        if (videoFile) {
            setFiles([videoFile]);
            setPreviews([URL.createObjectURL(videoFile)]);
        }
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    if (uploadMode === 'video') {
        setIsExtracting(true);
        setError(null);
        try {
            const frames = await extractFramesFromVideo(files[0]);
            if (frames.length === 0) {
                throw new Error("Could not extract any frames from the video.");
            }
            onFilesSelect(frames, 'video');
        } catch (e) {
            console.error(e);
            setError("Failed to process video. Please try a different file or format.");
        } finally {
            setIsExtracting(false);
        }
    } else {
        onFilesSelect(files, 'images');
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
      <SparklesIcon className="w-12 h-12 mx-auto text-primary" />
      <h1 className="text-3xl sm:text-4xl font-bold text-dark mt-4">Analyze Your User Flow</h1>
      <p className="text-slate-600 mt-2 text-lg">Upload your designs to get an instant AI-powered UX analysis.</p>
      
      <div className="mt-6 flex justify-center bg-slate-200 p-1 rounded-lg">
          <button onClick={() => handleModeChange('images')} className={`px-4 py-1.5 w-1/2 rounded-md text-sm font-semibold transition-all ${uploadMode === 'images' ? 'bg-white shadow text-primary' : 'text-slate-600'}`}>Image Sequence</button>
          <button onClick={() => handleModeChange('video')} className={`px-4 py-1.5 w-1/2 rounded-md text-sm font-semibold transition-all ${uploadMode === 'video' ? 'bg-white shadow text-primary' : 'text-slate-600'}`}>Video Capture</button>
      </div>

      <div className="mt-6">
        <label
          onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
          className={`relative block w-full border-2 ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-300 border-dashed'} rounded-xl p-8 text-center cursor-pointer transition-colors duration-200`}
        >
          <div className="flex flex-col items-center">
            <UploadIcon />
            <span className="mt-2 block text-base font-medium text-slate-700">
              {uploadMode === 'images' ? 'Drag & Drop your screenshots' : 'Drag & Drop your video'}
            </span>
            <span className="text-slate-500 text-sm">or</span>
            <span className="text-primary font-semibold hover:text-primary/90">
              Click to browse files
            </span>
          </div>
          <input
            type="file"
            multiple={uploadMode === 'images'}
            accept={uploadMode === 'images' ? "image/png, image/jpeg, image/webp" : "video/mp4, video/webm, video/quicktime"}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {previews.length > 0 && (
        <div className="mt-8 text-left">
          {uploadMode === 'images' ? (
              <>
                <h2 className="font-semibold text-slate-700">Your Flow ({previews.length} screens)</h2>
                <p className="text-sm text-slate-500">Files are sorted by name. Rename them (e.g., 01, 02) to set the correct order.</p>
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
              </>
          ) : (
            <div>
              <h2 className="font-semibold text-slate-700">Your Video Flow</h2>
              <video src={previews[0]} controls muted className="mt-2 w-full max-w-md mx-auto rounded-lg border border-slate-200" />
            </div>
          )}
        </div>
      )}

      <div className="mt-10">
        <button
          onClick={handleSubmit}
          disabled={files.length === 0 || isExtracting}
          className="w-full sm:w-auto px-12 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {isExtracting ? (
              <>
                <SpinnerIcon />
                Extracting Frames...
              </>
          ) : "Next: Define Objective" }
        </button>
      </div>
    </div>
  );
};
