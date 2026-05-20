import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowRight, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Member, useAppContext } from '../context/AppContext';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { members, isLoaded } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const membersList: Member[] = members;

  const verifyPassword = (memberId: string, psw: string) => {
    const member = membersList.find(m => m.id === memberId);
    return member && member.token === psw;
  };

  useEffect(() => {
    if (!isLoaded) return;
    
    // Check if already authenticated in this session
    const authStatus = localStorage.getItem('nexora_auth');
    const currentUserId = localStorage.getItem('nexora_userId');
    const userExists = membersList.some(m => m.id === currentUserId);

    if (authStatus === 'true' && userExists) {
      setIsAuthenticated(true);
      setShowSplash(false); // Skip splash if already logged in
    } else {
      if (authStatus === 'true') {
        localStorage.removeItem('nexora_auth');
        localStorage.removeItem('nexora_userId');
        localStorage.removeItem('nexora_userName');
        localStorage.removeItem('nexora_userRole');
      }
      setTimeout(() => setShowSplash(false), 2000); // 2s splash max
    }
  }, [membersList, isLoaded]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && verifyPassword(selectedUser.id, password)) {
      setIsAuthenticated(true);
      localStorage.setItem('nexora_auth', 'true');
      localStorage.setItem('nexora_userId', selectedUser.id);
      localStorage.setItem('nexora_userName', `${selectedUser.firstName} ${selectedUser.lastName}`);
      localStorage.setItem('nexora_userRole', selectedUser.roles[0] || 'Membro');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  const currentUserName = localStorage.getItem('nexora_currentUser');

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#070b14] flex flex-col items-center justify-center z-[100]">
        <motion.img 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          src="https://i.ibb.co/DDNwgKMg/w6tcns9185rmy0cxm4tr0k6zgc-preview-0-ezremove.png" 
          alt="Nexora Web" 
          className="w-48 md:w-64 drop-shadow-[0_0_30px_rgba(37,99,235,0.3)] object-contain"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <AnimatePresence mode="wait">
          {!selectedUser ? (
            <motion.div 
              key="profile-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <img 
                src="https://i.ibb.co/DDNwgKMg/w6tcns9185rmy0cxm4tr0k6zgc-preview-0-ezremove.png" 
                alt="Nexora Web" 
                className="w-32 mb-12 drop-shadow-[0_0_20px_rgba(37,99,235,0.2)]"
              />
              <h1 className="text-3xl sm:text-4xl font-bold mb-10 text-center tracking-tight">Quem está acessando?</h1>
              
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-3xl">
                {membersList.map((member, idx) => {
                  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
                  const color = colors[idx % colors.length];
                  
                  return (
                  <div 
                    key={member.id}
                    onClick={() => { setSelectedUser(member); setError(''); setPassword(''); }}
                    className="flex flex-col items-center gap-4 cursor-pointer group"
                  >
                    <div className={cn(
                      "w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-bold text-white transition-all duration-300",
                      "border-2 border-transparent group-hover:border-white shadow-xl",
                      color
                    )}>
                      {member.firstName.charAt(0)}
                    </div>
                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{member.firstName} {member.lastName}</span>
                  </div>
                )})}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="password-entry"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col items-center w-full max-w-md"
            >
              <div className="flex flex-col items-center mb-8 relative">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="absolute -top-4 -right-16 sm:-right-24 p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mb-4", 
                  ['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'][membersList.findIndex(m => m.id === selectedUser.id) % 6]
                )}>
                  {selectedUser.firstName.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h2>
                <p className="text-gray-300 mt-1">Digite seu token de acesso</p>
              </div>

              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className={cn(
                      "w-full bg-[#151f28] border rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none transition-colors",
                      error ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-nexora-neon"
                    )}
                    placeholder="Token de segurança"
                    autoFocus
                  />
                </div>
                
                {error && (
                  <p className="text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!password}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-nexora-neon hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-nexora-neon/20"
                >
                  Continuar <ArrowRight size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inject current user name as a global var or prop?
  // We'll just render children. AppLayout could read localStorage to show who is logged in if we want later.
  return <>{children}</>;
}
