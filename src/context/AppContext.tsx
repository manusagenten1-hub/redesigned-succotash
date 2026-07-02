import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';

export type ServiceCategory = 'Sistema Digital Completo' | 'Página de Vendas' | 'Página de Captura' | 'Otimização & Redesign' | 'Tráfego Pago';
export type ExpenseCategory = 'Ferramentas' | 'Infraestrutura' | 'Marketing' | 'Operacional' | 'Outros';
export type ExpenseType = 'Única' | 'Recorrente';
export type LeadStatus = 'Novo Lead' | 'Contato Iniciado' | 'Reunião Marcada' | 'Proposta Enviada' | 'Negociação' | 'Fechado' | 'Perdido';
export type ClientStatus = 'Ativo' | 'Cancelado';
export type CalendarEventType = 'Reunião' | 'Follow-up' | 'Tarefa interna';
export type EventPriority = 'Baixa' | 'Média' | 'Alta';
export type EventStatus = 'Pendente' | 'Concluído';

export interface ActivityLog { id: string; type: 'ADD_LEAD' | 'ADD_EVENT' | 'ADD_SALE' | 'ADD_CLIENT' | 'OTHER'; memberId: string; memberName: string; description: string; date: string; value?: number; }
export interface Commission { id: string; memberId: string; saleId: string; type: 'Fechamento' | 'Indicação'; saleValue: number; commissionValue: number; date: string; status: 'Pendente' | 'Pago'; isRecurring: boolean; }
export interface Sale { id: string; leadId?: string; category: ServiceCategory; businessType: string; companyName: string; ownerName: string; whatsapp: string; siteUrl: string; price: number; mrr: number; date: string; responsibleId?: string; indicatorId?: string; createdBy?: string; }
export interface Client { id: string; saleId: string; leadId?: string; companyName: string; ownerName: string; whatsapp: string; siteUrl: string; category: ServiceCategory; price: number; mrr: number; date: string; status: ClientStatus; createdBy?: string; }
export interface Member { id: string; firstName: string; lastName: string; roles: string[]; photoUrl: string; isPinned: boolean; token?: string; }
export interface CalendarEvent { id: string; title: string; type: CalendarEventType; date: string; leadId?: string; clientId?: string; memberId?: string; description?: string; priority?: EventPriority; status: EventStatus; createdBy?: string; }
export interface Expense { id: string; name: string; amount: number; category: ExpenseCategory; description?: string; date: string; type: ExpenseType; isActive: boolean; createdBy?: string; }
export type GoalType = 'Vendas' | 'Faturamento';
export type GoalPeriod = 'Semanal' | 'Mensal';
export type LeadSegment = 'Clínicas' | 'Escritórios de Advocacia' | 'Escritórios de Contabilidade' | 'Deliveries' | 'Barbearias' | 'Salões' | 'Imobiliárias' | 'Academias' | 'Construtoras' | 'Restaurantes' | 'Lojas e Varejo' | 'B2B' | 'Outro';
export interface Goal { id: string; type: GoalType; period: GoalPeriod; amount: number; date: string; }
export interface AchievedGoal { id: string; goalId: string; goalType: GoalType; goalPeriod: GoalPeriod; amount: number; date: string; rewardText?: string; periodKey: string; status: 'Batida' | 'Não Batida'; }
export interface Lead { id: string; name: string; companyName?: string; whatsapp: string; source: string; status: LeadStatus; segment?: LeadSegment; notes?: string; date: string; createdBy?: string; }

interface AppContextType {
  isLoaded: boolean;
  sales: Sale[]; addSale: (s: Omit<Sale, 'id' | 'date' | 'createdBy'>, c?: Omit<Commission, 'id' | 'date' | 'status' | 'saleId'>[]) => void; deleteSale: (id: string) => void;
  members: Member[]; addMember: (m: Omit<Member, 'id' | 'token'>) => Member; updateMember: (id: string, u: Partial<Omit<Member, 'id'>>) => void; togglePinMember: (id: string) => void; deleteMember: (id: string) => void;
  expenses: Expense[]; addExpense: (e: Omit<Expense, 'id' | 'date' | 'createdBy'>) => void; toggleExpenseStatus: (id: string) => void; deleteExpense: (id: string) => void;
  leads: Lead[]; addLead: (l: Omit<Lead, 'id' | 'date' | 'createdBy'>) => void; addMultipleLeads: (lDataList: Omit<Lead, 'id' | 'date' | 'createdBy'>[]) => Promise<void>; updateLead: (id: string, u: Partial<Omit<Lead, 'id' | 'date' | 'createdBy'>>) => void; deleteLead: (id: string) => void;
  clients: Client[]; updateClientStatus: (id: string, s: ClientStatus) => void; deleteClient: (id: string) => void;
  agendaEvents: CalendarEvent[]; addAgendaEvent: (e: Omit<CalendarEvent, 'id' | 'status' | 'createdBy'>) => void; updateAgendaEventStatus: (id: string, s: EventStatus) => void; deleteAgendaEvent: (id: string) => void;
  commissions: Commission[]; addCommission: (c: Omit<Commission, 'id' | 'date' | 'status'>) => void; updateCommissionStatus: (id: string, s: 'Pendente' | 'Pago') => void; deleteCommission: (id: string) => void;
  activities: ActivityLog[]; logActivity: (a: Omit<ActivityLog, 'id' | 'date' | 'memberId' | 'memberName'>) => void;
  goals: Goal[]; addGoal: (g: Omit<Goal, 'id' | 'date'>) => void; deleteGoal: (id: string) => void;
  achievedGoals: AchievedGoal[]; deleteAchievedGoal: (id: string) => void; unlockedReward: AchievedGoal | null; setUnlockedReward: React.Dispatch<React.SetStateAction<AchievedGoal | null>>; dismissReward: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialMembers: Member[] = [{ id: 'm1', firstName: 'Lucas', lastName: 'Francisco', roles: ['CEO', 'Desenvolvedor Full Stack'], photoUrl: 'https://i.pravatar.cc/150?u=lucas', isPinned: true, token: '12131415-2026.CEO-01' }];
export const REWARDS = ['Rodízio de pizza', 'Hambúrguer artesanal', 'Sushi night', 'Cinema juntos', 'Churrasco simples', 'Café + reunião descontraída', 'Noite de jogos/resenha', 'Passeio em grupo', 'Sessão de filmes/séries', 'Pedir comida e trabalhar ouvindo música', 'Dia de descanso total', 'Meio período livre', 'Final de semana sem trabalho', 'Dia sem reuniões', 'Dia focado apenas em ideias leves', 'Upgrade em equipamento', 'Investimento em ferramenta nova', 'Comprar plugin/ferramenta premium', 'Pequeno orçamento para tráfego pago', 'Guardar lucro para objetivo maior da agência'];

// Mappers
const parseRoles = (r: any) => {
  if (Array.isArray(r)) return r;
  if (typeof r === 'string') return r.replace(/^{|}$/g, '').split(',').map(s => s.replace(/(^"|"$)/g, '').trim());
  return ['Membro'];
};
const mTo = (m: Member) => ({ id: m.id, first_name: m.firstName, last_name: m.lastName, roles: m.roles, photo_url: m.photoUrl, is_pinned: m.isPinned, token: m.token });
const mFr = (m: any): Member => ({ id: m.id, firstName: m.first_name || '', lastName: m.last_name || '', roles: parseRoles(m.roles), photoUrl: m.photo_url || '', isPinned: m.is_pinned || false, token: m.token });
const lTo=(l: Lead)=>({ id: l.id, name: l.name, company_name: l.companyName, whatsapp: l.whatsapp, source: l.source, status: l.status, segment: l.segment, notes: l.notes, date: l.date, created_by: l.createdBy });
const lFr=(l: any): Lead=>({ id: l.id, name: l.name, companyName: l.company_name, whatsapp: l.whatsapp, source: l.source, status: l.status, segment: l.segment, notes: l.notes, date: l.date, createdBy: l.created_by });
const sTo=(s: Sale)=>({ id: s.id, lead_id: s.leadId, category: s.category, business_type: s.businessType, company_name: s.companyName, owner_name: s.ownerName, whatsapp: s.whatsapp, site_url: s.siteUrl, price: s.price, mrr: s.mrr, date: s.date, responsible_id: s.responsibleId, indicator_id: s.indicatorId, created_by: s.createdBy });
const sFr=(s: any): Sale=>({ id: s.id, leadId: s.lead_id, category: s.category, businessType: s.business_type, companyName: s.company_name, ownerName: s.owner_name, whatsapp: s.whatsapp, siteUrl: s.site_url, price: s.price, mrr: s.mrr, date: s.date, responsibleId: s.responsible_id, indicatorId: s.indicator_id, createdBy: s.created_by });
const cTo=(c: Client)=>({ id: c.id, sale_id: c.saleId, lead_id: c.leadId, company_name: c.companyName, owner_name: c.ownerName, whatsapp: c.whatsapp, site_url: c.siteUrl, category: c.category, price: c.price, mrr: c.mrr, date: c.date, status: c.status, created_by: c.createdBy });
const cFr=(c: any): Client=>({ id: c.id, saleId: c.sale_id, leadId: c.lead_id, companyName: c.company_name, ownerName: c.owner_name, whatsapp: c.whatsapp, siteUrl: c.site_url, category: c.category, price: c.price, mrr: c.mrr, date: c.date, status: c.status, createdBy: c.created_by });
const coTo=(c: Commission)=>({ id: c.id, member_id: c.memberId, sale_id: c.saleId, type: c.type, sale_value: c.saleValue, commission_value: c.commissionValue, date: c.date, status: c.status, is_recurring: c.isRecurring });
const coFr=(c: any): Commission=>({ id: c.id, memberId: c.member_id, saleId: c.sale_id, type: c.type, saleValue: c.sale_value, commissionValue: c.commission_value, date: c.date, status: c.status, isRecurring: c.is_recurring });
const eTo=(e: CalendarEvent)=>({ id: e.id, title: e.title, type: e.type, date: e.date, lead_id: e.leadId, client_id: e.clientId, member_id: e.memberId, description: e.description, priority: e.priority, status: e.status, created_by: e.createdBy });
const eFr=(e: any): CalendarEvent=>({ id: e.id, title: e.title, type: e.type, date: e.date, leadId: e.lead_id, clientId: e.client_id, memberId: e.member_id, description: e.description, priority: e.priority, status: e.status, createdBy: e.created_by });
const exTo=(e: Expense)=>({ id: e.id, name: e.name, amount: e.amount, category: e.category, description: e.description, date: e.date, type: e.type, is_active: e.isActive, created_by: e.createdBy });
const exFr=(e: any): Expense=>({ id: e.id, name: e.name, amount: e.amount, category: e.category, description: e.description, date: e.date, type: e.type, isActive: e.is_active, createdBy: e.created_by });
const gTo=(g: Goal)=>({ id: g.id, type: g.type, period: g.period, amount: g.amount, date: g.date });
const gFr=(g: any): Goal=>({ id: g.id, type: g.type, period: g.period, amount: g.amount, date: g.date });
const agTo=(a: AchievedGoal)=>({ id: a.id, goal_id: a.goalId, goal_type: a.goalType, goal_period: a.goalPeriod, amount: a.amount, date: a.date, reward_text: a.rewardText, period_key: a.periodKey, status: a.status });
const agFr=(a: any): AchievedGoal=>({ id: a.id, goalId: a.goal_id, goalType: a.goal_type, goalPeriod: a.goal_period, amount: a.amount, date: a.date, rewardText: a.reward_text, periodKey: a.period_key, status: a.status });
const acTo=(a: ActivityLog)=>({ id: a.id, type: a.type, member_id: a.memberId, member_name: a.memberName, description: a.description, date: a.date, value: a.value });
const acFr=(a: any): ActivityLog=>({ id: a.id, type: a.type, memberId: a.member_id, memberName: a.member_name, description: a.description, date: a.date, value: a.value });

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<CalendarEvent[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievedGoals, setAchievedGoals] = useState<AchievedGoal[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [unlockedReward, setUnlockedReward] = useState<AchievedGoal | null>(null);
  const dismissReward = () => setUnlockedReward(null);

  const fetchAllData = async () => {
    try {
      const [
        ms, ls, ss, cs, co, ce, ex, gs, as, al
      ] = await Promise.all([
        supabase.from('members').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('commissions').select('*'),
        supabase.from('calendar_events').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('achieved_goals').select('*'),
        supabase.from('activity_logs').select('*')
      ]);
      
      let loadedMembers = (ms.data || []).map(mFr);
      if (loadedMembers.length === 0) {
        const ceo = initialMembers[0];
        await supabase.from('members').insert(mTo(ceo));
        loadedMembers = [ceo];
      }
      setMembers(loadedMembers);
      setLeads((ls.data || []).map(lFr));
      setSales((ss.data || []).map(sFr));
      setClients((cs.data || []).map(cFr));
      setCommissions((co.data || []).map(coFr));
      setAgendaEvents((ce.data || []).map(eFr));
      setExpenses((ex.data || []).map(exFr));
      setGoals((gs.data || []).map(gFr));
      setAchievedGoals((as.data || []).map(agFr));
      setActivities((al.data || []).map(acFr));
    } catch(e) { console.error("Error connecting to Supabase", e); }
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      await fetchAllData();
      if (mounted) setIsLoaded(true);
    }
    load();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchAllData();
      })
      .subscribe();

    // Fallback polling em caso do realtime não estar ativado para todas as tabelas
    const interval = setInterval(() => {
      fetchAllData();
    }, 15000);

    return () => { 
      mounted = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const runInsert = async (table: string, data: any) => { 
    const res = await supabase.from(table).insert(data);
    if (res.error) console.error(`Error inserting into ${table}:`, res.error);
    return res;
  };
  const runUpdate = async (table: string, id: string, data: any) => { 
    const res = await supabase.from(table).update(data).eq('id', id);
    if (res.error) console.error(`Error updating in ${table}:`, res.error);
  };
  const runDelete = async (table: string, id: string) => { 
    const res = await supabase.from(table).delete().eq('id', id);
    if (res.error) console.error(`Error deleting from ${table}:`, res.error);
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'date'>) => {
    const newGoal = { ...goalData, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() };
    setGoals(p => [newGoal, ...p]); runInsert('goals', gTo(newGoal));
  };
  const deleteGoal = (id: string) => {
    setGoals(p => p.filter(g => g.id !== id)); runDelete('goals', id);
  };
  const deleteAchievedGoal = (id: string) => {
    setAchievedGoals(p => p.filter(g => g.id !== id)); runDelete('achieved_goals', id);
  };
  const logActivity = (a: Omit<ActivityLog, 'id' | 'date' | 'memberId' | 'memberName'>) => {
    const cu = getCurrentUser(); if(!cu.id) return;
    const n = { ...a, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), memberId: cu.id, memberName: cu.name };
    setActivities(p => [n, ...p]); runInsert('activity_logs', acTo(n));
  };
  const addSale = (saleData: Omit<Sale, 'id' | 'date' | 'createdBy'>, saleCo?: Omit<Commission, 'id' | 'date' | 'status' | 'saleId'>[]) => {
    const cu = getCurrentUser();
    const ns = { ...saleData, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), createdBy: cu.id };
    setSales(p => [ns, ...p]); runInsert('sales', sTo(ns));
    if (saleData.leadId) updateLead(saleData.leadId, { status: 'Fechado' });
    const nc: Client = { id: Math.random().toString(36).substr(2, 9), saleId: ns.id, leadId: ns.leadId, companyName: ns.companyName, ownerName: ns.ownerName, whatsapp: ns.whatsapp, siteUrl: ns.siteUrl, category: ns.category, price: ns.price, mrr: ns.mrr, date: ns.date, status: 'Ativo' };
    setClients(p => [nc, ...p]); runInsert('clients', cTo(nc));
    if (saleCo && saleCo.length > 0) {
      const gco = saleCo.map(c => ({ ...c, id: Math.random().toString(36).substr(2, 9), saleId: ns.id, date: new Date().toISOString(), status: 'Pendente' as const }));
      setCommissions(p => [...gco, ...p]); supabase.from('commissions').insert(gco.map(coTo));
    }
    logActivity({ type: 'ADD_SALE', description: `${cu.name} registrou uma nova venda para ${saleData.companyName} no valor de R$${saleData.price}`, value: saleData.price });
  };
  const deleteSale = (id: string) => {
    setSales(p => p.filter(s => s.id !== id)); runDelete('sales', id);
  };
  const addMember = (mData: Omit<Member, 'id' | 'token'>) => {
    const n = { ...mData, id: Math.random().toString(36).substr(2, 9), token: Math.random().toString(36).substr(2, 8).toUpperCase() };
    setMembers(p => [...p, n]); runInsert('members', mTo(n)); return n;
  };
  const updateMember = (id: string, u: Partial<Omit<Member, 'id'>>) => {
    setMembers(p => p.map(m => m.id === id ? { ...m, ...u } : m));
    const up: any = {};
    if(u.firstName) up.first_name = u.firstName; if(u.lastName) up.last_name = u.lastName;
    if(u.roles) up.roles = u.roles; if(u.photoUrl) up.photo_url = u.photoUrl;
    if(u.isPinned !== undefined) up.is_pinned = u.isPinned;
    runUpdate('members', id, up);
  };
  const togglePinMember = (id: string) => {
    const m = members.find(m => m.id === id); if(m) updateMember(id, { isPinned: !m.isPinned });
  };
  const deleteMember = (id: string) => {
    setMembers(p => p.filter(m => m.id !== id)); runDelete('members', id);
  };
  const addExpense = (eData: Omit<Expense, 'id' | 'date' | 'createdBy'>) => {
    const cu = getCurrentUser();
    const n = { ...eData, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), createdBy: cu.id };
    setExpenses(p => [n, ...p]); runInsert('expenses', exTo(n));
  };
  const toggleExpenseStatus = (id: string) => {
    const e = expenses.find(e => e.id === id);
    if (e) {
      setExpenses(p => p.map(x => x.id === id ? { ...x, isActive: !x.isActive } : x));
      runUpdate('expenses', id, { is_active: !e.isActive });
    }
  };
  const deleteExpense = (id: string) => { setExpenses(p => p.filter(e => e.id !== id)); runDelete('expenses', id); };
  const addLead = (lData: Omit<Lead, 'id' | 'date' | 'createdBy'>) => {
    const cu = getCurrentUser();
    const n = { ...lData, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), createdBy: cu.id };
    setLeads(p => [n, ...p]); runInsert('leads', lTo(n));
    logActivity({ type: 'ADD_LEAD', description: `${cu.name || 'Usuário'} adicionou um novo lead: ${lData.name}` });
  };
  const addMultipleLeads = async (lDataList: Omit<Lead, 'id' | 'date' | 'createdBy'>[]) => {
    const cu = getCurrentUser();
    const newLeads = lDataList.map(lData => ({
      ...lData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      createdBy: cu.id
    }));
    
    setLeads(p => [...newLeads, ...p]);
    await supabase.from('leads').insert(newLeads.map(lTo));
    logActivity({ type: 'ADD_LEAD', description: `${cu.name} adicionou ${newLeads.length} novos leads em lote.` });
  };
  const updateLead = (id: string, u: Partial<Omit<Lead, 'id' | 'date' | 'createdBy'>>) => {
    setLeads(p => p.map(l => l.id === id ? { ...l, ...u } : l));
    const up: any = {};
    if(u.name) up.name = u.name; if(u.companyName) up.company_name = u.companyName;
    if(u.whatsapp) up.whatsapp = u.whatsapp; if(u.source) up.source = u.source;
    if(u.status) up.status = u.status; if(u.segment) up.segment = u.segment; if(u.notes) up.notes = u.notes;
    runUpdate('leads', id, up);
  };
  const deleteLead = (id: string) => { setLeads(p => p.filter(l => l.id !== id)); runDelete('leads', id); };
  const updateClientStatus = (id: string, st: ClientStatus) => {
    setClients(p => p.map(c => c.id === id ? { ...c, status: st } : c)); runUpdate('clients', id, { status: st });
  };
  const deleteClient = (id: string) => { setClients(p => p.filter(c => c.id !== id)); runDelete('clients', id); };
  const addAgendaEvent = (eData: Omit<CalendarEvent, 'id' | 'status' | 'createdBy'>) => {
    const cu = getCurrentUser();
    const n = { ...eData, id: Math.random().toString(36).substr(2, 9), status: 'Pendente' as const, createdBy: cu.id };
    setAgendaEvents(p => [...p, n].sort((a,b)=>new Date(a.date).getTime() - new Date(b.date).getTime()));
    runInsert('calendar_events', eTo(n));
    if (eData.leadId) {
      if (eData.type === 'Reunião') updateLead(eData.leadId, { status: 'Reunião Marcada' });
      else if (eData.type === 'Follow-up') updateLead(eData.leadId, { status: 'Contato Iniciado' });
    }
    logActivity({ type: 'ADD_EVENT', description: `${cu.name} marcou uma ${eData.type}: ${eData.title}` });
  };
  const updateAgendaEventStatus = (id: string, st: EventStatus) => {
    setAgendaEvents(p => p.map(e => e.id === id ? { ...e, status: st } : e));
    runUpdate('calendar_events', id, { status: st });
  };
  const deleteAgendaEvent = (id: string) => { setAgendaEvents(p => p.filter(e => e.id !== id)); runDelete('calendar_events', id); };
  const addCommission = (cData: Omit<Commission, 'id' | 'date' | 'status'>) => {
    const n = { ...cData, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), status: 'Pendente' as const };
    setCommissions(p => [n, ...p]); runInsert('commissions', coTo(n));
  };
  const updateCommissionStatus = (id: string, st: 'Pendente' | 'Pago') => {
    setCommissions(p => p.map(c => c.id === id ? { ...c, status: st } : c));
    runUpdate('commissions', id, { status: st });
  };
  const deleteCommission = (id: string) => { setCommissions(p => p.filter(c => c.id !== id)); runDelete('commissions', id); };

  useEffect(() => {
    if (!isLoaded || goals.length === 0) return;
    const checkGoals = async () => {
      const now = new Date(); const newAchievements: AchievedGoal[] = [];
      for (const goal of goals) {
        const creationDate = new Date(goal.date);
        let startDate = new Date(creationDate); let endDate = new Date(creationDate); let periodKey = '';
        if (goal.period === 'Semanal') {
          const day = creationDate.getDay(); const diffToMonday = creationDate.getDate() - day + (day === 0 ? -6 : 1);
          startDate = new Date(creationDate.setDate(diffToMonday)); startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate); endDate.setDate(endDate.getDate() + 6); endDate.setHours(23, 59, 59, 999);
          const firstDayOfYear = new Date(startDate.getFullYear(), 0, 1);
          const pastDaysOfYear = (startDate.getTime() - firstDayOfYear.getTime()) / 86400000;
          periodKey = `${startDate.getFullYear()}-W${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)}`;
        } else {
          startDate = new Date(creationDate.getFullYear(), creationDate.getMonth(), 1); startDate.setHours(0, 0, 0, 0);
          endDate = new Date(creationDate.getFullYear(), creationDate.getMonth() + 1, 0); endDate.setHours(23, 59, 59, 999);
          periodKey = `${startDate.getFullYear()}-${startDate.getMonth() + 1}`;
        }
        
        const filteredSales = sales.filter(s => { const d = new Date(s.date); return d >= startDate && d <= endDate; });
        let progressValue = goal.type === 'Faturamento' 
          ? filteredSales.reduce((acc, sale) => acc + (Number(sale.price) || 0) + (Number(sale.mrr) || 0), 0)
          : filteredSales.length;

        if ((progressValue / goal.amount) * 100 >= 100) {
          if (!achievedGoals.some(ag => ag.goalId === goal.id && ag.periodKey === periodKey)) {
            const rewardText = REWARDS[Math.floor(Math.random() * REWARDS.length)];
            const n: AchievedGoal = { id: Math.random().toString(36).substr(2, 9), goalId: goal.id, goalType: goal.type, goalPeriod: goal.period, amount: goal.amount, date: new Date().toISOString(), rewardText, periodKey, status: 'Batida' };
            newAchievements.push(n);
          }
        }
      }
      if (newAchievements.length > 0) {
        setAchievedGoals(p => [...newAchievements.reverse(), ...p]);
        await supabase.from('achieved_goals').insert(newAchievements.map(agTo));
        setUnlockedReward(newAchievements[0]);
        const ids = newAchievements.map(a => a.goalId);
        setGoals(p => p.filter(g => !ids.includes(g.id)));
        await supabase.from('goals').delete().in('id', ids);
      }
    };
    checkGoals();
  }, [sales, goals, achievedGoals, isLoaded]);

  return (
    <AppContext.Provider value={{
      isLoaded,
      sales, addSale, deleteSale,
      members, addMember, updateMember, togglePinMember, deleteMember,
      expenses, addExpense, toggleExpenseStatus, deleteExpense,
      leads, addLead, addMultipleLeads, updateLead, deleteLead,
      clients, updateClientStatus, deleteClient,
      agendaEvents, addAgendaEvent, updateAgendaEventStatus, deleteAgendaEvent,
      commissions, addCommission, updateCommissionStatus, deleteCommission,
      goals, addGoal, deleteGoal,
      activities, logActivity,
      achievedGoals, deleteAchievedGoal, unlockedReward, setUnlockedReward, dismissReward
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
