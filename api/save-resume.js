import { saveResumeData } from '../services/dbService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, resumeData } = req.body;

  if (!email || !resumeData) {
    return res.status(400).json({ error: 'Email and resume data are required' });
  }

  try {
    await saveResumeData(email, resumeData);
    return res.status(200).json({ success: true, message: 'Resume saved successfully' });
  } catch (error) {
    console.error('Error saving resume:', error);
    return res.status(500).json({ error: 'Failed to save resume data' });
  }
}
