import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api.js';
import { Card, Button, Badge, SectionHeader, SkeletonLoader } from '../components/ui.jsx';

export default function AdminRaces() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/races');
        setRaces(data);
      } catch { /* */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const startEdit = (race) => {
    setEditing(race._id);
    setForm({ p1Winner: race.p1Winner || '', p2: race.p2 || '', p3: race.p3 || '', sprintWinner: race.sprintWinner || '', status: race.status });
  };

  const save = async (id) => {
    try {
      const { data } = await api.patch(`/admin/races/${id}`, form);
      setRaces(prev => prev.map(r => r._id === id ? data : r));
      setEditing(null);
    } catch { /* */ }
  };

  return (
    <>
      <Helmet><title>Manage Races — F1 2026 Admin</title></Helmet>
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <SectionHeader title="Manage Races" subtitle="Edit race results and status" />

        {loading ? <SkeletonLoader lines={10} /> : (
          <div className="space-y-3">
            {races.map((race) => (
              <Card key={race._id} hover={false} className="!p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <span className="text-xs font-bold bg-f1-dark px-2 py-1 rounded">R{race.round}</span>
                    <span className="text-lg">{race.flag}</span>
                    <span className="font-medium">{race.grandPrixName}</span>
                  </div>

                  {editing === race._id ? (
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2">
                      {['p1Winner', 'p2', 'p3', 'sprintWinner'].map(field => (
                        <input
                          key={field}
                          value={form[field]}
                          onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                          placeholder={field}
                          className="bg-f1-dark border border-white/10 rounded px-2 py-1.5 text-sm text-white"
                          aria-label={field}
                        />
                      ))}
                      <select
                        value={form.status}
                        onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                        className="bg-f1-dark border border-white/10 rounded px-2 py-1.5 text-sm text-white"
                        aria-label="Status"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center gap-4 text-sm text-gray-400">
                      <span>P1: <span className="text-white">{race.p1Winner || '—'}</span></span>
                      <span>P2: <span className="text-white">{race.p2 || '—'}</span></span>
                      <span>P3: <span className="text-white">{race.p3 || '—'}</span></span>
                      <Badge color={race.status === 'completed' ? 'green' : 'orange'}>{race.status}</Badge>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editing === race._id ? (
                      <>
                        <Button variant="admin" size="sm" onClick={() => save(race._id)}>Save</Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                      </>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => startEdit(race)}>Edit</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
