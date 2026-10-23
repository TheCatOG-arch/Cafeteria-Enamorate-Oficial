// admin/js/supabase.js
const SUPABASE_URL = 'https://vdfflrcfmxuzwemajcuc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZmZscmNmbXh1endlbWFqY3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MDM2NTYsImV4cCI6MjEwODA3OTY1Nn0.k0T3ZO-DUgXatiur_6GwsjnaXiUxrsmY0CTovYCDkTA';

// Inicializamos el cliente de Supabase usando el CDN que cargaremos en el HTML
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);