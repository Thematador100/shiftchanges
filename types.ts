
export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export interface Education {
  id:string;
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
}

export interface AdvancedClinicalDetails {
  unitAndScope: string;
  clinicalActions: string;
  outcomesAndQuality: string;
  crisisManagement: string;
  nonManagerialLeadership: string;
  travelSpecifics: string;
}

export interface ListEntry {
  id: string;
  value: string;
}

export interface CoverLetterDetails {
    recipientName?: string;
    recipientTitle?: string;
    companyName?: string;
    specificPoints?: string;
    tone?: 'professional' | 'passionate' | 'assertive';
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  softSkills: string[];
  certifications: ListEntry[];
  awards: ListEntry[];
  advancedClinicalDetails?: AdvancedClinicalDetails;
  coverLetterDetails?: CoverLetterDetails;
}

export interface BulletPointImprovement {
  original: string;
  improved: string;
  explanation: string;
}

export interface CritiqueResponse {
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  bulletPointImprovements: BulletPointImprovement[];
}

export interface MatchScoreResponse {
  score: number;
  probability: 'Low' | 'Medium' | 'High';
  missingKeywords: string[];
  criticalGaps: string[];
  reasoning: string;
}

export type PackageTier = 'none' | 'fast-ai' | 'ai-target' | 'expert-clinical' | 'leadership-np';

export type CareerLevel = 'new_grad' | 'experienced' | 'leadership';

// Declare global window.env for runtime injection
declare global {
  interface Window {
    env: {
      API_KEY?: string;
      VITE_API_KEY?: string;
      VITE_STRIPE_PUBLISHABLE_KEY?: string;
      VITE_ADMIN_PASSWORD?: string;
    }
  }
}
