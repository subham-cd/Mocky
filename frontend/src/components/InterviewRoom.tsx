import { useState, useEffect, useRef } from 'react';
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
      const response = await axios.post(`${API_BASE_URL}/interview/generate-questions`, { resume_text: resumeText, role: role });
      setQuestions(response.data);
      setStatus('ready');
    } catch (err) { console.error(err); setStatus('idle'); }
  };

  const startInterview = () => { setStatus('interviewing'); setCurrentQuestionIndex(0); setEvaluations([]); };

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
      const response = await axios.post(`${API_BASE_URL}/interview/evaluate`, { question: questions[currentQuestionIndex].question, answer: fullAnswer, what_we_look_for: questions[currentQuestionIndex].what_we_look_for });
      setEvaluations([...evaluations, { ...response.data, question: questions[currentQuestionIndex].question }]);
      setTranscript(''); setInterimTranscript('');
      if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
      else setStatus('finished');
    } catch (err) { console.error(err); } finally { setLoadingEval(false); }
  };

  if (status === 'idle') return <div className="glass-card p-16 rounded-[3rem] text-center flex flex-col items-center"><button onClick={generateQuestions} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase flex items-center gap-3">Generate Questions <Zap size={18} /></button></div>;
  if (status === 'generating') return <div className="glass-card p-24 text-center"><h2>Compiling...</h2></div>;
  if (status === 'ready') return <div className="glass-card p-16 rounded-[3.5rem] max-w-4xl mx-auto shadow-2xl"><button onClick={startInterview} className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase">Start</button></div>;
  if (status === 'interviewing') return <div className="max-w-7xl mx-auto"><h2 className="text-4xl font-black text-white mb-12">"{questions[currentQuestionIndex].question}"</h2><button onClick={toggleListening}>{isListening ? <MicOff /> : <Mic />}</button><button onClick={submitAnswer}>Submit</button></div>;
  if (status === 'finished') return <div className="max-w-6xl mx-auto text-center"><BarChart3 size={40} /><button onClick={() => setStatus('idle')}>Restart</button></div>;
  return null;
};

export default InterviewRoom;
