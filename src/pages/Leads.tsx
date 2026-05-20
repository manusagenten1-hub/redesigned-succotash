import React, { useState, useMemo } from 'react';
import { useAppContext, Lead, LeadStatus, CalendarEvent } from '../context/AppContext';
import { 
  Plus, Search, SearchX, MessageCircle, CalendarClock, Briefcase, 
  CheckCircle2, XCircle, AlertCircle, Clock, CalendarDays, 
  Flame, Edit3, Trash2, Building, ChevronDown, Filter 
} from 'lucide-react';
import { cn } from '../lib/utils';

const LEAD_STATUSES: LeadStatus[] = [
  'Novo Lead', 'Contato Iniciado', 'Reunião Marcada', 
  'Proposta Enviada', 'Negociação', 'Fechado', 'Perdido'
];

const PREDEFINED_SOURCES = ['Tráfego pago', 'Instagram', 'Tik Tok', 'Prospecção', 'Indicação', 'Outro'];

// Color mapping for statuses
const STATUS_COLORS: Record<LeadStatus, { bg: string, text: string, border: string }> = {
  'Novo Lead': { bg: 'bg-blue-500/30', text: 'text-blue-400', border: 'border-blue-500/20' },
  'Contato Iniciado': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  'Reunião Marcada': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  'Proposta Enviada': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  'Negociação': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  'Fechado': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  'Perdido': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' }
};

export default function Leads() {
  const { leads, updateLead, deleteLead, addLead, agendaEvents, members } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'Todos'>('Todos');
  const [quickFilter, setQuickFilter] = useState<'Todos' | 'Sem Resposta' | 'Sem Follow-up' | 'Quentes'>('Todos');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const openAddModal = () => {
    setLeadToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsModalOpen(true);
  };

  const formatWhatsAppLink = (phone: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean && clean.length <= 11) {
      clean = `55${clean}`;
    }
    return `https://wa.me/${clean}`;
  };

  // Quick Action Handlers
  const handleAction = (lead: Lead, action: 'contact' | 'meeting' | 'negotiate' | 'won' | 'lost') => {
    if (action === 'contact') {
      updateLead(lead.id, { status: 'Contato Iniciado' });
      window.open(formatWhatsAppLink(lead.whatsapp), '_blank');
    } else if (action === 'meeting') {
      updateLead(lead.id, { status: 'Reunião Marcada' });
    } else if (action === 'negotiate') {
      updateLead(lead.id, { status: 'Negociação' });
    } else if (action === 'won') {
      updateLead(lead.id, { status: 'Fechado' });
    } else if (action === 'lost') {
      updateLead(lead.id, { status: 'Perdido' });
    }
  };

  // Enrichment & Filtering
  const enrichedLeads = useMemo(() => {
    const now = new Date();
    
    return leads.map(lead => {
      const leadEvents = agendaEvents.filter(e => e.leadId === lead.id);
      
      const pastEvents = leadEvents
        .filter(e => new Date(e.date) <= now || e.status === 'Concluído')
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
      const futureEvents = leadEvents
        .filter(e => new Date(e.date) > now && e.status === 'Pendente')
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const lastInteractionDate = pastEvents.length > 0 ? new Date(pastEvents[0].date) : new Date(lead.date);
      const nextAction = futureEvents.length > 0 ? futureEvents[0] : null;
      
      const daysSinceLastInteraction = Math.floor((now.getTime() - lastInteractionDate.getTime()) / (1000 * 3600 * 24));
      
      const isHot = lead.status === 'Negociação' || lead.status === 'Proposta Enviada';
      const noResponse = lead.status === 'Contato Iniciado' && daysSinceLastInteraction > 3;
      const needsFollowUp = ['Novo Lead', 'Contato Iniciado', 'Negociação', 'Proposta Enviada'].includes(lead.status) && daysSinceLastInteraction > 5 && !nextAction;

      const owner = members.find(m => m.id === lead.createdBy);

      return {
        ...lead,
        lastInteractionDate,
        daysSinceLastInteraction,
        nextAction,
        isHot,
        noResponse,
        needsFollowUp,
        ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Desconhecido'
      };
    }).sort((a, b) => b.lastInteractionDate.getTime() - a.lastInteractionDate.getTime());
  }, [leads, agendaEvents, members]);

  const filteredLeads = enrichedLeads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (l.companyName && l.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          l.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || l.status === statusFilter;
    
    let matchesQuick = true;
    if (quickFilter === 'Sem Resposta') matchesQuick = l.noResponse;
    else if (quickFilter === 'Sem Follow-up') matchesQuick = l.needsFollowUp;
    else if (quickFilter === 'Quentes') matchesQuick = l.isHot;

    return matchesSearch && matchesStatus && matchesQuick;
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Funil de Leads</h1>
          <p className="text-gray-300 mt-1">Gestão rápida e automatizada de contatos.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-300" />
            </div>
            <input
              type="text"
              placeholder="Buscar lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0f1720] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-nexora-neon hover:opacity-90 text-white px-4 h-10 rounded-lg font-medium transition-all shadow-lg shadow-nexora-neon/20 gap-2"
          >
            <Plus size={18} />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[#0f1720] p-3 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium px-2">
          <Filter size={16} /> Filtros:
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-[#0f1721] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-nexora-neon appearance-none min-w-[150px]"
        >
          <option value="Todos">Todos os Status</option>
          {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="h-6 w-px bg-white/10 hidden sm:block mx-1"></div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setQuickFilter('Todos')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border", quickFilter === 'Todos' ? "bg-white/10 text-white border-white/20" : "bg-transparent text-gray-400 border-white/10 hover:bg-white/10")}
          >
            Todos
          </button>
          <button 
            onClick={() => setQuickFilter('Sem Resposta')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5", quickFilter === 'Sem Resposta' ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-transparent text-gray-400 border-white/5 hover:bg-white/5")}
          >
            <MessageCircle size={14} /> Sem Resposta
          </button>
          <button 
            onClick={() => setQuickFilter('Sem Follow-up')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5", quickFilter === 'Sem Follow-up' ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-transparent text-gray-400 border-white/5 hover:bg-white/5")}
          >
            <Clock size={14} /> Faltando Follow-up
          </button>
          <button 
            onClick={() => setQuickFilter('Quentes')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5", quickFilter === 'Quentes' ? "bg-orange-500/20 text-orange-300 border-orange-500/30" : "bg-transparent text-gray-400 border-white/5 hover:bg-white/5")}
          >
            <Flame size={14} /> Quentes
          </button>
        </div>
      </div>

      {/* List View */}
      <div className="bg-nexora-card border border-white/5 rounded-2xl shadow-lg flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-wider font-bold text-gray-200">
                <th className="p-4 font-medium w-[25%]">Lead & Empresa</th>
                <th className="p-4 font-medium w-[15%]">Status Atual</th>
                <th className="p-4 font-medium w-[20%]">Interações</th>
                <th className="p-4 font-medium w-[15%]">Responsável</th>
                <th className="p-4 font-medium w-[25%] text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <SearchX size={48} className="text-gray-400 mb-3" />
                      <p className="text-base font-medium text-gray-400">Nenhum lead encontrado com estes filtros.</p>
                      <button onClick={() => { setStatusFilter('Todos'); setQuickFilter('Todos'); setSearchTerm(''); }} className="mt-3 text-nexora-neon hover:underline text-sm">
                        Limpar Filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  const colorObj = STATUS_COLORS[lead.status];
                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.04] transition-colors group">
                      <td className="p-4">
                        <div className="flex flex-col items-start">
                          <div className="font-bold text-white flex items-center gap-2">
                            {lead.name}
                            {lead.isHot && <Flame size={14} className="text-orange-500" title="Lead Quente" />}
                            {lead.needsFollowUp && <AlertCircle size={14} className="text-red-400" title="Precisando de Follow-up" />}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                            <Building size={12} className="opacity-70" />
                            <span className="truncate max-w-[150px]">{lead.companyName || 'Empresa não informada'}</span>
                            <span className="opacity-50 mx-1">•</span>
                            <span className="truncate">{lead.source}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border", colorObj.bg, colorObj.text, colorObj.border)}>
                          {lead.status}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Clock size={13} className="opacity-60" />
                            <span>
                              Última: {lead.daysSinceLastInteraction === 0 ? 'Hoje' : `${lead.daysSinceLastInteraction}d atrás`}
                            </span>
                          </div>
                          {lead.nextAction ? (
                            <div className="flex items-center gap-1.5 text-nexora-neon">
                              <CalendarDays size={13} className="opacity-80" />
                              <span className="truncate max-w-[150px]">{lead.nextAction.title}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <CalendarDays size={13} className="opacity-40" />
                              <span>Sem próxima ação</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-gray-300 text-sm">
                        {lead.ownerName}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Quick Actions Bar */}
                          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/5 mr-2">
                            <button 
                              onClick={() => handleAction(lead, 'contact')}
                              className="p-1.5 text-gray-400 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-md transition-colors"
                              title="Iniciar Contato (WhatsApp)"
                            >
                              <MessageCircle size={16} />
                            </button>
                            <button 
                              onClick={() => handleAction(lead, 'meeting')}
                              className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-colors"
                              title="Marcar Reunião"
                            >
                              <CalendarClock size={16} />
                            </button>
                            <button 
                              onClick={() => handleAction(lead, 'negotiate')}
                              className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors"
                              title="Em Negociação"
                            >
                              <Briefcase size={16} />
                            </button>
                            <button 
                              onClick={() => handleAction(lead, 'won')}
                              className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-md transition-colors"
                              title="Fechar Venda"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleAction(lead, 'lost')}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                              title="Marcar como Perdido"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>

                          <button 
                            onClick={() => openEditModal(lead)}
                            className="p-1.5 text-gray-300 hover:text-white rounded-md transition-colors"
                            title="Editar Dados"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteLead(lead.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 rounded-md transition-colors"
                            title="Excluir"
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

      {isModalOpen && (
        <LeadModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={(data) => {
            if (leadToEdit) updateLead(leadToEdit.id, data);
            else addLead(data);
          }}
          initialData={leadToEdit}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// ADD / EDIT MODAL
// -------------------------------------------------------------
function LeadModal({ onClose, onSave, initialData }: { onClose: () => void, onSave: (data: Omit<Lead, 'id'|'date'|'createdBy'>) => void, initialData?: Lead | null }) {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name || '');
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || '');
  const [source, setSource] = useState(initialData?.source || PREDEFINED_SOURCES[0]);
  const [status, setStatus] = useState<LeadStatus>(initialData?.status || 'Novo Lead');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp) return;
    onSave({ name, companyName, whatsapp, source, status, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 md:p-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f1721] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex flex-col pt-8">
          <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Lead' : 'Adicionar Novo Lead'}</h2>
          <p className="text-sm text-gray-400 mt-1">Preencha os dados do potencial cliente.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Nome do Lead <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
                placeholder="Ex: Carlos Oliveira"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Empresa (Opcional)</label>
              <input 
                type="text" 
                value={companyName} 
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
                placeholder="Ex: Carlos LTDA"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">WhatsApp <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              required 
              value={whatsapp} 
              onChange={e => setWhatsapp(e.target.value)}
              className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Origem</label>
              <select 
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon appearance-none"
              >
                {PREDEFINED_SOURCES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Fase no Funil</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value as LeadStatus)}
                className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon appearance-none"
              >
                {LEAD_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Observações</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon min-h-[80px]"
              placeholder="Detalhes ou histórico do lead..."
            />
          </div>

          <div className="pt-4 mt-2 border-t border-white/5 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-nexora-neon hover:opacity-90 transition-opacity"
            >
              Salvar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
