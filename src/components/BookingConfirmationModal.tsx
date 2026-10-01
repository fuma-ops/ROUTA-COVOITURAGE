import React from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  MapPin,
  MessageSquare,
  X,
  Share2,
} from 'lucide-react';

export const BookingConfirmationModal: React.FC = () => {
  const {
    showConfirmationModal,
    setShowConfirmationModal,
    lastBooking,
    setActivePage,
    setActiveConversationId,
  } = useApp();

  if (!showConfirmationModal || !lastBooking) return null;

  const trip = lastBooking.trip;
  const isPrivate = lastBooking.is_blocked_remaining;

  const handleOpenChat = () => {
    setShowConfirmationModal(false);
    setActiveConversationId(`conv_${trip.driver_id}_${lastBooking.passenger_id}`);
    setActivePage('messages');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex justify-end">
          <button
            onClick={() => setShowConfirmationModal(false)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Check Icon */}
        <div className="text-center -mt-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-display">
            {isPrivate ? 'Trajet privatisé confirmé !' : 'Réservation confirmée !'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isPrivate
              ? 'Toutes les places restantes sont bloquées pour votre confort.'
              : 'Votre place est garantie à bord.'}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs mb-5">
          {/* Driver */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <UserAvatar
                name={trip.driver.first_name}
                photo={trip.driver.photo}
                size="sm"
                verified={trip.driver.verification_status.identity}
              />
              <div>
                <p className="font-bold text-slate-900">{trip.driver.first_name}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {trip.vehicle.brand} {trip.vehicle.model} ({trip.vehicle.plate})
                </p>
              </div>
            </div>
            <span className="font-extrabold text-base text-[#9E113E]">
              {lastBooking.passenger_price} DH
            </span>
          </div>

          {/* Points */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold">Prise en charge :</span>
              <span>{lastBooking.pickup_point}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-2 h-2 rounded-full bg-[#9E113E]"></span>
              <span className="font-semibold">Dépose :</span>
              <span>{lastBooking.dropoff_point}</span>
            </div>
          </div>

          {/* Time & Places */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {trip.date} à {trip.departure_time}
            </span>
            <span className="font-bold text-slate-800">
              {lastBooking.seats_reserved} place{lastBooking.seats_reserved > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Primary Action Button (Action principale : ouvrir le chat) */}
        <div className="space-y-2">
          <button
            onClick={handleOpenChat}
            className="w-full py-3.5 bg-[#9E113E] hover:bg-[#850D33] active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#9E113E]/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ouvrir le chat avec {trip.driver.first_name}</span>
          </button>

          <button
            onClick={() => {
              setShowConfirmationModal(false);
              setActivePage('my-trips');
            }}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Voir dans Mes trajets
          </button>
        </div>
      </div>
    </div>
  );
};
