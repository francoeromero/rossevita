import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SupplierDialog from '@/components/SupplierDialog';

const Suppliers = ({ user }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('suppliers');
    if (stored) {
      setSuppliers(JSON.parse(stored));
    } else {
      const initial = [
        { id: 1, name: 'Librería El Estudiante', cuit: '30-11223344-5', phone: '011-4567-8901', email: 'ventas@libreriaestudiante.com', address: 'Av. Corrientes 1234, CABA', category: 'Papelería' },
        { id: 2, name: 'Limpieza Total S.A.', cuit: '30-55667788-9', phone: '011-4321-9876', email: 'contacto@limpiezatotal.com', address: 'Calle Falsa 456, CABA', category: 'Limpieza' },
        { id: 3, name: 'Tecno Soluciones', cuit: '30-99887766-5', phone: 'Tecnología', email: 'info@tecnosoluciones.com', address: 'Av. Libertador 789, CABA', category: 'Tecnología' }
      ];
      setSuppliers(initial);
      localStorage.setItem('suppliers', JSON.stringify(initial));
    }
  }, []);

  const handleSave = (supplierData) => {
    let updated;
    if (editingSupplier) {
      updated = suppliers.map(sup => sup.id === editingSupplier.id ? { ...supplierData, id: editingSupplier.id } : sup);
      toast({ title: "Proveedor actualizado exitosamente" });
    } else {
      const newSupplier = { ...supplierData, id: Date.now() };
      updated = [...suppliers, newSupplier];
      toast({ title: "Proveedor agregado exitosamente" });
    }
    setSuppliers(updated);
    localStorage.setItem('suppliers', JSON.stringify(updated));
    setDialogOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = (id) => {
    const updated = suppliers.filter(sup => sup.id !== id);
    setSuppliers(updated);
    localStorage.setItem('suppliers', JSON.stringify(updated));
    toast({ title: "Proveedor eliminado" });
  };

  const filteredSuppliers = suppliers.filter(sup =>
    sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.cuit.includes(searchTerm)
  );

  return (
    <>
      <Helmet>
        <title>Proveedores - Rosse Vita Eventos</title>
        <meta name="description" content="Gestiona los proveedores de la empresa" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Proveedores</h2>
            <p className="text-gray-600 mt-1">Gestiona los proveedores de la empresa</p>
          </div>
          <Button
            onClick={() => {
              setEditingSupplier(null);
              setDialogOpen(true);
            }}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o CUIT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">CUIT</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rubro</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Teléfono</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier, index) => (
                  <motion.tr
                    key={supplier.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">{supplier.name}</td>
                    <td className="py-3 px-4">{supplier.cuit}</td>
                    <td className="py-3 px-4">{supplier.category}</td>
                    <td className="py-3 px-4">{supplier.phone}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{supplier.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingSupplier(supplier);
                            setDialogOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
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

      <SupplierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={editingSupplier}
        onSave={handleSave}
      />
    </>
  );
};

export default Suppliers;