import React from 'react';
import { Target, Users, Zap, TrendingUp, MapPin, CreditCard, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const StrategicView = ({ data }) => {
  const COLORS = ['#38bdf8', '#64748b', '#1e293b', '#0f172a'];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      
      {/* Header Estratégico */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-6">
        <h2 className="text-xl font-bold tracking-tight text-white">Inteligência Estratégica</h2>
        <p className="text-xs text-muted flex items-center gap-2">
          <Activity size={14} className="text-accent" /> Análise de Performance e Comportamento do Comprador
        </p>
      </div>

      {/* 🧬 DNA do Comprador */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mix de Pagamento */}
        <div className="glass-card p-8">
          <h4 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
            <CreditCard size={16} className="text-muted" /> Mix de Pagamento
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.mix_pagamento}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.mix_pagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data.mix_pagamento.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-[10px]">
                <span className="text-muted flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {item.name}
                </span>
                <span className="font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Estados */}
        <div className="glass-card p-8">
          <h4 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
            <MapPin size={16} className="text-muted" /> Geolocation (Top 5)
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_estados} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px' }}
                />
                <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comportamento Financeiro */}
        <div className="glass-card p-8 flex flex-col justify-center items-center text-center">
          <div className="p-4 rounded-full bg-accent/5 mb-4">
            <TrendingUp size={32} className="text-accent" />
          </div>
          <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Parcelamento Médio</p>
          <h3 className="text-4xl font-black text-white">{data.parcelamento_medio}x</h3>
          <p className="text-[10px] text-muted mt-4 max-w-[150px]">A maioria dos seus alunos prefere pagar à vista ou em poucas parcelas.</p>
        </div>
      </div>

      {/* 🕰️ Janela de Oportunidade */}
      <div className="glass-card p-8">
        <div className="flex justify-between items-center mb-8">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap size={16} className="text-accent" /> Janela de Oportunidade (Volume por Hora)
          </h4>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[9px] text-muted uppercase font-bold">Dia de Ouro</p>
              <p className="text-sm font-bold text-white">{data.dia_de_ouro}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-muted uppercase font-bold">Hora do Rush</p>
              <p className="text-sm font-bold text-white">{data.hora_do_rush}</p>
            </div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.series_hora}>
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff', fontSize: '10px' }}
              />
              <Area type="monotone" dataKey="vendas" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorVendas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🚩 Diagnóstico de Gargalos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LeakBox title="Leads Fantasmas" value={data.gargalos.ghost_leads} description="Perda direta no checkout. Necessário retargeting agressivo." icon={Users} />
        <LeakBox title="Sem Telefone" value={data.gargalos.only_email} description="Contatos limitados ao e-mail. Baixo engajamento." icon={MapPin} />
        <LeakBox title="Onboarding Gap" value={data.gargalos.onboarding_gap} description="Alunos que pagaram mas não acessaram o suporte." icon={Target} />
      </div>

    </div>
  );
};

const LeakBox = ({ title, value, description, icon: Icon }) => (
  <div className="glass-card p-6 border-l-4 border-l-accent">
    <div className="flex justify-between items-start mb-4">
      <h5 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h5>
      <Icon size={16} className="text-muted opacity-30" />
    </div>
    <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
    <p className="text-[10px] text-muted leading-relaxed">{description}</p>
  </div>
);
