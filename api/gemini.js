import OpenAI from 'openai';
// import { GoogleGenerativeAI } from "@google/generative-ai"; // Removed to prevent silent crash
import { verifyAuthToken } from '../services/authService.js';
import { checkUserAccess } from '../services/dbService.js';

const DEEPSEEK_KEY = (process.env.DEEPSEEK_API_KEY || '').trim();
const GOOGLE_KEY = (process.env.API_KEY || process.env.GEMINI_API_KEY || '').trim();

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
    const { action, payload, authToken } = req.body;
    
    // --- PAYWALL ENFORCEMENT ---
    // Certain actions require a valid auth token (i.e., a paid subscription)
    const paidActions = ['generate', 'improve', 'tailor', 'coverLetter', 'optimizeSkills'];
    
    if (paidActions.includes(action)) {
      // User must provide a valid auth token
      if (!authToken) {
        return res.status(401).json({ message: 'Authentication required. Please purchase a plan to use this feature.' });
      }
      
      // Verify the token
      const decoded = verifyAuthToken(authToken);
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired authentication token.' });
      }
      
      // Double-check in the database
      const dbRecord = await checkUserAccess(decoded.email);
      if (!dbRecord || !dbRecord.access_granted) {
        return res.status(403).json({ message: 'Access has been revoked. Please contact support.' });
      }
    }
    
    if (action === 'ping' || action === 'critique' || action === 'matchScore') {
      // These actions are free (demo/preview features)
      if (action === 'ping') {
        return res.json({ status: 'ok' });
      }
      // For critique and matchScore, continue to process below
    }

    // Use DeepSeek as the primary AI provider
    const apiKey = DEEPSEEK_KEY || GOOGLE_KEY;
    const modelName = DEEPSEEK_KEY ? "deepseek-chat" : "gemini-1.5-flash";
    const baseURL = DEEPSEEK_KEY ? "https://api.deepseek.com/v1" : "https://generativelanguage.googleapis.com/v1beta/openai/";

    if (!apiKey && action !== 'ping') {
      // Return a 400 error instead of 500 to prevent Vercel from masking the error
      return res.status(400).json({ message: 'Server configuration error: AI API key missing. Please set DEEPSEEK_API_KEY or API_KEY in your Vercel environment variables.' });
    }
    
    if (action === 'ping') {
      return res.json({ status: 'ok' });
    }

    // Initialize the AI client
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    const systemInstruction = getSystemInstruction(payload?.level);
    const messages = [{ role: "system", content: systemInstruction }];
    
    let result;

    switch (action) {
      case 'generate': {
        messages.push({ role: "user", content: payload.prompt });
        const response = await client.chat.completions.create({
          model: modelName,
          messages: messages,
          response_format: { type: "json_object" },
        });
        const cleanedText = cleanJson(response.choices[0].message.content);
        result = ensureResumeDataStructure(JSON.parse(cleanedText));
        break;
      }
      
      case 'improve': {
        const prompt = `Based on the following resume text, improve and restructure it into JSON format. Enhance the language to be more impactful. Resume:\n\n${payload.resumeText}`;
        messages.push({ role: "user", content: prompt });
        const response = await client.chat.completions.create({
          model: modelName,
          messages: messages,
          response_format: { type: "json_object" },
        });
        const cleanedText = cleanJson(response.choices[0].message.content);
        result = ensureResumeDataStructure(JSON.parse(cleanedText));
        break;
      }

      case 'tailor': {
        const prompt = `Tailor the following resume to this job description. Return the tailored resume in JSON format.\n\nResume: ${formatResumeAsText(payload.resumeData)}\n\nJob: ${payload.jobDescription}`;
        messages.push({ role: "user", content: prompt });
        const response = await client.chat.completions.create({
          model: modelName,
          messages: messages,
          response_format: { type: "json_object" },
        });
        const cleanedText = cleanJson(response.choices[0].message.content);
        result = ensureResumeDataStructure(JSON.parse(cleanedText));
        break;
      }

      case 'critique': {
        // Free action - no auth required
        const prompt = `Act as a nursing career coach and critique this resume. Return JSON with: overallFeedback (string), strengths (array), areasForImprovement (array), bulletPointImprovements (array of objects with original, improved, explanation)).\n\n${formatResumeAsText(payload.resumeData)}`;
        const messages_critique = [{ role: "system", content: "You are an expert nursing career coach and resume critic. Return ONLY the requested JSON structure." }];
        messages_critique.push({ role: "user", content: prompt });
        const response = await client.chat.completions.create({
          model: modelName,
          messages: messages_critique,
          response_format: { type: "json_object" },
        });
        result = JSON.parse(cleanJson(response.choices[0].message.content));
        break;
      }

      case 'matchScore': {
        // Free action - no auth required
        const prompt = `Compare this resume against the job description. Return JSON with: score (0-100), probability (Low/Medium/High), missingKeywords (array), criticalGaps (array), reasoning (string).\n\nResume: ${formatResumeAsText(payload.resumeData)}\n\nJob: ${payload.jobDescription}`;
        const messages_match = [{ role: "system", content: "You are an expert ATS system simulator. Return ONLY the requested JSON structure." }];
        messages_match.push({ role: "user", content: prompt });
        const response = await client.chat.completions.create({
          model: modelName,
          messages: messages_match,
          response_format: { type: "json_object" },
        });
        result = JSON.parse(cleanJson(response.choices[0].message.content));
        break;
      }

      case 'coverLetter': {
        const details = payload.resumeData.coverLetterDetails || {};
        const prompt = `Write a compelling cover letter for a Nurse.\n\nJob: ${payload.jobDescription}\n\nResume: ${formatResumeAsText(payload.resumeData)}\n\nRecipient: ${details.recipientName || 'Hiring Manager'}\nCompany: ${details.companyName || 'the Organization'}\n\nKeep it under 400 words. Return only the letter body.`;
        const messages_cover = [{ role: "system", content: "You are an expert cover letter writer. Return ONLY the letter body as plain text." }];
        messages_cover.push({ role: "user", content: prompt });
        const response = await client.chat.completions.create({
          model: modelName,
          messages: messages_cover,
        });
        result = { text: response.choices[0].message.content || "" };
        break;
      }

      case 'optimizeSkills': {
        const currentSkills = [...payload.resumeData.skills, ...payload.resumeData.softSkills].join(', ');
        const prompt = `Identify 5-8 missing high-impact nursing skills for ${payload.level === 'new_grad' ? 'New Graduate RN' : payload.level === 'leadership' ? 'Nurse Manager' : 'Experienced Nurse'}. Current skills: ${currentSkills}. Return JSON with: newSkills (array), newSoftSkills (array).`;
        const messages_optimize = [{ role: "system", content: "You are an expert ATS keyword optimizer. Return ONLY the requested JSON structure." }];
        messages_optimize.push({ role: "user", content: prompt });
        const response = await client.chat.completions.create({
          model: modelName,
          messages: messages_optimize,
          response_format: { type: "json_object" },
        });
        result = JSON.parse(cleanJson(response.choices[0].message.content));
        break;
      }

      default:
        return res.status(400).json({ message: 'Invalid action. Please check your request.' });
    }

    return res.json(result);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ message: 'An error occurred while processing your request. Please try again.' });
  }
}
