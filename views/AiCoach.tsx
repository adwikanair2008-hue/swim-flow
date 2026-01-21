
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, SwimSession, ChatMessage } from '../types';
import { geminiService } from '../services/gemini';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface AiCoachProps {
  profile: UserProfile;
  sessions: SwimSession[];
  chatHistory: ChatMessage[];
  onUpdateChat: (history: ChatMessage[]) => void;
}

const AiCoach: React.FC<AiCoachProps> = ({ profile, sessions, chatHistory, onUpdateChat }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    const newHistory = [...chatHistory, userMsg];
    onUpdateChat(newHistory);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await geminiService.getAiCoachResponse(profile, sessions, input, chatHistory);
      const botMsg: ChatMessage = { role: 'model', text: responseText };
      onUpdateChat([...newHistory, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { role: 'model', text: "Sorry, I'm feeling a bit underwater right now. Can we try that again?" };
      onUpdateChat([...newHistory, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] flex flex-col max-w-5xl mx-auto px-1 md:px-0">
      <header className="mb-6 flex items-center gap-4 bg-white/40 backdrop-blur-sm p-4 rounded-3xl md:bg-transparent md:p-0">
        <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-sky-100 shrink-0">
          CB
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Coach Blue</h1>
          <div className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-100"></div>
             <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Technique Specialist</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 px-2 pb-6 scrollbar-hide md:bg-white md:rounded-[48px] md:p-8 md:shadow-sm md:border md:border-sky-50">
        {chatHistory.length === 0 && (
          <div className="text-center py-20 px-8 flex flex-col items-center">
            <div className="w-24 h-24 bg-sky-100 rounded-[40px] flex items-center justify-center text-4xl mb-6 animate-bounce-slow">👋</div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Ask Coach Blue anything!</h3>
            <p className="text-slate-400 text-sm mb-10 font-medium">Get technique analysis or training strategy advice.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
              {[
                "How can I improve my flip turns?", 
                "Why am I slowing down in the final 50m?", 
                "Give me a sprint drill for speed.",
                "How to refine my high-elbow catch?",
                "Analyze my recent distance consistency."
              ].map((q) => (
                <button 
                  key={q} 
                  onClick={() => setInput(q)}
                  className="bg-white border border-sky-100 p-4 rounded-2xl text-xs font-bold text-slate-600 hover:border-sky-400 hover:bg-sky-50 transition-all text-left shadow-sm active:scale-95"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] md:max-w-[75%] p-5 rounded-[32px] text-base leading-relaxed font-bold shadow-sm ${
              msg.role === 'user' 
                ? 'bg-sky-500 text-white rounded-br-none shadow-md shadow-sky-100' 
                : 'bg-slate-50 text-slate-700 rounded-bl-none border border-slate-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-50 p-5 rounded-[32px] rounded-bl-none border border-slate-100 shadow-sm">
              <div className="flex gap-1.5 px-2">
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      <div className="p-4 bg-white border border-sky-100 rounded-[32px] mt-6 flex items-center shadow-xl md:p-6 mb-4 md:mb-0 transition-all focus-within:ring-4 focus-within:ring-sky-100">
        <input
          type="text"
          placeholder="Ask your coach about technique, strategy, or sets..."
          className="flex-1 bg-transparent px-4 py-2 outline-none text-base font-bold text-slate-800 placeholder:text-slate-300"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="bg-sky-500 text-white p-4 rounded-[22px] shadow-lg active:scale-90 transition-all disabled:opacity-50 hover:bg-sky-600 shrink-0"
        >
          <PaperAirplaneIcon className="h-6 w-6" />
        </button>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AiCoach;
