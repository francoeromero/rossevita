import React from 'react';
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

const Dashboard = ({ user }) => {
  const stats = [
    { 
      title: 'Gasto Mensual', 
      value: '$135', 
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
      title: 'Empleado Top', 
      value: 'Carlos Ruiz', 
      subtitle: 'Mayor gasto',
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
    </>
  );
};

export default Dashboard;