import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import EmployeeDialog from '@/components/EmployeeDialog';

const Employees = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('employees');
    if (stored) {
      setEmployees(JSON.parse(stored));
    } else {
      const initial = [
        { id: 1, name: 'Juan Pérez', dni: '12345678', position: 'Vendedor Senior', department: 'Ventas', email: 'juan.perez@empresa.com' },
        { id: 2, name: 'Ana Gómez', dni: '87654321', position: 'Administrativa', department: 'Administración', email: 'ana.gomez@empresa.com' },
        { id: 3, name: 'Carlos Ruiz', dni: '11223344', position: 'Soporte Técnico', department: 'TI', email: 'carlos.ruiz@empresa.com' },
        { id: 4, name: 'María Rodriguez', dni: '44332211', position: 'Vendedora Jr.', department: 'Ventas', email: 'maria.rodriguez@empresa.com' }
      ];
      setEmployees(initial);
      localStorage.setItem('employees', JSON.stringify(initial));
    }
  }, []);

  const handleSave = (employeeData) => {
    let updated;
    if (editingEmployee) {
      updated = employees.map(emp => emp.id === editingEmployee.id ? { ...employeeData, id: editingEmployee.id } : emp);
      toast({ title: "Empleado actualizado exitosamente" });
    } else {
      const newEmployee = { ...employeeData, id: Date.now() };
      updated = [...employees, newEmployee];
      toast({ title: "Empleado agregado exitosamente" });
    }
    setEmployees(updated);
    localStorage.setItem('employees', JSON.stringify(updated));
    setDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleDelete = (id) => {
    const updated = employees.filter(emp => emp.id !== id);
    setEmployees(updated);
    localStorage.setItem('employees', JSON.stringify(updated));
    toast({ title: "Empleado eliminado" });
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.dni.includes(searchTerm)
  );

  return (
    <>
      <Helmet>
        <title>Empleados - Rosse Vita Eventos</title>
        <meta name="description" content="Gestiona el personal de la empresa" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Empleados</h2>
            <p className="text-gray-600 mt-1">Gestiona el personal de la empresa</p>
          </div>
          <Button
            onClick={() => {
              setEditingEmployee(null);
              setDialogOpen(true);
            }}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
              <option>Todos</option>
              <option>Ventas</option>
              <option>Administración</option>
              <option>TI</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">DNI</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cargo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Departamento</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee, index) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">{employee.name}</td>
                    <td className="py-3 px-4">{employee.dni}</td>
                    <td className="py-3 px-4">{employee.position}</td>
                    <td className="py-3 px-4">{employee.department}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{employee.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingEmployee(employee);
                            setDialogOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editingEmployee}
        onSave={handleSave}
      />
    </>
  );
};

export default Employees;