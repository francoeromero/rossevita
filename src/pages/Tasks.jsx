import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskList from '@/components/TaskList';
import { useToast } from '@/components/ui/use-toast';
// Importamos el cliente supabase que creamos en src/lib/supabaseClient.js
import { supabase } from '@/lib/supabaseClient';
import SimpleUploader from '@/components/SimpleUploader';

const VENUES = [
  { id: 'constituyentes', name: 'Rosse Constituyentes' },
  { id: 'illia', name: 'Rosse Illia' },
  { id: 'canuelas', name: 'Rosse Cañuelas' }
];

const Tasks = ({ user }) => {
  const [tasks, setTasks] = useState({});
  const { toast } = useToast();

  // Estado para manejar la lista de archivos del bucket 'uploads'
  const [files, setFiles] = useState([]); // lista de archivos en el bucket
  const [storageRaw, setStorageRaw] = useState(null);
  const [attachmentsRaw, setAttachmentsRaw] = useState(null);
  const [localCacheRaw, setLocalCacheRaw] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // archivo seleccionado en el input
  const [uploading, setUploading] = useState(false); // indicador de carga
  const [activeFilesTab, setActiveFilesTab] = useState('1');

  useEffect(() => {
    const stored = localStorage.getItem('tasks');
    if (stored) {
      setTasks(JSON.parse(stored));
    } else {
      const initial = {
        constituyentes: [
          { id: 1, name: 'Revisar equipos de sonido', deadline: '2025-11-05', status: 'En Progreso', comments: [], files: [] }
        ],
        illia: [
          { id: 2, name: 'Preparar decoración navideña', deadline: '2025-12-01', status: 'Completada', comments: [], files: [] }
        ],
        canuelas: []
      };
      setTasks(initial);
      localStorage.setItem('tasks', JSON.stringify(initial));
    }
  }, []);

  // ------------------------------------------------------------
  // Funciones relacionadas con Supabase Storage
  // ------------------------------------------------------------

  // Lista los archivos que están en el bucket 'uploads'
  const fetchFiles = async () => {
    try {
      // Listamos en la raíz del bucket. Ajusta el path si usas carpetas por usuario.
      let data;
      try {
        const res = await supabase.storage.from('uploads').list('', { limit: 100 });
        data = res.data || [];
        if (res.error) {
          console.error('Error listando archivos (storage.list):', res.error);
        }
        // store raw for debugging
        setStorageRaw(res);
      } catch (storageErr) {
        console.error('Excepción llamando storage.list():', storageErr);
        data = [];
      }

      // data es un array de objetos con {name, id, updated_at, created_at, last_accessed_at, metadata, size}
      // Enriquecemos la lista con la publicUrl (si el bucket es público) para que cualquier usuario
      // que abra la web pueda ver y abrir los archivos.
      const enriched = (data || []).map((item) => {
        const publicUrl = supabase.storage.from('uploads').getPublicUrl(item.name)?.data?.publicUrl || null;
        return { ...item, publicUrl };
      });

      // Intentamos también leer la tabla `attachments` (si existe) para mostrar un historial
      // centralizado de archivos subidos. Esto permite que otros usuarios vean la lista.
      let attachments = [];
      try {
        const { data: attData, error: attError } = await supabase.from('attachments').select('*').order('created_at', { ascending: false }).limit(500);
        if (!attError && Array.isArray(attData)) attachments = attData.map(a => ({ name: a.path, publicUrl: a.public_url, size: a.size, created_at: a.created_at }));
        setAttachmentsRaw({ data: attData, error: attError });
      } catch (e) {
        // tabla attachments puede no existir — no es fatal
        setAttachmentsRaw({ data: null, error: e });
      }

      // Cargar cache local de uploads (fallback para que lo subido quede visible tras recargar)
      const localCache = (() => {
        try {
          return JSON.parse(localStorage.getItem('uploads_cache') || '[]');
        } catch (e) {
          return [];
        }
      })();
      setLocalCacheRaw(localCache);

  // Merge sources into a final list.
  // Use storage (enriched) to prefer publicUrl and metadata from Storage when available,
  // then fallback to attachments (DB) fields, and finally localCache can override/add client-only fields.
  const mergedByName = {};
  // Start from attachments (DB) as base
  attachments.forEach((it) => { if (it && it.name) mergedByName[it.name] = { ...it }; });
  // Merge storage fields on top (prefer publicUrl/size/created_at from storage)
  enriched.forEach((it) => { if (it && it.name) mergedByName[it.name] = { ...(mergedByName[it.name] || {}), ...it }; });
  // Finally merge local cache to preserve client-only flags (e.g., group)
  localCache.forEach((it) => { if (it && it.name) mergedByName[it.name] = { ...(mergedByName[it.name] || {}), ...it }; });

  const merged = Object.values(mergedByName).sort((a, b) => (new Date(b.created_at || 0)) - (new Date(a.created_at || 0)));

      setFiles(merged);
      // for debug: log merged
      console.debug('fetchFiles merged list:', merged);
    } catch (err) {
      console.error('Excepción listando archivos:', err);
    }
  };

  // Handler para cuando un uploader (SimpleUploader u otro) notifica un archivo nuevo
  const handleUploaded = (fileInfo) => {
    try {
      const cache = JSON.parse(localStorage.getItem('uploads_cache') || '[]');
      // evitar duplicados por name
      const exists = cache.find((c) => c.name === fileInfo.name);
      if (!exists) {
        cache.unshift(fileInfo);
        localStorage.setItem('uploads_cache', JSON.stringify(cache.slice(0, 200)));
      }
    } catch (e) {
      console.warn('No se pudo escribir cache local de uploads', e);
    }

    // refrescar la lista desde el bucket (y mezclar cache)
    fetchFiles();
  };

  // Sube un archivo al bucket 'uploads' con nombre único (fecha + nombre original)
  const uploadFile = async () => {
    if (!selectedFile) {
      console.warn('No hay archivo seleccionado');
      return;
    }

    setUploading(true); // mostramos que la subida empezó

    try {
      // Generamos un nombre único: timestamp_originalname
      const timestamp = Date.now(); // ms desde epoch
      const safeName = selectedFile.name.replace(/\s+/g, '_'); // reemplazar espacios
      const filePath = `${timestamp}_${safeName}`; // ruta dentro del bucket
      const bucket = 'uploads';

      // Realizamos la subida al bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, selectedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Error subiendo archivo:', uploadError);
        toast({ title: 'Error', description: 'Error subiendo archivo. Revisa la consola.' });
        setUploading(false);
        return;
      }

      // Si el bucket es público (como pediste) podemos obtener la URL pública directamente
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const publicUrl = publicData?.publicUrl || null;

      // Mostrar en consola y en pantalla (toast)
      console.log('Archivo subido correctamente:', uploadData, 'Public URL:', publicUrl);
      toast({ title: 'Subida completa', description: `Archivo subido: ${selectedFile.name}` });

      // Refrescar la lista de archivos
      await fetchFiles();

      // Opcional: mostrar la URL en pantalla (podemos abrir o guardarla en el estado)
      // Aquí añadimos la URL al objeto en la lista local si la tenemos
      if (publicUrl) {
        // añadimos la url al estado 'files' — buscamos el item y le agregamos publicUrl para mostrar
        setFiles(prev => prev.map(f => (f.name === filePath ? { ...f, publicUrl } : f)));
        // Como la lista anterior no tendrá el nuevo archivo con publicUrl (porque list() no devuelve url),
        // podemos también forzar agregar el nuevo registro manualmente
        setFiles(prev => [{ name: filePath, publicUrl, size: selectedFile.size, created_at: new Date().toISOString() }, ...prev]);
      }

      // -----------------------
      // Guardar metadata en la tabla `attachments` (si existe)
      // -----------------------
      try {
        // intentamos obtener el user id autenticado
        let userId = null;
        try {
          const { data: userData, error: userErr } = await supabase.auth.getUser();
          if (!userErr && userData?.user) userId = userData.user.id;
        } catch (e) {
          console.warn('No se pudo obtener usuario autenticado:', e);
        }

        // Intentamos insertar metadata en la tabla attachments
        const { error: insertError } = await supabase.from('attachments').insert([{
          task_id: null,
          user_id: userId,
          bucket,
          path: filePath,
          file_name: selectedFile.name,
          mime_type: selectedFile.type,
          size: selectedFile.size,
          public_url: publicUrl
        }]);

        if (insertError) {
          console.warn('No se pudo insertar metadata en attachments (tal vez la tabla no existe o hay RLS):', insertError);
        } else {
          console.log('Metadata guardada en attachments');
        }
      } catch (e) {
        console.error('Error intentando guardar metadata en attachments:', e);
      }

      setSelectedFile(null); // limpiar input
    } catch (err) {
      console.error('Excepción subiendo archivo:', err);
      toast({ title: 'Error', description: 'Ocurrió un error durante la subida. Revisa la consola.' });
    } finally {
      setUploading(false);
    }
  };

  // Obtener la URL pública de un archivo (si el bucket es público)
  const getPublicUrl = (fileName) => {
    const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return data?.publicUrl || null;
  };

  // Crear signed URL para bucket privado (no usado aquí, pero útil)
  const createSignedUrl = async (fileName, expiresIn = 60 * 60) => {
    const { data, error } = await supabase.storage.from('uploads').createSignedUrl(fileName, expiresIn);
    if (error) {
      console.error('Error creando signed URL:', error);
      return null;
    }
    return data.signedUrl;
  };

  // Carga inicial de archivos cuando se monta el componente
  useEffect(() => {
    fetchFiles();
  }, []);

  const handleTaskUpdate = (venueId, updatedTasks) => {
    const newTasks = { ...tasks, [venueId]: updatedTasks };
    setTasks(newTasks);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  return (
    <>
      <Helmet>
        <title>Tareas por Sede - Rosse Vita Eventos</title>
        <meta name="description" content="Gestiona las tareas de cada sede" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Tareas por Sede</h2>
          <p className="text-gray-600 mt-1">Gestiona las tareas de cada sede</p>
          {/* Simple uploader: un pequeño widget para subir jpg/pdf sin depender del modal */}
          <div className="mt-4">
              <div className="flex items-center gap-4 mb-3">
                <button onClick={() => setActiveFilesTab('1')} className={`px-3 py-1 rounded ${activeFilesTab === '1' ? 'bg-pink-600 text-white' : 'bg-white border'}`}>Rosse Constituyentes</button>
                <button onClick={() => setActiveFilesTab('2')} className={`px-3 py-1 rounded ${activeFilesTab === '2' ? 'bg-pink-600 text-white' : 'bg-white border'}`}>Rosse Illia</button>
              </div>

              {/* Uploader placed under the tab buttons. Only the uploader for the active tab is shown. */}
              <div className="mt-2">
                <div className="flex gap-2">
                  {activeFilesTab === '1' ? (
                    <div className="w-56"><SimpleUploader onUploaded={handleUploaded} group="1" /></div>
                  ) : null}
                  {activeFilesTab === '2' ? (
                    <div className="w-56"><SimpleUploader onUploaded={handleUploaded} group="2" /></div>
                  ) : null}
                </div>
              </div>
              {/* Debug panel: shows raw data sources used to build the files list. Remove in production. */}
              {/* <details className="mt-3 p-2 bg-gray-50 border rounded">
                <summary className="cursor-pointer text-sm text-gray-700">Debug: ver fuentes (storage / attachments / local cache)</summary>
                <div className="mt-2 text-xs text-gray-600">
                  <div><strong>storage.list raw:</strong></div>
                  <pre style={{whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto'}}>{JSON.stringify(storageRaw, null, 2)}</pre>
                  <div className="mt-2"><strong>attachments query:</strong></div>
                  <pre style={{whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto'}}>{JSON.stringify(attachmentsRaw, null, 2)}</pre>
                  <div className="mt-2"><strong>local uploads_cache:</strong></div>
                  <pre style={{whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto'}}>{JSON.stringify(localCacheRaw, null, 2)}</pre>
                </div>
              </details> */}
              {/* Mostrar lista de archivos (fusionados) para que queden visibles en la UI */}
              <div className="mt-4">
                <h3 className="text-lg font-medium">Archivos subidos</h3>
                {files.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay archivos disponibles.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {files.filter(f => (f.group || '1') === activeFilesTab).map((f) => (
                      <li key={f.name} className="text-sm">
                        <a href={f.publicUrl || getPublicUrl(f.name)} target="_blank" rel="noreferrer" className="text-pink-600 underline">
                          {f.name}
                        </a>
                        {f.size ? <span className="text-gray-500 ml-2">({Math.round(f.size / 1024)} KB)</span> : null}
                        {f.created_at ? <span className="text-gray-400 ml-2">{new Date(f.created_at).toLocaleString()}</span> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
          </div>
        </div>

        <Tabs defaultValue="constituyentes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1 rounded-lg">
            {VENUES.map(venue => (
              <TabsTrigger 
                key={venue.id} 
                value={venue.id}
                className="data-[state=active]:bg-pink-600 data-[state=active]:text-white rounded-md transition-all"
              >
                <Building2 className="h-4 w-4 mr-2" />
                {venue.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {VENUES.map(venue => (
            <TabsContent key={venue.id} value={venue.id} className="mt-6">
              <TaskList
                venueName={venue.name}
                tasks={tasks[venue.id] || []}
                onUpdate={(updatedTasks) => handleTaskUpdate(venue.id, updatedTasks)}
                currentUser={user}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
};

export default Tasks;