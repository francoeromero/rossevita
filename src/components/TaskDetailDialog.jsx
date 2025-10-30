import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const TaskDetailDialog = ({ open, onOpenChange, task, onUpdate, currentUser }) => {
  const [comment, setComment] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [comments, setComments] = useState(task?.comments || []);
  const { toast } = useToast();

  React.useEffect(() => {
    setComments(task?.comments || []);
  }, [task?.comments]);

  if (!task) return null;

  const handleAddComment = () => {
    if (!comment.trim()) return;
    const newComment = {
      id: Date.now(),
      text: comment,
      author: currentUser.name,
      timestamp: new Date().toISOString()
    };
    const updatedTask = {
      ...task,
      comments: [...(task.comments || []), newComment]
    };
    onUpdate(updatedTask);
    setComments(prev => [...prev, newComment]);
    setComment('');
    toast({ title: "Comentario agregado" });
  };

  const handleAddFile = () => {
    if (!fileUrl.trim()) return;
    
    const newFile = {
      id: Date.now(),
      url: fileUrl,
      name: fileUrl.split('/').pop() || 'Archivo',
      uploadedBy: currentUser.name,
      timestamp: new Date().toISOString()
    };
    
    const updatedTask = {
      ...task,
      files: [...(task.files || []), newFile]
    };
    
    onUpdate(updatedTask);
    setFileUrl('');
    toast({ title: "Archivo adjuntado" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Comments Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Comentarios</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500">No hay comentarios aún</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">{c.author}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(c.timestamp).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{c.text}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button onClick={handleAddComment} className="bg-pink-600 hover:bg-pink-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Files Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Archivos Adjuntos</h3>
            <div className="space-y-2 mb-4">
              {task.files?.length === 0 ? (
                <p className="text-sm text-gray-500">No hay archivos adjuntos</p>
              ) : (
                task.files?.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <div>
                        <a 
                          href={f.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {f.name}
                        </a>
                        <p className="text-xs text-gray-500">Por {f.uploadedBy}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="URL del archivo o imagen..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <Button onClick={handleAddFile} className="bg-pink-600 hover:bg-pink-700">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
            {/* Input para subir cualquier archivo */}
            <div className="mt-3">
              <input
                type="file"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  // Aquí puedes agregar la lógica para guardar el archivo
                  toast({ title: `Archivo "${file.name}" listo para guardar.` });
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;