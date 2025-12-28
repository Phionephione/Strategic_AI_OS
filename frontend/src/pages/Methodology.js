import React from 'react';

export default function Methodology() {
  return (
    <div className="p-20 max-w-5xl">
      <h1 className="text-5xl font-black text-white mb-10">AI Methodology</h1>
      
      <section className="space-y-12">
        <MethodCard 
          step="01" 
          title="The Prophet Engine" 
          desc="We use an additive regressive model where non-linear trends are fit with yearly, weekly, and daily seasonality. It handles 'Changepoints' like the 2020 pandemic automatically." 
        />
        <MethodCard 
          step="02" 
          title="Uncertainty Fan Modeling" 
          desc="Using Bayesian inference, the AI generates a distribution of possible futures. The 'Fan' represents the 80% confidence interval, showing that long-term entropy increases over time." 
        />
        <MethodCard 
          step="03" 
          title="The Truth-Anchored Pipeline" 
          desc="Historical data is pulled via World Bank API. We then bridge the data-lag using CAGR (Compound Annual Growth Rate) to ensure the 2025 starting point is accurate." 
        />
      </section>
    </div>
  );
}

function MethodCard({ step, title, desc }) {
  return (
    <div className="flex gap-10 p-10 bg-[#161b22] border border-slate-800 rounded-[3rem]">
      <div className="text-6xl font-black text-slate-800">{step}</div>
      <div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">{title}</h2>
        <p className="text-slate-400 leading-relaxed text-lg">{desc}</p>
      </div>
    </div>
  );
}