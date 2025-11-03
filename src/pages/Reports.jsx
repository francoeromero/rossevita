import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  { name: 'Papelería', value: 29, color: '#ec4899' },
  { name: 'Tecnología', value: 31, color: '#3b82f6' },
  { name: 'Limpieza', value: 12, color: '#8b5cf6' },
  { name: 'Impresión', value: 29, color: '#06b6d4' }
];

const employeeData = [
  { name: 'Carlos Ruiz', gasto: 170 },
  { name: 'Ana Gómez', gasto: 146 },
  { name: 'María Rodriguez', gasto: 80 },
  { name: 'Juan Pérez', gasto: 36 }
];

// Datos anuales para la tabla PDF (puedes mover esto a un archivo aparte si lo prefieres)
const annualDetails = [
  { name: 'Resma de Papel A4', category: 'Papelería', quantity: 10, total: 85, employee: 'Ana Gómez', date: '15/10/2025' },
  { name: 'Mouse Inalámbrico', category: 'Tecnología', quantity: 2, total: 50, employee: 'Carlos Ruiz', date: '10/10/2025' },
  { name: 'Detergente Limpiador', category: 'Limpieza', quantity: 5, total: 25, employee: 'Ana Gómez', date: '28/09/2025' },
  { name: 'Toner para Impresora', category: 'Impresión', quantity: 1, total: 120, employee: 'Carlos Ruiz', date: '15/09/2025' },
  { name: 'Caja de Bolígrafos', category: 'Papelería', quantity: 3, total: 36, employee: 'Juan Pérez', date: '20/08/2025' },
  { name: 'Teclado Mecánico', category: 'Tecnología', quantity: 1, total: 80, employee: 'María Rodriguez', date: '05/08/2025' },
  { name: 'Lavandina', category: 'Limpieza', quantity: 10, total: 25, employee: 'Ana Gómez', date: '30/07/2025' }
];

const monthlyDetails = {
  'Octubre': [
    { name: 'Resma de Papel A4', date: '15/10/2025', quantity: 10, total: 85 },
    { name: 'Mouse Inalámbrico', date: '10/10/2025', quantity: 2, total: 50 }
  ]
};

const Reports = ({ user }) => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('Noviembre');
  const [selectedGainMonth, setSelectedGainMonth] = useState('Noviembre');
  const { toast } = useToast();

  const monthNameToIndex = (name) => {
    const map = {
      'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
      'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
    };
    return map[name] ?? 0;
  };

  const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 });

  const loadEvents = () => {
    try {
      const raw = JSON.parse(localStorage.getItem('events') || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  };

  const eventsAll = loadEvents();

  const eventsForMonth = (monthName) => {
    const idx = monthNameToIndex(monthName);
    return eventsAll.filter(ev => {
      if (!ev || !ev.date_from) return false;
      const d = new Date(ev.date_from);
      if (isNaN(d.getTime())) return false;
      return d.getMonth() === idx;
    });
  };

  const eventsThisGainMonth = eventsForMonth(selectedGainMonth);
  const gainTotal = eventsThisGainMonth.reduce((s, ev) => {
    const price = ev && ev.price != null && ev.price !== '' ? parseFloat(String(ev.price).replace(/\./g,'').replace(/,/g,'.')) : NaN;
    return s + (isNaN(price) ? 0 : price);
  }, 0);

  // Generar PDF del reporte mensual
  const handleDownloadMonthlyPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(28);
    doc.text(`Reporte Mensual de Gastos - ${selectedMonth} ${selectedYear}`, 15, 25);
    doc.setFontSize(14);
    autoTable(doc, {
      startY: 40,
      head: [[
        'Insumo',
        'Cantidad',
        'Total',
        'Fecha'
      ]],
      body: (monthlyDetails[selectedMonth] || []).map(item => [
        item.name,
        item.quantity,
        `$${item.total.toFixed(2)}`,
        item.date
      ]),
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', fontSize: 13 },
      bodyStyles: { fontSize: 12, textColor: [80,80,80] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 15, right: 15 },
      styles: { cellPadding: 3 },
      theme: 'grid',
    });
    doc.save(`Reporte_Mensual_${selectedMonth}_${selectedYear}.pdf`);
    toast({ title: 'Descarga exitosa', description: 'El PDF mensual se ha generado correctamente.' });
  };

    const handleDownloadPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(28);
      doc.text(`Reporte Anual de Gastos - ${selectedYear}`, 15, 25);
      doc.setFontSize(14);
      autoTable(doc, {
        startY: 40,
        head: [[
          'Insumo',
          'Categoría',
          'Cantidad',
          'Total',
          'Empleado',
          'Fecha'
        ]],
        body: annualDetails.map(item => [
          item.name,
          item.category,
          item.quantity,
          `$${item.total.toFixed(2)}`,
          item.employee,
          item.date
        ]),
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', fontSize: 13 },
        bodyStyles: { fontSize: 12, textColor: [80,80,80] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 15, right: 15 },
        styles: { cellPadding: 3 },
        theme: 'grid',
      });
      doc.save(`Reporte_${selectedYear}.pdf`);
      toast({ title: 'Descarga exitosa', description: 'El PDF se ha generado correctamente.' });
    };


  return (
    <>
      <Helmet>
        <title>Reportes - Rosse Vita Eventos</title>
        <meta name="description" content="Análisis de gastos por año" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Reportes</h2>
            <p className="text-gray-600 mt-1">Análisis de gastos por año</p>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option>2025</option>
              <option>2024</option>
            </select>
            <button
              className="ml-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
              onClick={handleDownloadPDF}
              title="Descargar PDF"
            >
              Descargar PDF
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gastos Mensuales 2025</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => `$${value}`}
                />
                <Legend />
                <Line type="monotone" dataKey="gasto" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Employee Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Empleados por Gasto</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => `gasto : ${value}`}
              />
              <Bar dataKey="gasto" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Detalle de Gastos Mensuales</h3>
            <div className="flex gap-2">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option>Octubre</option>
                <option>Septiembre</option>
                <option>Agosto</option>
              </select>
              <button
                className="ml-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                onClick={handleDownloadMonthlyPDF}
                title="Descargar PDF Mensual"
              >
                Descargar PDF Mensual
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">Insumos comprados en el mes seleccionado.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-600 font-medium mb-1">GASTO TOTAL</p>
              <p className="text-3xl font-bold text-blue-700">$135,00</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 font-medium mb-1">ÍTEMS COMPRADOS</p>
              <p className="text-3xl font-bold text-gray-700">12</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Insumo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cantidad</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {monthlyDetails[selectedMonth]?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.date}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4 font-semibold">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Gains Monthly Details (mirrors Gastos section) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Detalle de Ganancias Mensuales</h3>
            <div className="flex gap-2">
              <select 
                value={selectedGainMonth}
                onChange={(e) => setSelectedGainMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option>Octubre</option>
                <option>Noviembre</option>
                <option>Diciembre</option>
                <option>Septiembre</option>
                <option>Agosto</option>
              </select>
              <button
                className="ml-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                onClick={() => {
                  // generate simple PDF of gains for the month
                  const doc = new jsPDF();
                  doc.setFontSize(20);
                  doc.text(`Reporte Mensual de Ganancias - ${selectedGainMonth} ${selectedYear}`, 15, 20);
                  autoTable(doc, {
                    startY: 30,
                    head: [['Evento','Fecha','Tipo','Precio']],
                    body: eventsThisGainMonth.map(ev => [ev.title || '', ev.date_from || '', ev.type || '', fmt.format(ev.price != null ? (parseFloat(String(ev.price).replace(/\./g,'').replace(/,/g,'.'))||0) : 0)]),
                    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
                    foot: [['', '', 'Total', fmt.format(gainTotal)]],
                    margin: { left: 15, right: 15 },
                    theme: 'grid'
                  });
                  doc.save(`Ganancias_${selectedGainMonth}_${selectedYear}.pdf`);
                  toast({ title: 'Descarga exitosa', description: 'El PDF de ganancias se ha generado correctamente.' });
                }}
                title="Descargar PDF Mensual"
              >
                Descargar PDF Mensual
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">Ingresos por eventos en el mes seleccionado.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-green-600 font-medium mb-1">GANANCIA TOTAL</p>
              <p className="text-3xl font-bold text-green-700">{fmt.format(gainTotal)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 font-medium mb-1">ÍTEMS (EVENTOS)</p>
              <p className="text-3xl font-bold text-gray-700">{eventsThisGainMonth.length}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Evento</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Precio</th>
                </tr>
              </thead>
              <tbody>
                {eventsThisGainMonth.map((ev, index) => (
                  <tr key={ev.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">{ev.title}</td>
                    <td className="py-3 px-4">{ev.date_from}</td>
                    <td className="py-3 px-4">{ev.type || '—'}</td>
                    <td className="py-3 px-4 font-semibold">{fmt.format(ev.price != null ? (parseFloat(String(ev.price).replace(/\./g,'').replace(/,/g,'.'))||0) : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Reports;