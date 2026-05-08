import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Target, Settings, Database, Bell, Search, User } from 'lucide-react';
import { OperationalView } from './components/OperationalView';
import { StrategicView } from './components/StrategicView';

function App() {
  const [activeTab, setActiveTab] = useState('operational');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega o JSON da mesma pasta onde está o app
    fetch(`data.json?t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error("Erro ao carregar dados:", err));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-[10px] font-bold uppercase tracking-widest">Sincronizando Sheets...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex">
      
      {/* Sidebar Minimalista */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 gap-8 fixed h-full bg-[#020617] z-20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-black font-black">M</div>
          <span className="font-bold text-sm tracking-tight text-white">Analytics Hub</span>
        </div>

        <nav className="flex flex-col gap-2">
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] px-2 mb-2 opacity-30">Menu</p>
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

        <div className="mt-auto bg-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <Database size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Sync</span>
          </div>
          <p className="text-[9px] text-muted">Google Sheets Ativo e Seguro</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar leads ou transações..." 
              className="w-full bg-white/5 border border-white/5 rounded-full py-2.5 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-accent/30 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-muted hover:text-white transition-colors"><Bell size={18} /></button>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-white leading-none">André Bodin</p>
                <p className="text-[9px] text-muted font-bold uppercase mt-1">Estrategista Sênior</p>
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-white/10">
                <User size={18} className="text-muted" />
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'operational' ? <OperationalView data={data} /> : <StrategicView data={data} />}
      </main>

    </div>
  );
}

const NavItem = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-accent/10 text-accent border border-accent/20' 
        : 'text-muted hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={18} />
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

export default App;
