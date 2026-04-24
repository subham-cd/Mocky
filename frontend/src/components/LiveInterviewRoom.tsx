import React, { useState, useRef, useEffect } from 'react';
import { Play, Send, Zap, Loader2, Info, Mic, Pause, Square, MicOff } from 'lucide-react';
import axios from 'axios';
import InterviewerAvatar from './InterviewerAvatar';
import { SpeechToText } from '../utils/speechApi';

interface LiveInterviewRoomProps {
  resumeData: any;
  targetRole: string;
  onInterviewComplete: (report: any) => void;
}

const LiveInterviewRoom: React.FC<LiveInterviewRoomProps> = ({ resumeData, targetRole, onInterviewComplete }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('idle');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const questionCount = useRef(0);
  
  const speechApiRef = useRef<SpeechToText | null>(null);

  // Initialize Speech API
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

  // TEXT TO SPEECH
  const speakText = (text: string) => {
    if (isPaused) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const sarahVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Female')) || voices[0];
    if (sarahVoice) utterance.voice = sarahVoice;

    setAvatarState("speaking");
    utterance.onend = () => {
      if (!isPaused) {
        setAvatarState("listening");
        speechApiRef.current?.start();
      } else {
        setAvatarState("idle");
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  // STREAMING TURN
  const handleStreamingTurn = async (updatedHistory: any[]) => {
    setAvatarState('thinking');
    setCurrentQuestion("");
    
    try {
      const response = await fetch(`${API_BASE_URL}/interview/live-turn-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_history: updatedHistory,
          resume_data: resumeData,
          target_role: targetRole,
          question_number: questionCount.current
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
              setConversationHistory(prev => [...prev, { role: 'assistant', content: fullText }]);
              speakText(fullText);
              return;
            }
            fullText += text;
            setCurrentQuestion(fullText);
          }
        }
      }
    } catch (err) {
      console.error("Streaming failed", err);
      setAvatarState('idle');
    }
  };

  const finalizeInterview = async () => {
    speechApiRef.current?.stop();
    setLoading(true);
    setAvatarState("thinking");
    try {
      const res = await axios.post(`${API_BASE_URL}/interview/live-report`, {
        conversation_history: conversationHistory,
        target_role: targetRole
      });
      onInterviewComplete(res.data);
    } catch (err) {
      console.error("Report generation failed", err);
      setAvatarState("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateAnswer = async () => {
    const fullAnswer = (transcript + ' ' + interimTranscript).trim();
    if (!fullAnswer || isPaused) return;

    speechApiRef.current?.stop();
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: fullAnswer }
    ];
    setConversationHistory(updatedHistory);
    setTranscript("");
    setInterimTranscript("");
    questionCount.current += 1;
    
    await handleStreamingTurn(updatedHistory);
  };

  const startInterview = async () => {
    setLoading(true);
    setAvatarState("thinking");
    try {
      const res = await axios.post(`${API_BASE_URL}/interview/live-start`, {
        resume_data: resumeData,
        target_role: targetRole
      });
      const openingMessage = res.data.opening;
      setCurrentQuestion(openingMessage);
      setConversationHistory([{ role: "assistant", content: openingMessage }]);
      setInterviewStarted(true);
      speakText(openingMessage);
    } catch (err) {
      console.error("Start failed", err);
      setAvatarState("idle");
    } finally {
      setLoading(false);
    }
  };

  const togglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    if (nextPaused) {
      window.speechSynthesis.cancel();
      speechApiRef.current?.stop();
      setAvatarState("idle");
    } else {
      if (currentQuestion) {
        speakText(currentQuestion);
      }
    }
  };

  const toggleMic = () => {
    if (speechApiRef.current?.isActive()) {
        speechApiRef.current?.stop();
        setAvatarState("idle");
    } else {
        speechApiRef.current?.start();
        setAvatarState("listening");
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Sarah Avatar Panel */}
        <div className="lg:col-span-4">
           <div className="glass-card p-10 rounded-[3rem] border-white/10 h-full flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              
              <InterviewerAvatar state={isPaused ? 'idle' : avatarState} />
              
              <div>
                 <h3 className="text-2xl font-black text-white tracking-tighter">Sarah Mitchell</h3>
                 <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-2">Senior Recruiting Lead</p>
              </div>

              {interviewStarted && (
                <div className="w-full flex flex-col gap-3">
                   <button 
                     onClick={togglePause}
                     className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all border ${isPaused ? 'bg-green-500 text-black border-green-500 shadow-xl' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                   >
                      {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                      {isPaused ? "Resume Session" : "Pause Session"}
                   </button>
                   <button 
                     onClick={finalizeInterview}
                     className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
                   >
                      <Square size={14} fill="currentColor" />
                      Complete Interview
                   </button>
                </div>
              )}

              <div className="w-full bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                 <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <span>Dynamic Depth</span>
                    <span className="text-blue-500">{questionCount.current} Rounds</span>
                 </div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Natural Flow Active</p>
              </div>

              {!interviewStarted && (
                <button
                  onClick={startInterview}
                  disabled={loading}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={16} />}
                  Enter Room
                </button>
              )}
           </div>
        </div>

        {/* Right Side: Conversation & Mic */}
        <div className="lg:col-span-8">
           <div className="glass-card p-12 rounded-[3.5rem] border-white/10 shadow-2xl min-h-[600px] flex flex-col justify-between relative overflow-hidden">
              {interviewStarted ? (
                <div className={`space-y-10 transition-opacity duration-500 ${isPaused ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                   <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                      <div className="relative bg-black/40 p-10 rounded-[2.5rem] border border-white/5">
                         <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter leading-tight italic">
                           "{currentQuestion || (avatarState === 'thinking' ? 'Sarah is formulating a follow-up...' : '')}"
                         </h2>
                      </div>
                   </div>

                   <div className="bg-white/5 p-10 rounded-[2.5rem] border border-dashed border-white/10 min-h-[200px] flex flex-col justify-center relative group">
                      <div className="absolute top-4 left-8 flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${avatarState === 'listening' ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-gray-600'}`}></div>
                         <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Neural Link Transcript</span>
                      </div>
                      <div className="text-2xl font-medium text-gray-300 italic leading-relaxed">
                         {transcript}
                         <span className="text-white/40">{interimTranscript}</span>
                         {!transcript && !interimTranscript && (avatarState === 'listening' ? "Sarah is listening..." : "Neural mic is on standby...")}
                      </div>
                   </div>

                   <div className="flex items-center gap-6">
                      <button 
                        onClick={toggleMic}
                        disabled={avatarState === 'speaking' || avatarState === 'thinking'}
                        className={`p-8 rounded-full transition-all shadow-2xl active:scale-90 ${avatarState === 'listening' ? 'bg-green-500 text-black scale-110 shadow-green-500/20' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                      >
                         {avatarState === 'listening' ? <Mic size={32} /> : <MicOff size={32} />}
                      </button>
                      
                      {(transcript || interimTranscript) && avatarState !== 'thinking' && (
                        <button 
                          onClick={handleCandidateAnswer}
                          disabled={loading}
                          className="flex-1 py-6 bg-white text-black rounded-3xl font-black text-sm tracking-[0.2em] uppercase hover:bg-green-500 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4"
                        >
                           {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                           Transmit Answer
                        </button>
                      )}
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                   <div className="bg-blue-500/10 p-8 rounded-full">
                      <Zap className="text-blue-500 w-16 h-16" />
                   </div>
                   <div>
                      <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Simulation Pending</h2>
                      <p className="text-gray-500 max-w-sm mt-4 font-medium leading-relaxed"> Sarah Mitchell is prepared to conduct your dynamic neural assessment. Data synchronization is complete.</p>
                   </div>
                </div>
              )}

              {isPaused && interviewStarted && (
                 <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-[3.5rem] animate-in fade-in duration-300">
                    <div className="text-center space-y-6">
                       <div className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl">
                          Session Paused
                       </div>
                       <button 
                         onClick={togglePause}
                         className="p-6 bg-blue-600 text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"
                       >
                          <Play size={32} fill="currentColor" />
                       </button>
                    </div>
                 </div>
              )}

              {/* Footer Guidelines */}
              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4 text-gray-600">
                    <Info size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Acknowledge Sarah's follow-ups for depth points</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Dynamic Stream</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default LiveInterviewRoom;
