import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from 'node-fetch';

const GOOGLE_KEY = (process.env.API_KEY || process.env.GEMINI_API_KEY || '').trim();
const DEEPSEEK_KEY = (process.env.DEEPSEEK_API_KEY || '').trim();

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute per IP

function checkRateLimit(identifier) {
  const now = Date.now();
  const userRecord = rateLimitStore.get(identifier);

  if (!userRecord) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > userRecord.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  userRecord.count++;
  return true;
}

// Input validation helpers
function validateAction(action) {
  const validActions = ['ping', 'generate', 'improve', 'tailor', 'critique', 'matchScore', 'coverLetter', 'optimizeSkills'];
  return validActions.includes(action);
}

function sanitizeString(str, maxLength = 10000) {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLength).trim();
}

// DeepSeek API helper functions
async function callDeepSeek(systemPrompt, userPrompt, useJson = true) {
  if (!DEEPSEEK_KEY) {
    throw new Error('DeepSeek API key not configured');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: useJson ? { type: 'json_object' } : undefined,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

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
  // CORS headers - TODO: Replace '*' with your actual domain in production (e.g., 'https://yoursite.vercel.app')
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const identifier = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  if (!checkRateLimit(identifier)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const { action, payload } = req.body;

    // Input validation
    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: 'Invalid request: action is required' });
    }

    if (!validateAction(action)) {
      return res.status(400).json({ error: 'Invalid action specified' });
    }
    
    if (action === 'ping') {
      return res.json({ status: 'ok' });
    }

    // Check if at least one API key is configured
    if (!GOOGLE_KEY && !DEEPSEEK_KEY) {
      return res.status(500).json({ message: 'Server configuration error: No AI API keys configured.' });
    }

    let result;
    let usedProvider = 'none';

    switch (action) {
      case 'generate': {
        if (!payload?.prompt || typeof payload.prompt !== 'string') {
          return res.status(400).json({ error: 'Invalid payload: prompt is required' });
        }
        const sanitizedPrompt = sanitizeString(payload.prompt, 5000);
        const systemInstruction = getSystemInstruction(payload.level);

        // Try Gemini first, fallback to DeepSeek
        try {
          if (GOOGLE_KEY) {
            const genAI = new GoogleGenerativeAI(GOOGLE_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const chat = model.startChat({
              systemInstruction,
              generationConfig: { responseMimeType: "application/json" }
            });
            const response = await chat.sendMessage(sanitizedPrompt);
            const cleanedText = cleanJson(response.response.text());
            result = ensureResumeDataStructure(JSON.parse(cleanedText));
            usedProvider = 'gemini';
          } else {
            throw new Error('Gemini not configured');
          }
        } catch (geminiError) {
          console.log('Gemini failed, trying DeepSeek:', geminiError.message);
          const deepseekResponse = await callDeepSeek(systemInstruction, sanitizedPrompt, true);
          const cleanedText = cleanJson(deepseekResponse);
          result = ensureResumeDataStructure(JSON.parse(cleanedText));
          usedProvider = 'deepseek';
        }
        break;
      }

      case 'improve': {
        if (!payload?.resumeText || typeof payload.resumeText !== 'string') {
          return res.status(400).json({ error: 'Invalid payload: resumeText is required' });
        }
        const sanitizedText = sanitizeString(payload.resumeText, 15000);
        const prompt = `Based on the following resume text, improve and restructure it into JSON format. Enhance the language to be more impactful. Resume:\n\n${sanitizedText}`;
        const systemInstruction = getSystemInstruction();

        try {
          if (GOOGLE_KEY) {
            const genAI = new GoogleGenerativeAI(GOOGLE_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const chat = model.startChat({
              systemInstruction,
              generationConfig: { responseMimeType: "application/json" }
            });
            const response = await chat.sendMessage(prompt);
            const cleanedText = cleanJson(response.response.text());
            result = ensureResumeDataStructure(JSON.parse(cleanedText));
            usedProvider = 'gemini';
          } else {
            throw new Error('Gemini not configured');
          }
        } catch (geminiError) {
          console.log('Gemini failed, trying DeepSeek:', geminiError.message);
          const deepseekResponse = await callDeepSeek(systemInstruction, prompt, true);
          const cleanedText = cleanJson(deepseekResponse);
          result = ensureResumeDataStructure(JSON.parse(cleanedText));
          usedProvider = 'deepseek';
        }
        break;
      }

      case 'tailor': {
        if (!payload?.resumeData || !payload?.jobDescription) {
          return res.status(400).json({ error: 'Invalid payload: resumeData and jobDescription are required' });
        }
        const sanitizedJob = sanitizeString(payload.jobDescription, 5000);
        const prompt = `Tailor the following resume to this job description.\n\nResume: ${formatResumeAsText(payload.resumeData)}\n\nJob: ${sanitizedJob}`;
        const systemInstruction = getSystemInstruction();

        try {
          if (GOOGLE_KEY) {
            const genAI = new GoogleGenerativeAI(GOOGLE_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const chat = model.startChat({
              systemInstruction,
              generationConfig: { responseMimeType: "application/json" }
            });
            const response = await chat.sendMessage(prompt);
            const cleanedText = cleanJson(response.response.text());
            result = ensureResumeDataStructure(JSON.parse(cleanedText));
            usedProvider = 'gemini';
          } else {
            throw new Error('Gemini not configured');
          }
        } catch (geminiError) {
          console.log('Gemini failed, trying DeepSeek:', geminiError.message);
          const deepseekResponse = await callDeepSeek(systemInstruction, prompt, true);
          const cleanedText = cleanJson(deepseekResponse);
          result = ensureResumeDataStructure(JSON.parse(cleanedText));
          usedProvider = 'deepseek';
        }
        break;
      }

      case 'critique': {
        if (!payload?.resumeData) {
          return res.status(400).json({ error: 'Invalid payload: resumeData is required' });
        }
        const systemPrompt = 'You are a nursing career coach providing constructive resume feedback.';
        const prompt = `Act as a nursing career coach and critique this resume. Return JSON with: overallFeedback (string), strengths (array), areasForImprovement (array), bulletPointImprovements (array of objects with original, improved, explanation).\n\n${formatResumeAsText(payload.resumeData)}`;

        try {
          if (GOOGLE_KEY) {
            const genAI = new GoogleGenerativeAI(GOOGLE_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const chat = model.startChat({
              generationConfig: { responseMimeType: "application/json" }
            });
            const response = await chat.sendMessage(prompt);
            result = JSON.parse(cleanJson(response.response.text()));
            usedProvider = 'gemini';
          } else {
            throw new Error('Gemini not configured');
          }
        } catch (geminiError) {
          console.log('Gemini failed, trying DeepSeek:', geminiError.message);
          const deepseekResponse = await callDeepSeek(systemPrompt, prompt, true);
          result = JSON.parse(cleanJson(deepseekResponse));
          usedProvider = 'deepseek';
        }
        break;
      }

      case 'matchScore': {
        if (!payload?.resumeData || !payload?.jobDescription) {
          return res.status(400).json({ error: 'Invalid payload: resumeData and jobDescription are required' });
        }
        const sanitizedJob = sanitizeString(payload.jobDescription, 5000);
        const systemPrompt = 'You are an expert at analyzing resume-job description matches.';
        const prompt = `Compare this resume against the job description. Return JSON with: score (0-100), probability (Low/Medium/High), missingKeywords (array), criticalGaps (array), reasoning (string).\n\nResume: ${formatResumeAsText(payload.resumeData)}\n\nJob: ${sanitizedJob}`;

        try {
          if (GOOGLE_KEY) {
            const genAI = new GoogleGenerativeAI(GOOGLE_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const chat = model.startChat({
              generationConfig: { responseMimeType: "application/json" }
            });
            const response = await chat.sendMessage(prompt);
            result = JSON.parse(cleanJson(response.response.text()));
            usedProvider = 'gemini';
          } else {
            throw new Error('Gemini not configured');
          }
        } catch (geminiError) {
          console.log('Gemini failed, trying DeepSeek:', geminiError.message);
          const deepseekResponse = await callDeepSeek(systemPrompt, prompt, true);
          result = JSON.parse(cleanJson(deepseekResponse));
          usedProvider = 'deepseek';
        }
        break;
      }

      case 'coverLetter': {
        if (!payload?.resumeData || !payload?.jobDescription) {
          return res.status(400).json({ error: 'Invalid payload: resumeData and jobDescription are required' });
        }
        const sanitizedJob = sanitizeString(payload.jobDescription, 5000);
        const details = payload.resumeData.coverLetterDetails || {};
        const systemPrompt = 'You are an expert cover letter writer for nursing professionals.';
        const prompt = `Write a compelling cover letter for a Nurse.\n\nJob: ${sanitizedJob}\n\nResume: ${formatResumeAsText(payload.resumeData)}\n\nRecipient: ${sanitizeString(details.recipientName || 'Hiring Manager', 100)}\nCompany: ${sanitizeString(details.companyName || 'the Organization', 100)}\n\nKeep it under 400 words. Return only the letter body.`;

        try {
          if (GOOGLE_KEY) {
            const genAI = new GoogleGenerativeAI(GOOGLE_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const response = await model.generateContent(prompt);
            result = { text: response.response.text() || "" };
            usedProvider = 'gemini';
          } else {
            throw new Error('Gemini not configured');
          }
        } catch (geminiError) {
          console.log('Gemini failed, trying DeepSeek:', geminiError.message);
          const deepseekResponse = await callDeepSeek(systemPrompt, prompt, false);
          result = { text: deepseekResponse };
          usedProvider = 'deepseek';
        }
        break;
      }

      case 'optimizeSkills': {
        if (!payload?.resumeData) {
          return res.status(400).json({ error: 'Invalid payload: resumeData is required' });
        }
        const currentSkills = [...(payload.resumeData.skills || []), ...(payload.resumeData.softSkills || [])].join(', ');
        const systemPrompt = 'You are an expert in nursing skills and competencies.';
        const prompt = `Identify 5-8 missing high-impact nursing skills for ${payload.level === 'new_grad' ? 'New Graduate RN' : payload.level === 'leadership' ? 'Nurse Manager' : 'Experienced Nurse'}. Current skills: ${sanitizeString(currentSkills, 2000)}. Return JSON with: newSkills (array), newSoftSkills (array).`;

        try {
          if (GOOGLE_KEY) {
            const genAI = new GoogleGenerativeAI(GOOGLE_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const chat = model.startChat({
              generationConfig: { responseMimeType: "application/json" }
            });
            const response = await chat.sendMessage(prompt);
            result = JSON.parse(cleanJson(response.response.text()));
            usedProvider = 'gemini';
          } else {
            throw new Error('Gemini not configured');
          }
        } catch (geminiError) {
          console.log('Gemini failed, trying DeepSeek:', geminiError.message);
          const deepseekResponse = await callDeepSeek(systemPrompt, prompt, true);
          result = JSON.parse(cleanJson(deepseekResponse));
          usedProvider = 'deepseek';
        }
        break;
      }

      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    // Add metadata about which provider was used
    if (result && typeof result === 'object') {
      result._provider = usedProvider;
    }

    return res.json(result);
  } catch (error) {
    console.error('AI API Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
