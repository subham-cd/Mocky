import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Activity, Target, Zap, ArrowUpRight, Clock, ExternalLink, TrendingUp, ChevronRight } from 'lucide-react';
import { useCareerStore } from '../store/useCareerStore';
import { useHydration } from '../hooks/useHydration';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const hydrated = useHydration();
  const { 
    sessions, atsResult, interviewReport, targetRole, 
    setTargetRole, getCareerHealth 
  } = useCareerStore();

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-500 animate-pulse">
        <Activity size={48} className="mb-4" />
        <p className="font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Neural Data...</p>
      </div>
    );
  }

  const healthScore = getCareerHealth();
  const latestSession = sessions[0] || null;
  const healthColor = healthScore >= 75 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444';

  const radarData = [
    { subject: 'Technical', score: latestSession?.radar_scores?.technical_depth || interviewReport?.dimension_scores?.technical_depth || 0 },
    { subject: 'Communication', score: latestSession?.radar_scores?.communication || interviewReport?.dimension_scores?.communication || 0 },
    { subject: 'Problem Solving', score: latestSession?.radar_scores?.problem_solving || interviewReport?.dimension_scores?.problem_solving || 0 },
    { subject: 'Confidence', score: latestSession?.radar_scores?.confidence || interviewReport?.dimension_scores?.confidence || 0 },
    { subject: 'Relevance', score: latestSession?.radar_scores?.relevance || interviewReport?.dimension_scores?.relevance || 0 },
  ];

  const lineData = [...sessions].reverse()
    .filter(s => s.ats_score > 0)
    .map(s => ({ date: s.date, score: s.ats_score }));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Top Bar with Selector */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
         <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Neural Dashboard</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Real-time performance monitoring</p>
         </div>
         <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
            <span className="text-[10px] font-black text-blue-500 uppercase">Focus:</span>
            <select 
              value={targetRole} 
              onChange={e => setTargetRole(e.target.value)}
              className="bg-transparent border-none p-0 text-sm font-black text-white focus:ring-0 cursor-pointer"
            >
              <option className="bg-gray-900">Software Engineer</option>
              <option className="bg-gray-900">Data Analyst</option>
              <option className="bg-gray-900">Product Manager</option>
              <option className="bg-gray-900">Frontend Developer</option>
              <option className="bg-gray-900">Backend Developer</option>
              <option className="bg-gray-900">DevOps Engineer</option>
            </select>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Career Health Widget */}
         <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 group-hover:to-blue-500/10 transition-all"></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 relative z-10">Career Health Score</p>
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
               <svg className="w-full h-full transform -rotate-90 scale-110">
                  <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="96" cy="96" r="88" stroke={healthColor} strokeWidth="12" fill="transparent" 
                    strokeDasharray={552.9} strokeDashoffset={552.9 - (552.9 * healthScore) / 100} 
                    className="transition-all duration-[2s] drop-shadow-[0_0_12px_currentColor]"
                  />
               </svg>
               <div className="absolute flex flex-col items-center">
                  <span className="text-6xl font-black text-white tracking-tighter">{healthScore || '--'}</span>
                  <span className="text-[10px] font-black text-gray-500 uppercase">/ 100</span>
               </div>
            </div>
            <p className="text-sm font-black uppercase tracking-widest relative z-10" style={{ color: healthColor }}>
               {healthScore >= 75 ? "Interview Ready 🚀" : healthScore >= 50 ? "Optimization Needed ⚡" : "Initial Phase 💪"}
            </p>
         </div>

         {/* ATS Score Snapshot */}
         <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col justify-between group transition-all hover:bg-white/[0.02]">
            <div>
               <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Target size={14} className="text-blue-500" /> Latest ATS Score
               </h3>
               {atsResult ? (
                 <div className="space-y-6">
                    <div className="text-6xl font-black text-white tracking-tighter">
                       {atsResult.ats_score}<span className="text-xl opacity-30">/100</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       <span className="px-3 py-1.5 bg-green-500/10 text-green-400 text-[9px] font-black rounded-lg border border-green-500/20 uppercase tracking-widest">
                          ✓ {atsResult.matched_keywords?.length} Matched
                       </span>
                       <span className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[9px] font-black rounded-lg border border-red-500/20 uppercase tracking-widest">
                          ✗ {atsResult.missing_keywords?.length} Gaps
                       </span>
                    </div>
                 </div>
               ) : (
                 <p className="text-gray-600 text-sm font-bold py-10 uppercase tracking-widest italic">Engine standby...</p>
               )}
            </div>
            <button onClick={() => onNavigate('ats')} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-6">
               View Full Report <ChevronRight size={12} />
            </button>
         </div>

         {/* Interview Snapshot */}
         <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col justify-between group transition-all hover:bg-white/[0.02]">
            <div>
               <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Activity size={14} className="text-purple-500" /> Latest Interview
               </h3>
               {(interviewReport || latestSession?.full_report) ? (
                 <div className="space-y-6">
                    <div className="text-6xl font-black text-white tracking-tighter">
                       {interviewReport?.overall_score || latestSession?.interview_score}<span className="text-xl opacity-30">/100</span>
                    </div>
                    <div className="px-4 py-1.5 bg-purple-500/20 text-purple-400 rounded-xl text-lg font-black inline-block shadow-lg shadow-purple-500/10 border border-purple-500/20">
                       Grade: {interviewReport?.composite_grade || latestSession?.full_report?.composite_grade}
                    </div>
                 </div>
               ) : (
                 <p className="text-gray-600 text-sm font-bold py-10 uppercase tracking-widest italic">Simulation required...</p>
               )}
            </div>
            <button onClick={() => onNavigate('interview')} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-6">
               Retake Session <ChevronRight size={12} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Radar Chart */}
         <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col items-center">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-10 self-start flex items-center gap-2">
               <TrendingUp size={14} className="text-blue-500" /> Neural Performance Radar
            </h3>
            <div className="w-full h-80 flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                     <PolarGrid stroke="rgba(255,255,255,0.1)" />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />
                     <Radar
                        name="Performance"
                        dataKey="score"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                     />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-6">Multidimensional skill analysis</p>
         </div>

         {/* Line Chart */}
         <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-10 self-start flex items-center gap-2">
               <Clock size={14} className="text-green-500" /> Improvement Vector
            </h3>
            <div className="flex-1 min-h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={10} />
                     <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                     />
                     <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
            <p className="text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-6">ATS compliance trajectory</p>
         </div>
      </div>

      {/* Session History Table */}
      <div className="glass-card p-10 rounded-[3rem] border-white/10 overflow-hidden">
         <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-8 flex items-center gap-2">
            <Clock size={14} /> Global Session Logs
         </h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5">
                     <th className="pb-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                     <th className="pb-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Role Strategy</th>
                     <th className="pb-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">ATS Match</th>
                     <th className="pb-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Interview</th>
                     <th className="pb-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {sessions.length > 0 ? sessions.map((s) => (
                     <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 text-xs font-medium text-gray-400">{s.date}</td>
                        <td className="py-5 text-sm font-black text-white">{s.target_role}</td>
                        <td className="py-5">
                           <div className="flex items-center gap-3">
                              <span className="font-black text-blue-400 text-sm">{s.ats_score}%</span>
                              <div className="w-16 h-1 bg-white/5 rounded-full hidden md:block">
                                 <div className="h-full bg-blue-400 rounded-full" style={{ width: `${s.ats_score}%` }}></div>
                              </div>
                           </div>
                        </td>
                        <td className="py-5 text-center">
                           <span className={`font-black text-sm ${s.interview_score > 70 ? 'text-green-400' : 'text-purple-400'}`}>
                              {s.interview_score > 0 ? `${s.interview_score}%` : 'N/A'}
                           </span>
                        </td>
                        <td className="py-5 text-right">
                           <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all group-hover:scale-110">
                              <ExternalLink size={14} className="text-gray-500 group-hover:text-white" />
                           </button>
                        </td>
                     </tr>
                  )) : (
                    <tr><td colSpan={5} className="py-10 text-center text-gray-600 text-xs font-bold uppercase tracking-widest italic">No session logs detected. Initiate optimization to begin.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap justify-center gap-6 pb-10">
        {[
          { label: 'Run ATS Check', icon: <Target size={18} />, tab: 'ats', color: 'bg-blue-600 shadow-blue-500/20' },
          { label: 'Start Interview', icon: <Activity size={18} />, tab: 'interview', color: 'bg-indigo-600 shadow-indigo-500/20' },
          { label: 'Enhance Resume', icon: <Zap size={18} />, tab: 'enhance', color: 'bg-purple-600 shadow-purple-500/20' },
        ].map((btn, i) => (
          <button 
            key={i} 
            onClick={() => onNavigate(btn.tab)}
            className={`px-10 py-5 ${btn.color} text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-4`}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
