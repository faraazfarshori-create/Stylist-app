import React, { useState } from 'react';
import { GeneratedOutfit } from '../types';
import { Button } from './Button';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: GeneratedOutfit | null;
  onApplyChanges: (outfitId: string, currentImage: string, prompt: string) => Promise<void>;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, outfit, onApplyChanges }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !outfit || !outfit.imageUrl) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    try {
      await onApplyChanges(outfit.id, outfit.imageUrl!, prompt);
      setPrompt(''); 
    } catch (error) {
      console.error("Failed to edit", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start flex-col gap-6">
              
              <div className="flex justify-between items-center w-full border-b pb-4">
                 <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                  Customize Your {outfit.style} Look
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="w-full flex flex-col md:flex-row gap-6">
                {/* Image View */}
                <div className="w-full md:w-1/2 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
                   <img 
                    src={outfit.imageUrl} 
                    alt="Current outfit state" 
                    className="max-h-[500px] w-auto object-contain"
                  />
                </div>

                {/* Controls */}
                <div className="w-full md:w-1/2 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                      Use the "Virtual Stylist" AI to tweak this look. Ask for specific changes like "Add a denim jacket", "Change shoes to sneakers", or "Apply a vintage filter".
                    </p>
                    
                    <form onSubmit={handleSubmit} className="mt-4">
                      <label htmlFor="edit-prompt" className="block text-sm font-medium text-slate-700">
                        Instructions
                      </label>
                      <textarea
                        id="edit-prompt"
                        rows={4}
                        className="shadow-sm mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-slate-300 rounded-md p-2"
                        placeholder="e.g. Make the bag red, add sunglasses..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isProcessing}
                      />
                      
                      <div className="mt-4 flex justify-end gap-3">
                         <Button 
                          type="button" 
                          variant="outline" 
                          onClick={onClose}
                          disabled={isProcessing}
                        >
                          Close
                        </Button>
                        <Button 
                          type="submit" 
                          isLoading={isProcessing}
                          disabled={!prompt.trim()}
                        >
                          Generate Changes
                        </Button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg mt-6">
                     <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                          <p className="text-sm text-indigo-700">
                            The AI will regenerate the image based on your current view and new instructions.
                          </p>
                        </div>
                      </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};