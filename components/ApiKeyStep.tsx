import React, { useState } from 'react';
import { PulseLogo, PulseIcon } from './icons';

interface ApiKeyStepProps {
  onApiKeySet: () => void;
}

export const ApiKeyStep: React.FC<ApiKeyStepProps> = ({ onApiKeySet }) => {
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    try {
      const windowAny = window as any;
      if (windowAny.aistudio) {
        // Trigger the secure API key selection dialog
        const success = await windowAny.aistudio.openSelectKey();
        
        if (success) {
            // Re-check to be sure
            const hasKey = await windowAny.aistudio.hasSelectedApiKey();
            if (hasKey) {
                 onApiKeySet();
            } else {
                 setError("Key selection was cancelled or failed.");
            }
        } else {
             // The prompt might have been closed without selection
             // Usually openSelectKey handles the UI, but if it returns false we know no key was set.
             setError("Please select a valid API key to continue.");
        }
      } else {
          setError("AI Studio environment not detected.");
      }
    } catch (e: any) {
        // Handle "Requested entity was not found" specifically if needed, but generic error is fine for UI
        if (e.message && e.message.includes("Requested entity was not found")) {
            setError("The selected project or key seems invalid. Please try selecting again.");
        } else {
            setError("Failed to connect API Key. Please try again.");
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-4">
       <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-8 text-center">
                 <div className="flex justify-center mb-6">
                     <PulseIcon className="w-12 h-12 text-primary" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Pulse</h2>
                 <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                     To analyze your UX flows securely, please connect your Google Cloud Project API Key. Pulse runs entirely in your browser.
                 </p>
                 
                 {error && (
                     <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-100">
                         {error}
                     </div>
                 )}

                 <button 
                    onClick={handleConnect}
                    className="w-full py-2.5 bg-primary hover:bg-primaryHover text-white font-medium rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                 >
                     Connect API Key
                 </button>
                 
                 <div className="mt-6 pt-6 border-t border-gray-100">
                     <p className="text-[10px] text-gray-400">
                         Need a key? <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-primary hover:underline">View Billing Documentation</a>
                     </p>
                 </div>
            </div>
       </div>
    </div>
  );
};