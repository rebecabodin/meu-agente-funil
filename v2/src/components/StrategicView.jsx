import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { TrendingUp, Clock, CreditCard, MapPin, Zap, AlertTriangle, Ghost, Mail, UserCheck, MessageSquare, Copy } from 'lucide-react';

const COLORS = ['#FFD700', '#FFFFFF', '#444444', '#888888'];

export const StrategicView = ({ data }) => {
  const copyScripts = [
    {
      target: 'Checkout Abandonado (Whats)',
      title: 'Abordagem Consultiva',
      script: '"Oi {{Nome}}, vi que sua vaga na Imersão ficou pendente. Alguma dúvida técnica ou o site deu erro? Consigo te ajudar aqui!"'
    },
    {
      target: 'Onboarding (Alunos)',
      title: 'Acesso ao Grupo',
      script: '"Parabéns pela compra, {{Nome}}! Notei que você ainda não entrou no grupo oficial de suporte. Segue o link exclusivo: [LINK]"'
    },
    {
      target: 'Recuperação (E-mail)',
      title: 'Urgência / Escassez',
      script: '"Notei que você se interessou mas não finalizou. Não queria que ficasse de fora dessa turma. Posso liberar sua vaga?"'
    }
  ];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      
      {/* 1. Mapeamento de Gargalos (Igual ao Insights.py) */}
      <section>
        <h3 className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
          <AlertTriangle size={14} className="text-brand-gold" /> Mapeamento de Gargalos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#121212] border border-brand-gold/20 p-6 rounded-3xl relative overflow-hidden group">
            <Ghost className="absolute -right-4 -bottom-4 text-brand-gold/5 w-24 h-24 group-hover:scale-110 transition-transform" />
            <h4 className="text-brand-gold font-bold mb-1">Leads Fantasmas</h4>
            <p className="text-3xl font-black text-white mb-2">{data.gargalos.ghost_leads}</p>
            <p className="text-white/40 text-[10px] leading-relaxed">Loss total no checkout.<br/><span className="text-brand-gold">Solução: Retargeting Ads.</span></p>
          </div>
          
          <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
            <Mail className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24 group-hover:scale-110 transition-transform" />
            <h4 className="text-white font-bold mb-1 text-sm">Só E-mail (Mudos)</h4>
            <p className="text-3xl font-black text-white mb-2">{data.gargalos.only_email}</p>
            <p className="text-white/40 text-[10px] leading-relaxed">Leads sem WhatsApp.<br/><span className="text-brand-gold">Solução: Hotmart Send.</span></p>
          </div>

          <div className="bg-[#121212] border border-brand-success/20 p-6 rounded-3xl relative overflow-hidden group">
            <UserCheck className="absolute -right-4 -bottom-4 text-brand-success/5 w-24 h-24 group-hover:scale-110 transition-transform" />
            <h4 className="text-brand-success font-bold mb-1 text-sm">Onboarding Gap</h4>
            <p className="text-3xl font-black text-white mb-2">{data.gargalos.onboarding_gap}</p>
            <p className="text-white/40 text-[10px] leading-relaxed">Alunos fora do grupo.<br/><span className="text-brand-gold">Solução: Script Humano.</span></p>
          </div>
        </div>
      </section>

      {/* 2. DNA do Comprador */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-[#121212] border border-white/5 p-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-gold/10 rounded-lg"><CreditCard className="text-brand-gold" size={20} /></div>
              <h3 className="text-white font-bold">Mix de Pagamento</h3>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.mix_pagamento}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.mix_pagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 p-8 rounded-[2.5rem]">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-brand-gold/10 rounded-lg"><MapPin className="text-brand-gold" size={20} /></div>
            <h3 className="text-white font-bold">Top 5 Estados (Vendas)</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_estados} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} width={100} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#000', border: 'none' }} />
                <Bar dataKey="value" fill="#FFD700" radius={[0, 10, 10, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 3. Janela de Oportunidade */}
      <section className="bg-[#121212] border border-white/5 p-8 rounded-[2.5rem]">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-brand-gold/10 rounded-lg"><Clock className="text-brand-gold" size={20} /></div>
          <div>
            <h3 className="text-white font-bold">Comportamento de Compra (Hora a Hora)</h3>
            <p className="text-white/30 text-xs">Identificação de janelas de alta conversão</p>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.series_hora}>
              <XAxis dataKey="hora" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} />
              <YAxis hide />
              <Tooltip cursor={{fill: 'rgba(255,215,0,0.05)'}} contentStyle={{ backgroundColor: '#000', border: 'none' }} />
              <Bar dataKey="vendas" fill="#FFD700" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. Ranking & Copy Factory */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        <div className="xl:col-span-1 bg-brand-gold p-8 rounded-[2.5rem] text-black">
          <Zap className="mb-4" size={32} />
          <h3 className="font-black text-2xl mb-6 italic tracking-tighter">MOMENTOS DE OURO</h3>
          <div className="space-y-4">
            {data.ranking_momentos.map((moment, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-black/10 pb-2">
                <span className="text-xs font-bold opacity-60">#{idx+1} {moment.name}</span>
                <span className="font-black">{moment.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 bg-[#121212] border border-white/5 p-8 rounded-[2.5rem]">
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="text-brand-gold" size={24} />
            <h3 className="text-white font-bold text-xl">Copy Factory (Scripts Rápidos)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {copyScripts.map((item, idx) => (
              <div key={idx} className="bg-black/40 p-5 rounded-2xl border border-white/5 group relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] bg-brand-gold text-black px-2 py-0.5 rounded font-bold uppercase">{item.target}</span>
                  <Copy size={14} className="text-white/20 group-hover:text-brand-gold cursor-pointer transition-colors" />
                </div>
                <p className="text-xs font-bold text-white/80 mb-2">{item.title}</p>
                <p className="text-[11px] text-white/40 italic leading-relaxed">{item.script}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
