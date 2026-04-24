import React from 'react';

interface InterviewerAvatarProps {
  state: 'idle' | 'speaking' | 'listening' | 'thinking';
}

const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({ state }) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Avatar Image Container */}
        <div className={`relative w-40 h-40 md:w-48 md:h-48 rounded-full border-4 transition-all duration-500 overflow-hidden shadow-2xl
          ${state === 'speaking' ? 'border-green-500 scale-105 animate-pulse' : 
            state === 'listening' ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 
            state === 'thinking' ? 'border-purple-500 animate-bounce' : 
            'border-white/20'}`}
        >
          {/* Using a placeholder if the local image doesn't exist yet */}
          <img 
            src="/interviewer-sarah.jpg" 
            alt="Sarah Mitchell" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&h=256&auto=format&fit=crop";
            }}
          />
          
          {/* Mouth animation overlay for speaking */}
          {state === 'speaking' && (
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/40 rounded-full animate-ping opacity-50"></div>
          )}
        </div>

        {/* Status Badge */}
        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/10 transition-colors duration-300 z-10 whitespace-nowrap
          ${state === 'speaking' ? 'bg-green-500 text-black' : 
            state === 'listening' ? 'bg-blue-500 text-white' : 
            state === 'thinking' ? 'bg-purple-500 text-white' : 
            'bg-gray-800 text-gray-400'}`}
        >
          {state === 'speaking' && '🔊 Speaking...'}
          {state === 'listening' && '🎤 Listening...'}
          {state === 'thinking' && '💭 Thinking...'}
          {state === 'idle' && '● Ready'}
        </div>
      </div>

      {/* Sound Wave Animation (only when speaking) */}
      <div className={`flex gap-1 h-8 items-center transition-opacity duration-300 ${state === 'speaking' ? 'opacity-100' : 'opacity-0'}`}>
        {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
          <div 
            key={i} 
            className="w-1 bg-green-500 rounded-full animate-wave" 
            style={{ 
              height: `${h * 20}%`,
              animationDelay: `${i * 0.1}s`
            }}
          ></div>
        ))}
      </div>

      {/* Custom Styles for Wave Animation */}
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
