import React, { useState, useEffect } from 'react';
import { 
  RefreshCcw,
  LayoutDashboard,
  PieChart,
  Bell,
  ChevronRight,
  Info
} from 'lucide-react';
import { OperationalView } from './components/OperationalView';
import { StrategicView } from './components/StrategicView';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('operacional'); // 'operacional' ou 'estrategico'

  useEffect(() => {
    // Busca o JSON na mesma pasta do dashboard (v2)
    const dataPath = './data.json';
    fetch(dataPath)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-brand-black flex items-center justify-center">
        <RefreshCcw className="text-brand-gold animate-spin" size={48} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen w-screen bg-brand-black flex flex-col items-center justify-center gap-4 text-white/60">
        <Info size={48} />
        <p>Aguardando sincronização da planilha...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 gap-8 hidden md:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-black font-bold text-xl shadow-[0_0_20px_rgba(255,215,0,0.3)]">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">Mundo Elétrico</span>
            <span className="text-[10px] text-brand-gold uppercase tracking-[0.2em] font-bold">Analytics v2</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold px-4 mb-2 mt-4">Menu Principal</p>
          
          <button 
            onClick={() => setActiveTab('operacional')}
            className={`flex items-center justify-between px-4 py-4 rounded-2xl font-medium transition-all group ${
              activeTab === 'operacional' 
              ? 'bg-brand-gold text-black shadow-[0_10px_20px_rgba(255,215,0,0.15)]' 
              : 'text-white/40 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={20} /> Dashboard Estrategista
            </div>
            {activeTab === 'operacional' && <ChevronRight size={16} />}
          </button>

          <button 
            onClick={() => setActiveTab('estrategico')}
            className={`flex items-center justify-between px-4 py-4 rounded-2xl font-medium transition-all group ${
              activeTab === 'estrategico' 
              ? 'bg-brand-gold text-black shadow-[0_10px_20px_rgba(255,215,0,0.15)]' 
              : 'text-white/40 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <PieChart size={20} /> Inteligência Estratégica
            </div>
            {activeTab === 'estrategico' && <ChevronRight size={16} />}
          </button>
        </nav>

        <div className="mt-auto bg-[#121212] p-5 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl group-hover:bg-brand-gold/10 transition-all" />
          <p className="text-[10px] text-white/30 uppercase font-bold mb-3">Status do Lançamento</p>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-brand-success rounded-full animate-pulse" />
            <span className="text-sm font-bold text-white/80">Sincronizado</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black mb-1 tracking-tight">
              {activeTab === 'operacional' ? 'Dashboard Estrategista' : 'Inteligência Estratégica'}
            </h1>
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
              Sincronizado via Google Sheets em {data.updated_at}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-white/60">André / Mundo Elétrico</span>
              <span className="text-[10px] text-brand-gold uppercase font-bold">Admin</span>
            </div>
            <button className="p-3 bg-[#121212] border border-white/5 rounded-2xl text-white/60 hover:text-white transition-all relative group">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-brand-black group-hover:scale-125 transition-all" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-gold to-yellow-600 border-2 border-white/10 shadow-lg shadow-brand-gold/10" />
          </div>
        </header>

        {/* View Switcher */}
        {activeTab === 'operacional' ? (
          <OperationalView data={data} />
        ) : (
          <StrategicView data={data} />
        )}

        <footer className="mt-20 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-xs">© 2026 Mundo dos Elétricos - Inteligência de Funil</p>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
            <span className="cursor-pointer hover:text-brand-gold">Suporte</span>
            <span className="cursor-pointer hover:text-brand-gold">Documentação</span>
            <span className="cursor-pointer hover:text-brand-gold">Logs</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
