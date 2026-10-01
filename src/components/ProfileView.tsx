import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { MOCK_VEHICLES } from '../mockData';
import {
  User,
  Car,
  Star,
  Settings,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Lock,
  Edit2,
  X,
  Bell,
  Sparkles,
  PlusCircle,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    logout,
    vehiclesList,
    setActivePage,
    setShowSafetyModal,
    setShowNotificationsModal,
    setShowCreateProfileModal,
    setShowAuthModal,
    setCreateProfileRoleDefault,
    setShowSplash,
    notifications,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'vehicle' | 'reviews'>('profile');
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-[#9E113E] flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
            Connexion requise
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Connectez-vous avec vos identifiants ou créez un nouveau compte pour consulter votre profil et gérer vos trajets.
          </p>
          <div className="space-y-2.5">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 bg-[#9E113E] hover:bg-[#850D33] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Se connecter</span>
            </button>
            <button
              onClick={() => setShowCreateProfileModal(true)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Créer un compte</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User's registered vehicle
  const currentVehicle =
    (currentUser.vehicle_id && vehiclesList[currentUser.vehicle_id]) ||
    MOCK_VEHICLES[currentUser.vehicle_id || 'veh_imane'] ||
    MOCK_VEHICLES.veh_yassine;
  const [vehicle, setVehicle] = useState(currentVehicle);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
      {/* Profile Card Header (Matching Mockup) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm text-center mb-6">
        <div className="relative inline-block mx-auto mb-3">
          <UserAvatar
            name={currentUser.first_name}
            photo={currentUser.photo}
            size="xl"
            verified={currentUser.verification_status.identity}
          />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 font-display">
          {currentUser.first_name} {currentUser.last_name}
        </h1>

        <div className="mt-1 flex items-center justify-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              currentUser.role === 'driver'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-[#9E113E] border-rose-200'
            }`}
          >
            {currentUser.role === 'driver'
              ? '🚗 Conducteur vérifié (Habilité à publier)'
              : '🎒 Passager (Réservation uniquement)'}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-600">
          <span className="text-amber-500 font-bold">★ {currentUser.rating}</span>
          <span className="text-slate-400">({currentUser.review_count} avis)</span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {currentUser.city}, Maroc
          </span>
        </div>

        {/* 3 Metric counters */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-100 max-w-md mx-auto text-center">
          <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              {currentUser.trips_as_driver + currentUser.trips_as_passenger}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium">Trajets</span>
          </div>

          <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xl sm:text-2xl font-extrabold text-[#9E113E] font-display">
              {currentUser.trips_as_passenger}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium">
              comme passagère
            </span>
          </div>

          <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              {currentUser.trips_as_driver}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium">
              comme conductrice
            </span>
          </div>
        </div>
      </div>

      {/* Trust & Moroccan Verification Badges Bar */}
      <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Niveau de confiance Routa (Maroc)
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-700">100% Vérifié</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-emerald-900 font-medium">
          <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1.5 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Téléphone +212</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1.5 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>CIN marocaine</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1.5 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Permis de conduire</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1.5 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Carte grise auto</span>
          </div>
        </div>
      </div>

      {/* List items navigation (Matching Mockup) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
        <button
          onClick={() => setActiveSubTab('profile')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Mes informations</span>
              <span className="text-xs text-slate-400">
                {currentUser.phone} · {currentUser.email}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowVehicleModal(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#9E113E]">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Mon véhicule</span>
              <span className="text-xs text-slate-400">
                {vehicle.brand} {vehicle.model} ({vehicle.plate})
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setActivePage('my-trips')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Mes trajets</span>
              <span className="text-xs text-slate-400">Historique et trajets à venir</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setActiveSubTab('reviews')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Mes avis</span>
              <span className="text-xs text-slate-400">4.9 sur 98 commentaires reçus</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowNotificationsModal(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#9E113E]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 block">Mes notifications</span>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="text-[10px] font-bold bg-[#9E113E] text-white px-2 py-0.5 rounded-full">
                    {notifications.filter((n) => !n.read).length} non lues
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">Alertes trajets, messages et réservations</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowSafetyModal(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Sécurité & Urgence Maroc</span>
              <span className="text-xs text-slate-400">Numéros SOS (19, 177) et partage direct</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Passenger to Driver upgrade helper banner */}
      {currentUser.role === 'passenger' && (
        <div className="my-6 p-4 sm:p-5 bg-gradient-to-r from-rose-50 to-amber-50 rounded-3xl border border-rose-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#9E113E] flex items-center justify-center shadow-xs shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Vous souhaitez proposer vos propres trajets ?
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Les passagers ne peuvent pas publier. Créez un profil Conducteur avec votre permis et véhicule pour partager vos frais !
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCreateProfileRoleDefault('driver');
              setShowCreateProfileModal(true);
            }}
            className="px-5 py-2.5 bg-[#9E113E] hover:bg-[#850D33] text-white font-bold rounded-xl text-xs shrink-0 shadow-xs transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Créer un profil Conducteur</span>
          </button>
        </div>
      )}

      {/* Account Settings & Logout */}
      <div className="my-6 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => setShowSplash(true)}
          className="text-xs font-semibold text-slate-700 hover:text-[#9E113E] flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Consulter le guide officiel de l'application</span>
        </button>

        <button
          onClick={() => logout()}
          className="w-full sm:w-auto px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-rose-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter de mon compte</span>
        </button>
      </div>

      {/* Vehicle Modal Editor (Section 19: Mon véhicule) */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#9E113E]" />
                <h3 className="text-base font-bold text-slate-900">Mon Véhicule</h3>
              </div>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Marque</label>
                  <input
                    type="text"
                    value={vehicle.brand}
                    onChange={(e) => setVehicle({ ...vehicle, brand: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Modèle</label>
                  <input
                    type="text"
                    value={vehicle.model}
                    onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Couleur</label>
                  <input
                    type="text"
                    value={vehicle.color}
                    onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Année</label>
                  <input
                    type="number"
                    value={vehicle.year}
                    onChange={(e) => setVehicle({ ...vehicle, year: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Immatriculation marocaine (Format légal)
                </label>
                <input
                  type="text"
                  value={vehicle.plate}
                  onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value })}
                  placeholder="ex: 12345 | A | 6"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-semibold"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 flex items-center justify-between">
                <span className="font-medium">Statut de vérification carte grise :</span>
                <span className="font-bold">✓ Homologué</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowVehicleModal(false)}
                className="px-5 py-2.5 bg-[#9E113E] text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Enregistrer le véhicule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
