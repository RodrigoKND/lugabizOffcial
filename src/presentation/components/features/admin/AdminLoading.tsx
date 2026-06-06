import React from 'react';
import { Loader2 } from 'lucide-react';

export const AdminLoading: React.FC = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
  </div>
);
