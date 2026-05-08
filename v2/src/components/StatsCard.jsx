import React from 'react';

export const StatsCard = ({ title, value, icon: Icon, subValue, color }) => {
  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{title}</span>
        <div className={`p-2 rounded-lg bg-opacity-10 ${
          color === 'blue' ? 'text-blue-400 bg-blue-400' :
          color === 'green' ? 'text-emerald-400 bg-emerald-400' :
          color === 'purple' ? 'text-cyan-400 bg-cyan-400' :
          'text-slate-400 bg-slate-400'
        }`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        {subValue && (
          <p className="text-[10px] text-muted mt-1 leading-relaxed">{subValue}</p>
        )}
      </div>
    </div>
  );
};
