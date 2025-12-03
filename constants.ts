
import { ResumeData } from './types';

export const initialResumeData: ResumeData = {
  personalDetails: {
    fullName: "Sarah Jenkins, CCRN",
    jobTitle: "Critical Care Registered Nurse",
    email: "sarah.jenkins@email.com",
    phone: "(555) 123-4567",
    location: "Chicago, IL",
    linkedin: "linkedin.com/in/sarahjenkinsrn",
  },
  summary: "High-acuity Critical Care Nurse with 6 years of experience in Level I Trauma Centers. Expert in managing complex patient loads including CRRT, Impella, and IABP devices. Proven track record of reducing CLABSI rates by 40% through protocol leadership. Seeking to leverage clinical expertise and leadership potential in a CVICU role.",
  experience: [
    {
      id: "exp1",
      jobTitle: "Senior ICU Nurse (CVICU)",
      company: "Northwestern Memorial Hospital",
      location: "Chicago, IL",
      startDate: "Jun 2020",
      endDate: "Present",
      responsibilities: [
        "Manage high-acuity post-op open heart patients (CABG, Valve replacements) with 1:1 ratios.",
        "Titrate multiple vasoactive drips (Levophed, Vasopressin, Epinephrine) to maintain hemodynamic stability.",
        "Operate advanced life support devices including IABP, Impella 5.5, and CRRT machines independently.",
        "Serve as Relief Charge Nurse for 24-bed unit, managing patient flow and staffing for 12 RNs.",
      ],
    },
     {
      id: "exp2",
      jobTitle: "ICU Registered Nurse",
      company: "Rush University Medical Center",
      location: "Chicago, IL",
      startDate: "May 2018",
      endDate: "May 2020",
      responsibilities: [
        "Provided comprehensive care in a mixed Medical/Surgical ICU handling septic shock and ARDS patients.",
        "Participated in daily multidisciplinary rounds to advocate for patient weaning protocols.",
        "Precepted 4 new graduate nurses, ensuring 100% retention over their first year.",
      ],
    },
  ],
  education: [
    {
      id: "edu1",
      degree: "Bachelor of Science in Nursing (BSN)",
      institution: "Loyola University Chicago",
      location: "Chicago, IL",
      graduationDate: "May 2018",
    },
  ],
  skills: [
    "Advanced Cardiac Life Support (ACLS)",
    "Critical Care Registered Nurse (CCRN)",
    "Continuous Renal Replacement Therapy (CRRT)",
    "Intra-Aortic Balloon Pump (IABP)",
    "Impella Device Management",
    "Hemodynamic Monitoring",
    "Post-Anesthesia Care",
    "Trauma Informed Care",
  ],
  softSkills: [
    "Crisis Management",
    "Multidisciplinary Collaboration",
    "Clinical Leadership",
    "Preceptorship & Mentoring",
    "Critical Thinking",
    "Patient Advocacy",
  ],
  certifications: [
    { id: 'cert1', value: "Critical Care Registered Nurse (CCRN)" },
    { id: 'cert2', value: "Advanced Cardiac Life Support (ACLS)" },
    { id: 'cert3', value: "Basic Life Support (BLS)" },
    { id: 'cert4', value: "Trauma Nursing Core Course (TNCC)" },
  ],
  awards: [
      { id: 'award1', value: "Daisy Award Honoree (2022)" }
  ],
  advancedClinicalDetails: {
    unitAndScope: "24-bed CVICU, Level I Trauma. High acuity (1:1 or 1:2).",
    clinicalActions: "Manage fresh post-op hearts, ECMO, Impella, CRRT. Titrate 5+ drips.",
    outcomesAndQuality: "Reduced unit CLABSI rate by 40% in 2023 via new sterile dressing protocol.",
    crisisManagement: "Rapid Response Team member. Lead compressor in Codes.",
    nonManagerialLeadership: "Relief Charge Nurse. Unit Council Chair.",
    travelSpecifics: "",
  },
  coverLetterDetails: {
      recipientName: "",
      recipientTitle: "Hiring Manager",
      companyName: "",
      tone: "professional",
      specificPoints: ""
  }
};