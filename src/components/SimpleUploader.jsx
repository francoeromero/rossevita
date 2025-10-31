import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// SimpleUploader: minimal UI to upload a single file to the 'uploads' bucket.
// Usage: render <SimpleUploader /> anywhere in the app. It will show a file input,
// an Upload button and a short status + public URL when available.

export default function SimpleUploader({ onUploaded } = {}) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [publicUrl, setPublicUrl] = useState(null);

  // Upload the selected file to Supabase Storage ('uploads' bucket).
  const handleUpload = async () => {
    if (!file) {
      setMessage('No file selected');
      return;
    }
    setUploading(true);
    setMessage('Uploading...');
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/\s+/g, '_');
      const filePath = `${timestamp}_${safeName}`;
      const bucket = 'uploads';

      // In browser the File can be passed directly
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
      if (error) {
        console.error('Upload error', error);
        setMessage('Upload error: ' + error.message);
        setUploading(false);
        return;
      }

      // If the bucket is public we can get the public URL
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setPublicUrl(publicData?.publicUrl || null);
      setMessage('Uploaded: ' + file.name);

      // Notify parent (if provided) with the new file info so it can refresh listings
      try {
        if (typeof onUploaded === 'function') {
          const fileInfo = { name: filePath, publicUrl: publicData?.publicUrl || null, size: file.size, created_at: new Date().toISOString() };
          onUploaded(fileInfo);

          // Also attempt to insert metadata in `attachments` table so other users can see the file
          // This requires that the `attachments` table exists and that the client can insert rows.
          try {
            // Try to get user id if authenticated
            let userId = null;
            try {
              const { data: userData } = await supabase.auth.getUser();
              if (userData?.user) userId = userData.user.id;
            } catch (e) {
              // ignore
            }

            const { error: insertError } = await supabase.from('attachments').insert([{
              task_id: null,
              user_id: userId,
              bucket: bucket,
              path: filePath,
              file_name: file.name,
              mime_type: file.type,
              size: file.size,
              public_url: publicData?.publicUrl || null
            }]);
            if (insertError) {
              // not fatal: maybe table doesn't exist or policy denied
              console.warn('No se pudo insertar metadata en attachments:', insertError);
            }
          } catch (e) {
            console.warn('Error intentando insertar metadata en attachments:', e);
          }
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error('Exception uploading file', e);
      setMessage('Exception: ' + (e.message || e));
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <label className="block text-sm font-medium text-gray-700">Subir imagen / PDF (Simple)</label>
      <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-2" />
      <div className="mt-3">
        <button onClick={handleUpload} disabled={uploading || !file} className="px-3 py-1 bg-pink-600 text-white rounded">
          {uploading ? 'Subiendo...' : 'Subir (simple)'}
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-600">{message}</div>
      {publicUrl && (
        <div className="mt-2">
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-pink-600 underline">Abrir archivo</a>
        </div>
      )}
    </div>
  );
}
