import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { 
  TrendingUp, Clock, CreditCard, MapPin, Zap, AlertTriangle, 
  Ghost, Mail, UserCheck, MessageSquare, Copy, ShieldAlert, 
  Lightbulb, Phone, Send, Eye, MousePointer2 
} from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#14b8a6', '#d946ef'];

export const StrategicView = ({ data }) => {
  const [activeCopyTab, setActiveCopyTab] = useState('onboarding');

  const copyData = {
    whats: {
      canal: 'ManyChat / WhatsApp',
      foco: `Seus ${data.leads_whatsapp} leads interessados.`,
      scripts: [
        { label: 'Abordagem Direta', text: '"Oi {{Nome}}, vi que sua vaga na Imersão ficou pendente. Alguma dúvida técnica ou o site deu erro? Consigo te ajudar aqui!"' },
        { label: 'Prova Social', text: '"{{Nome}}, acabei de liberar mais 5 vagas. Já temos mais de 100 alunos no grupo. Vamos nessa?"' }
      ],
      metricas: ['Taxa de Resposta', 'Conversão p/ Checkout']
    },
    onboarding: {
      canal: 'ManyChat / Suporte Humano',
      foco: `Seus ${data.onboarding_gap} alunos fora do grupo.`,
      scripts: [
        { label: 'Acesso Imediato', text: '"Parabéns pela compra, {{Nome}}! Notei que você ainda não entrou no grupo oficial. Segue o link: [LINK]"' },
        { label: 'Boas-vindas (Vídeo)', text: '"Fala {{Nome}}, André aqui! Que bom ter você com a gente. Veja esse vídeo de 1 min com os primeiros passos!"' }
      ],
      metricas: ['Taxa de Adesão: Qual mensagem faz o aluno clicar no link mais rápido?', 'Engajamento: Quantos alunos responderam ao vídeo de boas-vindas?']
    },
    email: {
      canal: 'Hotmart Send / Meta Ads',
      foco: `Seus ${data.leads_email} leads sem WhatsApp.`,
      scripts: [
        { label: 'E-mail: Storytelling', text: 'Assunto: Preciso te contar uma coisa... "Notei que você se interessou mas não finalizou. Não queria que ficasse de fora..."' },
        { label: 'Ads: Remarketing', text: 'Legenda Ads: "Vi que você visitou nossa página. Ficou alguma dúvida? Clique aqui para falar com nosso suporte."' }
      ],
      metricas: ['CTR (Taxa de Clique): Qual assunto de e-mail ou criativo de Ads teve mais cliques?', 'Recuperação Passiva: Quantas dessas pessoas compraram após verem o e-mail/ads?']
    }
  };

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

      {/* 2. Mapeamento de Gargalos */}
      <section>
        <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-6 opacity-30 flex items-center gap-2">
          🚩 Mapeamento de Gargalos (Funnel Leaks)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-card p-8 rounded-[2rem] border border-brand-purple/20 relative group shadow-xl">
            <h4 className="text-white font-black text-sm mb-2 flex items-center gap-2">👻 Leads Fantasmas</h4>
            <p className="text-white/40 text-xs mb-4 italic">Loss no Checkout.</p>
            <div className="text-brand-purple text-xs font-black uppercase">Solução: Ads Retargeting.</div>
          </div>
          <div className="bg-brand-card p-8 rounded-[2rem] border border-brand-blue/20 relative group shadow-xl">
            <h4 className="text-white font-black text-sm mb-2 flex items-center gap-2">📧 Só E-mail (Mudos)</h4>
            <p className="text-white/40 text-xs mb-4 italic">{data.leads_email} leads sem WhatsApp.</p>
            <div className="text-brand-blue text-xs font-black uppercase">Solução: Hotmart Send.</div>
          </div>
          <div className="bg-brand-card p-8 rounded-[2rem] border border-brand-teal/20 relative group shadow-xl">
            <h4 className="text-white font-black text-sm mb-2 flex items-center gap-2">🤝 Onboarding Gap</h4>
            <p className="text-white/40 text-xs mb-4 italic">{data.onboarding_gap} alunos fora do grupo.</p>
            <div className="text-brand-teal text-xs font-black uppercase">Solução: Script Humano.</div>
          </div>
        </div>
      </section>

      {/* 3. DNA do Comprador */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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
          <p className="text-[10px] text-white/40 uppercase mb-2">Parcelamento Médio</p>
          <p className="text-5xl font-black text-brand-blue mb-4">{data.parcelamento_medio}x</p>
          <p className="text-xs text-white/40 italic">Maioria prefere parcelar em poucas vezes.</p>
        </div>
      </section>

      {/* 4. Janela de Oportunidade */}
      <section className="bg-brand-card border border-white/5 p-10 rounded-[3rem]">
        <div className="flex items-center gap-3 mb-10">
          <Clock className="text-brand-purple" size={24} />
          <h3 className="text-white text-xl font-black italic tracking-tighter uppercase">Janela de Oportunidade</h3>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-10">
          <div className="h-[300px]">
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

      {/* 5. Copy Factory (Abas do Print) */}
      <section className="bg-brand-card border border-white/5 rounded-[3rem] p-10">
        <div className="flex items-center gap-3 mb-8">
          <Zap className="text-brand-gold" size={24} />
          <h3 className="text-white text-2xl font-black italic tracking-tighter uppercase">Copy Factory (Scripts Rápidos)</h3>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-10 border-b border-white/5 pb-4">
          <button 
            onClick={() => setActiveCopyTab('whats')}
            className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${activeCopyTab === 'whats' ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-white/20 hover:text-white'}`}
          >
            Recuperação (Whats) + Plano A/B
          </button>
          <button 
            onClick={() => setActiveCopyTab('onboarding')}
            className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${activeCopyTab === 'onboarding' ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-white/20 hover:text-white'}`}
          >
            Onboarding (Alunos)
          </button>
          <button 
            onClick={() => setActiveCopyTab('email')}
            className={`text-xs font-black uppercase tracking-widest pb-2 transition-all ${activeCopyTab === 'email' ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-white/20 hover:text-white'}`}
          >
            E-mail & Ads
          </button>
        </div>

        <div className="animate-in fade-in duration-500">
          <p className="text-brand-gold text-lg font-black mb-1">Canal: {copyData[activeCopyTab].canal}</p>
          <p className="text-white/40 text-xs font-bold mb-8 italic">Foco: {copyData[activeCopyTab].foco}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {copyData[activeCopyTab].scripts.map((s, i) => (
              <div key={i} className="bg-black/40 p-8 rounded-[2rem] border border-white/5 relative group">
                <span className="absolute top-6 left-6 text-[8px] bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded font-black uppercase tracking-tighter">{s.label}</span>
                <p className="text-sm text-white/80 leading-relaxed italic mt-6">{s.text}</p>
                <button className="absolute bottom-6 right-6 p-2 text-white/20 hover:text-brand-gold transition-colors">
                  <Copy size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white/5 p-8 rounded-[2rem]">
             <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
               📊 Como medir o vencedor?
             </h4>
             <div className="space-y-4">
               {copyData[activeCopyTab].metricas.map((m, i) => (
                 <div key={i} className="flex items-start gap-3">
                   <span className="text-brand-gold font-black text-sm">{i+1}.</span>
                   <p className="text-xs text-white/60 font-medium">{m}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </section>

    </div>
  );
};
