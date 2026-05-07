import React, { useState } from 'react';
import { useCareerStore } from '../store/useCareerStore';
import { 
  History, Clock, Target, Activity, ExternalLink, 
  Trash2, Download, Search, Filter, ArrowUpRight, 
  Briefcase, Loader2, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import SessionPDF from './SessionPDF';

const SessionHistory: React.FC = () => {
  const { sessions, deleteSession, resumeData } = useCareerStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(s => 
    s.target_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-400';
    return 'text-yellow-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
         <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Transmission Archive</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 flex items-center gap-2">
               <History size={12} className="text-blue-500" /> Neural History of all platform sessions
            </p>
         </div>
         <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 w-full md:w-96 group focus-within:border-blue-500/50 transition-all">
            <Search size={16} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by role or type..." 
              className="bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-8 rounded-3xl border-white/5 flex items-center gap-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><Activity size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase">Total Sessions</p>
               <p className="text-3xl font-black text-white">{sessions.length}</p>
            </div>
         </div>
         <div className="glass-card p-8 rounded-3xl border-white/5 flex items-center gap-6">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500"><Target size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase">Average Index</p>
               <p className="text-3xl font-black text-white">
                  {sessions.length > 0 ? Math.round(sessions.reduce((a, b) => a + (b.interview_score || b.ats_score), 0) / sessions.length) : 0}%
               </p>
            </div>
         </div>
         <div className="glass-card p-8 rounded-3xl border-white/5 flex items-center gap-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500"><Clock size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase">Practice Time</p>
               <p className="text-3xl font-black text-white">
                  {sessions.reduce((a, b) => a + (b.duration_minutes || 0), 0)}m
               </p>
            </div>
         </div>
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-[3.5rem] overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.01]">
                     <th className="p-8">Session Details</th>
                     <th className="p-8 text-center">Protocol</th>
                     <th className="p-8 text-center">Duration</th>
                     <th className="p-8 text-center">Score</th>
                     <th className="p-8 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredSessions.map((s) => (
                     <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="p-8">
                           <div className="flex items-center gap-5">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                 <Briefcase size={18} />
                              </div>
                              <div>
                                 <p className="text-sm font-black text-white uppercase tracking-tighter">{s.target_role}</p>
                                 <p className="text-[10px] font-bold text-gray-600 mt-1">{s.date}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-8 text-center">
                           <span className={`px-4 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest
                              ${s.type === 'interview' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 
                                s.type === 'ats' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                              {s.interview_mode || s.type || 'Standard'}
                           </span>
                        </td>
                        <td className="p-8 text-center">
                           <p className="text-xs font-black text-gray-400">{s.duration_minutes || '--'} m</p>
                        </td>
                        <td className="p-8 text-center">
                           <div className={`text-xl font-black ${getScoreColor(s.interview_score || s.ats_score)}`}>
                              {s.interview_score || s.ats_score}%
                           </div>
                        </td>
                        <td className="p-8 text-right">
                           <div className="flex items-center justify-end gap-3">
                              {s.type === 'interview' && (
                                <PDFDownloadLink
                                  document={<SessionPDF session={s} userName={resumeData?.name || 'Professional'} />}
                                  fileName={`Mocky_Session_${s.date}.pdf`}
                                  className="p-3 bg-white/5 rounded-xl text-gray-500 hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                                >
                                  {({ loading }) => (loading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />)}
                                </PDFDownloadLink>
                              )}
                              <button 
                                onClick={() => deleteSession(s.id)}
                                className="p-3 bg-white/5 rounded-xl text-gray-500 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {filteredSessions.length === 0 && (
               <div className="py-40 text-center flex flex-col items-center opacity-30">
                  <History size={64} className="mb-6 text-gray-500" />
                  <h3 className="text-xl font-black text-white uppercase tracking-[0.4em]">Archive is Empty</h3>
                  <p className="text-[10px] font-bold text-gray-600 uppercase mt-4 tracking-widest">No transmissions matched your neural query.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default SessionHistory;
