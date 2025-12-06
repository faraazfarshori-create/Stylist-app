import React, { useState, useCallback } from 'react';
import { OutfitStyle, GeneratedOutfit, ImageUploadState } from './types';
import { generateOutfit, editOutfitImage } from './services/geminiService';
import { OutfitCard } from './components/OutfitCard';
import { Button } from './components/Button';
import { EditModal } from './components/EditModal';

function App() {
  const [uploadState, setUploadState] = useState<ImageUploadState>({ file: null, previewUrl: null });
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<GeneratedOutfit | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadState({ file, previewUrl: url });
      // Reset outfits when new image uploaded
      setOutfits([]);
    }
  };

  const startGeneration = async () => {
    if (!uploadState.previewUrl) return;

    setIsGenerating(true);
    
    // Initialize placeholders
    const newOutfits: GeneratedOutfit[] = [
      { id: '1', style: OutfitStyle.CASUAL, imageUrl: null, isLoading: true },
      { id: '2', style: OutfitStyle.BUSINESS, imageUrl: null, isLoading: true },
      { id: '3', style: OutfitStyle.NIGHT_OUT, imageUrl: null, isLoading: true },
    ];
    setOutfits(newOutfits);

    try {
      // Parallel requests for better UX, but might hit rate limits. 
      // For stability, let's do them in Promise.allSettled to handle individual failures.
      const styles = [OutfitStyle.CASUAL, OutfitStyle.BUSINESS, OutfitStyle.NIGHT_OUT];
      
      const promises = styles.map(async (style, index) => {
        try {
           const imageUrl = await generateOutfit(uploadState.previewUrl!, style);
           setOutfits(prev => prev.map(o => 
             o.style === style ? { ...o, imageUrl, isLoading: false } : o
           ));
        } catch (error) {
           console.error(`Error generating ${style}:`, error);
           setOutfits(prev => prev.map(o => 
             o.style === style ? { ...o, isLoading: false, error: "Failed to generate. Try again." } : o
           ));
        }
      });

      await Promise.all(promises);

    } catch (error) {
      console.error("Global generation error", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (outfit: GeneratedOutfit) => {
    setEditingOutfit(outfit);
  };

  const handleCloseModal = () => {
    setEditingOutfit(null);
  };

  const handleApplyChanges = async (outfitId: string, currentImage: string, prompt: string) => {
    try {
      const newImageUrl = await editOutfitImage(currentImage, prompt);
      
      // Update the main list with the new image
      setOutfits(prev => prev.map(o => 
        o.id === outfitId ? { ...o, imageUrl: newImageUrl } : o
      ));

      // Also update the modal view so the user sees the result immediately
      setEditingOutfit(prev => prev ? { ...prev, imageUrl: newImageUrl } : null);

    } catch (error) {
      console.error("Edit failed", error);
      alert("Failed to edit the image. Please try a different prompt.");
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              VS
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Virtual Stylist</h1>
          </div>
           {uploadState.previewUrl && (
             <button 
               onClick={() => { setUploadState({ file: null, previewUrl: null }); setOutfits([]); }}
               className="text-sm text-slate-500 hover:text-indigo-600"
             >
               Start Over
             </button>
           )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {!uploadState.previewUrl ? (
          /* Empty State / Upload */
          <div className="max-w-xl mx-auto mt-20 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Unlock Your Wardrobe's Potential
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Upload a photo of a difficult-to-match item (like a skirt or jacket). 
              Our AI will style it for Work, Casual, and Night Out looks instantly.
            </p>
            
            <div className="mt-8 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md bg-white hover:bg-slate-50 transition-colors cursor-pointer relative">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-slate-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-slate-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        ) : (
          /* Main Interface */
          <div className="space-y-8">
            
            {/* Top Section: Source Image & Action */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <span className="block text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Original Item</span>
                <div className="h-40 w-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                   <img 
                    src={uploadState.previewUrl} 
                    alt="Original item" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-grow text-center sm:text-left">
                 <h2 className="text-2xl font-bold text-slate-900 mb-2">Style Recommendations</h2>
                 <p className="text-slate-600 max-w-lg mb-6">
                    {outfits.length === 0 
                      ? "Ready to style! Click the button below to generate 3 complete outfit ideas based on your item." 
                      : "We've curated three distinct looks for you. Tap any outfit to customize it further using AI commands."}
                 </p>
                 {outfits.length === 0 && (
                   <Button 
                    onClick={startGeneration} 
                    isLoading={isGenerating}
                    className="w-full sm:w-auto px-8 py-3 text-lg"
                   >
                     Generate Outfits
                   </Button>
                 )}
              </div>
            </div>

            {/* Gallery Grid */}
            {outfits.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {outfits.map((outfit) => (
                  <div key={outfit.id} className="h-[500px]">
                    <OutfitCard 
                      outfit={outfit} 
                      onEdit={handleEdit}
                      onDownload={downloadImage}
                    />
                  </div>
                ))}
              </div>
            )}
            
          </div>
        )}
      </main>

      <EditModal 
        isOpen={!!editingOutfit} 
        onClose={handleCloseModal}
        outfit={editingOutfit}
        onApplyChanges={handleApplyChanges}
      />

    </div>
  );
}

export default App;