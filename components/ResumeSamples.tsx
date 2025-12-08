
import React, { useState } from 'react';

interface ResumeSamplesProps {
  onClose: () => void;
}

const ResumeSamples: React.FC<ResumeSamplesProps> = ({ onClose }) => {
  const [selectedSample, setSelectedSample] = useState<'icu' | 'newgrad' | 'np'>('icu');

  const samples = {
    icu: {
      title: "ICU/Critical Care RN",
      level: "Experienced Bedside",
      personalDetails: {
        name: "Sarah Jenkins, CCRN",
        title: "Critical Care Registered Nurse",
        location: "Chicago, IL"
      },
      summary: "High-acuity Critical Care Nurse with 6 years of experience in Level I Trauma Centers. Expert in managing complex patient loads including CRRT, Impella, and IABP devices. Proven track record of reducing CLABSI rates by 40% through protocol leadership.",
      experience: [
        {
          title: "Senior ICU Nurse (CVICU)",
          company: "Northwestern Memorial Hospital",
          location: "Chicago, IL",
          period: "Jun 2020 - Present",
          bullets: [
            "Manage high-acuity post-op open heart patients (CABG, Valve replacements) with 1:1 ratios",
            "Titrate multiple vasoactive drips (Levophed, Vasopressin, Epinephrine) to maintain hemodynamic stability",
            "Operate advanced life support devices including IABP, Impella 5.5, and CRRT machines independently",
            "Serve as Relief Charge Nurse for 24-bed unit, managing patient flow and staffing for 12 RNs"
          ]
        }
      ],
      skills: ["CRRT", "IABP", "Impella Device Management", "Hemodynamic Monitoring", "ACLS", "CCRN"]
    },
    newgrad: {
      title: "New Graduate RN",
      level: "Entry Level",
      personalDetails: {
        name: "Emily Rodriguez, BSN, RN",
        title: "Registered Nurse - New Graduate",
        location: "Los Angeles, CA"
      },
      summary: "Compassionate New Graduate Registered Nurse with 720+ clinical hours across Medical-Surgical, ICU, and Emergency settings. Strong foundation in evidence-based practice with proven ability to deliver safe, patient-centered care. Seeking a residency program to develop expertise in acute care nursing.",
      experience: [
        {
          title: "Student Nurse - Medical-Surgical Capstone",
          company: "UCLA Medical Center",
          location: "Los Angeles, CA",
          period: "Jan 2024 - May 2024",
          bullets: [
            "Provided comprehensive care for 4-6 patients managing post-surgical recovery, diabetes management, and wound care",
            "Administered medications via multiple routes (IV, PO, IM, SQ) with 100% accuracy under RN supervision",
            "Collaborated with interdisciplinary team during daily rounds to advocate for patient discharge planning",
            "Performed head-to-toe assessments and documented findings in Epic EMR system"
          ]
        }
      ],
      skills: ["Epic EMR", "IV Therapy", "Medication Administration", "Patient Education", "BLS", "ACLS"]
    },
    np: {
      title: "Nurse Practitioner",
      level: "Advanced Practice",
      personalDetails: {
        name: "Michael Chen, DNP, FNP-C",
        title: "Family Nurse Practitioner",
        location: "Seattle, WA"
      },
      summary: "Board-Certified Family Nurse Practitioner with 8 years of clinical experience managing diverse patient populations across primary care and urgent care settings. Expertise in chronic disease management, preventive care, and patient education. Proven ability to improve health outcomes while reducing hospital readmissions by 35%.",
      experience: [
        {
          title: "Lead Family Nurse Practitioner",
          company: "MultiCare Health System",
          location: "Seattle, WA",
          period: "Mar 2021 - Present",
          bullets: [
            "Manage panel of 1,200+ patients with chronic conditions (HTN, DM, COPD, CHF) achieving 95% quality metrics compliance",
            "Reduced 30-day hospital readmissions by 35% through comprehensive transitional care program implementation",
            "Precept 6 FNP students annually, maintaining 100% first-time AANP certification pass rate",
            "Lead clinical quality improvement initiatives resulting in $2.4M cost savings through evidence-based protocols"
          ]
        }
      ],
      skills: ["Chronic Disease Management", "Patient Assessment", "Pharmacology", "EHR Systems", "Quality Improvement", "FNP-C"]
    }
  };

  const currentSample = samples[selectedSample];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Professional Resume Samples</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-indigo-100 text-sm">
            See the quality and format of ShiftChange professional resumes
          </p>
        </div>

        {/* Sample Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setSelectedSample('icu')}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
              selectedSample === 'icu'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ICU/Critical Care
          </button>
          <button
            onClick={() => setSelectedSample('newgrad')}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
              selectedSample === 'newgrad'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            New Graduate
          </button>
          <button
            onClick={() => setSelectedSample('np')}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
              selectedSample === 'np'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Nurse Practitioner
          </button>
        </div>

        {/* Resume Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-240px)]">
          {/* Badge */}
          <div className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
            {currentSample.level}
          </div>

          {/* Personal Details */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900">{currentSample.personalDetails.name}</h3>
            <p className="text-lg text-slate-600 mb-1">{currentSample.personalDetails.title}</p>
            <p className="text-sm text-slate-500">{currentSample.personalDetails.location}</p>
          </div>

          {/* Professional Summary */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="w-8 h-0.5 bg-indigo-600"></div>
              Professional Summary
            </h4>
            <p className="text-slate-700 leading-relaxed">{currentSample.summary}</p>
          </div>

          {/* Experience */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-8 h-0.5 bg-indigo-600"></div>
              Professional Experience
            </h4>
            {currentSample.experience.map((exp, idx) => (
              <div key={idx} className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-bold text-slate-900">{exp.title}</h5>
                    <p className="text-slate-600">{exp.company} • {exp.location}</p>
                  </div>
                  <span className="text-sm text-slate-500 font-medium">{exp.period}</span>
                </div>
                <ul className="space-y-2 mt-3">
                  {exp.bullets.map((bullet, bidx) => (
                    <li key={bidx} className="flex gap-3">
                      <span className="text-indigo-600 font-bold flex-shrink-0">•</span>
                      <span className="text-slate-700">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="w-8 h-0.5 bg-indigo-600"></div>
              Core Competencies
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentSample.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Ready to create your professional resume?</p>
              <p className="text-sm text-slate-600">Get started with AI-powered resume building</p>
            </div>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeSamples;
