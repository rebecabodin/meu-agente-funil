import React from 'react';
import { DollarSign, Target, TrendingUp, Users, CheckCircle2, PhoneOff, Clock, Zap, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { FunnelChart } from './FunnelChart';
import { RecoveryTable } from './RecoveryTable';

export const OperationalView = ({ data }) => {
  const funnelData = [
    { name: 'Compraram', value: data.vendas_aprovadas },
    { name: 'Entraram no Grupo', value: data.vendas_aprovadas - data.onboarding_gap },
  ];

  return (
    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      
      {/* 🚀 Header Storytelling */}
      <div className="flex items-center gap-3">
        <Zap className="text-brand-gold animate-pulse" size={20} />
        <h2 className="text-white text-sm font-black uppercase tracking-[0.6em]">Imersão Prática Mundo dos Elétricos</h2>
      </div>

      {/* 💵 Principais Indicadores de Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Faturamento Total" 
          value={`R$ ${data.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="purple"
        />
        <StatsCard 
          title="Vendas Aprovadas" 
          value={data.vendas_aprovadas}
          icon={CheckCircle2}
          color="blue"
        />
        <StatsCard 
          title="Oportunidades de Venda" 
          value={data.oportunidades}
          icon={Users}
          color="pink"
          subValue={`Dos ${data.oportunidades} leads, ${data.leads_whatsapp} via WhatsApp | ${data.leads_email} via E-mail`}
        />
        <StatsCard 
          title="Vendas Recuperadas" 
          value={data.vendas_recuperadas}
          icon={TrendingUp}
          color="teal"
        />
      </div>

      {/* 💬 Monitor de Entregas (Acompanhamento de Envios) */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <h3 className="text-white text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Monitor de Entregas</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Compra Aprovada */}
          <div className="group bg-brand-card border border-white/5 rounded-[3rem] p-10 hover:border-brand-success/30 transition-all duration-500 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-brand-success/20 p-2 rounded-xl text-brand-success">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="text-white font-black text-sm uppercase tracking-tighter italic">📈 Compra Aprovada</h4>
              </div>
              <div className="text-[10px] font-black text-white/20 uppercase">Tempo Real</div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <MetricBox label="Total" value={data.status_compra.total} color="white" />
              <MetricBox label="Enviados" value={data.status_compra.enviados} color="brand-success" />
              <MetricBox label="Sem Tel/Inválido" value={data.status_compra.sem_tel} color="red-500" />
              <MetricBox label="Pendentes" value={data.status_compra.pendentes} color="brand-gold" highlight />
            </div>
          </div>

          {/* Recuperação de Vendas */}
          <div className="group bg-brand-card border border-white/5 rounded-[3rem] p-10 hover:border-brand-accent/30 transition-all duration-500 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-brand-accent/20 p-2 rounded-xl text-brand-accent">
                  <TrendingUp size={20} />
                </div>
                <h4 className="text-white font-black text-sm uppercase tracking-tighter italic">📈 Recuperação de Vendas</h4>
              </div>
              <div className="text-[10px] font-black text-white/20 uppercase italic">Estratégico</div>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-6">
              <MetricBox label="Total" value={data.status_recup.total} color="white" />
              <MetricBox label="Enviados" value={data.status_recup.enviados} color="brand-success" />
              <MetricBox label="Recuperadas" value={data.vendas_recuperadas} color="brand-gold" highlight />
              <MetricBox label="Sem Tel" value={data.status_recup.sem_tel} color="red-500" />
              <MetricBox label="Pendentes" value={data.status_recup.pendentes} color="white" />
            </div>
          </div>
        </div>
      </section>

      {/* 🎯 O Gargalo do Funil */}
      <section className="bg-brand-card border border-white/5 rounded-[4rem] p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-brand-accent mb-2">
              <AlertCircle size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Diagnóstico Crítico</span>
            </div>
            <h3 className="text-white text-3xl font-black italic tracking-tighter uppercase leading-none">O Gargalo do Funil:<br/>Conversão p/ Grupo</h3>
          </div>
          <div className="bg-black/40 border border-white/10 px-8 py-4 rounded-3xl text-center backdrop-blur-xl">
            <p className="text-brand-accent font-black text-xs uppercase mb-1">Taxa de Onboarding</p>
            <p className="text-3xl font-black text-white">{data.taxa_onboarding}%</p>
          </div>
        </div>
        
        <div className="h-[280px]">
          <FunnelChart data={funnelData} />
        </div>
      </section>

      {/* 📋 Plano de Ação (Resgates) */}
      <section>
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-brand-purple/20 p-3 rounded-2xl"><Target className="text-brand-purple" size={28} /></div>
          <div>
            <h3 className="text-white text-2xl font-black italic tracking-tighter uppercase leading-none">📋 Plano de Ação (Resgates)</h3>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Intervenções imediatas baseadas em dados</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {/* Checkout Abandonado */}
          <div className="space-y-6">
            <div className="bg-brand-card border border-white/5 p-8 rounded-[3rem] relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-white font-black text-lg italic uppercase leading-none mb-1">📉 Lista de Resgate:<br/>Checkout Abandonado</h4>
                  <p className="text-brand-purple/60 text-[10px] font-black uppercase tracking-widest">Total: {data.oportunidades} Oportunidades ({data.leads_whatsapp} WhatsApp | {data.leads_email} E-mail)</p>
                </div>
                <div className="bg-brand-success/10 text-brand-success px-4 py-2 rounded-2xl text-[10px] font-black uppercase italic">
                  Ticket Mín: R$ 19,00
                </div>
              </div>
              <p className="text-white/40 text-xs italic mb-6">Leads que iniciaram a compra mas ainda não pagaram.</p>
              <div className="flex items-center gap-3 bg-brand-success/5 border border-brand-success/20 p-5 rounded-2xl">
                 <Zap size={20} className="text-brand-success" />
                 <div>
                   <p className="text-[10px] text-brand-success uppercase font-black tracking-tighter leading-none mb-1">💸 Potencial de Recuperação Estimado</p>
                   <p className="text-2xl font-black text-white">R$ {data.potencial_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                 </div>
              </div>
            </div>
            <RecoveryTable data={data.recuperacao_lista} />
          </div>

          {/* Onboarding Gap */}
          <div className="space-y-6">
            <div className="bg-brand-card border border-white/5 p-8 rounded-[3rem] relative group">
              <h4 className="text-white font-black text-lg italic uppercase leading-none mb-1">🤝 Resgate de Onboarding<br/>(Entrada no Grupo)</h4>
              <p className="text-brand-teal/60 text-[10px] font-black uppercase tracking-widest mb-4">Total: {data.onboarding_gap} Clientes Pendentes</p>
              <p className="text-white/40 text-xs italic mb-8">Clientes que já pagaram mas não entraram no grupo.</p>
              
              <div className="flex items-center gap-4 text-white/20">
                <div className="h-px flex-1 bg-white/5" />
                <ArrowRight size={16} />
                <div className="h-px flex-1 bg-white/5" />
              </div>
            </div>
            <RecoveryTable data={data.onboarding_lista} type="onboarding" />
          </div>
        </div>
      </section>

    </div>
  );
};

const MetricBox = ({ label, value, color, highlight }) => (
  <div className={`flex flex-col ${highlight ? 'scale-110' : ''}`}>
    <span className={`text-[9px] font-black uppercase mb-1 ${color === 'white' ? 'text-white/20' : `text-${color}`}`}>{label}</span>
    <span className={`text-2xl font-black tracking-tighter ${color === 'white' ? 'text-white' : `text-${color}`}`}>{value}</span>
  </div>
);
