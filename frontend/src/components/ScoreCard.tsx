import React from 'react';
import { Check, AlertTriangle, X, ShieldAlert, Award, ListChecks } from 'lucide-react';

interface ScoreCardProps {
  data: {
    ats_score: number; keyword_match_percent: number; matched_keywords: string[]; missing_keywords: string[]; section_scores: Record<string, number>; critical_fixes: string[]; format_issues?: string[];
  };
}

const ScoreCard: React.FC<ScoreCardProps> = ({ data }) => {
  const getGrade = (score: number) => {
    if (score >= 85) return { grade: "A", color: "text-green-400", bg: "bg-green-400" };
    if (score >= 70) return { grade: "B+", color: "text-blue-400", bg: "bg-blue-400" };
    return { grade: "C", color: "text-yellow-400", bg: "bg-yellow-400" };
  };

  const { grade, color, bg } = getGrade(data.ats_score);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="glass-card p-10 rounded-[3rem] border-white/10 relative overflow-hidden group">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4 mb-4">
             <div className={`text-7xl font-black ${color}`}>{data.ats_score}<span className="text-2xl opacity-40">/100</span></div>
             <div className={`${bg} text-black font-black px-6 py-2 rounded-2xl text-xl shadow-xl`}>GRADE: {grade}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] border-white/10 overflow-hidden">
             <h3 className="text-xs font-black text-gray-500 uppercase flex items-center gap-2"><ListChecks size={14} className="text-blue-500" /> Analysis</h3>
             <table className="w-full text-left">
               <thead><tr className="border-b border-white/5"><th className="pb-4 text-[10px] font-black text-gray-500 uppercase">Section</th><th className="pb-4 text-[10px] font-black text-gray-500 uppercase">Score</th><th className="pb-4 text-[10px] font-black text-gray-500 uppercase text-right">Status</th></tr></thead>
               <tbody className="divide-y divide-white/5">
                 {Object.entries(data.section_scores).map(([section, score]) => (
                   <tr key={section} className="hover:bg-white/[0.02] transition-colors">
                     <td className="py-4 font-bold text-white text-sm capitalize">{section}</td>
                     <td className="py-4 font-black text-sm">{score}</td>
                     <td className="py-4 text-right flex items-center justify-end gap-2 font-black text-[10px] uppercase">{score > 10 ? <Check size={14} /> : <X size={14} />}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
           <div className="glass-card p-8 rounded-[2.5rem] border-orange-500/20 bg-orange-500/5">
              <h4 className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-2"><ShieldAlert size={16} /> Critical Fixes</h4>
              <div className="space-y-4">{data.critical_fixes.map((fix, i) => <p key={i} className="text-gray-300 text-[13px] font-medium leading-relaxed">• {fix}</p>)}</div>
           </div>
           <div className="glass-card p-8 rounded-[2.5rem] border-blue-500/20 bg-blue-500/5 text-center group"><Award size={48} className="text-blue-500 mx-auto mb-4" /><h4 className="text-white font-black uppercase">Ready for Submission?</h4></div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
