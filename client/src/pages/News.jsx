import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNews } from '../hooks/useData.jsx';
import { SectionHeader, Card, StatPill, SkeletonCard, Button } from '../components/ui.jsx';

const CATEGORIES = ['All', 'Race Report', 'Team News', 'Technical', 'Rumours', 'Analysis'];

export default function News() {
  const { news, loading } = useNews();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                            item.summary.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [news, search, activeCategory]);

  const featuredNews = filteredNews[0];
  const remainingNews = filteredNews.slice(1);

  return (
    <div className="pt-24 min-h-screen bg-f1-dark text-white">
      <Helmet>
        <title>Intelligence & Analysis | F1 2026</title>
        <meta name="description" content="Latest Formula 1 news, race reports, technical analysis and team updates for the 2026 season" />
        <meta property="og:title" content="Intelligence & Analysis | F1 2026" />
        <meta property="og:description" content="Latest Formula 1 news, race reports and technical analysis" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://f1tracker.app/news" />
        <meta property="og:image" content="https://f1tracker.app/pwa-512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="F1 2026 Intelligence" />
        <meta name="twitter:description" content="Latest Formula 1 news and race analysis" />
        <meta name="twitter:image" content="https://f1tracker.app/pwa-512.png" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <SectionHeader 
          title="Intelligence" 
          subtitle="Strategic analysis and real-time updates from across the grid" 
        />

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between border-b border-white/5 pb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-f1-red text-white shadow-[0_0_15px_rgba(225,6,0,0.4)]' 
                    : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder="SEARCH PROTOCOLS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-f1-red/50 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
            <div className="text-4xl mb-4 opacity-20">📡</div>
            <h3 className="text-xl font-bold uppercase tracking-widest text-gray-500 italic">No intelligence found matching your criteria</h3>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Article */}
            {activeCategory === 'All' && !search && featuredNews && (
              <motion.a
                href={featuredNews.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="block group"
              >
                <Card className="!p-0 overflow-hidden border-f1-red/20 shadow-[0_0_50px_rgba(225,6,0,0.05)] bg-white/[0.02] hover:border-f1-red/40 transition-all">
                  <div className="grid lg:grid-cols-2">
                    <div className="relative h-64 lg:h-auto overflow-hidden">
                      <img 
                        src={featuredNews.imageUrl || 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=1000'} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                      />
                      <div className="absolute top-8 left-8">
                        <span className="px-4 py-1.5 bg-f1-red text-[11px] font-black text-white uppercase tracking-[0.3em] rounded-full shadow-lg pulse">
                          BREAKING
                        </span>
                      </div>
                    </div>
                    <div className="p-12 md:p-16 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-xs font-black text-f1-red tracking-[0.2em] uppercase">{featuredNews.category}</span>
                        <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{new Date(featuredNews.publishedAt).toDateString()}</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold uppercase italic leading-[0.9] mb-8 group-hover:text-f1-red transition-colors">
                        {featuredNews.title}
                      </h2>
                      <p className="text-lg text-gray-400 font-medium leading-relaxed mb-10 max-w-xl">
                        {featuredNews.summary}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-1 bg-f1-red" />
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white group-hover:translate-x-2 transition-transform">Analyze Full Report</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.a>
            )}

            {/* Grid Articles */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(activeCategory === 'All' && !search ? remainingNews : filteredNews).map((item, idx) => (
                <motion.a
                  key={item._id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                  <Card className="h-full border-white/5 bg-white/[0.01] !p-0 overflow-hidden group-hover:border-white/20 transition-all">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=1000'}
                        className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-widest rounded-full border border-white/5">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[9px] font-bold text-f1-red uppercase tracking-widest">{item.source}</span>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <span className="text-[9px] font-medium text-gray-500 uppercase tracking-widest">{new Intl.RelativeTimeFormat('en', { style: 'short' }).format(-Math.round((Date.now() - new Date(item.publishedAt))/3600000), 'hour')}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-4 group-hover:text-f1-red transition-colors italic uppercase leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-3 mb-6">
                        {item.summary}
                      </p>
                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Open Feed</span>
                        <span className="text-f1-red opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">→</span>
                      </div>
                    </div>
                  </Card>
                </motion.a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
