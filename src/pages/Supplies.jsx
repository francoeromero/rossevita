import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SupplyDialog from '@/components/SupplyDialog';

const Supplies = ({ user }) => {
  const [supplies, setSupplies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('supplies');
    if (stored) {
      setSupplies(JSON.parse(stored));
    } else {
      const initial = [
        { id: 1, name: 'Resma de Papel A4', category: 'Papelería', quantity: 10, unitPrice: 8.5, totalPrice: 85, supplier: 'Librería El Estudiante', purchaseDate: '2025-10-15', employee: 'Ana Gómez' },
        { id: 2, name: 'Mouse Inalámbrico', category: 'Tecnología', quantity: 2, unitPrice: 25, totalPrice: 50, supplier: 'Tecno Soluciones', purchaseDate: '2025-10-10', employee: 'Carlos Ruiz' },
        { id: 3, name: 'Detergente Limpiador', category: 'Limpieza', quantity: 5, unitPrice: 5, totalPrice: 25, supplier: 'Limpieza Total S.A.', purchaseDate: '2025-09-28', employee: 'Ana Gómez' },
        { id: 4, name: 'Toner para Impresora', category: 'Impresión', quantity: 1, unitPrice: 120, totalPrice: 120, supplier: 'Tecno Soluciones', purchaseDate: '2025-09-15', employee: 'Carlos Ruiz' },
        { id: 5, name: 'Caja de Bolígrafos', category: 'Papelería', quantity: 3, unitPrice: 12, totalPrice: 36, supplier: 'Librería El Estudiante', purchaseDate: '2025-08-20', employee: 'Juan Pérez' },
        { id: 6, name: 'Teclado Mecánico', category: 'Tecnología', quantity: 1, unitPrice: 80, totalPrice: 80, supplier: 'Tecno Soluciones', purchaseDate: '2025-08-05', employee: 'María Rodriguez' },
        { id: 7, name: 'Lavandina', category: 'Limpieza', quantity: 10, unitPrice: 2.5, totalPrice: 25, supplier: 'Limpieza Total S.A.', purchaseDate: '2025-07-30', employee: 'Ana Gómez' }
      ];
      setSupplies(initial);
      localStorage.setItem('supplies', JSON.stringify(initial));
    }
  }, []);

  const handleSave = (supplyData) => {
    let updated;
    if (editingSupply) {
      updated = supplies.map(sup => sup.id === editingSupply.id ? { ...supplyData, id: editingSupply.id } : sup);
      toast({ title: "Insumo actualizado exitosamente" });
    } else {
      const newSupply = { ...supplyData, id: Date.now() };
      updated = [...supplies, newSupply];
      toast({ title: "Insumo agregado exitosamente" });
    }
    setSupplies(updated);
    localStorage.setItem('supplies', JSON.stringify(updated));
    setDialogOpen(false);
    setEditingSupply(null);
  };

  const handleDelete = (id) => {
    const updated = supplies.filter(sup => sup.id !== id);
    setSupplies(updated);
    localStorage.setItem('supplies', JSON.stringify(updated));
    toast({ title: "Insumo eliminado" });
  };

  const filteredSupplies = supplies.filter(sup => {
    const matchesSearch = sup.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || sup.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Insumos - Rosse Vita Eventos</title>
        <meta name="description" content="Registra y gestiona las compras" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Insumos</h2>
            <p className="text-gray-600 mt-1">Registra y gestiona las compras</p>
          </div>
          <Button
            onClick={() => {
              setEditingSupply(null);
              setDialogOpen(true);
            }}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Insumo
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar insumo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option>Todas</option>
              <option>Papelería</option>
              <option>Tecnología</option>
              <option>Limpieza</option>
              <option>Impresión</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Insumo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoría</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cantidad</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Precio Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Empleado</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSupplies.map((supply, index) => (
                  <motion.tr
                    key={supply.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">{supply.name}</td>
                    <td className="py-3 px-4">{supply.category}</td>
                    <td className="py-3 px-4">{new Date(supply.purchaseDate).toLocaleDateString('es-AR')}</td>
                    <td className="py-3 px-4">{supply.quantity}</td>
                    <td className="py-3 px-4 font-semibold">${supply.totalPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{supply.employee}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingSupply(supply);
                            setDialogOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supply.id)}
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

      <SupplyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supply={editingSupply}
        onSave={handleSave}
      />
    </>
  );
};

export default Supplies;