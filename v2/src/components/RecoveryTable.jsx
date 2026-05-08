import React from 'react';
import { Phone, User, ExternalLink, XCircle } from 'lucide-react';

export const RecoveryTable = ({ data, type = 'recovery' }) => {
  return (
    <div className="bg-brand-card/30 border border-white/5 rounded-[2rem] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/5">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 w-16">Nº</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Nome</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Telefone</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row, idx) => {
            const hasPhone = row.TELEFONE && row.TELEFONE.trim() !== "" && row.TELEFONE.toLowerCase() !== "sem telefone";
            
            return (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5 text-sm font-bold text-white/20">{idx + 1}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-brand-accent transition-colors">
                      <User size={14} />
                    </div>
                    <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{row.NOME}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  {hasPhone ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-white/60">
                      <Phone size={12} className="text-brand-teal" />
                      {row.TELEFONE}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-black text-red-500 italic">
                      <XCircle size={14} />
                      Sem Telefone
                    </div>
                  )}
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    disabled={!hasPhone}
                    className={`p-2 rounded-xl transition-all ${
                      hasPhone 
                      ? 'bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-white cursor-pointer' 
                      : 'text-white/5 cursor-not-allowed'
                    }`}
                  >
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-10 text-center text-white/20 font-bold uppercase tracking-widest text-xs">
          Nenhum registro pendente
        </div>
      )}
    </div>
  );
};
