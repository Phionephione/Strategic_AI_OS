import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, Search, Loader2, DollarSign, AlertCircle } from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

export default function Terminal() {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("India");
  const [currentCountry, setCurrentCountry] = useState({ name: "India", code: "IND", growth: 0 });
  const [factors, setFactors] = useState({});
  const [selectedYear, setSelectedYear] = useState("2025");
  const [loading, setLoading] = useState(false);

  // Initial load
  useEffect(() => {
    executeSearch("India");
  }, []);

  const executeSearch = async (name) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/forecast/${name}`);
      if (res.data.error) {
        alert(res.data.error);
      } else {
        setData(res.data.data);
        setCurrentCountry({ 
            name: res.data.name, 
            code: res.data.code, 
            growth: res.data.growth 
        });
        fetchFactors(res.data.code, "2025");
        setSearchText(res.data.name);
      }
    } catch (err) {
      console.error("Backend Error:", err);
    }
    setLoading(false);
  };

  const fetchFactors = async (code, year) => {
    try {
      const res = await axios.get(`${API_BASE}/factors/${code}/${year}`);
      setFactors(res.data);
      setSelectedYear(year);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedYearData = useMemo(() => data.find(d => d.date === selectedYear), [data, selectedYear]);
  const formatTrillion = (v) => `$${(v / 1e12).toFixed(2)}T`;

  return (
    <div className="p-8 lg:p-12 select-none animate-in fade-in duration-700">
      
      {/* SEARCH & TITLE HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Strategic Terminal: <span className="text-cyan-400">{currentCountry.name}</span>
          </h1>
          <p className="text-slate-500 font-medium">Real-time Probabilistic GDP Forecaster</p>
        </div>

        <div className="flex gap-2 bg-[#161b22] p-2 rounded-2xl border border-slate-800 shadow-2xl w-full lg:w-auto">
          <input 
            type="text" 
            className="bg-transparent border-none outline-none px-4 py-2 text-cyan-400 font-bold w-full lg:w-64"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && executeSearch(searchText)}
            placeholder="Search Global Database..."
          />
          <button 
            onClick={() => executeSearch(searchText)}
            className="bg-cyan-500 text-black p-3 rounded-xl hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Search size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN CHART SECTION */}
        <div className="lg:col-span-8 bg-[#161b22] border border-slate-800 p-8 rounded-[3rem] relative overflow-hidden shadow-2xl">
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-cyan-400 mb-4" size={48} />
              <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs">Accessing World Bank API...</span>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300">
              <TrendingUp className="text-cyan-400" size={18} /> GDP TRAJECTORY (1990 - 2050)
            </h2>
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                Confidence: 80%
            </div>
          </div>
          
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} onClick={(e) => e && e.activeLabel && fetchFactors(currentCountry.code, e.activeLabel)}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#475569" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  interval={4} 
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={formatTrillion} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0e14', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
                  formatter={(v, name) => [formatTrillion(v), name.toUpperCase()]}
                />
                <Area type="monotone" dataKey="upper" stroke="none" fill="#22d3ee" fillOpacity={0.05} />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#0b0e14" fillOpacity={1} />
                <Area type="monotone" dataKey="gdp" stroke="#22d3ee" strokeWidth={4} fill="url(#g)" activeDot={{ r: 8, fill: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex items-center gap-3 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-800/30 p-4 rounded-2xl border border-slate-800/50">
             <AlertCircle size={16} className="text-cyan-400" /> 
             <span>Interaction Hint: Click any year marker to synchronize macro-economic pillars.</span>
          </div>
        </div>

        {/* SIDEBAR INTELLIGENCE */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#161b22] border border-slate-800 p-8 rounded-[3rem] shadow-xl relative min-h-[480px]">
            <h3 className="text-cyan-400 font-black mb-8 flex items-center gap-2 uppercase tracking-tighter text-xl">
              <Activity size={22} /> Strategic Dive: {selectedYear}
            </h3>
            
            <div className="mb-10 p-6 bg-[#0b0e14] rounded-[2rem] border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mb-2 uppercase">Projected Market Value</div>
                <div className="text-4xl font-black text-white flex items-center gap-2">
                    <DollarSign className="text-cyan-400" size={28} />
                    {selectedYearData ? (selectedYearData.gdp / 1e12).toFixed(2) : "0.00"}
                    <span className="text-cyan-400 text-sm font-black tracking-widest">TRILLION</span>
                </div>
            </div>

            <div className="space-y-8">
              {Object.entries(factors).map(([key, val]) => (
                <div key={key} className="group">
                  <div className="flex justify-between text-[10px] font-black mb-3 uppercase tracking-widest text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <span>{key}</span>
                    <span>{val}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
                        style={{ width: `${val}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#161b22] to-[#0b0e14] border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full"></div>
             <h3 className="text-white font-bold mb-3 text-xs uppercase tracking-widest text-slate-500">Systemic Momentum</h3>
             <p className="text-slate-300 text-sm leading-relaxed font-medium">
               The AI identifies a historical growth baseline of <span className="text-cyan-400 font-black">{currentCountry.growth}%</span>. 
               The current trajectory models a high-resilience path for {currentCountry.name} anchored in decade-scale data trends.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}