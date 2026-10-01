import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  PhoneCall,
  Share2,
  AlertTriangle,
  X,
  CheckCircle,
  Lock,
  Flag,
} from 'lucide-react';

export const SafetyModal: React.FC = () => {
  const { showSafetyModal, setShowSafetyModal, submitReport, selectedTrip } = useApp();

  const [activeTab, setActiveTab] = useState<'emergency' | 'report'>('emergency');
  const [reportReason, setReportReason] = useState('Comportement inapproprié');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!showSafetyModal) return null;

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Bonjour, je suis actuellement en trajet covoiturage Routa Maroc sur l'axe ${
        selectedTrip ? `${selectedTrip.origin} → ${selectedTrip.destination}` : 'Marrakech'
      }. Suivez mon statut en toute sécurité.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(
      selectedTrip?.driver_id || 'user_unknown',
      reportReason,
      reportDetails,
      selectedTrip?.id
    );
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setShowSafetyModal(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Centre de Sécurité & Urgence
              </h3>
              <p className="text-xs text-slate-500">Protection communautaire Routa Maroc</p>
            </div>
          </div>

          <button
            onClick={() => setShowSafetyModal(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 my-4 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'emergency'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            Assistance & SOS
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'report'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            Signaler un incident
          </button>
        </div>

        {activeTab === 'emergency' ? (
          <div className="space-y-4">
            {/* Direct WhatsApp Share button */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Partager mon trajet avec un proche
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Envoie un lien direct WhatsApp avec le nom du conducteur, la plaque du véhicule et le corridor.
                  </p>
                </div>
              </div>

              <button
                onClick={handleShareWhatsApp}
                className="mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Envoyer sur WhatsApp</span>
              </button>
            </div>

            {/* Official Moroccan Emergency Numbers (19, 177, 15) */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Numéros d'urgence officiels au Maroc
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href="tel:19"
                  className="p-3 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 flex flex-col items-center text-center transition-colors"
                >
                  <PhoneCall className="w-5 h-5 text-[#9E113E] mb-1" />
                  <span className="text-lg font-black text-[#9E113E] font-display">19</span>
                  <span className="text-[11px] font-semibold text-slate-700">Police Secours</span>
                  <span className="text-[9px] text-slate-400">En agglomération</span>
                </a>

                <a
                  href="tel:177"
                  className="p-3 rounded-2xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100 flex flex-col items-center text-center transition-colors"
                >
                  <PhoneCall className="w-5 h-5 text-sky-700 mb-1" />
                  <span className="text-lg font-black text-sky-800 font-display">177</span>
                  <span className="text-[11px] font-semibold text-slate-700">Gendarmerie</span>
                  <span className="text-[9px] text-slate-400">Axes autoroutiers</span>
                </a>

                <a
                  href="tel:15"
                  className="p-3 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100 flex flex-col items-center text-center transition-colors"
                >
                  <PhoneCall className="w-5 h-5 text-amber-700 mb-1" />
                  <span className="text-lg font-black text-amber-800 font-display">15</span>
                  <span className="text-[11px] font-semibold text-slate-700">Protection Civile</span>
                  <span className="text-[9px] text-slate-400">Ambulance</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {reportSubmitted ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">Signalement transmis</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Notre équipe de modération analyse votre requête dans les meilleurs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Motif</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Comportement inapproprié">Comportement inapproprié</option>
                    <option value="Retard excessif sans préavis">Retard excessif sans préavis</option>
                    <option value="Véhicule non conforme à la fiche">Véhicule non conforme à la fiche</option>
                    <option value="Demande de surcoût illégal">Demande de surcoût illégal</option>
                    <option value="Autre manquement à la charte">Autre manquement à la charte</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Précisions détaillées (confidentiel)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Expliquez ce qui s'est passé..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#9E113E] text-white font-bold rounded-xl text-xs shadow-xs"
                  >
                    Envoyer à la modération
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
