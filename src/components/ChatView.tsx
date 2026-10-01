import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';
import {
  Phone,
  MoreVertical,
  Send,
  MapPin,
  Car,
  Clock,
  CheckCircle,
  Paperclip,
  ArrowLeft,
  Shield,
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    currentUser,
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    sendMessage,
    setActivePage,
    setShowAuthModal,
    setShowCreateProfileModal,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-[#9E113E] flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
            Messagerie instantanée
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Connectez-vous pour échanger directement avec vos covoitureurs et organiser vos points de rencontre.
          </p>
          <div className="space-y-2.5">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 bg-[#9E113E] hover:bg-[#850D33] text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              Se connecter
            </button>
            <button
              onClick={() => setShowCreateProfileModal(true)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeMessages = activeConversationId
    ? messages[activeConversationId] || []
    : [];

  const otherParticipant =
    currentConv?.participants.find((p) => p.id !== currentUser.id) ||
    currentConv?.participants[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, inputMessage.trim(), 'text');
    setInputMessage('');
  };

  // Quick action buttons as mandated by Cahier des charges Section 14
  const triggerQuickAction = (type: 'location' | 'arrived' | 'late' | 'confirm') => {
    if (!activeConversationId) return;

    if (type === 'location') {
      sendMessage(
        activeConversationId,
        '📍 Emplacement partagé : Rond-point Targa (face café Starbucks).',
        'send_location'
      );
    } else if (type === 'arrived') {
      sendMessage(
        activeConversationId,
        '🚗 Je suis arrivé au point de rendez-vous.',
        'arrived'
      );
    } else if (type === 'late') {
      sendMessage(
        activeConversationId,
        '⏰ Je suis en retard de 5 minutes environ, désolé pour la gêne !',
        'late'
      );
    } else if (type === 'confirm') {
      sendMessage(
        activeConversationId,
        '🤝 Point de rendez-vous confirmé : Entrée de Guéliz Plaza.',
        'confirm_meeting'
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 pb-20 md:pb-8 h-[calc(100vh-5rem)]">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden h-full flex flex-col md:flex-row">
        {/* Left column: Conversations list */}
        <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-display">
              Messages
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {conversations.map((c) => {
              const other = c.participants.find((p) => p.id !== currentUser.id) || c.participants[0];
              const isSelected = c.id === activeConversationId;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-rose-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <UserAvatar
                    name={other?.first_name || 'Utilisateur'}
                    photo={other?.photo}
                    size="md"
                    verified={other?.verification_status.identity}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {other?.first_name} {other?.last_name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {c.last_message_time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {c.last_message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Active Chat Conversation */}
        {activeConversationId && otherParticipant ? (
          <div className="flex-1 flex flex-col h-full bg-[#FCFDFE]">
            {/* Chat Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1 text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <UserAvatar
                  name={otherParticipant.first_name}
                  photo={otherParticipant.photo}
                  size="md"
                  verified={otherParticipant.verification_status.identity}
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900">
                      {otherParticipant.first_name}
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="text-[11px] text-slate-400">En ligne · Trajet Targa - Médina</span>
                </div>
              </div>

              {/* Call & Safety actions */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${otherParticipant.phone}`}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  title="Appeler le conducteur"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                </a>
                <button
                  onClick={() => setActivePage('my-trips')}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors hidden sm:block"
                >
                  Voir mon trajet
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9FAFB]/50">
              {activeMessages.map((msg) => {
                const isMe = msg.sender_id === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-[#9E113E] text-white rounded-br-xs'
                          : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action buttons row (Section 14) */}
            <div className="p-2 border-t border-slate-200 bg-white overflow-x-auto flex items-center gap-2">
              <button
                onClick={() => triggerQuickAction('location')}
                className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-[#9E113E] text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Envoyer ma position</span>
              </button>

              <button
                onClick={() => triggerQuickAction('arrived')}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Je suis arrivé</span>
              </button>

              <button
                onClick={() => triggerQuickAction('late')}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Je suis en retard</span>
              </button>

              <button
                onClick={() => triggerQuickAction('confirm')}
                className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Confirmer le point de RDV</span>
              </button>
            </div>

            {/* Message input bar */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Joindre un repère photo"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Écrire un message..."
                className="flex-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#9E113E] focus:ring-1 focus:ring-[#9E113E] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 transition-all"
              />

              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-[#9E113E] hover:bg-[#850D33] text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center p-8 text-center text-slate-400">
            Sélectionnez une conversation pour échanger avec votre covoitureur.
          </div>
        )}
      </div>
    </div>
  );
};
