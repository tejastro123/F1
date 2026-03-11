import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui.jsx';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Admin Login — F1 2026</title></Helmet>
      <div className="min-h-screen flex items-center justify-center px-4 bg-f1-dark">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white">ADMIN <span className="text-f1-admin">PANEL</span></h1>
            <p className="text-gray-400 mt-1">F1 2026 Season Tracker</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-f1-card rounded-xl border border-white/10 p-6 space-y-4">
            {error && (
              <motion.div
                initial={{ x: -10 }} animate={{ x: [10, -10, 5, -5, 0] }}
                transition={{ duration: 0.4 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1" htmlFor="email">Email</label>
              <input
                id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-f1-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-f1-admin/50"
                required autoFocus aria-label="Email"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1" htmlFor="password">Password</label>
              <input
                id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-f1-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-f1-admin/50"
                required aria-label="Password"
              />
            </div>
            <Button type="submit" variant="admin" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
