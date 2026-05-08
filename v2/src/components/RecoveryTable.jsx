import React from 'react';
import { Phone, User, ExternalLink } from 'lucide-react';

export const RecoveryTable = ({ title, data, type = "checkout" }) => {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="text-white/80 text-lg font-semibold">{title}</h3>
        <span className="bg-brand-gold-muted text-brand-gold text-xs px-3 py-1 rounded-full font-bold">
          {data.length} Pendentes
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Lead / Cliente</th>
              <th className="px-6 py-4 font-medium">Contato</th>
              <th className="px-6 py-4 font-medium text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                      <User size={16} />
                    </div>
                    <span className="text-white font-medium">{row.NOME}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Phone size={14} className="text-brand-gold" />
                    {row.TELEFONE || "Sem número"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-brand-gold opacity-40 group-hover:opacity-100 hover:scale-110 transition-all">
                    <ExternalLink size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
