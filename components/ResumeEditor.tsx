
import React, { useState, useRef } from 'react';
import { ResumeData, WorkExperience, Education, ListEntry } from '../types';

interface ResumeEditorProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onOptimizeSkills?: () => void;
  isOptimizing?: boolean;
  isPaidUser?: boolean;
}

// Suggestion lists for dropdowns
const SKILL_SUGGESTIONS = [
  'Patient Assessment', 'IV Insertion', 'Medication Administration', 'Wound Care',
  'EPIC EHR', 'Cerner', 'Meditech', 'Critical Thinking', 'Patient Empathy',
  'CRRT', 'Impella', 'IABP', 'ECMO', 'Ventilator Management', 'Telemetry Monitoring',
  'Phlebotomy', 'Catheter Insertion', 'Tracheostomy Care', 'Chest Tube Management'
];

const CERTIFICATION_SUGGESTIONS = [
  'BLS (Basic Life Support)', 'ACLS (Advanced Cardiovascular Life Support)',
  'PALS (Pediatric Advanced Life Support)', 'NRP (Neonatal Resuscitation Program)',
  'CCRN (Critical Care Registered Nurse)', 'CEN (Certified Emergency Nurse)',
  'PCCN (Progressive Care Certified Nurse)', 'CMC (Cardiac Medicine Certification)',
  'CNOR (Certified Nurse Operating Room)', 'RNC-OB (Inpatient Obstetric Nursing)',
  'CMSRN (Medical-Surgical Registered Nurse)', 'OCN (Oncology Certified Nurse)'
];

const AWARD_SUGGESTIONS = [
  'Daisy Award for Extraordinary Nurses', 'Employee of the Month',
  'Excellence in Patient Care Award', 'Nurse of the Year',
  'Outstanding Clinical Achievement', 'Patient Safety Champion',
  'Magnet Recognition', 'Clinical Excellence Award'
];

const ResumeEditor: React.FC<ResumeEditorProps> = ({ resumeData, setResumeData, onOptimizeSkills, isOptimizing, isPaidUser }) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateInput = (section: string, field: string, value: string, index?: number) => {
    let error = '';
    const key = index !== undefined ? `${section}.${index}.${field}` : `${section}.${field}`;
    const trimmedValue = value.trim();

    if (section === 'personalDetails') {
        if (field === 'fullName') {
            if (!trimmedValue) error = 'Full Name is required.';
            else if (trimmedValue.length < 2) error = 'Name must be at least 2 characters.';
        }
        if (field === 'jobTitle' && !trimmedValue) error = 'Target Job Title is required.';
        if (field === 'email') {
            if (!trimmedValue) error = 'Email is required.';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) error = 'Please enter a valid email address.';
        }
        if (field === 'phone' && trimmedValue) {
             if (!/^[\d\+\-\(\)\s]{7,}$/.test(trimmedValue)) error = 'Please enter a valid phone number.';
        }
        if (field === 'location' && !trimmedValue) error = 'Location (City, State) is required.';
        if (field === 'linkedin' && trimmedValue) {
            if (!trimmedValue.toLowerCase().includes('linkedin.com')) error = 'Please enter a valid LinkedIn profile URL.';
        }
    }
    
    if (section === 'experience') {
        if (field === 'jobTitle' && !trimmedValue) error = 'Job Title is required.';
        if (field === 'company' && !trimmedValue) error = 'Hospital/Company name is required.';
        if (field === 'location' && !trimmedValue) error = 'Location is required.';
        if (field === 'startDate' && !trimmedValue) error = 'Start Date is required.';
    }

    if (section === 'education') {
        if (field === 'degree' && !trimmedValue) error = 'Degree is required.';
        if (field === 'institution' && !trimmedValue) error = 'Institution is required.';
        if (field === 'graduationDate' && !trimmedValue) error = 'Graduation Date is required.';
    }

    setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (error) newErrors[key] = error;
        else delete newErrors[key];
        return newErrors;
    });
  };

  const handlePersonalDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, [name]: value },
    }));
    validateInput('personalDetails', name, value);
  };
  
  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeData(prev => ({ ...prev, summary: e.target.value }));
  };
  
  const handleExperienceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const list = [...resumeData.experience];
    (list[index] as any)[name] = value;
    setResumeData(prev => ({ ...prev, experience: list }));
    validateInput('experience', name, value, index);
  };

  const handleResponsibilityChange = (expIndex: number, respIndex: number, value: string) => {
    const list = [...resumeData.experience];
    list[expIndex].responsibilities[respIndex] = value;
    setResumeData(prev => ({ ...prev, experience: list }));
  };
  
  const addResponsibility = (expIndex: number) => {
    const list = [...resumeData.experience];
    list[expIndex].responsibilities.push("");
    setResumeData(prev => ({ ...prev, experience: list }));
  };

  const removeResponsibility = (expIndex: number, respIndex: number) => {
    const list = [...resumeData.experience];
    list[expIndex].responsibilities.splice(respIndex, 1);
    setResumeData(prev => ({ ...prev, experience: list }));
  };


  const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const list = [...resumeData.education];
    (list[index] as any)[name] = value;
    setResumeData(prev => ({ ...prev, education: list }));
    validateInput('education', name, value, index);
  };
  
  const handleSimpleListChange = (fieldName: 'skills' | 'softSkills', index: number, value: string) => {
      const list = [...resumeData[fieldName]];
      list[index] = value;
      setResumeData(prev => ({...prev, [fieldName]: list}));
  };
  
  const handleSimpleListReorder = (fieldName: 'skills' | 'softSkills', newItems: string[]) => {
      setResumeData(prev => ({...prev, [fieldName]: newItems}));
  };
  
  const addSimpleListItem = (fieldName: 'skills' | 'softSkills') => {
      setResumeData(prev => ({...prev, [fieldName]: [...prev[fieldName], ""]}));
  }

  const removeSimpleListItem = (fieldName: 'skills' | 'softSkills', index: number) => {
      const list = [...resumeData[fieldName]];
      list.splice(index, 1);
      setResumeData(prev => ({...prev, [fieldName]: list}));
  }

  const handleListEntryChange = (fieldName: 'certifications' | 'awards', index: number, value: string) => {
    const list = [...resumeData[fieldName]];
    list[index].value = value;
    setResumeData(prev => ({ ...prev, [fieldName]: list }));
  };

  const addListEntry = (fieldName: 'certifications' | 'awards') => {
    setResumeData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], { id: Date.now().toString(), value: "" }]
    }));
  };

  const removeListEntry = (fieldName: 'certifications' | 'awards', index: number) => {
    const list = [...resumeData[fieldName]];
    list.splice(index, 1);
    setResumeData(prev => ({ ...prev, [fieldName]: list }));
  };

  const addExperience = () => {
      setResumeData(prev => ({
          ...prev,
          experience: [...prev.experience, { id: Date.now().toString(), jobTitle: "", company: "", location: "", startDate: "", endDate: "", responsibilities: [""]}]
      }))
  }

  const removeExperience = (index: number) => {
      const list = [...resumeData.experience];
      list.splice(index, 1);
      setResumeData(prev => ({...prev, experience: list}));
      
      // Clean up errors for deleted item
      setValidationErrors(prev => {
        const next = {...prev};
        Object.keys(next).forEach(key => {
            if(key.startsWith(`experience.${index}.`)) delete next[key];
        });
        return next;
      });
  }

  const addEducation = () => {
    setResumeData(prev => ({
        ...prev,
        education: [...prev.education, { id: Date.now().toString(), degree: "", institution: "", location: "", graduationDate: ""}]
    }))
  }

  const removeEducation = (index: number) => {
    const list = [...resumeData.education];
    list.splice(index, 1);
    setResumeData(prev => ({...prev, education: list}));
    
    // Clean up errors for deleted item
    setValidationErrors(prev => {
        const next = {...prev};
        Object.keys(next).forEach(key => {
            if(key.startsWith(`education.${index}.`)) delete next[key];
        });
        return next;
    });
  }

  const handleAdvancedDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      advancedClinicalDetails: { 
          ...(prev.advancedClinicalDetails || {
            unitAndScope: "",
            clinicalActions: "",
            outcomesAndQuality: "",
            crisisManagement: "",
            nonManagerialLeadership: "",
            travelSpecifics: "",
          }), 
          [name]: value 
      },
    }));
  };

  const handleCoverLetterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setResumeData(prev => ({
          ...prev,
          coverLetterDetails: {
              ...(prev.coverLetterDetails || {}),
              [name]: value
          }
      }));
  };

  // Button for ATS Optimization
  const AtsButton = () => (
      <button 
        onClick={onOptimizeSkills} 
        disabled={isOptimizing}
        className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all
            ${isOptimizing ? 'bg-slate-100 text-slate-400' : 
                (isPaidUser 
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
            }
        `}
      >
          {isOptimizing ? (
              <>
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Analyzing...
              </>
          ) : isPaidUser ? (
              <>
                <BoltIcon /> Auto-Populate ATS Keywords
              </>
          ) : (
              <>
                 <LockIcon /> Unlock ATS Keywords
              </>
          )}
      </button>
  );

  return (
    <div className="space-y-10">
      <Section title="Personal Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input 
                label="Full Name" 
                name="fullName" 
                value={resumeData.personalDetails.fullName} 
                onChange={handlePersonalDetailsChange} 
                error={validationErrors['personalDetails.fullName']}
              />
              <Input 
                label="Job Title" 
                name="jobTitle" 
                value={resumeData.personalDetails.jobTitle} 
                onChange={handlePersonalDetailsChange} 
                error={validationErrors['personalDetails.jobTitle']}
              />
              <Input 
                label="Email" 
                name="email" 
                type="email" 
                value={resumeData.personalDetails.email} 
                onChange={handlePersonalDetailsChange} 
                error={validationErrors['personalDetails.email']}
              />
              <Input 
                label="Phone" 
                name="phone" 
                type="tel" 
                value={resumeData.personalDetails.phone} 
                onChange={handlePersonalDetailsChange} 
                error={validationErrors['personalDetails.phone']}
              />
              <Input 
                label="Location" 
                name="location" 
                value={resumeData.personalDetails.location} 
                onChange={handlePersonalDetailsChange} 
                error={validationErrors['personalDetails.location']}
              />
              <Input 
                label="LinkedIn" 
                name="linkedin" 
                value={resumeData.personalDetails.linkedin} 
                onChange={handlePersonalDetailsChange} 
                error={validationErrors['personalDetails.linkedin']}
              />
          </div>
      </Section>

      <Section title="Professional Summary">
        <Textarea name="summary" value={resumeData.summary} onChange={handleSummaryChange} rows={5} />
      </Section>
      
      <Section title="Work Experience">
          {resumeData.experience.map((exp, index) => (
              <div key={exp.id} className="p-5 border rounded-lg space-y-5 mb-6 relative bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input 
                        label="Job Title" 
                        name="jobTitle" 
                        value={exp.jobTitle} 
                        onChange={(e) => handleExperienceChange(index, e)} 
                        error={validationErrors[`experience.${index}.jobTitle`]}
                      />
                      <Input 
                        label="Company" 
                        name="company" 
                        value={exp.company} 
                        onChange={(e) => handleExperienceChange(index, e)} 
                        error={validationErrors[`experience.${index}.company`]}
                      />
                      <Input 
                        label="Location" 
                        name="location" 
                        value={exp.location} 
                        onChange={(e) => handleExperienceChange(index, e)} 
                        error={validationErrors[`experience.${index}.location`]}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                            label="Start Date" 
                            name="startDate" 
                            value={exp.startDate} 
                            onChange={(e) => handleExperienceChange(index, e)} 
                            error={validationErrors[`experience.${index}.startDate`]}
                        />
                        <Input label="End Date" name="endDate" value={exp.endDate} onChange={(e) => handleExperienceChange(index, e)} />
                      </div>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-slate-600 mb-2">Responsibilities</label>
                    <div className="space-y-3">
                      {exp.responsibilities.map((resp, respIndex) => (
                        <div key={respIndex} className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={resp}
                            onChange={(e) => handleResponsibilityChange(index, respIndex, e.target.value)}
                            className="w-full text-base px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="e.g. Provided comprehensive care..."
                          />
                          <button onClick={() => removeResponsibility(index, respIndex)} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addResponsibility(index)} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                        <PlusIcon /> Add Responsibility
                      </button>
                    </div>
                  </div>
                   <div className="flex items-start gap-3 text-base text-blue-800 bg-blue-50 p-3 rounded-md border border-blue-200 mt-3">
                        <InfoIcon />
                        <span>
                            <strong className="font-semibold">Tip:</strong> Use numbers to show impact (e.g., "Managed a 15-bed ICU," "Reduced medication errors by 20%," or "Trained 5 new nurses.").
                        </span>
                    </div>
                  <button onClick={() => removeExperience(index)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors">
                      <TrashIcon />
                  </button>
              </div>
          ))}
          <button onClick={addExperience} className="flex items-center gap-2 text-base font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              <PlusIcon /> Add Experience
          </button>
      </Section>

      <Section title="Education">
          {resumeData.education.map((edu, index) => (
              <div key={edu.id} className="p-5 border rounded-lg space-y-5 mb-6 relative bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input 
                        label="Degree / Program" 
                        name="degree" 
                        value={edu.degree} 
                        onChange={(e) => handleEducationChange(index, e)} 
                        error={validationErrors[`education.${index}.degree`]}
                    />
                    <Input 
                        label="Institution" 
                        name="institution" 
                        value={edu.institution} 
                        onChange={(e) => handleEducationChange(index, e)} 
                        error={validationErrors[`education.${index}.institution`]}
                    />
                    <Input 
                        label="Location" 
                        name="location" 
                        value={edu.location} 
                        onChange={(e) => handleEducationChange(index, e)} 
                        error={validationErrors[`education.${index}.location`]}
                    />
                    <Input 
                        label="Graduation Date" 
                        name="graduationDate" 
                        value={edu.graduationDate} 
                        onChange={(e) => handleEducationChange(index, e)} 
                        error={validationErrors[`education.${index}.graduationDate`]}
                    />
                  </div>
                  <button onClick={() => removeEducation(index)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors">
                      <TrashIcon />
                  </button>
              </div>
          ))}
          <button onClick={addEducation} className="flex items-center gap-2 text-base font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              <PlusIcon /> Add Education
          </button>
      </Section>
      
       <Section title="Advanced Clinical Details">
        <div className="flex items-start gap-3 text-base text-blue-800 bg-blue-50 p-3 rounded-md border border-blue-200 mb-6">
            <InfoIcon />
            <div className="text-sm">
                <strong className="font-semibold block text-blue-900 mb-1">Clinical Intelligence Engine:</strong> 
                This section is the most critical part for experienced nurses. The AI uses these details to calculate 'Clinical Match Scores' and quantify your impact. Be specific (e.g., 'Impella 5.5', 'Level I Trauma', 'Charge Nurse for 20 beds').
            </div>
        </div>
        <div className="space-y-6">
            <Textarea 
                label="Unit & Scope" 
                name="unitAndScope" 
                placeholder="e.g. 24-bed CVICU, Level I Trauma, Academic Medical Center. Patient Ratios: 1:1 for open hearts, 1:2 standard." 
                value={resumeData.advancedClinicalDetails?.unitAndScope || ''} 
                onChange={handleAdvancedDetailsChange} 
                rows={4} 
            />
            <Textarea 
                label="Clinical Actions & Therapies" 
                name="clinicalActions" 
                placeholder="e.g. CRRT, Impella 5.5, IABP, ECMO specialist. Titration of vasoactive drips (Levo, Vaso, Epi). Conscious Sedation."
                value={resumeData.advancedClinicalDetails?.clinicalActions || ''} 
                onChange={handleAdvancedDetailsChange} 
                rows={4} 
            />
            <Textarea 
                label="Outcomes & Quality Wins" 
                name="outcomesAndQuality" 
                placeholder="e.g. Reduced CLABSI by 40% via new dressing protocol. Improved door-to-needle time for stroke patients by 10 mins."
                value={resumeData.advancedClinicalDetails?.outcomesAndQuality || ''} 
                onChange={handleAdvancedDetailsChange} 
                rows={4} 
            />
            <Textarea 
                label="Code & Crisis Management" 
                name="crisisManagement" 
                placeholder="e.g. Rapid Response Team Lead. Primary Code Blue compressor. Managed surge staffing during COVID-19."
                value={resumeData.advancedClinicalDetails?.crisisManagement || ''} 
                onChange={handleAdvancedDetailsChange} 
                rows={4} 
            />
            <Textarea 
                label="Teaching & Non-Managerial Leadership" 
                name="nonManagerialLeadership" 
                placeholder="e.g. Relief Charge Nurse (2 shifts/week). Preceptor for 4 new grads. Chair of Unit Practice Council."
                value={resumeData.advancedClinicalDetails?.nonManagerialLeadership || ''} 
                onChange={handleAdvancedDetailsChange} 
                rows={4} 
            />
            <Textarea 
                label="Travel Specifics (if relevant)" 
                name="travelSpecifics" 
                placeholder="e.g. Completed 4 contracts at Level I centers. Requested extension at 3 sites. Rapid EMR proficiency (Epic, Cerner)."
                value={resumeData.advancedClinicalDetails?.travelSpecifics || ''} 
                onChange={handleAdvancedDetailsChange} 
                rows={4} 
            />
        </div>
    </Section>

      <Section title="Technical Skills" action={onOptimizeSkills ? <AtsButton /> : undefined}>
          <SimpleListEditor 
            items={resumeData.skills} 
            onChange={(index, value) => handleSimpleListChange('skills', index, value)}
            onReorder={(newItems) => handleSimpleListReorder('skills', newItems)}
            onAdd={() => addSimpleListItem('skills')}
            onRemove={(index) => removeSimpleListItem('skills', index)}
            placeholder="e.g. EPIC EHR"
            suggestions={SKILL_SUGGESTIONS}
          />
      </Section>
      
      <Section title="Soft Skills" action={onOptimizeSkills ? <AtsButton /> : undefined}>
          <SimpleListEditor
            items={resumeData.softSkills}
            onChange={(index, value) => handleSimpleListChange('softSkills', index, value)}
            onReorder={(newItems) => handleSimpleListReorder('softSkills', newItems)}
            onAdd={() => addSimpleListItem('softSkills')}
            onRemove={(index) => removeSimpleListItem('softSkills', index)}
            placeholder="e.g. Patient Empathy"
            suggestions={SKILL_SUGGESTIONS}
          />
      </Section>

      {/* ATS Keyword Preview for Free Users */}
      {!isPaidUser && (
        <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200/20 rounded-full -ml-12 -mb-12"></div>

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-bold text-slate-900">ATS Keyword Preview</h3>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                UPGRADE TO UNLOCK
              </span>
            </div>

            <p className="text-sm text-slate-700 mb-4">
              Our AI identifies high-impact keywords that hiring managers and ATS systems look for. Here's a preview of what we can add to your resume:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {['Evidence-Based Practice', 'Clinical Outcomes', 'Patient Advocacy', 'Quality Metrics', 'Interdisciplinary Collaboration'].map((keyword, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white/70 backdrop-blur-sm rounded-lg border border-indigo-100 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-700">{keyword}</span>
                </div>
              ))}
              <div className="flex items-center justify-center gap-2 p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border-2 border-dashed border-purple-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-bold text-purple-700">+25 More</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 mb-1">Why ATS Keywords Matter</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Over <strong>75% of resumes</strong> are filtered by Applicant Tracking Systems before reaching human eyes.
                  Our AI scans job descriptions and industry trends to identify the keywords that get you past these filters
                  and into interviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Section title="Certifications">
          <ListEntryEditor
            items={resumeData.certifications}
            onChange={(index, value) => handleListEntryChange('certifications', index, value)}
            onAdd={() => addListEntry('certifications')}
            onRemove={(index) => removeListEntry('certifications', index)}
            placeholder="e.g. Critical Care Registered Nurse (CCRN)"
            addLabel="Add Certification"
            suggestions={CERTIFICATION_SUGGESTIONS}
          />
      </Section>

      <Section title="Awards and Recognition">
          <ListEntryEditor
            items={resumeData.awards}
            onChange={(index, value) => handleListEntryChange('awards', index, value)}
            onAdd={() => addListEntry('awards')}
            onRemove={(index) => removeListEntry('awards', index)}
            placeholder="e.g. Daisy Award for Extraordinary Nurses"
            addLabel="Add Award"
            suggestions={AWARD_SUGGESTIONS}
          />
      </Section>
      
      <Section title="Cover Letter Preferences">
          <div className="p-5 border rounded-lg bg-indigo-50/30 border-indigo-100 mb-4">
              <p className="text-sm text-indigo-700 mb-4">
                  These details inform the <strong>Cover Letter Generator</strong> in the sidebar. Set your defaults here.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <Input
                    label="Hiring Manager Name (Optional)"
                    name="recipientName"
                    value={resumeData.coverLetterDetails?.recipientName || ''}
                    onChange={handleCoverLetterChange}
                    placeholder="e.g. Ms. Patricia Smith"
                  />
                   <Input
                    label="Hiring Manager Title"
                    name="recipientTitle"
                    value={resumeData.coverLetterDetails?.recipientTitle || ''}
                    onChange={handleCoverLetterChange}
                    placeholder="e.g. Nursing Director"
                  />
                  <Input
                    label="Target Company/Hospital"
                    name="companyName"
                    value={resumeData.coverLetterDetails?.companyName || ''}
                    onChange={handleCoverLetterChange}
                    placeholder="e.g. Johns Hopkins Hospital"
                  />
                   <div>
                       <label className="block text-base font-medium text-slate-600 mb-1.5">Letter Tone</label>
                       <select 
                            name="tone" 
                            value={resumeData.coverLetterDetails?.tone || 'professional'} 
                            onChange={handleCoverLetterChange}
                            className="w-full text-base px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                           <option value="professional">Professional & Balanced</option>
                           <option value="passionate">Passionate & Mission-Driven</option>
                           <option value="assertive">Assertive & Confidence-Forward</option>
                       </select>
                   </div>
              </div>
              <Textarea
                label="Specific Points to Mention"
                name="specificPoints"
                value={resumeData.coverLetterDetails?.specificPoints || ''}
                onChange={handleCoverLetterChange}
                rows={3}
                placeholder="e.g. Mention my relocation to Seattle in August, or my desire to switch from Med-Surg to ICU."
              />
          </div>
      </Section>
    </div>
  );
};

// --- Reusable List Editor Components ---
interface SimpleListEditorProps {
    items: string[];
    onChange: (index: number, value: string) => void;
    onReorder: (newItems: string[]) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
    placeholder: string;
    suggestions?: string[];
}

const SimpleListEditor: React.FC<SimpleListEditorProps> = ({ items, onChange, onReorder, onAdd, onRemove, placeholder, suggestions }) => {
    const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = 'move';
        // Add a class for styling the drag source if needed, e.g. opacity
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-50');
        const start = dragItem.current;
        const end = dragOverItem.current;

        if (start !== null && end !== null && start !== end) {
             const newItems = [...items];
             const itemToMove = newItems[start];
             newItems.splice(start, 1);
             newItems.splice(end, 0, itemToMove);
             onReorder(newItems);
        }
        
        dragItem.current = null;
        dragOverItem.current = null;
    };

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div 
                    key={index} 
                    className="flex items-center gap-2 group transition-all"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <div className="cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing p-2 rounded hover:bg-slate-100 transition-colors" title="Drag to reorder">
                        <GripVerticalIcon />
                    </div>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={item}
                            onChange={(e) => onChange(index, e.target.value)}
                            onFocus={() => setShowSuggestions(index)}
                            onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                            list={suggestions ? `suggestions-${index}` : undefined}
                            className="w-full text-base px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        {suggestions && (
                            <datalist id={`suggestions-${index}`}>
                                {suggestions.map((suggestion, i) => (
                                    <option key={i} value={suggestion} />
                                ))}
                            </datalist>
                        )}
                    </div>
                    <button onClick={() => onRemove(index)} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <TrashIcon />
                    </button>
                </div>
            ))}
            <button onClick={onAdd} className="flex items-center gap-2 text-base font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                <PlusIcon /> Add Skill
            </button>
        </div>
    );
};

interface ListEntryEditorProps {
    items: ListEntry[];
    onChange: (index: number, value: string) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
    placeholder: string;
    addLabel: string;
    suggestions?: string[];
}
const ListEntryEditor: React.FC<ListEntryEditorProps> = ({ items, onChange, onAdd, onRemove, placeholder, addLabel, suggestions }) => (
    <div className="space-y-3">
        {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={item.value}
                        onChange={(e) => onChange(index, e.target.value)}
                        list={suggestions ? `list-suggestions-${index}` : undefined}
                        className="w-full text-base px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    {suggestions && (
                        <datalist id={`list-suggestions-${index}`}>
                            {suggestions.map((suggestion, i) => (
                                <option key={i} value={suggestion} />
                            ))}
                        </datalist>
                    )}
                </div>
                <button onClick={() => onRemove(index)} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                    <TrashIcon />
                </button>
            </div>
        ))}
        <button onClick={onAdd} className="flex items-center gap-2 text-base font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            <PlusIcon /> {addLabel}
        </button>
    </div>
);


// Helper Components
const Section: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
    <div>
      <div className="flex justify-between items-center mb-5">
         <h3 className="text-xl font-semibold text-slate-600">{title}</h3>
         {action}
      </div>
      {children}
    </div>
);
  
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}
  
const Input: React.FC<InputProps> = ({ label, error, ...props }) => (
    <div>
      <label className="block text-base font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        {...props}
        className={`w-full text-base px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition ${
            error 
            ? 'border-red-300 ring-red-200 focus:border-red-500 focus:ring-red-200' 
            : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}
  
const Textarea: React.FC<TextareaProps> = ({ label, error, ...props }) => (
    <div>
        {label && <label className="block text-base font-medium text-slate-600 mb-1.5">{label}</label>}
      <textarea
        {...props}
        className={`w-full text-base px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition ${
            error 
            ? 'border-red-300 ring-red-200 focus:border-red-500 focus:ring-red-200' 
            : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
      />
       {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

const GripVerticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" />
    </svg>
);

export default ResumeEditor;
