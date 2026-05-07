import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ResumeUpload from './components/ResumeUpload';
import ScoreCard from './components/ScoreCard';
import InterviewRoom from './components/InterviewRoom';
import LiveInterviewRoom from './components/LiveInterviewRoom';
import ResumeEnhancer from './components/ResumeEnhancer';
import Dashboard from './components/Dashboard';
import GitHubAnalyzer from './components/GitHubAnalyzer';
import CoverLetterGenerator from './components/CoverLetter';
import SalaryEstimator from './components/SalaryEstimator';
import InterviewDebrief from './components/InterviewDebrief';
import GlobalChat from './components/GlobalChat';
import MasterReport from './components/MasterReport';

import { Brain, Target, LayoutDashboard, Activity, Sparkles, GitBranch, Mail, Terminal, Zap, Map, FileText } from 'lucide-react';
import axios from 'axios';
import { useCareerStore } from './store/useCareerStore';
import CodingLab from './components/CodingLab';
import CareerRoadmap from './components/CareerRoadmap';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim();

function App() {
  const { 
    resumeData, setResumeData, 
    targetRole, setTargetRole, 
    atsResult, setATSResult, 
    interviewReport, setInterviewReport,
    saveSession
  } = useCareerStore();

  const navigate = useNavigate();
  const location = useLocation();
  const [loadingAts, setLoadingAts] = useState(false);
  const [jd, setJd] = useState('');
  const [interviewMode, setInterviewMode] = useState<'practice' | 'live'>('practice');
  const [showDebrief, setShowDebrief] = useState(false);
  const [isSkipMode, setIsSkipMode] = useState(false);

  const isSessionActive = resumeData || isSkipMode;

  const handleUploadSuccess = (data: any) => {
    setATSResult(null);
    setInterviewReport(null);
    setResumeData(data);
    setIsSkipMode(false);
    navigate('/dashboard');
  };

  const handleQuickStart = () => {
    setATSResult(null);
    setInterviewReport(null);
    setIsSkipMode(true);
    navigate('/dashboard');
  };

  const handleAtsCheck = async () => {
    if (!jd) return;
    setLoadingAts(true);
    try {
      if (resumeData) {
        const response = await axios.post(`${API_BASE_URL}/ats/score`, {
          resume_text: resumeData.raw_text,
          job_description: jd
        });
        setATSResult(response.data);
        saveSession({ type: 'ats', ats_score: response.data.ats_score });
      } else {
        const response = await axios.post(`${API_BASE_URL}/ats/score`, {
          resume_text: "GUEST_SIMULATION_MODE",
          job_description: jd
        });
        setATSResult({ ...response.data, isSimulation: true });
      }
    } catch (err) {
      console.error("ATS Error:", err);
    } finally {
      setLoadingAts(false);
    }
  };

  const handleInterviewComplete = (report: any) => {
    setInterviewReport(report);
    saveSession({
      type: 'interview',
      interview_score: report.overall_score,
      radar_scores: report.dimension_scores,
      full_report: report,
      strengths: report.strengths,
      gaps: report.optimization_gaps
    });
    setShowDebrief(true);
  };

  const navItems = [
    { id: 'dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Neural Dashboard' },
    { id: 'ats', path: '/ats', icon: <Target size={18} />, label: 'ATS Engine' },
    { id: 'enhance', path: '/enhance', icon: <Sparkles size={18} />, label: 'Resume AI' },
    { id: 'coding', path: '/coding', icon: <Terminal size={18} />, label: 'Coding Lab' },
    { id: 'interview', path: '/interview', icon: <Activity size={18} />, label: 'Live Interview' },
    { id: 'github', path: '/github', icon: <GitBranch size={18} />, label: 'GitHub Audit' },
    { id: 'cover', path: '/cover', icon: <Mail size={18} />, label: 'Cover Letter' },
    { id: 'roadmap', path: '/roadmap', icon: <Map size={18} />, label: 'Career Roadmap' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_#111827,_#000000)] pointer-events-none z-0" />
      
      {showDebrief && interviewReport && (
        <InterviewDebrief 
          report={interviewReport} 
          onRestart={() => { setShowDebrief(false); navigate('/interview'); }} 
          onDashboard={() => { setShowDebrief(false); navigate('/dashboard'); }}
        />
      )}

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Persistent Sidebar for Active Sessions */}
        {isSessionActive && (
          <aside className="w-72 glass border-r border-white/5 hidden lg:flex flex-col p-8 z-40 bg-black/20 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-12 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                <Brain className="text-white w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter text-white">
                MOCKY <span className="text-blue-500">AI</span>
              </h1>
            </div>

            <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${
                    location.pathname === item.path 
                      ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30 border border-blue-400/20' 
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
               <div className="bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2">Neural Strategy</p>
                  <select 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-xs font-black text-white focus:ring-0 cursor-pointer"
                  >
                    <option className="bg-gray-900">Software Engineer</option>
                    <option className="bg-gray-900">Data Analyst</option>
                    <option className="bg-gray-900">Product Manager</option>
                    <option className="bg-gray-900">Frontend Developer</option>
                    <option className="bg-gray-900">Backend Developer</option>
                    <option className="bg-gray-900">DevOps Engineer</option>
                    <option className="bg-gray-900">ML Engineer</option>
                  </select>
               </div>
               <button 
                onClick={() => { setResumeData(null); setIsSkipMode(false); navigate('/'); }}
                className="w-full py-3 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5"
               >
                Reset Session
               </button>
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto relative">
          <div className="max-w-7xl mx-auto px-8 lg:px-12 py-12">
            <Routes>
              {/* Home / Landing Route */}
              <Route path="/" element={
                !isSessionActive ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-1000">
                    <div className="mb-12 px-8 py-3 rounded-full glass border-white/10 text-[11px] font-black text-blue-400 tracking-[0.4em] uppercase bg-blue-500/5">
                      Tech Sageathon 2K26 • Neural Intelligence
                    </div>
                    <h2 className="text-7xl lg:text-[10rem] font-black text-white mb-8 tracking-tighter leading-[0.85]">
                      MASTER YOUR <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">CAREER PATH</span>
                    </h2>
                    <p className="text-xl lg:text-2xl text-gray-400 max-w-4xl mb-24 font-medium leading-relaxed">
                      The ultimate Career Operating System. Analyze your codebase, optimize your resume, and dominate interviews with our state-of-the-art neural engine.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                      <div className="glass-card p-12 rounded-[3.5rem] border-white/10 bg-gradient-to-br from-blue-600/5 to-transparent flex flex-col items-center text-center group hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
                          <Mail size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Personalized Audit</h3>
                        <p className="text-sm text-gray-500 mb-10 leading-relaxed font-medium">Upload your resume for a custom-tailored ATS analysis and personalized interview sessions.</p>
                        <ResumeUpload onUploadSuccess={handleUploadSuccess} />
                      </div>
                      <div className="glass-card p-12 rounded-[3.5rem] border-white/10 bg-gradient-to-br from-indigo-600/5 to-transparent flex flex-col items-center text-center group hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden">
                        <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
                          <Brain size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Instant Simulation</h3>
                        <p className="text-sm text-gray-500 mb-10 leading-relaxed font-medium">Bypass the upload and jump straight into role-based assessments and coding challenges.</p>
                        <button 
                          onClick={handleQuickStart}
                          className="w-full py-6 bg-white text-black hover:bg-indigo-600 hover:text-white rounded-[2rem] font-black text-xs tracking-[0.3em] uppercase transition-all shadow-2xl flex items-center justify-center gap-4"
                        >
                          Quick Start <Zap size={18} className="fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : <Navigate to="/dashboard" replace />
              } />

              {/* Protected Routes */}
              <Route path="/dashboard" element={isSessionActive ? <Dashboard onNavigate={(id) => navigate('/' + id)} /> : <Navigate to="/" replace />} />
              
              <Route path="/ats" element={isSessionActive ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden group">
                      <textarea
                        placeholder="Paste the target Job Description to initiate neural comparison..."
                        className="w-full h-80 bg-black/40 p-6 rounded-[2rem] border border-white/5 focus:border-blue-500/50 focus:ring-0 resize-none text-sm text-gray-300 font-medium leading-relaxed transition-all custom-scrollbar"
                        value={jd}
                        onChange={(e) => setJd(e.target.value)}
                      ></textarea>
                      <button
                        onClick={handleAtsCheck}
                        disabled={!jd || loadingAts || (!resumeData && !isSkipMode)}
                        className="w-full mt-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-3"
                      >
                        {loadingAts ? "NEURAL ANALYSIS..." : "RUN ATS CHECK"}
                      </button>
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    {atsResult ? <ScoreCard data={atsResult} /> : (
                      <div className="glass-card h-full min-h-[500px] rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 p-16 text-center">
                        <Target size={64} className="text-gray-800 mb-8" />
                        <h3 className="text-3xl font-black text-gray-300 mb-4 uppercase">Awaiting JD Input</h3>
                      </div>
                    )}
                  </div>
                </div>
              ) : <Navigate to="/" replace />} />

              <Route path="/enhance" element={isSessionActive ? (
                resumeData ? <ResumeEnhancer resumeData={resumeData} targetRole={targetRole} jobDescription={jd} /> : (
                  <div className="glass-card p-20 rounded-[3rem] text-center border-white/10">
                    <Sparkles size={64} className="text-gray-800 mx-auto mb-8" />
                    <h3 className="text-2xl font-black text-white uppercase">Resume Required</h3>
                    <p className="text-gray-500 mb-8">This module requires a parsed resume to enhance.</p>
                    <button onClick={() => navigate('/')} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase">Go Home</button>
                  </div>
                )
              ) : <Navigate to="/" replace />} />

              <Route path="/coding" element={isSessionActive ? <CodingLab role={targetRole} /> : <Navigate to="/" replace />} />

              <Route path="/interview" element={isSessionActive ? (
                <div className="space-y-8">
                   <div className="flex justify-center">
                      <div className="bg-white/5 p-1.5 rounded-2xl border border-white/5 inline-flex gap-2">
                         <button onClick={() => setInterviewMode('practice')} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${interviewMode === 'practice' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Practice Mode</button>
                         <button onClick={() => setInterviewMode('live')} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${interviewMode === 'live' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Live Session</button>
                      </div>
                   </div>
                   {interviewMode === 'practice' ? (
                     <InterviewRoom resumeText={resumeData?.raw_text || "General AI professional profile"} role={targetRole} />
                   ) : (
                     <LiveInterviewRoom resumeData={resumeData || { name: "Guest", raw_text: "General professional seeking " + targetRole }} targetRole={targetRole} onInterviewComplete={handleInterviewComplete} />
                   )}
                </div>
              ) : <Navigate to="/" replace />} />

              <Route path="/github" element={isSessionActive ? <GitHubAnalyzer /> : <Navigate to="/" replace />} />
              <Route path="/cover" element={isSessionActive ? <CoverLetterGenerator /> : <Navigate to="/" replace />} />
              <Route path="/roadmap" element={isSessionActive ? <CareerRoadmap /> : <Navigate to="/" replace />} />
              <Route path="/report" element={isSessionActive ? <MasterReport /> : <Navigate to="/" replace />} />
              
              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      <GlobalChat />
    </div>
  );
}

export default App;
