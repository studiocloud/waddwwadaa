import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Get validation history
router.get('/validation-history', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase
      .from('validation_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Validation history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add validation record
router.post('/validation-history', async (req, res) => {
  try {
    const { userId, fileName, status, totalEmails, validEmails, invalidEmails } = req.body;

    if (!userId || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('validation_history')
      .insert([
        {
          user_id: userId,
          file_name: fileName,
          status: status || 'completed',
          total_emails: totalEmails || 0,
          valid_emails: validEmails || 0,
          invalid_emails: invalidEmails || 0
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error adding validation record:', error);
    res.status(500).json({ error: 'Failed to add validation record' });
  }
});

export default router;