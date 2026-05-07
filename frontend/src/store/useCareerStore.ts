import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface QuestionAnswer {
  question: string;
  answer_transcript: string;
  response_time_seconds: number;
  scores?: {
    relevance: number;
    clarity: number;
    technical: number;
  };
  ai_feedback?: string;
}

interface Session {
  id: number;
  date: string;
  target_role: string;
  ats_score: number;
  interview_score: number;
  radar_scores: any;
  full_report: any;
  type?: string;
  strengths?: string[];
  gaps?: string[];
  // Extended Tracking
  interview_mode?: 'solo' | 'panel';
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  questions_and_answers?: QuestionAnswer[];
  filler_words_total?: number;
  composite_grade?: string;
}

interface CareerState {
  resumeData: any;
  targetRole: string;
  atsResult: any;
  interviewReport: any;
  sessions: Session[];
  
  setResumeData: (data: any) => void;
  setTargetRole: (role: string) => void;
  setATSResult: (result: any) => void;
  setInterviewReport: (report: any) => void;
  
  saveSession: (sessionData: Partial<Session>) => void;
  deleteSession: (sessionId: number) => void;
  getCareerHealth: () => number;
  clearAll: () => void;
}

export const useCareerStore = create<CareerState>()(
  persist(
    (set, get) => ({
      resumeData: null,
      targetRole: "Software Engineer",
      atsResult: null,
      interviewReport: null,
      sessions: [],
      
      setResumeData: (data) => set({ resumeData: data }),
      setTargetRole: (role) => set({ targetRole: role }),
      setATSResult: (result) => set({ atsResult: result }),
      setInterviewReport: (report) => set({ interviewReport: report }),
      
      saveSession: (sessionData) => set((state) => {
        const newSession: Session = {
          id: Date.now(),
          date: new Date().toLocaleDateString('en-IN'),
          target_role: state.targetRole,
          ats_score: sessionData.ats_score ?? state.atsResult?.ats_score ?? 0,
          interview_score: sessionData.interview_score ?? state.interviewReport?.overall_score ?? 0,
          radar_scores: sessionData.radar_scores ?? state.interviewReport?.dimension_scores ?? {},
          full_report: sessionData.full_report ?? state.interviewReport ?? null,
          type: sessionData.type,
          strengths: sessionData.strengths,
          gaps: sessionData.gaps,
          
          // Enhanced data
          interview_mode: sessionData.interview_mode,
          start_time: sessionData.start_time,
          end_time: sessionData.end_time,
          duration_minutes: sessionData.duration_minutes,
          questions_and_answers: sessionData.questions_and_answers,
          filler_words_total: sessionData.filler_words_total,
          composite_grade: sessionData.composite_grade || state.interviewReport?.composite_grade
        };
        
        return {
          sessions: [newSession, ...state.sessions].slice(0, 15)
        };
      }),

      deleteSession: (sessionId) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== sessionId)
      })),
      
      getCareerHealth: () => {
        const { atsResult, interviewReport, resumeData, sessions } = get();
        const ats = atsResult?.ats_score ?? 0;
        const interview = interviewReport?.overall_score ?? 0;
        const codingSessions = sessions.filter(s => s.type === 'coding');
        const codingScore = codingSessions.length > 0 
          ? Math.round(codingSessions.reduce((acc, s) => acc + (s.interview_score || 0), 0) / codingSessions.length)
          : 0;

        const profile = resumeData ? 80 : 40; 
        
        if (!ats && !interview && !codingScore) return 0;
        
        return Math.round((ats * 0.3) + (interview * 0.4) + (codingScore * 0.2) + (profile * 0.1));
      },

      clearAll: () => set({ resumeData: null, atsResult: null, interviewReport: null, sessions: [] })
    }),
    { 
      name: 'careercraft-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        resumeData: state.resumeData,
        targetRole: state.targetRole,
        atsResult: state.atsResult,
        interviewReport: state.interviewReport,
        sessions: state.sessions,
      }),
    }
  )
);
