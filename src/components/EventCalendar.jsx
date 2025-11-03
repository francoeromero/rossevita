import React, { useMemo, useState } from 'react';

// Simple month calendar that highlights dates present in events' date_from
// Props:
// - events: array of { id, title, date_from }
// - size: 'md' | 'lg' (controls visual scale)
const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatYMD(d) {
  if (!d) return '';
  const year = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${m}-${day}`;
}

export default function EventCalendar({ events = [], size = 'lg' }) {
  const [current, setCurrent] = useState(() => startOfMonth(new Date()));

  const eventsByDate = useMemo(() => {
    const map = {};
    (events || []).forEach(ev => {
      if (!ev || !ev.date_from) return;
      // accept both Date objects and strings
      const d = typeof ev.date_from === 'string' ? ev.date_from : formatYMD(new Date(ev.date_from));
      if (!d) return;
      if (!map[d]) map[d] = [];
      map[d].push(ev);
    });
    return map;
  }, [events]);

  const first = startOfMonth(current);
  const last = endOfMonth(current);

  // compute days to show (start from first day of week that contains day 1)
  const startDay = new Date(first);
  startDay.setDate(1 - startDay.getDay());

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    days.push(d);
  }

  const prev = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const next = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));

  const sizeClasses = size === 'lg' ? 'text-sm md:text-base' : 'text-xs';

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <button onClick={prev} className="px-2 py-1 mr-2 rounded hover:bg-gray-100">◀</button>
          <button onClick={next} className="px-2 py-1 rounded hover:bg-gray-100">▶</button>
        </div>
        <div className="font-semibold">
          {current.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <div className="text-sm text-gray-500">Fechas marcadas: <span className="font-medium">{Object.keys(eventsByDate).length}</span></div>
      </div>

      <div className={`grid grid-cols-7 gap-1 ${sizeClasses}`}>
        {weekDays.map(w => (
          <div key={w} className="text-center text-gray-500 font-medium py-1">{w}</div>
        ))}

        {days.map((d) => {
          const ymd = formatYMD(d);
          const isCurrentMonth = d.getMonth() === current.getMonth();
          const evs = eventsByDate[ymd] || [];
          return (
            <div key={ymd} className={`h-20 md:h-24 p-1 rounded ${isCurrentMonth ? '' : 'text-gray-400'}`} title={evs.map(e => e.title).join(', ')}>
              <div className="flex items-start justify-between">
                <div className={`w-7 h-7 flex items-center justify-center rounded-full ${evs.length ? 'bg-pink-600 text-white' : 'text-gray-700'}`}>
                  <span className="text-sm">{d.getDate()}</span>
                </div>
              </div>
              <div className="mt-2">
                {evs.slice(0,2).map(e => (
                  <div key={e.id} className="text-xs truncate" title={e.title}>
                    • {e.title}
                  </div>
                ))}
                {evs.length > 2 && <div className="text-xs text-gray-500">+{evs.length - 2} más</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
