import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Vehicle, UserRole } from '../types';
import {
  X,
  User as UserIcon,
  Car,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';

const MOROCCAN_CITIES = [
  'Marrakech',
  'Casablanca',
  'Rabat',
  'Tanger',
  'Fès',
  'Agadir',
  'Meknès',
  'Oujda',
  'Tétouan',
  'Essaouira',
  'El Jadida',
  'Kénitra',
];

const AVATAR_PRESETS = [
  {
    name: 'Homme 1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
  },
  {
    name: 'Femme 1',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
  },
  {
    name: 'Homme 2',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
  },
  {
    name: 'Femme 2',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
  },
  {
    name: 'Homme 3',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
  },
  {
    name: 'Femme 3',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
  },
];

export const CreateProfileModal: React.FC = () => {
  const {
    showCreateProfileModal,
    setShowCreateProfileModal,
    addUser,
    createProfileRoleDefault,
    setActivePage,
  } = useApp();

  const [role, setRole] = useState<UserRole>(createProfileRoleDefault || 'passenger');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('06 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Marrakech');
  const [cin, setCin] = useState('EE');
  const [selectedPhoto, setSelectedPhoto] = useState(AVATAR_PRESETS[0].url);

  // Driver specific fields
  const [carBrand, setCarBrand] = useState('Dacia');
  const [carModel, setCarModel] = useState('Logan');
  const [carPlate, setCarPlate] = useState('12345 | أ | 26');
  const [carColor, setCarColor] = useState('Gris métallisé');
  const [carYear, setCarYear] = useState(2022);
  const [carSeats, setCarSeats] = useState(4);
  const [carAc, setCarAc] = useState(true);
  const [licenseNumber, setLicenseNumber] = useState('26/987654');

  if (!showCreateProfileModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userId = `user_${Date.now()}`;
    const vehicleId = role === 'driver' ? `veh_${userId}` : undefined;

    let newVehicle: Vehicle | undefined = undefined;
    if (role === 'driver') {
      newVehicle = {
        id: vehicleId!,
        user_id: userId,
        brand: carBrand,
        model: carModel,
        plate: carPlate,
        color: carColor,
        year: Number(carYear),
        seats: Number(carSeats),
        verified: true,
      };
    }

    const newUser: User = {
      id: userId,
      first_name: firstName.trim() || 'Utilisateur',
      last_name: lastName.trim() || 'Routa',
      phone: phone.startsWith('+212') ? phone : `+212 ${phone.replace(/^0/, '')}`,
      email: email.trim() || `${firstName.toLowerCase() || 'user'}@routa.ma`,
      photo: selectedPhoto,
      city,
      rating: 5.0,
      review_count: 0,
      role,
      verification_status: {
        phone: true,
        identity: true,
        license: role === 'driver',
        vehicle: role === 'driver',
      },
      trips_as_driver: 0,
      trips_as_passenger: 0,
      created_at: new Date().toISOString().split('T')[0],
      vehicle_id: vehicleId,
    };

    addUser(newUser, newVehicle);
    setShowCreateProfileModal(false);

    // Navigate to relevant page
    if (role === 'driver') {
      setActivePage('publish');
    } else {
      setActivePage('home');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9E113E] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              R
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
                Créer un nouveau profil
              </h2>
              <p className="text-xs text-slate-500">
                Inscription instantanée · Conforme aux normes marocaines du covoiturage
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateProfileModal(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* 1. CHOIX DU RÔLE (FONDAMENTAL) */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              1. Choix du profil à créer :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option Passager */}
              <div
                onClick={() => setRole('passenger')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  role === 'passenger'
                    ? 'border-[#9E113E] bg-rose-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-[#9E113E] flex items-center justify-center font-bold">
                    🎒
                  </div>
                  {role === 'passenger' && (
                    <span className="w-5 h-5 rounded-full bg-[#9E113E] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">Profil Passager</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Recherche des trajets et réserve des places.
                </p>
                <span className="inline-block mt-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  ⚠️ Ne peut pas proposer de trajets
                </span>
              </div>

              {/* Option Conducteur */}
              <div
                onClick={() => setRole('driver')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  role === 'driver'
                    ? 'border-[#9E113E] bg-rose-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    🚗
                  </div>
                  {role === 'driver' && (
                    <span className="w-5 h-5 rounded-full bg-[#9E113E] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">Profil Conducteur</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Possède une voiture et publie des trajets pour partager ses frais.
                </p>
                <span className="inline-block mt-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ✓ Habilité à publier des annonces
                </span>
              </div>
            </div>
          </div>

          {/* 2. IDENTITÉ & COORDONNÉES */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Informations personnelles :
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ex: Mehdi"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#9E113E] focus:ring-1 focus:ring-[#9E113E]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="ex: Berrada"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#9E113E] focus:ring-1 focus:ring-[#9E113E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Téléphone marocain (+212) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 61 00 00 00"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#9E113E]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Ville de résidence *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#9E113E]"
                >
                  {MOROCCAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  N° CIN (Carte d'identité) *
                </label>
                <input
                  type="text"
                  required
                  value={cin}
                  onChange={(e) => setCin(e.target.value.toUpperCase())}
                  placeholder="ex: EE123456"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Photo de profil (Avatar marocain) :
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setSelectedPhoto(preset.url)}
                    className={`w-11 h-11 rounded-full overflow-hidden border-2 shrink-0 transition-transform ${
                      selectedPhoto === preset.url
                        ? 'border-[#9E113E] scale-105 shadow-md ring-2 ring-[#9E113E]/30'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. SECTION SPECIFIQUE CONDUCTEUR (SI ROLE === DRIVER) */}
          {role === 'driver' && (
            <div className="pt-3 border-t border-slate-100 space-y-3 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-800">
                <Car className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  3. Véhicule & Permis de conduire (Requis pour publier) :
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Marque</label>
                  <input
                    type="text"
                    required
                    value={carBrand}
                    onChange={(e) => setCarBrand(e.target.value)}
                    placeholder="ex: Dacia"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Modèle</label>
                  <input
                    type="text"
                    required
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    placeholder="ex: Logan"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Couleur</label>
                  <input
                    type="text"
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                    placeholder="ex: Blanc"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Année</label>
                  <input
                    type="number"
                    value={carYear}
                    onChange={(e) => setCarYear(Number(e.target.value))}
                    min={2000}
                    max={2026}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Immatriculation (Maroc)
                  </label>
                  <input
                    type="text"
                    required
                    value={carPlate}
                    onChange={(e) => setCarPlate(e.target.value)}
                    placeholder="12345 | أ | 26"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    N° Permis de conduire
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="26/123456"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Places passagers offertes
                  </label>
                  <select
                    value={carSeats}
                    onChange={(e) => setCarSeats(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value={1}>1 place</option>
                    <option value={2}>2 places</option>
                    <option value={3}>3 places</option>
                    <option value={4}>4 places (recommandé)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Validation instantanée : Carte grise et permis homologués pour la démo.</span>
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              Profil enregistré localement · Prêt pour vos tests réels
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowCreateProfileModal(false)}
                className="flex-1 sm:flex-none px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-3 bg-[#9E113E] hover:bg-[#850D33] active:scale-98 text-white font-bold rounded-xl shadow-md shadow-[#9E113E]/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Créer et activer ce profil</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
