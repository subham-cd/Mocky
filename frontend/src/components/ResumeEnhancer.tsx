import React, { useState } from 'react';
import { Sparkles, Zap, Target, ShieldCheck, Info, TrendingUp, Download, Loader2, Check, FileText, ArrowRight } from 'lucide-react';
import axios from 'axios';
import JDTailoringResult from './JDTailoringResult';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResumePDF from './ResumePDF';
import { motion } from 'framer-motion';

interface ResumeEnhancerProps {
  resumeData: any;
  targetRole: string;
  jobDescription?: string;
}

const ResumeEnhancer: React.FC<ResumeEnhancerProps> = ({ resumeData, targetRole, jobDescription }) => {
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'general' | 'tailor'>('general');
  const [result, setResult] = useState<any>(null);
  const [tailorResult, setTailorResult] = useState<any>(null);

  const handleEnhance = async () => {
    setMode('general');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/resume/enhance`, {
        resume_text: resumeData.raw_text,
        target_role: targetRole
      });
      setResult(response.data);
      setTailorResult(null);
    } catch (err) {
      console.error("Enhance Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTailor = async () => {
    if (!jobDescription) return;
    setMode('tailor');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/resume/tailor`, {
        resume_text: resumeData.raw_text,
        job_description: jobDescription
      });
      if (response.data.success) {
        setTailorResult(response.data.result);
        setResult(null);
      }
    } catch (err) {
      console.error("Tailor Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const liftAmount = result ? result.impact_score_after - result.impact_score_before : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-20 px-4 md:px-0">
      {loading && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-10">
                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-purple-500 w-10 h-10 animate-pulse" />
                </div>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-[0.4em] mb-4">Neural Optimizer Active</h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Surgically rewriting your professional profile...</p>
        </div>
      )}
      
      {!result && !tailorResult ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* General Enhancement Card */}
          <div className="glass-card p-12 rounded-[3rem] border-white/10 text-center flex flex-col items-center group hover:bg-white/[0.03] transition-all">
            <div className="bg-purple-500/10 p-6 rounded-3xl mb-8 group-hover:scale-110 transition-transform">
              <Sparkles className="text-purple-500 w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Neural Optimizer</h2>
            <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed max-w-xs">
              Surgically rewrite your resume using high-impact action verbs and quantified metrics tailored for <span className="text-purple-400">{targetRole}</span>.
            </p>
            <button
              onClick={handleEnhance}
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-xs tracking-widest hover:shadow-2xl hover:shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading && mode === 'general' ? "NEURAL ENGINE ACTIVE..." : "ACTIVATE OPTIMIZER"}
              <Zap size={18} />
            </button>
          </div>

          {/* JD Tailoring Card */}
          <div className={`glass-card p-12 rounded-[3rem] border-white/10 text-center flex flex-col items-center group hover:bg-white/[0.03] transition-all ${!jobDescription ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
            <div className="bg-blue-500/10 p-6 rounded-3xl mb-8 group-hover:scale-110 transition-transform">
              <Target className="text-blue-500 w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Precision Tailoring</h2>
            <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed max-w-xs">
              Align your profile with the specific Job Description provided to beat automated ATS filters with 99% accuracy.
            </p>
            <button
              onClick={handleTailor}
              disabled={loading || !jobDescription}
              className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs tracking-widest hover:bg-blue-500 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading && mode === 'tailor' ? "MATCHING SYMBOLS..." : "START TAILORING"}
              <ShieldCheck size={18} />
            </button>
            {!jobDescription && (
              <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest mt-4 flex items-center gap-2">
                 <Info size={12} /> Paste JD in ATS tab first
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in duration-500">
          {/* Mode Header */}
          <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/5">
             <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${result ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                   {result ? <Sparkles size={24} /> : <ShieldCheck size={24} />}
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                      {result ? 'Neural Impact Optimization' : 'Precision Tailored Profile'}
                   </h3>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">
                      Targeting: {targetRole}
                   </p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <PDFDownloadLink
                  document={<ResumePDF resumeData={resumeData} enhancedData={result} tailoredData={tailorResult} />}
                  fileName={result ? "optimized_resume.pdf" : "tailored_resume.pdf"}
                  className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl flex items-center gap-2"
                >
                  {({ loading: l }) => (l ? <Loader2 className="animate-spin" size={14} /> : <><Download size={14} /> Download PDF</>)}
                </PDFDownloadLink>
                <button 
                  onClick={() => { setResult(null); setTailorResult(null); }}
                  className="px-8 py-3 bg-white/5 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:text-white hover:bg-white/10 transition-all"
                >
                  Reset Module
                </button>
             </div>
          </div>

          {/* General Enhancement View */}
          {result && (
            <div className="space-y-12">
               {/* Impact Banner */}
               <div className="glass-card p-10 rounded-[2.5rem] border-purple-500/20 bg-purple-500/5 flex flex-col md:flex-row items-center justify-around gap-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5" />
                  <div className="text-center relative z-10">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Baseline Impact</p>
                    <strong className="text-4xl font-black text-white">{result.impact_score_before}<span className="text-sm opacity-20 ml-1">/100</span></strong>
                  </div>
                  
                  <div className="flex flex-col items-center relative z-10">
                     <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`p-4 rounded-full mb-2 shadow-2xl ${liftAmount >= 20 ? 'bg-green-500/20 text-green-500' : 'bg-purple-500/20 text-purple-500'}`}
                     >
                        <TrendingUp size={32} />
                     </motion.div>
                     <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${liftAmount >= 20 ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-purple-500/10 border-purple-500/30 text-purple-500'}`}
                     >
                       +{liftAmount} POWER LIFT
                     </motion.div>
                  </div>

                  <div className="text-center relative z-10">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Neural Optimized</p>
                    <strong className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      {result.impact_score_after}<span className="text-xl opacity-20 ml-1">/100</span>
                    </strong>
                  </div>
               </div>

               {/* Key Differentiators */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {result.key_differentiators?.map((diff: any, i: number) => (
                    <div key={i} className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
                       <h4 className="text-[9px] font-black text-purple-500 uppercase tracking-widest">{diff.area}</h4>
                       <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 line-through">Before: {diff.before}</p>
                          <p className="text-xs font-bold text-white flex items-center gap-2">
                             <Check size={12} className="text-green-500" /> {diff.after}
                          </p>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Section Diffs */}
               <div className="space-y-16">
                  {/* Summary */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] px-2 flex items-center gap-3">
                       <FileText size={14} /> Professional Narrative Update
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="glass-card p-8 rounded-3xl border-white/5 opacity-40">
                          <p className="text-sm text-gray-400 leading-relaxed italic">"{result.sections?.summary?.original}"</p>
                       </div>
                       <div className="glass-card p-8 rounded-3xl border-purple-500/20 bg-purple-500/5 shadow-xl relative">
                          <div className="absolute -top-3 -left-3 bg-purple-600 text-white p-2 rounded-lg shadow-lg"><Zap size={16} /></div>
                          <p className="text-sm text-white font-bold leading-relaxed">"{result.sections?.summary?.enhanced}"</p>
                       </div>
                    </div>
                  </div>

                  {/* Experience - The Core Fix */}
                  <div className="space-y-10">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] px-2 flex items-center gap-3">
                       <Zap size={14} /> Strategic Bullet Transformation
                    </h4>
                    {result.sections?.experience?.map((exp: any, i: number) => (
                      <div key={i} className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
                         <div className="flex justify-between items-center border-b border-white/5 pb-6">
                            <div>
                               <h5 className="text-2xl font-black text-white tracking-tight">{exp.role}</h5>
                               <p className="text-xs font-black text-purple-500 uppercase tracking-widest mt-1">{exp.company}</p>
                            </div>
                         </div>
                         
                         <div className="space-y-6">
                            {exp.original_bullets?.map((b: string, j: number) => (
                               <div key={j} className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
                                  <div className="lg:col-span-5 p-5 bg-white/[0.01] rounded-2xl border border-dashed border-white/5 opacity-40">
                                     <p className="text-xs text-gray-400">{b}</p>
                                  </div>
                                  <div className="lg:col-span-1 flex justify-center text-purple-500 opacity-20">
                                     <ArrowRight size={20} />
                                  </div>
                                  <div className="lg:col-span-5 p-5 bg-green-500/5 rounded-2xl border border-green-500/10 shadow-sm">
                                     <p className="text-xs text-white font-bold">{exp.enhanced_bullets?.[j] || 'Optimizing...'}</p>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="glass-card p-10 rounded-[2.5rem] border-white/5">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">Targeted Tech Stack Expansion</h4>
                        <div className="flex flex-wrap gap-2">
                           {result.sections?.skills?.enhanced?.map((s: string) => (
                              <span key={s} className="px-4 py-2 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-xl border border-purple-500/20 uppercase tracking-wider">
                                 {s}
                              </span>
                           ))}
                        </div>
                     </div>
                     <div className="glass-card p-10 rounded-[2.5rem] border-green-500/10 bg-green-500/5">
                        <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                           <Sparkles size={14} /> Ecosystem Gap Injections
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {result.sections?.skills?.added?.map((s: string) => (
                              <span key={s} className="px-4 py-2 bg-green-500/10 text-green-400 text-[10px] font-black rounded-xl border border-green-500/20 uppercase tracking-wider">
                                 {s}
                              </span>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Tailoring View */}
          {tailorResult && <JDTailoringResult result={tailorResult} />}
        </div>
      )}
    </div>
  );
};

export default ResumeEnhancer;
