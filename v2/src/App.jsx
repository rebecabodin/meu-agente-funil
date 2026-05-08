import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Target, Database, Bell, Search, User, ChevronRight } from 'lucide-react';
import { OperationalView } from './components/OperationalView';
import { StrategicView } from './components/StrategicView';

function App() {
  const [activeTab, setActiveTab] = useState('operational');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`data.json?t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error("Erro ao carregar dados:", err));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-brand-muted text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Sheets...</p>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg flex p-6 gap-6 overflow-hidden">
      
      {/* Sidebar Flutuante Premium */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 glass-panel flex flex-col p-8 gap-10 sticky top-6 h-[calc(100vh-3rem)] z-20"
      >
        <div className="flex items-center gap-4 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-accent/20">
            <LayoutDashboard size={20} strokeWidth={2.5} />
          </div>
          <div>
            <span className="block font-black text-sm tracking-tight text-white leading-none">ANALYTICS</span>
            <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">HUB PRO</span>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.25em] px-4 mb-2 opacity-40">Navegação</p>
          <NavItem 
            active={activeTab === 'operational'} 
            onClick={() => setActiveTab('operational')}
            icon={LayoutDashboard}
            label="Estrategista"
          />
          <NavItem 
            active={activeTab === 'strategic'} 
            onClick={() => setActiveTab('strategic')}
            icon={Target}
            label="Inteligência"
          />
        </nav>

        <div className="mt-auto group cursor-help">
          <div className="bg-brand-bg/50 border border-brand-border p-5 rounded-[2rem] transition-all group-hover:border-brand-accent/30">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Database size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
            </div>
            <p className="text-[9px] text-brand-muted font-medium leading-relaxed">Sincronizado via Google Sheets em tempo real.</p>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-8 max-h-[calc(100vh-3rem)] overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Top Header Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center bg-brand-bg/80 backdrop-blur-md sticky top-0 z-10 py-2"
        >
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar em Mundo dos Elétricos..." 
              className="w-96 bg-brand-card/50 border border-brand-border rounded-2xl py-3.5 pl-14 pr-6 text-xs text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/40 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-black text-white italic">André Bodin</p>
                <p className="text-[9px] text-brand-accent font-black uppercase tracking-tighter">Estrategista Principal</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-tr from-brand-card to-slate-800 rounded-2xl flex items-center justify-center border border-brand-border shadow-xl">
                <User size={20} className="text-brand-accent" />
              </div>
            </div>
          </div>
        </motion.header>

        {/* View Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {activeTab === 'operational' ? <OperationalView data={data} /> : <StrategicView data={data} />}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}

const NavItem = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`nav-item ${
      active 
        ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' 
        : 'text-brand-muted hover:text-white hover:bg-brand-card'
    }`}
  >
    <Icon size={18} strokeWidth={active ? 3 : 2} />
    <span className="flex-1 text-left">{label}</span>
    {active && <ChevronRight size={14} className="opacity-50" />}
  </button>
);

export default App;
