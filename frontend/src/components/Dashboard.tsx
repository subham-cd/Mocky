import { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Activity, Target, Zap, Clock, ExternalLink, TrendingUp, ChevronRight, Info, Brain, Sparkles, LayoutGrid, CheckCircle2, AlertCircle, HelpCircle, Trash2, X, ShieldCheck, Terminal, FileText, UserCheck, Star } from 'lucide-react';
import { useCareerStore } from '../store/useCareerStore';
import { useHydration } from '../hooks/useHydration';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim();
  const hydrated = useHydration();
  const { 
    sessions, atsResult, interviewReport, targetRole, 
    setTargetRole, getCareerHealth, resumeData, deleteSession
  } = useCareerStore();

  const [skillMatrix, setSkillMatrix] = useState<any[]>([]);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [showReadinessDetail, setShowReadinessModal] = useState(false);
  const [moduleRatings, setModuleRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchMatrix = async () => {
      if (!resumeData?.skills || resumeData.skills.length === 0) return;
      setLoadingMatrix(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/resume/skill-matrix`, {
          skills: resumeData.skills,
          target_role: targetRole
        });
        setSkillMatrix(response.data.matrix || []);
      } catch (err) {
        console.error("Matrix Error:", err);
      } finally {
        setLoadingMatrix(false);
      }
    };

    const fetchStats = async () => {
       try {
          const res = await axios.get(`${API_BASE_URL}/feedback/stats`);
          setModuleRatings(res.data.avg_ratings || {});
       } catch (err) {
          console.error("Stats Error:", err);
       }
    };

    if (hydrated) {
      fetchStats();
      if (resumeData) fetchMatrix();
    }
  }, [resumeData, targetRole, hydrated]);

  if (!hydrated) return <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-500 animate-pulse">Neural Synchronization...</div>;

  const isGuest = !resumeData;
  const healthScore = getCareerHealth();
  const latestSession = sessions[0] || null;
  const healthColor = healthScore >= 75 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444';

  const subScores = {
    interview: interviewReport?.overall_score || (isGuest ? 65 : 0),
    ats: atsResult?.ats_score || (isGuest ? 45 : 0),
    coding: sessions.filter(s => s.type === 'coding').length > 0 
      ? Math.round(sessions.filter(s => s.type === 'coding').reduce((a, b) => a + (b.interview_score || 0), 0) / sessions.filter(s => s.type === 'coding').length)
      : (isGuest ? 50 : 0),
    profile: resumeData ? 100 : 40
  };

  const radarData = [
    { subject: 'Technical', score: latestSession?.radar_scores?.technical_depth ?? interviewReport?.dimension_scores?.technical_depth ?? (isGuest ? 60 : 0) },
    { subject: 'Communication', score: latestSession?.radar_scores?.communication ?? interviewReport?.dimension_scores?.communication ?? (isGuest ? 70 : 0) },
    { subject: 'Problem Solving', score: latestSession?.radar_scores?.problem_solving ?? interviewReport?.dimension_scores?.problem_solving ?? (isGuest ? 65 : 0) },
    { subject: 'Confidence', score: latestSession?.radar_scores?.confidence ?? interviewReport?.dimension_scores?.confidence ?? (isGuest ? 80 : 0) },
    { subject: 'Relevance', score: latestSession?.radar_scores?.relevance ?? interviewReport?.dimension_scores?.relevance ?? (isGuest ? 50 : 0) },
  ];

  const lineData = [...sessions]
    .reverse()
    .filter(s => (s.ats_score !== undefined && s.ats_score > 0) || (s.interview_score !== undefined && s.interview_score > 0))
    .map(s => ({ date: s.date, score: s.ats_score || s.interview_score || 0 }));

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'strong': return { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
      case 'partial': return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
      case 'gap': return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
      default: return { color: 'text-gray-500', bg: 'bg-white/5', border: 'border-white/5' };
    }
  };

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex gap-1 items-center">
         {[1, 2, 3, 4].map(i => (
           <Star key={i} size={10} className={i <= Math.round(rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700'} />
         ))}
         <span className="text-[8px] font-black text-gray-500 ml-1">{rating || '0.0'}</span>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Readiness Breakdown Modal */}
      <AnimatePresence>
        {showReadinessDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowReadinessModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0c10] border border-white/10 rounded-[3rem] p-12 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />
              <button onClick={() => setShowReadinessModal(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>

              <div className="space-y-10">
                <div className="text-center">
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Neural Readiness Engine</h2>
                   <p className="text-gray-400 text-sm font-medium">Detailed breakdown of your hiring probability index.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                     { label: 'Interview Logic', score: subScores.interview, weight: '40%', icon: <Activity className="text-purple-500" />, desc: 'Voice confidence and technical depth' },
                     { label: 'ATS Alignment', score: subScores.ats, weight: '30%', icon: <Target className="text-blue-500" />, desc: 'Resume keyword match vs market' },
                     { label: 'Coding Efficiency', score: subScores.coding, weight: '20%', icon: <Terminal className="text-green-500" />, desc: 'Algorithmic Big-O performance' },
                     { label: 'Profile Integrity', score: subScores.profile, weight: '10%', icon: <ShieldCheck className="text-yellow-500" />, desc: 'Completeness of professional data' }
                   ].map((item) => (
                     <div key={item.label} className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-start">
                           <div className="p-3 bg-white/5 rounded-2xl">{item.icon}</div>
                           <div className="text-right">
                              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-1">Weight: {item.weight}</span>
                              <span className="text-xl font-black text-white">{item.score}%</span>
                           </div>
                        </div>
                        <div>
                           <h4 className="text-xs font-black text-gray-200 uppercase mb-1">{item.label}</h4>
                           <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500/50" style={{ width: `${item.score}%` }} />
                        </div>
                     </div>
                   ))}
                </div>

                <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] text-center">
                   <p className="text-sm font-medium text-blue-300 italic leading-relaxed">
                      "Your Hiring Readiness is a composite metric. To increase it, we recommend focusing on <span className="text-white font-black">{subScores.ats < subScores.interview ? 'Resume Optimization' : 'Interview Practice'}</span> to move the needle faster."
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
         {isGuest && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/50 via-orange-500/50 to-yellow-500/50 animate-pulse"></div>}
         <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
               {isGuest ? "Mission Control" : "Command Center"}
            </h1>
            <p className="text-gray-400 text-xs font-medium tracking-wide text-center md:text-left leading-relaxed">
               {isGuest ? "System in Simulation Mode. Data accuracy restricted." : "Real-time analysis of your professional trajectory."}
            </p>
         </div>
         <div className="flex items-center gap-4">
            {!isGuest && (
              <button 
                onClick={() => onNavigate('report')}
                className="px-6 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl flex items-center gap-3 group"
              >
                <FileText size={16} className="group-hover:rotate-12 transition-transform" />
                Master Report
              </button>
            )}
            <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 group hover:border-blue-500/50 transition-all shrink-0">
               <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2">Targeting</div>
               <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="bg-transparent border-none p-0 text-sm font-black text-white cursor-pointer focus:ring-0">
                 <option className="bg-gray-900">Software Engineer</option>
                 <option className="bg-gray-900">Data Analyst</option>
                 <option className="bg-gray-900">Product Manager</option>
                 <option className="bg-gray-900">DevOps Engineer</option>
               </select>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Readiness Score - ENHANCED & INTERACTIVE */}
         <button 
           onClick={() => setShowReadinessModal(true)}
           className="glass-card p-10 rounded-[3rem] flex flex-col items-center justify-center text-center group relative overflow-hidden text-left hover:scale-[1.02] active:scale-95 transition-all outline-none"
         >
            <div className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000" style={{ background: `radial-gradient(circle at center, ${isGuest ? '#f59e0b' : healthColor} 0%, transparent 70%)` }}></div>
            
            <div className="w-full flex justify-between items-start mb-6 z-10">
               <div>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                     <Brain size={14} className="text-blue-500" /> Hiring Readiness
                  </h3>
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1 text-left">Click for details</p>
               </div>
               <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <ExternalLink size={12} className="text-gray-400 group-hover:text-blue-500" />
               </div>
            </div>
            
            <div className="relative w-48 h-48 flex items-center justify-center mb-10 z-10">
               <svg className="w-full h-full transform -rotate-90 scale-110 drop-shadow-2xl">
                  <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="transparent" />
                  <motion.circle 
                     cx="96" cy="96" r="88" 
                     stroke={isGuest ? '#f59e0b' : healthColor} 
                     strokeWidth="12" 
                     fill="transparent" 
                     strokeDasharray={552.9} 
                     initial={{ strokeDashoffset: 552.9 }}
                     animate={{ strokeDashoffset: 552.9 - (552.9 * (isGuest ? 45 : healthScore)) / 100 }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     strokeLinecap="round" 
                  />
               </svg>
               <div className="absolute flex flex-col items-center">
                  <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl font-black text-white tracking-tighter">
                     {isGuest ? 'SIM' : healthScore || '--'}
                  </motion.span>
                  <span className="text-[10px] font-black text-gray-500 uppercase">Neural Index</span>
               </div>
            </div>
            
            <div className="z-10 w-full space-y-4">
               <p className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md" style={{ color: isGuest ? '#f59e0b' : healthColor }}>
                  {isGuest ? "Baseline Potential" : (healthScore >= 75 ? "Market Ready 🚀" : healthScore >= 50 ? "Competitive ⚡" : "Needs Optimization 🔧")}
               </p>
               
               <div className="flex gap-2 justify-center">
                  <div className={`h-1 flex-1 rounded-full ${subScores.interview > 0 ? 'bg-purple-500' : 'bg-white/5'}`} />
                  <div className={`h-1 flex-1 rounded-full ${subScores.ats > 0 ? 'bg-blue-500' : 'bg-white/5'}`} />
                  <div className={`h-1 flex-1 rounded-full ${subScores.coding > 0 ? 'bg-green-500' : 'bg-white/5'}`} />
                  <div className={`h-1 flex-1 rounded-full bg-yellow-500`} />
               </div>
            </div>
         </button>

         {/* ATS Insights */}
         <div className="glass-card p-10 rounded-[3rem] flex flex-col justify-between group">
            <div className="flex justify-between items-start">
               <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                     <Target size={14} className={isGuest ? "text-yellow-500" : "text-blue-500"} /> 
                     {isGuest ? "Market Signal" : "Resume Strength"}
                  </h3>
                  {renderStars(moduleRatings['ATS Engine'])}
               </div>
               <div className="bg-white/5 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info size={12} className="text-gray-500" />
               </div>
            </div>
            
            {isGuest ? (
               <div className="space-y-4 py-4">
                  <div className="text-5xl font-black text-white uppercase tracking-tighter flex items-center gap-3">HIGH <TrendingUp className="text-green-500" /></div>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed">Neural analysis indicates <span className="text-white font-bold">84% growth</span> for {targetRole} roles this quarter.</p>
               </div>
            ) : (
               <div className="space-y-2">
                  <div className="text-7xl font-black text-white tracking-tighter">{atsResult?.ats_score || 0}<span className="text-2xl opacity-20 ml-2">/100</span></div>
                  <p className="text-xs font-medium text-gray-500">Compatibility with top tier {targetRole} benchmarks.</p>
               </div>
            )}
            
            <button onClick={() => onNavigate('ats')} className="w-full py-5 bg-white/5 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-8 transition-all group-hover:bg-blue-600 group-hover:border-blue-400 border border-transparent">
               {isGuest ? "Analyze Role Keywords" : "Deep Score Breakdown"} <ChevronRight size={14} />
            </button>
         </div>

         {/* Performance Metrics */}
         <div className="glass-card p-10 rounded-[3rem] flex flex-col justify-between group">
            <div className="flex justify-between items-start">
               <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                     <Activity size={14} className="text-purple-500" /> 
                     {isGuest ? "Training Depth" : "Recent Assessment"}
                  </h3>
                  {renderStars(moduleRatings['Live Interview Room'])}
               </div>
            </div>
            
            {isGuest ? (
               <div className="space-y-4 py-4">
                  <div className="text-5xl font-black text-white tracking-tighter">{sessions.length}<span className="text-2xl opacity-20 ml-3 uppercase">Runs</span></div>
                  <p className="text-xs font-medium text-gray-500">Global training iterations logged in simulation mode.</p>
               </div>
            ) : (
               <div className="space-y-2">
                  <div className="text-7xl font-black text-white tracking-tighter">{interviewReport?.overall_score || 0}<span className="text-2xl opacity-20 ml-2">/100</span></div>
                  <p className="text-xs font-medium text-gray-500">Average logic and communication index from live labs.</p>
               </div>
            )}
            
            <button onClick={() => onNavigate('interview')} className="w-full py-5 bg-white/5 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-8 transition-all group-hover:bg-purple-600 group-hover:border-purple-400 border border-transparent">
               {isGuest ? "Start Live Simulation" : "Retake Live Lab"} <ChevronRight size={14} />
            </button>
         </div>
      </div>

      {/* Skill Readiness Heatmap - Modern UI */}
      {!isGuest && (
        <div className="glass-card p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden bg-white/[0.01]">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <LayoutGrid className="text-blue-500" /> Neural Skill Projection
                 </h3>
                 {renderStars(moduleRatings['Neural Coding Lab'])}
                 <p className="text-xs text-gray-500 mt-2 font-medium">Visualizing your depth and career readiness across industry tiers.</p>
              </div>
              <div className="flex items-center gap-6 bg-black/20 p-4 rounded-2xl border border-white/5">
                 {['Strong', 'Partial', 'Gap'].map(l => {
                    const style = getStatusStyle(l);
                    return (
                       <div key={l} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-md ${style.bg} ${style.border} border`} />
                          <span className="text-[10px] font-black uppercase text-gray-400">{l}</span>
                       </div>
                    );
                 })}
              </div>
           </div>

           {loadingMatrix ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
                 ))}
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {skillMatrix.map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-8 rounded-[2.5rem] border-white/5 group hover:bg-white/[0.03]"
                    >
                       <div className="flex justify-between items-start mb-8">
                          <h4 className="text-lg font-black text-white uppercase tracking-tighter truncate w-3/4">{item.skill}</h4>
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                             <Zap size={16} />
                          </div>
                       </div>

                       {/* Mastery Bar */}
                       <div className="space-y-4 mb-8">
                          <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                             <span>Mastery</span>
                             <span className="text-white">{item.overall_mastery || 0}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${item.overall_mastery || 0}%` }}
                               className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                             />
                          </div>
                       </div>

                       {/* Tiers Heatmap */}
                       <div className="grid grid-cols-4 gap-2 mb-8">
                          {['junior', 'mid', 'senior', 'lead'].map((tier) => {
                             const style = getStatusStyle(item.levels[tier]);
                             return (
                                <div key={tier} className="flex flex-col items-center gap-2">
                                   <div className={`w-full h-10 rounded-lg border transition-all duration-500 ${style.bg} ${style.border} group-hover:scale-105`} title={`${tier.toUpperCase()}: ${item.levels[tier]}`} />
                                   <span className="text-[8px] font-black text-gray-600 uppercase">{tier[0]}</span>
                                </div>
                             );
                          })}
                       </div>

                       <div className="pt-6 border-t border-white/5">
                          <div className="flex items-start gap-3">
                             <HelpCircle size={14} className="text-gray-500 shrink-0 mt-0.5" />
                             <p className="text-[10px] font-medium text-gray-400 leading-relaxed italic">"{item.advice}"</p>
                          </div>
                       </div>
                    </motion.div>
                 ))}
                 {skillMatrix.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center opacity-30">
                       <LayoutGrid size={48} className="mb-4 text-gray-500" />
                       <p className="font-black uppercase tracking-[0.3em] text-xs">Neural Skill telemetry pending upload.</p>
                    </div>
                 )}
              </div>
           )}
        </div>
      )}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-card p-10 rounded-[3rem] flex flex-col items-center min-h-[450px]">
            <div className="w-full flex justify-between items-center mb-12">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} className="text-blue-400" /> Skill Competency Radar</h3>
               <p className="text-[9px] font-black text-gray-600 bg-white/5 px-3 py-1 rounded-full uppercase">Real-time Data</p>
            </div>
            <div className="w-full h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                     <PolarGrid stroke="rgba(255,255,255,0.05)" />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: '900', letterSpacing: '1px' }} />
                     <Radar name="Performance" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="glass-card p-10 rounded-[3rem] flex flex-col min-h-[450px]">
            <div className="w-full flex justify-between items-center mb-12">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> Professional Evolution</h3>
               <p className="text-[9px] font-black text-gray-600 bg-white/5 px-3 py-1 rounded-full uppercase">Progression Loop</p>
            </div>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10, fontWeight: '800' }} />
                     <YAxis domain={[0, 100]} hide />
                     <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff', fontSize: '12px' }} />
                     <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', r: 5, strokeWidth: 0 }} activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 4, fill: '#000' }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Global Logs */}
      <div className="glass-card p-10 rounded-[3.5rem] overflow-hidden">
         <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10 flex items-center gap-2"><Activity size={14} /> Neural Transmission Logs</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                     <th className="pb-6 px-4">Timestamp</th><th className="pb-6 px-4">Operation</th><th className="pb-6 px-4 text-center">Score Index</th><th className="pb-6 px-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {sessions.map((s) => (
                     <tr key={s.id} className="group hover:bg-white/[0.01] transition-colors">
                        <td className="py-6 px-4 text-[11px] font-bold text-gray-500 tracking-tight">{s.date}</td>
                        <td className="py-6 px-4">
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-white uppercase tracking-tighter group-hover:text-blue-500 transition-colors">{s.target_role}</span>
                              <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-0.5">{s.type || 'Standard Sync'}</span>
                           </div>
                        </td>
                        <td className="py-6 px-4 text-center">
                           <span className={`text-sm font-black px-4 py-1.5 rounded-xl border ${s.ats_score > 70 || s.interview_score > 70 ? 'text-green-500 bg-green-500/5 border-green-500/10' : 'text-blue-500 bg-blue-500/5 border-blue-500/10'}`}>
                              {s.ats_score || s.interview_score || 0}%
                           </span>
                        </td>
                        <td className="py-6 px-4 text-right">
                           <div className="flex items-center justify-end gap-4">
                              <button className="inline-flex items-center gap-2 text-gray-600 hover:text-white transition-colors">
                                 <span className="text-[9px] font-black uppercase tracking-widest">Audit</span>
                                 <ExternalLink size={12} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                title="Delete Log"
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {sessions.length === 0 && (
               <div className="py-20 text-center flex flex-col items-center">
                  <div className="p-4 bg-white/5 rounded-full mb-4"><Clock size={32} className="text-gray-700" /></div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No transmissions recorded.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
