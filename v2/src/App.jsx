import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
  RefreshCcw,
  LayoutDashboard,
  PieChart,
  Settings,
  Bell
} from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { FunnelChart } from './components/FunnelChart';
import { RecoveryTable } from './components/RecoveryTable';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulação de carregamento (depois conectamos com data.json)
  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        // Mock data para demonstração se o fetch falhar
        setData({
          updated_at: "08/05/2026 10:00 UTC",
          faturamento: 45290.00,
          vendas_aprovadas: 142,
          vendas_recuperadas: 24,
          taxa_onboarding: 88.5,
          gap_onboarding: 12,
          oportunidades: 38,
          potencial_estimado: 12540.00,
          recuperacao_lista: [
            { NOME: "João Silva", TELEFONE: "11999887766" },
            { NOME: "Maria Oliveira", TELEFONE: "21988776655" },
            { NOME: "Carlos Santos", TELEFONE: "" }
          ],
          onboarding_lista: [
            { NOME: "Ana Pereira", TELEFONE: "31977665544" }
          ]
        });
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

  const funnelData = [
    { name: 'Oportunidades', value: data.oportunidades + data.vendas_aprovadas },
    { name: 'Checkout', value: data.vendas_aprovadas + (data.oportunidades / 2) },
    { name: 'Aprovadas', value: data.vendas_aprovadas },
    { name: 'No Grupo', value: data.vendas_aprovadas - data.gap_onboarding },
  ];

  return (
    <div className="min-h-screen bg-brand-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 gap-8 hidden md:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-black font-bold text-xl">
            M
          </div>
          <span className="font-bold text-lg tracking-tight">Mundo Elétrico</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 bg-brand-gold-muted text-brand-gold rounded-xl font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-colors rounded-xl font-medium">
            <PieChart size={20} /> Estratégia
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-colors rounded-xl font-medium">
            <Settings size={20} /> Configurações
          </button>
        </nav>

        <div className="mt-auto bg-white/5 p-4 rounded-2xl border border-white/5">
          <p className="text-xs text-white/40 mb-2">Plano Atual</p>
          <p className="text-sm font-bold text-brand-gold">Mundo Elétrico PRO</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold mb-1">Dash Imersão <span className="text-brand-gold">v2</span></h1>
            <p className="text-white/40 text-sm">Atualizado em: {data.updated_at}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 bg-white/5 rounded-xl text-white/60 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-brand-black" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-gold to-yellow-600 border-2 border-white/10" />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard 
            title="Faturamento" 
            value={`R$ ${data.faturamento.toLocaleString('pt-BR')}`}
            icon={DollarSign}
            subValue="Saldo líquido aprovado"
            trend={{ value: "+12%", positive: true }}
          />
          <StatsCard 
            title="Taxa Onboarding" 
            value={`${data.taxa_onboarding}%`}
            icon={Target}
            subValue={`${data.vendas_aprovadas - data.gap_onboarding} no grupo`}
            trend={{ value: "-2%", positive: false }}
          />
          <StatsCard 
            title="Recuperação" 
            value={data.vendas_recuperadas}
            icon={TrendingUp}
            subValue="Vendas salvas hoje"
            trend={{ value: "+8%", positive: true }}
          />
          <StatsCard 
            title="Potencial" 
            value={`R$ ${data.potencial_estimado.toLocaleString('pt-BR')}`}
            icon={Users}
            subValue={`${data.oportunidades} leads pendentes`}
          />
        </div>

        {/* Charts & Tables Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 flex flex-col gap-8">
            <FunnelChart data={funnelData} />
            <RecoveryTable 
              title="Resgate: Checkout Abandonado" 
              data={data.recuperacao_lista} 
            />
          </div>
          
          <div className="flex flex-col gap-8">
            <div className="bg-gradient-to-br from-brand-gold to-yellow-700 p-8 rounded-3xl text-black relative overflow-hidden">
              <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 opacity-20 rotate-12" />
              <h3 className="font-bold text-xl mb-2">Meta Semanal</h3>
              <p className="text-black/60 text-sm mb-6">Faltam R$ 12.000 para bater a meta de R$ 60k.</p>
              <div className="h-3 bg-black/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-black w-[75%]" />
              </div>
              <p className="font-bold text-right">75%</p>
            </div>

            <RecoveryTable 
              title="Resgate: Onboarding" 
              data={data.onboarding_lista} 
              type="onboarding"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
