import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xekmsfkmgjfanbyralge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhla21zZmttZ2pmYW5ieXJhbGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTY3NTEsImV4cCI6MjA4MDA3Mjc1MX0.0QOdv5pDliCTV3TN01SmR1VThuO1qbBCl_cQTkRkWRY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);