import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, PlusCircle, ArrowRight, X } from 'lucide-react';
import { User } from '../types';

export const DriverRestrictedModal: React.FC = () => {
  const {
    showDriverRestrictedModal,
    setShowDriverRestrictedModal,
    currentUser,
    usersList,
    switchUserDirect,
    setShowCreateProfileModal,
    setCreateProfileRoleDefault,
    setActivePage,
  } = useApp();

  if (!showDriverRestrictedModal) return null;

  // Find any existing driver profiles the user might have created or available
  const existingDrivers = usersList.filter((u) => u.role === 'driver');

  const handleCreateDriver = () => {
    setShowDriverRestrictedModal(false);
    setCreateProfileRoleDefault('driver');
    setShowCreateProfileModal(true);
  };

  const handleSwitchToDriver = (driver: User) => {
    switchUserDirect(driver);
    setShowDriverRestrictedModal(false);
    setActivePage('publish');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-200 text-slate-900 relative">
        <button
          onClick={() => setShowDriverRestrictedModal(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Banner */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-13 h-13 rounded-2xl bg-rose-50 border border-rose-200 text-[#9E113E] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9E113E] bg-rose-100/60 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Réglementation Marocaine · Section 26 & 33
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 leading-tight">
              Les passagers n'ont pas le droit de proposer des trajets
            </h3>
          </div>
        </div>

        {/* Explanation Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2.5 mb-6">
          <p className="leading-relaxed">
            Conformément au cadre légal du <strong>covoiturage solidaire au Maroc</strong>, seuls les conducteurs disposant d'un véhicule immatriculé et d'un permis de conduire validé sont habilités à publier une annonce.
          </p>
          <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-slate-700">
            <span className="text-slate-400">Compte actuel :</span>
            <span className="font-bold text-slate-900">
              {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Visiteur non connecté'}
            </span>
            <span className="px-2 py-0.5 bg-rose-100 text-[#9E113E] rounded-md font-semibold text-[10px]">
              {currentUser?.role === 'passenger' ? 'Passager' : 'Non connecté'}
            </span>
          </div>
        </div>

        {/* Option 1: Existing Drivers (if any) */}
        {existingDrivers.length > 0 && (
          <div className="mb-5">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Basculer vers un profil Conducteur existant :
            </span>
            <div className="space-y-2">
              {existingDrivers.map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => handleSwitchToDriver(driver)}
                  className="w-full p-2.5 bg-rose-50/50 hover:bg-rose-50 rounded-xl border border-rose-200 text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#9E113E] text-white flex items-center justify-center font-bold text-xs">
                      {driver.first_name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#9E113E]">
                        {driver.first_name} {driver.last_name}
                      </p>
                      <p className="text-[10px] text-slate-500">Conducteur vérifié · {driver.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#9E113E]">
                    <span>Choisir</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Option 2: Create real driver profile from zero */}
        <div className="space-y-2.5">
          <button
            onClick={handleCreateDriver}
            className="w-full py-3.5 px-4 bg-[#9E113E] hover:bg-[#850D33] active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#9E113E]/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Créer un profil Conducteur à zéro (Permis & Véhicule)</span>
          </button>

          <button
            onClick={() => {
              setShowDriverRestrictedModal(false);
              setActivePage('search');
            }}
            className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Continuer comme passager (Rechercher un trajet)
          </button>
        </div>
      </div>
    </div>
  );
};
