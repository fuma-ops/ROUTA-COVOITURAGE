import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Info,
  Map,
  Fuel,
  ShieldCheck,
  Coins,
} from 'lucide-react';
import { calculateTripTarification } from '../utils/pricing';

export const PublishTripModal: React.FC = () => {
  const {
    currentUser,
    publishTrip,
    setActivePage,
    openLocationPicker,
    searchParams,
    setShowTarificationModal,
    setShowCreateProfileModal,
    setCreateProfileRoleDefault,
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [origin, setOrigin] = useState(searchParams.origin || '');
  const [destination, setDestination] = useState(searchParams.destination || '');
  const [date, setDate] = useState("Aujourd'hui");
  const [time, setTime] = useState('08:00');
  const [places, setPlaces] = useState(4);
  const [vehicleModel, setVehicleModel] = useState('Dacia Logan');
  const [customSeatPrice, setCustomSeatPrice] = useState<number | null>(null);
  const [published, setPublished] = useState(false);

  // Automatic distance & fair cost sharing calculation (Section 26)
  const tarif = calculateTripTarification(origin, destination, places);
  const effectiveSeatPrice = customSeatPrice !== null ? customSeatPrice : tarif.suggested_price_per_seat;

  // Strict check: Passengers and disconnected visitors cannot publish trips!
  if (!currentUser || currentUser.role !== 'driver') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-12 animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-md text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-[#9E113E] flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-inner">
            <Car className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9E113E] bg-rose-50 px-3 py-1 rounded-full border border-rose-200 inline-block mb-2">
            Réglementation Officielle · Covoiturage Solidaire
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-2">
            Publication réservée aux conducteurs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
            Les passagers ne sont pas autorisés à proposer des trajets. Seuls les conducteurs disposant d'un permis de conduire valide et d'un véhicule enregistré peuvent publier une annonce pour partager leurs frais.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto mb-6 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Statut du compte :</span>
              <span className="font-bold text-slate-900">
                {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Non connecté'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Rôle :</span>
              <span className="font-bold text-[#9E113E] bg-rose-100/70 px-2 py-0.5 rounded-md text-[11px]">
                {currentUser?.role === 'passenger' ? 'Passager (Non habilité)' : 'Connexion requise'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => {
                setCreateProfileRoleDefault('driver');
                setShowCreateProfileModal(true);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-[#9E113E] hover:bg-[#850D33] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-[#9E113E]/20 transition-all"
            >
              <Car className="w-4 h-4" />
              <span>+ Créer un profil Conducteur à zéro</span>
            </button>

            <button
              onClick={() => setActivePage('search')}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Rechercher un trajet (Passager)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePublish = () => {
    publishTrip({
      origin,
      destination,
      date,
      departure_time: time,
      available_seats: places,
      passenger_contribution: effectiveSeatPrice,
      global_price: tarif.total_vehicle_cost_dh,
      distance_km: tarif.distance_km,
      estimated_duration_min: tarif.duration_min,
      fuel_cost_dh: tarif.fuel_cost_dh,
      wear_cost_dh: tarif.wear_cost_dh,
      toll_cost_dh: tarif.toll_cost_dh,
    });
    setPublished(true);
    setTimeout(() => {
      setActivePage('my-trips');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-12">
      {/* Container card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : setActivePage('home'))}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Publier un trajet
            </h2>
          </div>

          {/* Steps 1, 2, 3, 4 badges */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-[#9E113E] text-white shadow-xs'
                    : step > s
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s ? '✓' : s}
              </span>
            ))}
          </div>
        </div>

        {published ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Trajet publié avec succès !</h3>
            <p className="text-xs text-slate-500 mt-2">
              Votre trajet est désormais consultable par tous les passagers de la communauté Routa.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Départ */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    D'où partez-vous ?
                  </label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="Quartier, repère ou adresse de départ"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-[#9E113E] focus:ring-2 focus:ring-[#9E113E]/20"
                      />
                    </div>
                    {/* Bouton Carte Dédié */}
                    <button
                      type="button"
                      onClick={() => openLocationPicker('origin', (val) => setOrigin(val))}
                      className="h-12 px-3.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-1.5 font-bold text-xs shrink-0 transition-all shadow-2xs"
                      title="Choisir le lieu de départ sur la carte"
                    >
                      <Map className="w-4 h-4 text-emerald-600" />
                      <span>Carte</span>
                    </button>
                  </div>
                </div>

                {/* Popular Moroccan pickup suggestions */}
                <div>
                  <span className="text-xs text-slate-400 block mb-2">Points populaires récents :</span>
                  <div className="flex flex-wrap gap-2">
                    {['Targa (Carrefour)', 'Guéliz Plaza', 'Gare ONCF Marrakech', 'Sidi Ghanem', 'Massira'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setOrigin(`${p}, Marrakech`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    disabled={!origin.trim()}
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-[#9E113E] hover:bg-[#850D33] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-sm transition-all"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Destination */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Où allez-vous ?
                  </label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E113E]" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Destination finale"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-[#9E113E] focus:ring-2 focus:ring-[#9E113E]/20"
                      />
                    </div>
                    {/* Bouton Carte Dédié */}
                    <button
                      type="button"
                      onClick={() => openLocationPicker('destination', (val) => setDestination(val))}
                      className="h-12 px-3.5 bg-rose-50 hover:bg-rose-100 active:scale-95 text-[#9E113E] border border-rose-200 rounded-xl flex items-center gap-1.5 font-bold text-xs shrink-0 transition-all shadow-2xs"
                      title="Choisir la destination sur la carte"
                    >
                      <Map className="w-4 h-4 text-[#9E113E]" />
                      <span>Carte</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-2">Destinations fréquentes :</span>
                  <div className="flex flex-wrap gap-2">
                    {['Médina (Bab Doukkala)', 'Hivernage', 'Aéroport Marrakech Ménara', 'Casablanca (Casa Port)'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDestination(d.includes('Casablanca') ? d : `${d}, Marrakech`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corridor matching reassurance */}
                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-start gap-2 text-xs text-[#9E113E]">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Routa identifiera automatiquement les passagers situés sur votre route pour vous éviter tout détour.
                  </span>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-3 text-slate-600 font-semibold text-xs hover:bg-slate-100 rounded-xl"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-[#9E113E] hover:bg-[#850D33] text-white rounded-xl font-bold text-sm shadow-sm transition-all"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Date, Heure & Places */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Date de départ
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <select
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                      >
                        <option value="Aujourd'hui">Aujourd'hui</option>
                        <option value="Demain">Demain</option>
                        <option value="Après-demain">Après-demain</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Heure de départ
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Stepper for available seats */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Nombre de places proposées
                  </label>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 w-fit">
                    <button
                      type="button"
                      onClick={() => setPlaces(Math.max(1, places - 1))}
                      className="w-9 h-9 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold text-slate-900 px-3">{places}</span>
                    <button
                      type="button"
                      onClick={() => setPlaces(Math.min(6, places + 1))}
                      className="w-9 h-9 rounded-lg bg-[#9E113E] text-white font-bold flex items-center justify-center hover:bg-[#850D33]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-3 text-slate-600 font-semibold text-xs hover:bg-slate-100 rounded-xl"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="px-6 py-3 bg-[#9E113E] hover:bg-[#850D33] text-white rounded-xl font-bold text-sm shadow-sm transition-all"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Véhicule & Calcul automatique du prix (Section 26) */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in">
                {/* Véhicule */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Véhicule sélectionné
                  </label>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                        <Car className="w-5 h-5 text-[#9E113E]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Dacia Logan (Blanche)</p>
                        <p className="text-[11px] text-slate-500 font-mono">12345 | A | 6 · Vérifié ✓</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                      Véhicule prêt
                    </span>
                  </div>
                </div>

                {/* Détails du barème kilométrique et calcul automatique Section 26 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Barème de partage des frais (Section 26)
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {tarif.distance_km} km · ~{tarif.duration_min} min
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Carburant estimé</span>
                      <span className="text-xs font-extrabold text-slate-800">{tarif.fuel_cost_dh} DH</span>
                      <span className="text-[9px] text-slate-400 block">{tarif.fuel_liters} L</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Usure & entretien</span>
                      <span className="text-xs font-extrabold text-slate-800">{tarif.wear_cost_dh} DH</span>
                      <span className="text-[9px] text-slate-400 block">pneus/vidange</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Péage ADM</span>
                      <span className="text-xs font-extrabold text-slate-800">{tarif.toll_cost_dh} DH</span>
                      <span className="text-[9px] text-slate-400 block">{tarif.toll_cost_dh > 0 ? 'autoroute' : 'aucun'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                    <span>Coût de revient total estimé pour le véhicule :</span>
                    <span className="font-extrabold text-slate-900">{tarif.total_vehicle_cost_dh} DH</span>
                  </div>
                </div>

                {/* Box de tarification par passager avec régulation anti-lucrative (Section 26 & 33) */}
                <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#9E113E]">
                        Contribution par place recommandée (Section 26)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Partage équitable entre les {places} passagers et le conducteur ({places + 1} personnes à bord)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-[#9E113E] font-display">
                        {effectiveSeatPrice} <span className="text-sm font-bold">DH</span>
                      </span>
                      <span className="block text-[10px] text-slate-500">par passager / place</span>
                    </div>
                  </div>

                  {/* Sélecteur encadré dans la limite légale */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      Ajuster le tarif dans la fourchette autorisée ({tarif.min_allowed_price_per_seat} à {tarif.max_allowed_price_per_seat} DH) :
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {Array.from(
                        { length: Math.max(1, tarif.max_allowed_price_per_seat - tarif.min_allowed_price_per_seat + 1) },
                        (_, idx) => tarif.min_allowed_price_per_seat + idx
                      ).map((priceOption) => {
                        const isSelected = effectiveSeatPrice === priceOption;
                        const isRecommended = priceOption === tarif.suggested_price_per_seat;

                        return (
                          <button
                            key={priceOption}
                            type="button"
                            onClick={() => setCustomSeatPrice(priceOption)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                              isSelected
                                ? 'bg-[#9E113E] text-white shadow-xs'
                                : 'bg-white text-slate-700 hover:bg-rose-100 border border-slate-200'
                            }`}
                          >
                            <span>{priceOption} DH</span>
                            {isRecommended && <span className="ml-1 text-[9px] font-normal opacity-90">(Conseillé)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mentions légales strictes du Cahier des charges */}
                  <div className="pt-2 border-t border-rose-200/80 space-y-1.5 text-[11px] text-slate-600">
                    <p className="flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Réglementation marocaine :</strong> Le covoiturage est strictement non lucratif. Le tarif est plafonné par l'algorithme pour interdire tout bénéfice commercial.
                      </span>
                    </p>
                    <p className="flex items-center justify-between text-slate-700 font-semibold">
                      <span>Commission Routa (Section 33) :</span>
                      <span className="text-emerald-700 font-bold">0 DH (100% gratuit)</span>
                    </p>
                    <p className="flex items-center justify-between text-slate-900 font-bold pt-1">
                      <span>Total perçu si complet ({places} passagers) :</span>
                      <span className="text-[#9E113E]">{effectiveSeatPrice * places} DH</span>
                    </p>
                    <p className="flex items-center justify-between text-slate-600 text-[10px]">
                      <span>Part restante à la charge du conducteur :</span>
                      <span className="font-semibold">{Math.max(0, tarif.total_vehicle_cost_dh - (effectiveSeatPrice * places))} DH</span>
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowTarificationModal(true)}
                      className="w-full mt-2 py-2 px-3 bg-white hover:bg-rose-50 text-[#9E113E] border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Consulter les détails du Cahier des charges & Barème officiel</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="px-5 py-3 text-slate-600 font-semibold text-xs hover:bg-slate-100 rounded-xl"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handlePublish}
                    className="px-8 py-3.5 bg-[#9E113E] hover:bg-[#850D33] active:scale-98 text-white rounded-xl font-bold text-sm shadow-md shadow-[#9E113E]/20 transition-all"
                  >
                    Publier le trajet ({effectiveSeatPrice} DH / place)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
