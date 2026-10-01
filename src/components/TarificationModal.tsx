import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateTripTarification, PRICING_REFERENCE } from '../utils/pricing';
import {
  ShieldCheck,
  Fuel,
  Wrench,
  Navigation,
  Percent,
  Calculator,
  CheckCircle,
  X,
  Car,
  Users,
  Award,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const TarificationModal: React.FC = () => {
  const { showTarificationModal, setShowTarificationModal } = useApp();

  // État du simulateur interactif intégré
  const [simKm, setSimKm] = useState<number>(15);
  const [simSeats, setSimSeats] = useState<number>(3);
  const [simToll, setSimToll] = useState<number>(0);

  if (!showTarificationModal) return null;

  // Calcul dynamique du simulateur
  const simTarif = calculateTripTarification(
    'Point A',
    'Point B',
    simSeats,
    undefined,
    undefined,
    undefined
  );

  // Recalcul basé directement sur le slider de km
  const simFuelCost = Math.round(simKm * PRICING_REFERENCE.FUEL_RATE_PER_KM);
  const simWearCost = Math.round(simKm * PRICING_REFERENCE.WEAR_RATE_PER_KM);
  const simTotalVehicle = simFuelCost + simWearCost + simToll;
  const simTotalOccupants = simSeats + 1; // 1 conducteur + N passagers
  const simRawPerSeat = simTotalVehicle / simTotalOccupants;
  const simSuggestedSeat = simKm <= 15 ? Math.max(10, Math.round(simRawPerSeat)) : Math.round(simRawPerSeat);
  const simMin = Math.max(simKm <= 15 ? 10 : 15, Math.round(simSuggestedSeat * 0.85));
  const simMax = Math.round(simSuggestedSeat * 1.15);
  const simCollected = simSuggestedSeat * simSeats;
  const simDriverShare = Math.max(0, simTotalVehicle - simCollected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-[#9E113E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Calculator className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-display">
                  Barème & Tarification Routa Maroc
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase">
                  Section 26 & 33
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Cahier des charges officiel : Partage strict des frais, 0% commission & non-lucrativité
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTarificationModal(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* 3 Pilliers Fondamentaux */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
              <div className="flex items-center gap-2 text-[#9E113E] font-bold text-xs">
                <Fuel className="w-4 h-4" />
                <span>1. Barème Kilométrique Réel</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>1,20 DH / km</strong> total décomposé en <strong>0,85 DH/km</strong> (carburant à 6,2 L/100km) + <strong>0,35 DH/km</strong> (entretien, pneus, lubrifiant).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. Zéro Profit (Non-lucratif)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le covoiturage est strictement bénévole. Le coût est partagé entre <strong>tous les occupants</strong> (conducteur inclus). <strong>0 DH de bénéfice commercial</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-2">
              <div className="flex items-center gap-2 text-sky-800 font-bold text-xs">
                <Percent className="w-4 h-4 text-sky-600" />
                <span>3. Zéro Commission (0 DH)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conforme à la <strong>Section 33</strong> : Routa ne prélève aucune commission. La plateforme est <strong>100% gratuite</strong> grâce aux partenaires nationaux.
              </p>
            </div>
          </div>

          {/* Formule Mathématique détaillée */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-[#9E113E]" />
              <span>Formule Mathématique Officielle (Section 26)</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-800 space-y-1 shadow-2xs">
              <p className="font-bold text-[#9E113E]">
                Coût Voiture = (Distance_km × 1.20 DH) + Péage_ADM
              </p>
              <p className="text-slate-600">
                Contribution unitaire conseillée = Coût Voiture ÷ (Nombre de passagers + 1 conducteur)
              </p>
              <p className="text-emerald-700 font-semibold text-[11px]">
                Fourchette autorisée = [Prix_conseillé - 15% ; Prix_conseillé + 15%]
              </p>
            </div>

            <p className="text-xs text-slate-500">
              * En zone intra-urbaine courte (ex: quartiers de Marrakech &lt; 12 km), un plancher équitable de <strong>10 DH</strong> par passager est appliqué pour amortir les manœuvres et le temps d'attente au point de rendez-vous.
            </p>
          </div>

          {/* Calculateur Officiel en direct */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/40 via-white to-amber-50/30 border border-rose-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#9E113E]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Calculateur Officiel en Temps Réel
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#9E113E] bg-rose-100/70 px-2.5 py-0.5 rounded-full">
                Estimez le partage de frais
              </span>
            </div>

            {/* Sliders & Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Distance du trajet : <span className="text-[#9E113E] font-extrabold">{simKm} km</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="350"
                  step="1"
                  value={simKm}
                  onChange={(e) => setSimKm(Number(e.target.value))}
                  className="w-full accent-[#9E113E] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>3 km (Urbain)</span>
                  <span>100 km</span>
                  <span>350 km (Interurbain)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Places passagers proposées : <span className="text-[#9E113E] font-extrabold">{simSeats} places</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSimSeats(n)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        simSeats === n
                          ? 'bg-[#9E113E] text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Total : {simTotalOccupants} personnes à bord
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Péage autoroutier ADM : <span className="text-slate-900 font-extrabold">{simToll} DH</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[0, 23, 58, 82, 110].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSimToll(t)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        simToll === t
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t === 0 ? '0 DH' : `${t} DH`}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Ex: Casa-Rabat 23 DH, Casa-Mkech 82 DH
                </span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-b border-slate-100 pb-3">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Carburant réel</span>
                  <span className="text-xs font-bold text-slate-800">{simFuelCost} DH</span>
                  <span className="text-[9px] text-slate-400">@ 0.85 DH/km</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Usure/Entretien</span>
                  <span className="text-xs font-bold text-slate-800">{simWearCost} DH</span>
                  <span className="text-[9px] text-slate-400">@ 0.35 DH/km</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Péage réel</span>
                  <span className="text-xs font-bold text-slate-800">{simToll} DH</span>
                  <span className="text-[9px] text-slate-400">ADM</span>
                </div>
                <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                  <span className="text-[10px] text-[#9E113E] font-bold block">Coût Total Véhicule</span>
                  <span className="text-sm font-extrabold text-[#9E113E]">{simTotalVehicle} DH</span>
                  <span className="text-[9px] text-slate-500">déboursé</span>
                </div>
              </div>

              {/* Price per seat outcome */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <span className="text-xs text-slate-500 block">
                    Contribution recommandée par place ({simSeats} passagers) :
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#9E113E] font-display">
                      {simSuggestedSeat} DH
                    </span>
                    <span className="text-xs text-slate-500">
                      (fourchette légale autorisée : {simMin} à {simMax} DH)
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs space-y-0.5">
                  <div className="flex sm:justify-end items-center gap-1 font-semibold text-slate-700">
                    <span>Part restant au conducteur :</span>
                    <span className="text-slate-900 font-bold">{simDriverShare} DH</span>
                  </div>
                  <div className="flex sm:justify-end items-center gap-1 font-semibold text-emerald-700">
                    <span>Commission Routa (Section 33) :</span>
                    <span className="font-bold">0 DH (100% gratuit)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grille de Référence des Trajets Officiels du Maroc */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#9E113E]" />
              <span>Grille de Référence des Trajets Types (Conforme Section 26)</span>
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Trajet / Axe</th>
                    <th className="p-3">Distance</th>
                    <th className="p-3">Coût Véhicule</th>
                    <th className="p-3">Péage</th>
                    <th className="p-3">Prix conseillé / place</th>
                    <th className="p-3">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">Marrakech : Targa ↔ Médina</td>
                    <td className="p-3">12 km</td>
                    <td className="p-3">14 DH</td>
                    <td className="p-3">0 DH</td>
                    <td className="p-3 font-bold text-[#9E113E]">10 à 12 DH</td>
                    <td className="p-3 text-emerald-700 font-bold">0 DH</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">Marrakech : Guéliz ↔ Hivernage</td>
                    <td className="p-3">4.5 km</td>
                    <td className="p-3">10 DH</td>
                    <td className="p-3">0 DH</td>
                    <td className="p-3 font-bold text-[#9E113E]">10 DH</td>
                    <td className="p-3 text-emerald-700 font-bold">0 DH</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">Casablanca ↔ Rabat</td>
                    <td className="p-3">87 km</td>
                    <td className="p-3">127 DH</td>
                    <td className="p-3">23 DH</td>
                    <td className="p-3 font-bold text-[#9E113E]">30 à 35 DH</td>
                    <td className="p-3 text-emerald-700 font-bold">0 DH</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">Casablanca ↔ Marrakech</td>
                    <td className="p-3">242 km</td>
                    <td className="p-3">372 DH</td>
                    <td className="p-3">82 DH</td>
                    <td className="p-3 font-bold text-[#9E113E]">90 à 95 DH</td>
                    <td className="p-3 text-emerald-700 font-bold">0 DH</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">Marrakech ↔ Agadir</td>
                    <td className="p-3">258 km</td>
                    <td className="p-3">387 DH</td>
                    <td className="p-3">78 DH</td>
                    <td className="p-3 font-bold text-[#9E113E]">95 à 100 DH</td>
                    <td className="p-3 text-emerald-700 font-bold">0 DH</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Certifié conforme à la réglementation marocaine du covoiturage solidaire et au Cahier des Charges.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowTarificationModal(false)}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#9E113E] hover:bg-[#850D33] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            Fermer le barème
          </button>
        </div>
      </div>
    </div>
  );
};
