// js/supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tsgwqalcblpsdcxjxkhr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZ3dxYWxjYmxwc2RjeGp4a2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMTk0MDIsImV4cCI6MjA2Mzc5NTQwMn0.YUpogKD_UbQlWRdcqTBrDzu2op99MzTw2S1_20QbroA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

