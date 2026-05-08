import React from 'react';
import { DollarSign, Target, TrendingUp, Users, CheckCircle2, PhoneOff, Clock } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { FunnelChart } from './FunnelChart';
import { RecoveryTable } from './RecoveryTable';

export const OperationalView = ({ data }) => {
  const funnelData = [
    { name: 'Oportunidades', value: data.oportunidades + data.vendas_aprovadas },
    { name: 'Checkout', value: data.vendas_aprovadas + (data.oportunidades / 2) },
    { name: 'Aprovadas', value: data.vendas_aprovadas },
    { name: 'No Grupo', value: data.vendas_aprovadas - data.gargalos.onboarding_gap },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* KPIs Seção Superior */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Faturamento" 
          value={`R$ ${data.faturamento.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          color="purple"
          subValue="Total bruto aprovado"
        />
        <StatsCard 
          title="Vendas" 
          value={data.vendas_aprovadas}
          icon={CheckCircle2}
          color="blue"
          subValue={`${data.vendas_recuperadas} recuperadas`}
        />
        <StatsCard 
          title="Onboarding" 
          value={`${data.taxa_onboarding}%`}
          icon={Target}
          color="teal"
          subValue={`${data.vendas_aprovadas - data.gargalos.onboarding_gap} alunos ativos`}
        />
        <StatsCard 
          title="Leads" 
          value={data.oportunidades}
          icon={Users}
          color="pink"
          subValue={`Potencial: R$ ${data.potencial_estimado.toLocaleString('pt-BR')}`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Bloco Central: Gráfico de Funil */}
        <div className="xl:col-span-2 bg-brand-card border border-white/5 rounded-[2.5rem] p-8">
          <h3 className="text-white text-lg font-black mb-10 tracking-tight uppercase italic opacity-60">
            Performance do Funil
          </h3>
          <div className="h-[400px]">
            <FunnelChart data={funnelData} />
          </div>
        </div>

        {/* Status de Envios - Estilo Alumea */}
        <div className="flex flex-col gap-6">
          <div className="bg-brand-card border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-white text-xs font-black mb-6 uppercase tracking-[0.3em] opacity-30">Status de Envios</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-success shadow-[0_0_10px_#22c55e]" />
                  <span className="text-sm font-bold opacity-60">Enviados</span>
                </div>
                <span className="font-black text-xl">{data.status_compra.enviados + data.status_recup.enviados}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_10px_#fccb00]" />
                  <span className="text-sm font-bold opacity-60">Pendentes</span>
                </div>
                <span className="font-black text-xl text-brand-gold">{data.status_compra.pendentes + data.status_recup.pendentes}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
                  <span className="text-sm font-bold opacity-60">Sem Tel</span>
                </div>
                <span className="font-black text-xl">{data.status_compra.sem_tel + data.status_recup.sem_tel}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-accent to-brand-purple p-8 rounded-[2.5rem] text-white shadow-2xl">
            <h3 className="font-black text-xl mb-1 tracking-tighter italic">META SEMANAL</h3>
            <p className="text-white/60 text-xs mb-8">Faltam R$ 15k para bater R$ 60k</p>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-white w-[75%]" />
            </div>
            <p className="font-black text-right text-3xl italic">75%</p>
          </div>
        </div>
      </div>

      {/* Tabelas de Resgate */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <RecoveryTable title="🎯 Resgate: Checkout" data={data.recuperacao_lista} />
        <RecoveryTable title="🎓 Resgate: Onboarding" data={data.onboarding_lista} type="onboarding" />
      </div>

    </div>
  );
};
