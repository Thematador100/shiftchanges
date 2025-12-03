import { GoogleGenerativeAI } from "@google/generative-ai";

// Primary: GEMINI_API_KEY, Fallback: API_KEY for backwards compatibility
const GOOGLE_KEY = (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();

function cleanJson(text) {
  if (!text) return "{}";
  let cleaned = text.trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '');
  }
  return cleaned;
}

function ensureResumeDataStructure(data) {
  const transformList = (list, prefix) => {
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
    experience: Array.isArray(data?.experience) ? data.experience.map((exp, i) => ({
      id: exp.id || `exp-${Date.now()}-${i}`,
      jobTitle: exp.jobTitle || "",
      company: exp.company || "",
      location: exp.location || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : []
    })) : [],
    education: Array.isArray(data?.education) ? data.education.map((edu, i) => ({
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

function formatResumeAsText(resumeData) {
  let text = `
# ${resumeData.personalDetails.fullName} | ${resumeData.personalDetails.jobTitle}
${resumeData.personalDetails.email} | ${resumeData.personalDetails.phone} | ${resumeData.personalDetails.location} | ${resumeData.personalDetails.linkedin}

## Professional Summary
${resumeData.summary}

## Work Experience
${resumeData.experience.map(exp => `
### ${exp.jobTitle} at ${exp.company}, ${exp.location} (${exp.startDate} - ${exp.endDate})
${exp.responsibilities.map(r => `- ${r}`).join('\n')}
`).join('\n')}

## Education
${resumeData.education.map(edu => `
### ${edu.degree}, ${edu.institution}, ${edu.location} (${edu.graduationDate})
`).join('\n')}

## Skills
${resumeData.skills.join(', ')}

## Soft Skills
${resumeData.softSkills.join(', ')}

## Certifications
- ${resumeData.certifications.map(c => c.value).join('\n- ')}
  `;

  if (resumeData.awards && resumeData.awards.length > 0) {
    text += `\n## Awards and Recognition\n- ${resumeData.awards.map(a => a.value).join('\n- ')}\n`;
  }

  if (resumeData.advancedClinicalDetails) {
    const { unitAndScope, clinicalActions, outcomesAndQuality, crisisManagement, nonManagerialLeadership, travelSpecifics } = resumeData.advancedClinicalDetails;
    let advancedText = '';
    if (unitAndScope) advancedText += `\n### Unit & Scope\n${unitAndScope}`;
    if (clinicalActions) advancedText += `\n### Clinical Actions & Therapies\n${clinicalActions}`;
    if (outcomesAndQuality) advancedText += `\n### Outcomes & Quality Wins\n${outcomesAndQuality}`;
    if (crisisManagement) advancedText += `\n### Code & Crisis Management\n${crisisManagement}`;
    if (nonManagerialLeadership) advancedText += `\n### Teaching & Non-Managerial Leadership\n${nonManagerialLeadership}`;
    if (travelSpecifics) advancedText += `\n### Travel Specifics\n${travelSpecifics}`;
    
    if (advancedText.trim()) {
      text += `\n## Advanced Clinical Details\n${advancedText.trim()}`;
    }
  }

  return text;
}

const getSystemInstruction = (level) => {
  let specificInstruction = "";
  
  if (level === 'new_grad') {
    specificInstruction = `
    **MODE: NEW GRADUATE / RESIDENCY CANDIDATE**
    - Primary Focus: Potential, Safety, Trainability, Academic Excellence.
    - Rules:
        1. Treat "Clinical Rotations" as "Professional Experience". Format: Job Title = "Student Nurse - [Unit] Rotation".
        2. EMPHASIZE the "Capstone" or "Senior Practicum" placement.
        3. Highlight "Total Clinical Hours" if available.
        4. Focus on specific skills performed.
        5. Soft Skills: Focus on "Patient Safety", "Effective Communication", "Eagerness to Learn".
    `;
  } else if (level === 'leadership') {
    specificInstruction = `
    **MODE: NURSE LEADER (Charge, Manager, Director)**
    - Primary Focus: Fiscal Responsibility, Staff Retention, Quality Metrics.
    - Rules:
        1. Minimize task-based clinical bullets.
        2. MAXIMIZE: Budget managed ($), FTEs supervised, Retention %, HCAHPS scores.
    `;
  } else {
    specificInstruction = `
    **MODE: CLINICAL EXPERT / BEDSIDE**
    - Primary Focus: Acuity, Autonomy, Outcomes.
    - Rules:
        1. Focus on **Acuity** (patient ratios, unit types), **Interventions**, and **Outcomes**.
        2. Use dynamic action verbs.
    `;
  }

  return `You are an expert resume writer specializing in nursing. Your goal is to create a metric-driven resume in JSON format.

    ${specificInstruction}

    **General Rules:**
    - Be specific and clinical.
    - Quantify wherever possible.
    - Return ONLY the requested JSON structure.
    `;
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, payload } = req.body;
    
    if (action === 'ping') {
      return res.json({ status: 'ok' });
    }

    if (!GOOGLE_KEY) {
      return res.status(500).json({ message: 'Server configuration error: API key missing.' });
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let result;

    switch (action) {
      case 'generate': {
        const chat = model.startChat({
          systemInstruction: getSystemInstruction(payload.level),
          generationConfig: { responseMimeType: "application/json" }
        });
        const response = await chat.sendMessage(payload.prompt);
        const cleanedText = cleanJson(response.response.text());
        result = ensureResumeDataStructure(JSON.parse(cleanedText));
        break;
      }
      
      case 'improve': {
        const prompt = `Based on the following resume text, improve and restructure it into JSON format. Enhance the language to be more impactful. Resume:\n\n${payload.resumeText}`;
        const chat = model.startChat({
          systemInstruction: getSystemInstruction(),
          generationConfig: { responseMimeType: "application/json" }
        });
        const response = await chat.sendMessage(prompt);
        const cleanedText = cleanJson(response.response.text());
        result = ensureResumeDataStructure(JSON.parse(cleanedText));
        break;
      }

      case 'tailor': {
        const prompt = `Tailor the following resume to this job description.\n\nResume: ${formatResumeAsText(payload.resumeData)}\n\nJob: ${payload.jobDescription}`;
        const chat = model.startChat({
          systemInstruction: getSystemInstruction(),
          generationConfig: { responseMimeType: "application/json" }
        });
        const response = await chat.sendMessage(prompt);
        const cleanedText = cleanJson(response.response.text());
        result = ensureResumeDataStructure(JSON.parse(cleanedText));
        break;
      }

      case 'critique': {
        const prompt = `Act as a nursing career coach and critique this resume. Return JSON with: overallFeedback (string), strengths (array), areasForImprovement (array), bulletPointImprovements (array of objects with original, improved, explanation).\n\n${formatResumeAsText(payload.resumeData)}`;
        const chat = model.startChat({
          generationConfig: { responseMimeType: "application/json" }
        });
        const response = await chat.sendMessage(prompt);
        result = JSON.parse(cleanJson(response.response.text()));
        break;
      }

      case 'matchScore': {
        const prompt = `Compare this resume against the job description. Return JSON with: score (0-100), probability (Low/Medium/High), missingKeywords (array), criticalGaps (array), reasoning (string).\n\nResume: ${formatResumeAsText(payload.resumeData)}\n\nJob: ${payload.jobDescription}`;
        const chat = model.startChat({
          generationConfig: { responseMimeType: "application/json" }
        });
        const response = await chat.sendMessage(prompt);
        result = JSON.parse(cleanJson(response.response.text()));
        break;
      }

      case 'coverLetter': {
        const details = payload.resumeData.coverLetterDetails || {};
        const prompt = `Write a compelling cover letter for a Nurse.\n\nJob: ${payload.jobDescription}\n\nResume: ${formatResumeAsText(payload.resumeData)}\n\nRecipient: ${details.recipientName || 'Hiring Manager'}\nCompany: ${details.companyName || 'the Organization'}\n\nKeep it under 400 words. Return only the letter body.`;
        const response = await model.generateContent(prompt);
        result = { text: response.response.text() || "" };
        break;
      }

      case 'optimizeSkills': {
        const currentSkills = [...payload.resumeData.skills, ...payload.resumeData.softSkills].join(', ');
        const prompt = `Identify 5-8 missing high-impact nursing skills for ${payload.level === 'new_grad' ? 'New Graduate RN' : payload.level === 'leadership' ? 'Nurse Manager' : 'Experienced Nurse'}. Current skills: ${currentSkills}. Return JSON with: newSkills (array), newSoftSkills (array).`;
        const chat = model.startChat({
          generationConfig: { responseMimeType: "application/json" }
        });
        const response = await chat.sendMessage(prompt);
        result = JSON.parse(cleanJson(response.response.text()));
        break;
      }

      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    return res.json(result);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
