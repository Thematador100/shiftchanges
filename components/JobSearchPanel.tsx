import React, { useState } from 'react';
import { ResumeData, PackageTier, MatchScoreResponse } from '../types';
import { tailorResume, calculateMatchScore } from '../services/geminiService';

interface TailorPanelProps {
  resumeData: ResumeData;
  onResumeTailored: (newResumeData: ResumeData) => void;
  onSetNotification: (message: string) => void;
  packageTier: PackageTier;
  onCheckout: () => void;
  // Shared props
  jobDescription?: string;
  onJobDescriptionChange?: (val: string) => void;
}

const MIN_DESCRIPTION_LENGTH = 100;

const TailorPanel: React.FC<TailorPanelProps> = ({ 
    resumeData, 
    onResumeTailored, 
    onSetNotification, 
    packageTier, 
    onCheckout,
    jobDescription: propJobDescription,
    onJobDescriptionChange: propOnJobDescriptionChange
}) => {
  // Use local state if shared props aren't provided (fallback)
  const [localJobDescription, setLocalJobDescription] = useState('');
  
  const jobDescription = propJobDescription !== undefined ? propJobDescription : localJobDescription;
  const setJobDescription = propOnJobDescriptionChange || setLocalJobDescription;

  const [isTailoring, setIsTailoring] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<MatchScoreResponse | null>(null);

  const validateInput = () => {
    const trimmedDescription = jobDescription.trim();
    if (!trimmedDescription) {
      setError("Please paste a job description.");
      return false;
    }
    if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
      setError(`The job description is too short (${trimmedDescription.length} chars). Please provide at least ${MIN_DESCRIPTION_LENGTH} characters for accurate analysis.`);
      return false;
    }
    return true;
  };

  const handleMatchScore = async () => {
      if (!hasAccess) { onCheckout(); return; }
      if (!validateInput()) return;

      setIsMatching(true);
      setError(null);
      setMatchResult(null);
      try {
          const result = await calculateMatchScore(resumeData, jobDescription);
          setMatchResult(result);
      } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
          setIsMatching(false);
      }
  }

  const handleTailor = async () => {
    if (!hasAccess) { onCheckout(); return; }
    if (!validateInput()) return;
    
    const confirmTailor = window.confirm("Are you sure? This will overwrite your current summary and experience sections to match the job description.");
    if (!confirmTailor) return;

    setIsTailoring(true);
    setError(null);
    try {
      const tailoredResume = await tailorResume(resumeData, jobDescription);
      onResumeTailored(tailoredResume);
      onSetNotification(`Resume successfully tailored for the provided job description!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while tailoring the resume.");
    } finally {
      setIsTailoring(false);
    }
  };

  const hasAccess = !['none', 'fast-ai'].includes(packageTier);
  const currentLength = jobDescription.trim().length;
  const isLengthValid = currentLength >= MIN_DESCRIPTION_LENGTH;
  const progressPercentage = Math.min(100, (currentLength / MIN_DESCRIPTION_LENGTH) * 100);

  return (
    <div className="p-4 space-y-6 relative">
      {!hasAccess && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg p-6 text-center">
            <PremiumIcon />
            <h3 className="text-xl font-bold text-slate-800 mt-4">Predictive Analytics & Tailoring Locked</h3>
            <p className="text-slate-600 mt-2 mb-6">Upgrade to <strong>Targeted ($299)</strong> or <strong>Specialist ($499)</strong> to unlock the Clinical Match Probability Engine.</p>
            <button onClick={onCheckout} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Upgrade Now
            </button>
        </div>
      )}
      {(isTailoring || isMatching) && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg">
          <Spinner />
          <p className="mt-4 text-slate-600 font-semibold animate-pulse">
              {isMatching ? "Calculating Match Probability..." : "Tailoring your resume..."}
          </p>
        </div>
      )}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-700">Job Match Intelligence</h2>
        <p className="text-base text-slate-500 mt-1">Paste a job description to calculate your hiring probability or tailor your resume.</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
            <textarea
            value={jobDescription}
            onChange={(e) => {
                setJobDescription(e.target.value);
                if (error) setError(null);
            }}
            placeholder="Paste the full job description here..."
            className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition text-base h-40 resize-none ${
                error 
                ? 'border-red-300 focus:ring-red-200' 
                : (isLengthValid ? 'border-teal-300 focus:ring-teal-200 focus:border-teal-500' : 'border-slate-300 focus:ring-blue-500')
            }`}
            disabled={isTailoring || isMatching || !hasAccess}
            />
             {/* Character Count Badge */}
            <div className="absolute bottom-3 right-3 pointer-events-none">
                 <div className={`text-xs font-bold px-2 py-1 rounded-md transition-colors shadow-sm border ${
                     isLengthValid 
                     ? 'bg-teal-50 text-teal-700 border-teal-100' 
                     : 'bg-slate-100 text-slate-500 border-slate-200'
                 }`}>
                     {currentLength} / {MIN_DESCRIPTION_LENGTH} chars
                 </div>
            </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-300 ease-out ${isLengthValid ? 'bg-teal-500' : 'bg-amber-400'}`}
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
        
        {/* Validation Feedback */}
        <div className="flex justify-between items-center text-xs h-4">
            <span className={`transition-colors duration-300 ${!isLengthValid && currentLength > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                {!isLengthValid && currentLength > 0 
                    ? `Keep typing... need ${MIN_DESCRIPTION_LENGTH - currentLength} more characters.` 
                    : (isLengthValid ? 'Length requirement met.' : 'Paste description above.')}
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <button
                onClick={handleMatchScore}
                disabled={isTailoring || isMatching || !jobDescription}
                className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white transition-colors ${isTailoring || isMatching || !jobDescription ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
                <ChartIcon />
                <span className="ml-2">Analyze Match Score</span>
            </button>

            <button
                onClick={handleTailor}
                disabled={isTailoring || isMatching || !jobDescription}
                className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white transition-colors ${isTailoring || isMatching || !jobDescription ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
                <WandIcon />
                <span className="ml-2">Auto-Tailor Resume</span>
            </button>
        </div>
      </div>

      {matchResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 animate-fade-in shadow-inner">
              <div className="flex flex-col md:flex-row gap-6 items-center border-b border-slate-200 pb-6 mb-6">
                  <div className="relative w-32 h-32 flex-shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth="3"
                          />
                          <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={matchResult.score > 70 ? "#10b981" : (matchResult.score > 40 ? "#f59e0b" : "#ef4444")}
                              strokeWidth="3"
                              strokeDasharray={`${matchResult.score}, 100`}
                              className="animate-[spin_1s_ease-out_reverse]"
                          />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-slate-800">{matchResult.score}%</span>
                          <span className="text-xs font-semibold uppercase text-slate-500">Match</span>
                      </div>
                  </div>
                  <div>
                      <h3 className="text-lg font-bold text-slate-800">Hiring Probability: <span className={`${matchResult.probability === 'High' ? 'text-green-600' : (matchResult.probability === 'Medium' ? 'text-amber-500' : 'text-red-500')}`}>{matchResult.probability}</span></h3>
                      <p className="text-slate-600 mt-2 text-sm leading-relaxed">{matchResult.reasoning}</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                       <h4 className="font-bold text-red-500 mb-3 flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                           Missing Keywords
                       </h4>
                       <ul className="space-y-2">
                           {matchResult.missingKeywords.length > 0 ? matchResult.missingKeywords.map((kw, i) => (
                               <li key={i} className="bg-white border border-red-100 text-red-700 px-3 py-1.5 rounded text-sm shadow-sm">{kw}</li>
                           )) : <li className="text-slate-500 italic text-sm">No critical keywords missing.</li>}
                       </ul>
                   </div>
                   <div>
                       <h4 className="font-bold text-amber-600 mb-3 flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                           Critical Gaps
                       </h4>
                       <ul className="space-y-2">
                           {matchResult.criticalGaps.length > 0 ? matchResult.criticalGaps.map((gap, i) => (
                               <li key={i} className="bg-white border border-amber-100 text-amber-800 px-3 py-1.5 rounded text-sm shadow-sm">{gap}</li>
                           )) : <li className="text-slate-500 italic text-sm">No critical experience gaps found.</li>}
                       </ul>
                   </div>
              </div>
          </div>
      )}

      {error && <ErrorMessage message={error} />}
    </div>
  );
};

// Helper Components
const Spinner = () => (
    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

const PremiumIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Oops! </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);

export default TailorPanel;