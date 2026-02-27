import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

router.post('/', async (req, res) => {
  const { jobDescription, companyName, position, resumeText, profileData } = req.body;
  
  if (!jobDescription || !companyName || !position) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const userContext = resumeText ? `Resume: ${resumeText}` : `Profile: ${JSON.stringify(profileData)}`;
    
    const prompt = `
      Create a cover letter and email body for a job application. 
      The cover letter should be concise and highlight the applicant's relevant skills and experience, within 200-250 words.
      The email body should be a polite and enthusiastic introduction to the position, highlighting the applicant's enthusiasm for the role, within 100 words.
      
      Job Details:
      Company: ${companyName}
      Position: ${position}
      Description: ${jobDescription}
      
      User Context:
      ${userContext}
      
      Return the response in JSON format with "coverLetter" and "emailBody" fields.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional and enthusiastic job application writer that writes job application materials." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = JSON.parse(completion.choices[0].message.content || '{}');
    
    res.json({
      success: true,
      coverLetter: content.coverLetter,
      emailBody: content.emailBody
    });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

export default router;
