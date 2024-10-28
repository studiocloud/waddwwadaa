import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is required');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is required');
}

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create validation_history table if it doesn't exist
    const { error: tableError } = await supabase.from('validation_history').select().limit(1);
    
    if (tableError && tableError.message.includes('does not exist')) {
      await supabase.rpc('create_validation_history_table');
    }

    // Create stored procedure for table creation if it doesn't exist
    const { error: procError } = await supabase.rpc('create_validation_history_table');
    
    if (!procError || procError.message.includes('already exists')) {
      console.log('Database initialized successfully');
    } else {
      console.error('Error creating stored procedure:', procError);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}