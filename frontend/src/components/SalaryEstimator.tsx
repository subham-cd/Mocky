import { useState } from 'react';
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
      const res = await axios.post(`${API_BASE_URL}/salary/estimate`, { skills: resumeData?.skills || [], role: targetRole, experience_years: exp, location });
      setResult(res.data.result);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden group">
               <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-8">Neural Payout</h2>
               <div className="space-y-6">
                  <div className="relative">
                     <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                     <input value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-black/40 pl-14 pr-6 py-4 rounded-2xl border border-white/5 text-white font-bold text-sm" />
                  </div>
                  <input type="range" min="0" max="20" step="1" value={exp} onChange={e => setExp(parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500" />
                  <button onClick={estimate} disabled={loading} className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 mt-4">
                     {loading ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={16} />} Calculate
                  </button>
               </div>
            </div>
         </div>
         <div className="lg:col-span-8">
            {result && (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                  <div className="glass-card p-12 rounded-[3.5rem] border-white/10 text-center">
                     <span className="text-7xl lg:text-9xl font-black text-white">{result.median_salary}</span>
                     <span className="text-2xl font-black text-blue-500 ml-4">{result.currency}</span>
                  </div>
                  <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 group"><p className="text-lg font-bold text-gray-300 italic">"{result.insight}"</p></div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default SalaryEstimator;
