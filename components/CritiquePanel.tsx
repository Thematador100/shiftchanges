
import React, { useState, useCallback } from 'react';
import { ResumeData, CritiqueResponse, PackageTier, CareerLevel } from '../types';
import { critiqueResume } from '../services/geminiService';

interface CritiquePanelProps {
  resumeData: ResumeData;
  packageTier: PackageTier;
  onCheckout: () => void;
  careerLevel: CareerLevel;
}

const CritiquePanel: React.FC<CritiquePanelProps> = ({ resumeData, packageTier, onCheckout, careerLevel }) => {
  const [critique, setCritique] = useState<CritiqueResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaidUser = packageTier !== 'none';

  const handleCritique = useCallback(async () => {
    if (!isPaidUser) {
      onCheckout();
      return;
    }
    setIsLoading(true);
    setError(null);
    setCritique(null);
    try {
      const result = await critiqueResume(resumeData);
      setCritique(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [resumeData, isPaidUser, onCheckout]);

  const getProtocolName = () => {
      switch(careerLevel) {
          case 'new_grad': return "New Grad Potential Protocol";
          case 'leadership': return "Leadership ROI Protocol";
          default: return "High-Acuity Clinical Protocol";
      }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-700">AI Resume Critique</h2>
        <p className="text-base text-slate-500 mt-1">Get instant feedback from our AI-powered nursing career expert.</p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wide text-teal-700">Active: {getProtocolName()}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCritique}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isLoading ? (
            <>
              <Spinner />
              Running {getProtocolName()}...
            </>
          ) : isPaidUser ? (
            <>
              <SparklesIcon />
              Critique My Resume
            </>
          ) : (
             <>
              <LockIcon />
              Unlock AI Critique
            </>
          )}
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {critique && !isLoading && (
        <div className="space-y-6 animate-fade-in text-base">
          <CritiqueSection title="Overall Feedback" icon={<FeedbackIcon />}>
            <p className="text-slate-600">{critique.overallFeedback}</p>
          </CritiqueSection>

          <CritiqueSection title="Strengths" icon={<ThumbsUpIcon />}>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              {critique.strengths.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </CritiqueSection>

          <CritiqueSection title="Areas for Improvement" icon={<WandIcon />}>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              {critique.areasForImprovement.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </CritiqueSection>
          
          {critique.bulletPointImprovements && critique.bulletPointImprovements.length > 0 && (
             <CritiqueSection title="Bullet Point Makeovers" icon={<RefreshIcon />}>
                <div className="space-y-6">
                    {critique.bulletPointImprovements.map((item, index) => (
                        <div key={index} className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
                            <div className="mb-3">
                                <span className="uppercase text-xs font-bold text-red-500 tracking-wider">Original</span>
                                <p className="text-slate-500 line-through mt-1 italic">{item.original}</p>
                            </div>
                            <div className="mb-3">
                                 <span className="uppercase text-xs font-bold text-green-600 tracking-wider">Improved</span>
                                 <p className="text-slate-800 font-medium mt-1">{item.improved}</p>
                            </div>
                            <div className="text-sm bg-blue-50 text-blue-800 p-2 rounded">
                                <span className="font-semibold">Why this is better: </span>{item.explanation}
                            </div>
                        </div>
                    ))}
                </div>
             </CritiqueSection>
          )}
        </div>
      )}
    </div>
  );
};


// Helper Components
const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm-1 4V5a1 1 0 112 0v1H9z" clipRule="evenodd" />
    </svg>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Oops! </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);

interface CritiqueSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const CritiqueSection: React.FC<CritiqueSectionProps> = ({ title, icon, children }) => (
    <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg">
        <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-3 mb-3">
            <span className="text-blue-500">{icon}</span>
            {title}
        </h3>
        {children}
    </div>
);

const FeedbackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ThumbsUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.93L5.5 8m7 2v5m0 0v-5m0 5H9.828a2 2 0 01-1.789-2.894l3.5-7A2 2 0 0113.236 5H14a2 2 0 012 2v5h-2z" />
    </svg>
);
const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);
const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

export default CritiquePanel;
