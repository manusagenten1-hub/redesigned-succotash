import React, { useState } from 'react';
import { useAppContext, Goal, GoalType, GoalPeriod } from '../context/AppContext';
import { Trophy, Plus, Trash2, Calendar, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

export default function Goals() {
  const { goals, addGoal, deleteGoal, sales, achievedGoals, deleteAchievedGoal } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ativas' | 'antigas'>('ativas');

  const formatSec = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const calculateProgress = (goal: Goal) => {
    const creationDate = new Date(goal.date);
    let startDate = new Date(creationDate);
    let endDate = new Date(creationDate);
    
    if (goal.period === 'Semanal') {
      const day = creationDate.getDay();
      const diffToMonday = creationDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(creationDate.setDate(diffToMonday));
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(creationDate.getFullYear(), creationDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(creationDate.getFullYear(), creationDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const filteredSales = sales.filter(s => {
      const d = new Date(s.date);
      return d >= startDate && d <= endDate;
    });

    let progressValue = 0;
    if (goal.type === 'Faturamento') {
      progressValue = filteredSales.reduce((acc, sale) => acc + (Number(sale.price) || 0) + (Number(sale.mrr) || 0), 0);
    } else {
      progressValue = filteredSales.length;
    }

    const percentage = Math.min((progressValue / goal.amount) * 100, 100);
    return { progressValue, percentage };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Metas</h1>
          <p className="text-gray-300 mt-1">Acompanhe e gerencie as metas de faturamento e vendas.</p>
        </div>
        
        {goals.length < 2 && activeTab === 'ativas' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-nexora-neon text-[#070d14] font-bold px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-lg shadow-nexora-neon/20"
          >
            <Plus size={18} />
            Nova Meta
          </button>
        )}
      </div>

      <div className="flex border-b border-white/10 space-x-6">
        <button
          onClick={() => setActiveTab('ativas')}
          className={cn(
            "pb-3 text-sm font-medium transition-colors relative",
            activeTab === 'ativas' ? "text-nexora-neon" : "text-gray-300 hover:text-white"
          )}
        >
          Metas Ativas
          {activeTab === 'ativas' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-nexora-neon rounded-t-md"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('antigas')}
          className={cn(
            "pb-3 text-sm font-medium transition-colors relative",
            activeTab === 'antigas' ? "text-nexora-neon" : "text-gray-300 hover:text-white"
          )}
        >
          Metas Antigas
          {activeTab === 'antigas' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-nexora-neon rounded-t-md"></span>
          )}
        </button>
      </div>

      {activeTab === 'ativas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const { progressValue, percentage } = calculateProgress(goal);
            
            return (
              <div key={goal.id} className="bg-[#0f1720] border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center">
                <button 
                  onClick={() => deleteGoal(goal.id)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                  title="Excluir Meta"
                >
                  <Trash2 size={16} />
                </button>
                
                <div className="text-center mb-6">
                  <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest cursor-default">{goal.period}</h3>
                  <h2 className="text-xl font-bold text-white mt-1 cursor-default">META DE {goal.type.toUpperCase()}</h2>
                </div>

                <div className="relative w-64 h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: percentage }, { value: Math.max(100 - percentage, 0) }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        startAngle={225}
                        endAngle={-45}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#00d4ff" />
                        <Cell fill="#1a2332" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-white mb-1">{percentage.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">da meta atingida</div>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-xl font-bold text-white tracking-widest">{goal.type === 'Faturamento' ? formatSec(progressValue) : progressValue}</div>
                  <div className="text-sm text-gray-400 font-medium">/ {goal.type === 'Faturamento' ? formatSec(goal.amount) : goal.amount}</div>
                </div>
              </div>
            );
          })}
          
          {goals.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center text-gray-500 py-12 bg-[#0f1720] border border-white/5 rounded-2xl">
              <Trophy size={48} className="mx-auto text-gray-700 mb-4" />
              <p className="text-lg font-medium text-white/70">Nenhuma meta ativa</p>
              <p className="text-sm mt-1">Clique em "Nova Meta" para adicionar.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievedGoals.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12 bg-nexora-card border border-white/5 rounded-2xl">
              <Trophy size={48} className="mx-auto text-gray-700 mb-4 opacity-50" />
              <p className="text-lg font-medium text-white/70">Nenhum histórico de metas</p>
              <p className="text-sm mt-1">Quando uma meta acabar seu prazo ou for batida, ela aparecerá aqui.</p>
            </div>
          ) : (
             achievedGoals.map(ag => {
               const isAchieved = ag.status === 'Batida';
               return (
               <div key={ag.id} className={cn(
                 "bg-nexora-card border rounded-2xl p-6 relative overflow-hidden group",
                 isAchieved ? "border-green-500/30" : "border-red-500/20"
               )}>
                 <button 
                   onClick={() => deleteAchievedGoal(ag.id)}
                   className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors z-20"
                   title="Excluir Histórico"
                 >
                   <Trash2 size={16} />
                 </button>
                 <div className={cn(
                   "absolute top-0 right-0 p-16 blur-[50px] rounded-full pointer-events-none transition-colors",
                   isAchieved ? "bg-green-500/20 group-hover:bg-green-500/20" : "bg-red-500/10 group-hover:bg-red-500/20"
                 )}></div>
                 
                 <div className="flex items-center gap-3 mb-4 relative z-10">
                   <div className={cn(
                     "w-10 h-10 rounded-full flex items-center justify-center",
                     isAchieved ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                   )}>
                     <Trophy size={20} />
                   </div>
                   <div>
                     <h3 className="text-sm font-semibold text-white">Meta {ag.goalPeriod}</h3>
                     <p className="text-xs text-gray-400">{ag.goalType} • <span className={isAchieved ? "text-green-400" : "text-red-400"}>{ag.status}</span></p>
                   </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                   <div>
                     <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Valor Atingido</p>
                     <p className="text-xl font-bold text-white">
                       {ag.goalType === 'Faturamento' ? formatSec(ag.amount || 0) : ag.amount || 0}
                     </p>
                   </div>

                   {ag.rewardText && (
                     <div className="bg-[#151f28] p-3 rounded-xl border border-white/5">
                       <p className="text-xs text-nexora-neon uppercase tracking-widest mb-1">Recompensa</p>
                       <p className="text-sm font-medium text-white/90">{ag.rewardText}</p>
                     </div>
                   )}
                   
                   <p className="text-xs text-gray-500 text-right">
                     {isAchieved ? 'Batida' : 'Expirada'} em {new Date(ag.date).toLocaleDateString('pt-BR')}
                   </p>
                 </div>
               </div>
             )})
          )}
        </div>
      )}

      {isModalOpen && (
        <AddGoalModal onClose={() => setIsModalOpen(false)} onAdd={addGoal} />
      )}
    </div>
  );
}

function AddGoalModal({ onClose, onAdd }: { onClose: () => void, onAdd: (data: Omit<Goal, 'id' | 'date'>) => void }) {
  const [type, setType] = useState<GoalType>('Faturamento');
  const [period, setPeriod] = useState<GoalPeriod>('Mensal');
  const [amount, setAmount] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'Vendas') {
      const val = e.target.value.replace(/\D/g, '');
      setAmount(val);
      return;
    }
    
    let val = e.target.value.replace(/\D/g, '');
    if (!val) {
      setAmount('');
      return;
    }
    const numObj = Number(val) / 100;
    setAmount(numObj.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    let numAmount = 0;
    if (type === 'Vendas') {
      numAmount = Number(amount);
    } else {
      numAmount = Number(amount.replace(/\./g, '').replace(',', '.'));
    }
    
    if (numAmount <= 0) return;

    onAdd({
      type,
      period,
      amount: numAmount
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 md:p-8 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f1721] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col pt-8">
          <h2 className="text-xl font-bold text-white">Adicionar Meta</h2>
          <p className="text-sm text-gray-400 mt-1">Defina sua meta de resultados.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Tipo de Meta</label>
            <select 
              value={type} onChange={e => {
                setType(e.target.value as GoalType);
                setAmount('');
              }}
              className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
            >
              <option value="Faturamento">Faturamento (Implantação + Mensalidade)</option>
              <option value="Vendas">Vendas (Só Implantação)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Período</label>
            <select 
              value={period} onChange={e => setPeriod(e.target.value as GoalPeriod)}
              className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
            >
              <option value="Mensal">Mensal</option>
              <option value="Semanal">Semanal</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">
              {type === 'Vendas' ? 'Quantidade da Meta' : 'Valor da Meta (R$)'}
            </label>
            <input 
              type="text" 
              required 
              value={amount} 
              onChange={handleAmountChange}
              className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
              placeholder={type === 'Vendas' ? '0' : '0,00'}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-white/10 text-white rounded-lg hover:bg-white/10 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-nexora-neon text-black rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
