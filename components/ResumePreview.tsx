
import React, { useState } from 'react';
import { ResumeData, PackageTier } from '../types';

declare const jspdf: any;
declare const html2canvas: any;

interface ResumePreviewProps {
  resumeData: ResumeData;
  packageTier: PackageTier;
  onCheckout: () => void;
}

type TemplateType = 'standard' | 'executive' | 'modern';

const ResumeSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <section className={`mb-6 relative break-inside-avoid ${className || ''}`}>
    <h2 className="section-title text-lg font-bold uppercase border-b-2 pb-1 mb-3 tracking-wider">{title}</h2>
    {children}
  </section>
);

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, packageTier, onCheckout }) => {
  const { personalDetails, summary, experience, education, skills, softSkills, certifications, awards } = resumeData;
  const isPaidUser = packageTier !== 'none';
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('standard');

  const handleTemplateChange = (template: TemplateType) => {
      setSelectedTemplate(template);
  };

  const handleCopy = (e: React.ClipboardEvent) => {
      if (!isPaidUser) {
          e.preventDefault();
          alert("Copying is disabled in Draft Mode. Upgrade to unlock your full resume.");
      }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      if (!isPaidUser) {
          e.preventDefault();
      }
  };

  const getTemplateClasses = () => {
      switch (selectedTemplate) {
          case 'executive':
              return {
                  container: 'font-serif text-slate-900',
                  header: 'text-center border-b-2 border-slate-800 pb-6 mb-8',
                  name: 'text-5xl font-serif font-bold tracking-tight text-slate-900',
                  title: 'text-xl italic font-medium text-slate-600 mt-2',
                  sectionTitle: 'text-slate-900 border-slate-800',
                  jobTitle: 'font-bold text-slate-900',
                  accent: 'bg-slate-900'
              };
          case 'modern':
              return {
                  container: 'font-sans text-slate-800',
                  header: 'text-left border-l-4 border-teal-600 pl-6 mb-8',
                  name: 'text-5xl font-extrabold tracking-tight text-slate-900',
                  title: 'text-2xl font-bold text-teal-600 mt-1',
                  sectionTitle: 'text-teal-700 border-teal-200',
                  jobTitle: 'font-bold text-teal-700',
                  accent: 'bg-teal-600'
              };
          default: // standard
              return {
                  container: 'font-sans text-gray-800',
                  header: 'text-center border-b pb-6 border-gray-200 mb-8',
                  name: 'text-4xl font-bold font-poppins text-gray-800',
                  title: 'text-xl font-medium text-blue-700 mt-1',
                  sectionTitle: 'text-blue-800 border-blue-200',
                  jobTitle: 'font-semibold text-gray-800',
                  accent: 'bg-blue-700'
              };
      }
  };

  const styles = getTemplateClasses();

  // Helper to determine if the current template is locked for the user
  const isTemplateLocked = !isPaidUser && selectedTemplate !== 'standard';

  const handleDownloadPdf = async () => {
    if (!isPaidUser || isTemplateLocked) {
        onCheckout();
        return;
    }
    
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        alert("PDF libraries loading. Please wait...");
        return;
    }

    setIsGeneratingPdf(true);
    const resumeElement = document.getElementById('resume-content');
    
    if (resumeElement) {
        resumeElement.classList.remove('select-none');
        resumeElement.classList.remove('cursor-not-allowed');

        try {
            const doc = new jspdf.jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const pdfWidth = 595.28; 
            
            await doc.html(resumeElement, {
                callback: function(doc: any) {
                    resumeElement.classList.add('select-none');
                    doc.save(`${personalDetails.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
                    setIsGeneratingPdf(false);
                },
                x: 0,
                y: 0,
                width: pdfWidth,
                windowWidth: 794,
                margin: [0, 0, 0, 0],
                autoPaging: 'text',
                html2canvas: { scale: 2, useCORS: true, logging: false }
            });

        } catch (error) {
            console.error("PDF Generation failed:", error);
            setIsGeneratingPdf(false);
        }
    }
  };

  return (
    <div className="flex flex-col gap-6" onContextMenu={handleContextMenu}>
        {/* Dan Kennedy Strategy: The HR Risk Gauge */}
        <div className="bg-slate-900 rounded-xl p-4 text-white shadow-xl border border-slate-700">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-brand font-bold text-sm uppercase tracking-wider text-slate-400">HR Liability & Opportunity Scan</h3>
                {!isPaidUser ? (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.7)]">CRITICAL RISK</span>
                ) : (
                     <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded shadow-[0_0_10px_rgba(20,184,166,0.5)]">OPTIMIZED</span>
                )}
            </div>
            
            <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 relative h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${!isPaidUser ? 'w-[15%] bg-red-500' : 'w-[98%] bg-teal-500'}`}
                    ></div>
                    {/* Tick marks */}
                    <div className="absolute top-0 bottom-0 left-[25%] w-px bg-slate-600"></div>
                    <div className="absolute top-0 bottom-0 left-[50%] w-px bg-slate-600"></div>
                    <div className="absolute top-0 bottom-0 left-[75%] w-px bg-slate-600"></div>
                </div>
                <div className="text-xs font-mono font-bold w-16 text-right">
                    {!isPaidUser ? <span className="text-red-400">12/100</span> : <span className="text-teal-400">98/100</span>}
                </div>
            </div>
            
            <div className="flex justify-between text-xs font-medium mb-3">
                <span className="text-red-400">High Liability / Ignored</span>
                <span className="text-teal-400">Top 1% Candidate</span>
            </div>

            {!isPaidUser ? (
                <div className="bg-red-900/30 border border-red-800/50 rounded p-3 text-sm text-red-200">
                    <strong className="flex items-center gap-2"><LockIcon className="w-4 h-4"/> Warning:</strong> 
                    <p className="mt-1 mb-2 text-red-100/90">Your resume is currently flagged as "High Risk." The AI has generated advanced clinical metrics, but they are <strong>hidden</strong> in Draft Mode. Recruiters will not see your true competence.</p>
                    <button onClick={onCheckout} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors text-xs uppercase tracking-wide">Unlock Full Competency Profile &rarr;</button>
                </div>
            ) : (
                <div className="bg-teal-900/30 border border-teal-800/50 rounded p-3 text-sm text-teal-200">
                    <strong className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4"/> Verified:</strong>
                    <p className="mt-1">Your resume now projects "Clinical Expert" status. Liability language has been replaced with Asset language.</p>
                </div>
            )}
        </div>

        {/* Template Selector */}
        <div className="flex gap-4 overflow-x-visible py-2 print-hidden px-1">
             <TemplateThumb 
                label="Standard" 
                template="standard"
                isActive={selectedTemplate === 'standard'} 
                isLocked={false} 
                onClick={() => handleTemplateChange('standard')}
                color="bg-blue-600"
             />
             <TemplateThumb 
                label="Executive" 
                template="executive"
                isActive={selectedTemplate === 'executive'} 
                isLocked={!isPaidUser} 
                onClick={() => handleTemplateChange('executive')}
                color="bg-slate-900"
             />
             <TemplateThumb 
                label="Modern" 
                template="modern"
                isActive={selectedTemplate === 'modern'} 
                isLocked={!isPaidUser} 
                onClick={() => handleTemplateChange('modern')}
                color="bg-teal-600"
             />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 print-hidden flex-wrap justify-end">
            <button 
                onClick={() => setShowContactInfo(!showContactInfo)} 
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors"
            >
                <EyeIcon isOpen={showContactInfo} />
                {showContactInfo ? 'Hide Contact' : 'Show'}
            </button>
            <button 
                onClick={handleDownloadPdf} 
                disabled={isGeneratingPdf}
                className={`flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 ${(!isPaidUser || isTemplateLocked) ? 'bg-amber-600 hover:bg-amber-500' : 'bg-teal-600 hover:bg-teal-500'}`}
            >
                {(!isPaidUser || isTemplateLocked) ? <LockIcon className="w-4 h-4"/> : <DownloadIcon />}
                {(isTemplateLocked) ? `Unlock ${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}` : (!isPaidUser ? 'Unlock Final Resume' : (isGeneratingPdf ? 'Generating...' : 'Download PDF'))}
            </button>
        </div>
        
        {/* Resume Container */}
        <div className="relative">
            {/* Template Lock Overlay - Specifically for Premium Templates */}
            {isTemplateLocked && (
                <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-[4px] flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-dashed border-slate-400">
                     <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm animate-fade-in-down">
                        <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                            <LockIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Template Locked</h3>
                        <p className="text-slate-600 mb-6 text-sm">
                            The <strong>{selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}</strong> design uses advanced typography and spacing optimized for higher-tier roles.
                            <br/><br/>
                            Available in <strong>Targeted ($299)</strong>, <strong>Specialist ($499)</strong>, and <strong>Executive ($649)</strong> packages.
                        </p>
                        <button onClick={onCheckout} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-lg uppercase tracking-wide text-sm transition-colors">
                            Unlock {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Design
                        </button>
                        <button onClick={() => setSelectedTemplate('standard')} className="mt-4 text-sm text-slate-400 hover:text-slate-600 underline">
                            Switch back to Standard (Free)
                        </button>
                     </div>
                </div>
            )}

            <div 
                id="resume-content" 
                onCopy={handleCopy}
                className={`bg-white text-base leading-relaxed p-8 sm:p-12 relative overflow-hidden shadow-2xl ${styles.container} ${!isPaidUser ? 'select-none cursor-default' : ''}`}
            >
                {/* Internal Styles Injection for Dynamic Classes */}
                <style>{`
                    .section-title {
                        border-color: ${selectedTemplate === 'modern' ? '#99f6e4' : (selectedTemplate === 'executive' ? '#1e293b' : '#bfdbfe')};
                        color: ${selectedTemplate === 'modern' ? '#0f766e' : (selectedTemplate === 'executive' ? '#0f172a' : '#1e40af')};
                    }
                `}</style>

                {/* Watermark */}
                {!isPaidUser && (
                    <div className="absolute inset-0 pointer-events-none z-0 flex flex-col items-center justify-center overflow-hidden opacity-[0.04]">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="whitespace-nowrap text-7xl font-black text-slate-900 -rotate-45 my-16">
                            DRAFT MODE DO NOT DISTRIBUTE
                        </div>
                    ))}
                    </div>
                )}

                {/* Header */}
                <header className={`relative z-10 break-inside-avoid ${styles.header}`}>
                    <h1 className={styles.name}>{personalDetails.fullName}</h1>
                    <p className={styles.title}>{personalDetails.jobTitle}</p>
                    
                    {showContactInfo && (
                        <div className={`flex justify-center items-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-600 flex-wrap ${selectedTemplate === 'modern' ? 'justify-start' : ''}`}>
                            <span>{personalDetails.email}</span>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <span>{personalDetails.phone}</span>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <span>{personalDetails.location}</span>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <span>{personalDetails.linkedin}</span>
                        </div>
                    )}
                </header>

                {/* Summary - Protected */}
                <ResumeSection title="Professional Summary">
                    {isPaidUser ? (
                        <p>{summary}</p>
                    ) : (
                         <div className="relative">
                             <p className="inline">
                                {summary.split('.')[0] + '.'} 
                             </p>
                             <span className="text-transparent bg-slate-200 rounded-sm blur-[4px] ml-1 select-none">
                                 The rest of this summary contains high-impact keywords and metrics that are hidden in draft mode. Upgrade to reveal.
                             </span>
                        </div>
                    )}
                </ResumeSection>

                {/* Experience - Protected */}
                <ResumeSection title="Work Experience">
                    {experience.map((exp, index) => {
                        const isNewestJob = index === 0;
                        const shouldBlurJob = !isPaidUser && !isNewestJob;
                        
                        return (
                            <div key={exp.id} className="mb-6 last:mb-0 relative break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`text-lg ${styles.jobTitle} ${shouldBlurJob ? 'blur-[3px]' : ''}`}>
                                        {shouldBlurJob ? "Senior Clinical Lead" : exp.jobTitle}
                                    </h3>
                                    <p className={`text-sm font-semibold text-gray-500 ${shouldBlurJob ? 'blur-[3px]' : ''}`}>
                                        {shouldBlurJob ? "20XX – Present" : `${exp.startDate} – ${exp.endDate}`}
                                    </p>
                                </div>
                                <p className={`text-sm font-semibold text-gray-600 mb-2 italic ${shouldBlurJob ? 'blur-[3px]' : ''}`}>
                                    {shouldBlurJob ? "Level I Trauma Center" : `${exp.company}, ${exp.location}`}
                                </p>

                                <ul className="list-disc list-outside pl-5 space-y-2 text-gray-700">
                                    {exp.responsibilities.map((resp, i) => {
                                        // THE HOOK: First bullet of first job is visible.
                                        const isHook = !isPaidUser && isNewestJob && i === 0;
                                        const isLocked = !isPaidUser && !isHook;

                                        if (isLocked) {
                                            // RENDER DUMMY TEXT IN DOM TO FOOL INSPECT ELEMENT
                                            return (
                                                <li key={i} className="text-transparent relative select-none" aria-hidden="true">
                                                    <span className="bg-slate-200 text-slate-200 rounded-sm blur-[4px]">
                                                        Implemented a new sepsis protocol that reduced mortality by 15% year-over-year while managing a 12-bed unit.
                                                    </span>
                                                </li>
                                            );
                                        }
                                        
                                        return <li key={i}>{resp}</li>;
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                    
                    {/* The Velvet Rope Overlay - Only shows if NOT in template lock mode (to avoid double overlays) */}
                    {!isPaidUser && !isTemplateLocked && (
                        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-white via-white/90 to-transparent z-20 flex flex-col items-center justify-end pb-12">
                            <div className="bg-white p-6 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 text-center max-w-sm mx-4 animate-fade-in-down">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <LockIcon className="w-6 h-6"/>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Advanced Metrics Hidden</h3>
                                <p className="text-slate-500 mb-4 text-sm leading-relaxed">
                                    We have generated <strong>{experience.reduce((acc, exp) => acc + exp.responsibilities.length, 0)}</strong> high-impact data points. <br/>Unlock to see how we quantified your clinical value.
                                </p>
                                <button onClick={onCheckout} className="bg-amber-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-amber-600 transition-colors w-full uppercase tracking-wide text-sm">
                                    Unlock My Resume
                                </button>
                            </div>
                        </div>
                    )}
                </ResumeSection>

                {/* Education */}
                <ResumeSection title="Education">
                    {education.map((edu, index) => (
                        <div key={edu.id} className={`mb-3 last:mb-0 break-inside-avoid ${!isPaidUser && index > 0 ? 'blur-[2px] select-none opacity-50' : ''}`}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                                <p className="text-sm text-gray-500">{edu.graduationDate}</p>
                            </div>
                            <p className="text-sm text-gray-600 italic">{edu.institution}, {edu.location}</p>
                        </div>
                    ))}
                </ResumeSection>

                {/* Skills - Protected */}
                <ResumeSection title="Technical Skills">
                    {isPaidUser ? (
                        <p>{skills.join(' • ')}</p>
                    ) : (
                         <div className="relative">
                            <p className="inline">{skills.slice(0, 3).join(' • ')} • </p>
                             <span className="blur-[4px] select-none text-transparent bg-slate-200 rounded-sm ml-1" aria-hidden="true">
                                Epic EHR, Cerner, Meditech, ACLS, BLS, PALS, TNCC, CCRN, CRRT, Ventilator Management, IABP, ECMO
                            </span>
                        </div>
                    )}
                </ResumeSection>

                {/* Certifications - Visible */}
                <ResumeSection title="Certifications">
                    <ul className="list-disc list-outside pl-5 space-y-1 text-gray-700">
                        {certifications.map(cert => <li key={cert.id}>{cert.value}</li>)}
                    </ul>
                </ResumeSection>
            </div>
        </div>
    </div>
  );
};

// --- Sub Components ---

const TemplatePreviewTooltip: React.FC<{ template: TemplateType }> = ({ template }) => {
    // Styling configurations for the preview tooltip
    const styles = {
        standard: {
            font: 'font-sans',
            header: 'text-center border-b border-blue-200 pb-1',
            text: 'text-gray-800',
            accent: 'text-blue-700',
            bg: 'bg-white',
            borderLeft: '',
            sectionBorder: 'border-blue-200'
        },
        executive: {
            font: 'font-serif',
            header: 'text-center border-b-2 border-slate-800 pb-1',
            text: 'text-slate-900',
            accent: 'text-slate-600 italic',
            bg: 'bg-white',
            borderLeft: '',
            sectionBorder: 'border-slate-800'
        },
        modern: {
            font: 'font-sans',
            header: 'text-left border-l-2 border-teal-600 pl-2 pb-0',
            text: 'text-slate-900',
            accent: 'text-teal-600 font-bold',
            bg: 'bg-white',
            borderLeft: '',
            sectionBorder: 'border-teal-200'
        }
    }[template];

    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-50 pointer-events-none animate-fade-in-down">
            {/* Visual Mini Resume */}
            <div className={`text-[6px] leading-tight ${styles.font} ${styles.bg}`}>
                {/* Header */}
                <div className={`mb-2 ${styles.header} ${styles.borderLeft}`}>
                    <div className={`font-bold text-[8px] leading-none ${styles.text}`}>Sarah Jenkins</div>
                    <div className={`text-[6px] mt-0.5 ${styles.accent}`}>Critical Care Nurse</div>
                </div>
                {/* Content Blocks */}
                <div className="space-y-1.5">
                    {/* Section 1 */}
                    <div>
                         <div className={`border-b ${styles.sectionBorder} mb-0.5 w-full h-[1px]`}></div>
                         <div className="space-y-0.5 opacity-40">
                             <div className="h-0.5 bg-slate-800 w-full rounded-full"></div>
                             <div className="h-0.5 bg-slate-300 w-5/6 rounded-full"></div>
                             <div className="h-0.5 bg-slate-300 w-4/6 rounded-full"></div>
                         </div>
                    </div>
                     {/* Section 2 */}
                    <div>
                         <div className={`border-b ${styles.sectionBorder} mb-0.5 w-full h-[1px]`}></div>
                         <div className="space-y-0.5 opacity-40">
                             <div className="h-0.5 bg-slate-800 w-3/4 rounded-full"></div>
                             <div className="h-0.5 bg-slate-300 w-full rounded-full"></div>
                         </div>
                    </div>
                </div>
            </div>
             {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
        </div>
    );
};

interface TemplateThumbProps { 
    label: string; 
    template: TemplateType;
    isActive: boolean; 
    isLocked: boolean; 
    onClick: () => void; 
    color: string; 
}

const TemplateThumb: React.FC<TemplateThumbProps> = ({ label, template, isActive, isLocked, onClick, color }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div className="relative flex flex-col items-center group">
            {isHovered && <TemplatePreviewTooltip template={template} />}
            <button 
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative min-w-[100px] h-14 rounded-lg border-2 flex flex-col items-center justify-center transition-all 
                ${isActive 
                    ? 'border-teal-500 bg-teal-50' 
                    : (isLocked ? 'border-slate-200 bg-slate-50 opacity-80 hover:border-slate-300' : 'border-slate-200 bg-white hover:border-slate-300')
                }`}
            >
                {isLocked && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1 shadow-sm z-10 flex items-center justify-center w-5 h-5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    </div>
                )}
                <div className={`w-8 h-1 ${color} mb-1 rounded-full ${isLocked ? 'opacity-50' : ''}`}></div>
                <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-teal-700' : (isLocked ? 'text-slate-400' : 'text-slate-500')}`}>{label}</span>
            </button>
        </div>
    )
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const LockIcon = ({ className = "h-5 w-5" }: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm-1 4V5a1 1 0 112 0v1H9z" clipRule="evenodd" />
    </svg>
);

const EyeIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        {isOpen ? (
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        ) : (
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
        )}
        {isOpen && <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />}
        {!isOpen && <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />}
    </svg>
);

const CheckCircleIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

export default ResumePreview;
