
import React, { useState, useRef } from 'react';
import { PackageTier, CareerLevel } from '../types';

// Declare globals for the libraries loaded in index.html
declare const pdfjsLib: any;
declare const mammoth: any;

// --- File Reading Helper ---
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer.'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('File reading failed.'));
    reader.readAsArrayBuffer(file);
  });
}

// --- Main Thread File Parser ---
const parseFileOnMainThread = async (file: File): Promise<string> => {
    const fileBuffer = await readFileAsArrayBuffer(file);

    // PDF Parsing
    if (file.type === 'application/pdf') {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error("PDF parsing library is not loaded. Please check your internet connection and refresh.");
        }
        const loadingTask = pdfjsLib.getDocument(fileBuffer);
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n\n';
        }
        return fullText.trim();
    }
    
    // DOCX Parsing
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        if (typeof mammoth === 'undefined') {
             throw new Error("DOCX parsing library is not loaded. Please check your internet connection and refresh.");
        }
        const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
        return result.value;
    }
    
    // Text Parsing
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
        const decoder = new TextDecoder();
        return decoder.decode(fileBuffer);
    }
    
    throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF, DOCX, or TXT file.`);
};

interface WelcomeScreenProps {
  onGenerate: (prompt: string, level: CareerLevel) => Promise<void>;
  onImprove: (text: string) => Promise<void>;
  onManualEdit: () => void;
  onGoToCheckout: (plan: PackageTier) => void;
  onLogoClick?: () => void;
  onLogin?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGenerate, onImprove, onManualEdit, onGoToCheckout, onLogoClick, onLogin }) => {
  const [view, setView] = useState<'landing' | 'hub'>('landing');
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [improveText, setImproveText] = useState('');
  const [activeHubTab, setActiveHubTab] = useState<'generate' | 'improve'>('generate');
  const [selectedLevel, setSelectedLevel] = useState<CareerLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    console.log("handleGenerate called");
    if (!selectedLevel) {
        setError('Please select your career stage first.');
        return;
    }
    if (!generatePrompt.trim()) {
      setError('Please provide some details to generate your resume.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log("Calling onGenerate...");
      await onGenerate(generatePrompt, selectedLevel);
      console.log("onGenerate completed successfully.");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error("Error in handleGenerate:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!improveText.trim()) {
      setError('Please paste or upload your resume text to improve it.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onImprove(improveText);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error("Error in handleGenerate:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setError(null);
    setIsLoading(true);

    try {
        const text = await parseFileOnMainThread(file);
        if (!text || text.trim().length === 0) {
            throw new Error("Extracted text is empty. The file might be image-based or corrupted.");
        }
        setImproveText(text);
    } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred while reading the file.";
        setError(message);
    } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
  
  const handleGoToImprove = () => {
    setActiveHubTab('improve');
    setView('hub');
  };

  const getLevelDescription = (level: CareerLevel) => {
      switch(level) {
          case 'new_grad': return "Activating Potential Protocol: We will translate your clinical rotations and capstone hours into 'Professional Experience' and emphasize adaptability to overcome lack of tenure.";
          case 'experienced': return "Activating High-Acuity Protocol: We will focus on quantifiable outcomes, device mastery (CRRT, Impella), and patient ratios to prove 'Plug-and-Play' readiness.";
          case 'leadership': return "Activating Leadership ROI Protocol: We will strip task-based language and focus on fiscal responsibility, retention stats, regulatory success, and scope of control.";
      }
  }

  const selectLevel = (level: CareerLevel) => {
      setSelectedLevel(level);
      // Pre-fill prompt based on level to help user
      if (!generatePrompt) {
          if (level === 'new_grad') setGeneratePrompt("New Grad RN, BSN. Capstone in ER. 3.8 GPA. ACLS certified. Clinical rotations in Med-Surg, Peds, L&D.");
          if (level === 'experienced') setGeneratePrompt("ICU Nurse with 5 years experience, charge nurse skills, managed CRRT, Impella, IABP. Reduced CLABSI rates. CCRN certified.");
          if (level === 'leadership') setGeneratePrompt("Nurse Manager for 30-bed Telemetry unit. Managed 45 FTEs and $2M budget. Improved retention by 15%. Led Joint Commission prep.");
      }
  }

  if (view === 'landing') {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900">
            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                      <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onLogoClick}>
                        <ShiftLogo className="h-8 w-8 text-slate-900" />
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">ShiftChange</span>
                    </div>
                    <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
                        <button onClick={() => scrollTo('problem')} className="hover:text-slate-900 transition-colors">Why It Works</button>
                        <button onClick={() => scrollTo('pricing')} className="hover:text-slate-900 transition-colors">Pricing</button>
                        <button onClick={onLogin} className="hover:text-slate-900 transition-colors">Log In</button>
                    </div>
                    <button onClick={() => setView('hub')} className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                        Build My Resume
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-block px-4 py-1 border border-slate-300 text-slate-700 text-xs font-semibold uppercase tracking-wide mb-8">
                            HR & Clinical Lead Approved
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                            Your Clinical Excellence. <br className="hidden md:block"/>
                            Architected for HR.
                        </h1>
                        <p className="mt-8 text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                            The first resume engine built by Hospital HR Directors. We translate your bedside chaos into the risk-mitigation and competence language that secures interviews.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button onClick={() => setView('hub')} className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors">
                                Start Your Transformation
                            </button>
                            <button onClick={() => scrollTo('problem')} className="w-full sm:w-auto px-8 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors">
                                See The HR Logic
                            </button>
                        </div>
                        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-400">
                            <span>Magnet Recognized</span>
                            <span className="text-slate-300">•</span>
                            <span>Joint Commission</span>
                            <span className="text-slate-300">•</span>
                            <span>Level I Trauma</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* The Problem / HR Insight Section */}
            <section id="problem" className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl lg:text-5xl font-bold mb-6">The 6-Second Scan. <br/>You are failing it.</h2>
                            <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                I spent 15 years in Hospital HR. We don't read resumes. We scan for <strong className="text-white">Liability</strong> and <strong className="text-white">Competence</strong>.
                            </p>
                            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                                Most nurses write task lists: "Administered meds," "Charted in Epic." This is fatal. It frames you as a commodity.
                            </p>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                <strong className="text-white">ShiftChange</strong> re-engineers your experience into assets: Acuity, Ratios, Outcomes, and Crisis Management. We don't just write a resume; we build a clinical business case for hiring you.
                            </p>
                        </div>
                        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
                             <div className="space-y-6">
                                <ComparisonRow
                                    label="Before: Generic Task List"
                                    text="Provided nursing care for ICU patients. Administered medications and monitored vital signs. Assisted with patient procedures. Documented care in electronic health records."
                                    isBad
                                />
                                <div className="flex justify-center text-slate-500">
                                    <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                </div>
                                <ComparisonRow
                                    label="After: Clinical Asset Profile"
                                    text="Managed 2:1 high-acuity caseload in 18-bed Level I Trauma ICU. Titrated multiple vasoactive drips (Levophed, Vasopressin, Epinephrine) to MAP goals >65 while maintaining strict I&O protocols. Achieved zero CLABSI events across 500+ central line days. Precepted 8 new graduates..."
                                    isGood
                                />
                                <div className="h-px bg-slate-700 my-4"></div>
                                <ComparisonRow
                                    label="Before: Duties Without Impact"
                                    text="Charge nurse responsibilities. Managed staffing. Led code blue responses. Ensured compliance with hospital policies."
                                    isBad
                                />
                                <div className="flex justify-center text-slate-500">
                                    <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                </div>
                                <ComparisonRow
                                    label="After: Leadership ROI Evidence"
                                    text="Led charge operations for 30-bed Medical-Surgical unit with 1:5-6 ratios. Coordinated rapid response team for 200+ bed facility, achieving 18% reduction in code blue escalations through early intervention protocols. Maintained 98% compliance with Joint Commission..."
                                    isGood
                                />
                             </div>
                             <div className="mt-6 pt-6 border-t border-slate-700">
                                <p className="text-sm text-slate-400 text-center italic">These are abbreviated samples. Full ShiftChange profiles include 4-6 bullet points per role with complete metrics, equipment proficiency, and regulatory achievements.</p>
                             </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* The Solution / Methodology */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                         <h2 className="text-3xl lg:text-5xl font-bold font-brand text-slate-900 mb-6">The Clinical Translation Protocol</h2>
                         <p className="text-xl text-slate-600">We combine proprietary AI with human HR logic to surface your value.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<ShieldCheckIcon />}
                            title="Risk Mitigation"
                            desc="We highlight adherence to protocols, safety metrics, and certifications to position you as a 'Low Risk, High Value' hire."
                        />
                         <FeatureCard 
                            icon={<ChartIcon />}
                            title="Outcome Quantification"
                            desc="We force-extract numbers from your memory. Patient ratios, unit size, throughput efficiency, and satisfaction scores."
                        />
                         <FeatureCard 
                            icon={<CpuIcon />}
                            title="ATS Compliance Standard"
                            desc="All tiers include strict ATS-compliant formatting. We guarantee readability by Taleo, Workday, and Greenhouse."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold font-brand text-slate-900 mb-6">Investment Tiers</h2>
                        <p className="text-xl text-slate-600">Choose the package aligned with your career stage. All tiers include lifetime access and unlimited revisions.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* New Grad Tier */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-8 hover:shadow-2xl transition-shadow">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">New Grad</h3>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-5xl font-bold text-slate-900">$149</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">Perfect for new graduates and career changers</p>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <PricingFeature text="Guaranteed ATS Compliance" />
                                <PricingFeature text="AI Architecture Engine" />
                                <PricingFeature text="Unlimited Revisions" />
                                <PricingFeature text="PDF & Word Output" />
                                <PricingFeature text="Potential Protocol Optimization" />
                                <PricingFeature text="Clinical Rotation Translation" />
                                <PricingFeature text="Lifetime Access" />
                            </ul>
                            <button 
                                onClick={() => onGoToCheckout('fast-ai')} 
                                className="w-full py-3 bg-slate-900 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors"
                            >
                                Select New Grad
                            </button>
                        </div>

                        {/* Bedside/Clinical Tier */}
                        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-900 p-8 relative hover:shadow-2xl transition-shadow">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1 rounded-full text-sm font-bold">
                                Most Popular
                            </div>
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Bedside/Clinical</h3>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-5xl font-bold text-slate-900">$299</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">For experienced bedside nurses</p>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <PricingFeature text="Everything in New Grad" />
                                <PricingFeature text="Clinical Match Probability Score" />
                                <PricingFeature text="Job Description Mapping" />
                                <PricingFeature text="Gap Analysis Engine" />
                                <PricingFeature text="High-Acuity Protocol" />
                                <PricingFeature text="Outcome Quantification" />
                                <PricingFeature text="Device Mastery Highlighting" />
                                <PricingFeature text="Premium Templates" />
                            </ul>
                            <button 
                                onClick={() => onGoToCheckout('ai-target')} 
                                className="w-full py-3 bg-slate-900 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors"
                            >
                                Select Bedside/Clinical
                            </button>
                        </div>

                        {/* Leadership/NP Tier */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-8 hover:shadow-2xl transition-shadow">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Leadership/NP</h3>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-5xl font-bold text-slate-900">$499</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">For managers and advanced practice</p>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <PricingFeature text="Everything in Bedside/Clinical" />
                                <PricingFeature text="Clinical Outcome Extraction" />
                                <PricingFeature text="3 Specialty Variants" />
                                <PricingFeature text="Interview Prep Sheet" />
                                <PricingFeature text="Cover Letter Included" />
                                <PricingFeature text="Leadership ROI Protocol" />
                                <PricingFeature text="Budget & Staffing Metrics" />
                                <PricingFeature text="LinkedIn Profile Optimization" />
                            </ul>
                            <button 
                                onClick={() => onGoToCheckout('expert-clinical')} 
                                className="w-full py-3 bg-slate-900 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors"
                            >
                                Select Leadership/NP
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <ShiftLogo className="h-6 w-6 text-slate-900" />
                        <span className="text-xl font-bold font-brand text-white">ShiftChange</span>
                    </div>
                    <p className="text-sm">© {new Date().getFullYear()} ShiftChange. All Clinical Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 lg:p-8">
      {/* Creation Hub Header */}
      <div className="mb-10 text-center">
         <div className="flex items-center justify-center gap-3 mb-4 cursor-pointer select-none" onClick={onLogoClick}>
            <ShiftLogo className="h-10 w-10 text-slate-900" />
            <h1 className="text-3xl font-bold font-brand text-slate-900">ShiftChange</h1>
         </div>
         <p className="text-slate-500 font-medium">Select your architecting method below.</p>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Hub Tabs */}
        <div className="flex border-b border-slate-100">
          <TabButton label="Generate New Profile" isActive={activeHubTab === 'generate'} onClick={() => setActiveHubTab('generate')} />
          <TabButton label="Upgrade Existing Resume" isActive={activeHubTab === 'improve'} onClick={() => setActiveHubTab('improve')} />
        </div>
        
        <div className="p-8 lg:p-12 min-h-[400px]">
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

            {activeHubTab === 'generate' && (
            <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
                
                {/* Level Selection Grid - The Anti-Competitor "Secret Sauce" Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <LevelCard 
                        title="Student / New Grad" 
                        subtitle="Potential Protocol"
                        isSelected={selectedLevel === 'new_grad'}
                        onClick={() => selectLevel('new_grad')}
                    />
                    <LevelCard 
                        title="Bedside / Clinical" 
                        subtitle="High-Acuity Protocol"
                        isSelected={selectedLevel === 'experienced'}
                        onClick={() => selectLevel('experienced')}
                    />
                    <LevelCard 
                        title="Leadership / Admin" 
                        subtitle="Leadership ROI Protocol"
                        isSelected={selectedLevel === 'leadership'}
                        onClick={() => selectLevel('leadership')}
                    />
                </div>

                {selectedLevel ? (
                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900 text-sm animate-fade-in">
                        <strong>Engine Status:</strong> {getLevelDescription(selectedLevel)}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 text-sm">Select your career stage above to initialize the correct AI protocols.</p>
                )}

                <div className={`transition-all duration-300 ${!selectedLevel ? 'opacity-50 pointer-events-none blur-sm' : 'opacity-100'}`}>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Clinical Brain Dump</label>
                    <textarea
                        className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 transition h-40 text-base resize-none"
                        placeholder="Describe your experience..."
                        value={generatePrompt}
                        onChange={(e) => setGeneratePrompt(e.target.value)}
                        disabled={isLoading || !selectedLevel}
                    />
                </div>
                <ActionButton 
                    onClick={handleGenerate} 
                    isLoading={isLoading} 
                    text={isLoading ? "Running Logic Protocols..." : "Architect My Resume"} 
                    disabled={!selectedLevel || !generatePrompt.trim() || isLoading}
                />
            </div>
            )}

            {activeHubTab === 'improve' && (
            <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
                <p className="text-slate-600 text-center">Upload your current resume. We will strip the formatting and re-engineer the content.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={triggerFileInput}
                        disabled={isLoading}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-slate-900 hover:bg-slate-50 transition-all group"
                    >
                        <UploadIcon className="h-8 w-8 text-slate-400 group-hover:text-slate-900 mb-2" />
                        <span className="font-semibold text-slate-600 group-hover:text-slate-900">Upload File</span>
                        <span className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT</span>
                    </button>
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                    />
                    <div className="flex flex-col justify-center">
                         <label className="block text-sm font-bold text-slate-700 mb-2">Or Paste Text</label>
                         <textarea
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 transition h-32 resize-none text-sm"
                            placeholder="Paste resume content..."
                            value={improveText}
                            onChange={(e) => setImproveText(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <ActionButton onClick={handleImprove} isLoading={isLoading} text="Re-Engineer Resume" disabled={isLoading} />
            </div>
            )}
            
             <div className="text-center mt-10 pt-6 border-t border-slate-50">
                <button onClick={onManualEdit} disabled={isLoading} className="text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors">
                    Skip AI & Start with Blank Template
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const ShiftLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M14.6 2.2c-.6-.4-1.4-.2-1.8.4l-4 6c-.3.5-.3 1.1 0 1.6l4 6c.4.6 1.2.8 1.8.4.6-.4.8-1.2.4-1.8L11.8 10l3.2-4.8c.4-.6.2-1.4-.4-1.8z" opacity="0.5"/>
        <path d="M9.4 21.8c.6.4 1.4.2 1.8-.4l4-6c.3-.5.3-1.1 0-1.6l-4-6c-.4-.6-1.2-.8-1.8-.4-.6.4-.8 1.2-.4 1.8l3.2 4.8-3.2 4.8c-.4.6-.2 1.4.4 1.8z"/>
    </svg>
)

const PricingFeature: React.FC<{ text: string }> = ({ text }) => (
    <li className="flex items-start gap-3">
        <CheckIcon className="h-5 w-5 text-slate-900 flex-shrink-0 mt-0.5" />
        <span className="text-slate-700">{text}</span>
    </li>
);

const ComparisonRow: React.FC<{ label: string, text: string, isGood?: boolean, isBad?: boolean }> = ({ label, text, isGood, isBad }) => (
    <div className={`p-4 rounded-lg border ${isGood ? 'bg-slate-700/30 border-slate-600/50' : 'bg-red-900/20 border-red-800/30'}`}>
        <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isGood ? 'text-slate-300' : 'text-red-400'}`}>{label}</span>
            {isGood && <ShieldCheckIcon className="h-4 w-4 text-slate-300"/>}
        </div>
        <p className={`${isGood ? 'text-white font-medium' : 'text-slate-400'}`}>{text}</p>
    </div>
)

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-900 mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
)

const PricingCard: React.FC<{ title: string, price: number, desc: string, features: string[], action: () => void, isPopular?: boolean, isDark?: boolean }> = ({ title, price, desc, features, action, isPopular, isDark }) => (
    <div className={`relative p-8 rounded-2xl flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200'} ${isPopular ? 'ring-2 ring-slate-900 shadow-xl' : ''}`}>
        {isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</div>}
        <div className="mb-6">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
        </div>
        <div className="mb-8">
            <span className="text-4xl font-extrabold">${price}</span>
        </div>
        <ul className="space-y-4 mb-8 flex-1">
            {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckIcon className={`h-5 w-5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`} />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                </li>
            ))}
        </ul>
        <button onClick={action} className={`w-full py-3 rounded-lg font-bold transition-colors ${isDark ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
            Select Plan
        </button>
    </div>
)

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex-1 py-5 text-sm font-bold transition-all
        ${isActive ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50/50' : 'text-slate-500 hover:text-slate-800'}`}>
        {label}
    </button>
);

const LevelCard: React.FC<{ title: string; subtitle: string; isSelected: boolean; onClick: () => void; }> = ({ title, subtitle, isSelected, onClick }) => (
    <button 
        onClick={onClick}
        className={`p-4 rounded-xl border-2 text-left transition-all duration-300 flex flex-col justify-between h-24
        ${isSelected 
            ? 'border-slate-900 bg-slate-50 shadow-md transform scale-[1.02]' 
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
        }`}
    >
        <div className="flex justify-between items-start w-full">
            <span className={`font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{title}</span>
            {isSelected && <CheckCircleIcon className="w-5 h-5 text-slate-900" />}
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wide ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>{subtitle}</span>
    </button>
);

const ActionButton: React.FC<{onClick: ()=>void | Promise<void>, isLoading: boolean, text: string, disabled?: boolean}> = ({onClick, isLoading, text, disabled}) => (
    <button
        onClick={() => { onClick(); }}
        disabled={isLoading || disabled}
        className="w-full py-4 bg-slate-900 hover:bg-slate-900 text-white text-lg font-bold rounded-xl shadow-lg shadow-slate-900/10 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
    >
        {isLoading && <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
        {text}
    </button>
);

const ErrorMessage: React.FC<{ message: string; onDismiss: () => void; }> = ({ message, onDismiss }) => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative my-4 flex justify-between items-center">
        <div>
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{message}</span>
        </div>
        <button onClick={onDismiss} className="text-red-500 font-bold">&times;</button>
    </div>
);

// Icons
const ShieldCheckIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const ChartIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>;
const CpuIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
const CheckIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const UploadIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const CheckCircleIcon = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;

export default WelcomeScreen;
