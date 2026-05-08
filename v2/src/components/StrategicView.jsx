import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { TrendingUp, Clock, CreditCard, MapPin, Zap } from 'lucide-react';

const COLORS = ['#FFD700', '#FFFFFF', '#333333', '#666666'];

export const StrategicView = ({ data }) => {
  return (
    <div className="flex flex-col gap-8">
      {/* KPIs Estratégicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121212] border-l-4 border-brand-gold p-6 rounded-r-2xl">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Status de Onboarding</p>
          <h4 className="text-2xl font-bold text-white">{data.taxa_onboarding}%</h4>
          <p className="text-brand-gold text-sm mt-2">Meta: 90%</p>
        </div>
        <div className="bg-[#121212] border-l-4 border-white p-6 rounded-r-2xl">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Parcelamento Médio</p>
          <h4 className="text-2xl font-bold text-white">{data.parcelamento_medio}x</h4>
          <p className="text-white/40 text-sm mt-2">Comportamento financeiro</p>
        </div>
        <div className="bg-[#121212] border-l-4 border-brand-success p-6 rounded-r-2xl">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Vendas Salvas</p>
          <h4 className="text-2xl font-bold text-white">{data.vendas_recuperadas}</h4>
          <p className="text-brand-success text-sm mt-2">Eficácia do resgate</p>
        </div>
      </div>

      {/* DNA do Comprador */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="text-brand-gold" size={20} />
            <h3 className="text-white font-semibold">Mix de Pagamento</h3>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={data.mix_pagamento}
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
                contentStyle={{ backgroundColor: '#181818', border: '1px solid #333' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="text-brand-gold" size={20} />
            <h3 className="text-white font-semibold">Top Estados (Faturamento)</h3>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={data.top_estados} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #333' }} />
              <Bar dataKey="value" fill="#FFD700" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comportamento Temporal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-brand-gold" size={20} />
            <h3 className="text-white font-semibold">Volume de Vendas por Hora</h3>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={data.series_hora}>
              <XAxis dataKey="hora" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #333' }} />
              <Bar dataKey="vendas" fill="#FFD700" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-brand-gold" size={20} />
            <h3 className="text-white font-semibold">Crescimento Acumulado</h3>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={data.series_acumulado}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #333' }} />
              <Area type="monotone" dataKey="value" stroke="#FFD700" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking de Momentos de Ouro */}
      <div className="bg-brand-gold/10 border border-brand-gold/20 p-8 rounded-3xl relative overflow-hidden">
        <Zap className="absolute top-4 right-4 text-brand-gold opacity-20" size={100} />
        <h3 className="text-brand-gold font-bold text-xl mb-6">🏆 Ranking: Momentos de Ouro</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {data.ranking_momentos.map((moment, idx) => (
            <div key={idx} className="bg-black/40 p-4 rounded-xl text-center border border-white/5">
              <p className="text-white/40 text-[10px] uppercase tracking-tighter">Pico #{idx + 1}</p>
              <p className="text-white font-bold text-lg">{moment.name}</p>
              <p className="text-brand-gold text-xs font-medium">{moment.value} vendas</p>
            </div>
          ))}
        </div>
        <p className="text-white/40 text-xs mt-6 italic">Nota: Agende suas comunicações e suporte humano para estas janelas de alta conversão.</p>
      </div>
    </div>
  );
};
