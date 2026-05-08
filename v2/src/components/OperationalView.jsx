import React from 'react';
import { DollarSign, Target, TrendingUp, Users } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { FunnelChart } from './FunnelChart';
import { RecoveryTable } from './RecoveryTable';

export const OperationalView = ({ data }) => {
  const funnelData = [
    { name: 'Oportunidades', value: data.oportunidades + data.vendas_aprovadas },
    { name: 'Checkout', value: data.vendas_aprovadas + (data.oportunidades / 2) },
    { name: 'Aprovadas', value: data.vendas_aprovadas },
    { name: 'No Grupo', value: data.vendas_aprovadas - data.gap_onboarding },
  ];

  return (
    <>
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
    </>
  );
};
