import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api.js';
import { Card, Button, SectionHeader, SkeletonLoader } from '../components/ui.jsx';
import { getTeamColor } from '../utils/teamColors.js';

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/drivers');
        setDrivers(data);
      } catch { /* */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const startEdit = (driver) => {
    setEditing(driver._id);
    setForm({ points: driver.points, wins: driver.wins, podiums: driver.podiums });
  };

  const save = async (id) => {
    try {
      const { data } = await api.patch(`/admin/drivers/${id}`, {
        points: parseInt(form.points), wins: parseInt(form.wins), podiums: parseInt(form.podiums),
      });
      setDrivers(prev => prev.map(d => d._id === id ? data : d));
      setEditing(null);
    } catch { /* */ }
  };

  return (
    <>
      <Helmet><title>Manage Drivers — F1 2026 Admin</title></Helmet>
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <SectionHeader title="Manage Drivers" subtitle="Edit driver points, wins, and podiums" />

        {loading ? <SkeletonLoader lines={10} /> : (
          <div className="space-y-2">
            {drivers.map((driver) => (
              <Card key={driver._id} hover={false} className="!p-3">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: getTeamColor(driver.team) }} />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-white">{driver.fullName}</span>
                    <span className="text-sm ml-2" style={{ color: getTeamColor(driver.team) }}>{driver.team}</span>
                  </div>

                  {editing === driver._id ? (
                    <div className="flex items-center gap-2">
                      {['points', 'wins', 'podiums'].map(field => (
                        <div key={field} className="text-center">
                          <div className="text-[10px] text-gray-500 uppercase">{field}</div>
                          <input
                            type="number"
                            value={form[field]}
                            onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                            className="w-16 bg-f1-dark border border-white/10 rounded px-2 py-1 text-sm text-white text-center"
                            aria-label={field}
                          />
                        </div>
                      ))}
                      <Button variant="admin" size="sm" onClick={() => save(driver._id)}>Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>✕</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-center"><div className="text-[10px] text-gray-500">PTS</div><div className="font-bold">{driver.points}</div></div>
                      <div className="text-center"><div className="text-[10px] text-gray-500">W</div><div className="font-bold">{driver.wins}</div></div>
                      <div className="text-center"><div className="text-[10px] text-gray-500">POD</div><div className="font-bold">{driver.podiums}</div></div>
                      <Button variant="secondary" size="sm" onClick={() => startEdit(driver)}>Edit</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
