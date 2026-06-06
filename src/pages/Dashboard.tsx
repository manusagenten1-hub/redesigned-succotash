import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area 
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Activity, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import DashboardCalendar from '../components/DashboardCalendar';

const COLORS = ['#F31333', '#E60000', '#8b5cf6', '#ec4899', '#10b981'];

export default function Dashboard() {
  const { sales, expenses, goals } = useAppContext();

  // Metrics Sales
  const grossRevenue = sales.reduce((acc, sale) => acc + (Number(sale.price) || 0) + (Number(sale.mrr) || 0), 0);
  const implementationRevenue = sales.reduce((acc, sale) => acc + (Number(sale.price) || 0), 0);
  const currentMRR = sales.reduce((acc, sale) => acc + (Number(sale.mrr) || 0), 0);

  // Metrics Expenses
  const activeRecurringExpenses = expenses.filter(e => e.type === 'Recorrente' && e.isActive).reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalUniqueExpenses = expenses.filter(e => e.type === 'Única').reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalExpensesAllTime = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // Real Liquid Calculation (Faturamento Líquido = Faturamento - Despesas Totais)
  const netRevenue = grossRevenue - totalExpensesAllTime;
  // Monthly Cash Flow Snapshot
  const estimatedMonthlyProfit = currentMRR - activeRecurringExpenses;

  // Format currency
  const formatSec = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const calculateGoalProgress = (goal: typeof goals[0]) => {
    const now = new Date();
    let startDate = new Date();
    if (goal.period === 'Semanal') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filteredSales = sales.filter(s => new Date(s.date) >= startDate);

    let progressValue = 0;
    if (goal.type === 'Faturamento') {
      progressValue = filteredSales.reduce((acc, sale) => acc + (Number(sale.price) || 0) + (Number(sale.mrr) || 0), 0);
    } else {
      progressValue = filteredSales.length;
    }

    const percentage = Math.min((progressValue / goal.amount) * 100, 100);
    return { progressValue, percentage };
  };

  // Chart 1: Cash Flow (Receitas x Despesas)
  const cashFlowData = useMemo(() => {
    const dataByMonth: Record<string, { month: string, receita: number, despesa: number }> = {};
    
    // Add sales
    sales.forEach(sale => {
      const date = new Date(sale.date);
      const month = date.toLocaleDateString('pt-BR', { month: 'short' });
      if (!dataByMonth[month]) dataByMonth[month] = { month, receita: 0, despesa: 0 };
      dataByMonth[month].receita += (Number(sale.price) || 0);
      // MRR accumulates, simplified here as just the initial sign up value for history length
      dataByMonth[month].receita += (Number(sale.mrr) || 0); 
    });

    // Add expenses
    expenses.forEach(e => {
      const date = new Date(e.date);
      const month = date.toLocaleDateString('pt-BR', { month: 'short' });
      if (!dataByMonth[month]) dataByMonth[month] = { month, receita: 0, despesa: 0 };
      dataByMonth[month].despesa += (Number(e.amount) || 0);
    });

    return Object.values(dataByMonth).reverse();
  }, [sales, expenses]);

  // Chart 2: Revenue Split (Implementation vs Recurrence)
  const splitData = [
    { name: 'Implantação', value: implementationRevenue },
    { name: 'Recorrência', value: currentMRR }
  ];

  // Chart 3: Sales by Category
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    sales.forEach(s => {
      data[s.category] = (data[s.category] || 0) + 1;
    });
    return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [sales]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Financeiro</h1>
        <p className="text-gray-300 mt-1">Gestão de caixa, receitas e controle de lucros da agência.</p>
      </header>

      {/* Main Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard 
          title="Faturamento Bruto" 
          value={formatSec(grossRevenue)} 
          icon={<ArrowUpRight size={16} />}
          gradient="from-red-500/30 to-transparent"
          textColor="text-tecnova-neon"
        />
        <MetricCard 
          title="Despesas Totais" 
          value={formatSec(totalExpensesAllTime)} 
          icon={<ArrowDownRight size={16} />}
          gradient="from-rose-500/10 to-transparent"
          textColor="text-rose-400"
        />
        <MetricCard 
          title="Lucro Líquido Real" 
          value={formatSec(netRevenue)} 
          icon={<DollarSign size={16} />}
          gradient="from-green-500/10 to-transparent"
          textColor={netRevenue >= 0 ? "text-green-400" : "text-rose-400"}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
         <MetricCard 
          title="MRR (Receita Recorrente)" 
          value={formatSec(currentMRR)} 
          icon={<TrendingUp size={16} />}
          gradient="from-red-500/10 to-transparent"
          textColor="text-red-400"
        />
        <MetricCard 
          title="Despesas Fixas (Mês)" 
          value={formatSec(activeRecurringExpenses)} 
          icon={<Activity size={16} />}
          gradient="from-orange-500/10 to-transparent"
          textColor="text-orange-400"
        />
        <MetricCard 
          title="Previsão Fluxo (Mês)" 
          value={formatSec(estimatedMonthlyProfit)} 
          icon={<Activity size={16} />}
          gradient="from-green-500/10 to-transparent"
          textColor={estimatedMonthlyProfit >= 0 ? "text-emerald-400" : "text-rose-400"}
        />
      </div>

      {/* Goals Summary */}
      {goals.length > 0 && (
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const { progressValue, percentage } = calculateGoalProgress(goal);
            return (
              <div key={goal.id} className="bg-[#210606] border border-white/10 shadow-lg rounded-xl p-5 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white">Meta {goal.period} de {goal.type}</h3>
                    <span className="text-xs font-bold text-[#F31333]">{goal.type === 'Faturamento' ? formatSec(progressValue) : progressValue} <span className="text-gray-300 font-medium">/ {goal.type === 'Faturamento' ? formatSec(goal.amount) : goal.amount}</span></span>
                  </div>
                  <div className="w-full bg-[rgba(0,0,0,0.2)] rounded-full h-2.5 overflow-hidden border border-white/10">
                    <div 
                      className="bg-[#F31333] h-full rounded-full transition-all" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-300">
                    <span className="text-[#F31333] font-bold">{percentage.toFixed(1)}%</span> atingida
                  </div>
                </div>
                <div className="pl-6 border-l border-white/10 ml-6">
                  <Link 
                    to="/metas"
                    className="text-xs font-bold bg-[rgba(0,0,0,0.2)] border border-white/10 hover:bg-[#1c2c3d] text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap inline-block shadow-md"
                  >
                    Ver Meta
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Main Chart */}
          <div className="bg-[#210606] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">Fluxo de Caixa <span className="text-sm font-medium text-gray-400">(Receitas x Despesas)</span></h2>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F31333" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#F31333" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#cbd5e1" 
                    fontSize={12} 
                    tickFormatter={(val) => `R$${val}`}
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                    contentStyle={{ backgroundColor: '#210606', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                    formatter={(value: number) => formatSec(value)}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="receita" name="Receitas" stroke="#F31333" fillOpacity={1} fill="url(#colorReceita)" strokeWidth={3} />
                  <Area type="monotone" dataKey="despesa" name="Despesas" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDespesa)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories Chart */}
            <div className="bg-[#210606] border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">Receita <span className="text-sm font-medium text-gray-400">(Implantação vs MRR)</span></h2>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={splitData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {splitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => formatSec(val)}
                      contentStyle={{ backgroundColor: '#210606', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', fontWeight: 600 }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#210606] border border-white/10 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold mb-6 text-white">Composição de Serviços (Qtd)</h2>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                       <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#210606', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', fontWeight: 600 }}
                       />
                       <Line type="monotone" dataKey="value" name="Vendas" stroke="#F31333" strokeWidth={4} dot={{ fill: '#F31333', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, gradient, textColor }: { title: string, value: string | number, icon: React.ReactNode, gradient: string, textColor: string }) {
  const getBorderColor = () => {
    if (textColor.includes("tecnova-neon")) return '#F31333';
    if (textColor.includes("blue")) return '#E60000';
    if (textColor.includes("rose")) return '#f43f5e';
    if (textColor.includes("green")) return '#22c55e';
    if (textColor.includes("orange")) return '#f97316';
    if (textColor.includes("emerald")) return '#10b981';
    return '#374151';
  };

  return (
    <div className={`bg-[#210606] border-l-4 rounded-xl p-5 shadow-lg relative overflow-hidden group transition-all duration-300 hover:-translate-y-1`}
         style={{ borderLeftColor: getBorderColor() }}>
      <div className={`absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-br ${gradient} opacity-20 pointer-events-none`}></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className={textColor}>{icon}</div>
          <p className="text-xs text-gray-300 font-semibold uppercase tracking-wider">{title}</p>
        </div>
        <p className={`text-2xl font-bold tracking-tight text-white`}>{value}</p>
      </div>
    </div>
  );
}
