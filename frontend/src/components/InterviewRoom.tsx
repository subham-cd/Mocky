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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const speechApiRef = useRef<SpeechToText | null>(null);

  useEffect(() => {
    try {
        speechApiRef.current = new SpeechToText((text, isFinal) => {
          if (isFinal) {
            setTranscript(prev => prev + ' ' + text);
            setInterimTranscript('');
          } else {
            setInterimTranscript(text);
          }
        });
    } catch (e) {
        console.error("Speech API init failed", e);
    }
    return () => { speechApiRef.current?.stop(); };
  }, []);

  const generateQuestions = async () => {
    setStatus('generating');
    setErrorMessage(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/interview/generate-questions`, {
        resume_text: resumeText,
        role: role
      });
      if (Array.isArray(response.data)) {
        setQuestions(response.data);
        setStatus('ready');
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Neural engine failed to initialize. Re-attempting...");
      setStatus('idle');
    }
  };

  const startInterview = () => {
    if (!questions.length) { setStatus('idle'); return; }
    setStatus('interviewing');
    setCurrentQuestionIndex(0);
    setEvaluations([]);
  };

  const toggleListening = () => {
    if (isListening) speechApiRef.current?.stop();
    else speechApiRef.current?.start();
    setIsListening(!isListening);
  };

  const submitAnswer = async () => {
    if (isListening) toggleListening();
    const fullAnswer = (transcript + ' ' + interimTranscript).trim();
    if (!fullAnswer) return;
    setLoadingEval(true);
    try {
      const currentQ = questions[currentQuestionIndex];
      const response = await axios.post(`${API_BASE_URL}/interview/evaluate`, {
        question: currentQ?.question,
        answer: fullAnswer,
        what_we_look_for: currentQ?.what_we_look_for
      });
      setEvaluations(prev => [...prev, response.data]);
      setTranscript('');
      setInterimTranscript('');
      if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
      else setStatus('finished');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEval(false);
    }
  };

  if (status === 'idle') {
    return (
      <div className="glass-card p-16 rounded-[3rem] border-white/10 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-blue-500/10 p-8 rounded-[2rem] mb-10 group hover:scale-110 transition-transform">
          <Play className="text-blue-500 w-16 h-16 fill-blue-500/20" />
        </div>
        <h2 className="text-5xl font-black text-white mb-6 tracking-tighter leading-none uppercase">Neural Mock <span className="text-blue-500">Session</span></h2>
        <p className="text-gray-400 max-w-lg mb-12 font-medium leading-relaxed text-lg">
           AI will generate 6 expert questions tailored for your <span className="font-bold text-white uppercase">{role}</span> profile.
        </p>
        {errorMessage && <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase">{errorMessage}</div>}
        <button onClick={generateQuestions} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-[0.2em] uppercase hover:bg-blue-500 active:scale-95 transition-all flex items-center gap-3">
          Generate Questions <Zap size={18} />
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
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Compiling Interview Engine...</h2>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="glass-card p-16 rounded-[3.5rem] border-white/10 max-w-4xl mx-auto shadow-2xl animate-in fade-in">
        <div className="flex items-center gap-4 mb-10">
           <div className="bg-yellow-500/10 p-3 rounded-2xl"><Award className="text-yellow-500" size={32} /></div>
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Session Initialized</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {questions.map((q, i) => (
            <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
              <span className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center font-black text-blue-500">{i + 1}</span>
              <div><p className="text-white font-bold text-sm">{q.type} Focus</p><p className="text-[10px] text-gray-500 uppercase font-black">{q.difficulty}</p></div>
            </div>
          ))}
        </div>
        <button onClick={startInterview} className="w-full py-6 bg-white text-black rounded-3xl font-black text-sm tracking-[0.3em] uppercase hover:bg-blue-500 hover:text-white transition-all">ENTER ROOM</button>
      </div>
    );
  }

  if (status === 'interviewing') {
    const q = questions[currentQuestionIndex];
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto animate-in fade-in duration-700">
        <div className="lg:col-span-8">
          <div className="glass-card p-12 rounded-[3.5rem] border-white/10 shadow-2xl min-h-[500px] flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <span className="px-5 py-2 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase">Phase {currentQuestionIndex + 1} / 6</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-12 tracking-tighter leading-tight italic">"{q?.question}"</h2>
              <div className="bg-black/40 p-10 rounded-[2.5rem] border border-white/5 min-h-[200px]">
                <div className="text-lg text-gray-200 font-medium leading-relaxed italic">
                  {transcript} <span className="text-white/40">{interimTranscript}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-6 mt-12 relative z-10">
              <button onClick={toggleListening} className={`flex-1 py-5 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 transition-all ${isListening ? 'bg-red-500 text-white shadow-xl' : 'bg-white text-black hover:bg-blue-500 hover:text-white'}`}>
                {isListening ? <MicOff size={20} /> : <Mic size={20} />} {isListening ? "STOP MIC" : "ACTIVATE MIC"}
              </button>
              <button onClick={submitAnswer} disabled={(!transcript && !interimTranscript) || loadingEval} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                {loadingEval ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> TRANSMIT</>}
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
           <div className="glass-card p-10 rounded-[3rem] border-white/10 h-full flex flex-col space-y-8">
              <div className="p-6 bg-white/5 rounded-2xl border-l-4 border-l-blue-500"><p className="text-[10px] font-black text-blue-500 uppercase mb-2">Cognitive Target</p><p className="text-sm text-gray-300 font-medium">{q?.what_we_look_for}</p></div>
              <div className="p-6 bg-white/5 rounded-2xl border-l-4 border-l-purple-500"><p className="text-[10px] font-black text-purple-500 uppercase mb-2">Pro Strategy</p><p className="text-sm text-gray-300 font-medium italic">Apply the STAR protocol for this response.</p></div>
           </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    const overallScore = Math.round(evaluations.reduce((acc, curr) => acc + (curr?.overall || 0), 0) / (evaluations.length || 1));
    return (
      <div className="max-w-6xl mx-auto space-y-12 text-center pb-20">
        <div className="glass-card p-16 rounded-[4rem] border-white/10 relative overflow-hidden shadow-2xl bg-black/40">
           <div className="mb-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6"><BarChart3 size={32} /></div>
              <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase">Session Complete</h2>
           </div>
           <div className="inline-flex flex-col items-center justify-center p-12 bg-white/5 rounded-[3.5rem] mb-12 border border-white/10 shadow-2xl">
              <span className="text-9xl font-black tracking-tighter text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{overallScore}<span className="text-4xl opacity-30 text-white">/10</span></span>
              <span className="text-xs font-black text-gray-500 uppercase mt-4">Composite Score</span>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/5 pt-12 text-white">
              <div><p className="text-4xl font-black">06</p><p className="text-[10px] text-gray-500 uppercase mt-1">Queries</p></div>
              <div><p className="text-4xl font-black">100%</p><p className="text-[10px] text-gray-500 uppercase mt-1">Integrity</p></div>
              <div><p className="text-4xl font-black">AI</p><p className="text-[10px] text-gray-500 uppercase mt-1">Logic</p></div>
              <div><p className="text-4xl font-black text-blue-500">{role.split(' ')[0]}</p><p className="text-[10px] text-gray-500 uppercase mt-1">Vertical</p></div>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {evaluations.map((ev, i) => (
              <div key={i} className="glass-card p-10 rounded-[3rem] border-white/10 text-left space-y-6">
                 <div className="flex justify-between items-center"><span className="text-2xl font-black text-gray-700">#0{i+1}</span><span className="font-black text-blue-400">{ev.overall}/10</span></div>
                 <h4 className="text-white font-bold leading-tight line-clamp-2 italic">"{ev.question}"</h4>
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-xs text-gray-400 leading-relaxed font-medium"><span className="text-white font-black uppercase text-[9px] mr-2">Feedback:</span>{ev.feedback}</div>
              </div>
           ))}
        </div>
        <button onClick={() => setStatus('idle')} className="px-16 py-6 bg-white text-black rounded-3xl font-black text-sm tracking-[0.4em] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-2xl flex items-center gap-4 mx-auto"><RefreshCcw size={20} /> RE-INITIALIZE</button>
      </div>
    );
  }
  return null;
};

export default InterviewRoom;
