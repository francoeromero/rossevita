import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskList from '@/components/TaskList';
import { useToast } from '@/components/ui/use-toast';

const VENUES = [
  { id: 'constituyentes', name: 'Rosse Constituyentes' },
  { id: 'illia', name: 'Rosse Illia' },
  { id: 'canuelas', name: 'Rosse Cañuelas' }
];

const Tasks = ({ user }) => {
  const [tasks, setTasks] = useState({});
  const { toast } = useToast();

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