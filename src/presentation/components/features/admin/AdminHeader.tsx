import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';

export const AdminHeader: React.FC = () => (
  <div className="flex items-center gap-4 mb-8">
    <Link to="/profile" className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
      <ArrowLeft className="w-5 h-5 text-stone-500" />
    </Link>
    <div>
      <h1 className="text-2xl font-bold text-stone-800">Panel de Administración</h1>
      <p className="text-stone-500 text-sm">Monitoreo del sistema</p>
    </div>
    <div className="ml-auto flex items-center gap-2 text-xs text-stone-400">
      <Activity className="w-4 h-4" />
      <span>En vivo</span>
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
    </div>
  </div>
);
