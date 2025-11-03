import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Employees from '@/pages/Employees';
import Supplies from '@/pages/Supplies';
import Suppliers from '@/pages/Suppliers';
import Reports from '@/pages/Reports';
import Tasks from '@/pages/Tasks';
import Settings from '@/pages/Settings';
import Eventos from '@/pages/Eventos';
import Layout from '@/components/Layout';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!currentUser) {
    return (
      <>
        <Helmet>
          <title>Login - Rosse Vita Eventos</title>
          <meta name="description" content="Sistema de gestión de eventos Rosse Vita" />
        </Helmet>
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
        <Route path="/empleados" element={<Employees user={currentUser} />} />
        <Route path="/insumos" element={<Supplies user={currentUser} />} />
        <Route path="/proveedores" element={<Suppliers user={currentUser} />} />
        <Route path="/reportes" element={<Reports user={currentUser} />} />
    <Route path="/eventos" element={<Eventos user={currentUser} />} />
        <Route path="/tareas" element={<Tasks user={currentUser} />} />
        <Route path="/configuracion" element={<Settings user={currentUser} />} />
      </Routes>
    </Layout>
  );
}

export default App;