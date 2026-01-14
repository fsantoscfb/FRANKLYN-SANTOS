import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Product, ComponentItem, OperatorSession, ProductStatus, DispatchRecord } from '../types';
import Scanner from '../components/Scanner';
import { QrCode, CheckCircle, AlertCircle, Box, User, ClipboardList, ScanLine, Lock, Unlock } from 'lucide-react';

const Dispatch: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [session, setSession] = useState<OperatorSession>({ name: '', employeeId: 'N/A', currentOrderNumber: '' });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemsToScan, setItemsToScan] = useState<ComponentItem[]>([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Products for selection list
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  useEffect(() => {
    setAvailableProducts(storageService.getActiveProducts());
  }, []);

  // Check if current user is the Super User "FS"
  const isSuperUser = session.name.trim().toUpperCase() === 'FS';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Employee ID is no longer required in the form, just Name and Order
    if (session.name && session.currentOrderNumber) {
      setStep(2);
    }
  };

  const handleProductSelect = (product: Product) => {
    const activeComponents = product.components.filter(c => c.status === ProductStatus.ACTIVE).map(c => ({
      ...c,
      scanned: false
    }));
    
    if (activeComponents.length === 0) {
      alert("Este producto no tiene componentes definidos. Edítelo en inventario primero.");
      return;
    }

    setSelectedProduct(product);
    setItemsToScan(activeComponents);
    setScannedCount(0);
    setStep(3);
  };

  const handleScan = (code: string) => {
    if (!selectedProduct) return;

    // Find if the code matches a pending item
    const itemIndex = itemsToScan.findIndex(
      item => (item.code === code || item.name === code) && !item.scanned
    );

    if (itemIndex >= 0) {
      confirmItemScanned(itemIndex);
      // Close scanner momentarily to show progress/feedback
      setIsScannerOpen(false);
    } else {
      alert(`Código inválido o ya escaneado: ${code}`);
      setIsScannerOpen(false);
    }
  };

  const confirmItemScanned = (index: number) => {
    const newItems = [...itemsToScan];
    newItems[index].scanned = true;
    setItemsToScan(newItems);
    setScannedCount(prev => prev + 1);
  };

  // Manual toggle ONLY for FS user
  const handleManualToggle = (id: string) => {
    if (!isSuperUser) return; // Strict guard
    
    const index = itemsToScan.findIndex(i => i.id === id);
    if (index >= 0 && !itemsToScan[index].scanned) {
      if (confirm(`Usuario FS: ¿Confirmar manualmente la pieza ${itemsToScan[index].name}?`)) {
        confirmItemScanned(index);
      }
    }
  };

  const isComplete = itemsToScan.length > 0 && itemsToScan.every(i => i.scanned);

  const finalizeDispatch = () => {
    if (!selectedProduct || !isComplete) return;

    const record: DispatchRecord = {
      id: Date.now().toString(),
      orderNumber: session.currentOrderNumber,
      operatorName: session.name,
      operatorId: session.employeeId, // Defaults to N/A
      productName: selectedProduct.name,
      productCode: selectedProduct.code,
      scannedItems: itemsToScan,
      timestamp: new Date().toISOString()
    };

    storageService.saveDispatchLog(record);
    setShowSuccess(true);
    
    // Reset after delay
    setTimeout(() => {
      setShowSuccess(false);
      setStep(2); // Go back to product selection, keep login
      setSelectedProduct(null);
      setItemsToScan([]);
    }, 3000);
  };

  // STEP 1: LOGIN
  if (step === 1) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 mt-10">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600">
            <User size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Inicio de Despacho</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Operador</label>
            <input
              type="text"
              required
              placeholder="Ingrese su nombre (ej. FS)"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={session.name}
              onChange={e => setSession({ ...session, name: e.target.value })}
            />
          </div>
          {/* Employee ID removed as requested */}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de Pedido</label>
            <input
              type="text"
              required
              placeholder="Ej. ORD-2023-001"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={session.currentOrderNumber}
              onChange={e => setSession({ ...session, currentOrderNumber: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            COMENZAR SESIÓN
          </button>
        </form>
      </div>
    );
  }

  // STEP 2: SELECT PRODUCT
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Seleccionar Máquina</h2>
            <p className="text-gray-500">
              Operador: <span className="font-bold">{session.name}</span> | 
              Pedido: <span className="font-mono text-blue-600 font-bold">{session.currentOrderNumber}</span>
            </p>
          </div>
          <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">Cambiar Datos</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableProducts.map(product => (
            <button
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className="group flex flex-col text-left bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="h-40 w-full overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4 w-full">
                <h3 className="font-bold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500 font-mono">{product.code}</p>
                <div className="mt-2 flex items-center text-xs text-blue-600">
                  <Box size={14} className="mr-1" />
                  {product.components.length} piezas para escanear
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // SUCCESS SCREEN OVERLAY
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
        <div className="text-center animate-bounce">
          <CheckCircle size={80} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">¡Despacho Completo!</h2>
          <p className="text-gray-600 mt-2">Registro guardado exitosamente.</p>
        </div>
      </div>
    );
  }

  // STEP 3: SCANNING
  const progress = Math.round((scannedCount / itemsToScan.length) * 100);

  return (
    <div className="space-y-6">
      <Scanner 
        active={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScan={handleScan} 
      />

      {/* Header Info */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
             <ClipboardList size={16} />
             Pedido: {session.currentOrderNumber}
             {isSuperUser && (
               <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded flex items-center gap-1">
                 <Unlock size={10} /> MODO MANUAL (FS)
               </span>
             )}
           </div>
           <h2 className="text-xl font-bold text-gray-800">{selectedProduct?.name}</h2>
           <p className="font-mono text-gray-500">{selectedProduct?.code}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Progreso del Kit</div>
          <div className="text-2xl font-bold text-blue-600">{scannedCount} / {itemsToScan.length}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 sticky top-4 z-20">
        {!isComplete ? (
          <div className="flex gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex-1 bg-black text-white py-4 rounded-xl shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-lg font-bold"
            >
              <QrCode size={24} />
              USAR CÁMARA
            </button>
          </div>
        ) : (
          <button
            onClick={finalizeDispatch}
            className="w-full bg-green-600 text-white py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-lg font-bold animate-pulse"
          >
            <CheckCircle size={24} />
            FINALIZAR DESPACHO
          </button>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 font-medium text-gray-700 flex justify-between items-center">
          <span>Lista de Piezas Requeridas</span>
          {isSuperUser ? (
             <span className="text-xs text-purple-600 font-normal">Toque una pieza para validar manualmente</span>
          ) : (
             <span className="text-xs text-gray-400 font-normal flex items-center gap-1"><Lock size={12}/> Escaneo Obligatorio</span>
          )}
        </div>
        <div className="divide-y divide-gray-100">
          {itemsToScan.map(item => (
            <div 
              key={item.id} 
              onClick={() => handleManualToggle(item.id)}
              className={`
                p-4 flex items-center justify-between transition-colors
                ${item.scanned ? 'bg-green-50' : 'bg-white'}
                ${isSuperUser && !item.scanned ? 'cursor-pointer hover:bg-purple-50 active:bg-purple-100' : ''}
                ${!isSuperUser && !item.scanned ? 'opacity-90' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center 
                  ${item.scanned ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
                `}>
                  {item.scanned ? <CheckCircle size={18} /> : <ScanLine size={18} />}
                </div>
                <div>
                  <p className={`font-medium ${item.scanned ? 'text-green-800' : 'text-gray-800'}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{item.code}</p>
                </div>
              </div>
              <div className="text-sm">
                {item.scanned ? (
                  <span className="text-green-600 font-bold px-2 py-1 bg-green-100 rounded text-xs">OK</span>
                ) : (
                  <span className={`font-medium px-2 py-1 rounded text-xs flex items-center gap-1 ${isSuperUser ? 'text-purple-600 bg-purple-50' : 'text-orange-500 bg-orange-50'}`}>
                    <AlertCircle size={12} /> {isSuperUser ? 'Manual / Pend.' : 'Escanear'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button onClick={() => setStep(2)} className="text-gray-500 text-sm w-full text-center hover:text-gray-700 mt-4">
        Cancelar y volver a selección
      </button>
    </div>
  );
};

export default Dispatch;