import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Inventory from './pages/Inventory';
import Dispatch from './pages/Dispatch';
import History from './pages/History';
import { Box, ClipboardCheck, History as HistoryIcon, Dumbbell, Menu, X } from 'lucide-react';

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white border-r border-gray-800">
          <div className="p-6 border-b border-gray-800 flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Dumbbell className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">FITBARZ</h1>
              <p className="text-xs text-gray-500">Control System</p>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <NavLink to="/" icon={<ClipboardCheck size={20} />} label="Despacho & Escaneo" />
            <NavLink to="/inventory" icon={<Box size={20} />} label="Gestión Productos" />
            <NavLink to="/history" icon={<HistoryIcon size={20} />} label="Trazabilidad" />
          </nav>
          
          <div className="p-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">App en v1.0.0 By Franklyn Santos</p>
          </div>
        </aside>

        {/* Mobile Header & Menu Overlay */}
        <div className="md:hidden fixed inset-x-0 top-0 z-40 bg-gray-900 text-white border-b border-gray-800 p-4 flex justify-between items-center">
           <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-md">
                <Dumbbell className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-lg">FITBARZ</span>
           </div>
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-gray-900 pt-20 px-4">
             <nav className="space-y-4">
                <NavLink to="/" icon={<ClipboardCheck size={20} />} label="Despacho & Escaneo" onClick={() => setMobileMenuOpen(false)} />
                <NavLink to="/inventory" icon={<Box size={20} />} label="Gestión Productos" onClick={() => setMobileMenuOpen(false)} />
                <NavLink to="/history" icon={<HistoryIcon size={20} />} label="Trazabilidad" onClick={() => setMobileMenuOpen(false)} />
             </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto md:p-8 p-4 pt-20 md:pt-8 w-full">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dispatch />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </div>
        </main>

      </div>
    </Router>
  );
};

export default App;