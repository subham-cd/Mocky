import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, X, CheckCircle2, MessageSquareText, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ModuleFeedbackProps {
  module: string;
  session_id?: number;
  onClose?: () => void;
}

const ModuleFeedback: React.FC<ModuleFeedbackProps> = ({ module, session_id, onClose }) => {
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/feedback/`, {
        module,
        rating,
        comment,
        session_id
      });
      setSubmitted(true);
      if (onClose) setTimeout(onClose, 2000);
    } catch (err) {
      console.error("Feedback failed", err);
    } finally {
      setLoading(false);
    }
  };

  const emojis = ['😞', '😐', '🙂', '🚀'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 rounded-[2.5rem] border-white/10 max-w-md w-full bg-[#0a0c10]/90 backdrop-blur-xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
      
      <AnimatePresence mode='wait'>
        {!submitted ? (
          <motion.div key="form" exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">Module Feedback</h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Rate your experience with {module}</p>
               </div>
               {onClose && (
                 <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
                    <X size={18} />
                 </button>
               )}
            </div>

            <div className="flex justify-between gap-3">
               {emojis.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className={`flex-1 py-4 rounded-2xl border transition-all text-2xl hover:scale-110 active:scale-95
                      ${rating === i + 1 ? 'bg-blue-600 border-blue-400 grayscale-0 shadow-lg' : 'bg-white/5 border-white/5 grayscale hover:bg-white/10'}`}
                  >
                    {emoji}
                  </button>
               ))}
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-2 text-[8px] font-black text-gray-500 uppercase tracking-widest">
                  <MessageSquareText size={10} /> Optional Comment
               </div>
               <textarea 
                 value={comment}
                 onChange={(e) => setComment(e.target.value)}
                 placeholder="What could be improved?"
                 className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-white focus:border-blue-500/50 focus:ring-0 resize-none transition-all"
               />
            </div>

            <button
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
              className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-blue-600 hover:text-white transition-all shadow-xl disabled:opacity-30 flex items-center justify-center gap-3"
            >
               {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Submit Feedback</>}
            </button>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center space-y-4">
             <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
             </div>
             <h3 className="text-xl font-black text-white uppercase">Thank You!</h3>
             <p className="text-xs text-gray-500 font-medium tracking-wide">Your neural feedback has been logged.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModuleFeedback;
