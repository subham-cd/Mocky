import React from 'react';
import { Check, X, Sparkles, TrendingUp, Download, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResumePDF from './ResumePDF';

interface JDTailoringResultProps {
  result: {
    tailored_summary: {
      original: string;
      tailored: string;
    };
    skills_to_add: string[];
    skills_to_highlight: string[];
    skills_to_remove: string[];
    bullet_rewrites: Array<{
      original: string;
      tailored: string;
      reason: string;
    }>;
    keywords_injected: string[];
    ats_score_before: number;
    ats_score_after: number;
    changes_summary: string;
  };
}

const JDTailoringResult: React.FC<JDTailoringResultProps> = ({ result }) => {
  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="glass-card p-10 rounded-[2.5rem] border-blue-500/20 bg-blue-500/5 flex flex-col md:flex-row items-center justify-around gap-8">
        <div className="text-center">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Before</p>
          <strong className="text-4xl font-black text-white">{result.ats_score_before}/100</strong>
        </div>
        <div className="flex flex-col items-center">
           <div className="bg-blue-500/20 p-3 rounded-full mb-2">
              <TrendingUp className="text-blue-500" size={24} />
           </div>
           <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">
             +{result.ats_score_after - result.ats_score_before} Points Lift
           </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">After Tailoring</p>
          <strong className="text-5xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">{result.ats_score_after}/100</strong>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] px-2">Neural Summary Rewrite</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-8 rounded-3xl border-white/5 opacity-50 relative">
            <span className="absolute top-4 right-6 text-[9px] font-black text-gray-600 uppercase">Original</span>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">{result.tailored_summary?.original || "(no summary provided)"}</p>
          </div>
          <div className="glass-card p-8 rounded-3xl border-blue-500/20 shadow-xl relative">
            <span className="absolute top-4 right-6 text-[9px] font-black text-blue-500 uppercase">Tailored</span>
            <p className="text-sm text-white font-bold leading-relaxed">{result.tailored_summary?.tailored}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] px-2">Strategic Bullet Rewrites</h3>
        <div className="space-y-6">
          {result.bullet_rewrites?.map((item, i) => (
            <div key={i} className="glass-card p-8 rounded-[2rem] border-white/5 space-y-6 group hover:border-blue-500/30 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 opacity-60">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-2">Before</p>
                  <p className="text-sm text-gray-400 line-through leading-relaxed">{item.original}</p>
                </div>
                <div className="p-6 bg-green-500/5 rounded-2xl border border-green-500/10 relative">
                  <div className="absolute -top-3 -right-3 bg-green-500 p-1.5 rounded-lg shadow-lg">
                     <Sparkles size={12} className="text-black" />
                  </div>
                  <p className="text-[9px] font-black text-green-500 uppercase mb-2">Tailored</p>
                  <p className="text-sm text-white font-bold leading-relaxed">{item.tailored}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                 <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest italic flex-1">
                    <span className="text-blue-500 not-italic">Strategy:</span> {item.reason}
                 </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-3xl border-green-500/10">
          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Check size={14} /> Skills to Add
          </p>
          <div className="flex flex-wrap gap-2">
            {result.skills_to_add?.map(s => (
              <span key={s} className="px-3 py-1.5 bg-green-500/10 text-green-400 text-[10px] font-black rounded-lg border border-green-500/20 uppercase">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="glass-card p-8 rounded-3xl border-blue-500/10">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Sparkles size={14} /> Skills to Highlight
          </p>
          <div className="flex flex-wrap gap-2">
            {result.skills_to_highlight?.map(s => (
              <span key={s} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-lg border border-blue-500/20 uppercase">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="glass-card p-8 rounded-3xl border-red-500/10">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <X size={14} /> Consider Removing
          </p>
          <div className="flex flex-wrap gap-2">
            {result.skills_to_remove?.map(s => (
              <span key={s} className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[10px] font-black rounded-lg border border-red-500/20 uppercase opacity-50">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/10 relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
         <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Consultant's Final Note</h4>
         <p className="text-sm text-gray-300 font-medium leading-relaxed italic pr-4">
           "{result.changes_summary}"
         </p>
      </div>

      <div className="flex justify-center pb-10">
        <PDFDownloadLink
          document={<ResumePDF resumeData={result} tailoredData={result} />}
          fileName="tailored_resume.pdf"
          className="px-12 py-5 bg-white text-black rounded-2xl font-black text-sm tracking-[0.3em] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3"
        >
          {({ loading }) => (loading ? <Loader2 className="animate-spin" size={16} /> : <><Download size={16} /> Download Tailored Resume</>)}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default JDTailoringResult;
