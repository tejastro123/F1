import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api.js';
import { Card, SectionHeader, Button, StatPill } from '../components/ui.jsx';

export default function AdminLiveControl() {
  const [poll, setPoll] = useState({ question: '', options: ['', ''] });
  const [commentary, setCommentary] = useState({ type: 'COMMENTARY', message: '', driver: '', sector: '' });
  const [conditions, setConditions] = useState({ airTemp: 24, trackTemp: 38, humidity: 45, rainProb: 10, status: 'DRY' });
  const [submitting, setSubmitting] = useState(false);

  // Poll Management
  const addOption = () => setPoll(prev => ({ ...prev, options: [...prev.options, ''] }));
  const updateOption = (idx, val) => {
    const opts = [...poll.options];
    opts[idx] = val;
    setPoll(prev => ({ ...prev, options: opts }));
  };
  const createPoll = async () => {
    try {
      setSubmitting(true);
      await api.post('/live/polls', { ...poll, options: poll.options.map(o => ({ text: o })) });
      alert('Poll created!');
    } catch (err) { alert(err.response?.data?.error); } finally { setSubmitting(false); }
  };

  // Commentary
  const postUpdate = async () => {
    try {
      setSubmitting(true);
      await api.post('/live/updates', commentary);
      setCommentary({ ...commentary, message: '' });
    } catch { /* */ } finally { setSubmitting(false); }
  };

  // Track Conditions
  const updateTrack = async () => {
    try {
      setSubmitting(true);
      await api.post('/live/track-condition', conditions);
      alert('Track status updated!');
    } catch { /* */ } finally { setSubmitting(false); }
  };

  return (
    <>
      <Helmet><title>Live Control Center — F1 Admin</title></Helmet>
      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <SectionHeader title="Live Control Center" subtitle="Manage polls, commentary, and track status in real-time" />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Commentary Control */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-black text-white mb-4 uppercase">Direct Commentary</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {['COMMENTARY', 'YELLOW_FLAG', 'RED_FLAG', 'PURPLE_SECTOR'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setCommentary(prev => ({ ...prev, type: t }))}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all ${commentary.type === t ? 'bg-f1-red border-f1-red text-white' : 'border-white/10 text-gray-500'}`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <input 
                  placeholder="Driver Name (Optional)"
                  className="w-full bg-f1-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-f1-red"
                  value={commentary.driver}
                  onChange={e => setCommentary(prev => ({ ...prev, driver: e.target.value }))}
                />
                <textarea 
                  placeholder="Live Update Message..."
                  className="w-full bg-f1-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-f1-red min-h-[100px]"
                  value={commentary.message}
                  onChange={e => setCommentary(prev => ({ ...prev, message: e.target.value }))}
                />
                <Button variant="primary" className="w-full" onClick={postUpdate} disabled={submitting}>Blast to All Users</Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-black text-white mb-4 uppercase">Track Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Air Temp</label>
                  <input type="number" className="w-full bg-f1-dark border border-white/10 rounded-lg px-4 py-2 text-white" value={conditions.airTemp} onChange={e => setConditions(prev => ({ ...prev, airTemp: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Track Temp</label>
                  <input type="number" className="w-full bg-f1-dark border border-white/10 rounded-lg px-4 py-2 text-white" value={conditions.trackTemp} onChange={e => setConditions(prev => ({ ...prev, trackTemp: e.target.value }))} />
                </div>
              </div>
              <div className="mt-4 flex gap-4">
                <button 
                  onClick={() => setConditions(prev => ({ ...prev, status: prev.status === 'DRY' ? 'WET' : 'DRY' }))}
                  className={`flex-1 font-black py-2 rounded-xl border transition-all ${conditions.status === 'WET' ? 'bg-f1-primary border-f1-primary text-f1-primary bg-opacity-10' : 'border-white/10 text-white'}`}
                >
                  {conditions.status}
                </button>
                <Button variant="secondary" className="flex-1" onClick={updateTrack} disabled={submitting}>Update Conditions</Button>
              </div>
            </Card>
          </div>

          {/* Poll Management */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-black text-white mb-4 uppercase text-f1-gold">Live Poll Control</h3>
              <div className="space-y-4">
                <input 
                  placeholder="Poll Question..."
                  className="w-full bg-f1-dark border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                  value={poll.question}
                  onChange={e => setPoll(prev => ({ ...prev, question: e.target.value }))}
                />
                {poll.options.map((opt, idx) => (
                  <input 
                    key={idx}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full bg-f1-dark border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                    value={opt}
                    onChange={e => updateOption(idx, e.target.value)}
                  />
                ))}
                <button onClick={addOption} className="text-xs text-f1-gold font-bold uppercase hover:underline">+ Add Option</button>
                <Button variant="gold" className="w-full" onClick={createPoll} disabled={submitting}>Launch Live Poll</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
