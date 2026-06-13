import React, { useEffect, useRef } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Menu, DollarSign, Target, Briefcase, Calendar, Percent, ShieldCheck, Trophy, Gift, ArrowRight, Settings, Play, Pause, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { getCurrentUser } from '../lib/auth';
import { useAppContext } from '../context/AppContext';
import confetti from 'canvas-confetti';

const RewardModal = () => {
  const { unlockedReward, dismissReward } = useAppContext();

  useEffect(() => {
    if (unlockedReward) {
      // Fire confetti when modal opens
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#F31333', '#ffffff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#F31333', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [unlockedReward]);

  if (!unlockedReward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 md:p-8 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#210606] border border-tecnova-neon/30 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(243,19,51,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10 text-center relative flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-tecnova-neon to-tecnova-primary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-tecnova-neon/20 animate-bounce">
            <Gift size={40} className="text-[#0a0a0a]" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
            Meta {unlockedReward.goalPeriod} Atingida!
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            A equipe atingiu a meta de {unlockedReward.goalType.toLowerCase()}!
          </p>

          <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-tecnova-neon/5 to-red-500/5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
            <p className="text-xs font-bold text-tecnova-neon uppercase tracking-widest mb-2">Recompensa Desbloqueada</p>
            <p className="text-2xl font-bold text-white mb-1">{unlockedReward.rewardText}</p>
          </div>

          <button 
            onClick={dismissReward}
            className="mt-8 px-8 py-3 bg-white text-[#0a0a0a] font-bold font-semibold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2 group"
          >
            Continuar Vencendo
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ onSettingsClick, isDesktopOpen, setDesktopOpen }: { onSettingsClick: () => void, isDesktopOpen: boolean, setDesktopOpen: (v: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = getCurrentUser();
  const { members } = useAppContext();
  const currentMember = members.find(m => m.id === currentUser.id);

  const baseLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/agenda', icon: Calendar, label: 'Agenda' },
    { to: '/leads', icon: Target, label: 'Leads' },
    { to: '/vendas', icon: CreditCard, label: 'Vendas' },
    { to: '/metas', icon: Trophy, label: 'Metas' },
    { to: '/comissoes', icon: Percent, label: 'Comissões' },
    { to: '/clientes', icon: Briefcase, label: 'Contratos' },
    { to: '/despesas', icon: DollarSign, label: 'Despesas' },
    { to: '/membros', icon: Users, label: 'Equipe' },
  ];

  const hasAdminAccess = currentMember?.roles.includes('CEO') || currentMember?.roles.includes('Admin') || currentUser.role === 'CEO' || currentUser.role === 'Admin';

  const links = hasAdminAccess 
    ? [...baseLinks, { to: '/admin', icon: ShieldCheck, label: 'Gestão da Equipe' }]
    : baseLinks;

  return (
    <>
      <button 
        className={cn(
          "fixed top-4 left-4 z-50 p-2 bg-[#210606] rounded-md border border-white/10 transition-all",
          isDesktopOpen ? "md:hidden" : "md:block"
        )}
        onClick={() => {
          if (window.innerWidth < 768) {
            setIsOpen(!isOpen);
          } else {
            setDesktopOpen(!isDesktopOpen);
          }
        }}
      >
        <Menu size={20} />
      </button>

      <div className={cn(
        "fixed md:static top-0 left-0 h-full w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-all duration-300 z-40 shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isDesktopOpen ? "md:translate-x-0 md:w-64" : "md:-translate-x-full md:w-0 md:border-transparent md:opacity-0"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <img 
            src="https://i.ibb.co/67gXgsw6/Chat-GPT-Image-5-de-jun-de-2026-18-38-29.png" 
            alt="TecNova" 
            className="w-24 drop-shadow-md"
          />
          <button 
            className="md:block hidden text-gray-400 hover:text-white"
            onClick={() => setDesktopOpen(false)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? "bg-gradient-to-r from-tecnova-neon/20 to-transparent text-tecnova-neon border-l-2 border-tecnova-neon" 
                  : "text-gray-300 hover:text-white hover:bg-white/10 border-l-2 border-transparent"
              )}
            >
              <link.icon size={18} className="drop-shadow-md shrink-0" />
              <span className="whitespace-nowrap">{link.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-2">
          <button 
            onClick={() => {
              setIsOpen(false);
              onSettingsClick();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10"
          >
            <Settings size={18} className="drop-shadow-md shrink-0" />
            <span className="whitespace-nowrap">Configurações</span>
          </button>
        </div>
        
        <div className="px-6 pb-6 text-xs text-gray-300 text-center whitespace-nowrap overflow-hidden">
          © 2026 TecNova
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export const AppLayout = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDesktopOpen, setDesktopOpen] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentUser = getCurrentUser();
  const { members } = useAppContext();

  const currentMember = members.find(m => m.id === currentUser.id);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="flex h-screen bg-tecnova-dark overflow-hidden font-sans text-white selection:bg-tecnova-neon/30">
      <Sidebar 
        onSettingsClick={() => setIsSettingsOpen(true)} 
        isDesktopOpen={isDesktopOpen} 
        setDesktopOpen={setDesktopOpen} 
      />
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pt-16 md:pt-8">
          <Outlet />
        </div>
      </main>
      
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src="/Happy_Nation.mp4" 
        loop
        autoPlay={false}
      />

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#210606] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings size={20} className="text-[#F31333]" />
                Configurações
              </h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Perfil */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Seu Perfil</h3>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 bg-gray-800 flex items-center justify-center">
                    {currentMember?.photoUrl ? (
                      <img src={currentMember.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-white">
                        {currentMember ? currentMember.firstName.charAt(0) : currentUser.name?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      {currentMember ? `${currentMember.firstName} ${currentMember.lastName}` : currentUser.name || 'Usuário Desconhecido'}
                    </h4>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {currentMember?.roles.map(role => (
                        <span key={role} className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[#F31333] border border-white/10 px-2 py-0.5 rounded">
                          {role}
                        </span>
                      )) || (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10 px-2 py-0.5 rounded">
                          {currentUser.role || 'Sem Função'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Player de Música */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Música Ambiente</h3>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Happy Nation</span>
                    <span className="text-xs text-gray-400">Ace of Base</span>
                  </div>
                  
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full text-[#F31333] transition-all cursor-pointer hover:bg-[#F31333]/20 bg-[#F31333]/10",
                    isPlaying && "animate-pulse"
                  )} 
                    onClick={togglePlay}
                    title={isPlaying ? "Pausar música" : "Tocar música"}
                  >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="pt-2">
                <button 
                  onClick={() => {
                    localStorage.removeItem('tecnova_auth');
                    localStorage.removeItem('tecnova_userId');
                    localStorage.removeItem('tecnova_userName');
                    localStorage.removeItem('tecnova_userRole');
                    window.location.reload();
                  }}
                  className="w-full py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Sair da Conta
                </button>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/5 bg-[#0a0a0a]">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <RewardModal />
    </div>
  );
};
