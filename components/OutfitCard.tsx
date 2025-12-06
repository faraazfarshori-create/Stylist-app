import React from 'react';
import { GeneratedOutfit } from '../types';
import { Button } from './Button';

interface OutfitCardProps {
  outfit: GeneratedOutfit;
  onEdit: (outfit: GeneratedOutfit) => void;
  onDownload: (imageUrl: string, filename: string) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, onEdit, onDownload }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 hover:shadow-xl transition-shadow duration-300">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">{outfit.style}</h3>
        {outfit.isLoading && <span className="text-xs text-indigo-600 font-medium animate-pulse">Designing...</span>}
      </div>
      
      <div className="relative flex-grow bg-slate-100 min-h-[300px] flex items-center justify-center group">
        {outfit.isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 text-center animate-pulse">Curating items...</p>
          </div>
        ) : outfit.error ? (
          <div className="p-6 text-center text-red-500">
            <p className="mb-2">⚠️</p>
            <p className="text-sm">{outfit.error}</p>
          </div>
        ) : outfit.imageUrl ? (
          <>
            <img 
              src={outfit.imageUrl} 
              alt={`${outfit.style} outfit`} 
              className="w-full h-full object-cover"
            />
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
              <Button 
                variant="primary" 
                onClick={() => onEdit(outfit)}
                className="shadow-xl"
              >
                Customize
              </Button>
               <button 
                onClick={() => onDownload(outfit.imageUrl!, `outfit-${outfit.style}.png`)}
                className="p-2 bg-white rounded-full text-slate-700 hover:text-indigo-600 shadow-xl transition-colors"
                title="Download"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <p className="text-slate-400 text-sm">Waiting for generation...</p>
        )}
      </div>
    </div>
  );
};