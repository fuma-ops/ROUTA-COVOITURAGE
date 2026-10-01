import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MarrakechArtwork } from './MarrakechArtwork';
import {
  Car,
  Users,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  LogIn,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

export const WelcomeGateway: React.FC = () => {
  const {
    setShowAuthModal,
    setShowCreateProfileModal,
    setCreateProfileRoleDefault,
  } = useApp();

  const [slide, setSlide] = useState(0);

  const slides = [
    {
      badge: 'Covoiturage Solidaire au Maroc',
      title: 'Voyagez autrement partout au Maroc',
      subtitle: 'Partagez la route, partagez les frais · 0% de commission',
      description:
        'Une plateforme 100% solidaire dédiée au partage équitable des coûts réels de déplacement (carburant, usure, péages), sans frais commerciaux intermédiaires.',
      icon: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#9E113E] to-[#E11D48] text-white flex items-center justify-center shadow-xl">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v5" />
            <path d="M12 16v5" />
            <path d="M3 12h5" />
            <path d="M16 12h5" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          </svg>
        </div>
      ),
      points: [
        '0% de commission de plateforme sur vos trajets',
        'Calcul automatique et transparent du coût au kilomètre',
        'Trajets urbains et interurbains entre toutes les villes du Maroc',
      ],
    },
    {
      badge: 'Conformité & Sécurité',
      title: 'Rôles stricts & Encadrement légal',
      subtitle: 'Conducteurs vérifiés · Passagers protégés',
      description:
        'Conformément à la réglementation marocaine, seuls les conducteurs disposant d’un permis et d’un véhicule validé peuvent proposer des trajets.',
      icon: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-xl">
          <Car className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
      ),
      rolesCompare: true,
    },
    {
      badge: 'Confiance & Identité Nationale',
      title: 'Une communauté 100% vérifiée',
      subtitle: 'Sécurité maximale à chaque trajet',
      description:
        'Chaque utilisateur est identifié avec son numéro marocain (+212) et sa Carte Nationale d’Identité pour des déplacements sereins.',
      icon: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xl">
          <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
      ),
      points: [
        'Numéro de téléphone marocain (+212) vérifié par SMS',
        'Carte Nationale d’Identité (CIN) contrôlée',
        'Permis de conduire et immatriculation vérifiés pour les conducteurs',
        'Avis et évaluations authentiques de la communauté',
      ],
    },
  ];

  const currentSlide = slides[slide];

  const handleOpenLogin = () => {
    setShowAuthModal(true);
  };

  const handleOpenSignUp = (role: 'passenger' | 'driver' = 'passenger') => {
    setCreateProfileRoleDefault(role);
    setShowCreateProfileModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between relative overflow-hidden">
      {/* Background panoramic art */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2000&q=85"
          alt="Route et paysages du Maroc"
          className="w-full h-full object-cover object-center scale-105 opacity-20 mix-blend-multiply"
        />
        <div className="absolute inset-0 opacity-70">
          <MarrakechArtwork className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-rose-100/40 via-white/70 to-[#F8F9FA]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#9E113E] to-[#E11D48] flex items-center justify-center text-white shadow-md">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v5" />
              <path d="M12 16v5" />
              <path d="M3 12h5" />
              <path d="M16 12h5" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-[#9E113E] font-display block leading-none">
              Routa
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Maroc · Covoiturage Solidaire
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            0% Commission
          </span>
        </div>
      </header>

      {/* Center Presentation Card */}
      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-8 flex flex-col justify-center">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 text-slate-900 flex flex-col justify-between min-h-[480px]">
          {/* Slide Top Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9E113E] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              {currentSlide.badge}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Étape {slide + 1} / {slides.length}
            </span>
          </div>

          {/* Slide Body */}
          <div className="py-5 flex-1 flex flex-col items-center text-center">
            <div className="mb-4 transform hover:scale-105 transition-transform">
              {currentSlide.icon}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-1.5">
              {currentSlide.title}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#9E113E] mb-3">
              {currentSlide.subtitle}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mb-4">
              {currentSlide.description}
            </p>

            {/* Strict Roles View */}
            {currentSlide.rolesCompare && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left my-1">
                <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1 text-emerald-800 font-bold text-xs">
                    <Car className="w-4 h-4 text-emerald-600" />
                    <span>Profil Conducteur</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    ✓ Permis & véhicule certifiés<br />
                    ✓ <strong>Seul autorisé</strong> à proposer des trajets<br />
                    ✓ Partage les frais réels
                  </p>
                </div>

                <div className="p-3.5 bg-rose-50/90 rounded-2xl border border-rose-200">
                  <div className="flex items-center gap-2 mb-1 text-[#9E113E] font-bold text-xs">
                    <Users className="w-4 h-4 text-[#9E113E]" />
                    <span>Profil Passager</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    ✓ Réserve des places en 1 clic<br />
                    ⚠️ <strong>Interdit</strong> de publier des trajets<br />
                    ✓ Contribution équitable
                  </p>
                </div>
              </div>
            )}

            {/* Points list */}
            {currentSlide.points && (
              <div className="space-y-2 text-left w-full max-w-md bg-slate-50 p-4 rounded-2xl border border-slate-200/80 my-1">
                {currentSlide.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carousel Dots & Slider Control */}
          <div className="py-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSlide(Math.max(0, slide - 1))}
              disabled={slide === 0}
              className={`p-1.5 rounded-lg text-slate-500 flex items-center gap-1 text-xs font-semibold ${
                slide === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === slide ? 'w-6 bg-[#9E113E]' : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={`Étape ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSlide(Math.min(slides.length - 1, slide + 1))}
              disabled={slide === slides.length - 1}
              className={`p-1.5 rounded-lg text-slate-500 flex items-center gap-1 text-xs font-semibold ${
                slide === slides.length - 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-slate-100'
              }`}
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Main Action Buttons: Se connecter ou Créer un profil */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleOpenLogin}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Se connecter</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenSignUp('passenger')}
                className="w-full py-3.5 px-4 bg-[#9E113E] hover:bg-[#850D33] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-[#9E113E]/20 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Créer un profil</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleOpenSignUp('driver')}
              className="w-full text-center py-2 text-xs font-bold text-[#9E113E] hover:underline flex items-center justify-center gap-1.5 transition-colors"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Vous êtes conducteur ? Enregistrez votre véhicule & permis ici →</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Routa Maroc · Covoiturage Solidaire National · 0% Commission</p>
      </footer>
    </div>
  );
};
