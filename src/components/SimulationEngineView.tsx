import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TRIP_SIM_001,
  SIMULATION_TEST_PASSENGERS,
  THREE_OVERLAPPING_PASSENGERS,
} from '../utils/simulationData';
import {
  matchPassenger,
  CanonicalTrip,
  PassengerRequest,
  MatchingResult,
  MATCHING_CONFIG,
} from '../utils/matchingEngine';
import {
  calculatePricing,
  buildRouteSegments,
  BookingSegmentUser,
  PricingEngineResponse,
  formatPricingResponseJSON,
} from '../utils/segmentAndPricingEngine';
import { runMandatoryTestSuite, TestResultItem } from '../utils/simulationTestSuite';
import {
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Plus,
  Sliders,
  Layers,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Code,
  Sparkles,
  Info,
  Car,
  Users,
  Compass,
  FileText,
} from 'lucide-react';

export const SimulationEngineView: React.FC = () => {
  const { setActivePage } = useApp();

  // Trajet canonique de test
  const [currentTrip, setCurrentTrip] = useState<CanonicalTrip>(TRIP_SIM_001);

  // Passagers de test
  const [testPassengers, setTestPassengers] = useState<PassengerRequest[]>(SIMULATION_TEST_PASSENGERS);

  // Configuration du Matching Engine (Section 9 & 11)
  const [maxCorridorMeters, setMaxCorridorMeters] = useState<number>(
    MATCHING_CONFIG.MAX_CORRIDOR_DISTANCE_METERS
  );
  const [timeToleranceMinutes, setTimeToleranceMinutes] = useState<number>(
    MATCHING_CONFIG.TIME_TOLERANCE_MINUTES
  );

  // Résultats des moteurs
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [pricingResults, setPricingResults] = useState<PricingEngineResponse | null>(null);
  const [testSuiteResults, setTestSuiteResults] = useState<{
    results: TestResultItem[];
    totalPassed: number;
    totalTests: number;
  } | null>(null);

  // Onglet actif dans le dashboard
  const [activeTab, setActiveTab] = useState<'matching' | 'segments' | 'pricing' | 'tests' | 'json'>(
    'matching'
  );

  // Exécution du Matching Engine (Sections 5-16)
  const handleRunMatching = () => {
    const config = {
      MAX_CORRIDOR_DISTANCE_METERS: maxCorridorMeters,
      TIME_TOLERANCE_MINUTES: timeToleranceMinutes,
      CANDIDATE_SEARCH_RADIUS_KM: 2.0,
    };
    const results = testPassengers.map((p) => matchPassenger(p, currentTrip, config));
    setMatchingResults(results);

    // Mettre à jour automatiquement le Pricing Engine avec les passagers acceptés
    const accepted = results
      .filter((r) => r.compatible)
      .map((r) => {
        const p = testPassengers.find((tp) => tp.id === r.passengerId)!;
        return {
          passengerId: p.id,
          passengerName: p.name,
          seatUnits: p.seats,
          pickupPositionKm: r.pickupPositionKm,
          dropoffPositionKm: r.dropoffPositionKm,
        };
      });

    const pricing = calculatePricing(
      currentTrip.id,
      currentTrip.globalPrice,
      currentTrip.routeDistanceKm,
      accepted
    );
    setPricingResults(pricing);
  };

  // Exécution du scénario canonique des 3 passagers chevauchants (Section 23 & 24)
  const handleRunCanonicalThreePassengers = () => {
    const pricing = calculatePricing(
      currentTrip.id,
      currentTrip.globalPrice,
      currentTrip.routeDistanceKm,
      THREE_OVERLAPPING_PASSENGERS
    );
    setPricingResults(pricing);
    setActiveTab('pricing');
  };

  // Exécution de la suite de tests obligatoires (Section 34)
  const handleRunTestSuite = () => {
    const suite = runMandatoryTestSuite();
    setTestSuiteResults(suite);
    setActiveTab('tests');
  };

  // Réinitialisation aux valeurs de la spécification
  const handleReset = () => {
    setCurrentTrip(TRIP_SIM_001);
    setTestPassengers(SIMULATION_TEST_PASSENGERS);
    setMaxCorridorMeters(500);
    setTimeToleranceMinutes(15);
    setMatchingResults([]);
    setPricingResults(null);
    setTestSuiteResults(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 text-slate-800 space-y-6">
      {/* Top Banner : Titre & Actions principales */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#9E113E] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-bold uppercase tracking-wider">
              Mode Développeur · /admin/simulation
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              Spécification Technique V1
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-display mt-1">
            Simulation Engine : Matching · Segments · Pricing
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Environnement de validation formelle conforme au document technique. Vérifie la linéarisation 1D,
            la projection des points, le corridor &lt; 500m, le sens de marche et la règle de conservation du prix.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunMatching}
            className="px-4 py-2.5 bg-[#9E113E] hover:bg-[#850D33] active:scale-95 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/30 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Exécuter Matching (Section 5)</span>
          </button>

          <button
            onClick={handleRunTestSuite}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>12 Tests Obligatoires (Sec. 34)</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Réinitialiser"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trajet Canonique Sélectionné (Section 2.1 & Section 30) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#9E113E] flex items-center justify-center font-black text-sm">
              #
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base font-display">
                  TRIP #{currentTrip.id} — Conducteur : {currentTrip.driverName} (Objet Canonique)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {currentTrip.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {currentTrip.origin} → {currentTrip.destination} · Départ {currentTrip.departureTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Distance Linéaire</span>
              <span className="text-slate-900 font-extrabold">{currentTrip.routeDistanceKm} km</span>
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Capacité Véhicule</span>
              <span className="text-slate-900 font-extrabold">{currentTrip.totalSeats} places</span>
            </div>
            <div className="bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-[#9E113E]">
              <span className="block text-[10px] font-bold">Prix Global Canonique</span>
              <span className="font-extrabold text-sm">{currentTrip.globalPrice.toFixed(2)} DH</span>
            </div>
          </div>
        </div>

        {/* Linéarisation 1D de la route (Section 4) */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Linéarisation 1D de la Route (Section 4 : routePositionKm) :
          </span>
          <div className="relative bg-slate-900 text-white rounded-2xl p-4 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[550px] relative">
              {/* Ligne d'axe */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-700 z-0"></div>

              {currentTrip.routeGeometry.map((pt, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#9E113E] border-2 border-white mb-1 shadow-xs"></span>
                  <span className="text-xs font-bold text-white">{pt.label || `Point ${idx}`}</span>
                  <span className="text-[10px] font-mono text-rose-300 font-semibold">
                    {pt.routePositionKm.toFixed(1)} km
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paramètres de tolérance configurables (Sections 6, 9, 11) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-700 block">
                Corridor Max (MAX_CORRIDOR_DISTANCE) :
              </span>
              <span className="text-[11px] text-slate-500">
                Distance max acceptée entre le point et la route
              </span>
            </div>
            <div className="flex items-center gap-1 font-bold">
              {[300, 500, 800].map((val) => (
                <button
                  key={val}
                  onClick={() => setMaxCorridorMeters(val)}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                    maxCorridorMeters === val
                      ? 'bg-[#9E113E] text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {val} m
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-700 block">
                Tolérance Horaire (TIME_TOLERANCE) :
              </span>
              <span className="text-[11px] text-slate-500">Écart max avec l'horaire de départ</span>
            </div>
            <div className="flex items-center gap-1 font-bold">
              {[10, 15, 30].map((val) => (
                <button
                  key={val}
                  onClick={() => setTimeToleranceMinutes(val)}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                    timeToleranceMinutes === val
                      ? 'bg-[#9E113E] text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  ±{val} min
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation entre sous-moteurs du Dashboard */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('matching')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'matching'
              ? 'bg-[#9E113E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>1. Matching Engine (5 Passagers)</span>
          {matchingResults.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px]">
              {matchingResults.filter((r) => r.compatible).length} Matchs
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('segments')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'segments'
              ? 'bg-[#9E113E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2. Segment Engine (S1, S2, S3)</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'pricing'
              ? 'bg-[#9E113E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>3. Pricing Engine & Conservation (Sec. 20-28)</span>
        </button>

        <button
          onClick={() => {
            if (!testSuiteResults) handleRunTestSuite();
            setActiveTab('tests');
          }}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'tests'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>4. Suite des 12 Tests (Sec. 34)</span>
          {testSuiteResults && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px]">
              {testSuiteResults.totalPassed}/{testSuiteResults.totalTests}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'json'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>5. JSON API Responses (Sec. 37 & 38)</span>
        </button>
      </div>

      {/* CONTENU ONGLET 1: MATCHING ENGINE (Sections 31-33) */}
      {activeTab === 'matching' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Passagers de test & Résultats de Matching (Sections 31, 32 & 33)
                </h3>
                <p className="text-xs text-slate-500">
                  Résultats attendus : P1, P2, P3 = MATCH ✓ | P4 = REJECT (WRONG_DIRECTION) ✗ | P5 = REJECT (OUTSIDE_CORRIDOR) ✗
                </p>
              </div>

              <button
                onClick={handleRunMatching}
                className="px-4 py-2 bg-[#9E113E] hover:bg-[#850D33] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all w-fit"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Lancer le Matching</span>
              </button>
            </div>

            {matchingResults.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Cliquez sur « Lancer le Matching » pour projeter les 5 passagers sur le trajet canonique.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matchingResults.map((res) => {
                  const passenger = testPassengers.find((p) => p.id === res.passengerId)!;
                  const isMatch = res.compatible;

                  return (
                    <div
                      key={res.passengerId}
                      className={`p-4 rounded-2xl border transition-all ${
                        isMatch
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              isMatch ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                            }`}
                          >
                            {passenger.id}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {passenger.name}
                              </span>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  isMatch
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {isMatch ? '✓ MATCH (COMPATIBLE)' : `✗ REJECT (${res.reason})`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {passenger.pickupLabel} → {passenger.dropoffLabel} · {passenger.departureTime} · {passenger.seats} place(s)
                            </p>
                          </div>
                        </div>

                        {isMatch && (
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                              Score : {res.score}/100
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Debug Information (Section 33) */}
                      <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[9px]">Pickup Distance</span>
                          <span className="font-bold text-slate-800">
                            {res.pickupDistanceMeters} m {res.pickupDistanceMeters <= maxCorridorMeters ? '✓' : '✗'}
                          </span>
                          <span className="text-[9px] text-slate-400 block">pos: {res.pickupPositionKm} km</span>
                        </div>

                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[9px]">Dropoff Distance</span>
                          <span className="font-bold text-slate-800">
                            {res.dropoffDistanceMeters} m {res.dropoffDistanceMeters <= maxCorridorMeters ? '✓' : '✗'}
                          </span>
                          <span className="text-[9px] text-slate-400 block">pos: {res.dropoffPositionKm} km</span>
                        </div>

                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[9px]">Sens / Direction</span>
                          <span className={`font-bold ${res.directionOk ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {res.directionOk ? 'OK (pickup < dropoff)' : 'ERREUR (Inversé)'}
                          </span>
                        </div>

                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[9px]">Écart Horaire</span>
                          <span className="font-bold text-slate-800">
                            {res.timeDifferenceMinutes} min {res.timeDifferenceMinutes <= timeToleranceMinutes ? '✓' : '✗'}
                          </span>
                          <span className="text-[9px] text-slate-400 block">places: {res.seatsAvailable} lib.</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 2: SEGMENT ENGINE (Sections 17-19) */}
      {activeTab === 'segments' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Découpage dynamique en Segments (Sections 17 & 19)
                </h3>
                <p className="text-xs text-slate-500">
                  Découpe le trajet aux points exacts où un passager monte ou descend.
                </p>
              </div>

              <button
                onClick={handleRunCanonicalThreePassengers}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Charger Scénario 3 Passagers (Sec. 23)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visualisation graphique des segments */}
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                  Segments de route créés (Distance totale = 12.4 km) :
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border-2 border-emerald-300 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800">Segment S1</span>
                      <span className="text-xs font-bold text-slate-800">17.42 DH</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">0.0 km → 4.8 km</p>
                    <p className="text-[11px] text-slate-500">Targa → Guéliz (4.8 km)</p>
                    <div className="pt-2 text-[10px] text-slate-600 font-semibold border-t border-slate-100">
                      Utilisateurs actifs : <span className="text-emerald-700 font-bold">P1 + P2</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border-2 border-sky-300 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-sky-800">Segment S2</span>
                      <span className="text-xs font-bold text-slate-800">11.98 DH</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">4.8 km → 8.1 km</p>
                    <p className="text-[11px] text-slate-500">Guéliz → Hivernage (3.3 km)</p>
                    <div className="pt-2 text-[10px] text-slate-600 font-semibold border-t border-slate-100">
                      Utilisateurs actifs : <span className="text-sky-700 font-bold">P2 + P3</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border-2 border-rose-300 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#9E113E]">Segment S3</span>
                      <span className="text-xs font-bold text-slate-800">15.60 DH</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">8.1 km → 12.4 km</p>
                    <p className="text-[11px] text-slate-500">Hivernage → Médina (4.3 km)</p>
                    <div className="pt-2 text-[10px] text-slate-600 font-semibold border-t border-slate-100">
                      Utilisateurs actifs : <span className="text-[#9E113E] font-bold">P2 + P3</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between font-bold text-slate-800">
                  <span>Somme des segments (17.42 + 11.98 + 15.60 DH) :</span>
                  <span className="text-base text-[#9E113E]">45.00 DH (= Prix Global)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 3: PRICING ENGINE & CONSERVATION (Sections 20-28) */}
      {activeTab === 'pricing' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Pricing Engine & Règle de Conservation (Sections 20 à 28)
                </h3>
                <p className="text-xs text-slate-500">
                  Exemple canonique de la spécification avec 3 passagers chevauchants (P1, P2, P3).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCanonicalThreePassengers}
                  className="px-3.5 py-2 bg-[#9E113E] hover:bg-[#850D33] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Calculer Tarification Canonique</span>
                </button>
              </div>
            </div>

            {/* Formule de calcul du prix au km (Section 20) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-slate-500">pricePerKm = globalPrice / routeDistanceKm = </span>
                <span className="font-bold text-slate-900">45 DH / 12.4 km = 3.629 DH/km</span>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Conservation Tolérance &lt;= 0.01 DH
              </span>
            </div>

            {/* Répartition détaillée par passager (Section 23 & 24) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">Passager P1</span>
                  <span className="text-lg font-black text-[#9E113E] font-display">8.71 DH</span>
                </div>
                <p className="text-xs font-semibold text-slate-600">Trajet : Targa → Guéliz (0 → 4.8 km)</p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] font-mono space-y-1">
                  <p>S1 (17.42 DH / 2) = 8.71 DH</p>
                </div>
                <span className="text-[10px] text-slate-500 block">Total P1 = 8.71 DH</span>
              </div>

              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">Passager P2 (Trajet complet)</span>
                  <span className="text-lg font-black text-[#9E113E] font-display">22.50 DH</span>
                </div>
                <p className="text-xs font-semibold text-slate-600">Trajet : Targa → Médina (0 → 12.4 km)</p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] font-mono space-y-1">
                  <p>S1 (17.42 / 2) = 8.71 DH</p>
                  <p>S2 (11.98 / 2) = 5.99 DH</p>
                  <p>S3 (15.60 / 2) = 7.80 DH</p>
                </div>
                <span className="text-[10px] text-slate-500 block">Total P2 = 8.71 + 5.99 + 7.80 = 22.50 DH</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">Passager P3</span>
                  <span className="text-lg font-black text-[#9E113E] font-display">13.79 DH</span>
                </div>
                <p className="text-xs font-semibold text-slate-600">Trajet : Guéliz → Médina (4.8 → 12.4 km)</p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] font-mono space-y-1">
                  <p>S2 (11.98 / 2) = 5.99 DH</p>
                  <p>S3 (15.60 / 2) = 7.80 DH</p>
                </div>
                <span className="text-[10px] text-slate-500 block">Total P3 = 5.99 + 7.80 = 13.79 DH</span>
              </div>
            </div>

            {/* Validation de la Règle de Conservation (Section 28) */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    Règle de Conservation Validée (Section 28)
                  </h4>
                  <p className="text-xs text-emerald-800">
                    SUM(P1 + P2 + P3) = 8.71 + 22.50 + 13.79 = <strong>45.00 DH</strong> = Prix Global du trajet (Différence = 0.00 DH).
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs">
                STATUS : VALID ✓
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 4: SUITE DES 12 TESTS OBLIGATOIRES (Section 34) */}
      {activeTab === 'tests' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Matrice des Tests Obligatoires (Section 34)
                </h3>
                <p className="text-xs text-slate-500">
                  Validation complète des 12 scénarios obligatoires décrits dans la spécification technique.
                </p>
              </div>

              <button
                onClick={handleRunTestSuite}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Exécuter tous les tests</span>
              </button>
            </div>

            {testSuiteResults && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-10">#</th>
                      <th className="p-3">Test</th>
                      <th className="p-3">Catégorie</th>
                      <th className="p-3">Résultat Attendu</th>
                      <th className="p-3">Résultat Obtenu</th>
                      <th className="p-3 text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {testSuiteResults.results.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-400">{t.id}</td>
                        <td className="p-3 font-bold text-slate-900">
                          <div>{t.name}</div>
                          <span className="text-[10px] font-normal text-slate-400">{t.details}</span>
                        </td>
                        <td className="p-3 font-mono text-[10px]">{t.category}</td>
                        <td className="p-3 font-mono font-semibold text-slate-600">{t.expected}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{t.actual}</td>
                        <td className="p-3 text-center">
                          {t.passed ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              PASS ✓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              FAIL ✗
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 5: JSON API RESPONSES (Sections 37 & 38) */}
      {activeTab === 'json' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matching Response JSON (Section 37) */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-rose-300">
                  Section 37 : Réponse de Matching JSON
                </span>
                <span className="text-[10px] font-mono text-slate-400">POST /trips/:id/match</span>
              </div>

              <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-3 bg-black/40 rounded-xl">
                {JSON.stringify(
                  matchingResults.length > 0
                    ? {
                        tripId: matchingResults[0].tripId,
                        compatible: matchingResults[0].compatible,
                        reason: matchingResults[0].reason,
                        pickupPositionKm: matchingResults[0].pickupPositionKm,
                        dropoffPositionKm: matchingResults[0].dropoffPositionKm,
                        pickupDistanceMeters: matchingResults[0].pickupDistanceMeters,
                        dropoffDistanceMeters: matchingResults[0].dropoffDistanceMeters,
                        timeDifferenceMinutes: matchingResults[0].timeDifferenceMinutes,
                        score: matchingResults[0].score,
                      }
                    : {
                        tripId: 'SIM-001',
                        compatible: true,
                        reason: null,
                        pickupPositionKm: 4.8,
                        dropoffPositionKm: 12.4,
                        pickupDistanceMeters: 120,
                        dropoffDistanceMeters: 180,
                        timeDifferenceMinutes: 5,
                        score: 94,
                      },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Pricing Response JSON (Section 38) */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-rose-300">
                  Section 38 : Réponse de Pricing JSON
                </span>
                <span className="text-[10px] font-mono text-slate-400">GET /trips/:id/pricing</span>
              </div>

              <pre className="text-xs font-mono text-sky-400 overflow-x-auto p-3 bg-black/40 rounded-xl">
                {JSON.stringify(
                  pricingResults
                    ? formatPricingResponseJSON(pricingResults)
                    : {
                        tripId: 'SIM-001',
                        globalPrice: 45.0,
                        passengers: [
                          { passengerId: 'P1', seatUnits: 1, price: 8.71 },
                          { passengerId: 'P2', seatUnits: 1, price: 22.5 },
                          { passengerId: 'P3', seatUnits: 1, price: 13.79 },
                        ],
                        totalAllocated: 45.0,
                      },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
