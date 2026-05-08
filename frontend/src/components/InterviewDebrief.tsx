import { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, RefreshCcw, LayoutDashboard, Award, Zap, TrendingUp, Activity, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import SessionPDF from './SessionPDF';
import { useCareerStore } from '../store/useCareerStore';
import ModuleFeedback from './ModuleFeedback';

interface InterviewDebriefProps {
  report: any;
  onRestart: () => void;
  onDashboard: () => void;
}

const InterviewDebrief: React.FC<InterviewDebriefProps> = ({ report, onRestart, onDashboard }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [openQ, setOpenQ] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(true);
  const navigate = useNavigate();
  const { sessions, resumeData } = useCareerStore();
  
  const currentSession = sessions[0];
  
  useEffect(() => {
    let current = 0;
    const target = report.overall_score;
    const timer = setInterval(() => {
      current += 2;
      if (current >= target) { setDisplayScore(target); clearInterval(timer); }
      else setDisplayScore(current);
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

  const gradeColor = report.overall_score >= 80 ? '#10b981' : report.overall_score >= 60 ? '#3b82f6' : '#f59e0b';

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl overflow-y-auto p-20 animate-in fade-in duration-500 text-white">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="glass-card p-16 rounded-[4rem] border-white/10 text-center relative overflow-hidden bg-black/40">
           <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: gradeColor }}></div>
           
           {report.nervousness_label && (
             <div className="absolute top-8 right-8">
                <div className={`px-5 py-2.5 rounded-full border font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl backdrop-blur-md
                  ${report.nervousness_label === 'Calm' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 
                    report.nervousness_label === 'Moderate' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 
                    'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                   <Activity size={14} className="animate-pulse" /> Delivery: {report.nervousness_label} ({report.nervousness_index}%)
                </div>
             </div>
           )}

           <div className="relative inline-flex items-center justify-center w-64 h-64 mb-10">
              <svg className="w-full h-full transform -rotate-90 scale-125">
                 <circle cx="128" cy="128" r="110" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                 <circle cx="128" cy="128" r="110" stroke={gradeColor} strokeWidth="8" fill="transparent" strokeDasharray={691.15} strokeDashoffset={691.15 - (691.15 * displayScore) / 100} />
              </svg>
              <span className="absolute text-8xl font-black text-white">{displayScore}</span>
           </div>
           <p className="text-xl font-bold text-gray-300 italic">"{report.summary}"</p>
           
           <div className="mt-12 flex justify-center">
              {currentSession && (
                <PDFDownloadLink
                  document={<SessionPDF session={currentSession} userName={resumeData?.name || 'Professional'} />}
                  fileName={`Interview_Session_${currentSession.date}.pdf`}
                  className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl flex items-center gap-3 border border-blue-400/20"
                >
                  {({ loading: l }) => (l ? <Loader2 className="animate-spin" size={14} /> : <><Download size={14} /> Download Full Transcript</>)}
                </PDFDownloadLink>
              )}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="glass-card p-12 rounded-[3rem] border-white/10 flex flex-col items-center">
              <h3 className="text-xs font-black text-gray-500 uppercase self-start flex items-center gap-2"><TrendingUp size={14} /> Radar</h3>
              <div className="w-full h-72"><ResponsiveContainer><RadarChart data={radarData}><PolarGrid stroke="rgba(255,255,255,0.1)" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} /><Radar dataKey="score" stroke={gradeColor} fill={gradeColor} fillOpacity={0.3} /></RadarChart></ResponsiveContainer></div>
           </div>
           <div className="space-y-6">
              <div className="glass-card p-10 rounded-[2.5rem] bg-green-500/5">
                 <h4 className="text-[10px] font-black text-green-500 uppercase flex items-center gap-2"><CheckCircle2 size={16} /> Strengths</h4>
                 {report.strengths?.map((s: string, i: number) => <p key={i} className="text-xs font-bold text-gray-300">• {s}</p>)}
              </div>
              <div className="glass-card p-10 rounded-[2.5rem] bg-orange-500/5">
                 <h4 className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-2"><AlertCircle size={16} /> Gaps</h4>
                 {report.optimization_gaps?.map((g: string, i: number) => <p key={i} className="text-xs font-bold text-gray-300">• {g}</p>)}
              </div>
           </div>
        </div>

        {showFeedback && (
           <div className="flex justify-center">
              <ModuleFeedback module="Live Interview Room" session_id={currentSession?.id} onClose={() => setShowFeedback(false)} />
           </div>
        )}

        <div className="space-y-4">
           {report.answer_breakdown?.map((item: any, i: number) => (
              <div key={i} className="glass-card rounded-[2rem] border-white/5 overflow-hidden">
                 <button onClick={() => setOpenQ(openQ === i ? null : i)} className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <span className="text-sm font-bold text-white">Q{i + 1}: {item.question}</span>
                    {openQ === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </button>
                 {openQ === i && <div className="p-10 bg-black/40 border-t border-white/5"><p className="text-sm text-gray-300">{item.feedback}</p></div>}
              </div>
           ))}
        </div>

        <div className="flex justify-center gap-6 pb-20">
           <button onClick={onRestart} className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase flex items-center gap-3"><RefreshCcw size={16} /> Restart</button>
           <button onClick={onDashboard} className="px-12 py-5 bg-white/5 text-gray-400 rounded-2xl font-black uppercase flex items-center gap-3"><LayoutDashboard size={16} /> Dashboard</button>
        </div>
      </div>
    </div>
  );
};

export default InterviewDebrief;
