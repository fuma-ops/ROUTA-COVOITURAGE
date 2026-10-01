import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Car,
  Users,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  MapPin,
  Fuel,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

export const SplashModal: React.FC = () => {
  const {
    showSplash,
    setShowSplash,
    setShowCreateProfileModal,
    setCreateProfileRoleDefault,
  } = useApp();
  const [slide, setSlide] = useState(0);

  if (!showSplash) return null;

  const slides = [
    {
      title: 'Bienvenue sur Routa Maroc',
      subtitle: 'Le réseau national de covoiturage solidaire au Maroc',
      description:
        'Une plateforme 100% transparente dédiée au partage des frais de déplacement réels, sans commission commerciale de plateforme (0 DH de commission).',
      badge: 'Cahier des Charges · Conforme Réglementation',
      icon: (
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-white to-rose-100 text-[#9E113E] flex items-center justify-center shadow-xl">
          <span className="font-extrabold text-3xl font-display">R</span>
        </div>
      ),
      points: [
        '0% de commission prélevée sur vos trajets',
        'Partage des coûts réels de carburant, usure et péages',
        'Circulation fluide et réduction du trafic interurbain',
      ],
    },
    {
      title: 'Rôles stricts & Réglementation',
      subtitle: 'Les passagers ne peuvent pas proposer de trajets',
      description:
        'Pour respecter strictement la législation marocaine et lutter contre le transport clandestin, la publication est strictement encadrée.',
      badge: 'Section 26 & Section 33',
      icon: (
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-50 to-rose-100 text-[#9E113E] flex items-center justify-center shadow-xl">
          <Car className="w-10 h-10" />
        </div>
      ),
      rolesCompare: true,
    },
    {
      title: 'Sécurité & Confiance Nationale',
      subtitle: 'Vérification complète de chaque utilisateur marocain',
      description:
        'Chaque profil est rattaché à une identité réelle vérifiée pour garantir des trajets sereins entre citoyens.',
      badge: 'Vérification Officielle',
      icon: (
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-700 flex items-center justify-center shadow-xl">
          <ShieldCheck className="w-10 h-10" />
        </div>
      ),
      points: [
        'Carte Nationale d’Identité (CIN) requise',
        'Permis de conduire marocain validé pour les conducteurs',
        'Numéro de téléphone marocain (+212) confirmé par SMS',
        'Véhicule homologué avec carte grise et immatriculation',
      ],
    },
    {
      title: 'Créez votre profil sur mesure',
      subtitle: 'Passager ou Conducteur, rejoignez Routa en 1 minute',
      description:
        'Configurez votre compte selon vos besoins quotidiens de mobilité solidaire partout au Maroc.',
      badge: 'Inscription Immédiate',
      icon: (
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-[#9E113E] text-white flex items-center justify-center shadow-xl">
          <Sparkles className="w-10 h-10" />
        </div>
      ),
      actionSlide: true,
    },
  ];

  const currentSlide = slides[slide];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      setShowSplash(false);
    }
  };

  const handlePrev = () => {
    if (slide > 0) {
      setSlide(slide - 1);
    }
  };

  const handleStartCreateProfile = (role: 'driver' | 'passenger') => {
    setShowSplash(false);
    setCreateProfileRoleDefault(role);
    setShowCreateProfileModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
        {/* Top skip & close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E113E] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            {currentSlide.badge}
          </span>
          <button
            onClick={() => setShowSplash(false)}
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 font-semibold"
          >
            <span>Passer</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Content */}
        <div className="py-6 flex-1 flex flex-col items-center text-center">
          <div className="mb-4">{currentSlide.icon}</div>

          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-1.5">
            {currentSlide.title}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#9E113E] mb-3">
            {currentSlide.subtitle}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mb-5">
            {currentSlide.description}
          </p>

          {/* Conditional Slide 2: Strict roles comparison */}
          {currentSlide.rolesCompare && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left my-2">
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2 mb-1.5 text-emerald-800 font-bold text-xs">
                  <Car className="w-4 h-4 text-emerald-600" />
                  <span>Conducteur</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ✓ Permis & véhicule enregistrés<br />
                  ✓ <strong>Seul autorisé</strong> à publier des trajets<br />
                  ✓ Partage ses frais sans bénéfice
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200">
                <div className="flex items-center gap-2 mb-1.5 text-[#9E113E] font-bold text-xs">
                  <Users className="w-4 h-4 text-[#9E113E]" />
                  <span>Passager</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ✓ Recherche et réserve des places<br />
                  ⚠️ <strong>Interdit de proposer</strong> des trajets<br />
                  ✓ Paiement de la contribution équitable
                </p>
              </div>
            </div>
          )}

          {/* Conditional Slide Points list */}
          {currentSlide.points && (
            <div className="space-y-2 text-left w-full max-w-md bg-slate-50 p-4 rounded-2xl border border-slate-200/80 my-2">
              {currentSlide.points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          )}

          {/* Conditional Slide 4: Real Profile Creation Actions */}
          {currentSlide.actionSlide && (
            <div className="w-full max-w-md space-y-2.5 my-2">
              <button
                onClick={() => handleStartCreateProfile('driver')}
                className="w-full p-3.5 bg-[#9E113E] hover:bg-[#850D33] text-white rounded-xl font-bold text-xs flex items-center justify-between shadow-md shadow-[#9E113E]/20 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4" />
                  <span>+ Créer un profil Conducteur (pour publier)</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleStartCreateProfile('passenger')}
                className="w-full p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#9E113E]" />
                  <span>+ Créer un profil Passager (pour réserver)</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={slide === 0}
            className={`p-2 rounded-xl text-slate-600 flex items-center gap-1 text-xs font-semibold ${
              slide === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === slide ? 'w-6 bg-[#9E113E]' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-[#9E113E] hover:bg-[#850D33] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
          >
            <span>{slide === slides.length - 1 ? 'Commencer' : 'Suivant'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
