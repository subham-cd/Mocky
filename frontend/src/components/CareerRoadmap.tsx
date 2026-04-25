import { useState, useEffect } from 'react';
import { Check, Star, Zap, Loader2, Trophy, Search, Target, Map as MapIcon, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useCareerStore } from '../store/useCareerStore';

const CareerRoadmap: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const { resumeData, targetRole } = useCareerStore();
  const [customRole, setCustomRole] = useState(targetRole);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());

  const generatePath = async () => {
    if (!customRole.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/roadmap/generate`, {
        role: customRole,
        resume_text: resumeData?.raw_text || "General Professional"
      });
      setRoadmap(res.data);
      setCompletedNodes(new Set());
    } catch (err) {
      console.error("Roadmap generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (title: string) => {
    const newSet = new Set(completedNodes);
    if (newSet.has(title)) newSet.delete(title);
    else newSet.add(title);
    setCompletedNodes(newSet);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-40">
      
      {/* Search Header */}
      <div className="glass-card p-10 rounded-[3rem] border-white/10 bg-black/40 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><MapIcon size={100} /></div>
         <div className="relative z-10 space-y-8">
            <div className="text-center">
               <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Neural Career Ladder</h2>
               <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Vertical Progression Architecture</p>
            </div>
            
            <div className="flex gap-3">
               <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && generatePath()}
                    placeholder="Enter Target Designation..."
                    className="w-full bg-white/5 border border-white/10 pl-14 pr-6 py-5 rounded-3xl text-white font-bold text-sm focus:border-blue-500/50 focus:ring-0 transition-all"
                  />
               </div>
               <button 
                 onClick={generatePath} 
                 disabled={loading}
                 className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl shadow-blue-600/20"
               >
                 {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />} {roadmap ? "Refresh" : "Build"}
               </button>
            </div>
         </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-32 animate-pulse space-y-6">
           <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Sequencing Milestones...</p>
        </div>
      )}

      {roadmap && !loading && (
        <div className="relative pt-10">
           
           {/* The Ladder Beam */}
           <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/5 -translate-x-1/2 rounded-full hidden md:block"></div>

           <div className="space-y-12 relative">
              {roadmap.milestones.map((m: any, i: number) => {
                 const isCompleted = completedNodes.has(m.title);
                 const isEven = i % 2 === 0;
                 
                 return (
                   <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      
                      {/* Content Card */}
                      <div className={`flex-1 w-full md:w-auto transition-all duration-700 ${isCompleted ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-60'}`}>
                         <div className={`glass-card p-8 rounded-[2.5rem] border-white/10 bg-black/40 hover:border-white/20 transition-all ${isEven ? 'text-right' : 'text-left'}`}>
                            <div className={`flex items-center gap-3 mb-4 ${isEven ? 'justify-end' : 'justify-start'}`}>
                               <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg">{m.phase}</span>
                               <span className="text-[10px] font-black text-gray-600 uppercase">Step #0{i+1}</span>
                            </div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">{m.title}</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">{m.description}</p>
                            <div className={`flex flex-wrap gap-2 ${isEven ? 'justify-end' : 'justify-start'}`}>
                               {m.skills?.map((s: string, si: number) => (
                                 <span key={si} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[9px] font-bold text-gray-300 uppercase tracking-wider">
                                    {s}
                                 </span>
                               ))}
                            </div>
                         </div>
                      </div>

                      {/* Center Node */}
                      <div className="relative z-10 shrink-0">
                         <button
                           onClick={() => toggleNode(m.title)}
                           className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 ${
                             isCompleted 
                             ? 'bg-green-500 border-green-600 shadow-[0_0_30px_rgba(34,197,94,0.3)] rotate-[360deg]' 
                             : 'bg-black border-white/10 hover:border-blue-500/50'
                           }`}
                         >
                            {isCompleted ? <Check size={24} className="text-white" strokeWidth={4} /> : <Star size={20} className="text-gray-700" />}
                         </button>
                      </div>

                      {/* Empty Spacer for desktop alignment */}
                      <div className="flex-1 hidden md:block"></div>
                   </div>
                 );
              })}

              {/* Goal Milestone */}
              <div className="flex flex-col items-center pt-10">
                 <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-[2rem] flex items-center justify-center text-black shadow-2xl animate-bounce">
                    <Trophy size={32} />
                 </div>
                 <div className="mt-8 text-center">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{customRole} Mastered</h3>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-2">Peak Professional Capacity</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {!roadmap && !loading && (
        <div className="flex flex-col items-center justify-center py-40 space-y-8 opacity-20">
           <div className="p-10 bg-white/5 rounded-full border-2 border-dashed border-white/10">
              <Target size={80} className="text-gray-500" />
           </div>
           <p className="font-black uppercase tracking-[0.5em] text-sm">System Ready: Input Target Role</p>
        </div>
      )}

      {/* Floating Progress Tracker */}
      {roadmap && (
         <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-black/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-10">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mastery Level:</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-1000" 
                    style={{ width: `${(completedNodes.size / roadmap.milestones.length) * 100}%` }}
                  />
               </div>
               <span className="text-sm font-black text-white">{Math.round((completedNodes.size / roadmap.milestones.length) * 100)}%</span>
            </div>
         </div>
      )}

    </div>
  );
};

export default CareerRoadmap;
