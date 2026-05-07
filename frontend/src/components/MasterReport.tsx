import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, TrendingUp, ShieldAlert, CheckCircle2, Calendar, Zap, LayoutDashboard, Brain, Activity } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import axios from 'axios';
import { useCareerStore } from '../store/useCareerStore';
import ReportPDF from './ReportPDF';
import { useNavigate } from 'react-router-dom';

const MasterReport: React.FC = () => {
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim();
  const { resumeData, atsResult, interviewReport, sessions, targetRole } = useCareerStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/report/master-report`, {
        resumeData,
        atsResult,
        interviewReport,
        codingResults: sessions.filter(s => s.type === 'coding'),
        targetRole
      });
      setReport(response.data);
    } catch (err) {
      console.error("Report Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!report && !loading) {
      generateReport();
    }
  }, []);

  if (loading || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10">
         <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
               <FileText className="text-blue-500 w-10 h-10 animate-pulse" />
            </div>
         </div>
         <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-white uppercase tracking-[0.4em]">Synthesizing Intelligence</h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Aggregating cross-platform neural metrics...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/[0.02] p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
         <div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-4">Master Career Report</h1>
            <div className="flex flex-wrap gap-4">
               <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Brain size={12} /> {targetRole}
               </span>
               <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> Generated: {new Date().toLocaleDateString()}
               </span>
            </div>
         </div>
         <div className="flex gap-4">
            <PDFDownloadLink
               document={<ReportPDF reportData={report} userName={resumeData?.name || 'Candidate'} targetRole={targetRole} />}
               fileName="MockyAI_Master_Report.pdf"
               className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl flex items-center gap-3"
            >
               {({ loading: l }) => (l ? <Loader2 className="animate-spin" size={16} /> : <><Download size={16} /> Export PDF</>)}
            </PDFDownloadLink>
            <button onClick={() => navigate('/dashboard')} className="p-5 bg-white/5 text-gray-400 border border-white/10 rounded-2xl hover:text-white transition-all">
               <LayoutDashboard size={20} />
            </button>
         </div>
      </div>

      {/* Executive Summary */}
      <div className="glass-card p-12 rounded-[3rem] border-blue-500/20 bg-blue-500/5 relative">
         <div className="absolute top-8 right-12 opacity-10 text-blue-500"><Zap size={100} /></div>
         <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-8">Executive Summary</h3>
         <p className="text-2xl font-medium text-gray-200 leading-relaxed italic max-w-4xl">
            "{report.executive_summary}"
         </p>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Resume Strength', val: report.section_scores.resume_strength, icon: <FileText className="text-blue-500" /> },
           { label: 'Interview Acumen', val: report.section_scores.interview_acumen, icon: <Activity className="text-purple-500" /> },
           { label: 'Technical Flow', val: report.section_scores.technical_efficiency, icon: <Zap className="text-green-500" /> },
           { label: 'Market Ready', val: report.section_scores.market_readiness, icon: <TrendingUp className="text-yellow-500" /> },
         ].map((score, i) => (
           <div key={i} className="glass-card p-10 rounded-[3rem] border-white/10 text-center space-y-6">
              <div className="mx-auto w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">{score.icon}</div>
              <div>
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{score.label}</p>
                 <p className="text-5xl font-black text-white tracking-tighter">{score.val}%</p>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500/50" style={{ width: `${score.val}%` }} />
              </div>
           </div>
         ))}
      </div>

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="glass-card p-12 rounded-[3.5rem] border-green-500/10 bg-green-500/[0.02]">
            <h3 className="text-xs font-black text-green-500 uppercase tracking-widest mb-10 flex items-center gap-3">
               <CheckCircle2 size={18} /> Top Competitive Strengths
            </h3>
            <div className="space-y-6">
               {report.top_strengths.map((s: string, i: number) => (
                  <div key={i} className="p-6 bg-green-500/5 border border-green-500/10 rounded-2xl">
                     <p className="text-sm font-bold text-gray-200">0{i+1}. {s}</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="glass-card p-12 rounded-[3.5rem] border-red-500/10 bg-red-500/[0.02]">
            <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-10 flex items-center gap-3">
               <ShieldAlert size={18} /> Critical Optimization Gaps
            </h3>
            <div className="space-y-6">
               {report.critical_gaps.map((g: string, i: number) => (
                  <div key={i} className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                     <p className="text-sm font-bold text-gray-200">0{i+1}. {g}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* AI Verdict */}
      <div className="glass-card p-12 rounded-[3.5rem] border-indigo-500/20 bg-indigo-500/5 text-center">
         <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">Senior Architect Verdict</h3>
         <p className="text-3xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight uppercase">
            {report.ai_verdict}
         </p>
      </div>

      {/* Weekly Plan */}
      <div className="glass-card p-12 rounded-[4rem] border-white/5">
         <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-12">Neural Acceleration Strategy (3-Week Plan)</h3>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {report.weekly_action_plan.map((week: any, i: number) => (
               <div key={i} className="space-y-6 p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-blue-500 uppercase">{week.week}</span>
                     <Zap size={14} className="text-gray-700" />
                  </div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tighter">{week.focus}</h4>
                  <ul className="space-y-4">
                     {week.tasks.map((task: string, j: number) => (
                        <li key={j} className="flex gap-4 text-xs font-medium text-gray-400">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shrink-0 mt-1" />
                           {task}
                        </li>
                     ))}
                  </ul>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default MasterReport;
