import React, { useState, useRef, useEffect } from 'react';
import { useAppContext, Sale, ServiceCategory, Lead, Member, Commission } from '../context/AppContext';
import { Search, Plus, ExternalLink, Trash2, ChevronDown, Percent } from 'lucide-react';

const CATEGORIES: ServiceCategory[] = [
  'Sistema Digital Completo',
  'Página de Vendas',
  'Página de Captura',
  'Otimização & Redesign',
  'Tráfego Pago'
];

export default function Sales() {
  const { sales, addSale, deleteSale } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSales = sales.filter(sale => 
    sale.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sale.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSec = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">Registro de Vendas</h1>
            <span className="bg-nexora-neon/10 text-nexora-neon text-sm px-3 py-1 rounded-full font-medium">
              {sales.length} {sales.length === 1 ? 'venda' : 'vendas'}
            </span>
          </div>
          <p className="text-gray-300 mt-1">Gerencie os projetos e serviços fechados.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-300" />
            </div>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0f1720] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-nexora-neon hover:opacity-90 text-white w-10 h-10 rounded-lg font-medium transition-all shadow-lg shadow-nexora-neon/20"
            title="Nova Venda"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="bg-[#0f1720] border border-white/10 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-white/10 border-b border-white/10 text-xs uppercase tracking-wider font-bold text-gray-200">
                <th className="p-4 font-medium">Cliente & Empresa</th>
                <th className="p-4 font-medium">Serviço</th>
                <th className="p-4 font-medium">Valores (Imp. / Rec.)</th>
                <th className="p-4 font-medium">Site Útil</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-white">{sale.companyName}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{sale.ownerName} • {sale.businessType}</div>
                      <div className="text-nexora-neon/80 text-xs mt-0.5">{sale.whatsapp}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/30 text-blue-400 border border-blue-500/20">
                        {sale.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{formatSec(sale.price)}</div>
                      {sale.mrr > 0 ? (
                        <div className="text-green-400 text-xs mt-0.5">+{formatSec(sale.mrr)} /mês</div>
                      ) : (
                        <div className="text-gray-400 text-xs mt-0.5">Sem recorrência</div>
                      )}
                    </td>
                    <td className="p-4">
                      {sale.siteUrl ? (
                        <a 
                          href={sale.siteUrl.startsWith('http') ? sale.siteUrl : `https://${sale.siteUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-gray-400 hover:text-nexora-neon inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span className="truncate max-w-[120px] inline-block">{sale.siteUrl}</span>
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteSale(sale.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        title="Apagar venda"
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
        <AddSaleModal onClose={() => setIsModalOpen(false)} onAdd={addSale} />
      )}
    </div>
  );
}

function LeadSelect({ onSelectLead }: { onSelectLead: (lead: Lead | null) => void }) {
  const { leads } = useAppContext();
  // Filtrar apenas leads que não estao perdidos para dar opção de virar Fechado
  // O usuário disse: "Exibir apenas leads com status 'Fechado'". Vamos seguir à risca.
  const eligibleLeads = leads.filter(l => l.status === 'Fechado');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = eligibleLeads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    (l.companyName && l.companyName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (lead: Lead | null) => {
    setSelectedLead(lead);
    onSelectLead(lead);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="text-xs font-medium text-gray-400 block mb-1.5">Vincular Lead Existente (Opcional)</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white flex justify-between items-center cursor-pointer hover:border-white/20 transition-colors"
      >
        <span className={selectedLead ? "text-white" : "text-gray-500"}>
          {selectedLead ? `${selectedLead.name} ${selectedLead.companyName ? `(${selectedLead.companyName})` : ''}` : "Selecionar Lead (Somente 'Fechado')"}
        </span>
        <ChevronDown size={16} className="text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[#1a2332] border border-white/10 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-white/5 bg-[#0f1721]">
            <input 
              type="text" 
              placeholder="Buscar por nome ou empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#151f28] border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-nexora-neon"
            />
          </div>
          <div className="max-h-48 overflow-y-auto w-full">
            <div 
              onClick={() => handleSelect(null)}
              className="px-3 py-2 text-sm text-gray-400 hover:bg-white/5 cursor-pointer border-b border-white/5"
            >
              Nenhum Lead
            </div>
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-xs text-gray-500 text-center">
                {eligibleLeads.length === 0 ? "Nenhum lead com status 'Fechado' encontrado." : "Nenhum resultado."}
              </div>
            ) : (
              filtered.map(lead => (
                <div 
                  key={lead.id}
                  onClick={() => handleSelect(lead)}
                  className="px-3 py-2 text-sm text-white hover:bg-white/5 cursor-pointer flex flex-col group"
                >
                  <span className="font-medium group-hover:text-nexora-neon transition-colors">{lead.name}</span>
                  {(lead.companyName || lead.whatsapp) && (
                    <span className="text-xs text-gray-500">
                      {lead.companyName && `${lead.companyName} • `}{lead.whatsapp}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddSaleModal({ onClose, onAdd }: { onClose: () => void, onAdd: (data: Omit<Sale, 'id' | 'date'>, commissions: Omit<Commission, 'id' | 'date' | 'status' | 'saleId'>[]) => void }) {
  const { members } = useAppContext();
  const currentUserId = localStorage.getItem('nexora_userId');
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>();
  const [category, setCategory] = useState<ServiceCategory>('Sistema Digital Completo');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [price, setPrice] = useState<string>('');
  const [mrr, setMrr] = useState<string>('');

  // Commissions
  const [responsibleId, setResponsibleId] = useState('');
  const [respBasis, setRespBasis] = useState<'Implantação' | 'Recorrência' | 'Ambos'>('Implantação');
  const [respPercent, setRespPercent] = useState('');

  const [indicatorId, setIndicatorId] = useState('');
  const [indBasis, setIndBasis] = useState<'Implantação' | 'Recorrência' | 'Ambos'>('Implantação');
  const [indPercent, setIndPercent] = useState('');

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const digits = val.replace(/\D/g, '');
    if (!digits) {
      setPrice('');
      return;
    }
    const numObj = Number(digits) / 100;
    setPrice(numObj.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleMrrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const digits = val.replace(/\D/g, '');
    if (!digits) {
      setMrr('');
      return;
    }
    const numObj = Number(digits) / 100;
    setMrr(numObj.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleSelectLead = (lead: Lead | null) => {
    if (lead) {
      setSelectedLeadId(lead.id);
      if (lead.companyName) setCompanyName(lead.companyName);
      if (lead.name) setOwnerName(lead.name);
      if (lead.whatsapp) setWhatsapp(lead.whatsapp);
    } else {
      setSelectedLeadId(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !ownerName || !whatsapp || !price) return;

    const numPrice = price ? Number(price.replace(/\./g, '').replace(',', '.')) : 0;
    const numMrr = mrr ? Number(mrr.replace(/\./g, '').replace(',', '.')) : 0;

    const commissions: Omit<Commission, 'id' | 'date' | 'status' | 'saleId'>[] = [];

    if (responsibleId && respPercent) {
      const p = parseFloat(respPercent.replace(',', '.'));
      if (!isNaN(p) && p > 0) {
        if (respBasis === 'Implantação' || respBasis === 'Ambos') {
          commissions.push({
            memberId: responsibleId,
            type: 'Fechamento',
            saleValue: numPrice,
            commissionValue: numPrice * (p / 100),
            isRecurring: false,
          });
        }
        if ((respBasis === 'Recorrência' || respBasis === 'Ambos') && numMrr > 0) {
          commissions.push({
            memberId: responsibleId,
            type: 'Fechamento',
            saleValue: numMrr,
            commissionValue: numMrr * (p / 100),
            isRecurring: true,
          });
        }
      }
    }

    if (indicatorId && indPercent) {
      const p = parseFloat(indPercent.replace(',', '.'));
      if (!isNaN(p) && p > 0) {
        if (indBasis === 'Implantação' || indBasis === 'Ambos') {
          commissions.push({
            memberId: indicatorId,
            type: 'Indicação',
            saleValue: numPrice,
            commissionValue: numPrice * (p / 100),
            isRecurring: false,
          });
        }
        if ((indBasis === 'Recorrência' || indBasis === 'Ambos') && numMrr > 0) {
          commissions.push({
            memberId: indicatorId,
            type: 'Indicação',
            saleValue: numMrr,
            commissionValue: numMrr * (p / 100),
            isRecurring: true,
          });
        }
      }
    }

    onAdd({
      leadId: selectedLeadId,
      category,
      companyName,
      businessType,
      ownerName,
      whatsapp,
      siteUrl,
      price: numPrice,
      mrr: numMrr,
      responsibleId: responsibleId || undefined,
      indicatorId: indicatorId || undefined
    }, commissions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 md:p-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f1721] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        <div className="p-6 border-b border-white/5 flex flex-col pt-8">
          <h2 className="text-xl font-bold text-white">Registrar Nova Venda</h2>
          <p className="text-sm text-gray-400 mt-1">Preencha os dados do projeto fechado.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
            <LeadSelect onSelectLead={handleSelectLead} />
            <p className="text-xs text-gray-500 mt-2">Ao selecionar um lead, os dados do cliente serão preenchidos automaticamente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Serviço & Valores</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Categoria <span className="text-red-400">*</span></label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Preço de Implantação (R$) <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={price} 
                  onChange={handlePriceChange}
                  className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors"
                  placeholder="Ex: 3.500,00"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Recorrência Mensal (MRR) - Opcional</label>
                <input 
                  type="text" 
                  value={mrr} 
                  onChange={handleMrrChange}
                  className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors"
                  placeholder="Ex: 150,00"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Dados do Cliente</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Nome da Empresa <span className="text-red-400">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Ramo / Tipo <span className="text-red-400">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={businessType} 
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
                    placeholder="Ex: Pizzaria"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Nome do Dono / Contato <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={ownerName} 
                  onChange={e => setOwnerName(e.target.value)}
                  className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">WhatsApp <span className="text-red-400">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={whatsapp} 
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
                    placeholder="DD NNNNN-NNNN"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">URL do Site (Opcional)</label>
                  <input 
                    type="text" 
                    value={siteUrl} 
                    onChange={e => setSiteUrl(e.target.value)}
                    className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
                    placeholder="exemplo.com.br"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
              <Percent size={14} className="text-nexora-neon" /> Comissionamento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Responsável pelo Fechamento</label>
                  <select 
                    value={responsibleId}
                    onChange={(e) => setResponsibleId(e.target.value)}
                    className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors"
                  >
                    <option value="">Nenhum (Sem comissão)</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.id === currentUserId ? `(Eu) ${m.firstName} ${m.lastName}` : `${m.firstName} ${m.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
                {responsibleId && (
                  <div className="flex gap-3">
                    <div className="space-y-1.5 flex-1">
                      <label className="text-xs font-medium text-gray-400">% Comissão</label>
                      <div className="relative">
                        <input 
                          type="number" step="0.5" 
                          value={respPercent} onChange={e => setRespPercent(e.target.value)}
                          className="w-full bg-[#1a2332] border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
                          placeholder="Ex: 10"
                        />
                        <span className="absolute right-3 top-2 text-gray-500">%</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 flex-[1.5]">
                      <label className="text-xs font-medium text-gray-400">Base de Cálculo</label>
                      <select 
                        value={respBasis} onChange={e => setRespBasis(e.target.value as any)}
                        className="w-full bg-[#1a2332] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
                      >
                        <option value="Implantação">Implant. Única</option>
                        <option value="Recorrência">Recorrência (Mensal)</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Indicador (Opcional)</label>
                  <select 
                    value={indicatorId}
                    onChange={(e) => setIndicatorId(e.target.value)}
                    className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors"
                  >
                    <option value="">Nenhum</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.id === currentUserId ? `(Eu) ${m.firstName} ${m.lastName}` : `${m.firstName} ${m.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
                {indicatorId && (
                  <div className="flex gap-3">
                    <div className="space-y-1.5 flex-1">
                      <label className="text-xs font-medium text-gray-400">% Indicação</label>
                      <div className="relative">
                        <input 
                          type="number" step="0.5" 
                          value={indPercent} onChange={e => setIndPercent(e.target.value)}
                          className="w-full bg-[#1a2332] border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
                          placeholder="Ex: 5"
                        />
                        <span className="absolute right-3 top-2 text-gray-500">%</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 flex-[1.5]">
                      <label className="text-xs font-medium text-gray-400">Base de Cálculo</label>
                      <select 
                        value={indBasis} onChange={e => setIndBasis(e.target.value as any)}
                        className="w-full bg-[#1a2332] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon"
                      >
                        <option value="Implantação">Implant. Única</option>
                        <option value="Recorrência">Recorrência (Mensal)</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-6 mt-6 border-t border-white/5 flex justify-end gap-3">
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
              Salvar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
