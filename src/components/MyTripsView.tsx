import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';
import {
  Clock,
  Car,
  MessageSquare,
  ChevronRight,
  Star,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Navigation,
  Shield,
  Play,
  Bell,
} from 'lucide-react';
import { TripStatus } from '../types';

export const MyTripsView: React.FC = () => {
  const {
    currentUser,
    trips,
    bookings,
    cancelBooking,
    updateTripStatus,
    setActivePage,
    setSelectedTrip,
    setActiveConversationId,
    openRatingModal,
    notifications,
    setShowNotificationsModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Find user's trips as driver or passenger
  const myAsDriver = currentUser ? trips.filter((t) => t.driver_id === currentUser.id) : [];
  const myBookedTrips = currentUser
    ? bookings
        .filter((b) => b.passenger_id === currentUser.id)
        .map((b) => ({
          booking: b,
          trip: trips.find((t) => t.id === b.trip_id) || b.trip,
        }))
    : [];

  const allItems = [
    ...myAsDriver.map((t) => ({ type: 'driver' as const, trip: t, booking: null })),
    ...myBookedTrips.map((b) => ({ type: 'passenger' as const, trip: b.trip, booking: b.booking })),
  ];

  const filteredItems = allItems.filter((item) => {
    const status = item.booking?.status || item.trip.status;
    if (activeTab === 'upcoming') {
      return status === 'PUBLISHED' || status === 'PARTIALLY_BOOKED' || status === 'FULL' || status === 'CONFIRMED' || status === 'IN_PROGRESS' || status === 'PENDING';
    }
    if (activeTab === 'completed') {
      return status === 'COMPLETED';
    }
    if (activeTab === 'cancelled') {
      return status === 'CANCELLED';
    }
    return true;
  });

  const getStatusBadge = (status: TripStatus | string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            En cours
          </span>
        );
      case 'CONFIRMED':
      case 'PARTIALLY_BOOKED':
      case 'FULL':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Réservé
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            Terminé
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Annulé
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Mes trajets</h1>
          <p className="text-xs text-slate-500">
            Gérez vos départs en tant que passager ou conducteur
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification bell on Mes Trajets (matching mockup!) */}
          <button
            onClick={() => setShowNotificationsModal(true)}
            className="relative p-2 text-slate-600 hover:text-[#9E113E] rounded-full hover:bg-slate-100 transition-colors focus:outline-hidden"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#9E113E] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab switchers row */}
      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-[#9E113E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            À venir
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-[#9E113E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Passés
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'cancelled'
                ? 'bg-[#9E113E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annulés
          </button>
        </div>
      </div>



      {/* List of Trips */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Aucun trajet dans cet onglet</p>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'upcoming'
                ? 'Réservez votre prochain voyage ou publiez un itinéraire.'
                : 'L’historique apparaîtra ici une fois vos trajets terminés.'}
            </p>
            <button
              onClick={() => setActivePage('search')}
              className="mt-4 px-4 py-2 bg-[#9E113E] text-white text-xs font-semibold rounded-xl"
            >
              Rechercher un trajet
            </button>
          </div>
        ) : (
          filteredItems.map(({ type, trip, booking }) => {
            const isDriver = type === 'driver';
            const status = booking?.status || trip.status;

            return (
              <div
                key={booking?.id || trip.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-[#9E113E]/30 transition-all"
              >
                {/* Header row */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    <span className="text-xs text-slate-400 font-medium">
                      {isDriver ? 'Vous conduisez' : 'Vous êtes passager'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTrip(trip);
                      setActivePage('trip-detail');
                    }}
                    className="text-xs font-semibold text-[#9E113E] hover:underline"
                  >
                    Voir le détail
                  </button>
                </div>

                {/* Itinerary */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>{trip.origin}</span>
                      <span className="text-slate-400">→</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#9E113E]"></span>
                      <span>{trip.destination}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {trip.date} · {trip.departure_time}
                      </span>
                      <span>·</span>
                      <span>
                        {trip.reserved_seats}/{trip.available_seats} passagers
                      </span>
                    </div>
                  </div>

                  {/* Driver avatar & info */}
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      name={trip.driver.first_name}
                      photo={trip.driver.photo}
                      size="md"
                      verified={trip.driver.verification_status.identity}
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {trip.driver.first_name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ★ {trip.driver.rating} · {trip.vehicle.brand} {trip.vehicle.model}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions bottom strip */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Operational controls for simulation */}
                    {status !== 'COMPLETED' && status !== 'CANCELLED' && (
                      <button
                        onClick={() => updateTripStatus(trip.id, 'IN_PROGRESS')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        <span>Démarrer le trajet</span>
                      </button>
                    )}

                    {status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => updateTripStatus(trip.id, 'COMPLETED')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      >
                        Arrivée & Terminer
                      </button>
                    )}

                    {status === 'COMPLETED' && (
                      <button
                        onClick={() => openRatingModal(trip, trip.driver, !isDriver)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Évaluer le covoitureur</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {booking && status === 'CONFIRMED' && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        Annuler la place
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveConversationId('conv_yassine_imane');
                        setActivePage('messages');
                      }}
                      className="px-4 py-2 border border-[#9E113E] text-[#9E113E] hover:bg-rose-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ouvrir le chat</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
