import { useState } from 'react';
import { GitBranch, TrendingUp, Check, AlertTriangle, Loader2, Star, Search, Calendar, Zap, Award, Code2 } from 'lucide-react';
import axios from 'axios';

const GitHubAnalyzer: React.FC = () => {
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim();
  const [username, setUsername] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractUsername = (input: string) => {
    let clean = input.trim();
    if (clean.includes('github.com/')) {
        const parts = clean.split('github.com/')[1].split('/');
        clean = parts[0].split('?')[0];
    }
    return clean;
  };

  const analyze = async () => {
    const cleanUsername = extractUsername(username);
    if (!cleanUsername) { setError("Invalid GitHub username"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/github/analyze`, { username: cleanUsername });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
      {/* Search Header */}
      <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><GitBranch size={120} /></div>
         <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Neural GitHub Audit</h2>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mt-2">Professional Engineering Assessment</p>
         </div>
         <div className="flex w-full md:w-auto gap-4 relative z-10">
            <div className="relative flex-1 md:w-80">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
               <input 
                 value={username} 
                 onChange={e => setUsername(e.target.value)} 
                 onKeyDown={e => e.key === 'Enter' && analyze()}
                 placeholder="Username or profile URL..." 
                 className="w-full bg-black/40 pl-14 pr-6 py-4 rounded-2xl border border-white/5 text-white font-bold text-sm focus:border-blue-500/50 focus:ring-0 transition-all" 
               />
            </div>
            <button 
              onClick={analyze} 
              disabled={loading || !username.trim()} 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-blue-600/20"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />} Analyze Profile
            </button>
         </div>
      </div>

      {error && (
        <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] text-red-400 text-sm font-bold flex items-center gap-4 animate-in zoom-in-95">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {result && (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
          
          {/* Main Grid: Score, Languages, Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Profile & Score Card */}
            <div className="lg:col-span-3 glass-card p-10 rounded-[3rem] border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <img src={result.github_data.avatar} alt="avatar" className="w-32 h-32 rounded-[2.5rem] mb-8 shadow-2xl border-4 border-white/5" />
              <h3 className="text-2xl font-black text-white tracking-tighter">{result.github_data.name || result.github_data.username}</h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">@{result.github_data.username}</p>
              
              <div className="mt-10 pt-10 border-t border-white/5 w-full">
                 <div className="text-7xl font-black tracking-tighter mb-2" style={{ color: result.analysis.profile_score >= 70 ? '#10b981' : '#f59e0b' }}>
                   {result.analysis.profile_score}
                 </div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Neural Competency Index</p>
              </div>

              <div className="mt-8 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                {result.analysis.activity_rating} ACTIVITY
              </div>
            </div>

            {/* Languages & Tech Stack */}
            <div className="lg:col-span-5 glass-card p-10 rounded-[3rem] border-white/10 space-y-10">
               <div>
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <Code2 size={16} className="text-blue-500" /> Language Distribution
                  </h3>
                  <div className="space-y-6">
                    {Object.entries(result.github_data.top_languages).slice(0, 5).map(([lang, count]: [string, any]) => (
                      <div key={lang} className="space-y-2">
                        <div className="flex justify-between text-xs font-black text-white uppercase tracking-wider">
                          <span>{lang}</span>
                          <span className="text-gray-500">{count} Repos</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                            style={{ width: `${Math.min(100, (count / result.github_data.public_repos) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="pt-8 border-t border-white/5">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Detected Ecosystem</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.tech_stack_detected.map((tech: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-300">
                        {tech}
                      </span>
                    ))}
                  </div>
               </div>
            </div>

            {/* Activity Pulse */}
            <div className="lg:col-span-4 glass-card p-10 rounded-[3rem] border-white/10 flex flex-col justify-between">
               <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <TrendingUp size={16} className="text-green-500" /> Activity Pulse
               </h3>
               
               <div className="space-y-8">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                        <Calendar size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Activity Density</p>
                        <p className="text-2xl font-black text-white mt-1">{(result.github_data.activity.density * 100).toFixed(1)}%</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                        <Zap size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recent Events</p>
                        <p className="text-2xl font-black text-white mt-1">{result.github_data.activity.event_count}</p>
                     </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Last Transmission</p>
                     <p className="text-sm font-bold text-gray-300">
                        {result.github_data.activity.last_push 
                          ? new Date(result.github_data.activity.last_push).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : "No recent activity"}
                     </p>
                  </div>
               </div>

               <div className="mt-8 p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-[2rem] border border-blue-500/20">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Verdict</p>
                  <p className="text-xs font-medium text-gray-300 leading-relaxed italic">"{result.analysis.recruiter_verdict}"</p>
               </div>
            </div>

          </div>

          {/* Strategic Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="glass-card p-10 rounded-[3rem] border-white/10 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50"></div>
                <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-3">
                  <Check size={16} /> Key Strengths
                </h4>
                <div className="space-y-4">
                  {result.analysis.strengths.map((s: string, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                      <p className="text-xs font-bold text-gray-300 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
             </div>

             <div className="glass-card p-10 rounded-[3rem] border-white/10 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50"></div>
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-3">
                  <AlertTriangle size={16} /> Optimization Gaps
                </h4>
                <div className="space-y-4">
                  {result.analysis.red_flags.map((f: string, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                      <p className="text-xs font-bold text-gray-300 leading-relaxed">{f}</p>
                    </div>
                  ))}
                </div>
             </div>

             <div className="glass-card p-10 rounded-[3rem] border-white/10 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50"></div>
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-3">
                  <Award size={16} /> Strategic Roadmap
                </h4>
                <div className="space-y-4">
                  {result.analysis.recommendations.map((r: string, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1 font-black text-blue-500 text-[10px] shrink-0">{i+1}.</div>
                      <p className="text-xs font-bold text-gray-300 leading-relaxed">{r}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Primary Projects Section */}
          <div className="glass-card p-12 rounded-[3.5rem] border-white/10">
             <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-12 flex items-center gap-3">
               <Star size={18} className="text-yellow-500" /> High-Impact Deployments
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {result.analysis.strongest_projects.map((project: any, i: number) => (
                  <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all group">
                     <h5 className="text-lg font-black text-white mb-4 group-hover:text-blue-400 transition-colors">{project.name}</h5>
                     <p className="text-xs font-medium text-gray-400 leading-relaxed mb-6">
                        {project.impact}
                     </p>
                     <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-black rounded-lg uppercase tracking-widest">
                           Core Project
                        </span>
                     </div>
                  </div>
                ))}
             </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default GitHubAnalyzer;
