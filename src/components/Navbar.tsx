import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';
import {
  Bell,
  ShieldCheck,
  User as UserIcon,
  Car,
  Calculator,
  LogOut,
  Sparkles,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    logout,
    activePage,
    setActivePage,
    notifications,
    setShowSafetyModal,
    setShowNotificationsModal,
    setShowTarificationModal,
    setShowCreateProfileModal,
    setShowDriverRestrictedModal,
    setShowSplash,
    setShowAuthModal,
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ZONE 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center gap-1.5 focus:outline-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9E113E] to-[#E11D48] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              {/* Elegant steering / route logo loop */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v5" />
                <path d="M12 16v5" />
                <path d="M3 12h5" />
                <path d="M16 12h5" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#9E113E] font-display">
              Routa
            </span>
          </button>

          {/* Quick Moroccan national launch badge */}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Maroc
          </span>
        </div>

        {/* ZONE 2: Primary Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActivePage('home')}
            className={`transition-colors hover:text-[#9E113E] py-1 ${
              activePage === 'home'
                ? 'text-[#9E113E] font-semibold border-b-2 border-[#9E113E]'
                : ''
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => setActivePage('search')}
            className={`transition-colors hover:text-[#9E113E] py-1 ${
              activePage === 'search' || activePage === 'trip-detail'
                ? 'text-[#9E113E] font-semibold border-b-2 border-[#9E113E]'
                : ''
            }`}
          >
            Rechercher
          </button>
          <button
            onClick={() => {
              if (!currentUser || currentUser.role !== 'driver') {
                setShowDriverRestrictedModal(true);
              } else {
                setActivePage('publish');
              }
            }}
            className={`transition-colors hover:text-[#9E113E] py-1 flex items-center gap-1.5 ${
              activePage === 'publish'
                ? 'text-[#9E113E] font-semibold border-b-2 border-[#9E113E]'
                : ''
            }`}
            title={!currentUser || currentUser.role !== 'driver' ? 'Réservé aux conducteurs vérifiés (Permis & Véhicule)' : 'Publier un trajet'}
          >
            <span>Publier</span>
            {(!currentUser || currentUser.role !== 'driver') && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 text-[#9E113E] font-bold">
                Conducteur
              </span>
            )}
          </button>
          <button
            onClick={() => setActivePage('my-trips')}
            className={`transition-colors hover:text-[#9E113E] py-1 ${
              activePage === 'my-trips'
                ? 'text-[#9E113E] font-semibold border-b-2 border-[#9E113E]'
                : ''
            }`}
          >
            Mes trajets
          </button>
          <button
            onClick={() => setActivePage('messages')}
            className={`transition-colors hover:text-[#9E113E] py-1 ${
              activePage === 'messages'
                ? 'text-[#9E113E] font-semibold border-b-2 border-[#9E113E]'
                : ''
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setShowTarificationModal(true)}
            className="transition-colors hover:text-[#9E113E] py-1 flex items-center gap-1.5 text-slate-600 font-medium"
            title="Consulter le barème officiel du covoiturage solidaire au Maroc"
          >
            <Calculator className="w-3.5 h-3.5 text-[#9E113E]" />
            <span>Tarification & Barème</span>
          </button>
        </nav>

        {/* ZONE 3: Primary Actions & User Status */}
        <div className="flex items-center gap-3">
          {/* Safety & SOS quick button */}
          <button
            onClick={() => setShowSafetyModal(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="Centre de Sécurité & Urgence Maroc"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </button>

          {/* Notifications Bell Button */}
          {currentUser && (
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="relative p-2 text-slate-600 hover:text-[#9E113E] rounded-full hover:bg-slate-100 transition-colors focus:outline-hidden"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#9E113E] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Connected User Profile Pill */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotificationsModal(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors focus:outline-hidden"
              >
                <UserAvatar
                  name={currentUser.first_name}
                  photo={currentUser.photo}
                  size="sm"
                  verified={currentUser.verification_status.identity}
                />
                <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                  {currentUser.first_name}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in">
                  {/* Current Active User Card */}
                  <div className="p-3 bg-slate-50/80">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-900">
                        {currentUser.first_name} {currentUser.last_name}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          currentUser.role === 'driver'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-[#9E113E]'
                        }`}
                      >
                        {currentUser.role === 'driver' ? '🚗 Conducteur' : '🎒 Passager'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{currentUser.phone}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.city}, Maroc</p>
                  </div>

                  {/* Profile Links */}
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setActivePage('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9E113E] rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Mon profil {currentUser.role === 'driver' ? '& Véhicule' : ''}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActivePage('my-trips');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9E113E] rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Car className="w-4 h-4 text-slate-400" />
                      <span>Mes trajets</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowSplash(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#9E113E] rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Guide de l'application</span>
                    </button>
                  </div>

                  {/* Disconnect Action */}
                  <div className="p-1.5 bg-slate-50/60">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#9E113E] hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Se connecter</span>
              </button>

              <button
                onClick={() => setShowCreateProfileModal(true)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-[#9E113E] hover:bg-[#850D33] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>S'inscrire</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
