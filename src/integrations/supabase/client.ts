// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ohuhnjpmfvpacpmzaexl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9odWhuanBtZnZwYWNwbXphZXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTA2NzEsImV4cCI6MjA2NDUyNjY3MX0.loIueLaRhK4U3xBUPzhG5dUkAuzco7_b3iWmApw5e5U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);