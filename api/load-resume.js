import { getResumeData } from '../services/dbService.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const resumeData = await getResumeData(email);
    
    if (!resumeData) {
      return res.status(404).json({ error: 'No resume data found for this email' });
    }

    return res.status(200).json({ success: true, resumeData });
  } catch (error) {
    console.error('Error loading resume:', error);
    return res.status(500).json({ error: 'Failed to load resume data' });
  }
}
