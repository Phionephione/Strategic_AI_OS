import React, { useState } from 'react';
import axios from 'axios';
import { Database, Search, Download, Loader2 } from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

export default function DataView() {
  const [country, setCountry] = useState("India");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/forecast/${country}`);
      setRows(res.data.data);
    } catch (err) { alert("Data fetch failed"); }
    setLoading(false);
  };

  return (
    <div className="p-12 animate-in slide-in-from-bottom duration-700">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
            <Database className="text-amber-500" size={36} /> RAW INTELLIGENCE
          </h1>
          <p className="text-slate-500">Full audit trail of historical and projected GDP data points.</p>
        </div>
        
        <div className="flex gap-4">
          <input value={country} onChange={(e)=>setCountry(e.target.value)} className="bg-[#161b22] border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-amber-500 w-64" placeholder="Enter country..." />
          <button onClick={fetchData} className="bg-amber-500 text-black px-6 rounded-xl font-black flex items-center gap-2 hover:bg-amber-400 transition-all">
            {loading ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>} FETCH
          </button>
        </div>
      </div>

      <div className="bg-[#161b22] rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0b0e14] text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <th className="p-6 border-b border-slate-800">Observation Year</th>
              <th className="p-6 border-b border-slate-800">GDP Value (USD)</th>
              <th className="p-6 border-b border-slate-800">Upper Bound (Probabilistic)</th>
              <th className="p-6 border-b border-slate-800">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-6 text-white font-bold">{row.date}</td>
                <td className="p-6 text-cyan-400">${row.gdp.toLocaleString()}</td>
                <td className="p-6 text-slate-400">${row.upper.toLocaleString()}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${row.isForecast ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                    {row.isForecast ? "PROJECTED" : "VERIFIED"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest italic">
            No data loaded. Type a country name and click fetch.
          </div>
        )}
      </div>
    </div>
  );
}