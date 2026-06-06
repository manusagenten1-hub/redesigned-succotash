import React, { useState, useMemo } from 'react';
import { useAppContext, CalendarEvent, CalendarEventType, EventPriority, Lead } from '../context/AppContext';
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, ChevronDown, Plus, Trash2, CalendarClock, User, Briefcase, CalendarDays, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Agenda() {
  const { agendaEvents, updateAgendaEventStatus, deleteAgendaEvent, addAgendaEvent, leads, clients, members } = useAppContext();
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Filtering Logic ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  // Derived arrays
  const pendingEvents = agendaEvents.filter(e => e.status === 'Pendente');
  const completedEvents = agendaEvents.filter(e => e.status === 'Concluído');

  // Overdue logic
  const overdueEvents = pendingEvents.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate < new Date(); // Past right now
  });

  // Today Followups count
  const todayFollowUps = pendingEvents.filter(e => {
    const d = new Date(e.date);
    return e.type === 'Follow-up' && d >= today && d <= endOfDay;
  });

  // Events matching current view
  const visibleEvents = pendingEvents.filter(e => {
    const d = new Date(e.date);
    if (viewMode === 'dia') return d >= today && d <= endOfDay;
    if (viewMode === 'semana') return d >= startOfWeek && d <= endOfWeek;
    if (viewMode === 'mes') return d >= startOfMonth && d <= endOfMonth;
    return true;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Split view by overdue and upcoming if in 'dia' mode
  const overdueVisible = viewMode === 'dia' ? visibleEvents.filter(e => new Date(e.date) < new Date()) : [];
  const upcomingVisible = viewMode === 'dia' ? visibleEvents.filter(e => new Date(e.date) >= new Date()) : visibleEvents;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Agenda & Follow-up</h1>
          <p className="text-gray-300 mt-1">Organize seus compromissos e nunca perca um negócio.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-tecnova-primary to-tecnova-neon hover:opacity-90 text-white px-4 h-10 w-full sm:w-auto rounded-lg font-medium transition-all shadow-lg shadow-tecnova-neon/20 gap-2"
        >
          <Plus size={18} />
          <span>Novo Evento</span>
        </button>
      </div>

      {/* Alerts / Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#210606] border border-white/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-orange-500/30 text-amber-400 rounded-full">
            <CalendarClock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-300 font-medium uppercase tracking-wider">Follow-ups Hoje</p>
            <p className="text-2xl font-bold text-white leading-none mt-1">{todayFollowUps.length}</p>
          </div>
        </div>
        <div className="bg-[#210606] border border-white/10 rounded-xl p-5 flex items-center gap-4">
           <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Atrasados</p>
            <p className="text-2xl font-bold text-rose-400 leading-none mt-1">{overdueEvents.length}</p>
          </div>
        </div>
        <div className="bg-tecnova-card border border-white/5 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-400 rounded-full">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Concluídos</p>
            <p className="text-2xl font-bold text-white leading-none mt-1">{completedEvents.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-white/10 mt-6">
        <button 
          onClick={() => setViewMode('dia')}
          className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors", viewMode === 'dia' ? "border-tecnova-neon text-tecnova-neon" : "border-transparent text-gray-300 hover:text-white")}
        >
          Hoje
        </button>
        <button 
          onClick={() => setViewMode('semana')}
          className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors", viewMode === 'semana' ? "border-tecnova-neon text-tecnova-neon" : "border-transparent text-gray-400 hover:text-white")}
        >
          Esta Semana
        </button>
        <button 
          onClick={() => setViewMode('mes')}
          className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors", viewMode === 'mes' ? "border-tecnova-neon text-tecnova-neon" : "border-transparent text-gray-400 hover:text-white")}
        >
          Este Mês
        </button>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-6">
        
        {viewMode === 'dia' && overdueVisible.length > 0 && (
          <div className="space-y-3">
             <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2">
               <AlertCircle size={16} /> Pendentes & Atrasados
             </h3>
             {overdueVisible.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}

        <div className="space-y-3">
          {viewMode === 'dia' && overdueVisible.length > 0 && upcomingVisible.length > 0 && (
            <h3 className="text-sm font-semibold text-gray-300 mt-6">Próximos Hoje</h3>
          )}
          {upcomingVisible.length === 0 && overdueVisible.length === 0 ? (
             <div className="bg-tecnova-card border border-white/5 rounded-2xl p-12 text-center text-gray-400">
               Nenhum evento agendado para este período.
             </div>
          ) : (
             upcomingVisible.map(e => <EventCard key={e.id} event={e} />)
          )}
        </div>

      </div>

      {isModalOpen && <AddEventModal onClose={() => setIsModalOpen(false)} onAdd={addAgendaEvent} />}
    </div>
  );
}

// -------------------------------------------------------------
// EVENT CARD
// -------------------------------------------------------------
const EventCard: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const { updateAgendaEventStatus, deleteAgendaEvent, leads, clients, members } = useAppContext();

  
  const lead = event.leadId ? leads.find(l => l.id === event.leadId) : null;
  const client = event.clientId ? clients.find(c => c.id === event.clientId) : null;
  const member = event.memberId ? members.find(m => m.id === event.memberId) : null;

  const dateObj = new Date(event.date);
  const isOverdue = dateObj < new Date() && event.status === 'Pendente';
  
  const timeFormatted = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  let typeColors = "bg-white/10 text-gray-300 border-white/10";
  let icon = <CalendarDays size={16} />;
  
  if (event.type === 'Reunião') {
    typeColors = "bg-red-500/10 text-red-400 border-red-500/20";
    icon = <Briefcase size={16} />;
  } else if (event.type === 'Follow-up') {
    typeColors = "bg-orange-500/10 text-amber-400 border-orange-500/20";
    icon = <CalendarClock size={16} />;
  } else if (event.type === 'Tarefa interna') {
    typeColors = "bg-rose-500/10 text-purple-400 border-rose-500/20";
    icon = <CheckCircle2 size={16} />;
  }

  return (
    <div className={cn(
      "bg-tecnova-card border rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center relative group transition-colors",
      isOverdue ? "border-rose-500/30" : "border-white/5 hover:border-white/10"
    )}>
      {/* Time column */}
      <div className="flex items-center sm:flex-col sm:justify-center sm:items-end sm:min-w-[70px] shrink-0">
        <div className={cn("text-lg font-bold", isOverdue ? "text-rose-400" : "text-white")}>{timeFormatted}</div>
        <div className="text-xs text-gray-400 ml-2 sm:ml-0">{dateFormatted}</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full border-l border-white/5 pl-4 sm:pl-6 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider border", typeColors)}>
            {icon} {event.type}
          </span>
          {event.priority && event.type === 'Follow-up' && (
            <span className={cn(
              "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider border",
              event.priority === 'Alta' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : 
              event.priority === 'Média' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : 
              "bg-gray-500/10 text-gray-400 border-gray-500/20"
            )}>
              Prioridade {event.priority}
            </span>
          )}
          {isOverdue && (
            <span className="text-[10px] font-medium uppercase text-rose-500 px-2 py-1 bg-rose-500/10 rounded-md">Atrasado</span>
          )}
        </div>
        
        <h4 className="text-base font-semibold text-white">{event.title}</h4>
        
        {/* Relations */}
        {(lead || client || member || event.description) && (
          <div className="text-sm text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
            {lead && (
              <span className="flex items-center gap-1.5"><TargetIcon /> Lead: {lead.companyName || lead.name}</span>
            )}
            {client && (
              <span className="flex items-center gap-1.5"><Briefcase size={14} /> Cliente: {client.companyName}</span>
            )}
            {member && (
              <span className="flex items-center gap-1.5"><User size={14} /> Resp: {member.firstName}</span>
            )}
            {event.description && (
              <span className="w-full text-gray-500 text-xs mt-1">{event.description}</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-2 w-full sm:w-auto justify-end mt-4 sm:mt-0">
         <button 
           onClick={() => updateAgendaEventStatus(event.id, 'Concluído')}
           className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-md text-xs font-medium transition-colors"
         >
           <Check size={16} /> Concluir
         </button>
         <button 
           onClick={() => deleteAgendaEvent(event.id)}
           className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-500/20 rounded-md transition-colors"
           title="Excluir evento"
         >
           <Trash2 size={16} />
         </button>
      </div>
    </div>
  );
}

function TargetIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  )
}

// -------------------------------------------------------------
// ADD MODAL
// -------------------------------------------------------------
function AddEventModal({ onClose, onAdd }: { onClose: () => void, onAdd: (data: Omit<CalendarEvent, 'id' | 'status'>) => void }) {
  const { leads, clients, members } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEventType>('Follow-up');
  
  // Format localized date to match datetime-local expected format "YYYY-MM-DDThh:mm"
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const [date, setDate] = useState(now.toISOString().slice(0, 16));
  
  const [leadId, setLeadId] = useState('');
  const [clientId, setClientId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [priority, setPriority] = useState<EventPriority>('Média');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    onAdd({
      title,
      type,
      date: new Date(date).toISOString(),
      leadId: leadId || undefined,
      clientId: clientId || undefined,
      memberId: memberId || undefined,
      priority: type === 'Follow-up' ? priority : undefined,
      description
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 md:p-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#210606] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        <div className="p-6 border-b border-white/5 flex flex-col pt-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><CalendarIcon size={20} /> Agendar Evento</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Título do Evento <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tecnova-neon"
              placeholder="Ex: Reunião de Apresentação"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-xs font-medium text-gray-400">Tipo de Evento <span className="text-red-400">*</span></label>
               <select 
                 value={type}
                 onChange={(e) => setType(e.target.value as CalendarEventType)}
                 className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tecnova-neon appearance-none"
               >
                 <option className="bg-[#210606] text-white" value="Follow-up">Follow-up</option>
                 <option className="bg-[#210606] text-white" value="Reunião">Reunião</option>
                 <option className="bg-[#210606] text-white" value="Tarefa interna">Tarefa Interna</option>
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-xs font-medium text-gray-400">Data e Hora <span className="text-red-400">*</span></label>
               <input 
                 type="datetime-local" 
                 required
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
                 className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tecnova-neon"
               />
            </div>
          </div>

          {type === 'Follow-up' && (
             <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Prioridade</label>
                <div className="flex gap-2">
                   {['Baixa', 'Média', 'Alta'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p as EventPriority)}
                        className={cn(
                          "flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors",
                          priority === p 
                            ? "bg-white/10 text-white border-white/20" 
                            : "bg-transparent text-gray-400 border-white/5 hover:border-white/10"
                        )}
                      >
                        {p}
                      </button>
                   ))}
                </div>
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-gray-400">Vincular Lead (Opcional)</label>
               <SearchableLeadSelect leads={leads} value={leadId} onChange={setLeadId} />
             </div>
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-gray-400">Vincular Cliente (Opcional)</label>
               <select 
                 value={clientId}
                 onChange={(e) => setClientId(e.target.value)}
                 className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tecnova-neon appearance-none"
               >
                 <option className="bg-[#210606] text-white" value="">Nenhum cliente...</option>
                 {clients.map(c => <option className="bg-[#210606] text-white" key={c.id} value={c.id}>{c.companyName}</option>)}
               </select>
             </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-xs font-medium text-gray-400">Responsável (Membro da Equipe)</label>
             <select 
               value={memberId}
               onChange={(e) => setMemberId(e.target.value)}
               className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tecnova-neon appearance-none"
             >
               <option className="bg-[#210606] text-white" value="">Você (Sem atribuição específica)</option>
               {members.map(m => <option className="bg-[#210606] text-white" key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
             </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Descrição / Notas</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tecnova-neon min-h-[60px]"
              placeholder="Assunto da reunião, link da call, anotações..."
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
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-tecnova-neon hover:opacity-90 transition-opacity"
            >
              Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// SEARCHABLE LEAD SELECT
// -------------------------------------------------------------
function SearchableLeadSelect({ leads, value, onChange }: { leads: Lead[], value: string, onChange: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = leads.filter(l => {
     const text = `${l.companyName || ''} ${l.name || ''}`.toLowerCase();
     return text.includes(search.toLowerCase());
  });
  
  const selectedLead = leads.find(l => l.id === value);

  return (
    <div className="relative">
      <div 
         onClick={() => setIsOpen(!isOpen)}
         className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white flex justify-between items-center cursor-pointer min-h-[38px]"
      >
        <span className="truncate pr-2">
          {selectedLead ? (selectedLead.companyName || selectedLead.name) : 'Nenhum lead...'}
        </span>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 top-full mt-1 left-0 w-full bg-[#0a0a0a] border border-white/10 rounded-lg shadow-xl overflow-hidden max-h-48 flex flex-col">
          <input 
            type="text"
            placeholder="Buscar empresa ou lead..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-b border-white/10 p-2 text-sm text-white focus:outline-none"
            onClick={e => e.stopPropagation()}
            autoFocus
          />
          <div className="overflow-y-auto flex-1 p-1">
             <div 
               className="p-2 text-sm text-gray-400 hover:bg-white/5 cursor-pointer rounded-md"
               onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
             >
               Nenhum lead...
             </div>
             {filtered.map(l => (
               <div 
                 key={l.id}
                 className="p-2 text-sm text-white hover:bg-white/5 cursor-pointer rounded-md truncate"
                 onClick={() => { onChange(l.id); setIsOpen(false); setSearch(''); }}
               >
                 {l.companyName || l.name}
               </div>
             ))}
             {filtered.length === 0 && (
               <div className="p-2 text-sm text-gray-500 text-center">Nenhum encontrado</div>
             )}
          </div>
        </div>
      )}
      {/* Invisible backdrop to close on click outside */}
      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}
