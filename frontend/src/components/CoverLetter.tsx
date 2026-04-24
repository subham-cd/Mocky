import React, { useState } from 'react';
import { Mail, Sparkles, Copy, Check, Loader2, Send, Building2, FileText, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useCareerStore } from '../store/useCareerStore';

const CoverLetterGenerator: React.FC = () => {
  const { resumeData } = useCareerStore();
  const [jdText, setJdText] = useState('');
  const [company, setCompany] = useState('');
  const [style, setStyle] = useState('professional');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cover' | 'email'>('cover');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!resumeData || !jdText.trim() || !company.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/coverletter/generate', {
        resume_data: resumeData,
        jd_text: jdText,
        company_name: company,
        style
      });
      setResult(res.data.result);
    } catch (err) {
      console.error("Generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Input Panel */}
         <div className="lg:col-span-5 space-y-8">
            <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Mail size={100} />
               </div>
               <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-8">Outreach Engine</h2>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">Target Organization</label>
                     <div className="relative">
                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                           value={company} 
                           onChange={e => setCompany(e.target.value)}
                           placeholder="e.g. Google, Zomato, Stripe"
                           className="w-full bg-black/40 pl-14 pr-6 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-0 text-white font-bold text-sm"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">Job Context</label>
                     <textarea 
                        value={jdText} 
                        onChange={e => setJdText(e.target.value)}
                        placeholder="Paste the Job Description here to synchronize context..."
                        className="w-full h-48 bg-black/40 p-6 rounded-[2rem] border border-white/5 focus:border-blue-500/50 focus:ring-0 resize-none text-sm text-gray-300 font-medium leading-relaxed custom-scrollbar"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">Tonal Strategy</label>
                     <div className="grid grid-cols-3 gap-2">
                        {['professional', 'conversational', 'bold'].map(s => (
                           <button 
                              key={s} 
                              onClick={() => setStyle(s)}
                              className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border ${style === s ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-white'}`}
                           >
                              {s}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button 
                     onClick={generate} 
                     disabled={loading || !resumeData || !jdText || !company}
                     className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                  >
                     {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                     Generate Assets
                  </button>
               </div>
            </div>
         </div>

         {/* Result Panel */}
         <div className="lg:col-span-7">
            {result ? (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                  {/* Selling Points */}
                  <div className="flex flex-wrap gap-3">
                     {result.key_selling_points?.map((p: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-widest flex items-center gap-2">
                           <Sparkles size={10} /> {p}
                        </span>
                     ))}
                  </div>

                  <div className="glass-card rounded-[3rem] border-white/10 shadow-2xl overflow-hidden flex flex-col h-[650px]">
                     <div className="flex bg-black/40 p-2 gap-2 border-b border-white/5">
                        <button 
                           onClick={() => setActiveTab('cover')}
                           className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'cover' ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
                        >
                           <FileText size={14} /> Cover Letter
                        </button>
                        <button 
                           onClick={() => setActiveTab('email')}
                           className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'email' ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
                        >
                           <Send size={14} /> Cold Email
                        </button>
                     </div>

                     <div className="flex-1 p-10 overflow-y-auto custom-scrollbar relative">
                        {activeTab === 'cover' ? (
                           <pre className="text-sm text-gray-300 font-medium whitespace-pre-wrap leading-relaxed font-sans">
                              {result.cover_letter}
                           </pre>
                        ) : (
                           <div className="space-y-8">
                              <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Subject Line</p>
                                 <p className="text-sm font-black text-white">{result.cold_email?.subject}</p>
                              </div>
                              <pre className="text-sm text-gray-300 font-medium whitespace-pre-wrap leading-relaxed font-sans">
                                 {result.cold_email?.body}
                              </pre>
                           </div>
                        )}
                     </div>

                     <div className="p-6 bg-black/40 border-t border-white/5 flex justify-center">
                        <button 
                           onClick={() => handleCopy(activeTab === 'cover' ? result.cover_letter : `Subject: ${result.cold_email?.subject}\n\n${result.cold_email?.body}`)}
                           className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-xl flex items-center gap-3"
                        >
                           {copied ? <Check size={14} /> : <Copy size={14} />}
                           {copied ? 'Copied to Clipboard' : 'Copy to Clipboard'}
                        </button>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="glass-card h-full min-h-[500px] rounded-[3.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-16 group">
                  <div className="bg-white/5 p-8 rounded-[2.5rem] mb-8 group-hover:scale-110 transition-transform duration-500">
                     <Mail size={64} className="text-gray-800" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-300 mb-4 tracking-tighter uppercase">Awaiting Neural Context</h3>
                  <p className="max-w-xs text-[10px] font-black text-gray-600 leading-relaxed uppercase tracking-[0.2em]">Synchronize organization data and job description to generate high-conversion outreach assets.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
