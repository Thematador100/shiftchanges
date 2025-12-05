
import React, { useState } from 'react';
import { ResumeData, PackageTier } from '../types';
import { generateCoverLetter } from '../services/geminiService';

interface CoverLetterPanelProps {
  resumeData: ResumeData;
  jobDescription: string;
  onJobDescriptionChange: (val: string) => void;
  packageTier: PackageTier;
  onCheckout: () => void;
}

const CoverLetterPanel: React.FC<CoverLetterPanelProps> = ({ 
    resumeData, 
    jobDescription, 
    onJobDescriptionChange,
    packageTier, 
    onCheckout 
}) => {
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock this feature to Leadership/NP tier (which includes cover letter)
  const hasAccess = ['expert-clinical'].includes(packageTier);

  const handleGenerate = async () => {
      if (!hasAccess) { onCheckout(); return; }
      if (!jobDescription.trim()) {
          setError("Please provide a job description so we can tailor the letter.");
          return;
      }
      
      setIsGenerating(true);
      setError(null);
      
      try {
          const letter = await generateCoverLetter(resumeData, jobDescription);
          setGeneratedLetter(letter);
      } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
          setIsGenerating(false);
      }
  };

  const copyToClipboard = () => {
      if (generatedLetter) {
          navigator.clipboard.writeText(generatedLetter);
          alert("Cover letter copied to clipboard!");
      }
  };

  return (
    <div className="p-4 space-y-6 relative h-full flex flex-col">
       {!hasAccess && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg p-6 text-center">
            <MailLockIcon />
            <h3 className="text-xl font-bold text-slate-800 mt-4">Cover Letter Studio Locked</h3>
            <p className="text-slate-600 mt-2 mb-6">Upgrade to <strong>Leadership/NP ($499)</strong> (includes cover letter) or add the <strong>Cover Letter add-on (+$79)</strong> to your current plan.</p>
            <button onClick={onCheckout} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                Upgrade Now
            </button>
        </div>
      )}

      <div className="text-center flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-700">Cover Letter Architect</h2>
        <p className="text-base text-slate-500 mt-1">We build a narrative bridge between your resume and the job description.</p>
      </div>
      
      <div className="space-y-4 flex-shrink-0">
         <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="text-sm text-slate-600 mb-2 font-semibold">Job Description Context</p>
            <textarea 
                value={jobDescription}
                onChange={(e) => onJobDescriptionChange(e.target.value)}
                placeholder="Paste the Job Description here (shared with Match tab)..."
                className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 h-24"
            />
         </div>
         
         <button
            onClick={handleGenerate}
            disabled={isGenerating || !jobDescription}
            className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-colors flex justify-center items-center gap-2 ${isGenerating || !jobDescription ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
         >
             {isGenerating ? (
                 <>
                    <Spinner /> Writing...
                 </>
             ) : (
                 <>
                    <PenIcon /> Generate Letter
                 </>
             )}
         </button>
         
         {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
      </div>

      {generatedLetter && (
          <div className="flex-1 overflow-hidden flex flex-col bg-white border border-slate-200 rounded-lg shadow-inner animate-fade-in mt-4">
              <div className="bg-slate-50 p-2 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-2">Draft Preview</span>
                  <button onClick={copyToClipboard} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1 hover:bg-indigo-50 rounded transition-colors">
                      Copy Text
                  </button>
              </div>
              <div className="p-6 overflow-y-auto whitespace-pre-wrap text-slate-700 leading-relaxed font-serif text-sm md:text-base">
                  {generatedLetter}
              </div>
          </div>
      )}
    </div>
  );
};

const MailLockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const PenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default CoverLetterPanel;
