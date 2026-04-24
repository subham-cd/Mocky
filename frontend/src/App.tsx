import { useState } from 'react';
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

import { Briefcase, Brain, ChevronRight, Target, LayoutDashboard, Settings, Activity, Sparkles, GitBranch, Mail, CircleDollarSign } from 'lucide-react';
import axios from 'axios';
import { useCareerStore } from './store/useCareerStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const { 
    resumeData, setResumeData, 
    targetRole, setTargetRole, 
    atsResult, setATSResult, 
    interviewReport, setInterviewReport,
    saveSession
  } = useCareerStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingAts, setLoadingAts] = useState(false);
  const [jd, setJd] = useState('');
  const [interviewMode, setInterviewMode] = useState<'practice' | 'live'>('practice');
  const [showDebrief, setShowDebrief] = useState(false);

  const handleUploadSuccess = (data: any) => {
    setResumeData(data);
    setActiveTab('ats');
  };

  const handleAtsCheck = async () => {
    if (!resumeData || !jd) return;
    setLoadingAts(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/ats/score`, {
        resume_text: resumeData.raw_text,
        job_description: jd
      });
      setATSResult(response.data);
      saveSession({ type: 'ats', ats_score: response.data.ats_score });
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

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0c10] font-sans selection:bg-blue-500/30">
      {showDebrief && interviewReport && (
        <InterviewDebrief 
          report={interviewReport} 
          onRestart={() => { setShowDebrief(false); setActiveTab('interview'); }} 
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-72 glass border-r border-white/5 hidden lg:flex flex-col p-8 z-40 bg-black/20">
          <div className="flex items-center gap-4 mb-12">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
              <Brain className="text-white w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              MOCKY <span className="text-blue-500">AI</span>
            </h1>
          </div>

          <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Neural Dashboard' },
              { id: 'ats', icon: <Target size={18} />, label: 'ATS Engine' },
              { id: 'enhance', icon: <Sparkles size={18} />, label: 'Resume AI' },
              { id: 'interview', icon: <Activity size={18} />, label: 'Live Interview' },
              { id: 'github', icon: <GitBranch size={18} />, label: 'GitHub Audit' },
              { id: 'cover', icon: <Mail size={18} />, label: 'Cover Letter' },
              { id: 'salary', icon: <CircleDollarSign size={18} />, label: 'Salary Estimator' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${
                  activeTab === item.id 
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
             <button className="flex items-center gap-4 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
               <Settings size={18} />
               System Config
             </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#111827,_#000000)] relative">
          <div className="max-w-7xl mx-auto px-8 lg:px-12 py-12 relative z-10">
            {!resumeData ? (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-1000">
                <div className="mb-8 px-6 py-2 rounded-full glass border-white/10 text-[10px] font-black text-blue-400 tracking-[0.3em] uppercase">
                  Tech Sageathon 2K26 Entry
                </div>
                <h2 className="text-7xl lg:text-9xl font-black text-white mb-8 tracking-tighter leading-none">
                  AI FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">PLACEMENT</span> SUCCESS
                </h2>
                <p className="text-2xl text-gray-400 max-w-3xl mb-16 font-medium leading-relaxed">
                  The ultimate Career Operating System. Analyze, optimize, and master your journey with our state-of-the-art neural engine.
                </p>
                <ResumeUpload onUploadSuccess={handleUploadSuccess} />
              </div>
            ) : (
              <div className="space-y-12">
                {/* Global Stats Bar */}
                <div className="glass-card p-6 rounded-3xl flex items-center justify-between border-white/10 shadow-2xl">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/10">
                      {resumeData.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">{resumeData.name || 'Candidate'}</h3>
                      <p className="text-xs text-gray-500 font-black uppercase tracking-widest">{targetRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setResumeData(null)}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                    >
                      Purge Data
                    </button>
                  </div>
                </div>

                {/* Tab Rendering */}
                <div className="min-h-[700px]">
                  {activeTab === 'dashboard' && (
                    <Dashboard onNavigate={setActiveTab} />
                  )}

                  {activeTab === 'ats' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      <div className="lg:col-span-4 space-y-8">
                        <div className="glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden group">
                          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 tracking-tighter">
                            <Briefcase className="text-blue-500" size={24} />
                            JOB TARGET
                          </h3>
                          <textarea
                            placeholder="Paste the target Job Description to initiate neural comparison..."
                            className="w-full h-80 bg-black/40 p-6 rounded-[2rem] border border-white/5 focus:border-blue-500/50 focus:ring-0 resize-none text-sm text-gray-300 font-medium leading-relaxed transition-all custom-scrollbar"
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                          ></textarea>
                          <button
                            onClick={handleAtsCheck}
                            disabled={!jd || loadingAts}
                            className="w-full mt-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 disabled:bg-gray-800 disabled:grayscale transition-all shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-3"
                          >
                            {loadingAts ? "NEURAL ANALYSIS IN PROGRESS..." : "RUN ATS CHECK"}
                            {!loadingAts && <ChevronRight size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="lg:col-span-8">
                        {atsResult ? (
                          <ScoreCard data={atsResult} />
                        ) : (
                          <div className="glass-card h-full min-h-[500px] rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 p-16 text-center group">
                            <Target size={64} className="text-gray-800 mb-8 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-3xl font-black text-gray-300 mb-4 tracking-tighter uppercase">Awaiting JD Input</h3>
                            <p className="max-w-xs text-sm font-medium text-gray-500 leading-relaxed uppercase tracking-widest text-[10px]">Provide a Job Description to initialize the neural matching engine and generate your ATS scorecard.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'enhance' && (
                    <ResumeEnhancer 
                      resumeText={resumeData.raw_text} 
                      targetRole={targetRole} 
                      jobDescription={jd}
                    />
                  )}

                  {activeTab === 'interview' && (
                    <div className="space-y-8">
                       <div className="flex justify-center">
                          <div className="bg-white/5 p-1.5 rounded-2xl border border-white/5 inline-flex gap-2">
                             <button 
                               onClick={() => setInterviewMode('practice')}
                               className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${interviewMode === 'practice' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                             >
                               Practice Mode
                             </button>
                             <button 
                               onClick={() => setInterviewMode('live')}
                               className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${interviewMode === 'live' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                             >
                               Live Session
                             </button>
                          </div>
                       </div>
                       
                       {interviewMode === 'practice' ? (
                         <InterviewRoom resumeText={resumeData.raw_text} role={targetRole} />
                       ) : (
                         <LiveInterviewRoom 
                           resumeData={resumeData} 
                           targetRole={targetRole} 
                           onInterviewComplete={handleInterviewComplete}
                         />
                       )}
                    </div>
                  )}

                  {activeTab === 'github' && <GitHubAnalyzer />}
                  {activeTab === 'cover' && <CoverLetterGenerator />}
                  {activeTab === 'salary' && <SalaryEstimator />}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
