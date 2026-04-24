import { useState } from 'react';
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
      <div className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><GitBranch size={120} /></div>
         <h2 className="text-3xl font-black text-white tracking-tighter uppercase">GitHub Profile Audit</h2>
         <div className="flex w-full md:w-auto gap-4 relative z-10">
            <div className="relative flex-1 md:w-80">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
               <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username or URL..." className="w-full bg-black/40 pl-14 pr-6 py-4 rounded-2xl border border-white/5 text-white font-bold text-sm" />
            </div>
            <button onClick={analyze} disabled={loading || !username.trim()} className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase flex items-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={14} /> : <TrendingUp size={14} />} Analyze
            </button>
         </div>
      </div>
      {error && <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-400 text-sm font-bold flex items-center gap-4"><AlertTriangle size={18} /> {error}</div>}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="glass-card p-8 rounded-[2.5rem] border-white/10 flex flex-col items-center">
              <img src={result.github_data.avatar} alt="avatar" className="w-32 h-32 rounded-3xl mb-6 shadow-2xl" />
              <h3 className="text-2xl font-black text-white">{result.github_data.name || result.github_data.username}</h3>
              <div className="mt-8 pt-8 border-t border-white/5 w-full text-center">
                 <p className="text-[10px] font-black text-gray-500 uppercase mb-4">Neural Score</p>
                 <div className="text-6xl font-black" style={{ color: result.analysis.profile_score >= 70 ? '#10b981' : '#f59e0b' }}>{result.analysis.profile_score}</div>
              </div>
           </div>
           <div className="lg:col-span-2 glass-card p-10 rounded-[2.5rem] border-white/10">
              <h3 className="text-xs font-black text-gray-500 uppercase mb-10 flex items-center gap-2"><TrendingUp size={14} /> Languages</h3>
              <div className="space-y-6">
                {Object.entries(result.github_data.top_languages).slice(0, 6).map(([lang, count]: [string, any]) => (
                  <div key={lang} className="space-y-2">
                    <div className="flex justify-between text-sm font-black text-white uppercase"><span>{lang}</span><span className="text-[10px] text-gray-500">{count} Repos</span></div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${(count / result.github_data.public_repos) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
           </div>
           <div className="glass-card p-10 rounded-[3rem] border-white/10 space-y-6">
              <h4 className="text-[10px] font-black text-green-500 uppercase flex items-center gap-2"><Check size={14} /> Strengths</h4>
              {result.analysis.strengths.map((s: string, i: number) => <p key={i} className="text-xs font-bold text-gray-300">• {s}</p>)}
           </div>
           <div className="glass-card p-10 rounded-[3rem] border-white/10 space-y-6">
              <h4 className="text-[10px] font-black text-red-500 uppercase flex items-center gap-2"><AlertTriangle size={14} /> Flags</h4>
              {result.analysis.red_flags.map((f: string, i: number) => <p key={i} className="text-xs font-bold text-gray-300">• {f}</p>)}
           </div>
           <div className="glass-card p-10 rounded-[3rem] border-white/10 space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase flex items-center gap-2"><Star size={14} /> Strategic Recs</h4>
              {result.analysis.recommendations.map((r: string, i: number) => <p key={i} className="text-xs font-bold text-gray-300">{i+1}. {r}</p>)}
           </div>
        </div>
      )}
    </div>
  );
};

export default GitHubAnalyzer;
