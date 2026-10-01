import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { Trip } from '../types';
import { evaluateTripMatch, TripMatchEvaluation } from '../utils/tripMatchingService';
import {
  Search,
  SlidersHorizontal,
  Clock,
  Users,
  Heart,
  ArrowRight,
  ShieldCheck,
  Car,
  Map,
  Sparkles,
} from 'lucide-react';

export const SearchResults: React.FC = () => {
  const {
    trips,
    searchParams,
    setSearchParams,
    setSelectedTrip,
    setActivePage,
    favorites,
    toggleFavorite,
    openLocationPicker,
    currentUser,
    setShowDriverRestrictedModal,
    setShowTarificationModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'exact' | 'compatible'>('all');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [maxPrice, setMaxPrice] = useState(250);
  const [minSeats, setMinSeats] = useState(1);

  // Évaluation dynamique et intelligente de chaque trajet selon les critères de recherche
  const evaluatedTrips: TripMatchEvaluation[] = trips
    .map((trip) =>
      evaluateTripMatch(
        trip,
        searchParams.origin,
        searchParams.destination,
        searchParams.date,
        searchParams.time
      )
    )
    .filter((evalResult) => {
      // Si une recherche spécifique est saisie, on filtre par pertinence
      if (searchParams.origin || searchParams.destination) {
        if (!evalResult.isMatch) return false;
      }
      // Filtres de l'utilisateur
      if (activeTab === 'exact' && evalResult.matchType !== 'exact') return false;
      if (activeTab === 'compatible' && evalResult.matchType !== 'compatible') return false;
      if (evalResult.calculatedPrice > maxPrice) return false;

      const availableLeft = evalResult.trip.available_seats - evalResult.trip.reserved_seats;
      if (availableLeft < minSeats) return false;

      return true;
    })
    .sort((a, b) => b.score - a.score);

  const exactCount = trips.filter((t) => {
    const res = evaluateTripMatch(t, searchParams.origin, searchParams.destination);
    return res.matchType === 'exact';
  }).length;

  const compatibleCount = trips.filter((t) => {
    const res = evaluateTripMatch(t, searchParams.origin, searchParams.destination);
    return res.matchType === 'compatible';
  }).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
      {/* Top Search Mini-Bar */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center gap-2 mb-6">
        <div className="flex-1 w-full flex flex-wrap items-center gap-2 px-2 text-xs sm:text-sm text-slate-800">
          <div className="flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{searchParams.origin || 'Partout au Maroc'}</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <div className="flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#9E113E]"></span>
            <span>{searchParams.destination || 'Toutes destinations'}</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{searchParams.date}</span>
            <span>·</span>
            <span>{searchParams.time}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => openLocationPicker('origin')}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Modifier le lieu de départ sur la carte"
          >
            <Map className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Carte</span>
          </button>

          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showFilterDrawer ? 'bg-[#9E113E] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtres</span>
          </button>

          <button
            onClick={() => setActivePage('home')}
            className="w-10 h-10 bg-[#9E113E] hover:bg-[#850D33] text-white rounded-xl flex items-center justify-center transition-colors shadow-xs"
            title="Modifier la recherche"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Options Expandable (Sans tolérance horaire) */}
      {showFilterDrawer && (
        <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
          <div>
            <label className="font-semibold block mb-1">
              Prix maximum de contribution : <span className="font-bold text-[#9E113E]">{maxPrice} DH</span>
            </label>
            <input
              type="range"
              min="10"
              max="350"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#9E113E]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>10 DH</span>
              <span>150 DH</span>
              <span>350 DH</span>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Places disponibles minimum :</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setMinSeats(s)}
                  className={`px-3.5 py-1.5 rounded-lg border font-medium transition-colors ${
                    minSeats === s
                      ? 'bg-[#9E113E] text-white border-[#9E113E]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {s}+ place{s > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs: Exact vs Compatible as defined in spec */}
      <div className="flex items-center justify-between mb-5 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-rose-100/70 text-[#9E113E] ring-1 ring-[#9E113E]/30 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tous les trajets ({evaluatedTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('exact')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'exact'
                ? 'bg-emerald-100/70 text-emerald-800 ring-1 ring-emerald-500/30 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Correspondance directe ({exactCount})
          </button>
          <button
            onClick={() => setActiveTab('compatible')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'compatible'
                ? 'bg-sky-100/70 text-sky-800 ring-1 ring-sky-500/30 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sur l'itinéraire / Segments ({compatibleCount})
          </button>
        </div>
      </div>

      {/* Tarification Cahier des charges Banner */}
      <div className="mb-4 p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#9E113E]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Tarification réglementée (Section 26 & 33) :</strong> Partage strict des frais réels de transport, 0 DH commission et matching intelligent sur tout le Maroc.
          </span>
        </div>
        <button
          onClick={() => setShowTarificationModal(true)}
          className="px-3 py-1 bg-white hover:bg-rose-100 text-[#9E113E] border border-rose-200 rounded-lg font-bold text-[11px] shrink-0 transition-colors w-fit shadow-2xs"
        >
          Consulter le barème officiel
        </button>
      </div>

      {/* Trip Cards Feed */}
      <div className="space-y-4">
        {evaluatedTrips.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#9E113E] flex items-center justify-center mx-auto mb-3">
              <Car className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-display">
              Aucun trajet correspondant
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-5 leading-relaxed">
              Aucun trajet ne correspond à vos critères actuels ({searchParams.origin || 'Départ'} → {searchParams.destination || 'Arrivée'}). Vous pouvez modifier vos critères ou proposer votre trajet si vous êtes conducteur.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (!currentUser || currentUser.role !== 'driver') {
                    setShowDriverRestrictedModal(true);
                  } else {
                    setActivePage('publish');
                  }
                }}
                className="px-5 py-2.5 bg-[#9E113E] hover:bg-[#850D33] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <Car className="w-4 h-4" />
                <span>+ Proposer un trajet</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setMaxPrice(350);
                  setMinSeats(1);
                  setSearchParams((prev) => ({ ...prev, origin: '', destination: '' }));
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Voir tous les trajets du Maroc
              </button>
            </div>
          </div>
        ) : (
          evaluatedTrips.map((evalResult) => {
            const { trip, matchType, matchLabel, calculatedPrice, pickupPoint, dropoffPoint, isSegment } = evalResult;
            const isExact = matchType === 'exact';
            const isFav = favorites.includes(trip.id);
            const remaining = trip.available_seats - trip.reserved_seats;
            const isFull = remaining <= 0;

            return (
              <div
                key={trip.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-[#9E113E]/40 shadow-xs hover:shadow-md transition-all"
              >
                {/* Header: Driver Info & Match Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={trip.driver.first_name}
                      photo={trip.driver.photo}
                      size="lg"
                      verified={trip.driver.verification_status.identity}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {trip.driver.first_name}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                          <span className="text-amber-500">★</span> {trip.driver.rating}
                          <span className="text-slate-400 font-normal">({trip.driver.review_count})</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {trip.vehicle.brand} {trip.vehicle.model} · {trip.vehicle.color}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                        isExact
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {isSegment && <Sparkles className="w-3 h-3 text-sky-600 shrink-0" />}
                      <span>{matchLabel}</span>
                    </span>

                    <button
                      onClick={() => toggleFavorite(trip.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Ajouter aux favoris"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFav ? 'fill-rose-500 text-rose-500' : 'stroke-2'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Route Itinerary Line */}
                <div className="my-4 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8 flex flex-col gap-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>{trip.origin}</span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:inline" />

                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#9E113E]"></span>
                        <span>{trip.destination}</span>
                      </div>
                    </div>

                    {/* Segment details if passenger matches an intermediate corridor stop */}
                    {isSegment && (
                      <div className="text-[11px] text-sky-800 bg-sky-50/80 px-2.5 py-1 rounded-lg border border-sky-100 flex items-center gap-1.5 w-fit">
                        <span>Prise en charge : <strong>{pickupPoint}</strong> → Dépose : <strong>{dropoffPoint}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Pricing on right */}
                  <div className="sm:col-span-4 sm:text-right">
                    <div className="text-2xl font-extrabold text-slate-900 font-display">
                      {calculatedPrice}{' '}
                      <span className="text-sm font-bold text-[#9E113E]">DH</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold block">
                      {isSegment ? 'prix estimé segment' : 'par place / passager'}
                    </span>
                  </div>
                </div>

                {/* Footer Bar: Date/Time, Occupation Badge, and Action Button */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.date}</span>
                      <span>·</span>
                      <span className="font-bold text-slate-900">{trip.departure_time}</span>
                    </span>

                    {/* Occupation Indicator */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        isFull
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {isFull
                        ? `${trip.available_seats}/${trip.available_seats} — Complet`
                        : `${trip.reserved_seats}/${trip.available_seats} places réservées`}
                    </span>
                  </div>

                  {/* CTA button */}
                  <button
                    onClick={() => {
                      setSelectedTrip(trip);
                      setActivePage('trip-detail');
                    }}
                    className="px-5 py-2.5 bg-[#9E113E] hover:bg-[#850D33] active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all"
                  >
                    Voir le trajet
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
