import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import api from '../services/api.js';
import { Card, Button, StatPill, SectionHeader, SkeletonCard, Badge } from '../components/ui.jsx';
import { getTeamGradient } from '../utils/teamColors.js';

export default function ConstructorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, driversRes] = await Promise.all([
          api.get(`/constructors/${id}`),
          api.get('/drivers')
        ]);
        setTeam(teamRes.data);
        // Filter drivers belonging to this team
        setDrivers(driversRes.data.filter(d => d.team === teamRes.data.teamName));
      } catch {
        navigate('/constructors');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto"><SkeletonCard /><SkeletonCard /></div>;
  if (!team) return null;

  return (
    <>
      <Helmet>
        <title>{team.teamName} — F1 2026 Team Profile</title>
        <meta name="description" content={`${team.teamName} - Formula 1 Team profile, history and 2026 driver lineup.`} />
      </Helmet>

      <div className="pt-16 pb-16 overflow-x-hidden">
        {/* Elite Constructor Hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative min-h-[350px] md:min-h-[500px] flex items-end overflow-hidden"
          style={{ background: getTeamGradient(team.teamName) }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-f1-dark via-f1-dark/20 to-transparent z-10" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent z-10" />
          
          <div className="max-w-7xl mx-auto w-full relative z-20 px-8 pb-16">
            <div className="space-y-8">
              <button 
                onClick={() => navigate('/constructors')} 
                className="group flex items-center gap-3 text-[10px] font-black text-white/50 uppercase tracking-[0.3em] hover:text-f1-red transition-colors"
              >
                <span className="w-8 h-[2px] bg-white/20 group-hover:bg-f1-red transition-all" />
                Constructor Grid
              </button>
              
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <h1 className="text-6xl md:text-[10rem] font-black text-white leading-[0.8] uppercase italic tracking-tighter drop-shadow-2xl mb-8">
                  {team.teamName}
                </h1>
                <div className="flex flex-wrap gap-4">
                  <Badge color="red" className="!rounded-lg !px-5 !py-2 font-black text-xs uppercase tracking-widest">{team.wins} Victories</Badge>
                  <Badge color="gold" className="!rounded-lg !px-5 !py-2 font-black text-xs uppercase tracking-widest">{team.points} Points Gained</Badge>
                  <Badge color="silver" className="!rounded-lg !px-5 !py-2 font-black text-xs uppercase tracking-widest border border-white/10">Est. {team.foundedYear || 2026}</Badge>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 text-[20rem] font-black italic text-white/5 pointer-events-none select-none">
             {team.teamName.charAt(0)}
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-8 -mt-10 relative z-30">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Left: Info & Lineup */}
            <div className="lg:col-span-2 space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: 'HEADQUARTERS', value: team.base || 'TBD', icon: '🏢' },
                  { label: 'TEAM PRINCIPAL', value: team.teamPrincipal || 'TBD', icon: '👔' },
                  { label: 'POWER UNIT', value: team.powerUnit || 'TBD', icon: '⚙️' },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
                    <Card glass className="p-6 text-center border-white/5 rounded-[2rem] shadow-xl">
                       <div className="text-[7px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">{s.label}</div>
                       <div className="text-lg font-black text-white uppercase italic tracking-tighter leading-tight">{s.value}</div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card glass className="rounded-[3rem] p-12 border-white/5 bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-f1-red" /> LEGACY & EVOLUTION
                </h3>
                <p className="text-gray-400 text-xl leading-relaxed italic font-medium whitespace-pre-line">
                  {team.history || team.bio || 'The historical records for (teamName) are being secured for the 2026 season championship launch.'}
                </p>
              </Card>

              <div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-f1-red" /> 2026 ELITE PILOTS
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {drivers.map((driver, i) => (
                    <motion.div
                      key={driver._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      <Card 
                        glass
                        className="p-6 rounded-[2.5rem] cursor-pointer border-white/5 hover:border-f1-red/30 transition-all group"
                        onClick={() => navigate(`/drivers/${driver._id}`)}
                      >
                        <div className="flex items-center gap-6">
                          <img 
                            src={driver.photoUrl || `https://ui-avatars.com/api/?name=${driver.fullName}`} 
                            alt="" 
                            className="w-20 h-20 rounded-2xl object-cover bg-f1-dark ring-2 ring-white/5 group-hover:ring-f1-red/50 transition-all"
                          />
                          <div>
                            <p className="text-3xl font-black text-white/10 italic leading-none mb-1">#{driver.driverNumber || '??'}</p>
                            <h4 className="font-black text-xl text-white uppercase italic tracking-tighter leading-tight group-hover:text-f1-red transition-colors">{driver.fullName}</h4>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">{driver.nationality}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Achievements */}
            <div className="space-y-12">
              <Card glass className="rounded-[3.5rem] p-10 border-white/5 bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-10">Wall of Glory</h3>
                <div className="space-y-6">
                  {team.achievements && team.achievements.length > 0 ? (
                    team.achievements.map((ach, i) => (
                      <div key={i} className="flex items-start gap-4 group">
                        <span className="text-f1-gold text-2xl group-hover:scale-125 transition-transform shrink-0 drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]">🏆</span>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose pt-1">{ach}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 opacity-20">
                      <p className="text-6xl mb-4 grayscale">🏁</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Empty Trophy Cabinet</p>
                    </div>
                  )}
                </div>
              </Card>

              <Button variant="outline" className="w-full py-6 !rounded-[2rem] shadow-xl" onClick={() => navigate('/constructors')}>
                BACK TO GRID GRID
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
