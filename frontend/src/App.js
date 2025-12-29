import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Terminal from './pages/Terminal';
import Methodology from './pages/Methodology';
import Comparison from './pages/Comparison'; 
import DataView from './pages/DataView'; 
import ChatBot from './components/ChatBot'; // <--- NEW IMPORT

import { Globe, LayoutDashboard, GitCompare, BookOpen, Database, ExternalLink } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0b0e14] text-slate-200 font-sans flex overflow-hidden">
        
        {/* SIDEBAR */}
        <nav className="w-20 lg:w-72 bg-[#161b22] border-r border-slate-800 flex flex-col p-6 sticky top-0 h-screen z-50 shadow-2xl">
          <Link to="/" className="flex items-center gap-3 px-2 mb-12">
            <div className="bg-cyan-500 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
                <Globe className="text-black" size={24} strokeWidth={3} />
            </div>
            <span className="hidden lg:block font-black text-white tracking-tighter text-2xl uppercase underline decoration-cyan-500/50 underline-offset-8">
                STRATEGIC <span className="text-cyan-400">AI</span>
            </span>
          </Link>

          <div className="space-y-3 flex-grow">
            <NavLink to="/" icon={<Globe size={20}/>} label="Home" />
            <NavLink to="/terminal" icon={<LayoutDashboard size={20}/>} label="Strategic Terminal" />
            <NavLink to="/compare" icon={<GitCompare size={20}/>} label="Country Comparison" />
            <NavLink to="/methodology" icon={<BookOpen size={20}/>} label="AI Methodology" />
            <NavLink to="/data" icon={<Database size={20}/>} label="Raw Intelligence" />
          </div>
          
          <div className="hidden lg:block p-5 bg-[#0b0e14]/50 border border-slate-800 rounded-[2rem] mt-auto">
            <div className="flex items-center justify-between mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>System Pulse</span>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
            </div>
            <p className="text-xs text-slate-300 font-bold mb-3 flex items-center gap-2">
                <ExternalLink size={12} className="text-cyan-400" /> World Bank API
            </p>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-cyan-500 w-3/4 h-full"></div>
            </div>
          </div>
        </nav>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/compare" element={<Comparison />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/data" element={<DataView />} />
          </Routes>
          
          {/* FLOATING CHATBOT - APPEARS ON ALL PAGES */}
          <ChatBot /> 
        </main>

      </div>
    </BrowserRouter>
  );
}

function NavLink({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}>
      <div className={`${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'} transition-colors`}>{icon}</div>
      <span className={`hidden lg:block font-bold text-sm tracking-tight ${isActive ? 'text-white' : ''}`}>{label}</span>
      {isActive && <div className="hidden lg:block ml-auto w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></div>}
    </Link>
  );
}