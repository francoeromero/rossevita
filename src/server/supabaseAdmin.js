// Archivo: src/server/supabaseAdmin.js
// Uso: este archivo es solo para código que corre en el servidor (Node, serverless functions).
// No lo importes desde código que se empaqueta para el navegador.

import { createClient } from '@supabase/supabase-js';

// Tomamos la URL y la service_role key desde las variables de entorno del servidor.
// Asegurate de configurar SUPABASE_SERVICE_ROLE en tu entorno de despliegue (Vercel, Netlify, etc.).
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ffecwtmryseddottywya.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE;

if (!SERVICE_ROLE_KEY) {
  // Es intencional: querer usar la service_role sin definirla es un error de configuración.
  // En entornos de producción, lanza una excepción o loguea de forma segura.
  console.warn('Warning: SUPABASE_SERVICE_ROLE is not defined in server environment');
}

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  // Opcional: configura tiempo de espera, logging, o headers adicionales aquí.
});

// Ejemplo de uso (server-side):
// const { data, error } = await supabaseAdmin.storage.from('private-bucket').list('path');
