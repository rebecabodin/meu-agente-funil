import React from 'react';

export const StatsCard = ({ title, value, icon: Icon, color = 'blue', subValue }) => {
  const colorMap = {
    purple: 'bg-brand-purple/20 text-brand-purple',
    blue: 'bg-brand-blue/20 text-brand-blue',
    teal: 'bg-brand-teal/20 text-brand-teal',
    pink: 'bg-brand-pink/20 text-brand-pink',
    gold: 'bg-brand-gold/20 text-brand-gold',
  };

  return (
    <div className="bg-brand-card p-6 rounded-[2rem] border border-white/5 flex items-center gap-5 hover:scale-[1.02] transition-transform duration-300 shadow-xl">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
        <Icon size={28} />
      </div>
      <div className="flex flex-col">
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-2xl font-black text-white tracking-tight">{value}</h4>
        {subValue && <p className="text-[10px] text-white/20 mt-1 font-medium">{subValue}</p>}
      </div>
    </div>
  );
};
