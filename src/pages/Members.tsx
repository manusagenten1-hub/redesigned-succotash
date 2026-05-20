import React, { useState } from 'react';
import { useAppContext, Member } from '../context/AppContext';
import { Plus, Trash2, Pin, GripVertical, Edit2, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils'; // wait, will import cn correctly? Yes.

export default function Members() {
  const { members, addMember, updateMember, togglePinMember, deleteMember } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [newToken, setNewToken] = useState<string | null>(null);

  const sortedMembers = [...members].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleOpenAdd = () => {
    setMemberToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setMemberToEdit(member);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Nossa Equipe</h1>
          <p className="text-gray-300 mt-1">Gestão de membros e permissões da Nexora Web.</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://discord.com/invite/p3jadHJHzW"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] px-4 py-2 rounded-lg font-medium transition-colors border border-[#5865F2]/20"
          >
            <MessageSquare size={18} />
            <span className="hidden sm:inline">Discord</span>
          </a>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-nexora-neon hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-nexora-neon/20"
          >
            <Plus size={18} />
            Adicionar Membro
          </button>
        </div>
      </div>

      {newToken && (
        <div className="bg-emerald-500/30 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold flex items-center gap-2">Membro adicionado com sucesso!</h3>
            <p className="text-sm mt-1">Copie o token de acesso. Ele não ficará visível novamente:</p>
            <div className="bg-[#0f1721] px-4 py-2 rounded-lg border border-white/10 font-mono mt-3 inline-block font-bold">
              {newToken}
            </div>
          </div>
          <button onClick={() => setNewToken(null)} className="p-2 hover:bg-emerald-500/20 rounded-lg">
            <Trash2 size={20} />
          </button>
        </div>
      )}

      {sortedMembers.length === 0 ? (
        <div className="bg-[#0f1720] border border-white/10 rounded-2xl p-12 text-center text-gray-300">
          Nenhum membro cadastrado. Comece adicionando um membro à sua equipe.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedMembers.map(member => (
            <MemberCard 
              key={member.id} 
              member={member} 
              onTogglePin={() => togglePinMember(member.id)}
              onEdit={() => handleOpenEdit(member)}
              onDelete={() => deleteMember(member.id)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <MemberModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={(data) => {
            if (memberToEdit) {
              updateMember(memberToEdit.id, data);
            } else {
              const newMem = addMember(data as Omit<Member, 'id' | 'token'>);
              if (newMem?.token) {
                setNewToken(newMem.token);
              }
            }
          }}
          initialData={memberToEdit}
        />
      )}
    </div>
  );
}

const MemberCard: React.FC<{ member: Member, onTogglePin: () => void, onEdit: () => void, onDelete: () => void }> = ({ member, onTogglePin, onEdit, onDelete }) => {
  return (
    <div className={cn(
      "bg-[#0f1720] border rounded-2xl p-6 transition-all relative group shadow-md flex flex-col items-center text-center",
      member.isPinned ? "border-nexora-neon/50 shadow-nexora-neon/10" : "border-white/10 hover:border-white/10"
    )}>
      {/* Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onTogglePin} 
          className={cn(
            "p-1.5 rounded-md transition-colors", 
            member.isPinned ? "text-amber-400 bg-amber-400/10" : "text-gray-400 hover:bg-white/10"
          )}
          title={member.isPinned ? "Desafixar" : "Fixar"}
        >
          <Pin size={16} fill={member.isPinned ? "currentColor" : "none" } />
        </button>
        <button 
          onClick={onEdit} 
          className="p-1.5 rounded-md text-gray-400 hover:text-nexora-neon hover:bg-nexora-neon/10 transition-colors"
          title="Editar membro"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={onDelete} 
          className="p-1.5 rounded-md text-red-400 hover:bg-red-400/10 transition-colors"
          title="Excluir membro"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Avatar */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-nexora-neon/30 p-1">
          <img 
            src={member.photoUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=151f28&color=00d4ff`} 
            alt={`${member.firstName} ${member.lastName}`} 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        {member.isPinned && (
          <div className="absolute -top-1 -right-1 bg-amber-400 text-[#070d14] font-bold p-1 rounded-full border-2 border-nexora-card">
            <Pin size={12} fill="currentColor" />
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-white">{member.firstName} {member.lastName}</h3>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {member.roles.map((role, idx) => (
          <span key={idx} className="bg-white/10 border border-white/10 text-xs px-2.5 py-1 rounded-full text-gray-300">
            {role}
          </span>
        ))}
      </div>
    </div>
  );
}

function MemberModal({ onClose, onSave, initialData }: { onClose: () => void, onSave: (data: Partial<Omit<Member, 'id'>>) => void, initialData?: Member | null }) {
  const isEditing = !!initialData;
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [roles, setRoles] = useState(initialData?.roles.join(', ') || '');
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !roles) return;

    onSave({
      firstName,
      lastName,
      roles: roles.split(',').map(r => r.trim()).filter(Boolean),
      photoUrl,
      isPinned: initialData ? initialData.isPinned : false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 md:p-8 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f1721] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Membro' : 'Adicionar Novo Membro'}</h2>
          <p className="text-sm text-gray-400 mt-1">{isEditing ? 'Atualize as informações do membro.' : 'Preencha os dados para cadastrar na equipe.'}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Nome <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                required 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)}
                className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors"
                placeholder="Ex: João"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Sobrenome <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                required 
                value={lastName} 
                onChange={e => setLastName(e.target.value)}
                className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors"
                placeholder="Ex: Silva"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Cargo(s) <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              required 
              value={roles} 
              onChange={e => setRoles(e.target.value)}
              className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors"
              placeholder="Ex: Marketing, Design (separe por vírgula)"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">URL da Foto (opcional)</label>
            <input 
              type="url" 
              value={photoUrl} 
              onChange={e => setPhotoUrl(e.target.value)}
              className="w-full bg-[#151f28] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexora-neon transition-colors"
              placeholder="https://exemplo.com/foto.jpg"
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
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
              {isEditing ? 'Salvar Alterações' : 'Salvar Membro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
