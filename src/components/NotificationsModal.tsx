import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  X,
  CheckCircle2,
  MessageSquare,
  Clock,
  Car,
  Star,
  ShieldAlert,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';
import { AppNotification, NotificationType } from '../types';

export const NotificationsModal: React.FC = () => {
  const {
    showNotificationsModal,
    setShowNotificationsModal,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActivePage,
    setActiveConversationId,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!showNotificationsModal) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayedNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
      case 'NEW_BOOKING':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-4 h-4 text-[#9E113E]" />;
      case 'TRIP_REMINDER':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'NEW_PASSENGER':
        return <Car className="w-4 h-4 text-sky-600" />;
      case 'NEW_REVIEW':
        return <Star className="w-4 h-4 text-amber-500" />;
      case 'REPORT_UPDATE':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    setShowNotificationsModal(false);

    if (notif.type === 'NEW_MESSAGE') {
      setActiveConversationId('conv_yassine_imane');
      setActivePage('messages');
    } else if (
      notif.type === 'BOOKING_CONFIRMED' ||
      notif.type === 'TRIP_REMINDER' ||
      notif.type === 'TRIP_UPDATED' ||
      notif.type === 'TRIP_CANCELLED'
    ) {
      setActivePage('my-trips');
    } else if (notif.type === 'NEW_REVIEW') {
      setActivePage('profile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setShowNotificationsModal(false)}
      />

      {/* Sheet / Modal Container (Mobile bottom sheet & desktop centered dialog) */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#9E113E] flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold bg-[#9E113E] text-white px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Mises à jour de vos trajets et messages</p>
            </div>
          </div>

          <button
            onClick={() => setShowNotificationsModal(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Mark all as read */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 p-0.5 bg-slate-200/70 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                filter === 'unread'
                  ? 'bg-white text-[#9E113E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[#9E113E] hover:underline font-semibold flex items-center gap-1 text-[11px]"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tout marquer comme lu</span>
            </button>
          )}
        </div>

        {/* Notifications Scroll List */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-2 sm:p-3 space-y-1">
          {displayedNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-xs font-semibold text-slate-600">Aucune notification</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {filter === 'unread'
                  ? 'Vous avez lu toutes vos notifications.'
                  : 'Vos alertes de trajet apparaîtront ici.'}
              </p>
            </div>
          ) : (
            displayedNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-start gap-3 text-left ${
                  !n.read
                    ? 'bg-rose-50/70 border border-rose-100 hover:bg-rose-50'
                    : 'bg-white hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    !n.read ? 'bg-white shadow-xs' : 'bg-slate-100'
                  }`}
                >
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {n.created_at}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#9E113E]">
                    <span>Consulter</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>

                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-[#9E113E] shrink-0 mt-1.5 ring-2 ring-white" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={() => setShowNotificationsModal(false)}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
