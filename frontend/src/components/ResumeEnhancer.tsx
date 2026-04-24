import React, { useState } from 'react';
import { Sparkles, Zap, Target, ShieldCheck, Info, TrendingUp, Download, Loader2, Check, FileText } from 'lucide-react';
import axios from 'axios';
import JDTailoringResult from './JDTailoringResult';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResumePDF from './ResumePDF';

interface ResumeEnhancerProps {
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
}

const ResumeEnhancer: React.FC<ResumeEnhancerProps> = ({ resumeText, targetRole, jobDescription }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'general' | 'tailor'>('general');
  const [result, setResult] = useState<any>(null);
  const [tailorResult, setTailorResult] = useState<any>(null);

  const handleEnhance = async () => {
    setMode('general');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/resume/enhance`, {
        resume_text: resumeText,
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
        resume_text: resumeText,
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

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
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
                {result && (
                  <PDFDownloadLink
                    document={<ResumePDF resumeData={{...result, skills: result.sections?.skills?.enhanced}} />}
                    fileName="optimized_resume.pdf"
                    className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl flex items-center gap-2"
                  >
                    {({ loading: l }) => (l ? <Loader2 className="animate-spin" size={14} /> : <><Download size={14} /> Download PDF</>)}
                  </PDFDownloadLink>
                )}
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
               <div className="glass-card p-10 rounded-[2.5rem] border-purple-500/20 bg-purple-500/5 flex flex-col md:flex-row items-center justify-around gap-8">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Original Impact</p>
                    <strong className="text-4xl font-black text-white">{result.impact_score_before}/100</strong>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="bg-purple-500/20 p-3 rounded-full mb-2 animate-pulse">
                        <TrendingUp className="text-purple-500" size={24} />
                     </div>
                     <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                       +{result.impact_score_after - result.impact_score_before} Power Lift
                     </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Optimized Score</p>
                    <strong className="text-5xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">{result.impact_score_after}/100</strong>
                  </div>
               </div>

               {/* Improvements List */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {result.key_improvements?.map((imp: string, i: number) => (
                    <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-4">
                       <div className="mt-1 bg-purple-500/10 p-1.5 rounded-lg">
                          <Check size={14} className="text-purple-500" />
                       </div>
                       <p className="text-xs font-bold text-gray-300 leading-relaxed">{imp}</p>
                    </div>
                  ))}
               </div>

               {/* Section Diffs */}
               <div className="space-y-10">
                  {/* Summary */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] px-2 flex items-center gap-3">
                       <FileText size={14} /> Professional Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="glass-card p-8 rounded-3xl border-white/5 opacity-50 relative">
                          <span className="absolute top-4 right-6 text-[9px] font-black text-gray-600 uppercase">Original</span>
                          <p className="text-sm text-gray-400 font-medium leading-relaxed">{result.sections?.summary?.original}</p>
                       </div>
                       <div className="glass-card p-8 rounded-3xl border-purple-500/20 shadow-xl relative">
                          <span className="absolute top-4 right-6 text-[9px] font-black text-purple-500 uppercase">Enhanced</span>
                          <p className="text-sm text-white font-bold leading-relaxed">{result.sections?.summary?.enhanced}</p>
                       </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] px-2 flex items-center gap-3">
                       <Zap size={14} /> Work History
                    </h4>
                    {result.sections?.experience?.map((exp: any, i: number) => (
                      <div key={i} className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
                         <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <div>
                               <h5 className="text-xl font-black text-white">{exp.role}</h5>
                               <p className="text-xs font-black text-gray-500 uppercase tracking-widest mt-1">{exp.company}</p>
                            </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3 opacity-50">
                               {exp.original_bullets?.map((b: string, j: number) => (
                                  <p key={j} className="text-sm text-gray-400 flex items-start gap-3">
                                     <span className="mt-2 w-1 h-1 bg-gray-600 rounded-full shrink-0" /> {b}
                                  </p>
                               ))}
                            </div>
                            <div className="space-y-3">
                               {exp.enhanced_bullets?.map((b: string, j: number) => (
                                  <p key={j} className="text-sm text-white font-bold flex items-start gap-3 bg-purple-500/5 p-3 rounded-xl border border-purple-500/10">
                                     <span className="mt-2 w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0 shadow-[0_0_5px_#a855f7]" /> {b}
                                  </p>
                               ))}
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="glass-card p-8 rounded-3xl border-white/5">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Semantic Expansion</h4>
                        <div className="flex flex-wrap gap-2">
                           {result.sections?.skills?.enhanced?.map((s: string) => (
                              <span key={s} className="px-3 py-1.5 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-lg border border-purple-500/20 uppercase tracking-wider">
                                 {s}
                              </span>
                           ))}
                        </div>
                     </div>
                     <div className="glass-card p-8 rounded-3xl border-green-500/10 bg-green-500/5">
                        <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <Sparkles size={14} /> Neural Recommendations
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {result.sections?.skills?.added?.map((s: string) => (
                              <span key={s} className="px-3 py-1.5 bg-green-500/10 text-green-400 text-[10px] font-black rounded-lg border border-green-500/20 uppercase tracking-wider">
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
