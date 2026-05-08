import React, { useState, useEffect } from 'react';
import { 
  RefreshCcw,
  LayoutDashboard,
  PieChart,
  Bell,
  ChevronRight,
  Info,
  ShieldCheck,
  Search
} from 'lucide-react';
import { OperationalView } from './components/OperationalView';
import { StrategicView } from './components/StrategicView';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('operacional');

  useEffect(() => {
    const dataPath = './data.json?t=' + new Date().getTime();
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
      <div className="h-screen w-screen bg-brand-black flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <RefreshCcw className="text-brand-gold animate-spin" size={64} />
          <div className="absolute inset-0 bg-brand-gold blur-3xl opacity-20 animate-pulse" />
        </div>
        <p className="text-brand-gold font-bold tracking-[0.3em] uppercase text-xs animate-pulse">Sincronizando Sala de Guerra...</p>
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
    <div className="min-h-screen bg-brand-black text-white flex font-sans selection:bg-brand-gold selection:text-black">
      
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 flex flex-col p-8 gap-10 hidden xl:flex sticky top-0 h-screen">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-brand-gold rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-[0_10px_30px_rgba(252,203,0,0.3)]">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl leading-tight tracking-tighter uppercase italic">MUNDO ELÉTRICO</span>
            <span className="text-[10px] text-brand-gold uppercase tracking-[0.3em] font-black">ANALYTICS v2</span>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-4 mb-2">Comando</p>
          
          <button 
            onClick={() => setActiveTab('operacional')}
            className={`flex items-center justify-between px-6 py-5 rounded-[1.5rem] font-bold transition-all duration-300 group ${
              activeTab === 'operacional' 
              ? 'bg-brand-gold text-black shadow-[0_15px_30px_rgba(252,203,0,0.15)] scale-105' 
              : 'text-white/30 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <LayoutDashboard size={22} strokeWidth={2.5} /> Dashboard Estrategista
            </div>
            {activeTab === 'operacional' && <ChevronRight size={18} strokeWidth={3} />}
          </button>

          <button 
            onClick={() => setActiveTab('estrategico')}
            className={`flex items-center justify-between px-6 py-5 rounded-[1.5rem] font-bold transition-all duration-300 group ${
              activeTab === 'estrategico' 
              ? 'bg-brand-gold text-black shadow-[0_15px_30px_rgba(252,203,0,0.15)] scale-105' 
              : 'text-white/30 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <PieChart size={22} strokeWidth={2.5} /> Inteligência Estratégica
            </div>
            {activeTab === 'estrategico' && <ChevronRight size={18} strokeWidth={3} />}
          </button>
        </nav>

        <div className="mt-auto relative group">
          <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-6 rounded-[2rem] border border-white/5 relative z-10">
            <ShieldCheck className="text-brand-gold mb-3" size={24} />
            <p className="text-[10px] text-white/20 uppercase font-black mb-1">Status de Conexão</p>
            <p className="text-sm font-black text-white/90 mb-4">Planilha Ativa</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-success rounded-full animate-pulse shadow-[0_0_10px_#00FF00]" />
              <span className="text-[10px] font-bold text-brand-success uppercase tracking-widest">Sincronizado</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-brand-gold/5 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto overflow-x-hidden">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className="text-4xl lg:text-5xl font-black mb-2 tracking-tighter uppercase italic">
              {activeTab === 'operacional' ? 'Dashboard Estrategista' : 'Inteligência Estratégica'}
            </h1>
            <div className="flex items-center gap-3 text-white/30 text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_8px_#FFD700]" />
              Última sincronização: {data.updated_at}
            </div>
          </div>
          
          <div className="flex items-center gap-6 animate-in slide-in-from-right duration-700">
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text" 
                placeholder="Buscar lead ou métrica..." 
                className="bg-[#121212] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-brand-gold/30 transition-all w-64"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-gold to-yellow-700 flex items-center justify-center border-2 border-white/10 shadow-2xl shadow-brand-gold/20">
                <span className="font-black text-black">AB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white/90">André Bodin</span>
                <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">Estrategista Chef</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View */}
        {activeTab === 'operacional' ? (
          <OperationalView data={data} />
        ) : (
          <StrategicView data={data} />
        )}

        <footer className="mt-32 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-20 hover:opacity-100 transition-all duration-500">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs font-bold tracking-tighter uppercase italic">MUNDO DOS ELÉTRICOS</p>
            <p className="text-[10px] text-white/40">Inteligência de Lançamentos v2.8.4</p>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="cursor-pointer hover:text-brand-gold transition-colors">Segurança</span>
            <span className="cursor-pointer hover:text-brand-gold transition-colors">Audit Logs</span>
            <span className="cursor-pointer hover:text-brand-gold transition-colors">API Status</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
