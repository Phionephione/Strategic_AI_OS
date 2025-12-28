import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <div className="max-w-4xl">
        <h1 className="text-7xl font-black text-white mb-6 tracking-tighter">
          Forecasting the <span className="text-cyan-400 text-glow">Future</span> of Nations.
        </h1>
        <p className="text-xl text-slate-400 mb-10 leading-relaxed">
          The world's most advanced Decade-Scale Strategic AI. Modeling GDP, 
          Systemic Uncertainty, and Macro-Economic Trajectories up to 2050.
        </p>
        <Link to="/terminal" className="bg-cyan-500 text-black px-10 py-4 rounded-full font-black text-lg hover:bg-cyan-400 transition-all shadow-2xl shadow-cyan-500/20">
          LAUNCH COMMAND TERMINAL
        </Link>

        <div className="grid grid-cols-3 gap-8 mt-24">
          <Feature icon={<TrendingUp className="text-cyan-400"/>} title="Decade Scale" desc="Projections up to 2050" />
          <Feature icon={<ShieldCheck className="text-cyan-400"/>} title="Probabilistic" desc="Uncertainty range modeling" />
          <Feature icon={<Zap className="text-cyan-400"/>} title="Full Stack" desc="FastAPI + React Engine" />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="p-6 bg-[#161b22] border border-slate-800 rounded-3xl">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-white font-bold mb-2">{title}</h3>
      <p className="text-slate-500 text-sm">{desc}</p>
    </div>
  );
}