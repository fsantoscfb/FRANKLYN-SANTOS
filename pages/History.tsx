import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { DispatchRecord } from '../types';
import { FileText, Calendar, User, Package, Download, Upload, ShieldCheck, Database, Save } from 'lucide-react';

const History: React.FC = () => {
  const [logs, setLogs] = useState<DispatchRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogs(storageService.getDispatchLogs());
  }, []);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleDownloadBackup = () => {
    const json = storageService.createBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `Fitbarz_Backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Copia de seguridad generada. Por favor guarde este archivo en su Google Drive (fsantoscfb@gmail.com) para cumplir con el protocolo de seguridad.');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('ADVERTENCIA: Restaurar una copia de seguridad sobrescribirá los datos actuales. ¿Desea continuar?')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storageService.restoreBackup(content)) {
        alert('Datos restaurados exitosamente. La página se recargará.');
        window.location.reload();
      } else {
        alert('Error al restaurar el archivo. Formato inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      
      {/* Backup / Persistence Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600 rounded-lg">
               <Database size={24} />
             </div>
             <div>
               <h2 className="text-xl font-bold">Gestión de Datos y Copias de Seguridad</h2>
               <p className="text-gray-300 text-sm">Respaldo manual a Google Drive requerido (fsantoscfb@gmail.com)</p>
             </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handleDownloadBackup}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-lg"
            >
              <Download size={18} />
              Crear Backup
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-600"
            >
              <Upload size={18} />
              Restaurar
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json"
              onChange={handleRestoreBackup}
            />
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-2 text-xs text-gray-400">
          <ShieldCheck size={14} className="text-green-400"/>
          <span>Sistema persistente. Los datos no se eliminan físicamente. Imágenes enlazadas o Base64.</span>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="text-blue-600" /> 
          Historial de Despachos
        </h1>
        <p className="text-gray-500 mt-1">Registro inmutable de todas las salidas de inventario.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-4">Fecha / Hora</th>
                <th className="px-6 py-4">Pedido</th>
                <th className="px-6 py-4">Operador</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4 text-center">Piezas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No hay registros de despachos aún.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold font-mono">
                        {log.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">{log.operatorName}</span>
                        <span className="text-xs text-gray-400">ID: {log.operatorId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex flex-col">
                        <span className="text-sm text-gray-800">{log.productName}</span>
                        <span className="text-xs text-gray-400 font-mono">{log.productCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                        {log.scannedItems.length} Escaneadas
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;