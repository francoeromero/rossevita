import React from 'react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, ShoppingCart, Users, FileText } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Ene', gasto: 0 },
  { month: 'Feb', gasto: 0 },
  { month: 'Mar', gasto: 0 },
  { month: 'Abr', gasto: 0 },
  { month: 'May', gasto: 0 },
  { month: 'Jun', gasto: 0 },
  { month: 'Jul', gasto: 25 },
  { month: 'Ago', gasto: 115 },
  { month: 'Sep', gasto: 145 },
  { month: 'Oct', gasto: 135 },
  { month: 'Nov', gasto: 0 },
  { month: 'Dic', gasto: 0 }
];

const categoryData = [
  { name: 'Papelería', value: 121, color: '#ec4899' },
  { name: 'Tecnología', value: 130, color: '#3b82f6' },
  { name: 'Limpieza', value: 50, color: '#8b5cf6' },
  { name: 'Impresión', value: 120, color: '#06b6d4' }
];

const recentActivity = [
  { name: 'Resma de Papel A4', date: '14/10/2025', amount: 86 },
  { name: 'Mouse Inalámbrico', date: '9/10/2025', amount: 50 },
  { name: 'Detergente Limpiador', date: '27/9/2025', amount: 25 },
  { name: 'Toner para Impresora', date: '14/9/2025', amount: 120 },
  { name: 'Caja de Bolígrafos', date: '19/8/2025', amount: 36 }
];

// Simple list component that loads events from localStorage and shows price
function EventsList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('events') || '[]');
      setEvents(Array.isArray(raw) ? raw : []);
    } catch (e) {
      setEvents([]);
    }
  }, []);

  const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 });

  if (!events || events.length === 0) return <p className="text-sm text-gray-500">No hay eventos registrados.</p>;

  return (
    <div className="space-y-3">
      {events.map((ev) => {
        const priceNum = ev && ev.price != null && ev.price !== '' ? parseFloat(ev.price) : null;
        return (
          <div key={ev.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-medium text-gray-900 text-sm">{ev.title}</p>
              <p className="text-xs text-gray-500">{ev.date_from || '—'}</p>
            </div>
            <div className="text-sm font-semibold text-gray-900">{priceNum != null && !isNaN(priceNum) ? fmt.format(priceNum) : '—'}</div>
          </div>
        );
      })}
    </div>
  );
}

// Monthly Ingresos Chart computed from events' price by date_from
function MonthlyIngresosChart() {
  const [data, setData] = useState([
    { month: 'Ene', ingreso: 0 },
    { month: 'Feb', ingreso: 0 },
    { month: 'Mar', ingreso: 0 },
    { month: 'Abr', ingreso: 0 },
    { month: 'May', ingreso: 0 },
    { month: 'Jun', ingreso: 0 },
    { month: 'Jul', ingreso: 0 },
    { month: 'Ago', ingreso: 0 },
    { month: 'Sep', ingreso: 0 },
    { month: 'Oct', ingreso: 0 },
    { month: 'Nov', ingreso: 0 },
    { month: 'Dic', ingreso: 0 }
  ]);

  useEffect(() => {
    const compute = () => {
      try {
        const raw = JSON.parse(localStorage.getItem('events') || '[]');
        const sums = new Array(12).fill(0);
        if (Array.isArray(raw)) {
          raw.forEach(ev => {
            if (!ev) return;
            const dateStr = ev.date_from;
            const price = ev.price != null && ev.price !== '' ? parseFloat(String(ev.price).replace(/\./g,'').replace(/,/g,'.')) : NaN;
            if (!dateStr || isNaN(price)) return;
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return;
            const m = d.getMonth();
            sums[m] += price;
          });
        }
        const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        setData(months.map((m, i) => ({ month: m, ingreso: Math.round((sums[i] + Number.EPSILON) * 100) / 100 })));
      } catch (e) {
        // ignore
      }
    };

    compute();

    const onEventsChanged = () => compute();
    window.addEventListener('events:changed', onEventsChanged);
    return () => window.removeEventListener('events:changed', onEventsChanged);
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingresos Mensuales (2025)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(value) => `$${value}`} />
          <Bar dataKey="ingreso" fill="#10B981" radius={[8,8,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const Dashboard = ({ user }) => {
  const currentMonthIndex = new Date().getMonth();
  const gastoMensualValue = monthlyData[currentMonthIndex] ? monthlyData[currentMonthIndex].gasto : 0;
  const gastoMensualDisplay = `$${gastoMensualValue}`;

  // compute event-based monthly sums so we can show current-month ingresos/egresos
  const [eventMonthlySums, setEventMonthlySums] = useState(new Array(12).fill(0));
  useEffect(() => {
    const compute = () => {
      try {
        const raw = JSON.parse(localStorage.getItem('events') || '[]');
        const sums = new Array(12).fill(0);
        if (Array.isArray(raw)) {
          raw.forEach(ev => {
            if (!ev) return;
            const dateStr = ev.date_from;
            const price = ev.price != null && ev.price !== '' ? parseFloat(String(ev.price).replace(/\./g,'').replace(/,/g,'.')) : NaN;
            if (!dateStr || isNaN(price)) return;
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return;
            sums[d.getMonth()] += price;
          });
        }
        setEventMonthlySums(sums.map(v => Math.round((v + Number.EPSILON) * 100) / 100));
      } catch (e) {
        setEventMonthlySums(new Array(12).fill(0));
      }
    };

    compute();
    const onEventsChanged = () => compute();
    window.addEventListener('events:changed', onEventsChanged);
    return () => window.removeEventListener('events:changed', onEventsChanged);
  }, []);

  const fmtCurrency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 });
  const currentMonthEventSum = eventMonthlySums[currentMonthIndex] || 0;
  const currentMonthEventDisplay = fmtCurrency.format(currentMonthEventSum);

  const stats = [
    { 
      title: 'Gasto Mensual', 
      value: gastoMensualDisplay, 
      subtitle: 'Mes actual',
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    { 
      title: 'Gasto Anual', 
      value: '$421', 
      subtitle: 'Año en curso',
      icon: TrendingUp,
      color: 'bg-gray-700'
    },
    { 
      title: 'Compras Totales', 
      value: '7', 
      subtitle: 'Registros históricos',
      icon: ShoppingCart,
      color: 'bg-gray-700'
    },
    { 
      title: 'Egresos Mensuales', 
      value: currentMonthEventDisplay, 
      subtitle: 'Mes actual',
      icon: Users,
      color: 'bg-blue-500'
    },
    { 
      title: 'Categoría Principal', 
      value: 'Tecnología', 
      subtitle: 'Más consumida',
      icon: FileText,
      color: 'bg-gray-700'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Rosse Vita Eventos</title>
        <meta name="description" content="Panel de control de gestión de eventos" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-600 mt-1">Resumen de la actividad</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Expenses Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gastos Mensuales (2025)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => `$${value}`}
                />
                <Bar dataKey="gasto" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
          
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">${item.amount}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      {/* Ingresos chart + Events List (side-by-side on large screens) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <MonthlyIngresosChart />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Eventos registrados</h3>
            <EventsList />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Dashboard;