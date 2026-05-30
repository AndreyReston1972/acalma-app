import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// null quando credenciais não estão configuradas — app funciona só com localStorage
export const supabase = (url && key) ? createClient(url, key) : null
