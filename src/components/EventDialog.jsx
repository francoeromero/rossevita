import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const EventDialog = ({ open, onOpenChange, event, types = [], onSave }) => {
  const [form, setForm] = useState({
    title: '',
    type: '',
    date_from: new Date().toISOString().split('T')[0],
    date_to: '',
    price: ''
  });

  useEffect(() => {
    if (event) setForm({ ...event, price: event.price ?? event.price === 0 ? String(event.price) : (event.price || '') });
    else setForm({ title: '', type: '', date_from: new Date().toISOString().split('T')[0], date_to: '', price: '' });
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, id: event?.id || Date.now().toString() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Título del evento</Label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <Label>Tipo</Label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">-- Seleccionar --</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Fecha desde</Label>
              <input type="date" value={form.date_from || ''} onChange={e => setForm({ ...form, date_from: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <Label>Fecha hasta</Label>
              <input type="date" value={form.date_to || ''} onChange={e => setForm({ ...form, date_to: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div>
            <Label>Precio (ARS)</Label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={form.price ?? ''}
              onChange={e => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Introduce el precio del evento. Se guardará con el evento para uso futuro.</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
