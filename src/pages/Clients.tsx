import React, { useState } from 'react';
import { useAppContext, Client, ClientStatus } from '../context/AppContext';
import { Search, ExternalLink, MessageCircle, MoreVertical, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Clients() {
  const { clients, updateClientStatus, deleteClient } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Ativo' | 'Cancelado'>('All');

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const formatSec = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatWhatsAppLink = (phone: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean && clean.length <= 11) {
      clean = `55${clean}`;
    }
    return `https://wa.me/${clean}`;
  };

  const toggleStatus = (client: Client) => {
    const newStatus: ClientStatus = client.status === 'Ativo' ? 'Cancelado' : 'Ativo';
    updateClientStatus(client.id, newStatus);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Clientes Ativos</h1>
          <p className="text-gray-300 mt-1">Gestão de contratos e carteira de clientes.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-300" />
            </div>
            <input
              type="text"
              placeholder="Buscar cliente ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0f1720] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg border border-white/10">
            {['All', 'Ativo', 'Cancelado'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer", 
                  filter === f ? "bg-white/10 text-white" : "text-gray-300 hover:text-white"
                )}
              >
                {f === 'All' ? 'Todos' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0f1720] border border-white/10 rounded-2xl shadow-lg overflow-hidden flex-1">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider font-bold text-gray-200">
                <th className="p-4 font-medium">Cliente & Empresa</th>
                <th className="p-4 font-medium">Serviço & Status</th>
                <th className="p-4 font-medium">Financeiro</th>
                <th className="p-4 font-medium">Links Rápidos</th>
                <th className="p-4 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                   const isActive = client.status === 'Ativo';

                  return (
                    <tr key={client.id} className={cn("hover:bg-white/[0.04] transition-colors group", !isActive && "opacity-60")}>
                      <td className="p-4">
                        <div className="font-bold text-white">{client.companyName}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{client.ownerName}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-300 mb-1">{client.category}</div>
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider border", 
                            isActive ? "bg-green-500/30 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                          )}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-300 text-xs">Imp: <span className="text-white">{formatSec(client.price)}</span></div>
                        {client.mrr > 0 ? (
                          <div className="text-nexora-neon font-medium text-xs flex mt-0.5 items-center gap-1">
                             MRR: {formatSec(client.mrr)} <span className="text-[10px] text-gray-400 font-normal">/mês</span>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-[10px] mt-0.5">Sem recorrência</div>
                        )}
                        <div className="text-gray-500 text-[10px] mt-1.5">Início: {new Date(client.date).toLocaleDateString('pt-BR')}</div>
                      </td>
                      <td className="p-4 flex flex-col gap-2">
                         <a
                            href={formatWhatsAppLink(client.whatsapp)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit items-center gap-1.5 text-xs text-gray-400 hover:text-[#25D366] transition-colors"
                          >
                            <MessageCircle size={14} /> WhatsApp
                          </a>
                          <a 
                            href={client.siteUrl.startsWith('http') ? client.siteUrl : `https://${client.siteUrl}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex w-fit items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <ExternalLink size={14} /> Site
                          </a>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toggleStatus(client)}
                            className={cn(
                              "px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 w-[110px]",
                              isActive ? "hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-gray-300" : "hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20 text-gray-300"
                            )}
                          >
                            {isActive ? <><XCircle size={14}/> Cancelar</> : <><CheckCircle2 size={14}/> Reativar</>}
                          </button>
                          <button 
                            onClick={() => deleteClient(client.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                            title="Excluir contrato"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
