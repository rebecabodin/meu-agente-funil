import React from 'react';
import { ExternalLink, User, Phone, AlertCircle } from 'lucide-react';

export const RecoveryTable = ({ data, type = 'recovery' }) => {
  return (
    <div className="glass-panel overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5">
            <th className="px-8 py-5 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] w-16 text-center">Nº</th>
            <th className="px-8 py-5 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Identificação do Lead</th>
            <th className="px-8 py-5 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Contato</th>
            <th className="px-8 py-5 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] text-right">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {data && data.length > 0 ? data.map((item, index) => (
            <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
              <td className="px-8 py-6 text-xs font-bold text-brand-muted text-center opacity-30">{index + 1}</td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-card flex items-center justify-center text-brand-muted border border-brand-border group-hover:border-brand-accent/20 transition-all">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-bold text-white tracking-tight">{item.NOME}</span>
                </div>
              </td>
              <td className="px-8 py-6">
                {item.TELEFONE === 'Sem Telefone' ? (
                  <div className="flex items-center gap-2 text-red-400 italic">
                    <AlertCircle size={14} />
                    <span className="text-xs font-medium">Sem WhatsApp</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-brand-muted group-hover:text-brand-accent transition-colors">
                    <Phone size={14} />
                    <span className="text-xs font-bold tracking-tighter">{item.TELEFONE}</span>
                  </div>
                )}
              </td>
              <td className="px-8 py-6 text-right">
                <button 
                  disabled={item.TELEFONE === 'Sem Telefone'}
                  className={`p-3 rounded-xl transition-all ${
                    item.TELEFONE === 'Sem Telefone' 
                      ? 'opacity-20 cursor-not-allowed text-brand-muted' 
                      : 'bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-white shadow-lg shadow-brand-accent/0 hover:shadow-brand-accent/20'
                  }`}
                >
                  <ExternalLink size={16} />
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="px-8 py-20 text-center text-brand-muted text-xs font-bold uppercase tracking-widest opacity-20">
                Nenhuma pendência encontrada no momento.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
