import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { CorridorMap } from './CorridorMap';
import {
  ArrowLeft,
  Share2,
  Heart,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  Lock,
  MessageSquare,
  AlertCircle,
  Car,
  MapPin,
  Fuel,
  Wrench,
  Calculator,
  ChevronDown,
} from 'lucide-react';
import { calculateSegmentPrice } from '../utils/pricing';

export const TripDetail: React.FC = () => {
  const {
    selectedTrip,
    setActivePage,
    favorites,
    toggleFavorite,
    bookTrip,
    currentUser,
    setActiveConversationId,
    setShowTarificationModal,
    setShowAuthModal,
  } = useApp();

  const [seatsToReserve, setSeatsToReserve] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Corridor list and default stops
  const corridorList = selectedTrip?.corridor || [];
  const defaultOriginName = selectedTrip?.origin.split(',')[0] || '';
  const defaultDestName = selectedTrip?.destination.split(',')[0] || '';

  const [pickupStop, setPickupStop] = useState<string>(defaultOriginName);
  const [dropoffStop, setDropoffStop] = useState<string>(defaultDestName);

  if (!selectedTrip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-600">Aucun trajet sélectionné.</p>
        <button
          onClick={() => setActivePage('search')}
          className="mt-4 px-4 py-2 bg-[#9E113E] text-white rounded-xl text-xs font-semibold"
        >
          Retour aux résultats
        </button>
      </div>
    );
  }

  const isFav = favorites.includes(selectedTrip.id);
  const remainingSeats = selectedTrip.available_seats - selectedTrip.reserved_seats;
  const isFull = remainingSeats <= 0;

  // Segment calculation based on Section 26 (Cahier des charges)
  const pickupIndex = corridorList.findIndex((c) =>
    c.name.toLowerCase().includes(pickupStop.toLowerCase())
  );
  const dropoffIndex = corridorList.findIndex((c) =>
    c.name.toLowerCase().includes(dropoffStop.toLowerCase())
  );

  const safePickupIdx = pickupIndex !== -1 ? pickupIndex : 0;
  const safeDropoffIdx = dropoffIndex !== -1 ? dropoffIndex : Math.max(0, corridorList.length - 1);

  const isFullRoute = safePickupIdx === 0 && safeDropoffIdx >= corridorList.length - 1;
  const segmentRatio =
    corridorList.length > 1
      ? Math.max(0.35, Math.abs(safeDropoffIdx - safePickupIdx) / Math.max(1, corridorList.length - 1))
      : 1;

  const unitPricePerSeat = selectedTrip.passenger_contribution;
  const effectiveUnitPrice = isFullRoute
    ? unitPricePerSeat
    : Math.max(10, Math.round(unitPricePerSeat * segmentRatio));
  const totalPriceToPay = effectiveUnitPrice * seatsToReserve;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleBooking = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    bookTrip(selectedTrip.id, seatsToReserve, false, pickupStop, dropoffStop);
  };

  const handleBlockRemaining = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    bookTrip(selectedTrip.id, remainingSeats, true, pickupStop, dropoffStop);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setActivePage('search')}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#9E113E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux résultats</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Partager le trajet"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">
              {copiedLink ? 'Lien copié !' : 'Partager'}
            </span>
          </button>

          <button
            onClick={() => toggleFavorite(selectedTrip.id)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-500 transition-colors"
            title="Ajouter aux favoris"
          >
            <Heart
              className={`w-4 h-4 ${
                isFav ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Driver Profile Card with 4 Trust Badges */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <UserAvatar
                name={selectedTrip.driver.first_name}
                photo={selectedTrip.driver.photo}
                size="xl"
                verified={selectedTrip.driver.verification_status.identity}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 font-display">
                    {selectedTrip.driver.first_name}
                  </h2>
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                    <span className="text-amber-500">★</span> {selectedTrip.driver.rating}/5
                    <span className="text-slate-400 font-normal">
                      ({selectedTrip.driver.review_count} trajets)
                    </span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {selectedTrip.vehicle.brand} {selectedTrip.vehicle.model} ·{' '}
                    {selectedTrip.vehicle.color} · {selectedTrip.vehicle.year}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-sm font-semibold">
                    {selectedTrip.vehicle.plate}
                  </span>
                </p>
              </div>
            </div>

            {/* 4 Green Trust Badges as shown in mockup */}
            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-emerald-800 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Téléphone vérifié</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Identité vérifiée</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Permis vérifié</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Véhicule vérifié</span>
              </div>
            </div>
          </div>
        </div>

        {/* Route Details Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>{selectedTrip.origin.split(',')[0]}</span>
                <span className="text-xs font-normal text-slate-500">
                  {selectedTrip.departure_time}
                </span>
              </div>

              <span className="text-slate-400">→</span>

              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <span className="w-3 h-3 rounded-full bg-[#9E113E]"></span>
                <span>{selectedTrip.destination.split(',')[0]}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl font-extrabold text-[#9E113E] font-display">
                {selectedTrip.passenger_contribution} DH
              </div>
              <span className="text-[11px] text-slate-500 font-semibold block">par passager / place</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Partage équitable ({selectedTrip.global_price} DH au total)</span>
            </div>
          </div>

          {/* Metas */}
          <div className="py-4 flex flex-wrap items-center gap-5 text-xs text-slate-600 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{selectedTrip.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>
                {selectedTrip.reserved_seats}/{selectedTrip.available_seats} passagers
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-800">
                {selectedTrip.estimated_duration_min} min
              </span>
              <span>·</span>
              <span>{selectedTrip.distance_km} km</span>
            </div>
          </div>

          {/* Interactive Corridor Map */}
          <div className="my-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Carte du corridor & Arrêts
              </h3>
              <span className="text-[11px] text-slate-400">
                Cliquez sur un point pour voir l'horaire
              </span>
            </div>
            <CorridorMap
              corridor={selectedTrip.corridor}
              originName={selectedTrip.origin}
              destinationName={selectedTrip.destination}
              durationMin={selectedTrip.estimated_duration_min}
              distanceKm={selectedTrip.distance_km}
            />
          </div>

          {/* Passagers du trajet (2/4) & Order of Stops (Spec Section 11) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Passagers du trajet ({selectedTrip.reserved_seats}/{selectedTrip.available_seats})
              </h3>
              <span className="text-xs text-slate-500">Ordre des arrêts garanti</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Confirmed passengers list */}
              {selectedTrip.passengers.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar name={p.name} photo={p.photo} size="md" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {p.pickup_point} → {p.dropoff_point}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {p.contribution_dh} DH
                  </span>
                </div>
              ))}

              {/* Available empty seats */}
              {Array.from({ length: Math.max(0, remainingSeats) }).map((_, i) => (
                <div
                  key={`empty_${i}`}
                  className="p-3 rounded-2xl border-2 border-dashed border-slate-200 flex items-center gap-3 text-slate-400"
                >
                  <div className="w-10 h-10 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-300" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Place disponible
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card & Block Remaining Seats */}
        <div className="bg-gradient-to-br from-white to-rose-50/40 rounded-3xl p-5 sm:p-6 border border-rose-200/80 shadow-md space-y-5">
          {/* Corridor Segment Selector */}
          {corridorList.length > 2 && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#9E113E]" />
                  <span>Adapter votre tronçon sur ce corridor (Section 26)</span>
                </span>
                {!isFullRoute && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Tarif partiel au prorata de distance
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Point de montée :
                  </label>
                  <select
                    value={pickupStop}
                    onChange={(e) => setPickupStop(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    {corridorList.slice(0, -1).map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.approx_time})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Point de dépose :
                  </label>
                  <select
                    value={dropoffStop}
                    onChange={(e) => setDropoffStop(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    {corridorList.slice(1).map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.approx_time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Votre contribution équitable (Section 26)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-slate-900 font-display">
                  {totalPriceToPay} <span className="text-lg font-bold text-[#9E113E]">DH</span>
                </span>
                <span className="text-xs text-slate-500">
                  pour {seatsToReserve} place{seatsToReserve > 1 ? 's' : ''} ({effectiveUnitPrice} DH/place {!isFullRoute && '· segment'})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Calcul automatisé proportionnel à la distance selon le barème officiel Routa.
              </p>
            </div>

            {/* Places Selector */}
            {remainingSeats > 1 && (
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-600">Places :</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4]
                    .filter((n) => n <= remainingSeats)
                    .map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSeatsToReserve(num)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          seatsToReserve === num
                            ? 'bg-[#9E113E] text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Transparent cost breakdown table as required by Cahier des charges */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between text-slate-500 pb-1.5 border-b border-slate-100 text-[11px]">
              <span>Décomposition du barème kilométrique officiel :</span>
              <span className="font-semibold text-slate-700">1,20 DH/km de coût véhicule</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] pb-1">
              <div className="p-1.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Carburant</span>
                <span className="font-bold text-slate-700">{selectedTrip.fuel_cost_dh || Math.round(selectedTrip.distance_km * 0.85)} DH</span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Usure/Entretien</span>
                <span className="font-bold text-slate-700">{selectedTrip.wear_cost_dh || Math.round(selectedTrip.distance_km * 0.35)} DH</span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Péage ADM</span>
                <span className="font-bold text-slate-700">{selectedTrip.toll_cost_dh || 0} DH</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span>Contribution passager ({seatsToReserve} place{seatsToReserve > 1 ? 's' : ''} × {effectiveUnitPrice} DH) :</span>
              <span className="font-semibold text-slate-900">{totalPriceToPay} DH</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Frais de service Routa (Section 33 - 100% gratuit) :</span>
              <span className="font-bold text-emerald-700">0 DH (Gratuit)</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 font-bold text-slate-900">
              <span>Total à verser au conducteur :</span>
              <span className="text-base text-[#9E113E]">{totalPriceToPay} DH</span>
            </div>

            <button
              type="button"
              onClick={() => setShowTarificationModal(true)}
              className="w-full mt-1.5 py-1.5 text-center text-[#9E113E] hover:underline font-semibold text-[11px] flex items-center justify-center gap-1"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Voir la formule du Cahier des charges & Barème national</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              disabled={isFull}
              onClick={handleBooking}
              className="w-full sm:flex-1 py-3.5 bg-[#9E113E] hover:bg-[#850D33] active:scale-98 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-[#9E113E]/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Réserver {seatsToReserve} place{seatsToReserve > 1 ? 's' : ''} ({totalPriceToPay} DH)</span>
            </button>

            {remainingSeats > 1 && (
              <button
                onClick={handleBlockRemaining}
                className="w-full sm:w-auto px-4 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                title="Bloquer toutes les places pour voyager seul ou avec vos proches"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Bloquer les {remainingSeats} places ({remainingSeats * effectiveUnitPrice} DH)</span>
              </button>
            )}
          </div>

          {remainingSeats > 1 && (
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-200/60">
              * Bloquer les places restantes vous garantit un trajet privé ou pour votre groupe sans autres passagers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
