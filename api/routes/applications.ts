import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// GET /api/applications
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM applications ORDER BY applied_date DESC');
    const applications = stmt.all();
    res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// POST /api/applications
router.post('/', (req, res) => {
  const { companyName, position, appliedDate, jobDescription, generatedCoverLetter, generatedEmailBody, resumeFilePath } = req.body;
  
  if (!companyName || !position || !appliedDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO applications (company_name, position, applied_date, job_description, generated_cover_letter, generated_email_body, resume_file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(companyName, position, appliedDate, jobDescription, generatedCoverLetter, generatedEmailBody, resumeFilePath);
    
    res.json({ 
      success: true, 
      id: info.lastInsertRowid,
      message: 'Application saved successfully' 
    });
  } catch (error) {
    console.error('Error saving application:', error);
    res.status(500).json({ error: 'Failed to save application' });
  }
});

export default router;
