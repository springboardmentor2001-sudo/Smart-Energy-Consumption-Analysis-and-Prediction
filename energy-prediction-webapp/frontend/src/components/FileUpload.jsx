import React, { useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';

export const FileUpload = ({ onFileSelect, accept = '.csv,.pdf,.txt' }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
        isDragging
          ? 'border-blue-400 bg-blue-500/10'
          : 'border-slate-600 hover:border-slate-500'
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <Upload size={40} className="mx-auto mb-4 text-blue-400" />
      <p className="text-lg font-semibold mb-2">
        {fileName || 'Drag and drop your file'}
      </p>
      <p className="text-slate-400 text-sm">
        or click to select (CSV, PDF, TXT)
      </p>
      {fileName && (
        <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
          <FileText size={20} />
          <span>{fileName}</span>
        </div>
      )}
    </div>
  );
};
