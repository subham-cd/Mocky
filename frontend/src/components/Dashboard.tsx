import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Activity, Target, Zap, Clock, ExternalLink, TrendingUp, ChevronRight } from 'lucide-react';
import { useCareerStore } from '../store/useCareerStore';
import { useHydration } from '../hooks/useHydration';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const hydrated = useHydration();
  const { 
    sessions, atsResult, interviewReport, targetRole, 
    setTargetRole, getCareerHealth, resumeData 
  } = useCareerStore();

  if (!hydrated) return <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-500 animate-pulse">Neural Synchronization...</div>;

  const isGuest = !resumeData;
  const healthScore = getCareerHealth();
  const latestSession = sessions[0] || null;
  const healthColor = healthScore >= 75 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444';

  const radarData = [
    { subject: 'Technical', score: latestSession?.radar_scores?.technical_depth || interviewReport?.dimension_scores?.technical_depth || (isGuest ? 60 : 0) },
    { subject: 'Communication', score: latestSession?.radar_scores?.communication || interviewReport?.dimension_scores?.communication || (isGuest ? 70 : 0) },
    { subject: 'Problem Solving', score: latestSession?.radar_scores?.problem_solving || interviewReport?.dimension_scores?.problem_solving || (isGuest ? 65 : 0) },
    { subject: 'Confidence', score: latestSession?.radar_scores?.confidence || interviewReport?.dimension_scores?.confidence || (isGuest ? 80 : 0) },
    { subject: 'Relevance', score: latestSession?.radar_scores?.relevance || interviewReport?.dimension_scores?.relevance || (isGuest ? 50 : 0) },
  ];

  const lineData = [...sessions].reverse().filter(s => s.ats_score > 0 || s.type === 'coding').map(s => ({ date: s.date, score: s.ats_score || s.interview_score }));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
         {isGuest && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/50 via-orange-500/50 to-yellow-500/50 animate-pulse"></div>}
         <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
               {isGuest ? "Simulation Mission Control" : "Neural Dashboard"}
            </h1>
            {isGuest && <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mt-1 animate-pulse">● Training Environment Active</p>}
         </div>
         <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
            <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="bg-transparent border-none p-0 text-sm font-black text-white cursor-pointer">
              <option className="bg-gray-900">Software Engineer</option>
              <option className="bg-gray-900">Data Analyst</option>
              <option className="bg-gray-900">Product Manager</option>
              <option className="bg-gray-900">DevOps Engineer</option>
            </select>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col items-center justify-center text-center group relative overflow-hidden">
            {isGuest && <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none"></div>}
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
               <svg className="w-full h-full transform -rotate-90 scale-110">
                  <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                  <circle cx="96" cy="96" r="88" stroke={isGuest ? '#f59e0b' : healthColor} strokeWidth="12" fill="transparent" strokeDasharray={552.9} strokeDashoffset={552.9 - (552.9 * (isGuest ? 45 : healthScore)) / 100} />
               </svg>
               <span className="absolute text-6xl font-black text-white">{isGuest ? 'SIM' : healthScore || '--'}</span>
            </div>
            <p className="text-sm font-black uppercase tracking-widest" style={{ color: isGuest ? '#f59e0b' : healthColor }}>
               {isGuest ? "Baseline Potential" : (healthScore >= 75 ? "Interview Ready 🚀" : "Optimization Needed ⚡")}
            </p>
         </div>

         <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col justify-between group">
            <h3 className="text-xs font-black text-gray-500 uppercase flex items-center gap-2">
               {isGuest ? <Zap size={14} className="text-yellow-500" /> : <Target size={14} />} 
               {isGuest ? "Role Demand" : "Latest ATS"}
            </h3>
            {isGuest ? (
               <div className="space-y-4 py-4">
                  <div className="text-4xl font-black text-white uppercase tracking-tighter">High <span className="text-green-500">↑</span></div>
                  <p className="text-[10px] font-bold text-gray-500 leading-relaxed">Neural analysis indicates 84% market growth for {targetRole} roles this quarter.</p>
               </div>
            ) : (
               <div className="text-6xl font-black text-white">{atsResult?.ats_score || 0}<span className="text-xl opacity-30">/100</span></div>
            )}
            <button onClick={() => onNavigate('ats')} className="w-full py-4 bg-white/5 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 mt-6 transition-all group-hover:bg-blue-600">
               {isGuest ? "Analyze Role Keywords" : "View Full Report"} <ChevronRight size={12} />
            </button>
         </div>

         <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col justify-between group">
            <h3 className="text-xs font-black text-gray-500 uppercase flex items-center gap-2"><Activity size={14} /> {isGuest ? "Simulation Depth" : "Latest Interview"}</h3>
            {isGuest ? (
               <div className="space-y-4 py-4">
                  <div className="text-4xl font-black text-white">{sessions.length}<span className="text-xl opacity-30"> RUNS</span></div>
                  <p className="text-[10px] font-bold text-gray-400">Total training sessions logged in simulation mode.</p>
               </div>
            ) : (
               <div className="text-6xl font-black text-white">{interviewReport?.overall_score || 0}<span className="text-xl opacity-30">/100</span></div>
            )}
            <button onClick={() => onNavigate('interview')} className="w-full py-4 bg-white/5 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 mt-6 transition-all group-hover:bg-purple-600">
               {isGuest ? "Start Live Simulation" : "Retake Session"} <ChevronRight size={12} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col items-center min-h-[400px]">
            <h3 className="text-xs font-black text-gray-500 uppercase mb-10 self-start flex items-center gap-2"><TrendingUp size={14} /> Performance Radar</h3>
            <div className="w-full h-80 flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                     <PolarGrid stroke="rgba(255,255,255,0.1)" />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />
                     <Radar name="Performance" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col min-h-[400px]">
            <h3 className="text-xs font-black text-gray-500 uppercase mb-10 self-start flex items-center gap-2"><Clock size={14} /> Improvement Vector</h3>
            <div className="flex-1 min-h-[300px]">
               <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <LineChart data={lineData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                     <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                     <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '1rem', color: '#fff' }} />
                     <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', r: 6 }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="glass-card p-10 rounded-[3rem] border-white/10 overflow-hidden">
         <h3 className="text-xs font-black text-gray-500 uppercase mb-8 flex items-center gap-2"><Clock size={14} /> Global Session Logs</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black text-gray-500 uppercase">
                     <th className="pb-4">Date</th><th className="pb-4">Role</th><th className="pb-4">ATS</th><th className="pb-4 text-center">Interview</th><th className="pb-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {sessions.map((s) => (
                     <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors text-white">
                        <td className="py-5 text-xs text-gray-400">{s.date}</td>
                        <td className="py-5 text-sm font-black">{s.target_role}</td>
                        <td className="py-5 font-black text-blue-400">{s.ats_score}%</td>
                        <td className="py-5 text-center font-black text-purple-400">{s.interview_score > 0 ? `${s.interview_score}%` : 'N/A'}</td>
                        <td className="py-5 text-right"><ExternalLink size={14} className="text-gray-500 inline group-hover:text-white" /></td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
