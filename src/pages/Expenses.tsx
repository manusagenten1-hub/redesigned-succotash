import React, { useState } from 'react';
import { useAppContext, Expense, ExpenseCategory, ExpenseType } from '../context/AppContext';
import { Search, Plus, Trash2, Power, DollarSign, Activity, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES: ExpenseCategory[] = ['Ferramentas', 'Infraestrutura', 'Marketing', 'Operacional', 'Outros'];

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, toggleExpenseStatus } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredExpenses = expenses.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSec = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Metrics specifically for the expenses page
  const totalMonthlyRecurring = expenses.filter(e => e.type === 'Recorrente' && e.isActive).reduce((acc, e) => acc + e.amount, 0);
  const totalUnique = expenses.filter(e => e.type === 'Única').reduce((acc, e) => acc + e.amount, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Despesas & Custos</h1>
          <p className="text-gray-300 mt-1">Controle de fluxo de caixa da agência.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-300" />
            </div>
            <input
              type="text"
              placeholder="Buscar despesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#210606] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-red-400/50 transition-colors"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-500 hover:opacity-90 text-white w-10 h-10 rounded-lg font-medium transition-all shadow-lg shadow-red-500/30"
            title="Nova Despesa"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#210606] border border-rose-500/20 rounded-xl p-5 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-rose-400"><Activity size={16} /></div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Custo Fixo (Assinaturas)</p>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{formatSec(totalMonthlyRecurring)}</p>
          </div>
        </div>
        <div className="bg-tecnova-card border border-orange-500/20 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-orange-400"><DollarSign size={16} /></div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Despesas Únicas Totais</p>
            </div>
            <p className="text-2xl font-semibold text-white tracking-tight">{formatSec(totalUnique)}</p>
          </div>
        </div>
      </div>

      <div className="bg-tecnova-card border border-white/10 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-white/10 border-b border-white/10 text-xs uppercase tracking-wider font-bold text-gray-200">
                <th className="p-4 font-medium">Nome & Detalhes</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium text-right">Valor</th>
                <th className="p-4 font-medium text-center">Status / Tipo</th>
                <th className="p-4 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Nenhuma despesa encontrada.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="p-4">
                      <div className="font-semibold text-white">{expense.name}</div>
                      {expense.description && (
                        <div className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                          <FileText size={12} /> {expense.description}
                        </div>
                      )}
                      <div className="text-gray-400 text-xs mt-1">Cadastrado em {new Date(expense.date).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 text-gray-300 border border-white/10">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-rose-400 font-medium">-{formatSec(expense.amount)}</div>
                      {expense.type === 'Recorrente' && <div className="text-xs text-gray-500 mt-0.5">/ mês</div>}
                    </td>
                    <td className="p-4 text-center">
                      {expense.type === 'Recorrente' ? (
                         <button 
                         onClick={() => toggleExpenseStatus(expense.id)}
                         className={cn(
                           "inline-flex w-[100px] justify-center items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                           expense.isActive 
                             ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" 
                             : "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20"
                         )}
                         title={expense.isActive ? "Desativar" : "Ativar"}
                       >
                         <Power size={12} /> {expense.isActive ? 'Ativa' : 'Inativa'}
                       </button>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20">
                          Única
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        title="Apagar despesa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <AddExpenseModal onClose={() => setIsModalOpen(false)} onAdd={addExpense} />
      )}
    </div>
  );
}

function AddExpenseModal({ onClose, onAdd }: { onClose: () => void, onAdd: (data: Omit<Expense, 'id' | 'date'>) => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Ferramentas');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ExpenseType>('Recorrente');
  const [isActive, setIsActive] = useState(true);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const digits = val.replace(/\D/g, '');
    if (!digits) {
      setAmount('');
      return;
    }
    const numObj = Number(digits) / 100;
    setAmount(numObj.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    onAdd({
      name,
      amount: amount ? Number(amount.replace(/\./g, '').replace(',', '.')) : 0,
      category,
      description,
      type,
      isActive: type === 'Recorrente' ? isActive : false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 md:p-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#210606] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        <div className="p-6 border-b border-white/5 flex flex-col pt-8">
          <h2 className="text-xl font-bold text-rose-500">Registrar Despesa</h2>
          <p className="text-sm text-gray-400 mt-1">Adicione um novo custo ao seu fluxo de caixa.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Nome da Despesa <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500/50"
              placeholder="Ex: Assinatura Vercel"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Valor (R$) <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                required 
                value={amount} 
                onChange={handleAmountChange}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500/50"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Categoria <span className="text-rose-500">*</span></label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500/50 appearance-none"
              >
                {CATEGORIES.map(cat => (
                  <option className="bg-[#210606] text-white" key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Tipo de Despesa</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as ExpenseType)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500/50 appearance-none"
                >
                  <option className="bg-[#210606] text-white" value="Recorrente">Recorrente (Assinatura)</option>
                  <option className="bg-[#210606] text-white" value="Única">Custo Único</option>
                </select>
              </div>
              {type === 'Recorrente' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Status da Assinatura</label>
                  <div className="flex items-center gap-2 mt-1 w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 h-[38px] cursor-pointer" onClick={() => setIsActive(!isActive)}>
                     <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors", isActive ? "border-green-400" : "border-gray-500")}>
                        {isActive && <div className="w-2 h-2 rounded-full bg-green-400" />}
                     </div>
                     <span className="text-sm text-white">{isActive ? 'Ativa (Soma no Mês)' : 'Inativa'}</span>
                  </div>
                </div>
              )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Descrição (Opcional)</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500/50 min-h-[80px]"
              placeholder="Detalhes adicionais sobre a despesa..."
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
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-500 hover:opacity-90 transition-opacity"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
