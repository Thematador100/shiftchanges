import { ResumeData, CritiqueResponse, MatchScoreResponse, CareerLevel } from '../types';

// --- Helper: Data Sanitizer (Prevents White Screen Crashes) ---
export function ensureResumeDataStructure(data: any): ResumeData {
    const transformList = (list: any[], prefix: string) => {
        if (!Array.isArray(list)) return [];
        return list.map((item, index) => {
            if (typeof item === 'string') {
                return { id: `${prefix}-${Date.now()}-${index}`, value: item };
            }
            return item || { id: `${prefix}-${Date.now()}-${index}`, value: "" };
        });
    };

    return {
        personalDetails: {
            fullName: data?.personalDetails?.fullName || "Your Name",
            jobTitle: data?.personalDetails?.jobTitle || "Registered Nurse",
            email: data?.personalDetails?.email || "",
            phone: data?.personalDetails?.phone || "",
            location: data?.personalDetails?.location || "",
            linkedin: data?.personalDetails?.linkedin || "",
        },
        summary: data?.summary || "",
        experience: Array.isArray(data?.experience) ? data.experience.map((exp: any, i: number) => ({
            id: exp.id || `exp-${Date.now()}-${i}`,
            jobTitle: exp.jobTitle || "",
            company: exp.company || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : []
        })) : [],
        education: Array.isArray(data?.education) ? data.education.map((edu: any, i: number) => ({
            id: edu.id || `edu-${Date.now()}-${i}`,
            degree: edu.degree || "",
            institution: edu.institution || "",
            location: edu.location || "",
            graduationDate: edu.graduationDate || ""
        })) : [],
        skills: Array.isArray(data?.skills) ? data.skills : [],
        softSkills: Array.isArray(data?.softSkills) ? data.softSkills : [],
        certifications: transformList(data?.certifications, 'cert'),
        awards: transformList(data?.awards, 'award'),
        advancedClinicalDetails: {
            unitAndScope: data?.advancedClinicalDetails?.unitAndScope || "",
            clinicalActions: data?.advancedClinicalDetails?.clinicalActions || "",
            outcomesAndQuality: data?.advancedClinicalDetails?.outcomesAndQuality || "",
            crisisManagement: data?.advancedClinicalDetails?.crisisManagement || "",
            nonManagerialLeadership: data?.advancedClinicalDetails?.nonManagerialLeadership || "",
            travelSpecifics: data?.advancedClinicalDetails?.travelSpecifics || ""
        },
        coverLetterDetails: data?.coverLetterDetails || {}
    };
}

// --- API Client ---
async function callGemini(action: string, payload: any) {
    const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
    });

    if (!res.ok) {
        const text = await res.text();
        try {
            const errorJson = JSON.parse(text);
            throw new Error(errorJson.message || 'Server Error');
        } catch {
            throw new Error(`Connection failed: ${res.status} ${res.statusText}`);
        }
    }

    return res.json();
}

export const generateResumeFromPrompt = async (prompt: string, level: CareerLevel) => {
    const result = await callGemini('generate', { prompt, level });
    return ensureResumeDataStructure(result);
};

export const improveResumeFromText = async (resumeText: string) => {
    const result = await callGemini('improve', { resumeText });
    return ensureResumeDataStructure(result);
};

export const tailorResume = async (resumeData: ResumeData, jobDescription: string) => {
    const result = await callGemini('tailor', { resumeData, jobDescription });
    return ensureResumeDataStructure(result);
};

export const critiqueResume = async (resumeData: ResumeData): Promise<CritiqueResponse> => {
    return callGemini('critique', { resumeData });
};

export const calculateMatchScore = async (resumeData: ResumeData, jobDescription: string): Promise<MatchScoreResponse> => {
    return callGemini('matchScore', { resumeData, jobDescription });
};

export const generateCoverLetter = async (resumeData: ResumeData, jobDescription: string): Promise<string> => {
    const result = await callGemini('coverLetter', { resumeData, jobDescription });
    return result.text;
};

export const optimizeSkills = async (resumeData: ResumeData, level: CareerLevel) => {
    return callGemini('optimizeSkills', { resumeData, level });
};

export const pingServer = async () => {
    return callGemini('ping', {});
};
