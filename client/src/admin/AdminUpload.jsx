import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import api from '../services/api.js';
import { Card, Button, SectionHeader } from '../components/ui.jsx';

export default function AdminUpload() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) setFile(f);
    else setError('Please upload an Excel file (.xlsx)');
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError(''); setResults(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(data.results);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <>
      <Helmet><title>Upload Data — F1 2026 Admin</title></Helmet>
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <SectionHeader title="Upload Excel" subtitle="Upload F1_2026_PRO.xlsx to update all data" />

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
            dragging ? 'border-f1-admin bg-f1-admin/5' : 'border-white/10 hover:border-white/20'
          }`}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input id="fileInput" type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
          <div className="text-4xl mb-3">📤</div>
          {file ? (
            <p className="text-white font-medium">{file.name} <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span></p>
          ) : (
            <p className="text-gray-400">Drag & drop your Excel file here, or click to browse</p>
          )}
        </div>

        {error && <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}

        {file && (
          <div className="mt-4 flex justify-center">
            <Button variant="admin" onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading & Seeding...' : 'Upload & Seed Database'}
            </Button>
          </div>
        )}

        {results && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <Card>
              <h3 className="font-bold text-lg mb-4 text-green-400">✓ Seed Complete</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(results).map(([key, val]) => (
                  <div key={key} className="bg-f1-dark rounded-lg p-3">
                    <div className="text-sm font-bold text-white capitalize">{key}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Added: {val.added} · Updated: {val.updated}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </>
  );
}
