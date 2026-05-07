import React, { useState, useRef, useEffect } from 'react';
import { Play, Send, Zap, Loader2, Info, Mic, Pause, Square, MicOff, Activity, Gauge, Users, User, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import InterviewerAvatar from './InterviewerAvatar';
import { SpeechToText } from '../utils/speechApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCareerStore } from '../store/useCareerStore';

interface LiveInterviewRoomProps {
  resumeData: any;
  targetRole: string;
  onInterviewComplete: (report: any) => void;
}

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'so', 'actually', 'literally', 'I mean'];

const LiveInterviewRoom: React.FC<LiveInterviewRoomProps> = ({ resumeData, targetRole, onInterviewComplete }) => {
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim();
  const { saveSession } = useCareerStore();
  
  const [interviewType, setInterviewType] = useState<'solo' | 'panel'>('solo');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('idle');
  const [currentAgent, setCurrentAgent] = useState<'sarah' | 'alex'>('sarah');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [showToast, setShowToast] = useState(false);

  // SESSION RECORDING STATE
  const questionCount = useRef(0);
  const sessionStartTime = useRef<string | null>(null);
  const turnStartTime = useRef<number | null>(null);
  const qaHistory = useRef<any[]>([]);
  const totalFillers = useRef(0);
  
  // Emotion & Confidence State
  const [metrics, setMetrics] = useState({
    confidence: 70,
    clarity: 80,
    pace: 50,
    fillerCount: 0,
    wpm: 0
  });

  const speechApiRef = useRef<SpeechToText | null>(null);

  // Analyze Speech Metrics
  useEffect(() => {
    const fullText = (transcript + ' ' + interimTranscript).toLowerCase();
    const words = fullText.split(/\s+/).filter(w => w.length > 0);
    const fillers = words.filter(w => FILLER_WORDS.includes(w)).length;

    totalFillers.current = fillers;

    let currentWpm = 0;
    if (turnStartTime.current && interviewStarted && words.length > 5) {
        const elapsedMinutes = (Date.now() - turnStartTime.current) / 60000;
        currentWpm = Math.round(words.length / elapsedMinutes);
    }

    let conf = 85;
    if (fillers > 5) conf -= (fillers * 2);
    
    const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
    let clar = 75;
    if (avgSentenceLength > 10 && avgSentenceLength < 25) clar += 15;

    setMetrics({
        confidence: Math.max(10, Math.min(100, conf)),
        clarity: Math.max(10, Math.min(100, clar)),
        pace: Math.max(10, Math.min(100, (currentWpm / 150) * 50)),
        fillerCount: fillers,
        wpm: currentWpm
    });
  }, [transcript, interimTranscript, interviewStarted]);

  useEffect(() => {
    speechApiRef.current = new SpeechToText((text, isFinal) => {
      if (isFinal) {
        setTranscript(prev => prev + ' ' + text);
        setInterimTranscript('');
      } else {
        setInterimTranscript(text);
      }
    });
    return () => {
        speechApiRef.current?.stop();
        window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text: string, agent: 'sarah' | 'alex') => {
    if (isPaused) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    
    const voices = window.speechSynthesis.getVoices();
    const sarahVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Female')) || voices[0];
    const alexVoice = voices.find(v => v.name.includes('Google UK English') || v.name.includes('Male')) || voices[1] || voices[0];
    
    utterance.voice = agent === 'sarah' ? sarahVoice : alexVoice;

    setAvatarState("speaking");
    utterance.onend = () => {
      if (!isPaused) {
        setAvatarState("listening");
        speechApiRef.current?.start();
        turnStartTime.current = Date.now(); 
      } else {
        setAvatarState("idle");
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleTurn = async (updatedHistory: any[]) => {
    setAvatarState('thinking');
    setCurrentQuestion("");
    
    const nextAgent = interviewType === 'panel' 
      ? (currentAgent === 'alex' ? 'sarah' : 'alex') 
      : 'sarah';
    
    setCurrentAgent(nextAgent);

    try {
      const endpoint = interviewType === 'panel' ? '/interview/panel-turn' : '/interview/live-turn-stream';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_history: updatedHistory,
          resume_data: resumeData,
          target_role: targetRole,
          agent: nextAgent
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const text = line.slice(6);
            if (text === '[DONE]') {
              setConversationHistory(prev => [...prev, { role: 'assistant', content: fullText, agent: nextAgent }]);
              speakText(fullText, nextAgent);
              return;
            }
            fullText += text;
            setCurrentQuestion(fullText);
          }
        }
      }
    } catch (err) {
      setAvatarState('idle');
      setCurrentQuestion("Neural interference detected. Please repeat.");
    }
  };

  const finalizeInterview = async () => {
    speechApiRef.current?.stop();
    setLoading(true);
    setAvatarState("thinking");

    const endTime = new Date().toISOString();
    const duration = sessionStartTime.current 
      ? Math.round((Date.now() - new Date(sessionStartTime.current).getTime()) / 60000) 
      : 0;

    // Calculate detailed behavioral metrics
    const meanResponseTime = qaHistory.current.reduce((a, b) => a + b.response_time_seconds, 0) / (qaHistory.current.length || 1);
    const variance = qaHistory.current.reduce((a, b) => a + Math.pow(b.answer_transcript.split(' ').length - 20, 2), 0) / (qaHistory.current.length || 1);

    try {
      const res = await axios.post(`${API_BASE_URL}/interview/live-report`, {
        conversation_history: conversationHistory,
        target_role: targetRole,
        behavioral_metrics: {
          filler_count: totalFillers.current,
          avg_response_time: meanResponseTime,
          answer_variance: Math.sqrt(variance)
        }
      });

      saveSession({
        type: 'interview',
        interview_mode: interviewType,
        start_time: sessionStartTime.current || new Date().toISOString(),
        end_time: endTime,
        duration_minutes: duration,
        questions_and_answers: qaHistory.current,
        filler_words_total: totalFillers.current,
        interview_score: res.data.overall_score,
        composite_grade: res.data.composite_grade,
        radar_scores: res.data.dimension_scores,
        full_report: res.data
      });

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onInterviewComplete(res.data);
      }, 2000);

    } catch (err) {
      setAvatarState("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateAnswer = async () => {
    const fullAnswer = (transcript + ' ' + interimTranscript).trim();
    if (!fullAnswer || isPaused) return;

    const responseTime = turnStartTime.current ? (Date.now() - turnStartTime.current) / 1000 : 0;
    
    // Create new entry for this turn
    const turnEntry = {
        question: currentQuestion,
        answer_transcript: fullAnswer,
        response_time_seconds: Math.round(responseTime),
        scores: { relevance: 0, clarity: 0, technical: 0 },
        ai_feedback: "Neural review pending..."
    };
    qaHistory.current.push(turnEntry);

    // CHUNK 2: Secret Background Evaluation
    const evaluateAnswer = async () => {
        try {
            const evalRes = await axios.post(`${API_BASE_URL}/interview/evaluate`, {
                question: turnEntry.question,
                answer: turnEntry.answer_transcript,
                what_we_look_for: "General competency and architectural depth."
            });
            // Update the reference with real scores
            turnEntry.scores = evalRes.data.scores;
            turnEntry.ai_feedback = evalRes.data.feedback;
        } catch (e) {
            console.error("Neural background eval failed", e);
        }
    };
    evaluateAnswer(); // Fire and forget (it will update the ref)

    speechApiRef.current?.stop();
    const updatedHistory = [...conversationHistory, { role: "user", content: fullAnswer }];
    setConversationHistory(updatedHistory);
    setTranscript("");
    setInterimTranscript("");
    questionCount.current += 1;
    await handleTurn(updatedHistory);
  };

  const startInterview = async () => {
    setLoading(true);
    setAvatarState("thinking");
    sessionStartTime.current = new Date().toISOString();
    
    try {
      const res = await axios.post(`${API_BASE_URL}/interview/live-start`, {
        resume_data: resumeData,
        target_role: targetRole,
        mode: interviewType
      });
      const openingMessage = res.data.opening;
      const initialAgent = res.data.agent || (interviewType === 'panel' ? 'alex' : 'sarah');
      setCurrentAgent(initialAgent);
      setCurrentQuestion(openingMessage);
      setConversationHistory([{ role: "assistant", content: openingMessage, agent: initialAgent }]);
      setInterviewStarted(true);
      speakText(openingMessage, initialAgent);
    } catch (err) {
      setAvatarState('idle');
    } finally {
      setLoading(false);
    }
  };

  const togglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    if (nextPaused) { window.speechSynthesis.cancel(); speechApiRef.current?.stop(); setAvatarState("idle"); }
    else if (currentQuestion) speakText(currentQuestion, currentAgent);
  };

  const toggleMic = () => {
    if (speechApiRef.current?.isActive()) { speechApiRef.current?.stop(); setAvatarState("idle"); }
    else { speechApiRef.current?.start(); setAvatarState("listening"); }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-1000 pb-20 px-4 md:px-0">
      
      {/* Recording Notification Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[300] bg-green-500 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center gap-4"
          >
            <CheckCircle2 size={20} /> Session Recorded ✓
          </motion.div>
        )}
      </AnimatePresence>

      {loading && avatarState === 'thinking' && !interviewStarted && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6" />
            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Initializing Neural Link...</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Panel Profiles */}
        <div className="lg:col-span-3 space-y-6">
           {!interviewStarted ? (
             <div className="glass-card p-8 rounded-[2.5rem] bg-black/20 border-white/10 text-center">
                <h3 className="text-sm font-black text-white uppercase mb-6">Select Protocol</h3>
                <div className="flex flex-col gap-4">
                   <button onClick={() => setInterviewType('solo')} className={`py-4 rounded-2xl border transition-all flex items-center justify-center gap-3 ${interviewType === 'solo' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}>
                      <User size={18} /> Solo: Maya Lin
                   </button>
                   <button onClick={() => setInterviewType('panel')} className={`py-4 rounded-2xl border transition-all flex items-center justify-center gap-3 ${interviewType === 'panel' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}>
                      <Users size={18} /> Panel: Rohan & Maya
                   </button>
                </div>
                <button onClick={startInterview} disabled={loading} className="w-full mt-8 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                   {loading ? <Loader2 className="animate-spin" /> : "Initiate Link"}
                </button>
             </div>
           ) : (
             <div className="glass-card p-6 rounded-[2.5rem] bg-black/20 border-white/10 space-y-8">
                <div className="text-center pt-4">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full mb-4">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Live Link Established</span>
                   </div>
                   <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Interview Panel</h3>
                </div>

                <div className={`flex flex-col gap-8 transition-all duration-500`}>
                   <div className={`relative ${currentAgent === 'sarah' ? 'opacity-100 scale-100' : 'opacity-40 scale-95 blur-[1px]'}`}>
                      <InterviewerAvatar type="sarah" state={currentAgent === 'sarah' ? avatarState : 'idle'} />
                      <p className="text-[9px] font-black text-center mt-2 text-white uppercase">Maya Lin (HR)</p>
                   </div>
                   {interviewType === 'panel' && (
                     <div className={`relative ${currentAgent === 'alex' ? 'opacity-100 scale-100' : 'opacity-40 scale-95 blur-[1px]'}`}>
                        <InterviewerAvatar type="alex" state={currentAgent === 'alex' ? avatarState : 'idle'} />
                        <p className="text-[9px] font-black text-center mt-2 text-white uppercase">Rohan Menon (Tech Lead)</p>
                     </div>
                   )}
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                   <button onClick={togglePause} className="w-full py-3 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-2">
                      {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />} {isPaused ? "Resume" : "Pause"}
                   </button>
                   <button onClick={finalizeInterview} className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">End Session</button>
                </div>
             </div>
           )}
        </div>

        {/* Center: Conversation */}
        <div className="lg:col-span-6">
           <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl min-h-[700px] flex flex-col justify-between relative overflow-hidden bg-black/40 backdrop-blur-xl">
              {interviewStarted ? (
                <div className="space-y-8 h-full flex flex-col">
                   <div className="relative group flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-6 px-4">
                         <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${currentAgent === 'alex' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'}`}>
                            {currentAgent === 'alex' ? 'Rohan Menon (Technical)' : 'Maya Lin (HR)'}
                         </div>
                      </div>
                      <div className="relative bg-black/40 p-10 rounded-[2.5rem] border border-white/5 flex-1 flex flex-col justify-center min-h-[300px]">
                         <AnimatePresence mode='wait'>
                            <motion.h2 key={currentQuestion} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-2xl lg:text-3xl font-black text-white tracking-tighter leading-tight italic">
                               "{currentQuestion || (avatarState === 'thinking' ? `${currentAgent === 'alex' ? 'Rohan' : 'Maya'} is thinking...` : '')}"
                            </motion.h2>
                         </AnimatePresence>
                      </div>
                   </div>

                   <div className="bg-white/5 p-8 rounded-[2.5rem] border border-dashed border-white/10 min-h-[160px] flex flex-col justify-center relative">
                      <div className="absolute top-4 left-8 flex items-center gap-3 text-[8px] font-black text-gray-500 uppercase tracking-widest">
                         <div className={`w-1.5 h-1.5 rounded-full ${avatarState === 'listening' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} /> Neural Transcript
                      </div>
                      <div className="text-xl font-medium text-gray-300 italic leading-relaxed">
                         {transcript} <span className="text-white/40">{interimTranscript}</span>
                      </div>
                   </div>

                   <div className="flex items-center gap-6">
                      <button onClick={toggleMic} disabled={avatarState === 'speaking' || avatarState === 'thinking'} className={`p-7 rounded-full transition-all active:scale-90 ${avatarState === 'listening' ? 'bg-green-500 text-black scale-110 shadow-xl' : 'bg-blue-600 text-white'}`}>
                         {avatarState === 'listening' ? <Mic size={28} /> : <MicOff size={28} />}
                      </button>
                      {(transcript || interimTranscript) && avatarState !== 'thinking' && (
                        <button onClick={handleCandidateAnswer} className="flex-1 py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-4">
                           <Send size={18} /> Transmit
                        </button>
                      )}
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in duration-1000">
                   <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20"><Users className="text-blue-500 w-10 h-10" /></div>
                   <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Initialize Panel</h2>
                   <p className="text-gray-500 max-w-sm font-medium">Select your interview protocol to begin the simulation.</p>
                </div>
              )}
           </div>
        </div>

        {/* Right Sidebar: Analytics */}
        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card p-8 rounded-[2.5rem] bg-black/20 border-white/10 h-full flex flex-col space-y-8">
              <div className="flex items-center gap-3"><Activity className="text-blue-500" size={18} /><h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Pulse</h3></div>
              <div className="space-y-8 flex-1">
                 {[{ label: 'Confidence', val: metrics.confidence, color: 'green' }, { label: 'Clarity', val: metrics.clarity, color: 'blue' }, { label: 'Pace', val: Math.min(100, (metrics.wpm/180)*100), color: 'purple' }].map(m => (
                   <div key={m.label} className="space-y-3">
                      <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-500"><span>{m.label}</span><span className={`text-white`}>{m.label === 'Pace' ? metrics.wpm + ' WPM' : m.val + '%'}</span></div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><motion.div animate={{ width: `${m.val}%` }} className={`h-full bg-${m.color}-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} /></div>
                   </div>
                 ))}
                 <div className="glass p-6 rounded-2xl text-center space-y-1">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Fillers</p>
                    <AnimatePresence mode='wait'><motion.p key={metrics.fillerCount} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-4xl font-black text-white">{metrics.fillerCount}</motion.p></AnimatePresence>
                 </div>
              </div>
              <div className="pt-6 border-t border-white/5"><div className="flex items-center gap-3 text-blue-500/40"><Gauge size={14} /><span className="text-[8px] font-black uppercase">Real-time Telemetry Active</span></div></div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default LiveInterviewRoom;
