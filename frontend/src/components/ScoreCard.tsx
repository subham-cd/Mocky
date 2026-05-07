import React from 'react';
import { Check, AlertTriangle, X, ShieldAlert, Award, ListChecks, Zap, Info, Target, Sparkles, Cpu, Layers } from 'lucide-react';

interface ScoreCardProps {
  data: {
    ats_score: number;
    keyword_match_percent: number;
    matched_keywords: string[];
    missing_keywords: string[];
    section_scores: Record<string, number>;
    critical_fixes: string[];
    format_issues?: string[];
    isSimulation?: boolean;
    ml_score?: number;
    llm_score?: number;
  };
}

const ScoreCard: React.FC<ScoreCardProps> = ({ data }) => {
  const getGrade = (score: number) => {
    if (score >= 85) return { grade: "A", color: "text-green-400", bg: "bg-green-400" };
    if (score >= 70) return { grade: "B+", color: "text-blue-400", bg: "bg-blue-400" };
    return { grade: "C", color: "text-yellow-400", bg: "bg-yellow-400" };
  };

  const { grade, color, bg } = getGrade(data.ats_score);

  if (data.isSimulation) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Simulation Header */}
        <div className="glass-card p-10 rounded-[3rem] border-white/10 relative overflow-hidden group bg-gradient-to-br from-yellow-500/5 to-transparent">
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/30"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Market Pulse Analysis</h3>
               <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <Info size={12} /> Simulation Active: Projecting based on Role Benchmarks
               </p>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-5xl font-black text-white">HIGH<span className="text-xl opacity-40"> DEMAND</span></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="glass-card p-10 rounded-[2.5rem]">
              <h4 className="text-[10px] font-black text-blue-500 uppercase mb-8 flex items-center gap-2"><Zap size={16} /> Key Semantic Targets</h4>
              <div className="flex flex-wrap gap-2">
                 {data.missing_keywords?.map((kw, i) => (
                   <span key={i} className="px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] font-bold text-blue-300 uppercase tracking-wider hover:bg-blue-500/10 transition-colors">
                      {kw}
                   </span>
                 ))}
              </div>
           </div>

           <div className="glass-card p-10 rounded-[2.5rem]">
              <h4 className="text-[10px] font-black text-green-500 uppercase mb-8 flex items-center gap-2"><ListChecks size={16} /> Foundational Pillars</h4>
              <div className="space-y-4">
                 {data.critical_fixes?.map((req, i) => (
                   <p key={i} className="text-xs font-bold text-gray-400 flex gap-4 leading-relaxed italic">
                      <span className="text-green-500 shrink-0">•</span> {req}
                   </p>
                 ))}
              </div>
           </div>
        </div>

        <div className="glass-card p-12 rounded-[3rem] text-center border-blue-500/20 bg-blue-500/5">
           <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Neural Insight</h4>
           <p className="text-2xl font-medium text-gray-200 leading-relaxed italic">
             "To excel in this domain, focus your training on <span className="text-blue-400 font-black">{data.missing_keywords?.[0] || 'core technologies'}</span> {data.missing_keywords?.[1] ? <>and architectural patterns related to <span className="text-blue-400 font-black">{data.missing_keywords[1]}</span></> : ''}."
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Primary Score Banner */}
      <div className="glass-card p-12 rounded-[3rem] relative overflow-hidden group">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
             <div className="relative">
                <div className={`text-8xl font-black ${color} tracking-tighter`}>{data.ats_score}<span className="text-2xl opacity-20 ml-2">/100</span></div>
             </div>
             <div className="h-20 w-px bg-white/5 hidden md:block"></div>
             <div>
                <div className={`${bg} text-black font-black px-6 py-2 rounded-2xl text-xl shadow-2xl mb-2 inline-block`}>GRADE: {grade}</div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Neural Competency Index</p>
             </div>
          </div>
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 max-w-xs">
             <p className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center gap-2"><Target size={12} /> ATS Precision</p>
             <p className="text-xs text-gray-500 leading-relaxed">Your profile was parsed and compared against <span className="text-white font-bold">14,000+</span> industry data points.</p>
          </div>
        </div>
      </div>

      {/* Hybrid Neural-ML Scoring Engine Widget */}
      <div className="glass-card p-10 rounded-[3rem] border-blue-500/20 bg-blue-500/5">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Layers className="text-blue-400" /> Hybrid Neural-ML Scoring Engine
               </h3>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Cross-referencing mathematical vectors with semantic intelligence</p>
            </div>
            <div className="flex flex-wrap gap-2">
               {['scikit-learn', 'Groq', 'Llama 3.3-70B'].map(tech => (
                  <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-gray-400 uppercase tracking-widest">{tech}</span>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 space-y-4 group hover:border-blue-500/30 transition-all">
               <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">ML Analysis (TF-IDF)</span>
                  <Cpu size={14} className="text-blue-500" />
               </div>
               <div className="text-4xl font-black text-white">{data.ml_score || data.keyword_match_percent || 0}%</div>
               <p className="text-[10px] text-gray-500 font-medium">Deterministic mathematical keyword match density.</p>
               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${data.ml_score || data.keyword_match_percent || 0}%` }} />
               </div>
            </div>

            <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 space-y-4 group hover:border-purple-500/30 transition-all">
               <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-purple-500 uppercase tracking-[0.2em]">AI Analysis (LLM)</span>
                  <Sparkles size={14} className="text-purple-500" />
               </div>
               <div className="text-4xl font-black text-white">{data.llm_score || 0}%</div>
               <p className="text-[10px] text-gray-500 font-medium">Probabilistic qualitative semantic & context score.</p>
               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${data.llm_score || 0}%` }} />
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section Analysis */}
        <div className="lg:col-span-7 space-y-8">
          <div className="glass-card p-10 rounded-[3rem] overflow-hidden">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Sparkles size={14} className="text-blue-500" /> Structural integrity audit
             </h3>
             <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                     <th className="pb-6">Profile Domain</th>
                     <th className="pb-6">Strength</th>
                     <th className="pb-6 text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {data.section_scores && Object.entries(data.section_scores).map(([section, score]) => (
                   <tr key={section} className="hover:bg-white/[0.01] transition-colors">
                     <td className="py-6 font-black text-white text-sm uppercase tracking-tighter">{section}</td>
                     <td className="py-6">
                        <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${score > 15 ? 'bg-green-500' : 'bg-blue-500'} transition-all`} style={{ width: `${(score/20)*100}%` }} />
                        </div>
                     </td>
                     <td className="py-6 text-right">
                        {score > 10 
                           ? <div className="inline-flex items-center gap-2 text-green-500 font-black text-[10px] uppercase">Optimal <Check size={14} /></div>
                           : <div className="inline-flex items-center gap-2 text-yellow-500 font-black text-[10px] uppercase">Weak <AlertTriangle size={14} /></div>
                        }
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>

        {/* Actionable Gaps */}
        <div className="lg:col-span-5 space-y-8">
           <div className="glass-card p-10 rounded-[3rem] border-orange-500/10 bg-orange-500/[0.02]">
              <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-8 flex items-center gap-2"><ShieldAlert size={16} /> Critical Optimization Gaps</h4>
              <div className="space-y-6">
                 {data.critical_fixes?.map((fix, i) => (
                    <div key={i} className="flex gap-4 group">
                       <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 group-hover:scale-150 transition-transform" />
                       <p className="text-gray-300 text-sm font-medium leading-relaxed">{fix}</p>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="glass-card p-10 rounded-[3rem] border-blue-500/10 bg-blue-500/[0.02] text-center group">
              <Award size={48} className="text-blue-500/40 mx-auto mb-6 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-500" />
              <h4 className="text-white font-black uppercase tracking-tighter text-xl">Verification Ready</h4>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Passed initial neural screening.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
