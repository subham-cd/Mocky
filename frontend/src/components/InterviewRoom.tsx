import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Send, CheckCircle2, AlertCircle, Award, RefreshCcw, MessageSquare, Info, Zap, BarChart3 } from 'lucide-react';
import { SpeechToText } from '../utils/speechApi';
import axios from 'axios';

interface InterviewRoomProps {
  resumeText: string;
  role: string;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ resumeText, role }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'interviewing' | 'finished'>('idle');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loadingEval, setLoadingEval] = useState(false);

  const speechApiRef = useRef<SpeechToText | null>(null);

  useEffect(() => {
    speechApiRef.current = new SpeechToText((text, isFinal) => {
      if (isFinal) {
        setTranscript(prev => prev + ' ' + text);
        setInterimTranscript('');
      } else {
        setInterimTranscript(text);
      }
    });
  }, []);

  const generateQuestions = async () => {
    setStatus('generating');
    try {
      const response = await axios.post(`${API_BASE_URL}/interview/generate-questions`, {
        resume_text: resumeText,
        role: role
      });
      setQuestions(response.data);
      setStatus('ready');
    } catch (err) {
      console.error("Error generating questions", err);
      setStatus('idle');
    }
  };

  const startInterview = () => {
    setStatus('interviewing');
    setCurrentQuestionIndex(0);
    setEvaluations([]);
  };

  const toggleListening = () => {
    if (isListening) {
      speechApiRef.current?.stop();
    } else {
      speechApiRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const submitAnswer = async () => {
    if (isListening) toggleListening();
    
    const fullAnswer = (transcript + ' ' + interimTranscript).trim();
    if (!fullAnswer) return;

    setLoadingEval(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/interview/evaluate`, {
        question: questions[currentQuestionIndex].question,
        answer: fullAnswer,
        what_we_look_for: questions[currentQuestionIndex].what_we_look_for
      });
      
      const newEval = { ...response.data, question: questions[currentQuestionIndex].question };
      setEvaluations([...evaluations, newEval]);
      
      setTranscript('');
      setInterimTranscript('');

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setStatus('finished');
      }
    } catch (err) {
      console.error("Error evaluating answer", err);
    } finally {
      setLoadingEval(false);
    }
  };

  if (status === 'idle') {
    return (
      <div className="glass-card p-16 rounded-[3rem] border-white/10 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-blue-500/10 p-8 rounded-[2rem] mb-10 shadow-2xl shadow-blue-500/10 group hover:scale-110 transition-transform">
          <Play className="text-blue-500 w-16 h-16 fill-blue-500/20" />
        </div>
        <h2 className="text-5xl font-black text-white mb-6 tracking-tighter leading-none">NEURAL MOCK <span className="text-blue-500">SESSION</span></h2>
        <p className="text-gray-400 max-w-lg mb-12 font-medium leading-relaxed text-lg">
           AI will generate 6 expert questions tailored for your <span className="font-bold text-white uppercase tracking-widest">{role}</span> profile. Practice in real-time.
        </p>
        <button
          onClick={generateQuestions}
          className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm tracking-[0.2em] uppercase hover:shadow-2xl hover:shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-3"
        >
          Generate Questions
          <Zap size={18} />
        </button>
      </div>
    );
  }

  if (status === 'generating') {
    return (
      <div className="glass-card p-24 rounded-[3rem] border-white/10 text-center flex flex-col items-center">
        <div className="relative w-24 h-24 mb-10">
           <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase tracking-widest">Compiling Interview Engine...</h2>
        <p className="text-gray-500 mt-4 font-bold uppercase tracking-widest text-[10px]">Scanning profile against {role} requirements</p>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="glass-card p-16 rounded-[3.5rem] border-white/10 max-w-4xl mx-auto shadow-2xl">
        <div className="flex items-center gap-4 mb-10">
           <div className="bg-yellow-500/10 p-3 rounded-2xl">
              <Award className="text-yellow-500" size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Session Initialized</h2>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mt-1">6 Optimized Questions Loaded</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {questions.map((q, i) => (
            <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all group">
              <span className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center font-black text-blue-500 border border-white/10 group-hover:scale-110 transition-transform">
                {i + 1}
              </span>
              <div>
                 <p className="text-white font-bold text-sm tracking-tight leading-snug">{q.type} Focus</p>
                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">{q.difficulty} Difficulty</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={startInterview}
          className="w-full py-6 bg-white text-black rounded-3xl font-black text-sm tracking-[0.3em] uppercase hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-[0.98]"
        >
          ENTER INTERVIEW ROOM
        </button>
      </div>
    );
  }

  if (status === 'interviewing') {
    const q = questions[currentQuestionIndex];
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
        {/* Main Panel */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card p-12 rounded-[3.5rem] border-white/10 shadow-[0_0_100px_-20px_rgba(59,130,246,0.3)] min-h-[500px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
               <MessageSquare size={120} className="text-white" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <span className="px-5 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  Live Phase {currentQuestionIndex + 1} / 6
                </span>
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                   Session Encrypted
                </span>
              </div>
              
              <h2 className="text-4xl font-black text-white mb-12 tracking-tighter leading-[1.1] text-glow">
                "{q.question}"
              </h2>
              
              <div className="bg-black/40 p-10 rounded-[2.5rem] border border-white/5 min-h-[220px] relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors"></div>
                <div className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                  {isListening ? (
                    <span className="flex items-center gap-3 text-red-500 font-black">
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_#ef4444]"></span>
                      </div>
                      Neural Transcription Active...
                    </span>
                  ) : "Manual Input Override Available"}
                </div>
                <div className="text-lg text-gray-200 font-medium leading-relaxed italic pr-4">
                  {transcript}
                  <span className="text-white/40">{interimTranscript}</span>
                  {!transcript && !interimTranscript && (
                    <span className="opacity-20 not-italic">Voice output will stream here in real-time...</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-6 mt-12 relative z-10">
              <button
                onClick={toggleListening}
                className={`flex-[1.2] py-5 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 transition-all border-2 ${
                  isListening 
                    ? 'bg-red-500/10 text-red-500 border-red-500/50 shadow-[0_0_30px_-10px_#ef4444]' 
                    : 'bg-white text-black border-transparent hover:bg-blue-500 hover:text-white shadow-xl'
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                {isListening ? "STOP NEURAL MIC" : "ACTIVATE NEURAL MIC"}
              </button>
              <button
                onClick={submitAnswer}
                disabled={(!transcript && !interimTranscript) || loadingEval}
                className="flex-1 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:shadow-2xl hover:shadow-blue-600/30 disabled:bg-white/5 disabled:text-gray-600 disabled:border-white/5 disabled:grayscale transition-all flex items-center justify-center gap-3 border border-transparent"
              >
                {loadingEval ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send size={18} />
                    TRANSMIT ANSWER
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-10 rounded-[3rem] border-white/10 h-full flex flex-col shadow-2xl">
             <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-500/10 p-2.5 rounded-xl">
                   <Zap className="text-blue-500" size={24} />
                </div>
                <h3 className="text-xl font-black text-white tracking-tighter uppercase tracking-widest">Neural Insights</h3>
             </div>
             
             <div className="space-y-6 flex-1">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 border-l-4 border-l-blue-500 group">
                   <p className="text-[10px] font-black text-blue-500 uppercase mb-2 tracking-widest">Cognitive Target</p>
                   <p className="text-sm text-gray-300 font-medium leading-relaxed group-hover:text-white transition-colors">{q.what_we_look_for}</p>
                </div>
                
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 border-l-4 border-l-purple-500 group">
                   <p className="text-[10px] font-black text-purple-500 uppercase mb-2 tracking-widest">Pro Strategy</p>
                   <p className="text-sm text-gray-300 font-medium leading-relaxed group-hover:text-white transition-colors">Apply the <span className="font-bold text-white uppercase">STAR</span> protocol: Situation, Task, Action, and quantified Result.</p>
                </div>

                <div className="p-6 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 mt-auto">
                   <div className="flex items-center gap-2 mb-2">
                      <Info size={14} className="text-yellow-500" />
                      <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest tracking-tighter">System Alert</p>
                   </div>
                   <p className="text-[11px] text-yellow-500/60 font-medium leading-snug">Ensure you speak clearly. Background noise can impact neural transcription accuracy.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    const overallScore = Math.round(evaluations.reduce((acc, curr) => acc + curr.overall, 0) / evaluations.length);
    const getScoreColor = (s: number) => s >= 8 ? 'text-green-400' : s >= 6 ? 'text-yellow-400' : 'text-red-400';

    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-1000 pb-20">
        <div className="glass-card p-16 rounded-[4rem] border-white/10 text-center relative overflow-hidden shadow-[0_0_150px_-30px_rgba(59,130,246,0.3)]">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-blue-500 shadow-[0_0_20px_#3b82f6] rounded-full"></div>
          
          <div className="mb-10 flex flex-col items-center">
             <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 mb-6 border border-blue-500/20">
                <BarChart3 size={40} />
             </div>
             <h2 className="text-6xl font-black text-white mb-2 tracking-tighter leading-none">ANALYSIS COMPLETE</h2>
             <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">Session Report Successfully Generated</p>
          </div>
          
          <div className="inline-flex flex-col items-center justify-center p-12 bg-white/5 rounded-[3.5rem] mb-12 border border-white/10 shadow-2xl group transition-all hover:bg-white/[0.08]">
            <span className={`text-9xl font-black tracking-tighter ${getScoreColor(overallScore)} drop-shadow-[0_0_15px_currentColor]`}>
               {overallScore}<span className="text-4xl opacity-30">/10</span>
            </span>
            <span className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mt-4">Composite Performance Score</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center border-t border-white/5 pt-12">
            <div>
              <p className="text-4xl font-black text-white tracking-tighter">06</p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Queries</p>
            </div>
            <div>
              <p className="text-4xl font-black text-white tracking-tighter">100%</p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Integrity</p>
            </div>
            <div>
              <p className="text-4xl font-black text-white tracking-tighter">AI</p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Logic</p>
            </div>
            <div>
              <p className="text-4xl font-black text-blue-500 tracking-tighter">{role.split(' ')[0]}</p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Vertical</p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <h3 className="text-4xl font-black text-white tracking-tighter px-6 flex items-center gap-4">
             DETAILED BREAKDOWN
             <div className="h-px bg-white/10 flex-1"></div>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {evaluations.map((ev, i) => (
              <div key={i} className="glass-card p-10 rounded-[3rem] border-white/10 flex flex-col justify-between hover:bg-white/[0.03] transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center text-lg font-black text-gray-500 border border-white/5 group-hover:text-blue-500 transition-colors">
                      {i+1}
                    </div>
                    <div className={`px-5 py-2 rounded-2xl font-black text-xs border ${getScoreColor(ev.overall).replace('text-', 'text-').replace('text-', 'border-').replace('400', '400/50')} ${getScoreColor(ev.overall).replace('text-', 'bg-').replace('400', '400/10')}`}>
                      {ev.overall}/10
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold text-white mb-10 leading-snug pr-4">
                    "{ev.question}"
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-8 mb-10">
                    <div>
                      <h5 className="text-[10px] font-black text-green-500 mb-4 flex items-center gap-2 tracking-[0.2em] uppercase">
                        <CheckCircle2 size={14} /> Neural Strengths
                      </h5>
                      <ul className="space-y-3">
                        {ev.strengths.map((s: string, j: number) => (
                          <li key={j} className="text-sm text-gray-400 flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_8px_#22c55e]"></span>
                            <span className="leading-relaxed font-medium">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black text-orange-500 mb-4 flex items-center gap-2 tracking-[0.2em] uppercase">
                        <AlertCircle size={14} /> Optimization Gaps
                      </h5>
                      <ul className="space-y-3">
                        {ev.improvements.map((im: string, j: number) => (
                          <li key={j} className="text-sm text-gray-400 flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_8px_#f97316]"></span>
                            <span className="leading-relaxed font-medium">{im}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-6 bg-black/40 rounded-2xl border border-white/5 text-[11px] italic text-gray-500 relative group/hint overflow-hidden transition-all hover:bg-blue-500/5">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover/hint:bg-blue-500 transition-colors"></div>
                  <span className="font-black text-white not-italic mr-2 uppercase tracking-widest text-[9px]">Neural Hint:</span>
                  "{ev.ideal_answer_hint}"
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-10">
           <button
             onClick={() => setStatus('idle')}
             className="px-16 py-6 bg-white text-black rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-2xl flex items-center gap-4 group"
           >
             <RefreshCcw className="group-hover:rotate-180 transition-transform duration-700" />
             RE-INITIALIZE ENGINE
           </button>
        </div>
      </div>
    );
  }

  return null;
};

export default InterviewRoom;
