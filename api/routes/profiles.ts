import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// GET /api/profiles - Get all profiles
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM profiles ORDER BY updated_at DESC');
    const profiles = stmt.all();
    res.json({ profiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// POST /api/profiles - Create a new profile
router.post('/', (req, res) => {
  const { name, type, content } = req.body;
  
  if (!name || !type || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (type !== 'upload' && type !== 'manual') {
    return res.status(400).json({ error: 'Invalid profile type' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO profiles (name, type, content)
      VALUES (?, ?, ?)
    `);
    
    const info = stmt.run(name, type, typeof content === 'object' ? JSON.stringify(content) : content);
    
    res.json({ 
      success: true, 
      id: info.lastInsertRowid,
      message: 'Profile saved successfully' 
    });
  } catch (error: any) {
    console.error('Error saving profile:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Profile name already exists' });
    }
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// PUT /api/profiles/:id - Update an existing profile
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, content } = req.body;
  
  if (!name || !type || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const stmt = db.prepare(`
      UPDATE profiles 
      SET name = ?, type = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const info = stmt.run(name, type, typeof content === 'object' ? JSON.stringify(content) : content, id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Profile name already exists' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE /api/profiles/:id - Delete a profile
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM profiles WHERE id = ?');
    const info = stmt.run(id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Profile deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

export default router;
