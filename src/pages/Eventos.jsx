import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventDialog from '@/components/EventDialog';
import EventCalendar from '@/components/EventCalendar';

// Simple CRUD for events and event types stored in localStorage.
// - Event types are stored under key 'event_types'
// - Events are stored under key 'events'
// This is a frontend-only implementation that respects existing data structures.

const DEFAULT_TYPES = [
  'Casamientos',
  'Cumpleaños',
  'Fiestas de 15',
  'Brindis de fin de año',
  'Eventos corporativos',
  'Egresados'
];

export default function Eventos() {
  const [types, setTypes] = useState([]);
  const [events, setEvents] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // event form
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);

  useEffect(() => {
    try {
      const storedTypes = JSON.parse(localStorage.getItem('event_types') || 'null');
      if (Array.isArray(storedTypes) && storedTypes.length) setTypes(storedTypes);
      else setTypes(DEFAULT_TYPES);
    } catch (e) {
      setTypes(DEFAULT_TYPES);
    }

    try {
      const storedEvents = JSON.parse(localStorage.getItem('events') || '[]');
      setEvents(Array.isArray(storedEvents) ? storedEvents : []);
    } catch (e) {
      setEvents([]);
    }
  }, []);

  useEffect(() => { try { localStorage.setItem('event_types', JSON.stringify(types)); } catch (e) {} }, [types]);
  useEffect(() => {
    try { localStorage.setItem('events', JSON.stringify(events)); } catch (e) {}
    // dispatch an event so other components (Dashboard charts) can update immediately
    try { window.dispatchEvent(new CustomEvent('events:changed')); } catch (e) {}
  }, [events]);

  // Events handlers
  const resetEventForm = () => {
    setTitle(''); setEventType(''); setDateFrom(''); setDateTo(''); setEditingEventId(null);
  };

  const handleSaveEvent = () => {
    const t = title.trim();
    if (!t) return;
    const evt = {
      id: editingEventId || Date.now().toString(),
      title: t,
      type: eventType || '',
      date_from: dateFrom || null,
      date_to: dateTo || null,
    };
    if (editingEventId) {
      setEvents(events.map(e => e.id === editingEventId ? evt : e));
    } else {
      setEvents([evt, ...events]);
    }
    resetEventForm();
  };

  const handleEditEvent = (ev) => {
    setEditingEvent(ev);
    setEditingEventId(ev.id);
    setDialogOpen(true);
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleSaveFromDialog = (ev) => {
    const exists = events.some(e => e.id === ev.id);
    if (exists) setEvents(events.map(e => e.id === ev.id ? ev : e));
    else setEvents([ev, ...events]);
    setEditingEvent(null);
    setEditingEventId(null);
    setDialogOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditingEvent(null); setEditingEventId(null); setDialogOpen(true); }} className="bg-pink-600">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Evento
        </Button>
      </div>

      <div className="mb-6">
        <EventCalendar events={events} size="lg" />
      </div>

      <h2 className="text-2xl font-bold mb-4">Lista de eventos</h2>

      <div className="mt-2 bg-white p-4 rounded border">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">No hay eventos.</p>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-sm text-gray-500">{ev.type || 'Sin tipo'} · {ev.date_from || '—'} {ev.date_to ? `→ ${ev.date_to}` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditEvent(ev)} className="text-blue-600 px-2 py-1 rounded hover:bg-blue-50"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-600 px-2 py-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EventDialog open={dialogOpen} onOpenChange={setDialogOpen} event={editingEvent} types={types} onSave={handleSaveFromDialog} />
    </div>
  );
}
