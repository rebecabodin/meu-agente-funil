import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { TrendingUp, Clock, CreditCard, MapPin, Zap, AlertTriangle, Ghost, Mail, UserCheck, MessageSquare, Copy } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#14b8a6', '#d946ef'];

export const StrategicView = ({ data }) => {
  const copyScripts = [
    { target: 'Checkout', title: 'Consultiva', script: '"Oi {{Nome}}, vi que sua vaga ficou pendente. Alguma dúvida técnica?"' },
    { target: 'Onboarding', title: 'Grupo VIP', script: '"Parabéns pela compra! Entre no grupo oficial: [LINK]"' },
    { target: 'E-mail', title: 'Escassez', script: '"Não queria que ficasse de fora dessa turma. Posso liberar sua vaga?"' },
    { target: 'Apoio', title: 'Suporte', script: '"Notei seu interesse. Alguma dificuldade com o pagamento?"' }
  ];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-1000">
      
      {/* 1. Mapeamento de Gargalos - Estilo Neon */}
      <section>
        <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-8 opacity-30 flex items-center gap-2">
          <AlertTriangle size={14} className="text-brand-purple" /> Diagnóstico de Fugas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-card p-8 rounded-[2.5rem] border border-brand-purple/20 relative group overflow-hidden shadow-xl">
            <Ghost className="absolute -right-6 -bottom-6 text-brand-purple/5 w-32 h-32 group-hover:scale-110 transition-transform" />
            <h4 className="text-brand-purple font-black text-sm uppercase tracking-widest mb-1">Ghost Leads</h4>
            <p className="text-4xl font-black text-white mb-4 tracking-tighter">{data.gargalos.ghost_leads}</p>
            <div className="bg-brand-purple/10 text-brand-purple text-[10px] font-bold px-3 py-1 rounded-full w-fit uppercase">Solução: Retargeting</div>
          </div>
          
          <div className="bg-brand-card p-8 rounded-[2.5rem] border border-brand-blue/20 relative group overflow-hidden shadow-xl">
            <Mail className="absolute -right-6 -bottom-6 text-brand-blue/5 w-32 h-32 group-hover:scale-110 transition-transform" />
            <h4 className="text-brand-blue font-black text-sm uppercase tracking-widest mb-1">Mudos (E-mail)</h4>
            <p className="text-4xl font-black text-white mb-4 tracking-tighter">{data.gargalos.only_email}</p>
            <div className="bg-brand-blue/10 text-brand-blue text-[10px] font-bold px-3 py-1 rounded-full w-fit uppercase">Solução: Hotmart Send</div>
          </div>

          <div className="bg-brand-card p-8 rounded-[2.5rem] border border-brand-teal/20 relative group overflow-hidden shadow-xl">
            <UserCheck className="absolute -right-6 -bottom-6 text-brand-teal/5 w-32 h-32 group-hover:scale-110 transition-transform" />
            <h4 className="text-brand-teal font-black text-sm uppercase tracking-widest mb-1">Onboarding Gap</h4>
            <p className="text-4xl font-black text-white mb-4 tracking-tighter">{data.gargalos.onboarding_gap}</p>
            <div className="bg-brand-teal/10 text-brand-teal text-[10px] font-bold px-3 py-1 rounded-full w-fit uppercase">Solução: Script Humano</div>
          </div>
        </div>
      </section>

      {/* 2. DNA do Comprador - Gráficos Neon */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-brand-card border border-white/5 p-8 rounded-[2.5rem]">
          <h3 className="text-white text-sm font-black uppercase tracking-widest mb-10 opacity-60">Perfil de Pagamento</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.mix_pagamento} innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value">
                  {data.mix_pagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0d0d1f', border: 'none', borderRadius: '16px' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-brand-card border border-white/5 p-8 rounded-[2.5rem]">
          <h3 className="text-white text-sm font-black uppercase tracking-widest mb-10 opacity-60">Faturamento por Região</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_estados} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: '#444', fontSize: 11 }} axisLine={false} width={100} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#0d0d1f', border: 'none' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 3. Janela de Oportunidade - Estilo Linear */}
      <section className="bg-brand-card border border-white/5 p-10 rounded-[3rem]">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-white text-xl font-black italic tracking-tighter uppercase">Cronologia do Lançamento</h3>
            <p className="text-white/20 text-xs mt-1 uppercase font-bold tracking-widest text-brand-purple">Comportamento de Compra (Hora a Hora)</p>
          </div>
          <Clock className="text-brand-purple" size={32} />
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.series_hora}>
              <defs>
                <linearGradient id="colorPurp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hora" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: '#0d0d1f', border: 'none' }} />
              <Area type="monotone" dataKey="vendas" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorPurp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. Copy Factory - Estilo Grid Alumea */}
      <section>
        <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-8 opacity-30 flex items-center gap-2">
          <MessageSquare size={14} className="text-brand-pink" /> Central de Scripts (Copy Factory)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {copyScripts.map((item, idx) => (
            <div key={idx} className="bg-brand-card p-6 rounded-[2rem] border border-white/5 hover:border-brand-pink/30 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] bg-brand-pink/20 text-brand-pink px-2 py-1 rounded-lg font-black uppercase tracking-widest">{item.target}</span>
                <Copy size={14} className="text-white/20 group-hover:text-white cursor-pointer" />
              </div>
              <p className="text-xs font-black text-white mb-2">{item.title}</p>
              <p className="text-[11px] text-white/40 leading-relaxed italic line-clamp-3">{item.script}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
