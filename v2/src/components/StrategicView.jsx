import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { TrendingUp, Clock, CreditCard, MapPin, Zap, AlertTriangle, Ghost, Mail, UserCheck, MessageSquare, Copy, ShieldAlert, Lightbulb } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#14b8a6', '#d946ef'];

export const StrategicView = ({ data }) => {
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-1000 pb-20">
      
      {/* 1. Performance de Entrega (Onboarding) */}
      <section>
        <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-6 opacity-30 flex items-center gap-2">
          🏁 Performance de Entrega (Onboarding)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-brand-card p-6 rounded-[2rem] border border-white/5">
            <p className="text-[10px] text-white/30 uppercase font-black mb-1">Vendas Totais</p>
            <p className="text-3xl font-black">{data.vendas_aprovadas}</p>
          </div>
          <div className="bg-brand-card p-6 rounded-[2rem] border border-white/5">
            <p className="text-[10px] text-white/30 uppercase font-black mb-1">Membros no Grupo</p>
            <p className="text-3xl font-black">{data.membros_no_grupo}</p>
          </div>
          <div className="bg-brand-card p-6 rounded-[2rem] border border-white/5">
            <p className="text-[10px] text-white/30 uppercase font-black mb-1">Taxa de Onboarding</p>
            <p className="text-3xl font-black">{data.taxa_onboarding}%</p>
          </div>
          <div className="bg-brand-card p-6 rounded-[2rem] border border-white/5">
            <p className="text-[10px] text-white/30 uppercase font-black mb-1 text-red-400">Gap de Entrega</p>
            <p className="text-3xl font-black text-red-400">{data.onboarding_gap}</p>
          </div>
        </div>
      </section>

      {/* 2. Mapeamento de Gargalos (Funnel Leaks) */}
      <section>
        <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-6 opacity-30 flex items-center gap-2">
          🚩 Mapeamento de Gargalos (Funnel Leaks)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-card p-8 rounded-[2rem] border border-brand-purple/20 relative group shadow-xl">
            <h4 className="text-white font-black text-sm mb-2 flex items-center gap-2">
               👻 Leads Fantasmas
            </h4>
            <p className="text-white/40 text-xs mb-4 italic">Loss no Checkout.</p>
            <div className="text-brand-purple text-xs font-black uppercase">Solução: Ads Retargeting.</div>
          </div>
          
          <div className="bg-brand-card p-8 rounded-[2rem] border border-brand-blue/20 relative group shadow-xl">
            <h4 className="text-white font-black text-sm mb-2 flex items-center gap-2">
               📧 Só E-mail (Mudos)
            </h4>
            <p className="text-white/40 text-xs mb-4 italic">{data.leads_email} leads sem WhatsApp.</p>
            <div className="text-brand-blue text-xs font-black uppercase">Solução: Hotmart Send.</div>
          </div>

          <div className="bg-brand-card p-8 rounded-[2rem] border border-brand-teal/20 relative group shadow-xl">
            <h4 className="text-white font-black text-sm mb-2 flex items-center gap-2">
               🤝 Onboarding Gap
            </h4>
            <p className="text-white/40 text-xs mb-4 italic">{data.onboarding_gap} alunos fora do grupo.</p>
            <div className="text-brand-teal text-xs font-black uppercase">Solução: Script Humano.</div>
          </div>
        </div>
      </section>

      {/* 3. DNA do Comprador (Perfil) */}
      <section>
        <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-6 opacity-30 flex items-center gap-2">
          🧬 DNA do Comprador (Perfil)
        </h3>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 bg-brand-card border border-white/5 p-8 rounded-[2.5rem]">
            <h4 className="text-white/60 text-[10px] font-black uppercase mb-8">Mix de Pagamento</h4>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.mix_pagamento} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {data.mix_pagamento.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0d0d1f', border: 'none', borderRadius: '16px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
               {data.mix_pagamento.map((e, i) => (
                 <div key={i} className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}} />
                   <span className="text-[10px] font-bold opacity-60">{e.name} {e.value}%</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="xl:col-span-1 bg-brand-card border border-white/5 p-8 rounded-[2.5rem]">
            <h4 className="text-white/60 text-[10px] font-black uppercase mb-8">Top Estados</h4>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_estados} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} width={40} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="xl:col-span-1 bg-brand-card border border-white/5 p-10 rounded-[2.5rem] flex flex-col justify-center text-center">
            <h4 className="text-white/20 text-[10px] font-black uppercase mb-6">Comportamento Financeiro</h4>
            <p className="text-[10px] text-white/40 uppercase mb-2">Parcelamento Médio</p>
            <p className="text-5xl font-black text-brand-blue mb-4">{data.parcelamento_medio}x</p>
            <p className="text-xs text-white/40 italic">Maioria prefere parcelar em poucas vezes.</p>
          </div>
        </div>
      </section>

      {/* 4. Janela de Oportunidade */}
      <section className="bg-brand-card border border-white/5 p-10 rounded-[3rem]">
        <div className="flex items-center gap-3 mb-10">
          <Clock className="text-brand-purple" size={24} />
          <h3 className="text-white text-xl font-black italic tracking-tighter uppercase">Janela de Oportunidade (Comportamento de Compra)</h3>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-10">
          <div className="h-[300px]">
            <p className="text-[10px] text-white/30 uppercase font-black mb-4">Volume de Vendas por Hora</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.series_hora}>
                <XAxis dataKey="hora" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} />
                <Bar dataKey="vendas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-6 h-fit mt-auto">
             <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 text-center">
                <span className="text-[10px] text-white/30 uppercase font-black">Dia de Ouro</span>
                <p className="text-3xl font-black text-brand-purple mt-1">{data.dia_de_ouro}</p>
             </div>
             <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 text-center">
                <span className="text-[10px] text-white/30 uppercase font-black">Hora do Rush</span>
                <p className="text-3xl font-black text-brand-purple mt-1">{data.hora_do_rush}</p>
             </div>
          </div>
        </div>

        <div className="bg-brand-purple/10 border border-brand-purple/20 p-6 rounded-2xl flex items-center gap-4">
          <Lightbulb className="text-brand-purple" size={24} />
          <p className="text-xs text-white/80 font-medium">
             <span className="font-black text-brand-purple uppercase">Dica Estratégica:</span> O seu lançamento possui picos idênticos de tração. Agende suas comunicações para as janelas de {data.hora_do_rush}.
          </p>
        </div>
      </section>

      {/* 5. Plano de Ação Imediata */}
      <section>
        <h3 className="text-white text-2xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
          🛠️ Plano de Ação Imediata
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-card p-8 rounded-[2rem] border-l-4 border-brand-gold">
            <p className="text-brand-gold text-[10px] font-black uppercase mb-2">Resgate Urgente</p>
            <p className="text-4xl font-black mb-4">{data.leads_whatsapp} leads</p>
            <p className="text-xs text-white/60 mb-1 font-bold">Ação: Chamar no WhatsApp agora.</p>
            <p className="text-[10px] text-white/20 uppercase font-black">Canal: ManyChat</p>
          </div>
          
          <div className="bg-brand-card p-8 rounded-[2rem] border-l-4 border-brand-blue">
            <p className="text-brand-blue text-[10px] font-black uppercase mb-2">Recapturar (Sem Zap)</p>
            <p className="text-4xl font-black mb-4">{data.leads_email} leads</p>
            <p className="text-xs text-white/60 mb-1 font-bold">Ação: E-mail + Anúncios de Remarketing.</p>
            <p className="text-[10px] text-white/20 uppercase font-black">Canal: Hotmart Send / Ads</p>
          </div>

          <div className="bg-brand-card p-8 rounded-[2rem] border-l-4 border-brand-success">
            <p className="text-brand-success text-[10px] font-black uppercase mb-2">Boas-Vindas (Grupo)</p>
            <p className="text-4xl font-black mb-4">{data.onboarding_gap} alunos</p>
            <p className="text-xs text-white/60 mb-1 font-bold">Ação: Colocar no grupo de suporte.</p>
            <p className="text-[10px] text-white/20 uppercase font-black">Canal: Humano (1-a-1)</p>
          </div>
        </div>
      </section>

    </div>
  );
};
