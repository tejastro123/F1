import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api.js';
import { getAccessToken } from '../services/api.js';
import { Card, SectionHeader, AnimatedCounter, Badge, SkeletonCard } from '../components/ui.jsx';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [drivers, constructors, races, predictions] = await Promise.all([
          api.get('/drivers'), api.get('/constructors'), api.get('/races'), api.get('/predictions'),
        ]);
        setData({
          drivers: drivers.data.length,
          constructors: constructors.data.length,
          races: races.data.length,
          racesCompleted: races.data.filter(r => r.status === 'completed').length,
          predictions: predictions.data.length,
        });
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const response = await api.get('/admin/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'F1_2026_PRO.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, []);

  const links = [
    { to: '/admin/upload', label: 'Upload Excel', icon: '📤', desc: 'Upload new data file' },
    { to: null, label: downloading ? 'Downloading…' : 'Download Excel', icon: '📥', desc: 'Download current data file', onClick: handleDownload },
    { to: '/admin/races', label: 'Manage Races', icon: '🏁', desc: 'Edit race results' },
    { to: '/admin/drivers', label: 'Manage Drivers', icon: '🏎', desc: 'Edit driver stats' },
    { to: '/admin/predictions', label: 'Predictions', icon: '🎯', desc: 'Mark predictions' },
    { to: '/admin/broadcast', label: 'Broadcast', icon: '📡', desc: 'Send live updates' },
  ];

  return (
    <>
      <Helmet><title>Admin Dashboard — F1 2026</title></Helmet>
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader title="Admin Dashboard" subtitle="F1 2026 Data Management" />

        {loading ? (
          <div className="grid md:grid-cols-4 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        ) : data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Drivers', value: data.drivers, color: 'text-f1-admin' },
              { label: 'Constructors', value: data.constructors, color: 'text-f1-gold' },
              { label: 'Races', value: data.races, color: 'text-green-400' },
              { label: 'Predictions', value: data.predictions, color: 'text-blue-400' },
            ].map((s) => (
              <Card key={s.label} className="text-center">
                <div className={`text-3xl font-black ${s.color}`}><AnimatedCounter value={s.value} /></div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </Card>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link, i) => {
            const cardContent = (
              <>
                <div className="text-3xl mb-3">{link.icon}</div>
                <h3 className="font-bold text-white group-hover:text-f1-admin transition-colors">{link.label}</h3>
                <p className="text-sm text-gray-400 mt-1">{link.desc}</p>
              </>
            );
            return (
              <motion.div key={link.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                {link.to ? (
                  <Link to={link.to} className="block bg-f1-card rounded-xl border border-white/5 p-6 hover:border-f1-admin/30 transition-colors group">
                    {cardContent}
                  </Link>
                ) : (
                  <button onClick={link.onClick} className="block w-full text-left bg-f1-card rounded-xl border border-white/5 p-6 hover:border-f1-admin/30 transition-colors group cursor-pointer">
                    {cardContent}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
