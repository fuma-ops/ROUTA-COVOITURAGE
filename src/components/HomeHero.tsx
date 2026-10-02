import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MarrakechArtwork } from './MarrakechArtwork';
import { UserAvatar } from './UserAvatar';
import { evaluateTripMatch, formatDh } from '../utils/tripEngine';
import {
  MapPin,
  Calendar,
  Clock,
  ArrowRightLeft,
  Search,
  Car,
  Users,
  Shield,
  Leaf,
  PiggyBank,
  ChevronRight,
  Sparkles,
  Bell,
  Map,
  Calculator,
} from 'lucide-react';

export const HomeHero: React.FC = () => {
  const {
    currentUser,
    searchParams,
    setSearchParams,
    setActivePage,
    trips,
    setSelectedTrip,
    setShowNotificationsModal,
    notifications,
    openLocationPicker,
    setShowTarificationModal,
    setShowDriverRestrictedModal,
  } = useApp();

  const [mode, setMode] = useState<'passenger' | 'driver'>('passenger');
  const [localOrigin, setLocalOrigin] = useState(searchParams.origin);
  const [localDestination, setLocalDestination] = useState(searchParams.destination);
  const [localDate, setLocalDate] = useState(searchParams.date);
  const [localTime, setLocalTime] = useState(searchParams.time);

  // Sync when user selects a point from the interactive map picker
  useEffect(() => {
    setLocalOrigin(searchParams.origin);
  }, [searchParams.origin]);

  useEffect(() => {
    setLocalDestination(searchParams.destination);
  }, [searchParams.destination]);

  const handleSwap = () => {
    const temp = localOrigin;
    setLocalOrigin(localDestination);
    setLocalDestination(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      ...searchParams,
      origin: localOrigin,
      destination: localDestination,
      date: localDate,
      time: localTime,
    });
    if (mode === 'driver') {
      if (!currentUser || currentUser.role !== 'driver') {
        setShowDriverRestrictedModal(true);
        return;
      }
      setActivePage('publish');
    } else {
      setActivePage('search');
    }
  };

  return (
    <div className="relative">
      {/* Hero Container with blended photo & Marrakech artwork in background */}
      <div className="relative overflow-hidden pt-2 sm:pt-4 pb-8 sm:pb-12">
        {/* Real Moroccan road/landscape photo & Marrakech artwork blended seamlessly into the whole page */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          {/* Authentic panoramic Moroccan landscape photo */}
          <img
            src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2000&q=85"
            alt="Route et paysages du Maroc"
            className="w-full h-full object-cover object-center scale-105 opacity-25 mix-blend-multiply"
          />
          {/* Marrakech vector artwork skyline (Koutoubia, Atlas, palm trees) */}
          <div className="absolute inset-0 opacity-80">
            <MarrakechArtwork className="w-full h-full object-cover" />
          </div>
          {/* Soft atmospheric gradient blend into page background */}
          <div className="absolute inset-0 bg-gradient-to-b from-rose-100/35 via-white/50 to-[#F8F9FA]" />
          {/* Feathered bottom edge seamlessly blending into the rest of the page */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/80 to-transparent" />
        </div>

        {/* Selected div: Montée en haut avec marges réduites */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-0.5 sm:-mt-1">
          {/* Greeting on mobile (Clean header without duplicate bell/avatar) */}
          {currentUser ? (
            <div className="md:hidden mb-2.5">
              <p className="text-xl font-bold text-slate-900 font-display">
                Bonjour {currentUser.first_name} 👋
              </p>
              <p className="text-xs text-slate-600">Où allez-vous aujourd'hui ?</p>
            </div>
          ) : (
            <div className="md:hidden mb-2.5">
              <p className="text-xl font-bold text-slate-900 font-display">
                Covoiturage solidaire 🇲🇦
              </p>
              <p className="text-xs text-slate-600">Où allez-vous aujourd'hui ?</p>
            </div>
          )}

          {/* Desktop Hero Headings - Déplacé en haut et compact */}
          <div className="hidden md:block max-w-2xl mb-4 text-slate-900">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] font-display">
              Partagez la route,{' '}
              <span className="text-[#9E113E]">partagez plus.</span>
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
              Des trajets simples, économiques et plus humains au Maroc.
            </p>
          </div>

          {/* Main Action Box */}
          <div className="bg-white/95 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-4 sm:p-6 lg:p-7 backdrop-blur-md">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
              <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setMode('passenger')}
                  className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    mode === 'passenger'
                      ? 'bg-[#9E113E] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Je cherche un trajet</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser || currentUser.role !== 'driver') {
                      setShowDriverRestrictedModal(true);
                      return;
                    }
                    setMode('driver');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    mode === 'driver'
                      ? 'bg-[#9E113E] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={
                    !currentUser || currentUser.role !== 'driver'
                      ? 'Réservé aux conducteurs vérifiés (Permis & Véhicule)'
                      : 'Proposer un trajet'
                  }
                >
                  <Car className="w-4 h-4" />
                  <span>Je propose un trajet</span>
                  {(!currentUser || currentUser.role !== 'driver') && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 text-[#9E113E]">
                      Conducteurs
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSearchSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Départ avec icône Carte dédiée à côté */}
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                    Départ
                  </label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
                      <input
                        type="text"
                        value={localOrigin}
                        onChange={(e) => setLocalOrigin(e.target.value)}
                        placeholder="Départ (ex: Targa)"
                        className="w-full pl-10 pr-8 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200 focus:border-[#9E113E] focus:ring-2 focus:ring-[#9E113E]/20 text-sm font-medium text-slate-900 transition-all"
                      />
                      {localOrigin && (
                        <button
                          type="button"
                          onClick={() => setLocalOrigin('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {/* Bouton Icône Carte pour choisir ou chercher le départ sur la carte */}
                    <button
                      type="button"
                      onClick={() => openLocationPicker('origin', (val) => setLocalOrigin(val))}
                      className="h-11 px-3 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-1.5 font-bold text-xs shrink-0 transition-all shadow-2xs"
                      title="Choisir le lieu de départ sur la carte"
                    >
                      <Map className="w-4 h-4 text-emerald-600" />
                      <span className="hidden sm:inline">Carte</span>
                    </button>
                  </div>
                </div>

                {/* Swap button on desktop */}
                <div className="hidden md:flex md:col-span-1 justify-center pt-5">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-xs"
                    title="Inverser départ et destination"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Destination avec icône Carte dédiée à côté */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                    Destination
                  </label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E113E] pointer-events-none" />
                      <input
                        type="text"
                        value={localDestination}
                        onChange={(e) => setLocalDestination(e.target.value)}
                        placeholder="Destination (ex: Médina)"
                        className="w-full pl-10 pr-8 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200 focus:border-[#9E113E] focus:ring-2 focus:ring-[#9E113E]/20 text-sm font-medium text-slate-900 transition-all"
                      />
                      {localDestination && (
                        <button
                          type="button"
                          onClick={() => setLocalDestination('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {/* Bouton Icône Carte pour choisir ou chercher la destination sur la carte */}
                    <button
                      type="button"
                      onClick={() => openLocationPicker('destination', (val) => setLocalDestination(val))}
                      className="h-11 px-3 bg-rose-50 hover:bg-rose-100 active:scale-95 text-[#9E113E] border border-rose-200 rounded-xl flex items-center gap-1.5 font-bold text-xs shrink-0 transition-all shadow-2xs"
                      title="Choisir la destination sur la carte"
                    >
                      <Map className="w-4 h-4 text-[#9E113E]" />
                      <span className="hidden sm:inline">Carte</span>
                    </button>
                  </div>
                </div>

                {/* Date */}
                <div className="md:col-span-2 relative">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                    Date
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={localDate}
                      onChange={(e) => setLocalDate(e.target.value)}
                      className="w-full pl-9 pr-7 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200 focus:border-[#9E113E] focus:ring-2 focus:ring-[#9E113E]/20 text-sm font-medium text-slate-900 appearance-none transition-all cursor-pointer"
                    >
                      <option value="Aujourd'hui">Aujourd'hui</option>
                      <option value="Demain">Demain</option>
                      <option value="Après-demain">Après-demain</option>
                    </select>
                  </div>
                </div>

                {/* Heure */}
                <div className="md:col-span-2 relative">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                    Heure
                  </label>
                  <div className="relative flex items-center">
                    <Clock className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={localTime}
                      onChange={(e) => setLocalTime(e.target.value)}
                      className="w-full pl-9 pr-7 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-xl border border-slate-200 focus:border-[#9E113E] focus:ring-2 focus:ring-[#9E113E]/20 text-sm font-medium text-slate-900 appearance-none transition-all cursor-pointer"
                    >
                      <option value="07:30">07:30</option>
                      <option value="08:00">08:00</option>
                      <option value="08:30">08:30</option>
                      <option value="09:00">09:00</option>
                      <option value="14:00">14:00</option>
                      <option value="18:00">18:00</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Cliquez sur l'icône « Carte » pour pointer votre arrêt exact</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#9E113E] hover:bg-[#850D33] active:scale-98 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#9E113E]/25 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>
                    {mode === 'passenger' ? 'Rechercher des trajets' : 'Continuer vers la publication'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* 3 Value Pillars */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/85 border border-slate-200/80 shadow-xs backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#9E113E] flex items-center justify-center shrink-0">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Économisez</h4>
                <p className="text-[11px] text-slate-500">Partagez les frais équitablement selon la distance.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/85 border border-slate-200/80 shadow-xs backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Voyagez en confiance</h4>
                <p className="text-[11px] text-slate-500">Profils, téléphones, CIN et véhicules vérifiés.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/85 border border-slate-200/80 shadow-xs backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Protégeons l'environnement</h4>
                <p className="text-[11px] text-slate-500">Moins d'embouteillages et moins de CO₂ au Maroc.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Trips Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
              Trajets disponibles près de vous
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {trips.length > 0
                ? `${trips.length} trajet(s) disponible(s) aujourd'hui`
                : 'Aucun trajet planifié pour le moment'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTarificationModal(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Calculator className="w-3.5 h-3.5 text-[#9E113E]" />
              <span>Barème officiel</span>
            </button>
            {trips.length > 0 && (
              <button
                onClick={() => setActivePage('search')}
                className="text-xs font-semibold text-[#9E113E] hover:underline flex items-center gap-1"
              >
                <span>Voir tout ({trips.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Clean Empty State */}
        {trips.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#9E113E] flex items-center justify-center mx-auto mb-3">
              <Car className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-display">
              Aucun trajet publié pour le moment
            </h4>
            <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed max-w-sm mx-auto">
              Soyez le premier conducteur à partager vos frais sur votre itinéraire habituel !
            </p>
            <button
              type="button"
              onClick={() => {
                if (!currentUser || currentUser.role !== 'driver') {
                  setShowDriverRestrictedModal(true);
                } else {
                  setActivePage('publish');
                }
              }}
              className="px-6 py-3 bg-[#9E113E] hover:bg-[#850D33] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <Car className="w-4 h-4" />
              <span>+ Proposer un trajet</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.slice(0, 4).map((trip) => {
              const isExact = trip.match_type === 'exact';
              // Contribution estimée pour le trajet complet (Pricing Engine)
              const estimate = evaluateTripMatch(trip, {
                origin: '',
                destination: '',
                date: trip.date,
                time: trip.departure_time,
              });
              return (
                <div
                  key={trip.id}
                  onClick={() => {
                    setSelectedTrip(trip);
                    setActivePage('trip-detail');
                  }}
                  className="group bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-[#9E113E]/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top driver row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          name={trip.driver.first_name}
                          photo={trip.driver.photo}
                          size="md"
                          verified={trip.driver.verification_status.identity}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-900">
                              {trip.driver.first_name}
                            </span>
                            <span className="text-xs text-slate-400">★ {trip.driver.rating}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {trip.vehicle.brand} {trip.vehicle.model} · {trip.vehicle.color}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          isExact
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {isExact ? 'Correspondance exacte' : 'Trajet compatible'}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="space-y-1.5 my-3 pl-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{trip.origin}</span>
                      </div>
                      <div className="w-0.5 h-3 bg-slate-200 ml-1"></div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                        <span className="w-2 h-2 rounded-full bg-[#9E113E]"></span>
                        <span>{trip.destination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {trip.departure_time}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-slate-700">
                        {trip.reserved_seats}/{trip.available_seats} passagers
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-base font-extrabold text-[#9E113E]">
                          {formatDh(estimate.calculatedPrice)} DH
                        </span>
                        <span className="block text-[10px] text-slate-400 font-medium">estimation</span>
                      </div>
                      <span className="text-xs font-semibold text-[#9E113E] group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
