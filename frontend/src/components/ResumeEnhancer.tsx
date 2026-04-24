import { useState } from 'react';
import { Sparkles, Zap, Target, ShieldCheck, Info, TrendingUp, Download, Loader2, Check } from 'lucide-react';
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
    setMode('general'); setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/resume/enhance`, { resume_text: resumeText, target_role: targetRole });
      setResult(response.data); setTailorResult(null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleTailor = async () => {
    if (!jobDescription) return;
    setMode('tailor'); setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/resume/tailor`, { resume_text: resumeText, job_description: jobDescription });
      if (response.data.success) { setTailorResult(response.data.result); setResult(null); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {!result && !tailorResult ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <button onClick={handleEnhance} className="p-12 glass-card rounded-[3rem] text-center flex flex-col items-center">Optimize <Zap /></button>
          <button onClick={handleTailor} className="p-12 glass-card rounded-[3rem] text-center flex flex-col items-center">Tailor <ShieldCheck /></button>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in duration-500">
          {result && (
            <div className="space-y-12">
               <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/5">
                  <h3 className="text-2xl font-black text-white">Neural Optimizer</h3>
                  <div className="flex items-center gap-4">
                     <PDFDownloadLink document={<ResumePDF resumeData={{...result, skills: result.sections?.skills?.enhanced}} />} fileName="optimized_resume.pdf" className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase">
                       {({ loading: l }) => (l ? <Loader2 className="animate-spin" size={14} /> : <><Download size={14} /> Download</>)}
                     </PDFDownloadLink>
                     <button onClick={() => { setResult(null); setTailorResult(null); }} className="px-8 py-3 bg-white/5 text-gray-400 rounded-xl font-black text-[10px] uppercase">Reset</button>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {result.key_improvements?.map((imp: string, i: number) => (
                    <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-4">
                       <Check size={14} className="text-purple-500" />
                       <p className="text-xs font-bold text-gray-300 leading-relaxed">{imp}</p>
                    </div>
                  ))}
               </div>
            </div>
          )}
          {tailorResult && <JDTailoringResult result={tailorResult} />}
        </div>
      )}
    </div>
  );
};

export default ResumeEnhancer;
