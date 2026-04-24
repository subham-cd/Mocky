import React, { useState } from 'react';
import { CircleDollarSign, TrendingUp, Zap, MapPin, Loader2, Info } from 'lucide-react';
import axios from 'axios';
import { useCareerStore } from '../store/useCareerStore';

const SalaryEstimator: React.FC = () => {
  const { resumeData, targetRole } = useCareerStore();
  const [exp, setExp] = useState(0);
  const [location, setLocation] = useState('India');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const estimate = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/salary/estimate`, {
        skills: resumeData?.skills || [],
        role: targetRole,
        experience_years: exp,
        location
      });
      setResult(res.data.result);
    } catch (err) {
      console.error("Estimation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Input Panel */}
         <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-5">
                  <CircleDollarSign size={100} />
               </div>
               <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-8">Neural Payout</h2>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">Global Location</label>
                     <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                           value={location} 
                           onChange={e => setLocation(e.target.value)}
                           placeholder="e.g. India, USA, London"
                           className="w-full bg-black/40 pl-14 pr-6 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-0 text-white font-bold text-sm"
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between px-1">
                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Experience Range</label>
                        <span className="text-xs font-black text-white">{exp} Years</span>
                     </div>
                     <input 
                        type="range" min="0" max="20" step="1"
                        value={exp} 
                        onChange={e => setExp(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500"
                     />
                  </div>

                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Selected Strategy</p>
                     <p className="text-sm font-black text-white">{targetRole}</p>
                  </div>

                  <button 
                     onClick={estimate} 
                     disabled={loading}
                     className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                  >
                     {loading ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={16} />}
                     Calculate Range
                  </button>
               </div>
            </div>
         </div>

         {/* Result Panel */}
         <div className="lg:col-span-8">
            {result ? (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                  <div className="glass-card p-12 rounded-[3.5rem] border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                     <div className={`absolute top-0 right-0 w-64 h-64 ${result.market_demand === 'High' ? 'bg-green-500' : 'bg-yellow-500'}/5 blur-[80px] rounded-full`}></div>
                     
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Estimated Market Valuation</p>
                     
                     <div className="flex items-end gap-4 mb-4">
                        <span className="text-7xl lg:text-9xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                           {result.median_salary}
                        </span>
                        <span className="text-2xl font-black text-blue-500 mb-4 uppercase">{result.currency}</span>
                     </div>

                     <div className="flex items-center gap-6 bg-white/5 px-8 py-3 rounded-2xl border border-white/5 mb-10">
                        <div className="text-center">
                           <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Entry Floor</p>
                           <p className="font-black text-white">{result.min_salary} {result.currency}</p>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-center">
                           <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Neural Ceiling</p>
                           <p className="font-black text-white">{result.max_salary} {result.currency}</p>
                        </div>
                     </div>

                     <div className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border ${result.market_demand === 'High' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        Demand: {result.market_demand}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="glass-card p-10 rounded-[3rem] border-white/10">
                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <Zap size={14} /> High-Yield Assets
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {result.top_paying_skills.map((s: string) => (
                              <span key={s} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-lg border border-blue-500/20 uppercase">
                                 {s}
                              </span>
                           ))}
                        </div>
                     </div>
                     <div className="glass-card p-10 rounded-[3rem] border-green-500/10 bg-green-500/5">
                        <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <TrendingUp size={14} /> Raise Multipliers
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {result.skills_to_add_for_raise.map((s: string) => (
                              <span key={s} className="px-3 py-1.5 bg-green-500/10 text-green-400 text-[10px] font-black rounded-lg border border-green-500/20 uppercase">
                                 {s}
                              </span>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                     <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Info size={14} /> Strategic Insight
                     </h4>
                     <p className="text-lg font-bold text-gray-300 leading-relaxed italic pr-4 group-hover:text-white transition-colors">
                        "{result.insight}"
                     </p>
                  </div>
               </div>
            ) : (
               <div className="glass-card h-full min-h-[500px] rounded-[3.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-16 group">
                  <div className="bg-white/5 p-8 rounded-[2.5rem] mb-8 group-hover:scale-110 transition-transform duration-500">
                     <CircleDollarSign size={64} className="text-gray-800" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-300 mb-4 tracking-tighter uppercase">Valuation Engine Idle</h3>
                  <p className="max-w-xs text-[10px] font-black text-gray-600 leading-relaxed uppercase tracking-[0.2em]">Synchronize location and experience to project your neural market value across the global stack.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default SalaryEstimator;
