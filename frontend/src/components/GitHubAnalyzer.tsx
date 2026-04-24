import React, { useState } from 'react';
import { GitBranch, TrendingUp, Check, AlertTriangle, Loader2, Star, Users, BookOpen, Search } from 'lucide-react';
import axios from 'axios';

const GitHubAnalyzer: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const [username, setUsername] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractUsername = (input: string) => {
    let clean = input.trim();
    if (clean.includes('github.com/')) {
        clean = clean.split('github.com/')[1].split('/')[0].split('?')[0];
    }
    return clean;
  };

  const analyze = async () => {
    const cleanUsername = extractUsername(username);
    console.log("Analyze clicked for username:", cleanUsername);
    
    if (!cleanUsername) {
        setError("Invalid GitHub username or URL");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Sending POST to /github/analyze...");
      const res = await axios.post(`${API_BASE_URL}/github/analyze`, { username: cleanUsername });
      console.log("Response received:", res.data);
      setResult(res.data);
    } catch (err: any) {
      console.error("GitHub Analysis Error:", err);
      setError(err.response?.data?.detail || 'GitHub user not found or analysis failed. Ensure the username is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <GitBranch size={120} />
         </div>
         <div className="relative z-10">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">GitHub Profile Audit</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">See how recruiters perceive your code</p>
         </div>
         <div className="flex w-full md:w-auto gap-4 relative z-10">
            <div className="relative flex-1 md:w-80">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
               <input
                 value={username}
                 onChange={e => setUsername(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && analyze()}
                 placeholder="Enter username or GitHub URL..."
                 className="w-full bg-black/40 pl-14 pr-6 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-0 text-white font-bold text-sm transition-all"
               />
            </div>
            <button 
              onClick={(e) => { e.preventDefault(); analyze(); }} 
              disabled={loading || !username.trim()}
              className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <TrendingUp size={14} />}
              Analyze
            </button>
         </div>
      </div>

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-400 text-sm font-bold flex items-center gap-4 animate-in shake duration-300">
           <AlertTriangle size={18} />
           {error}
        </div>
      )}

      {result && (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Profile Card */}
             <div className="lg:col-span-1 glass-card p-8 rounded-[2.5rem] border-white/10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                   <img src={result.github_data.avatar} alt="avatar" className="w-32 h-32 rounded-3xl object-cover border-4 border-white/5 shadow-2xl" />
                   <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white p-2 rounded-xl shadow-xl">
                      <GitBranch size={16} />
                   </div>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">{result.github_data.name || result.github_data.username}</h3>
                <p className="text-blue-500 font-black text-[10px] uppercase tracking-widest mt-1">@{result.github_data.username}</p>
                
                <div className="grid grid-cols-2 gap-4 w-full mt-10">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Repos</p>
                      <div className="flex items-center justify-center gap-2">
                         <BookOpen size={12} className="text-blue-400" />
                         <span className="font-black text-white">{result.github_data.public_repos}</span>
                      </div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Followers</p>
                      <div className="flex items-center justify-center gap-2">
                         <Users size={12} className="text-purple-400" />
                         <span className="font-black text-white">{result.github_data.followers}</span>
                      </div>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 w-full">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Neural Profile Score</p>
                   <div className="text-6xl font-black tracking-tighter" style={{ color: result.analysis.profile_score >= 70 ? '#10b981' : '#f59e0b' }}>
                      {result.analysis.profile_score}<span className="text-xl opacity-30 text-white">/100</span>
                   </div>
                </div>
             </div>

             {/* Tech Stack & Languages */}
             <div className="lg:col-span-2 glass-card p-10 rounded-[2.5rem] border-white/10 flex flex-col justify-between">
                <div>
                   <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-10 flex items-center gap-2">
                      <TrendingUp size={14} className="text-blue-500" /> Language Distribution
                   </h3>
                   <div className="space-y-6">
                      {Object.entries(result.github_data.top_languages)
                        .sort((a: any, b: any) => b[1] - a[1]).slice(0, 6)
                        .map(([lang, count]: [string, any], i) => (
                          <div key={lang} className="space-y-2 group">
                            <div className="flex justify-between items-end">
                               <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">{lang}</span>
                               <span className="text-[10px] font-black text-gray-500">{count} Active Repos</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out" 
                                 style={{ width: `${(count / result.github_data.public_repos) * 100}%`, transitionDelay: `${i * 100}ms` }}
                               />
                            </div>
                          </div>
                        ))}
                   </div>
                </div>

                <div className="mt-12 p-8 bg-blue-600/5 rounded-3xl border border-blue-500/10 relative overflow-hidden group/v">
                   <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Recruiter Verdict</p>
                   <p className="text-sm text-gray-300 font-medium leading-relaxed italic group-hover/v:text-white transition-colors">
                      "{result.analysis.recruiter_verdict}"
                   </p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Strengths & Red Flags */}
             <div className="glass-card p-10 rounded-[3rem] border-white/10 space-y-10">
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                      <Check size={14} /> Profile Strengths
                   </h4>
                   <div className="space-y-4">
                      {result.analysis.strengths.map((s: string, i: number) => (
                         <div key={i} className="flex items-start gap-4 p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
                            <div className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                            <p className="text-xs font-bold text-gray-300">{s}</p>
                         </div>
                      ))}
                   </div>
                </div>
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle size={14} /> Potential Red Flags
                   </h4>
                   <div className="space-y-4">
                      {result.analysis.red_flags.map((f: string, i: number) => (
                         <div key={i} className="flex items-start gap-4 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                            <div className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></div>
                            <p className="text-xs font-bold text-gray-300">{f}</p>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Recommendations & Repos */}
             <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col justify-between">
                <div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                      <Star size={14} className="text-yellow-500" /> Strategic Recommendations
                   </h4>
                   <div className="space-y-6">
                      {result.analysis.recommendations.map((r: string, i: number) => (
                         <div key={i} className="flex items-center gap-5 group">
                            <span className="w-8 h-8 bg-black/40 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-500 border border-white/10 group-hover:border-blue-500/50 transition-all">{i + 1}</span>
                            <p className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{r}</p>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="mt-12">
                   <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Recent Repositories</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.repos.map((repo: any, i: number) => (
                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                           <p className="text-xs font-black text-white truncate mb-1">{repo.name}</p>
                           <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-blue-500 uppercase">{repo.language}</span>
                              <div className="flex items-center gap-1">
                                 <Star size={10} className="text-yellow-500" />
                                 <span className="text-[9px] font-bold text-gray-500">{repo.stars}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubAnalyzer;
