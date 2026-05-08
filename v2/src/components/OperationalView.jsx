import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Target, TrendingUp, Users, CheckCircle2, MessageSquare, BarChart3, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { FunnelChart } from './FunnelChart';
import { RecoveryTable } from './RecoveryTable';

export const OperationalView = ({ data }) => {
  const funnelData = [
    { name: 'Compraram', value: data.vendas_aprovadas },
    { name: 'Onboarding', value: data.vendas_aprovadas - data.onboarding_gap },
  ];

  return (
    <div className="flex flex-col gap-10 pb-20">
      
      {/* 👋 Header de Saudação */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">Visão Operacional</h2>
          <p className="text-brand-muted text-[10px] font-black uppercase tracking-[0.4em]">Mundo dos Elétricos · Controle de Funil</p>
        </div>
        <div className="bg-brand-accent/5 border border-brand-accent/20 px-6 py-3 rounded-[2rem] flex items-center gap-3">
          <ShieldCheck size={16} className="text-brand-accent" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Sincronização 100% Segura</span>
        </div>
      </div>

      {/* 📊 Grid de KPIs Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Receita Real (Sheets)" 
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
          title="Fuga no Checkout" 
          value={data.oportunidades}
          icon={Users}
          color="slate"
          subValue={`${data.leads_whatsapp} WhatsApp | ${data.leads_email} E-mail`}
        />
        <StatsCard 
          title="Vendas Recuperadas" 
          value={data.vendas_recuperadas}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* 🧩 Painel Central: Funil e Automação */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfico de Conversão */}
        <div className="lg:col-span-8 glass-panel p-10 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-accent/5 rounded-full blur-[80px] group-hover:bg-brand-accent/10 transition-all duration-700" />
          <div className="flex justify-between items-center mb-12 relative z-10">
            <div>
              <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Eficiência de Onboarding</h4>
              <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">Aderência de alunos ao grupo VIP</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
              {data.taxa_onboarding}% TAXA DE ENTRADA
            </div>
          </div>
          <div className="h-[280px] relative z-10">
            <FunnelChart data={funnelData} />
          </div>
        </div>

        {/* Status de Automação */}
        <div className="lg:col-span-4 glass-panel p-10 flex flex-col gap-10">
          <h4 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping" />
            Status das Automações
          </h4>
          
          <div className="space-y-8">
            <StatusRow label="Entregas (Novos Alunos)" value={data.status_compra.enviados} total={data.status_compra.total} color="bg-emerald-500" />
            <StatusRow label="Resgates (Checkout)" value={data.status_recup.enviados} total={data.status_recup.total} color="bg-brand-accent" />
            
            <div className="pt-8 grid grid-cols-2 gap-8 border-t border-brand-border">
              <div>
                <p className="text-[10px] text-brand-muted uppercase font-black tracking-tighter mb-1">Sem WhatsApp</p>
                <p className="text-2xl font-black text-red-500 italic">{data.status_compra.sem_tel + data.status_recup.sem_tel}</p>
              </div>
              <div>
                <p className="text-[10px] text-brand-muted uppercase font-black tracking-tighter mb-1">Pendentes</p>
                <p className="text-2xl font-black text-brand-accent italic">{data.status_compra.pendentes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⚠️ Plano de Ação (Lists) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-6">
            <div>
              <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none mb-1">Checkout Abandonado</h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                <BarChart3 size={12} /> Potencial Estimado: R$ {data.potencial_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-brand-card p-3 rounded-2xl border border-brand-border"><Users size={20} className="text-brand-muted" /></div>
          </div>
          <RecoveryTable data={data.recuperacao_lista} />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-6">
            <div>
              <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none mb-1">Onboarding Pendente</h3>
              <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mt-1">{data.onboarding_gap} alunos fora do grupo oficial</p>
            </div>
            <div className="bg-brand-card p-3 rounded-2xl border border-brand-border"><ArrowUpRight size={20} className="text-brand-muted" /></div>
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
    <div className="space-y-3">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter">
        <span className="text-brand-muted">{label}</span>
        <span className="text-white">{value} / {total}</span>
      </div>
      <div className="h-2 w-full bg-brand-bg rounded-full p-0.5 border border-brand-border">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${color} rounded-full shadow-[0_0_10px_rgba(14,165,233,0.3)]`} 
        />
      </div>
    </div>
  );
};
