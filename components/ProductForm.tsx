import React, { useState, useRef } from 'react';
import { Product, ProductStatus, ProductType, ComponentItem } from '../types';
import { Save, Plus, Trash2, ImageIcon, ArrowLeft, QrCode, Download, X, Link as LinkIcon, Image as ImageLucide } from 'lucide-react';

interface ProductFormProps {
  initialData?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || 'https://picsum.photos/400/300');
  const [components, setComponents] = useState<ComponentItem[]>(initialData?.components || []);
  const [qrPreview, setQrPreview] = useState<{code: string, name: string} | null>(null);
  
  // State for component image editing
  const [editingCompImageId, setEditingCompImageId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const compFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isComponent: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isComponent && editingCompImageId) {
          updateComponent(editingCompImageId, 'imageUrl', result);
          setEditingCompImageId(null); // Close mini modal
        } else {
          setImageUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addComponent = () => {
    const parentCode = code.trim() || 'NEW';
    const nextIndex = components.length + 1;
    const autoCode = `${parentCode}-${nextIndex}`;

    const newComp: ComponentItem = {
      id: Date.now().toString(),
      name: `Pieza #${nextIndex}`,
      code: autoCode,
      status: ProductStatus.ACTIVE,
      imageUrl: '' // Initialize empty
    };
    setComponents([...components, newComp]);
  };

  const updateComponent = (id: string, field: keyof ComponentItem, value: string) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, status: ProductStatus.INACTIVE } : c
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: initialData?.id || Date.now().toString(),
      name,
      code,
      type: ProductType.MACHINE,
      imageUrl,
      status: initialData?.status || ProductStatus.ACTIVE,
      updatedAt: new Date().toISOString(),
      components: components
    };
    onSave(product);
  };

  const downloadQr = async (codeStr: string, nameStr: string) => {
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${codeStr}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `QR-${codeStr}-${nameStr}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading QR", error);
      alert("No se pudo descargar la imagen automáticamente.");
    }
  };

  const activeComponents = components.filter(c => c.status === ProductStatus.ACTIVE);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft size={20} /> Volver
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h2>
        </div>

        {/* Main Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. BANCA PLANA PROFESIONAL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Código Máquina (Padre)</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej. FB0318"
              />
              <p className="text-xs text-gray-500 mt-1">Este código se usará como prefijo para las piezas.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Principal</label>
              <div className="flex gap-4 mb-3">
                <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center gap-3 w-full">
                   <div className="flex items-center gap-2">
                      <LinkIcon size={16} className="text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Pegar enlace de imagen (https://...)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1 text-sm border-b border-gray-300 focus:border-blue-500 outline-none px-1 py-1"
                      />
                   </div>
                   <span className="text-xs text-gray-400 text-center">- O -</span>
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm border border-gray-300"
                  >
                    <ImageIcon size={16} /> Subir Archivo Local
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Component List */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Componentes del Kit</h3>
              <button 
                type="button"
                onClick={addComponent}
                className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 font-medium transition-colors"
              >
                <Plus size={16} /> Agregar Pieza (Auto)
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto pr-2 flex-1 min-h-[300px]">
              {activeComponents.length === 0 && (
                 <p className="text-gray-400 text-sm text-center py-10 italic">
                   No hay componentes.<br/>Presione "Agregar Pieza" para generar automáticamente.
                 </p>
              )}
              {activeComponents.map((comp) => (
                <div key={comp.id} className="flex gap-2 items-start bg-white p-3 rounded border border-gray-200 shadow-sm relative">
                  
                  {/* Component Image Thumbnail */}
                  <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                       onClick={() => setEditingCompImageId(comp.id)}>
                      {comp.imageUrl ? (
                        <img src={comp.imageUrl} alt="img" className="w-full h-full object-cover" />
                      ) : (
                        <ImageLucide size={20} className="text-gray-300" />
                      )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Nombre de la pieza"
                      className="block w-full text-sm rounded border-gray-300 px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                      value={comp.name}
                      onChange={(e) => updateComponent(comp.id, 'name', e.target.value)}
                      required
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Código"
                        className="block w-full text-xs rounded border-gray-300 px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-gray-600 bg-gray-50"
                        value={comp.code}
                        onChange={(e) => updateComponent(comp.id, 'code', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 border-l pl-2 border-gray-100">
                    <button
                      type="button"
                      onClick={() => setQrPreview({ code: comp.code, name: comp.name })}
                      className="text-gray-500 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
                      title="Ver QR"
                    >
                      <QrCode size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeComponent(comp.id)}
                      className="text-gray-500 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Popover for Component Image Edit */}
                  {editingCompImageId === comp.id && (
                     <div className="absolute top-14 left-0 z-10 bg-white border border-gray-300 shadow-xl rounded-lg p-3 w-64 animate-in fade-in zoom-in duration-100">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-gray-700">Imagen de Pieza</span>
                           <button onClick={() => setEditingCompImageId(null)}><X size={14}/></button>
                        </div>
                        <div className="space-y-2">
                           <input 
                             type="text" 
                             placeholder="URL de imagen..." 
                             className="w-full text-xs border p-1 rounded"
                             value={comp.imageUrl || ''}
                             onChange={(e) => updateComponent(comp.id, 'imageUrl', e.target.value)}
                           />
                           <div className="text-center text-xs text-gray-400">- O -</div>
                           <input 
                            type="file" 
                            ref={compFileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, true)}
                          />
                           <button 
                             type="button"
                             onClick={() => compFileInputRef.current?.click()}
                             className="w-full bg-gray-100 text-xs py-1 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                           >
                             <ImageIcon size={12}/> Subir Archivo
                           </button>
                        </div>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all font-semibold"
          >
            <Save size={20} />
            GUARDAR PRODUCTO
          </button>
        </div>
      </form>

      {/* QR Code Modal Overlay */}
      {qrPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Código QR</h3>
              <button onClick={() => setQrPreview(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-inner mb-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrPreview.code}`} 
                  alt={`QR ${qrPreview.code}`}
                  className="w-48 h-48"
                />
              </div>
              
              <div className="text-center mb-6">
                <p className="text-2xl font-mono font-bold text-gray-800">{qrPreview.code}</p>
                <p className="text-sm text-gray-500">{qrPreview.name}</p>
              </div>

              <button
                onClick={() => downloadQr(qrPreview.code, qrPreview.name)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
              >
                <Download size={18} /> Descargar Imagen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductForm;