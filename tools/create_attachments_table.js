// tools/create_attachments_table.js
// Script to create the `attachments` table using the service_role key (server-side).
// Usage: node tools/create_attachments_table.js

import dotenv from 'dotenv';
dotenv.config({ path: '.env.server' });

async function createTable() {
  console.log('Intentando crear tabla attachments...');

  // Importamos dinámicamente el helper server-side DESPUÉS de cargar las variables de entorno
  const { supabaseAdmin } = await import('../src/server/supabaseAdmin.js');

  const sql = `
  create extension if not exists "pgcrypto";

  create table if not exists public.attachments (
    id uuid primary key default gen_random_uuid(),
    task_id uuid,
    user_id uuid references auth.users,
    bucket text not null,
    path text not null,
    file_name text,
    mime_type text,
    size bigint,
    public_url text,
    created_at timestamptz default now()
  );
  `;

  try {
    // supabase-js exposes a postgres.query method when using service_role (v2)
    if (supabaseAdmin && supabaseAdmin.postgres && typeof supabaseAdmin.postgres.query === 'function') {
      const res = await supabaseAdmin.postgres.query({ sql });
      console.log('Resultado create table:', res);
    } else {
      console.error('El cliente supabaseAdmin no expone postgres.query. No se pudo ejecutar SQL desde aquí.');
      console.error('Como alternativa, crea la tabla manualmente en el SQL Editor de Supabase con el SQL del script.');
    }
  } catch (err) {
    console.error('Error ejecutando SQL para crear la tabla:', err.message || err);
  }
}

createTable();
