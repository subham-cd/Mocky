import React from 'react';
import { Check, AlertTriangle, X, ShieldAlert, Award, ListChecks } from 'lucide-react';

interface ScoreCardProps {
  data: {
    ats_score: number;
    keyword_match_percent: number;
    matched_keywords: string[];
    missing_keywords: string[];
    section_scores: Record<string, number>;
    critical_fixes: string[];
    format_issues?: string[];
  };
}

const ScoreCard: React.FC<ScoreCardProps> = ({ data }) => {
  const getGrade = (score: number) => {
    if (score >= 85) return { grade: "A", color: "text-green-400", bg: "bg-green-400", border: "border-green-400/20" };
    if (score >= 70) return { grade: "B+", color: "text-blue-400", bg: "bg-blue-400", border: "border-blue-400/20" };
    if (score >= 55) return { grade: "C", color: "text-yellow-400", bg: "bg-yellow-400", border: "border-yellow-400/20" };
    return { grade: "D", color: "text-red-400", bg: "bg-red-400", border: "border-red-400/20" };
  };

  const { grade, color, bg, border } = getGrade(data.ats_score);

  const getSectionStatus = (section: string, score: number) => {
    const maxMap: Record<string, number> = { summary: 20, experience: 30, skills: 25, education: 15, projects: 10 };
    const max = maxMap[section.toLowerCase()] || 30;
    const pct = score / max;
    if (pct >= 0.8) return { icon: <Check size={14} />, status: "Good", color: "text-green-400", max };
    if (pct >= 0.6) return { icon: <AlertTriangle size={14} />, status: "Improve", color: "text-yellow-400", max };
    return { icon: <X size={14} />, status: "Weak", color: "text-red-400", max };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="glass-card p-10 rounded-[3rem] border-white/10 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-64 h-64 ${bg}/5 blur-[80px] rounded-full`}></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex flex-col items-center md:items-start">
             <div className="flex items-center gap-4 mb-4">
                <div className={`text-7xl font-black ${color} tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
                  {data.ats_score}<span className="text-2xl opacity-40">/100</span>
                </div>
                <div className={`${bg} ${border} text-black font-black px-6 py-2 rounded-2xl text-xl shadow-xl`}>
                  GRADE: {grade}
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-48 h-3 bg-white/5 rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${bg} transition-all duration-[2s] ease-out`}
                     style={{ width: `${data.ats_score}%` }}
                   ></div>
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Keyword Match: {data.keyword_match_percent}%
                </span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
             <div className="glass-card p-4 rounded-2xl border-white/5 text-center">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                <p className={`font-black uppercase tracking-tighter ${color}`}>
                   {data.ats_score >= 70 ? 'Optimal' : 'Needs Work'}
                </p>
             </div>
             <div className="glass-card p-4 rounded-2xl border-white/5 text-center">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Rank</p>
                <p className="font-black text-white uppercase tracking-tighter">
                   Top {Math.max(1, 100 - data.ats_score)}%
                </p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] border-white/10 overflow-hidden">
             <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ListChecks size={14} className="text-blue-500" />
                Section Integrity Analysis
             </h3>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Section</th>
                      <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Score</th>
                      <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Max</th>
                      <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {Object.entries(data.section_scores).map(([section, score]) => {
                      const { icon, status, color: sColor, max } = getSectionStatus(section, score);
                      return (
                        <tr key={section} className="group/row hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 font-bold text-white text-sm capitalize">{section}</td>
                          <td className="py-4 font-black text-sm">{score}</td>
                          <td className="py-4 font-bold text-gray-600 text-xs">{max}</td>
                          <td className={`py-4 text-right flex items-center justify-end gap-2 font-black text-[10px] uppercase tracking-widest ${sColor}`}>
                            {icon} {status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="glass-card p-8 rounded-[2.5rem] border-white/5 relative group overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/5 blur-[40px] rounded-full"></div>
                <h4 className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <Check size={14} /> Matched Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                   {data.matched_keywords.map(kw => (
                      <span key={kw} className="px-3 py-1.5 bg-green-500/10 text-green-400 text-[9px] font-black rounded-lg border border-green-500/20 uppercase tracking-wider">
                         {kw}
                      </span>
                   ))}
                </div>
             </div>
             <div className="glass-card p-8 rounded-[2.5rem] border-white/5 relative group overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 blur-[40px] rounded-full"></div>
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <X size={14} /> Missing High-Impact
                </h4>
                <div className="flex flex-wrap gap-2">
                   {data.missing_keywords.map(kw => (
                      <span key={kw} className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[9px] font-black rounded-lg border border-red-500/20 uppercase tracking-wider">
                         {kw}
                      </span>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
           <div className="glass-card p-8 rounded-[2.5rem] border-orange-500/20 bg-orange-500/5">
              <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <ShieldAlert size={16} /> Critical Fixes Required
              </h4>
              <div className="space-y-4">
                 {data.critical_fixes.map((fix, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-orange-500/30 transition-all">
                       <span className="w-6 h-6 bg-orange-500/10 text-orange-500 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0">
                          {i + 1}
                       </span>
                       <p className="text-gray-300 text-[13px] font-medium leading-relaxed group-hover:text-white">
                          {fix}
                       </p>
                    </div>
                 ))}
              </div>
           </div>

           {data.format_issues && data.format_issues.length > 0 && (
              <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
                 <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-yellow-500" /> Format & Layout
                 </h4>
                 <div className="space-y-3">
                    {data.format_issues.map((issue, i) => (
                       <p key={i} className="text-xs font-medium text-gray-500 flex items-center gap-3">
                          <span className="w-1.5 h-1.5 bg-yellow-500/40 rounded-full"></span>
                          {issue}
                       </p>
                    ))}
                 </div>
              </div>
           )}

           <div className="glass-card p-8 rounded-[2.5rem] border-blue-500/20 bg-blue-500/5 text-center group">
              <Award className="w-12 h-12 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-white font-black uppercase tracking-tighter mb-2">Ready for Submission?</h4>
              <p className="text-xs text-gray-500 font-medium mb-6">Your profile alignment is {grade === 'A' ? 'Exemplary' : 'Improving'}. Implement the fixes above to hit 90+ score.</p>
              <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl">
                 Download Optimized PDF
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
