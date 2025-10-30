import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, Paperclip, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import TaskDialog from '@/components/TaskDialog';
import TaskDetailDialog from '@/components/TaskDetailDialog';

const TaskList = ({ venueName, tasks, onUpdate, currentUser }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const { toast } = useToast();

  const handleSave = (taskData) => {
    let updated;
    if (editingTask) {
      updated = tasks.map(t => t.id === editingTask.id ? { ...taskData, id: editingTask.id } : t);
      toast({ title: "Tarea actualizada exitosamente" });
    } else {
      const newTask = { ...taskData, id: Date.now(), comments: [], files: [] };
      updated = [...tasks, newTask];
      toast({ title: "Tarea agregada exitosamente" });
    }
    onUpdate(updated);
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleDelete = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    onUpdate(updated);
    toast({ title: "Tarea eliminada" });
  };

  const handleTaskUpdate = (updatedTask) => {
    const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    onUpdate(updated);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completada': return 'bg-green-100 text-green-700';
      case 'En Progreso': return 'bg-blue-100 text-blue-700';
      case 'Cancelada': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">{venueName}</h3>
          <Button
            onClick={() => {
              setEditingTask(null);
              setDialogOpen(true);
            }}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No hay tareas registradas para esta sede</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{task.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Vence: {new Date(task.deadline).toLocaleDateString('es-AR')}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setDetailDialogOpen(true);
                        }}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {task.comments?.length || 0} comentarios
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setDetailDialogOpen(true);
                        }}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700"
                      >
                        <Paperclip className="h-4 w-4" />
                        {task.files?.length || 0} archivos
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setDialogOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSave}
      />

      <TaskDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        task={selectedTask}
        onUpdate={handleTaskUpdate}
        currentUser={currentUser}
      />
    </>
  );
};

export default TaskList;