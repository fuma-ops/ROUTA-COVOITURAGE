import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { Star, X, Check } from 'lucide-react';

export const RatingModal: React.FC = () => {
  const { showRatingModal, setShowRatingModal, ratingTarget, submitRating } = useApp();

  const [punctuality, setPunctuality] = useState(5);
  const [respect, setRespect] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [drivingOrReliability, setDrivingOrReliability] = useState(5);
  const [comment, setComment] = useState('');

  if (!showRatingModal || !ratingTarget) return null;

  const isPassengerRatingDriver = ratingTarget.isPassengerRatingDriver;
  const targetUser = ratingTarget.user;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRating({
      punctuality,
      respect,
      communication,
      drivingOrReliability,
      comment,
    });
  };

  const StarSelector: React.FC<{ value: number; onChange: (v: number) => void }> = ({
    value,
    onChange,
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-5 h-5 ${
                s <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-slate-900 font-display">
            Évaluer le trajet
          </h3>
          <button
            onClick={() => setShowRatingModal(false)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-5">
          <UserAvatar name={targetUser.first_name} photo={targetUser.photo} size="lg" />
          <div>
            <p className="text-sm font-bold text-slate-900">
              {targetUser.first_name} {targetUser.last_name}
            </p>
            <p className="text-xs text-slate-500">
              {isPassengerRatingDriver
                ? 'Votre conducteur sur ce trajet'
                : 'Votre passager sur ce trajet'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Criterion 1: Ponctualité */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Ponctualité</span>
            <StarSelector value={punctuality} onChange={setPunctuality} />
          </div>

          {/* Criterion 2: Respect */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Courtoisie & Respect</span>
            <StarSelector value={respect} onChange={setRespect} />
          </div>

          {/* Criterion 3: Communication */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Communication & Chat</span>
            <StarSelector value={communication} onChange={setCommunication} />
          </div>

          {/* Criterion 4: Conduite (Driver) ou Fiabilité (Passenger) */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">
              {isPassengerRatingDriver ? 'Qualité de conduite' : 'Fiabilité'}
            </span>
            <StarSelector
              value={drivingOrReliability}
              onChange={setDrivingOrReliability}
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Votre commentaire (visible sur le profil)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conducteur très sympa, ponctuel, trajet agréable..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#9E113E] hover:bg-[#850D33] text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              Publier mon évaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
