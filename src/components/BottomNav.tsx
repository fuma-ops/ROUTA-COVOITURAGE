import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    activePage,
    setActivePage,
    notifications,
    messages,
    currentUser,
    setShowDriverRestrictedModal,
  } = useApp();

  // Unread messages count
  const unreadMessages = 1;

  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'search', label: 'Rechercher', icon: Search },
    { id: 'publish', label: 'Publier', icon: PlusCircle, isPrimary: true },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 md:hidden">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activePage === item.id ||
            (item.id === 'search' && activePage === 'trip-detail');

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!currentUser || currentUser.role !== 'driver') {
                    setShowDriverRestrictedModal(true);
                  } else {
                    setActivePage('publish');
                  }
                }}
                className="flex flex-col items-center justify-center -mt-5 focus:outline-hidden group"
              >
                <div className="w-12 h-12 rounded-full bg-[#9E113E] text-white flex items-center justify-center shadow-lg shadow-[#9E113E]/30 group-active:scale-95 transition-transform">
                  <PlusCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as any)}
              className={`flex flex-col items-center justify-center py-1 relative focus:outline-hidden transition-colors ${
                isActive ? 'text-[#9E113E]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#9E113E] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold text-[#9E113E]' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
