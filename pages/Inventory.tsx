import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Product, ProductStatus } from '../types';
import ProductForm from '../components/ProductForm';
import { Pencil, Plus, Search, Archive } from 'lucide-react';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const all = storageService.getActiveProducts();
    setProducts(all);
  };

  const handleSave = (product: Product) => {
    storageService.saveProduct(product);
    setIsEditing(false);
    setSelectedProduct(null);
    loadProducts();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de inactivar este producto? No se eliminará permanentemente.')) {
      storageService.deleteProduct(id);
      loadProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isEditing) {
    return (
      <ProductForm 
        initialData={selectedProduct} 
        onSave={handleSave} 
        onCancel={() => setIsEditing(false)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-500">Gestión de Máquinas y Componentes</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 bg-gray-100">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 bg-white rounded-full shadow-md text-blue-600 hover:text-blue-800 transition-colors"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 transition-colors"
                  title="Inactivar"
                >
                  <Archive size={18} />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <span className="text-white font-mono text-sm bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                  {product.code}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {product.components.filter(c => c.status === ProductStatus.ACTIVE).length} Piezas en el kit
              </p>
              
              <div className="flex flex-wrap gap-1">
                {product.components.filter(c => c.status === ProductStatus.ACTIVE).slice(0, 3).map(c => (
                  <span key={c.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
                    {c.name}
                  </span>
                ))}
                {product.components.filter(c => c.status === ProductStatus.ACTIVE).length > 3 && (
                  <span className="text-xs text-gray-400 px-2 py-1">...</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No se encontraron productos activos.
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;