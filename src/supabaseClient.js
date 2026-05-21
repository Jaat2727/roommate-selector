import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://acfigyizdvxjuqlfywuk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZmlneWl6ZHZ4anVxbGZ5d3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTM5NTMsImV4cCI6MjA5NDkyOTk1M30.Gblv10GVCZprZkY7EVrvbS-13b5bMvmXIGeh81exiRQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
