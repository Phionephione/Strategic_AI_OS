import React, { useState } from 'react';
import axios from 'axios';
import { Database, Search, Download, Loader2, TableProperties } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

export default function DataView() {
  const [country, setCountry] = useState("India");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/forecast/${country}`);
      setRows(res.data.data);
    } catch (err) { alert("Raw Intelligence fetch failed. Wake up backend on Render."); }
    setLoading(false);
  };

  return (
    <div className="p-8 lg:p-12 animate-in slide-in-from-bottom-10 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3 tracking-tighter">
            <Database className="text-amber-500" size={36} /> RAW INTELLIGENCE
          </h1>
          <p className="text-slate-500 font-medium italic">Full audit trail of verified historical and AI projected data points.</p>
        </div>
        
        <div className="flex gap-3 bg-[#161b22] p-2 rounded-2xl border border-slate-800 shadow-xl">
          <input 
            value={country} 
            onChange={(e)=>setCountry(e.target.value)} 
            className="bg-transparent border-none outline-none px-4 py-2 text-white font-bold w-64" 
            placeholder="Search Nation..." 
          />
          <button 
            onClick={fetchData} 
            className="bg-amber-500 text-black px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18}/> : <Search size={18} strokeWidth={3}/>} 
            {loading ? "QUERYING..." : "FETCH DATA"}
          </button>
        </div>
      </div>

      <div className="bg-[#161b22] rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-[#0b0e14] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-8 border-b border-slate-800">Observation Year</th>
                <th className="p-8 border-b border-slate-800">GDP Baseline (USD)</th>
                <th className="p-8 border-b border-slate-800">Upper/Lower (Probabilistic)</th>
                <th className="p-8 border-b border-slate-800">Verification Status</th>
                </tr>
            </thead>
            <tbody className="text-sm font-medium">
                {rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                    <td className="p-8 text-white font-black text-lg tracking-tighter">{row.date}</td>
                    <td className="p-8 text-cyan-400 font-mono font-bold">${row.gdp.toLocaleString()}</td>
                    <td className="p-8 text-slate-500 text-xs font-mono">
                        <span className="text-slate-400 block">UP: ${row.upper.toLocaleString()}</span>
                        <span className="block">LO: ${row.lower.toLocaleString()}</span>
                    </td>
                    <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${row.isForecast ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                        {row.isForecast ? "AI PROJECTED" : "WORLD BANK VERIFIED"}
                    </span>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        {rows.length === 0 && (
          <div className="p-32 text-center text-slate-700 flex flex-col items-center gap-4 opacity-40">
            <TableProperties size={64} strokeWidth={1} />
            <p className="font-black uppercase tracking-[0.3em] text-xs">Database Empty: Perform Query</p>
          </div>
        )}
      </div>
    </div>
  );
}