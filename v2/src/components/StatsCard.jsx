import React from 'react';
import { motion } from 'framer-motion';

export const StatsCard = ({ title, value, icon: Icon, subValue, trend }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-[#121212] border border-white/5 p-6 rounded-2xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={80} />
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-brand-gold-muted rounded-lg text-brand-gold">
          <Icon size={20} />
        </div>
        <span className="text-white/60 text-sm font-medium uppercase tracking-wider">{title}</span>
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        {subValue && (
          <p className="text-white/40 text-sm">
            {subValue}
            {trend && (
              <span className={`ml-2 ${trend.positive ? 'text-brand-success' : 'text-red-500'}`}>
                {trend.value}
              </span>
            )}
          </p>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 h-1 bg-brand-gold w-0 group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
};
