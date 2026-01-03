import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';

// This function automatically detects if it should use Render or Localhost
const getChatUrl = () => {
    const apiBase = process.env.REACT_APP_API_BASE;
    if (apiBase) {
        // If apiBase is "https://your-backend.onrender.com/api"
        // This ensures the chat hits "https://your-backend.onrender.com/api/chat"
        return apiBase.endsWith('/') ? `${apiBase}chat` : `${apiBase}/chat`;
    }
    // Local Fallback for when you run on your laptop
    return "http://127.0.0.1:8000/api/chat";
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Strategic AI Link Established. How can I assist your analysis?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // It now uses the dynamic URL
      const res = await axios.post(getChatUrl(), { message: currentInput });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.response }]);
    } catch (err) {
      console.error("Chat Error:", err);
      // Helpful error message for your presentation
      const errorMsg = process.env.REACT_APP_API_BASE 
        ? "Connection to Render Backend failed. Wake it up!" 
        : "Connection failed. Ensure Backend is running at http://127.0.0.1:8000";
      
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="bg-cyan-500 text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-all animate-bounce">
          <MessageSquare size={28} strokeWidth={2.5} />
        </button>
      )}

      {isOpen && (
        <div className="w-80 lg:w-96 h-[500px] bg-[#161b22] border border-slate-800 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="p-5 bg-[#1c2128] border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-cyan-500/10 p-2 rounded-lg"><Bot size={20} className="text-cyan-400" /></div>
                <span className="font-bold text-white uppercase tracking-widest text-[10px]">Strategic Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-[#0b0e14] text-slate-300 border border-slate-800 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start p-2"><Loader2 className="animate-spin text-cyan-400" size={18}/></div>}
          </div>

          <div className="p-4 bg-[#0b0e14] border-t border-slate-800 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2" placeholder="Analyze GDP, Prophet, or Trends..." />
            <button onClick={handleSend} className="text-cyan-400 hover:text-cyan-300 transition-colors"><Send size={18}/></button>
          </div>
        </div>
      )}
    </div>
  );
}
