import { useState } from 'react';
import { Mail, Sparkles, Copy, Check, Loader2, Send, Building2, FileText } from 'lucide-react';
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
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    if (!resumeData || !jdText.trim() || !company.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/coverletter/generate`, {
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
         <div className="lg:col-span-5 space-y-8">
            <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden group">
               <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-8">Outreach Engine</h2>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <div className="relative">
                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                           value={company} 
                           onChange={e => setCompany(e.target.value)}
                           className="w-full bg-black/40 pl-14 pr-6 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-0 text-white font-bold text-sm"
                        />
                     </div>
                  </div>
                  <textarea 
                     value={jdText} 
                     onChange={e => setJdText(e.target.value)}
                     className="w-full h-48 bg-black/40 p-6 rounded-[2rem] border border-white/5 focus:border-blue-500/50 focus:ring-0 resize-none text-sm text-gray-300 font-medium leading-relaxed"
                  />
                  <button 
                     onClick={generate} 
                     className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 mt-4"
                  >
                     {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                     Generate Assets
                  </button>
               </div>
            </div>
         </div>
         <div className="lg:col-span-7">
            {result && (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                  <div className="glass-card rounded-[3rem] border-white/10 shadow-2xl overflow-hidden flex flex-col h-[650px]">
                     <div className="flex bg-black/40 p-2 gap-2 border-b border-white/5">
                        <button onClick={() => setActiveTab('cover')} className={`flex-1 py-4 rounded-[1.5rem] ${activeTab === 'cover' ? 'bg-white/10 text-white' : 'text-gray-500'}`}><FileText size={14} /> Cover Letter</button>
                        <button onClick={() => setActiveTab('email')} className={`flex-1 py-4 rounded-[1.5rem] ${activeTab === 'email' ? 'bg-white/10 text-white' : 'text-gray-500'}`}><Send size={14} /> Cold Email</button>
                     </div>
                     <div className="flex-1 p-10 overflow-y-auto">
                        <pre className="text-sm text-gray-300 font-medium whitespace-pre-wrap leading-relaxed">
                           {activeTab === 'cover' ? result.cover_letter : result.cold_email?.body}
                        </pre>
                     </div>
                     <button onClick={() => handleCopy(activeTab === 'cover' ? result.cover_letter : result.cold_email?.body)} className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase flex items-center gap-3">
                        {copied ? <Check size={14} /> : <Copy size={14} />} Copy
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
