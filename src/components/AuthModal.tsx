import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    loginWithPhone,
    usersList,
    setShowCreateProfileModal,
    setCreateProfileRoleDefault,
  } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const [city, setCity] = useState('Marrakech');
  const [smsSent, setSmsSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!showAuthModal) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      setErrorMessage('Veuillez saisir un numéro de téléphone marocain valide.');
      return;
    }

    if (!isSignUp) {
      // Check if user already exists
      const exists = usersList.some(
        (u) =>
          u.phone.replace(/[^0-9]/g, '').includes(cleanPhone) ||
          cleanPhone.includes(u.phone.replace(/[^0-9]/g, ''))
      );

      if (!exists) {
        setErrorMessage(
          'Aucun compte associé à ce numéro marocain. Créez votre compte en 1 minute.'
        );
        return;
      }
    }

    setSmsSent(true);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerified(true);
    setTimeout(() => {
      loginWithPhone(phone, isSignUp ? firstName : undefined, isSignUp ? lastName : undefined);
      setShowAuthModal(false);
      setSmsSent(false);
      setVerified(false);
      setOtpCode('');
      setErrorMessage('');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#9E113E] text-white flex items-center justify-center font-bold text-sm">
              R
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              {isSignUp ? 'Créer un compte Routa' : 'Connexion à votre compte'}
            </h3>
          </div>
          <button
            onClick={() => {
              setShowAuthModal(false);
              setSmsSent(false);
              setVerified(false);
              setErrorMessage('');
            }}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {verified ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">Connexion réussie</h4>
            <p className="text-xs text-slate-500 mt-1">Bienvenue sur Routa Maroc !</p>
          </div>
        ) : !smsSent ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4 text-xs">
            <p className="text-slate-500 leading-relaxed">
              {isSignUp
                ? 'Renseignez vos coordonnées pour rejoindre la communauté solidaire.'
                : 'Saisissez votre numéro de téléphone marocain pour vous identifier en toute sécurité.'}
            </p>

            {errorMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-xs">{errorMessage}</p>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setErrorMessage('');
                      }}
                      className="text-[11px] text-[#9E113E] font-bold underline mt-1 block"
                    >
                      Créer un nouveau compte avec ce numéro →
                    </button>
                  )}
                </div>
              </div>
            )}

            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Prénom</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="ex: Yassine"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nom</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="ex: El Mansouri"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ville de résidence</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Marrakech">Marrakech</option>
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Tanger">Tanger</option>
                    <option value="Fès">Fès</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Meknès">Meknès</option>
                    <option value="Oujda">Oujda</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Numéro de téléphone marocain (+212)
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2.5 bg-slate-100 rounded-xl font-bold text-slate-700 border border-slate-200 shrink-0">
                  🇲🇦 +212
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="06 12 34 56 78"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#9E113E] hover:bg-[#850D33] text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <span>Continuer par SMS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 text-center space-y-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMessage('');
                }}
                className="text-slate-600 hover:text-[#9E113E] font-medium block mx-auto text-xs"
              >
                {isSignUp
                  ? 'Déjà un compte ? Se connecter avec son numéro'
                  : 'Pas encore inscrit ? Créer un compte'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  setCreateProfileRoleDefault('driver');
                  setShowCreateProfileModal(true);
                }}
                className="text-xs font-bold text-[#9E113E] hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Créer un profil Conducteur certifié (Permis & Véhicule) →</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Un code de validation SMS a été envoyé au <span className="font-bold">+212 {phone}</span>.
            </p>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Code de validation (SMS)</label>
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Ex: 1234"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-mono tracking-widest font-bold"
                required
                autoFocus
              />
              <span className="text-[10px] text-slate-400 block mt-1 text-center">
                Saisissez les 4 chiffres reçus par SMS pour accéder à votre compte.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#9E113E] hover:bg-[#850D33] text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              Valider et se connecter
            </button>

            <button
              type="button"
              onClick={() => setSmsSent(false)}
              className="w-full text-center text-slate-500 hover:text-slate-800 text-[11px] mt-2 block"
            >
              Modifier le numéro de téléphone
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
