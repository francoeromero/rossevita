// tools/test_upload_and_insert.cjs
// CommonJS wrapper that loads server ESM module and runs an upload test.
const dotenv = require('dotenv');
dotenv.config({ path: '.env.server' });

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  try {
    const mod = await import(pathToFileURL(path.join(__dirname, '..', 'src', 'server', 'supabaseAdmin.js')).href);
    const { supabaseAdmin } = mod;
    if (!supabaseAdmin) {
      console.error('supabaseAdmin no disponible. Revisa .env.server');
      process.exit(1);
    }

    const bucket = 'uploads';
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const local = path.join(tmpDir, 'test-file-cjs.txt');
    fs.writeFileSync(local, 'Prueba CJS ' + new Date().toISOString());
    const remote = `${Date.now()}_test-file-cjs.txt`;

  console.log('Subiendo', local, '->', bucket, '/', remote);
  // Use a Buffer instead of stream to avoid undici `duplex` requirement in Node
  const fileBuffer = fs.readFileSync(local);
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(remote, fileBuffer);
    if (uploadError) console.error('Upload error:', uploadError);
    else console.log('Upload OK:', uploadData);

    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(remote);
    console.log('Public URL:', publicData?.publicUrl || 'none');

    const payload = { task_id: null, user_id: null, bucket, path: remote, file_name: 'test-file-cjs.txt', mime_type: 'text/plain', size: fs.statSync(local).size, public_url: publicData?.publicUrl };
    const { data: insertData, error: insertError } = await supabaseAdmin.from('attachments').insert([payload]).select();
    if (insertError) console.error('Insert error (likely table missing):', insertError.message || insertError);
    else console.log('Insert OK:', insertData);

    const { data: listData, error: listErr } = await supabaseAdmin.storage.from(bucket).list('', { limit: 50 });
    if (listErr) console.error('List error:', listErr);
    else console.log('Bucket sample:', (listData || []).slice(0, 10).map(f => f.name));

  } catch (err) {
    console.error('Error test_upload_and_insert.cjs:', err);
  }
})();
