import React, { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, RefreshCcw, LayoutDashboard, Award, Zap, TrendingUp, BarChart3 } from 'lucide-react';

interface InterviewDebriefProps {
  report: any;
  onRestart: () => void;
}

const InterviewDebrief: React.FC<InterviewDebriefProps> = ({ report, onRestart }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [openQ, setOpenQ] = useState<number | null>(null);
  
  useEffect(() => {
    let current = 0;
    const target = report.overall_score;
    const timer = setInterval(() => {
      current += 2;
      if (current >= target) { 
        setDisplayScore(target); 
        clearInterval(timer); 
      } else {
        setDisplayScore(current);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [report.overall_score]);

  const radarData = [
    { subject: 'Technical', score: report.dimension_scores?.technical_depth || 0 },
    { subject: 'Communication', score: report.dimension_scores?.communication || 0 },
    { subject: 'Problem Solving', score: report.dimension_scores?.problem_solving || 0 },
    { subject: 'Confidence', score: report.dimension_scores?.confidence || 0 },
    { subject: 'Relevance', score: report.dimension_scores?.relevance || 0 },
  ];

  const gradeColor = report.overall_score >= 80 ? '#10b981'
                   : report.overall_score >= 60 ? '#3b82f6'
                   : report.overall_score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto py-20 px-6 space-y-12">
        
        {/* Score Reveal Header */}
        <div className="glass-card p-16 rounded-[4rem] border-white/10 text-center relative overflow-hidden shadow-[0_0_150px_-30px_rgba(59,130,246,0.3)] bg-black/40">
           <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: gradeColor }}></div>
           
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-10">Neural Evaluation Complete</p>
           
           <div className="relative inline-flex items-center justify-center w-64 h-64 mb-10">
              <svg className="w-full h-full transform -rotate-90 scale-125">
                 <circle cx="128" cy="128" r="110" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                 <circle 
                   cx="128" cy="128" r="110" stroke={gradeColor} strokeWidth="8" fill="transparent" 
                   strokeDasharray={691.15} strokeDashoffset={691.15 - (691.15 * displayScore) / 100} 
                   className="transition-all duration-1000 ease-out"
                 />
              </svg>
              <div className="absolute flex flex-col items-center">
                 <span className="text-8xl font-black text-white tracking-tighter">{displayScore}</span>
                 <span className="text-xs font-black text-gray-500 uppercase tracking-widest mt-1">Placement Index</span>
              </div>
           </div>

           <div className="space-y-6">
              <div className="inline-block px-8 py-3 rounded-2xl font-black text-2xl shadow-2xl border border-white/10" style={{ backgroundColor: `${gradeColor}20`, color: gradeColor }}>
                 GRADE: {report.composite_grade}
              </div>
              <p className="text-xl font-bold text-gray-300 max-w-2xl mx-auto leading-relaxed italic">
                 "{report.summary}"
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* Radar Breakdown */}
           <div className="glass-card p-12 rounded-[3rem] border-white/10 flex flex-col items-center justify-center">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-10 self-start flex items-center gap-2">
                 <TrendingUp size={14} className="text-blue-500" /> Behavioral Fingerprint
              </h3>
              <div className="w-full h-72">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                       <PolarGrid stroke="rgba(255,255,255,0.1)" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />
                       <Radar dataKey="score" stroke={gradeColor} fill={gradeColor} fillOpacity={0.3} dot={{ r: 4, fill: gradeColor }} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Strengths & Gaps */}
           <div className="space-y-6">
              <div className="glass-card p-10 rounded-[2.5rem] border-green-500/10 bg-green-500/5">
                 <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Neural Strengths
                 </h4>
                 <div className="space-y-4">
                    {report.strengths?.map((s: string, i: number) => (
                       <div key={i} className="flex items-start gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                          <div className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                          <p className="text-xs font-bold text-gray-300">{s}</p>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="glass-card p-10 rounded-[2.5rem] border-orange-500/10 bg-orange-500/5">
                 <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <AlertCircle size={16} /> Optimization Gaps
                 </h4>
                 <div className="space-y-4">
                    {report.optimization_gaps?.map((g: string, i: number) => (
                       <div key={i} className="flex items-start gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                          <div className="mt-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_#f59e0b]"></div>
                          <p className="text-xs font-bold text-gray-300">{g}</p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Detailed Question Breakdown */}
        <div className="space-y-8">
           <h3 className="text-3xl font-black text-white tracking-tighter px-4 flex items-center gap-4">
              PHASE BREAKDOWN
              <div className="h-px bg-white/10 flex-1"></div>
           </h3>
           <div className="space-y-4">
              {report.answer_breakdown?.map((item: any, i: number) => (
                 <div key={i} className="glass-card rounded-[2rem] border-white/5 overflow-hidden transition-all group">
                    <button 
                      onClick={() => setOpenQ(openQ === i ? null : i)}
                      className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                       <div className="flex items-center gap-6 text-left">
                          <span className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center font-black text-gray-500 border border-white/10 group-hover:text-blue-500 transition-all">{i + 1}</span>
                          <p className="text-sm font-bold text-white pr-10">{item.question}</p>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-right hidden md:block">
                             <p className="text-[9px] font-black text-gray-600 uppercase mb-0.5">Phase Score</p>
                             <p className="font-black text-white" style={{ color: item.score >= 7 ? '#10b981' : '#f59e0b' }}>{item.score}/10</p>
                          </div>
                          {openQ === i ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                       </div>
                    </button>
                    {openQ === i && (
                       <div className="p-10 bg-black/40 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="space-y-4">
                                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Neural Transcription Summary</p>
                                <p className="text-sm text-gray-400 leading-relaxed font-medium italic">"{item.answer_summary}"</p>
                             </div>
                             <div className="space-y-4">
                                <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest">AI Feedback Logic</p>
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 relative">
                                   <Zap className="absolute top-4 right-4 text-purple-500/20" size={24} />
                                   <p className="text-sm text-gray-300 leading-relaxed font-bold">{item.feedback}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </div>

        {/* Next Steps */}
        <div className="glass-card p-12 rounded-[3.5rem] border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5">
              <Award size={100} className="text-blue-500" />
           </div>
           <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-10 flex items-center gap-2">
              <Zap size={14} /> Neural Roadmap: Priority Actions
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {report.next_steps?.map((step: string, i: number) => (
                 <div key={i} className="flex items-center gap-6 group">
                    <span className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-xl group-hover:scale-110 transition-transform">{i + 1}</span>
                    <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{step}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10">
           <button 
             onClick={onRestart}
             className="px-12 py-5 bg-white text-black rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3"
           >
              <RefreshCcw size={16} />
              Re-Initialize Simulation
           </button>
           <button 
             onClick={() => window.location.reload()}
             className="px-12 py-5 bg-white/5 text-gray-400 border border-white/5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-white/10 hover:text-white transition-all flex items-center gap-3"
           >
              <LayoutDashboard size={16} />
              Neural Dashboard
           </button>
        </div>

      </div>
    </div>
  );
};

export default InterviewDebrief;
