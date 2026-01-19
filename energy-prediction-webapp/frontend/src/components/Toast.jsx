import React, { useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose }) => {
  const bgColors = {
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <AlertCircle size={20} />,
    warning: <AlertCircle size={20} />,
  };

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg border ${bgColors[type]} flex items-center gap-3 animate-slideIn`}>
      {icons[type]}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={18} />
      </button>
    </div>
  );
};
