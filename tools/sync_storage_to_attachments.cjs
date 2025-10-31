// tools/sync_storage_to_attachments.cjs
// Script to sync objects from the 'uploads' bucket into the `attachments` table.
// Usage: node tools/sync_storage_to_attachments.cjs
// Requires a .env.server with SUPABASE_SERVICE_ROLE and VITE_SUPABASE_URL

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.server') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Falta SUPABASE_SERVICE_ROLE o VITE_SUPABASE_URL en .env.server');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const bucket = 'uploads';
  console.log('Listing objects in bucket', bucket);
  const { data: objects, error: listErr } = await supabase.storage.from(bucket).list('', { limit: 1000 });
  if (listErr) {
    console.error('Error listando objetos:', listErr);
    process.exit(1);
  }

  if (!objects || objects.length === 0) {
    console.log('No se encontraron objetos en el bucket. Nada que sincronizar.');
    return;
  }

  // Map objects to attachment rows
  const rows = objects.map((o) => ({
    task_id: null,
    user_id: null,
    bucket,
    path: o.name,
    file_name: o.name,
    mime_type: o.metadata?.contentType || null,
    size: o.size || null,
    public_url: `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodeURIComponent(o.name)}`,
    created_at: o.created_at || new Date().toISOString()
  }));

  console.log(`Preparing to upsert ${rows.length} rows into attachments (if table exists)`);
  const { error: insertErr } = await supabase.from('attachments').upsert(rows, { onConflict: 'path' });
  if (insertErr) {
    console.error('Error insertando/upsert en attachments. Asegurate que la tabla existe y que la key tiene permisos:', insertErr);
    process.exit(1);
  }

  console.log('Sync completed successfully.');
}

main().catch((err) => { console.error('Unexpected error', err); process.exit(1); });
