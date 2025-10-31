// Archivo: src/lib/supabaseClient.js
// Este archivo exporta un cliente Supabase configurado para usar en la app.
// INSTRUCCIONES: Agrega tus credenciales en un archivo .env a la raíz del proyecto
// con las siguientes variables (recomendado para Vite):
// VITE_SUPABASE_URL="https://xyzcompany.supabase.co"
// VITE_SUPABASE_ANON_KEY="public-anon-key-..."
// No peges las claves directamente aquí en el código en producción.

import { createClient } from '@supabase/supabase-js';

// Tomamos las variables de entorno que Vite expone en tiempo de build/runtime.
// Si prefieres, puedes reemplazar las cadenas vacías con tus valores (no recomendado).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'SUPABASE_URL_GOES_HERE';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUPABASE_ANON_KEY_GOES_HERE';

// Crea el cliente supabase que exportaremos para usar en toda la app.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Nota: Para operaciones de servidor seguras (ej. backups, triggers) usa la
// service_role key en un entorno backend seguro — nunca desde el cliente.
