import React, { useState, useEffect } from 'react';
import { 
  RefreshCcw,
  LayoutDashboard,
  PieChart,
  Bell,
  ChevronRight,
  Info,
  ShieldCheck,
  Search,
  Settings,
  HelpCircle,
  Moon
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
      <div className="h-screen w-screen bg-[#090916] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <RefreshCcw className="text-brand-accent animate-spin" size={64} />
          <div className="absolute inset-0 bg-brand-accent blur-3xl opacity-20 animate-pulse" />
        </div>
        <p className="text-brand-accent font-black tracking-[0.4em] uppercase text-xs animate-pulse">Iniciando Sistema Alumea...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen w-screen bg-[#090916] flex flex-col items-center justify-center gap-4 text-white/60">
        <Info size={48} />
        <p>Erro ao sincronizar dados da planilha.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1f] text-white flex selection:bg-brand-accent selection:text-white">
      
      {/* Sidebar - Estilo Alumea */}
      <aside className="w-80 glass-sidebar flex flex-col p-8 gap-10 hidden xl:flex sticky top-0 h-screen">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-brand-accent rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[0_10px_30px_rgba(99,102,241,0.3)]">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl leading-tight tracking-tight uppercase italic">ALUMEA</span>
            <span className="text-[10px] text-brand-accent uppercase tracking-[0.3em] font-black">Mundo Elétrico</span>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-4 mb-2 mt-4">Menu</p>
          
          <button 
            onClick={() => setActiveTab('operacional')}
            className={`flex items-center justify-between px-6 py-5 rounded-[1.5rem] font-black transition-all duration-300 group ${
              activeTab === 'operacional' ? 'nav-item-active' : 'text-white/30 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <LayoutDashboard size={20} /> Dashboard Estrategista
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('estrategico')}
            className={`flex items-center justify-between px-6 py-5 rounded-[1.5rem] font-black transition-all duration-300 group ${
              activeTab === 'estrategico' ? 'nav-item-active' : 'text-white/30 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <PieChart size={20} /> Inteligência Estratégica
            </div>
          </button>
        </nav>

        <div className="mt-6 flex flex-col gap-3">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-4 mb-2">Configurações</p>
          <div className="flex items-center gap-4 px-6 py-4 text-white/40 hover:text-white transition-colors cursor-pointer text-sm font-bold">
             <Settings size={18} /> Filtros
          </div>
          <div className="flex items-center justify-between px-6 py-4 text-white/40 text-sm font-bold">
             <div className="flex items-center gap-4"><Moon size={18} /> Modo Dark</div>
             <div className="w-10 h-5 bg-brand-accent rounded-full p-1"><div className="w-3 h-3 bg-white rounded-full ml-auto" /></div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4 text-white/40 hover:text-white transition-colors cursor-pointer text-sm font-bold">
             <HelpCircle size={18} /> Ajuda
          </div>
        </div>

        <div className="mt-auto bg-brand-card/50 p-6 rounded-[2rem] border border-white/5 text-center">
          <p className="text-[10px] text-white/20 uppercase font-black mb-3">Conexão Sheets</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-brand-teal rounded-full animate-pulse shadow-[0_0_10px_#14b8a6]" />
            <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">Ativo e Seguro</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className="text-3xl lg:text-4xl font-black mb-2 tracking-tighter uppercase italic text-white/90">
              {activeTab === 'operacional' ? 'Performance Estrategista' : 'Análise Acadêmica'}
            </h1>
            <div className="flex items-center gap-3 text-white/20 text-xs font-bold uppercase tracking-widest">
               Sincronizado via Google Sheets em {data.updated_at}
            </div>
          </div>
          
          <div className="flex items-center gap-6 animate-in slide-in-from-right duration-700">
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-brand-card/50 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-brand-accent/30 transition-all w-64"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-black text-white/90">André Bodin</span>
                <span className="text-[10px] text-brand-accent font-black uppercase tracking-widest">Estrategista</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-accent to-brand-purple p-[2px] shadow-2xl">
                <div className="w-full h-full bg-brand-bg rounded-[14px] flex items-center justify-center font-black text-xs">AB</div>
              </div>
            </div>
          </div>
        </header>

        {/* View Dynamic Render */}
        {activeTab === 'operacional' ? (
          <OperationalView data={data} />
        ) : (
          <StrategicView data={data} />
        )}

        <footer className="mt-32 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-20 hover:opacity-100 transition-all duration-500">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs font-black tracking-tighter uppercase italic">ALUMEA ANALYTICS</p>
            <p className="text-[10px] text-white/40">Powered by Antigravity AI</p>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="cursor-pointer hover:text-brand-accent transition-colors">Privacidade</span>
            <span className="cursor-pointer hover:text-brand-accent transition-colors">Termos</span>
            <span className="cursor-pointer hover:text-brand-accent transition-colors">Logs</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
