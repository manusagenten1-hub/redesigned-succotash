import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, DollarSign, Target, TrendingUp, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Commissions() {
  const { commissions, members, updateCommissionStatus, deleteCommission } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendente' | 'Pago'>('Todos');

  const formatSec = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Derived stats
  const totalPaid = commissions.filter(c => c.status === 'Pago').reduce((acc, c) => acc + c.commissionValue, 0);
  const totalPending = commissions.filter(c => c.status === 'Pendente').reduce((acc, c) => acc + c.commissionValue, 0);

  // Group by member for ranking
  const memberPerformances = useMemo(() => {
    const perf: Record<string, { memberId: string, name: string, totalCommissions: number, totalSalesGenerated: number }> = {};
    
    commissions.forEach(c => {
      if (!perf[c.memberId]) {
        const member = members.find(m => m.id === c.memberId);
        perf[c.memberId] = {
          memberId: c.memberId,
          name: member ? `${member.firstName} ${member.lastName}` : 'Desconhecido',
          totalCommissions: 0,
          totalSalesGenerated: 0
        };
      }
      perf[c.memberId].totalCommissions += c.commissionValue;
      if (c.type === 'Fechamento') {
        perf[c.memberId].totalSalesGenerated += c.saleValue;
      }
    });

    return Object.values(perf).sort((a, b) => b.totalCommissions - a.totalCommissions);
  }, [commissions, members]);

  // Filters
  const filteredCommissions = commissions.filter(c => {
    const member = members.find(m => m.id === c.memberId);
    const memberName = member ? `${member.firstName} ${member.lastName}`.toLowerCase() : '';
    const matchName = memberName.includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'Todos' || c.status === statusFilter;
    return matchName && matchStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const chartData = memberPerformances.slice(0, 5).map(m => ({
    name: m.name,
    Comissões: m.totalCommissions,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Comissões</h1>
          <p className="text-gray-300 mt-1">Gestão de repasses, premiações e performance da equipe.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#210606] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/30 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-300 text-sm font-medium mb-1">Total Pago</p>
              <h3 className="text-2xl font-bold text-white">{formatSec(totalPaid)}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#210606] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Pendente</p>
              <h3 className="text-2xl font-bold text-white">{formatSec(totalPending)}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-amber-400">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-tecnova-card border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Top Vendedor</p>
              <h3 className="text-lg font-bold text-white truncate max-w-[150px]">
                {memberPerformances.length > 0 ? memberPerformances[0].name : '-'}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-tecnova-card border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Comissões por Membro (Top 5)</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(value: number) => formatSec(value)}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  <Bar dataKey="Comissões" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Dados insuficientes para o gráfico.
              </div>
            )}
          </div>
        </div>

        <div className="bg-tecnova-card border border-white/5 rounded-2xl p-6 overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Ranking de Comissionados</h3>
          <div className="flex-1 overflow-y-auto space-y-4">
            {memberPerformances.length === 0 ? (
              <div className="text-center text-gray-400 py-4">Nenhum dado registrado.</div>
            ) : (
              memberPerformances.map((perf, index) => {
                const member = members.find(m => m.id === perf.memberId);
                return (
                  <div key={perf.memberId} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-tecnova-neon/20 flex items-center justify-center text-tecnova-neon font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{perf.name}</div>
                        <div className="text-xs text-gray-400">
                          <span className="text-green-400 font-medium">Comissões: {formatSec(perf.totalCommissions)}</span>
                          <span className="mx-2">•</span>
                          Vendas: {formatSec(perf.totalSalesGenerated)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-tecnova-card border border-white/5 rounded-2xl shadow-lg mt-8">
        <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-white">Histórico de Comissões</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar membro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#210606] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-tecnova-neon transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#210606] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tecnova-neon"
            >
              <option value="Todos">Todos</option>
              <option value="Pendente">Pendentes</option>
              <option value="Pago">Pagos</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-white/10 border-b border-white/5 text-xs uppercase tracking-wider font-bold text-gray-200">
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium">Membro</th>
                <th className="p-4 font-medium">Origem</th>
                <th className="p-4 font-medium">Venda Referência</th>
                <th className="p-4 font-medium">Valor Comissão</th>
                <th className="p-4 font-medium">Status & Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhuma comissão encontrada.
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((commission) => {
                  const member = members.find(m => m.id === commission.memberId);
                  return (
                    <tr key={commission.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 text-gray-400">
                        {new Date(commission.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{member?.firstName} {member?.lastName}</div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                          commission.type === 'Fechamento' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-rose-500/10 text-purple-400 border-rose-500/20"
                        )}>
                          {commission.type}
                        </span>
                        {commission.isRecurring && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-green-500/10 text-green-400 border-green-500/20">
                            Recorrente
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-300">
                        {formatSec(commission.saleValue)}
                      </td>
                      <td className="p-4 font-semibold text-white">
                        {formatSec(commission.commissionValue)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          {commission.status === 'Pago' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                              <CheckCircle size={12} />
                              Pago
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-amber-400 border border-orange-500/20">
                                <Clock size={12} />
                                Pendente
                              </span>
                              <button
                                onClick={() => updateCommissionStatus(commission.id, 'Pago')}
                                className="text-xs px-2 py-1 bg-white/5 hover:bg-green-500/20 hover:text-green-400 rounded transition-colors text-gray-400 border border-white/5"
                              >
                                Marcar Pago
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => deleteCommission(commission.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                            title="Excluir Comissão"
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
