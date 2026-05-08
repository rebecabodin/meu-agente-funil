import React from 'react';
import { DollarSign, Target, TrendingUp, Users, CheckCircle2, MessageSquare, BarChart3, ArrowUpRight } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { FunnelChart } from './FunnelChart';
import { RecoveryTable } from './RecoveryTable';

export const OperationalView = ({ data }) => {
  const funnelData = [
    { name: 'Compraram', value: data.vendas_aprovadas },
    { name: 'No Grupo', value: data.vendas_aprovadas - data.onboarding_gap },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      
      {/* Header Profissional */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-6">
        <h2 className="text-xl font-bold tracking-tight text-white">Mundo dos Elétricos</h2>
        <p className="text-xs text-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Inteligência de Operação · Atualizado em {data.updated_at}
        </p>
      </div>

      {/* Grid de KPIs - Dados Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Faturamento Bruto" 
          value={`R$ ${data.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard 
          title="Conversão Aprovada" 
          value={data.vendas_aprovadas}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard 
          title="Checkout Abandonado" 
          value={data.oportunidades}
          icon={Users}
          color="slate"
          subValue={`${data.leads_whatsapp} via WhatsApp | ${data.leads_email} via E-mail`}
        />
        <StatsCard 
          title="Recuperação de Vendas" 
          value={data.vendas_recuperadas}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Painel de Monitoramento de Funil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Conversão */}
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-sm font-semibold text-white">Eficiência de Onboarding</h4>
              <p className="text-[10px] text-muted">Aderência dos alunos ao grupo de suporte</p>
            </div>
            <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-accent">
              {data.taxa_onboarding}% TAXA
            </div>
          </div>
          <div className="h-[240px]">
            <FunnelChart data={funnelData} />
          </div>
        </div>

        {/* Status de Envios (Sóbrio) */}
        <div className="glass-card p-8 flex flex-col gap-6">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquare size={16} className="text-muted" /> Status de Automação
          </h4>
          
          <div className="space-y-6">
            <StatusRow label="Enviados (Vendas)" value={data.status_compra.enviados} total={data.status_compra.total} color="bg-emerald-500" />
            <StatusRow label="Enviados (Resgates)" value={data.status_recup.enviados} total={data.status_recup.total} color="bg-blue-500" />
            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-white/5">
              <div>
                <p className="text-[9px] text-muted uppercase font-bold">Sem Telefone</p>
                <p className="text-lg font-bold text-red-400">{data.status_compra.sem_tel + data.status_recup.sem_tel}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted uppercase font-bold">Pendentes</p>
                <p className="text-lg font-bold text-warning">{data.status_compra.pendentes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Resgates Críticos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Checkout Abandonado</h3>
              <p className="text-[10px] text-muted">Potencial estimado: R$ {data.potencial_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <BarChart3 size={16} className="text-muted opacity-20" />
          </div>
          <RecoveryTable data={data.recuperacao_lista} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Pendentes de Onboarding</h3>
              <p className="text-[10px] text-muted">{data.onboarding_gap} alunos fora do grupo oficial</p>
            </div>
            <ArrowUpRight size={16} className="text-muted opacity-20" />
          </div>
          <RecoveryTable data={data.onboarding_lista} type="onboarding" />
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, value, total, color }) => {
  const percent = Math.min(100, Math.max(0, (value / total) * 100)) || 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase text-muted">
        <span>{label}</span>
        <span>{value} / {total}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
