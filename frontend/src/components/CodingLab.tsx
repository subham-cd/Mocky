import React, { useState } from 'react';
import { Terminal, Play, Loader2, CheckCircle2, AlertTriangle, Code, Cpu, Zap, Star, Send, Database, Box, Layout, Cpu as Chip, Sparkles, Activity } from 'lucide-react';
import axios from 'axios';
import { useCareerStore } from '../store/useCareerStore';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleFeedback from './ModuleFeedback';

interface CodingLabProps {
  role: string;
}

const CATEGORIES = [
  { id: 'Data Structures & Algorithms', icon: <Chip size={20} />, desc: 'Core logic and efficiency' },
  { id: 'System Design', icon: <Box size={20} />, desc: 'Architecture and scalability' },
  { id: 'SQL / Databases', icon: <Database size={20} />, desc: 'Querying and data modeling' },
  { id: 'Frontend / UI', icon: <Layout size={20} />, desc: 'Interfaces and state management' },
  { id: 'Backend Architecture', icon: <Terminal size={20} />, desc: 'APIs, auth, and performance' },
];

const CodingLab: React.FC<CodingLabProps> = ({ role }) => {
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim();
  const { saveSession } = useCareerStore();
  const [status, setStatus] = useState<'idle' | 'loading' | 'coding' | 'evaluating' | 'result'>('idle');
  const [problem, setProblem] = useState<any>(null);
  const [category, setCategory] = useState('Data Structures & Algorithms');
  const [code, setCode] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(true);

  const generateChallenge = async () => {
    setStatus('loading');
    setShowFeedback(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/coding/generate`, { 
        role, 
        difficulty: 'Medium',
        category 
      });
      setProblem(res.data);
      setCode(res.data.starter_code || '');
      setStatus('coding');
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  const submitCode = async () => {
    setStatus('evaluating');
    try {
      const res = await axios.post(`${API_BASE_URL}/coding/evaluate`, {
        problem,
        code,
        role
      });
      setEvaluation(res.data);
      saveSession({
        type: 'coding',
        interview_score: res.data.overall_score,
        full_report: res.data
      });
      setStatus('result');
    } catch (err) {
      console.error(err);
      setStatus('coding');
    }
  };

  if (status === 'idle') {
    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-700">
         <div className="text-center space-y-4">
            <div className="bg-blue-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group hover:scale-110 transition-transform duration-500 border border-blue-500/20">
               <Terminal size={40} className="text-blue-500" />
            </div>
            <h2 className="text-6xl font-black text-white tracking-tighter uppercase">Neural <span className="text-blue-500">Coding</span> Lab</h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-medium">
               Select your specialized technical domain to generate a role-specific assessment.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => setCategory(cat.id)}
                 className={`p-8 rounded-[2.5rem] border text-left transition-all group relative overflow-hidden ${category === cat.id ? 'bg-blue-600 border-blue-400 shadow-2xl shadow-blue-600/20' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'}`}
               >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${category === cat.id ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 group-hover:text-blue-400'}`}>
                     {cat.icon}
                  </div>
                  <h4 className={`text-lg font-black uppercase tracking-tight mb-2 ${category === cat.id ? 'text-white' : 'text-gray-300'}`}>{cat.id}</h4>
                  <p className={`text-xs font-medium ${category === cat.id ? 'text-blue-100' : 'text-gray-500'}`}>{cat.desc}</p>
                  
                  {category === cat.id && (
                     <motion.div layoutId="active-cat" className="absolute top-6 right-8 text-white">
                        <CheckCircle2 size={24} fill="currentColor" className="text-blue-400" />
                     </motion.div>
                  )}
               </button>
            ))}
         </div>

         <div className="flex justify-center pt-8">
            <button 
              onClick={generateChallenge}
              className="px-20 py-6 bg-white text-black rounded-full font-black text-xs tracking-[0.4em] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-4"
            >
               Initialize Environment <Zap size={18} fill="currentColor" />
            </button>
         </div>
      </div>
    );
  }

  if (status === 'loading' || status === 'evaluating') {
    return (
      <div className="glass-card p-24 rounded-[3rem] border-white/10 text-center flex flex-col items-center">
        <div className="relative w-32 h-32 mb-12">
           <div className="absolute inset-0 border-8 border-blue-500/10 rounded-full"></div>
           <div className="absolute inset-0 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <Chip size={48} className="text-blue-500 animate-pulse" />
           </div>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-[0.3em] animate-pulse">
           {status === 'loading' ? 'Synthesizing Neural Challenge...' : 'Architecting Review Report...'}
        </h2>
      </div>
    );
  }

  if (status === 'coding') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
         {/* Left: Problem Desc */}
         <div className="lg:col-span-5 space-y-8 h-[calc(100vh-200px)]">
            <div className="glass-card p-10 rounded-[3rem] border-white/10 h-full overflow-y-auto custom-scrollbar bg-black/40">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{category}</span>
                     <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-tighter text-gray-400 w-fit">{problem.difficulty} level</span>
                  </div>
                  <Chip size={20} className="text-gray-700" />
               </div>
               
               <h3 className="text-4xl font-black text-white mb-8 tracking-tighter leading-tight uppercase">{problem.title}</h3>
               
               <div className="space-y-8 text-gray-300 font-medium leading-relaxed">
                  <p className="text-lg leading-relaxed">{problem.description}</p>
                  
                  <div className="space-y-4 pt-6 border-t border-white/5">
                     <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Zap size={14} className="text-blue-500" /> Technical Constraints
                     </h4>
                     <ul className="space-y-3">
                        {problem.constraints?.map((c: string, i: number) => (
                           <li key={i} className="flex gap-4 text-xs bg-white/5 p-4 rounded-xl border border-white/5">
                              <span className="text-blue-500 font-black">#0{i+1}</span> {c}
                           </li>
                        ))}
                     </ul>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                     <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Logic Validation</h4>
                     <div className="bg-black/60 p-8 rounded-[2rem] border border-dashed border-white/10 text-xs font-mono space-y-4">
                        {problem.examples && problem.examples.length > 0 ? (
                          <>
                            <p><span className="text-blue-500 font-black uppercase mr-4">Input Data</span> <span className="text-gray-400">{typeof problem.examples[0].input === 'object' ? JSON.stringify(problem.examples[0].input) : problem.examples[0].input}</span></p>
                            <p><span className="text-green-500 font-black uppercase mr-4">Neural Output</span> <span className="text-gray-400">{typeof problem.examples[0].output === 'object' ? JSON.stringify(problem.examples[0].output) : problem.examples[0].output}</span></p>
                            <div className="pt-4 mt-4 border-t border-white/5 italic text-gray-500">
                               // {problem.examples[0].explanation}
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-600 italic">No scenario provided.</p>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right: Editor */}
         <div className="lg:col-span-7 flex flex-col gap-6 h-[calc(100vh-200px)]">
            <div className="glass-card rounded-[3.5rem] border-white/10 flex-1 flex flex-col bg-black/60 backdrop-blur-2xl overflow-hidden shadow-2xl relative">
               <div className="bg-white/[0.03] px-10 py-6 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="flex gap-1.5 mr-6">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                     </div>
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Neural Terminal v2.1.0</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                     <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Active Link</span>
                  </div>
               </div>
               
               <textarea
                 value={code}
                 onChange={(e) => setCode(e.target.value)}
                 spellCheck={false}
                 className="flex-1 w-full bg-transparent border-none focus:ring-0 text-blue-400 font-mono text-sm leading-relaxed resize-none custom-scrollbar p-10"
                 placeholder={category.includes('SQL') ? "-- Write your SQL query here..." : "// Implement your architecture/logic here..."}
               />
               
               <div className="p-10 pt-0 flex gap-4">
                  <button 
                    onClick={submitCode}
                    className="flex-1 py-6 bg-white text-black hover:bg-blue-600 hover:text-white rounded-[2rem] font-black text-xs tracking-[0.2em] uppercase transition-all shadow-2xl flex items-center justify-center gap-4 group"
                  >
                    Transmit for Neural Review <Send size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (status === 'result' && evaluation) {
    return (
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-20">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Competency Index', value: evaluation.overall_score, color: 'text-blue-500', icon: <Star size={16} /> },
              { label: 'Neural Logic', value: evaluation.logic_score, color: 'text-green-500', icon: <CheckCircle2 size={16} /> },
              { label: 'Arch Complexity', value: evaluation.complexity_score, color: 'text-purple-500', icon: <Box size={16} /> },
              { label: 'Code Integrity', value: evaluation.style_score, color: 'text-orange-500', icon: <Zap size={16} /> },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-10 rounded-[3rem] border-white/10 text-center relative overflow-hidden group">
                 <div className={`mx-auto w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${stat.color} group-hover:scale-110 transition-transform`}>{stat.icon}</div>
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                 <p className={`text-5xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
              </div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
               <div className="glass-card p-10 rounded-[3.5rem] border-white/10 bg-black/40">
                  <div className="flex justify-between items-center mb-10">
                     <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-3"><Sparkles size={16} className="text-blue-500" /> Architectural Recommendation</h3>
                     <span className="text-[8px] font-black text-gray-600 bg-white/5 px-3 py-1 rounded-full uppercase">Verified Solution</span>
                  </div>
                  <div className="bg-black/60 p-10 rounded-[2.5rem] border border-white/5 overflow-x-auto shadow-inner">
                     <pre className="text-xs font-mono text-blue-300 leading-relaxed">
                        {evaluation.optimized_version}
                     </pre>
                  </div>
               </div>
               
               {showFeedback && (
                  <div className="flex justify-center">
                    <ModuleFeedback module="Neural Coding Lab" onClose={() => setShowFeedback(false)} />
                  </div>
               )}
            </div>

            <div className="lg:col-span-4 space-y-8">
               <div className="glass-card p-10 rounded-[3.5rem] border-white/10 bg-white/5 flex flex-col justify-between">
                  <div>
                     <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-10 flex items-center gap-3"><Activity size={16} className="text-purple-500" /> Efficiency Audit</h3>
                     <div className="space-y-6">
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Vector</span>
                           <span className="text-sm font-black text-white">{evaluation.time_complexity}</span>
                        </div>
                        <div className="flex justify-between items-center py-4">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Space Vector</span>
                           <span className="text-sm font-black text-white">{evaluation.space_complexity}</span>
                        </div>
                     </div>
                     <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/5 italic text-xs text-gray-400 leading-relaxed font-medium">
                        "{evaluation.feedback}"
                     </div>
                  </div>
                  
                  <button 
                    onClick={() => setStatus('idle')}
                    className="w-full mt-10 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs tracking-[0.3em] uppercase hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
                  >
                    New Lab Entry
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return null;
};

export default CodingLab;
