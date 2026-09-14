// backend/src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate
if (!supabaseUrl || !supabaseServiceKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  logger.error('Missing Supabase configuration', { missing });
  throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}`);
}

logger.info('🔐 Supabase configuration loaded', {
  url: supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
});

// Use service role client to bypass RLS
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;