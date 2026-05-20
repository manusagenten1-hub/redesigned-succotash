import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, Calendar as CalendarIcon, TrendingUp, Users, Target, Activity, Clock, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { getCurrentUser } from '../lib/auth';

type TimeFilter = 'hoje' | '7d' | '30d' | 'sempre' | 'personalizado';

export default function AdminDashboard() {
  const { members, sales, leads, agendaEvents } = useAppContext();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('hoje');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Helper to check if a date string falls within the current filter
  const isDateInFilter = (dateString: string) => {
    const d = new Date(dateString);
    if (timeFilter === 'sempre') return true;
    if (timeFilter === 'personalizado') {
      let valid = true;
      if (startDate) valid = valid && d >= new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        valid = valid && d <= end;
      }
      return valid;
    }
    
    const filterDate = new Date();
    if (timeFilter === 'hoje') {
      filterDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === '7d') {
      filterDate.setDate(filterDate.getDate() - 7);
    } else if (timeFilter === '30d') {
      filterDate.setDate(filterDate.getDate() - 30);
    }
    return d >= filterDate;
  };

  // Generate activities dynamically from other data to keep perfect sync
  const generatedActivities = useMemo(() => {
    const list: any[] = [];
    
    sales.forEach(s => {
      if (!s.createdBy) return;
      const member = members.find(m => m.id === s.createdBy);
      const memberName = member ? `${member.firstName} ${member.lastName}` : 'Usuário ' + s.createdBy;
      list.push({
        id: `sale_${s.id}`,
        type: 'ADD_SALE',
        memberId: s.createdBy,
        memberName,
        description: `${memberName} registrou uma venda para ${s.companyName} no valor de R$${(Number(s.price) || 0).toLocaleString('pt-BR')}`,
        date: s.date,
        value: Number(s.price) || 0
      });
    });

    leads.forEach(l => {
      if (!l.createdBy) return;
      const member = members.find(m => m.id === l.createdBy);
      const memberName = member ? `${member.firstName} ${member.lastName}` : 'Usuário ' + l.createdBy;
      list.push({
        id: `lead_${l.id}`,
        type: 'ADD_LEAD',
        memberId: l.createdBy,
        memberName,
        description: `${memberName} adicionou um novo lead: ${l.name}`,
        date: l.date
      });
    });

    agendaEvents.forEach(e => {
      if (!e.createdBy) return;
      const member = members.find(m => m.id === e.createdBy);
      const memberName = member ? `${member.firstName} ${member.lastName}` : 'Usuário ' + e.createdBy;
      list.push({
        id: `event_${e.id}`,
        type: 'ADD_EVENT',
        memberId: e.createdBy,
        memberName,
        description: `${memberName} marcou: ${e.title}`,
        date: e.date
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, leads, agendaEvents, members]);

  // Filter activities by date
  const filteredActivities = useMemo(() => {
    return generatedActivities.filter(a => isDateInFilter(a.date));
  }, [generatedActivities, timeFilter, startDate, endDate]);

  // Compute metrics per member
  const memberMetrics = useMemo(() => {
    const map = new Map<string, any>();
    
    members.forEach(m => {
      map.set(m.id, {
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        leads: 0,
        reunioes: 0,
        vendas: 0,
        totalVendido: 0,
        ultimaAtividade: null
      });
    });

    sales.forEach(s => {
      if (s.createdBy && isDateInFilter(s.date)) {
        if (!map.has(s.createdBy)) {
          map.set(s.createdBy, { id: s.createdBy, name: 'Usuário ' + s.createdBy, leads: 0, reunioes: 0, vendas: 0, totalVendido: 0, ultimaAtividade: null });
        }
        const stats = map.get(s.createdBy);
        stats.vendas += 1;
        stats.totalVendido += (Number(s.price) || 0) + (Number(s.mrr) || 0);
      }
    });

    leads.forEach(l => {
      if (l.createdBy && isDateInFilter(l.date)) {
        if (!map.has(l.createdBy)) {
          map.set(l.createdBy, { id: l.createdBy, name: 'Usuário ' + l.createdBy, leads: 0, reunioes: 0, vendas: 0, totalVendido: 0, ultimaAtividade: null });
        }
        map.get(l.createdBy).leads += 1;
      }
    });

    agendaEvents.forEach(e => {
      if (e.createdBy && e.type === 'Reunião' && isDateInFilter(e.date)) {
        if (!map.has(e.createdBy)) {
          map.set(e.createdBy, { id: e.createdBy, name: 'Usuário ' + e.createdBy, leads: 0, reunioes: 0, vendas: 0, totalVendido: 0, ultimaAtividade: null });
        }
        map.get(e.createdBy).reunioes += 1;
      }
    });

    // Update last activity ignoring time filter
    generatedActivities.forEach(a => {
      if (map.has(a.memberId)) {
        const stats = map.get(a.memberId);
        const aDate = new Date(a.date);
        if (!stats.ultimaAtividade || aDate > new Date(stats.ultimaAtividade)) {
          stats.ultimaAtividade = a.date;
        }
      }
    });

    return Array.from(map.values());
  }, [members, sales, leads, agendaEvents, generatedActivities, timeFilter, startDate, endDate]);

  // Compute Ranking
  const ranking = useMemo(() => {
    return [...memberMetrics].sort((a, b) => {
      if (b.totalVendido !== a.totalVendido) return b.totalVendido - a.totalVendido;
      return b.vendas - a.vendas;
    });
  }, [memberMetrics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-nexora-neon" />
            Gestão da Equipe
          </h1>
          <p className="text-gray-300">Painel administrativo do CEO. Monitore o desempenho e produtividade.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-[#0f1720] p-1 rounded-lg border border-white/10 items-center">
          <FilterButton active={timeFilter === 'hoje'} onClick={() => setTimeFilter('hoje')}>Hoje</FilterButton>
          <FilterButton active={timeFilter === '7d'} onClick={() => setTimeFilter('7d')}>7 Dias</FilterButton>
          <FilterButton active={timeFilter === '30d'} onClick={() => setTimeFilter('30d')}>30 Dias</FilterButton>
          <FilterButton active={timeFilter === 'sempre'} onClick={() => setTimeFilter('sempre')}>Sempre</FilterButton>
          <FilterButton active={timeFilter === 'personalizado'} onClick={() => setTimeFilter('personalizado')}>Personalizado</FilterButton>
        </div>
      </div>

      {timeFilter === 'personalizado' && (
        <div className="flex items-center gap-4 bg-[#0f1720] p-4 rounded-xl border border-white/10 animate-in fade-in">
          <div className="flex flex-col">
            <label className="text-xs text-gray-300 mb-1">Data Inicial</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#0f1722] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1">Data Final</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#0f1722] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RANKING SECTION */}
        <div className="lg:col-span-1 border border-white/10 bg-nexora-card rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 bg-white/10 flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Trophy className="text-yellow-500" size={18} />
              Ranking de Vendas
            </h2>
          </div>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {ranking.filter(r => r.vendas > 0 || r.totalVendido > 0).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Nenhuma venda registrada no período.</p>
            ) : (
              ranking.filter(r => r.vendas > 0 || r.totalVendido > 0).map((member, index) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    index === 0 ? "bg-yellow-500/30 text-yellow-500 border border-yellow-500/50" : 
                    index === 1 ? "bg-gray-300/20 text-gray-300 border border-gray-400/50" :
                    index === 2 ? "bg-orange-500/20 text-orange-500 border border-orange-500/50" : "bg-white/10 text-gray-400"
                  )}>
                    {index + 1}º
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.vendas} venda(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-nexora-neon font-bold">R$ {member.totalVendido.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY SECTION */}
        <div className="lg:col-span-2 border border-white/10 bg-nexora-card rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Activity className="text-blue-400" size={18} />
              Últimas Ações (Membros)
            </h2>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[300px]">
            {filteredActivities.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Nenhuma atividade no período.</p>
            ) : (
              filteredActivities.slice(0, 10).map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                  <div className="p-2 rounded-lg bg-white/5 mt-0.5">
                    {activity.type === 'ADD_LEAD' && <Target size={16} className="text-purple-400" />}
                    {activity.type === 'ADD_SALE' && <TrendingUp size={16} className="text-green-400" />}
                    {activity.type === 'ADD_EVENT' && <CalendarIcon size={16} className="text-blue-400" />}
                    {activity.type === 'OTHER' && <Clock size={16} className="text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* DETAILED STATS PER MEMBER */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Produtividade por Membro</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {memberMetrics.map(member => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-nexora-card border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-nexora-neon flex items-center justify-center font-bold text-white shadow-lg">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-white leading-tight">{member.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {member.ultimaAtividade 
                      ? new Date(member.ultimaAtividade).toLocaleDateString('pt-BR') 
                      : 'Sem atividade'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5"><Target size={14} className="text-purple-400"/> Leads Adicionados</span>
                  <span className="font-medium text-white">{member.leads}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5"><CalendarIcon size={14} className="text-blue-400"/> Reuniões Marcadas</span>
                  <span className="font-medium text-white">{member.reunioes}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                  <span className="text-gray-400 flex items-center gap-1.5"><TrendingUp size={14} className="text-green-400"/> Vendas Registradas</span>
                  <span className="font-medium text-white">{member.vendas}</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-gray-400">Receita Gerada</span>
                  <span className="font-bold text-nexora-neon">R$ {member.totalVendido.toLocaleString()}</span>
                </div>
                
                {member.leads > 0 && (
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2 px-1">
                    <span>Conversão (Venda/Lead)</span>
                    <span>{((member.vendas / member.leads) * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
        active 
          ? "bg-nexora-neon text-[#020024] shadow-md" 
          : "text-gray-300 hover:text-white hover:bg-white/5"
      )}
    >
      {children}
    </button>
  );
}
