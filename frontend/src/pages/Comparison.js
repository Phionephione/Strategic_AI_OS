import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { GitCompare, Search, Loader2 } from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

export default function Comparison() {
  const [countryA, setCountryA] = useState("India");
  const [countryB, setCountryB] = useState("USA");
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const runComparison = async () => {
    setLoading(true);
    try {
      const resA = await axios.get(`${API_BASE}/forecast/${countryA}`);
      const resB = await axios.get(`${API_BASE}/forecast/${countryB}`);
      
      // Merge data by year for the chart
      const merged = resA.data.data.map((item, index) => ({
        date: item.date,
        [countryA]: item.gdp,
        [countryB]: resB.data.data[index]?.gdp || 0
      }));
      
      setCombinedData(merged);
    } catch (err) { alert("Error comparing countries"); }
    setLoading(false);
  };

  const formatTrillion = (v) => `$${(v / 1e12).toFixed(1)}T`;

  return (
    <div className="p-12 animate-in fade-in duration-700">
      <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
        <GitCompare className="text-purple-500" size={36} /> CROSS-NATION ANALYSIS
      </h1>
      <p className="text-slate-500 mb-10">Compare systemic trajectories to identify strategic divergence.</p>

      <div className="grid grid-cols-12 gap-8">
        {/* Controls */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-[#161b22] p-6 rounded-[2rem] border border-slate-800">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Nation Alpha</label>
            <input value={countryA} onChange={(e)=>setCountryA(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-cyan-400 font-bold mb-6 outline-none focus:border-cyan-500" />
            
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Nation Beta</label>
            <input value={countryB} onChange={(e)=>setCountryB(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-purple-400 font-bold mb-8 outline-none focus:border-purple-500" />
            
            <button onClick={runComparison} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Search size={18}/>} RUN COMPARISON
            </button>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="col-span-12 lg:col-span-9 bg-[#161b22] p-10 rounded-[3rem] border border-slate-800 min-h-[500px] relative shadow-2xl">
          {combinedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} interval={5} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={formatTrillion} />
                <Tooltip contentStyle={{backgroundColor:'#0b0e14', borderRadius:'15px', border:'1px solid #334155'}} formatter={(v)=>formatTrillion(v)} />
                <Legend verticalAlign="top" height={36}/>
                <Line type="monotone" dataKey={countryA} stroke="#22d3ee" strokeWidth={4} dot={false} />
                <Line type="monotone" dataKey={countryB} stroke="#a855f7" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 font-bold italic uppercase tracking-widest">
              Select nations and trigger analysis to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}