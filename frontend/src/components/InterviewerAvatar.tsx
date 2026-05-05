import React from 'react';

interface InterviewerAvatarProps {
  state: 'idle' | 'speaking' | 'listening' | 'thinking';
  type?: 'sarah' | 'alex';
}

const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({ state, type = 'sarah' }) => {
  const sarahImg = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&h=256&auto=format&fit=crop";
  const alexImg = "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&h=256&auto=format&fit=crop";

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6">
      <div className="relative">
        <div className={`relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 transition-all duration-500 overflow-hidden shadow-2xl
          ${state === 'speaking' ? 'border-green-500 scale-105 animate-pulse' : 
            state === 'listening' ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 
            state === 'thinking' ? 'border-purple-500 animate-bounce' : 
            'border-white/20'}`}
        >
          <img 
            src={type === 'sarah' ? sarahImg : alexImg} 
            alt={type === 'sarah' ? "Sarah Mitchell" : "Alex Tech Lead"} 
            className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
          />
          
          {state === 'speaking' && (
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/40 rounded-full animate-ping opacity-50"></div>
          )}
        </div>

        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl border border-white/10 transition-colors duration-300 z-10 whitespace-nowrap
          ${state === 'speaking' ? 'bg-green-500 text-black' : 
            state === 'listening' ? 'bg-blue-500 text-white' : 
            state === 'thinking' ? 'bg-purple-500 text-white' : 
            'bg-gray-800 text-gray-400'}`}
        >
          {state === 'speaking' && '🔊 Speaking'}
          {state === 'listening' && '🎤 Listening'}
          {state === 'thinking' && '💭 Thinking'}
          {state === 'idle' && '● Ready'}
        </div>
      </div>

      <div className={`flex gap-1 h-6 items-center transition-opacity duration-300 ${state === 'speaking' ? 'opacity-100' : 'opacity-0'}`}>
        {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
          <div 
            key={i} 
            className={`w-0.5 ${type === 'sarah' ? 'bg-green-500' : 'bg-blue-400'} rounded-full animate-wave`} 
            style={{ 
              height: `${h * 20}%`,
              animationDelay: `${i * 0.1}s`
            }}
          ></div>
        ))}
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.5); }
        }
        .animate-wave {
          animation: wave 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default InterviewerAvatar;
