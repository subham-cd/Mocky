import React, { useState } from 'react';
import { Terminal, Play, Loader2, CheckCircle2, AlertTriangle, Code, Cpu, Zap, Star, Send } from 'lucide-react';
import axios from 'axios';
import { useCareerStore } from '../store/useCareerStore';

interface CodingLabProps {
  role: string;
}

const CodingLab: React.FC<CodingLabProps> = ({ role }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const { saveSession } = useCareerStore();
  const [status, setStatus] = useState<'idle' | 'loading' | 'coding' | 'evaluating' | 'result'>('idle');
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);

  const generateChallenge = async () => {
    setStatus('loading');
    try {
      const res = await axios.post(`${API_BASE_URL}/coding/generate`, { role, difficulty: 'Medium' });
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
      <div className="glass-card p-20 rounded-[4rem] text-center border-white/10 flex flex-col items-center animate-in zoom-in-95 duration-700">
         <div className="bg-blue-500/10 p-10 rounded-[2.5rem] mb-10 group hover:scale-110 transition-transform duration-500">
            <Terminal size={80} className="text-blue-500" />
         </div>
         <h2 className="text-6xl font-black text-white mb-6 tracking-tighter uppercase">Neural <span className="text-blue-500">Coding</span> Lab</h2>
         <p className="text-xl text-gray-400 max-w-2xl mb-12 font-medium leading-relaxed">
            Test your algorithmic efficiency and clean code standards with role-specific challenges monitored by our neural engine.
         </p>
         <button 
           onClick={generateChallenge}
           className="px-16 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl font-black text-sm tracking-[0.3em] uppercase hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-4"
         >
            Initialize Environment <Zap size={20} />
         </button>
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
              <Cpu size={48} className="text-blue-500 animate-pulse" />
           </div>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase tracking-[0.2em]">
           {status === 'loading' ? 'Synthesizing Challenge...' : 'Neural Evaluation in Progress...'}
        </h2>
      </div>
    );
  }

  if (status === 'coding') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto animate-in fade-in duration-700">
         {/* Left: Problem Desc */}
         <div className="lg:col-span-5 space-y-8">
            <div className="glass-card p-10 rounded-[3rem] border-white/10 h-full overflow-y-auto max-h-[700px] custom-scrollbar">
               <div className="flex items-center justify-between mb-8">
                  <span className="px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20">{problem.difficulty}</span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Assessment</span>
               </div>
               <h3 className="text-3xl font-black text-white mb-6 tracking-tighter leading-tight">{problem.title}</h3>
               <div className="space-y-6 text-gray-300 font-medium leading-relaxed">
                  <p>{problem.description}</p>
                  
                  <div className="space-y-4 pt-4">
                     <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Constraints</h4>
                     <ul className="space-y-2">
                        {problem.constraints.map((c: string, i: number) => (
                           <li key={i} className="flex gap-3 text-xs">
                              <span className="text-blue-500 font-black">•</span> {c}
                           </li>
                        ))}
                     </ul>
                  </div>

                  <div className="space-y-4 pt-4">
                     <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Example Case</h4>
                     <div className="bg-black/40 p-6 rounded-2xl border border-white/5 text-xs font-mono space-y-2">
                        <p><span className="text-blue-400">Input:</span> {typeof problem.examples[0].input === 'object' ? JSON.stringify(problem.examples[0].input) : problem.examples[0].input}</p>
                        <p><span className="text-green-400">Output:</span> {typeof problem.examples[0].output === 'object' ? JSON.stringify(problem.examples[0].output) : problem.examples[0].output}</p>
                        <p className="text-gray-500 mt-2 italic">// {problem.examples[0].explanation}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right: Editor */}
         <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-[3rem] border-white/10 flex-1 flex flex-col bg-black/40">
               <div className="flex items-center gap-3 mb-6 px-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  <span className="ml-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Terminal v1.0.4</span>
               </div>
               <textarea
                 value={code}
                 onChange={(e) => setCode(e.target.value)}
                 spellCheck={false}
                 className="flex-1 w-full bg-transparent border-none focus:ring-0 text-blue-400 font-mono text-sm leading-relaxed resize-none custom-scrollbar p-4"
                 placeholder="// Implement your solution here..."
               />
               <div className="mt-6 flex gap-4">
                  <button 
                    onClick={submitCode}
                    className="flex-1 py-5 bg-white text-black rounded-[2rem] font-black text-xs tracking-[0.2em] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    Transmit for Review <Send size={16} />
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (status === 'result' && evaluation) {
    return (
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-1000">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Overall Index', value: evaluation.overall_score, color: 'text-blue-500', icon: <Star size={16} /> },
              { label: 'Neural Logic', value: evaluation.logic_score, color: 'text-green-500', icon: <CheckCircle2 size={16} /> },
              { label: 'Efficiency', value: evaluation.complexity_score, color: 'text-purple-500', icon: <Zap size={16} /> },
              { label: 'Clean Code', value: evaluation.style_score, color: 'text-orange-500', icon: <Code size={16} /> },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-8 rounded-[2.5rem] border-white/10 text-center">
                 <div className={`mx-auto w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${stat.color}`}>{stat.icon}</div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                 <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
               <div className="glass-card p-10 rounded-[3rem] border-white/10">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-8 flex items-center gap-3"><Code size={16} /> Optimized Neural Solution</h3>
                  <div className="bg-black/60 p-8 rounded-[2rem] border border-white/5 overflow-x-auto">
                     <pre className="text-xs font-mono text-green-400 leading-relaxed">
                        {evaluation.optimized_version}
                     </pre>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <div className="glass-card p-10 rounded-[3rem] border-white/10 bg-white/5">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-3"><AlertTriangle size={16} className="text-yellow-500" /> Complexity Audit</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[10px] font-black text-gray-400 uppercase">Time Complexity</span>
                        <span className="text-sm font-black text-white">{evaluation.time_complexity}</span>
                     </div>
                     <div className="flex justify-between items-center py-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase">Space Complexity</span>
                        <span className="text-sm font-black text-white">{evaluation.space_complexity}</span>
                     </div>
                  </div>
                  <p className="mt-8 text-xs font-medium text-gray-400 leading-relaxed italic">"{evaluation.feedback}"</p>
               </div>
               
               <button 
                 onClick={() => setStatus('idle')}
                 className="w-full py-6 bg-white text-black rounded-3xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-2xl"
               >
                 New Challenge
               </button>
            </div>
         </div>
      </div>
    );
  }

  return null;
};

export default CodingLab;
