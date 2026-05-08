import React from 'react';
import { DollarSign, Target, TrendingUp, Users, CheckCircle2, PhoneOff, Clock, Zap, MessageSquare } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { FunnelChart } from './FunnelChart';
import { RecoveryTable } from './RecoveryTable';

export const OperationalView = ({ data }) => {
  const funnelData = [
    { name: 'Compraram', value: data.vendas_aprovadas },
    { name: 'Entraram no Grupo', value: data.vendas_aprovadas - data.onboarding_gap },
  ];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Top Metrics */}
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

      {/* Acompanhamento de Envios */}
      <section>
        <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-6 opacity-30 flex items-center gap-2">
          <MessageSquare size={14} className="text-brand-accent" /> Acompanhamento de Envios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Compra Aprovada */}
          <div className="bg-brand-card border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="text-brand-success" size={18} />
              <h4 className="text-white font-black text-sm uppercase">Compra Aprovada</h4>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col">
                <span className="text-white/20 text-[10px] font-bold uppercase">Total</span>
                <span className="text-xl font-black">{data.status_compra.total}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-brand-success text-[10px] font-bold uppercase">Enviados</span>
                <span className="text-xl font-black">{data.status_compra.enviados}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-red-500 text-[10px] font-bold uppercase">Sem Tel/Inválido</span>
                <span className="text-xl font-black">{data.status_compra.sem_tel}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-brand-gold text-[10px] font-bold uppercase">Pendentes</span>
                <span className="text-xl font-black text-brand-gold">{data.status_compra.pendentes}</span>
              </div>
            </div>
          </div>

          {/* Recuperação de Vendas */}
          <div className="bg-brand-card border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-brand-accent" size={18} />
              <h4 className="text-white font-black text-sm uppercase">Recuperação de Vendas</h4>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col">
                <span className="text-white/20 text-[10px] font-bold uppercase">Total</span>
                <span className="text-xl font-black">{data.status_recup.total}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-brand-success text-[10px] font-bold uppercase">Enviados</span>
                <span className="text-xl font-black">{data.status_recup.enviados}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-brand-gold text-[10px] font-bold uppercase">Recuperadas</span>
                <span className="text-xl font-black text-brand-gold">{data.vendas_recuperadas}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-red-500 text-[10px] font-bold uppercase">Sem Tel</span>
                <span className="text-xl font-black">{data.status_recup.sem_tel}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funnel Section */}
      <section className="bg-brand-card border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
        <Zap className="absolute -right-10 -top-10 text-brand-accent/5 w-64 h-64 rotate-12" />
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="text-white text-xl font-black italic tracking-tighter uppercase mb-1">O Gargalo do Funil: Conversão p/ Grupo</h3>
            <p className="text-brand-accent font-black text-xs uppercase tracking-widest">Taxa de Onboarding: {data.taxa_onboarding}%</p>
          </div>
        </div>
        <div className="h-[250px]">
          <FunnelChart data={funnelData} />
        </div>
      </section>

      {/* Action Plan Section */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-brand-purple/20 p-3 rounded-2xl"><Target className="text-brand-purple" size={24} /></div>
          <h3 className="text-white text-2xl font-black italic tracking-tighter uppercase">Plano de Ação (Resgates)</h3>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="px-4">
              <h4 className="text-white font-black text-sm uppercase mb-1">Lista de Resgate: Checkout Abandonado</h4>
              <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-2">Total: {data.oportunidades} Oportunidades ( {data.leads_whatsapp} WhatsApp | {data.leads_email} E-mail)</p>
              <div className="flex items-center gap-2 text-brand-success font-black text-xs">
                 <Zap size={14} /> Potencial estimado: R$ {data.potencial_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <RecoveryTable data={data.recuperacao_lista} />
          </div>

          <div className="space-y-4">
            <div className="px-4">
              <h4 className="text-white font-black text-sm uppercase mb-1">Resgate de Onboarding (Entrada no Grupo)</h4>
              <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-2">Total: {data.onboarding_gap} Clientes Pendentes</p>
            </div>
            <RecoveryTable data={data.onboarding_lista} type="onboarding" />
          </div>
        </div>
      </section>

    </div>
  );
};
