// Minimal server-side test script (clean version)
// Usage: node tools/test_upload_and_insert.js

import dotenv from 'dotenv';
dotenv.config({ path: '.env.server' });

import fs from 'fs';
import path from 'path';

async function main() {
  try {
    const { supabaseAdmin } = await import('../src/server/supabaseAdmin.js');

    if (!supabaseAdmin) {
      console.error('supabaseAdmin no disponible. Revisa .env.server');
      process.exit(1);
    }

    const bucket = 'uploads';
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const localPath = path.join(tmpDir, 'test-file.txt');
    fs.writeFileSync(localPath, 'Prueba de subida desde script - ' + new Date().toISOString());
    const remoteName = `${Date.now()}_test-file.txt`;

    console.log('Intentando subir', localPath, '->', bucket, '/', remoteName);
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(remoteName, fs.createReadStream(localPath));
    if (uploadError) {
      console.error('Error en upload:', uploadError.message || uploadError);
    } else {
      console.log('Upload OK:', uploadData);
    }

    // obtener URL pública (si bucket público)
    try {
      const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(remoteName);
      console.log('Public URL:', publicData?.publicUrl || 'none');
    } catch (e) {
      console.warn('No se pudo obtener publicUrl:', e.message || e);
    }

    // intentar insertar metadata
    try {
      const payload = {
        task_id: null,
        user_id: null,
        bucket,
        path: remoteName,
        file_name: 'test-file.txt',
        mime_type: 'text/plain',
        size: fs.statSync(localPath).size,
        public_url: null
      };
      const { data: insertData, error: insertError } = await supabaseAdmin.from('attachments').insert([payload]).select();
      if (insertError) console.error('Insert metadata error (table missing or RLS):', insertError.message || insertError);
      else console.log('Insert metadata OK:', insertData);
    } catch (e) {
      console.error('Excepción insert metadata:', e.message || e);
    }

    // listar archivos en bucket
    try {
      const { data: listData, error: listErr } = await supabaseAdmin.storage.from(bucket).list('', { limit: 50 });
      if (listErr) console.error('Error list bucket:', listErr.message || listErr);
      else console.log('Bucket sample:', (listData || []).slice(0, 10).map(f => f.name));
    } catch (e) {
      console.error('Excepción list bucket:', e.message || e);
    }

  } catch (err) {
    console.error('Error general:', err.message || err);
  }
}

main();
// tools/test_upload_and_insert.js
// Minimal script to upload a small file and insert metadata using the admin client.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.server' });
import fs from 'fs';
import path from 'path';

async function run() {
  const { supabaseAdmin } = await import('../src/server/supabaseAdmin.js');
  const bucket = 'uploads';
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  const local = path.join(tmpDir, 'test-file.txt');
  fs.writeFileSync(local, 'test ' + new Date().toISOString());
  const remote = `${Date.now()}_test-file.txt`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(remote, fs.createReadStream(local));
  if (uploadError) return console.error('Upload error:', uploadError);
  console.log('Uploaded:', uploadData);

  const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(remote);
  console.log('Public URL:', publicData?.publicUrl);

  const payload = { task_id: null, user_id: null, bucket, path: remote, file_name: 'test-file.txt', mime_type: 'text/plain', size: fs.statSync(local).size, public_url: publicData?.publicUrl };
  const { data: insertData, error: insertError } = await supabaseAdmin.from('attachments').insert([payload]).select();
  if (insertError) console.error('Insert error (likely table missing):', insertError);
  else console.log('Insert OK:', insertData);

  const { data: listData, error: listErr } = await supabaseAdmin.storage.from(bucket).list('', { limit: 100 });
  console.log('Bucket list sample:', listErr || listData.slice(0, 10));

  const { data: rows, error: rowsErr } = await supabaseAdmin.from('attachments').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Attachments rows:', rowsErr || rows);
}

run();
// tools/test_upload_and_insert.js
// Minimal script to upload a small file and insert metadata using the admin client.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.server' });
import fs from 'fs';
import path from 'path';

async function run() {
  const { supabaseAdmin } = await import('../src/server/supabaseAdmin.js');
  const bucket = 'uploads';
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  const local = path.join(tmpDir, 'test-file.txt');
  fs.writeFileSync(local, 'test ' + new Date().toISOString());
  const remote = `${Date.now()}_test-file.txt`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(remote, fs.createReadStream(local));
  if (uploadError) return console.error('Upload error:', uploadError);
  console.log('Uploaded:', uploadData);

  const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(remote);
  console.log('Public URL:', publicData?.publicUrl);

  const payload = { task_id: null, user_id: null, bucket, path: remote, file_name: 'test-file.txt', mime_type: 'text/plain', size: fs.statSync(local).size, public_url: publicData?.publicUrl };
  const { data: insertData, error: insertError } = await supabaseAdmin.from('attachments').insert([payload]).select();
  if (insertError) console.error('Insert error (likely table missing):', insertError);
  else console.log('Insert OK:', insertData);

  const { data: listData, error: listErr } = await supabaseAdmin.storage.from(bucket).list('', { limit: 100 });
  console.log('Bucket list sample:', listErr || listData.slice(0, 10));

  const { data: rows, error: rowsErr } = await supabaseAdmin.from('attachments').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Attachments rows:', rowsErr || rows);
}

run();
// tools/test_upload_and_insert.js
// Script to test uploading a small file to the 'uploads' bucket and inserting metadata into attachments.
// Usage: node tools/test_upload_and_insert.js

import dotenv from 'dotenv';
dotenv.config({ path: '.env.server' });
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '../src/server/supabaseAdmin.js';

async function runTest() {
  const bucket = 'uploads';
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const filePathLocal = path.join(tmpDir, 'test-file.txt');
  fs.writeFileSync(filePathLocal, 'Prueba de subida desde script - ' + new Date().toISOString());

  const remoteName = `${Date.now()}_test-file.txt`;

  try {
    console.log('Subiendo archivo de prueba al bucket', bucket, 'como', remoteName);
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(remoteName, fs.createReadStream(filePathLocal));
    if (uploadError) {
      console.error('Error subiendo archivo:', uploadError);
      import dotenv from 'dotenv';
      dotenv.config({ path: '.env.server' });
      import fs from 'fs';
      import path from 'path';

      async function runTest() {
        // import dinámico del helper server-side después de cargar .env.server
        const { supabaseAdmin } = await import('../src/server/supabaseAdmin.js');

        const bucket = 'uploads';
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        const filePathLocal = path.join(tmpDir, 'test-file.txt');
        fs.writeFileSync(filePathLocal, 'Prueba de subida desde script - ' + new Date().toISOString());

        const remoteName = `${Date.now()}_test-file.txt`;

        try {
          console.log('Subiendo archivo de prueba al bucket', bucket, 'como', remoteName);
          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(remoteName, fs.createReadStream(filePathLocal));
          if (uploadError) {
            console.error('Error subiendo archivo:', uploadError);
            return;
          }
          console.log('Upload data:', uploadData);

          // obtener URL pública (si bucket público)
          const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(remoteName);
          const publicUrl = publicData?.publicUrl || null;
          console.log('Public URL:', publicUrl);

          // insertar metadata en attachments
          const insertPayload = {
            task_id: null,
            user_id: null,
            bucket,
            path: remoteName,
            file_name: 'test-file.txt',
            mime_type: 'text/plain',
            size: fs.statSync(filePathLocal).size,
            public_url: publicUrl
          };

          console.log('Insertando metadata en attachments:', insertPayload);
          const { data: insertData, error: insertError } = await supabaseAdmin.from('attachments').insert([insertPayload]).select();
          if (insertError) {
            console.error('Error insertando metadata:', insertError);
          } else {
            console.log('Insert OK:', insertData);
          }

          // listar archivos en bucket
          const { data: listData, error: listErr } = await supabaseAdmin.storage.from(bucket).list('', { limit: 100 });
          if (listErr) console.error('Error listando bucket:', listErr);
          else console.log('Archivos en bucket (ejemplo):', listData.slice(0, 10));

          // listar filas en attachments
          const { data: rows, error: rowsErr } = await supabaseAdmin.from('attachments').select('*').order('created_at', { ascending: false }).limit(10);
          if (rowsErr) console.error('Error listando attachments:', rowsErr);
          else console.log('Attachments recientes:', rows);

        } catch (err) {
          console.error('Excepción durante test:', err);
        }
      }

      runTest();
