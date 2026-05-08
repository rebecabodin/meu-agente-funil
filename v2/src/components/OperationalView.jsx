import React from 'react';
import { DollarSign, Target, TrendingUp, Users, CheckCircle2, AlertCircle, PhoneOff, Clock } from 'lucide-react';
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          title="Faturamento Bruto" 
          value={`R$ ${data.faturamento.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          subValue="Total aprovado (Hotmart)"
        />
        <StatsCard 
          title="Taxa de Onboarding" 
          value={`${data.taxa_onboarding}%`}
          icon={Target}
          subValue={`${data.vendas_aprovadas - data.gargalos.onboarding_gap} alunos no grupo`}
        />
        <StatsCard 
          title="Vendas Recuperadas" 
          value={data.vendas_recuperadas}
          icon={TrendingUp}
          subValue="Recuperação via automação"
        />
        <StatsCard 
          title="Leads Pendentes" 
          value={data.oportunidades}
          icon={Users}
          subValue={`Potencial: R$ ${data.potencial_estimado.toLocaleString('pt-BR')}`}
        />
      </div>

      {/* Acompanhamento de Envios (Fiel ao app.py) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Compra Aprovada Status */}
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
             📦 Acompanhamento: Compra Aprovada
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
              <CheckCircle2 className="text-brand-success mx-auto mb-2" size={20} />
              <p className="text-2xl font-black text-white">{data.status_compra.enviados}</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">Enviados</p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
              <PhoneOff className="text-white/20 mx-auto mb-2" size={20} />
              <p className="text-2xl font-black text-white">{data.status_compra.sem_tel}</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">Sem Tel</p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center border-brand-gold/20">
              <Clock className="text-brand-gold mx-auto mb-2" size={20} />
              <p className="text-2xl font-black text-brand-gold">{data.status_compra.pendentes}</p>
              <p className="text-[10px] text-brand-gold/60 uppercase font-bold tracking-widest">Pendentes</p>
            </div>
          </div>
        </div>

        {/* Recuperação Status */}
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 text-white">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
             🔄 Acompanhamento: Recuperação
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
              <CheckCircle2 className="text-brand-success mx-auto mb-2" size={20} />
              <p className="text-2xl font-black text-white">{data.status_recup.enviados}</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">Enviados</p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
              <PhoneOff className="text-white/20 mx-auto mb-2" size={20} />
              <p className="text-2xl font-black text-white">{data.status_recup.sem_tel}</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">Sem Tel</p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center border-brand-gold/20">
              <Clock className="text-brand-gold mx-auto mb-2" size={20} />
              <p className="text-2xl font-black text-brand-gold">{data.status_recup.pendentes}</p>
              <p className="text-[10px] text-brand-gold/60 uppercase font-bold tracking-widest">Pendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-8">
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-8">
            <h3 className="text-white font-bold mb-8 tracking-tight">Análise de Funil de Conversão</h3>
            <FunnelChart data={funnelData} />
          </div>
          <RecoveryTable 
            title="🎯 Lista de Resgate: Checkout Abandonado" 
            data={data.recuperacao_lista} 
          />
        </div>
        
        <div className="flex flex-col gap-8">
          <div className="bg-brand-gold p-8 rounded-[2.5rem] text-black relative overflow-hidden shadow-[0_20px_40px_rgba(252,203,0,0.2)]">
            <TrendingUp className="absolute -bottom-6 -right-6 w-40 h-40 opacity-10 rotate-12" />
            <h3 className="font-black text-2xl mb-2 italic">META SEMANAL</h3>
            <p className="text-black/60 font-medium mb-8">Status: R$ 44k de R$ 60k</p>
            <div className="h-4 bg-black/10 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-black w-[73%]" />
            </div>
            <p className="font-black text-3xl">73%</p>
          </div>

          <RecoveryTable 
            title="🎓 Lista: Fora do Grupo" 
            data={data.onboarding_lista} 
            type="onboarding"
          />
        </div>
      </div>
    </div>
  );
};
