import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { GitCompare, Search, Loader2, AlertCircle } from 'lucide-react';

// Use environment variable for Production, fallback to localhost for Dev
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api";

export default function Comparison() {
  const [countryA, setCountryA] = useState("India");
  const [countryB, setCountryB] = useState("USA");
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const runComparison = async () => {
    if (!countryA || !countryB) return;
    setLoading(true);
    try {
      // Fetch both forecasts from Render
      const resA = await axios.get(`${API_BASE}/forecast/${countryA}`);
      const resB = await axios.get(`${API_BASE}/forecast/${countryB}`);
      
      if (resA.data.error || resB.data.error) {
        alert(resA.data.error || resB.data.error);
        setLoading(false);
        return;
      }

      // Create a map of all years to align data perfectly
      const dataMap = {};
      
      resA.data.data.forEach(item => {
        dataMap[item.date] = { date: item.date, [resA.data.name]: item.gdp };
      });
      
      resB.data.data.forEach(item => {
        if (dataMap[item.date]) {
          dataMap[item.date][resB.data.name] = item.gdp;
        } else {
          dataMap[item.date] = { date: item.date, [resB.data.name]: item.gdp };
        }
      });

      // Convert map back to sorted array
      const merged = Object.values(dataMap).sort((a, b) => a.date - b.date);
      setCombinedData(merged);
    } catch (err) { 
      console.error(err);
      alert("Neural Link Timeout: Ensure Backend is awake on Render."); 
    }
    setLoading(false);
  };

  const formatTrillion = (v) => `$${(v / 1e12).toFixed(1)}T`;

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3 tracking-tighter">
          <GitCompare className="text-purple-500" size={36} /> CROSS-NATION ANALYSIS
        </h1>
        <p className="text-slate-500 font-medium italic">Identify strategic divergence between global trajectories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONTROL BOX */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#161b22] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
            <div className="mb-6">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">Target Alpha</label>
                <input 
                    value={countryA} 
                    onChange={(e)=>setCountryA(e.target.value)} 
                    className="w-full bg-[#0b0e14] border border-slate-700 p-4 rounded-2xl text-cyan-400 font-bold outline-none focus:border-cyan-500 transition-all" 
                />
            </div>
            
            <div className="mb-10">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">Target Beta</label>
                <input 
                    value={countryB} 
                    onChange={(e)=>setCountryB(e.target.value)} 
                    className="w-full bg-[#0b0e14] border border-slate-700 p-4 rounded-2xl text-purple-400 font-bold outline-none focus:border-purple-500 transition-all" 
                />
            </div>
            
            <button 
                onClick={runComparison} 
                disabled={loading}
                className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <GitCompare size={20} strokeWidth={3}/>} 
              {loading ? "PROCESSING..." : "RUN ANALYSIS"}
            </button>
          </div>

          <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl">
             <p className="text-xs text-slate-400 leading-relaxed font-medium">
                <AlertCircle size={12} className="inline mr-1 text-purple-500" />
                Note: Fetching dual 25-year horizons may take up to 15 seconds on the free-tier compute engine.
             </p>
          </div>
        </div>

        {/* CHART DISPLAY */}
        <div className="lg:col-span-9 bg-[#161b22] p-10 rounded-[3rem] border border-slate-800 min-h-[550px] relative shadow-2xl overflow-hidden">
          {combinedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={480}>
              <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} interval={5} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={formatTrillion} axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{backgroundColor:'#0b0e14', borderRadius:'20px', border:'1px solid #334155', padding: '15px'}} 
                    formatter={(v)=> [formatTrillion(v), "GDP"]}
                />
                <Legend verticalAlign="top" height={50} iconType="circle" />
                <Line type="monotone" dataKey={Object.keys(combinedData[0])[1]} stroke="#22d3ee" strokeWidth={5} dot={false} animationDuration={2000} />
                <Line type="monotone" dataKey={Object.keys(combinedData[0])[2]} stroke="#a855f7" strokeWidth={5} dot={false} animationDuration={2000} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
              <GitCompare size={64} strokeWidth={1} />
              <p className="font-black uppercase tracking-[0.3em] text-sm">Awaiting Strategic Parameters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}