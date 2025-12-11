import React, { useState } from 'react';
import { UploadIcon, SpinnerIcon } from './icons';

interface UploadStepProps {
  onFilesSelect: (files: File[], sourceType: 'images' | 'video') => void;
}

const MAX_FRAMES = 30;

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
      const calculatedInterval = duration / MAX_FRAMES;
      const interval = Math.max(1, calculatedInterval);
      
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
          
          currentTime += interval;

          if (currentTime < duration && files.length < MAX_FRAMES) {
            video.currentTime = currentTime;
          } else {
            URL.revokeObjectURL(video.src);
            resolve(files);
          }
        }, 'image/png', 0.9);
      };

      video.onseeked = captureFrame;
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
    } else {
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-gray-900">Upload Assets</h2>
          <p className="text-sm text-gray-500 mt-1">Upload your screenshots or a video recording of the user flow.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toggle Header */}
        <div className="flex border-b border-gray-200">
             <button 
                onClick={() => handleModeChange('images')}
                className={`flex-1 py-3 text-xs font-medium text-center transition-colors ${uploadMode === 'images' ? 'bg-gray-50 text-primary border-b-2 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
             >
                 Image Sequence
             </button>
             <button 
                onClick={() => handleModeChange('video')}
                className={`flex-1 py-3 text-xs font-medium text-center transition-colors ${uploadMode === 'video' ? 'bg-gray-50 text-primary border-b-2 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
             >
                 Video Recording
             </button>
        </div>

        <div className="p-8">
            <label
            onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
            }`}
            >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className={`w-10 h-10 mb-3 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                <p className="mb-2 text-sm text-gray-600">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                    {uploadMode === 'images' ? 'PNG, JPG or WebP' : 'MP4, WebM or MOV'}
                </p>
            </div>
            <input
                type="file"
                multiple={uploadMode === 'images'}
                accept={uploadMode === 'images' ? "image/png, image/jpeg, image/webp" : "video/mp4, video/webm, video/quicktime"}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />
            </label>
        </div>
        
        {/* Footer / Status */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xs text-gray-500">
                {files.length > 0 ? `${files.length} file${files.length !== 1 ? 's' : ''} selected` : 'No files selected'}
            </span>
            <button
                onClick={handleSubmit}
                disabled={files.length === 0 || isExtracting}
                className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-md shadow-sm hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                 {isExtracting ? <><SpinnerIcon className="w-3 h-3 text-white"/> Processing...</> : "Continue"}
            </button>
        </div>
      </div>

      {/* Previews Grid */}
      {previews.length > 0 && (
        <div className="mt-8">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
                 {uploadMode === 'images' && <span className="text-xs text-gray-400">Order matters for flow analysis</span>}
             </div>
             
             {uploadMode === 'images' ? (
                 <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {previews.map((src, index) => (
                        <div key={index} className="group relative aspect-[9/16] bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <img src={src} alt={`Screen ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => handleRemoveImage(index)} className="p-1 rounded-full bg-white/20 hover:bg-red-500 text-white transition-colors">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 text-[9px] font-mono text-center py-0.5 border-t border-gray-100 text-gray-500">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                 </div>
             ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-black">
                     <video src={previews[0]} controls className="w-full max-h-[400px] mx-auto" />
                </div>
             )}
        </div>
      )}
    </div>
  );
};