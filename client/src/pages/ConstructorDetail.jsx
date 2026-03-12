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

      <div className="pt-20 pb-16">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-64 md:h-96 overflow-hidden"
          style={{ background: getTeamGradient(team.teamName) }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-f1-dark via-transparent to-black/20" />
          <div className="max-w-7xl mx-auto h-full relative px-4 flex items-end pb-12">
            <div>
              <button onClick={() => navigate('/constructors')} className="text-white/70 hover:text-white text-sm mb-6 flex items-center gap-1">
                ← Back to Teams
              </button>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h1 className="text-5xl md:text-8xl font-black text-white leading-tight uppercase italic">{team.teamName}</h1>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge color="red" className="px-4 py-1 text-sm">{team.wins} Wins</Badge>
                  <Badge color="gold" className="px-4 py-1 text-sm">{team.points} Points</Badge>
                  <Badge color="silver" className="px-4 py-1 text-sm">Est. {team.foundedYear || 2026}</Badge>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Col: Info & Drivers */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatPill label="Base" value={team.base || 'TBD'} icon="🏢" />
                <StatPill label="Principal" value={team.teamPrincipal || 'TBD'} icon="👔" />
                <StatPill label="Power Unit" value={team.powerUnit || 'TBD'} icon="⚙️" />
              </div>

              <Card>
                <SectionHeader title="Team History" subtitle="Legacy & Evolution" />
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                  {team.history || team.bio || 'The historical records for this team are being updated for the 2026 season.'}
                </p>
              </Card>

              <div>
                <SectionHeader title="2026 Driver Lineup" subtitle="The Pilots" />
                <div className="grid sm:grid-cols-2 gap-4">
                  {drivers.map(driver => (
                    <Card 
                      key={driver._id} 
                      className="cursor-pointer hover:border-f1-red/30"
                      onClick={() => navigate(`/drivers/${driver._id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={driver.photoUrl || `https://ui-avatars.com/api/?name=${driver.fullName}`} 
                          alt="" 
                          className="w-16 h-16 rounded-lg object-cover bg-f1-dark ring-1 ring-white/10"
                        />
                        <div>
                          <p className="text-xs text-f1-red font-bold">#{driver.driverNumber || '??'}</p>
                          <h4 className="font-bold text-white text-lg leading-tight">{driver.fullName}</h4>
                          <p className="text-sm text-gray-500">{driver.nationality}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Stats & Achievements */}
            <div className="space-y-8">
              <Card>
                <SectionHeader title="Achievements" subtitle="Wall of Fame" />
                <ul className="space-y-4">
                  {team.achievements && team.achievements.length > 0 ? (
                    team.achievements.map((ach, i) => (
                      <li key={i} className="flex items-start gap-4 text-gray-400 group">
                        <span className="text-f1-gold text-xl group-hover:scale-125 transition-transform shrink-0">🏆</span>
                        <span className="text-sm leading-snug">{ach}</span>
                      </li>
                    ))
                  ) : (
                    <div className="text-center py-8 opacity-30">
                      <p className="text-4xl mb-2">🏁</p>
                      <p className="text-xs italic">Historical milestones pending...</p>
                    </div>
                  )}
                </ul>
              </Card>

              <Button variant="secondary" className="w-full py-4" onClick={() => navigate('/constructors')}>
                Explore Other Teams
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
