import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, PackageTier, CareerLevel } from './types';
import { initialResumeData } from './constants';
import ResumeEditor from './components/ResumeEditor';
import ResumePreview from './components/ResumePreview';
import CritiquePanel from './components/CritiquePanel';
import WelcomeScreen from './components/WelcomeScreen';
import Checkout from './components/Checkout';
import TailorPanel from './components/JobSearchPanel';
import CoverLetterPanel from './components/CoverLetterPanel';
import LockScreen from './components/LockScreen';
import SecurityModal from './components/SecurityModal';
import NotFound from './components/NotFound';
import ThankYou from './components/ThankYou';
import LoginModal from './components/LoginModal';
import { generateResumeFromPrompt, improveResumeFromText, pingServer, optimizeSkills } from './services/geminiService';

type AppState = 'welcome' | 'editor' | 'checkout' | 'thankYou' | 'notFound';
type ActiveTab = 'preview' | 'critique' | 'tailor' | 'coverLetter';
type ServerStatus = {
    status: 'checking' | 'ok' | 'error';
    message?: string;
};
type SaveStatus = 'idle' | 'saving' | 'saved';

const LOCAL_STORAGE_KEY = 'nurse-resume-data';
const PACKAGE_KEY = 'nurse-resume-package-tier';
const PASSWORD_HASH_KEY = 'nurse-resume-password-hash';
const AUTH_TOKEN_KEY = 'nurse-resume-auth-token';
const USER_EMAIL_KEY = 'nurse-resume-user-email';

const App: React.FC = () => {
  // Authentication State
  const [hasPassword, setHasPassword] = useState(() => !!localStorage.getItem(PASSWORD_HASH_KEY));
  const [isLocked, setIsLocked] = useState(() => !!localStorage.getItem(PASSWORD_HASH_KEY));
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData) as ResumeData;
      }
    } catch (e) {
      console.error("Could not load resume data from local storage", e);
    }
    return initialResumeData;
  });
  
  // Shared state for Job Description to allow continuity between Match and Cover Letter tabs
  const [sharedJobDescription, setSharedJobDescription] = useState('');
  
  const [selectedCareerLevel, setSelectedCareerLevel] = useState<CareerLevel>('experienced');

  const [appState, setAppState] = useState<AppState>('welcome');
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [checkoutPlan, setCheckoutPlan] = useState<PackageTier | null>(null);
  
  const [purchasedPackage, setPurchasedPackage] = useState<PackageTier>(() => {
    try {
      const savedPkg = localStorage.getItem(PACKAGE_KEY) as PackageTier;
      return savedPkg || 'none';
    } catch (e) {
      return 'none';
    }
  });
  
  const [authToken, setAuthToken] = useState<string>(() => {
    try {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      return savedToken || '';
    } catch (e) {
      return '';
    }
  });
  
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      const savedEmail = localStorage.getItem(USER_EMAIL_KEY);
      return savedEmail || '';
    } catch (e) {
      return '';
    }
  });
  
  const [serverStatus, setServerStatus] = useState<ServerStatus>({ status: 'checking' });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isDevMode, setIsDevMode] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  // Feature States
  const [isOptimizingSkills, setIsOptimizingSkills] = useState(false);

  // Admin / God Mode Logic
  const [logoClicks, setLogoClicks] = useState(0);
  const logoClickTimeoutRef = useRef<number | null>(null);

  // --- INITIALIZATION CHECK (For Stripe Redirects) ---
  useEffect(() => {
    // Check URL parameters for Stripe success
    const query = new URLSearchParams(window.location.search);
    const redirectStatus = query.get('redirect_status');
    const paymentIntent = query.get('payment_intent');

    const paymentSuccess = query.get('payment_success');
    
    if ((redirectStatus === 'succeeded' && paymentIntent) || paymentSuccess === 'true') {
        // Success! Unlock features.
        // In a perfect world, we'd fetch the metadata from the server to know WHICH plan.
        // For now, we assume they bought the 'Targeted' plan at minimum or unlock based on logic.
        // We'll default to 'expert-clinical' to be safe and generous if we can't tell.
        setPurchasedPackage('expert-clinical');
        setAppState('thankYou');
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Server Check
    const checkServer = async () => {
        try {
            await pingServer();
            setServerStatus({ status: 'ok' });
        } catch (error) {
            // Only show error if we aren't in the middle of a redirect or special state
            if (!redirectStatus) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred.';
                setServerStatus({ status: 'error', message });
            }
        }
    };
    checkServer();
  }, []);

  // --- URL ROUTING CHECK (For 404 Handling) ---
  useEffect(() => {
    const path = window.location.pathname;

    // Define valid paths for the SPA
    const validPaths = ['/', '/index.html'];

    // Check if current path is valid
    if (!validPaths.includes(path)) {
        // Invalid path detected - show 404
        setAppState('notFound');
    }
  }, []);

  const handleLogoClick = () => {
      // Increment click count
      setLogoClicks(prev => prev + 1);

      // Reset count if they stop clicking for 1 second
      if (logoClickTimeoutRef.current) clearTimeout(logoClickTimeoutRef.current);
      logoClickTimeoutRef.current = window.setTimeout(() => {
          setLogoClicks(0);
      }, 1000);

      // Trigger God Mode on 5th click
      if (logoClicks + 1 === 5) {
          const password = window.prompt("ShiftChange Admin Override\nEnter Access Key:");
          // Check against environment variable injected by server or Vite
          const envPassword = (window.env?.VITE_ADMIN_PASSWORD) || (import.meta as any).env.VITE_ADMIN_PASSWORD || 'shiftchange2025';
          
          if (password === envPassword) {
              setPurchasedPackage('leadership-np'); // Unlock highest tier
              setIsDevMode(true);
              setNotification("God Mode Activated: All features unlocked for testing.");
              setNotificationType('success');
              if (appState === 'welcome') setAppState('editor');
          } else {
              alert("Access Denied.");
          }
          setLogoClicks(0);
      }
  };

  useEffect(() => {
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }
    
    // Do not auto-save if locked to prevent overwriting with empty state
    if (isLocked) return;

    setSaveStatus('saving');
    saveTimeoutRef.current = window.setTimeout(async () => {
        try {
            // Save to localStorage
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumeData));
            
            // Also save to database if user has email (logged in or purchased)
            if (userEmail) {
                try {
                    await fetch('/api/save-resume', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: userEmail, resumeData })
                    });
                } catch (dbError) {
                    console.error('Could not save to database:', dbError);
                    // Don't fail the whole save if database fails
                }
            }
            
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (e) {
            console.error("Could not save resume data to local storage", e);
            setSaveStatus('idle');
        }
    }, 500);

    return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [resumeData, isLocked, userEmail]);

  useEffect(() => {
    try {
      // Don't save dev mode package to local storage to prevent accidental permanent unlocks
      if (!isDevMode) {
        localStorage.setItem(PACKAGE_KEY, purchasedPackage);
      }
    } catch (e) {
      console.error("Could not save package status", e);
    }
  }, [purchasedPackage, isDevMode]);
  
  useEffect(() => {
    try {
      if (authToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      }
    } catch (e) {
      console.error("Could not save auth token", e);
    }
  }, [authToken]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleGenerate = async (prompt: string, level: CareerLevel) => {
    console.log('Attempting to generate resume with prompt:', prompt, 'level:', level);
    try {
        const newResume = await generateResumeFromPrompt(prompt, level, authToken);
        console.log('Resume generated successfully.');
        setResumeData(newResume);
        setSelectedCareerLevel(level);
        setAppState('editor');
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Generation failed.';
        if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('authentication')) {
            setNotification('Please purchase a plan to generate resumes.');
            setNotificationType('error');
            handleGoToCheckout('fast-ai');
        } else {
            console.error("API Error during operation:", e);
            setNotification(msg);
            setNotificationType('error');
        }
    }
  };

  const handleImprove = async (text: string) => {
    try {
        const newResume = await improveResumeFromText(text, authToken);
        setResumeData(newResume);
        setAppState('editor');
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Improvement failed.';
        if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('authentication')) {
            setNotification('Please purchase a plan to improve resumes.');
            setNotificationType('error');
            handleGoToCheckout('fast-ai');
        } else {
            console.error("API Error during operation:", e);
            setNotification(msg);
            setNotificationType('error');
        }
    }
  };

  const handleOptimizeSkills = async () => {
      setIsOptimizingSkills(true);
      try {
          const { newSkills, newSoftSkills } = await optimizeSkills(resumeData, selectedCareerLevel, authToken);
          setResumeData(prev => ({
              ...prev,
              skills: Array.from(new Set([...prev.skills, ...newSkills])),
              softSkills: Array.from(new Set([...prev.softSkills, ...newSoftSkills]))
          }));
          setNotification("Skills optimized with high-impact ATS keywords.");
          setNotificationType('success');
      } catch (e) {
          const msg = e instanceof Error ? e.message : "Failed to optimize skills.";
          console.error("API Error during skills optimization:", e);
          setNotification(msg);
          setNotificationType('error');
      } finally {
          setIsOptimizingSkills(false);
      }
  };

  const handleManualEdit = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setResumeData(initialResumeData); // Reset to default template
    setAppState('editor');
  };
  
  const handleStartOver = () => {
    const confirmStartOver = window.confirm("Are you sure you want to start over? Your current progress will be lost.");
    if (confirmStartOver) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(PACKAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      // NOTE: We do NOT remove the password here intentionally, unless reset from lock screen
      setResumeData(initialResumeData);
      setPurchasedPackage('none');
      setAuthToken('');
      setIsDevMode(false); // Turn off dev mode on reset
      setAppState('welcome');
    }
  };

  const handleGoToCheckout = (plan: PackageTier) => {
    setCheckoutPlan(plan);
    setAppState('checkout');
  };
  
  const handlePurchase = (tier: PackageTier, token?: string, email?: string) => {
    setPurchasedPackage(tier);
    if (token) {
      setAuthToken(token);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    if (email) {
      setUserEmail(email);
      localStorage.setItem(USER_EMAIL_KEY, email);
    }
    setAppState('editor');
    setNotification('Access granted. Professional features unlocked.');
    setNotificationType('success');
  };

  const handleResumeTailored = (newResumeData: ResumeData) => {
    setResumeData(newResumeData);
    setActiveTab('preview'); // Switch to preview tab to show changes
  };

  // --- Authentication Handlers ---
  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleLockApp = () => {
    setIsLocked(true);
  };

  const handlePasswordSet = (hash: string) => {
    localStorage.setItem(PASSWORD_HASH_KEY, hash);
    setHasPassword(true);
  };

  const handlePasswordRemoved = () => {
    localStorage.removeItem(PASSWORD_HASH_KEY);
    setHasPassword(false);
  };

  const handleResetApp = () => {
      // Nukes everything
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(PACKAGE_KEY);
      localStorage.removeItem(PASSWORD_HASH_KEY);
      setResumeData(initialResumeData);
      setPurchasedPackage('none');
      setHasPassword(false);
      setIsLocked(false);
      setAppState('welcome');
  };

  // --- Login Handler ---
  const handleLoginSuccess = async (authToken: string, planTier: string, email: string) => {
    setAuthToken(authToken);
    setPurchasedPackage(planTier as PackageTier);
    setUserEmail(email);
    localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    localStorage.setItem(PACKAGE_KEY, planTier);
    localStorage.setItem(USER_EMAIL_KEY, email);
    
    // Load resume data from database
    try {
      const response = await fetch(`/api/load-resume?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.resumeData) {
          setResumeData(data.resumeData);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.resumeData));
        }
      }
    } catch (error) {
      console.error('Could not load resume from database:', error);
      // Continue anyway with local data
    }
    
    setShowLoginModal(false);
    setAppState('editor');
    setNotification('Welcome back! You are now logged in.');
    setNotificationType('success');
  };

  if (isLocked) {
      return <LockScreen onUnlock={handleUnlock} onResetApp={handleResetApp} />;
  }

  if (appState === 'notFound') {
      return <NotFound onReturnHome={() => setAppState('welcome')} />;
  }

  if (appState === 'welcome') {
    return (
        <>
            <WelcomeScreen 
                onGenerate={handleGenerate} 
                onImprove={handleImprove} 
                onManualEdit={handleManualEdit} 
                onGoToCheckout={handleGoToCheckout} 
                onLogoClick={handleLogoClick}
                onLogin={() => setShowLoginModal(true)}
            />
            {/* Minimal Header for Welcome Screen to access security */}
            <div className="fixed top-4 right-4 z-50">
               <button 
                  onClick={() => setShowSecurityModal(true)}
                  className="bg-white/90 backdrop-blur p-2 rounded-full shadow-md hover:bg-white text-slate-600 transition-colors border border-slate-200"
                  title="Security Settings"
                >
                  <ShieldIcon className="h-5 w-5" />
               </button>
            </div>
            <SecurityModal 
                isOpen={showSecurityModal}
                onClose={() => setShowSecurityModal(false)}
                onPasswordSet={handlePasswordSet}
                onPasswordRemoved={handlePasswordRemoved}
                hasPassword={hasPassword}
            />
            <LoginModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </>
    );
  }

  if (appState === 'thankYou') {
      const packageDetails: Record<PackageTier, string> = {
        'none': 'None',
        'fast-ai': 'Fast Track',
        'ai-target': 'Targeted',
        'expert-clinical': 'Specialist',
        'leadership-np': 'Executive'
      };
      
      return <ThankYou 
                packageName={packageDetails[purchasedPackage]} 
                onContinue={() => setAppState('editor')} 
            />;
  }

  if (appState === 'checkout' && checkoutPlan) {
      return <Checkout 
                plan={checkoutPlan} 
                onPurchase={handlePurchase} 
                onBack={() => setAppState(purchasedPackage !== 'none' ? 'editor' : 'welcome')} 
            />;
  }

  const isPaidUser = purchasedPackage !== 'none';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      <Header 
        onStartOver={handleStartOver} 
        saveStatus={saveStatus} 
        hasPassword={hasPassword}
        onLock={handleLockApp}
        onOpenSecurity={() => setShowSecurityModal(true)}
        onLogoClick={handleLogoClick}
      />
      
      <main className="container mx-auto p-4 md:p-8">
        {isDevMode && <DevModeBanner onDismiss={() => { setIsDevMode(false); setPurchasedPackage('none'); }} />}
        <ServerStatusBanner serverStatus={serverStatus} />
        {notification && <Notification message={notification} type={notificationType} onDismiss={() => setNotification(null)} />}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print-grid-reset">
          
          <div className="bg-white p-6 rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 h-fit print-hidden">
            <h2 className="text-2xl font-bold font-brand text-slate-900 mb-6 border-b pb-4">Resume Architect</h2>
            <ResumeEditor 
                resumeData={resumeData} 
                setResumeData={setResumeData} 
                onOptimizeSkills={handleOptimizeSkills}
                isOptimizing={isOptimizingSkills}
                isPaidUser={isPaidUser}
            />
          </div>

          <div className="sticky top-8 self-start">
             <div className="bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-100 print-hidden bg-slate-50/50 overflow-x-auto">
                  <TabButton label="Preview" isActive={activeTab === 'preview'} onClick={() => setActiveTab('preview')} />
                  <TabButton label="AI Critique" isActive={activeTab === 'critique'} onClick={() => setActiveTab('critique')} />
                  <TabButton label="Job Match" isActive={activeTab === 'tailor'} onClick={() => setActiveTab('tailor')} />
                  <TabButton label="Cover Letter" isActive={activeTab === 'coverLetter'} onClick={() => setActiveTab('coverLetter')} />
                </div>
                <div className="p-1 sm:p-2 md:p-6 min-h-[80vh] max-h-[80vh] overflow-y-auto relative print-no-scroll">
                    {activeTab === 'preview' && (
                        <ResumePreview 
                            resumeData={resumeData} 
                            packageTier={purchasedPackage}
                            onCheckout={() => handleGoToCheckout('ai-target')}
                        />
                    )}
                    {activeTab === 'critique' && 
                        <CritiquePanel 
                            resumeData={resumeData} 
                            packageTier={purchasedPackage}
                            onCheckout={() => handleGoToCheckout('fast-ai')}
                            careerLevel={selectedCareerLevel}
                        />
                    }
                    {activeTab === 'tailor' && (
                        <TailorPanel 
                            resumeData={resumeData} 
                            onResumeTailored={handleResumeTailored}
                            onSetNotification={(msg) => { setNotification(msg); setNotificationType('success'); }}
                            packageTier={purchasedPackage}
                            onCheckout={() => handleGoToCheckout('ai-target')}
                            // Pass shared state prop
                            jobDescription={sharedJobDescription}
                            onJobDescriptionChange={setSharedJobDescription}
                        />
                    )}
                    {activeTab === 'coverLetter' && (
                        <CoverLetterPanel
                            resumeData={resumeData}
                            jobDescription={sharedJobDescription}
                            onJobDescriptionChange={setSharedJobDescription}
                            packageTier={purchasedPackage}
                            onCheckout={() => handleGoToCheckout('expert-clinical')}
                        />
                    )}
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar for Unpaid Users */}
      {!isPaidUser && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 z-40 border-t border-slate-700 shadow-2xl print-hidden animate-fade-in">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-red-500 rounded-full p-2 animate-pulse">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                         </svg>
                    </div>
                    <div>
                        <p className="font-bold text-sm sm:text-base">DRAFT MODE: HR Liability Risk Detected</p>
                        <p className="text-xs text-slate-400">Your resume is not optimized for ATS or Hiring Managers.</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleGoToCheckout('ai-target')}
                    className="w-full sm:w-auto px-8 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-lg shadow-lg transition-colors uppercase tracking-wide text-sm"
                >
                    Fix Issues & Unlock
                </button>
            </div>
        </div>
      )}

      <SecurityModal 
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onPasswordSet={handlePasswordSet}
        onPasswordRemoved={handlePasswordRemoved}
        hasPassword={hasPassword}
      />
    </div>
  );
};

interface HeaderProps {
    onStartOver: () => void;
    saveStatus: SaveStatus;
    hasPassword: boolean;
    onLock: () => void;
    onOpenSecurity: () => void;
    onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onStartOver, saveStatus, hasPassword, onLock, onOpenSecurity, onLogoClick }) => (
  <header className="bg-white sticky top-0 z-10 shadow-sm border-b border-slate-200 print-hidden">
    <div className="container mx-auto px-8 py-4 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer select-none" 
        onClick={onLogoClick}
        title="ShiftChange"
      >
        <ShiftLogo className="h-8 w-8 text-teal-600" />
        <h1 className="text-xl font-bold text-slate-900 font-brand hidden sm:block">
          ShiftChange
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <SaveStatusIndicator status={saveStatus} />
        
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            {hasPassword && (
                <button 
                    onClick={onLock} 
                    className="text-slate-500 hover:text-teal-600 transition-colors p-2 rounded-full hover:bg-slate-50"
                    title="Lock App"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
            <button 
                onClick={onOpenSecurity} 
                className="text-slate-500 hover:text-teal-600 transition-colors p-2 rounded-full hover:bg-slate-50"
                title="Security Settings"
            >
                <ShieldIcon className="h-5 w-5" />
            </button>
        </div>

        <button onClick={onStartOver} className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors border-l border-slate-200 pl-4">
            Exit
        </button>
      </div>
    </div>
  </header>
);

const ShiftLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M14.6 2.2c-.6-.4-1.4-.2-1.8.4l-4 6c-.3.5-.3 1.1 0 1.6l4 6c.4.6 1.2.8 1.8.4.6-.4.8-1.2.4-1.8L11.8 10l3.2-4.8c.4-.6.2-1.4-.4-1.8z" opacity="0.5"/>
        <path d="M9.4 21.8c.6.4 1.4.2 1.8-.4l4-6c.3-.5.3-1.1 0-1.6l-4-6c-.4-.6-1.2-.8-1.8-.4-.6.4-.8 1.2-.4 1.8l3.2 4.8-3.2 4.8c-.4.6-.2 1.4.4 1.8z"/>
    </svg>
)

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick} 
        className={`flex-1 min-w-[100px] py-3 text-sm font-bold transition-all duration-200 border-b-2
        ${isActive 
            ? 'text-teal-700 border-teal-600 bg-teal-50/50' 
            : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
        }`}
    >
        {label}
    </button>
);

const Notification: React.FC<{message: string, type: 'success' | 'error', onDismiss: () => void}> = ({ message, type, onDismiss }) => {
    const baseClasses = 'fixed top-24 right-8 p-4 rounded-lg shadow-xl text-white text-sm font-medium z-50 animate-fade-in-down print-hidden';
    const typeClasses = type === 'success' ? 'bg-teal-600' : 'bg-red-500';

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            {message}
            <button onClick={onDismiss} className="ml-4 font-bold opacity-80 hover:opacity-100">&times;</button>
        </div>
    )
};

const ServerStatusBanner: React.FC<{ serverStatus: ServerStatus }> = ({ serverStatus }) => {
    if (serverStatus.status === 'ok' || serverStatus.status === 'checking') return null;

    return (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md mb-6" role="alert">
            <p className="font-bold">Connection Error</p>
            <p className="text-sm">Could not connect to the Intelligence Engine. AI features are temporarily unavailable.</p>
        </div>
    );
};

const SaveStatusIndicator: React.FC<{status: SaveStatus}> = ({ status }) => {
    let text = '';
    if (status === 'saving') text = 'Syncing...';
    if (status === 'saved') text = 'Synced';

    return (
        <div className={`text-xs font-semibold text-slate-400 transition-opacity duration-300 ${status !== 'idle' ? 'opacity-100' : 'opacity-0'}`}>
            {text}
        </div>
    );
};

const DevModeBanner: React.FC<{onDismiss: () => void}> = ({ onDismiss }) => (
    <div className="bg-purple-900 text-white p-3 rounded-md mb-6 flex justify-between items-center print-hidden animate-fade-in-down shadow-lg">
        <div>
            <p className="font-bold text-sm">God Mode Active</p>
            <p className="text-xs text-purple-200">You are viewing as an Administrator with 'Executive' tier privileges.</p>
        </div>
        <button onClick={onDismiss} className="text-purple-300 hover:text-white flex items-center gap-1 text-xs font-bold bg-purple-800 px-2 py-1 rounded" aria-label="Dismiss developer mode notification">
            LOCK ACCESS
        </button>
    </div>
);

const ShieldIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);


export default App;