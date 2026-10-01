import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { MOCK_USERS } from '../mockData';
import { ReportStatus, TripStatus } from '../types';
import {
  Users,
  Car,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Megaphone,
} from 'lucide-react';

export const BackOfficeView: React.FC = () => {
  const { trips, bookings, reports, updateReportStatus, cancelTrip } = useApp();

  const [activeTab, setActiveTab] = useState<'kpi' | 'reports' | 'trips' | 'users'>('kpi');
  const [searchTerm, setSearchTerm] = useState('');

  // Statistics
  const totalUsers = 12480;
  const verifiedUsersCount = 11920;
  const activeTripsCount = trips.filter((t) => t.status !== 'CANCELLED' && t.status !== 'COMPLETED').length;
  const completedTripsCount = 3840;
  const pendingReportsCount = reports.filter((r) => r.status === 'NEW' || r.status === 'IN_REVIEW').length;
  const adRevenueDh = 18650;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
      {/* Backoffice Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
              Administration
            </span>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Back-Office Routa Maroc
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervision nationale des flux, modération et statistiques opérationnelles
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('kpi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'kpi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <span>Modération</span>
            {pendingReportsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingReportsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'trips' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Trajets actifs
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Utilisateurs & CIN
          </button>
        </div>
      </div>

      {/* KPI Overview (Section 34: Back-office Dashboard) */}
      {activeTab === 'kpi' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">Utilisateurs inscrits</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-2xl font-black text-slate-900 font-display">
                {totalUsers.toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                ↑ +14% ce mois
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">Trajets en cours & actifs</span>
                <Car className="w-4 h-4 text-[#9E113E]" />
              </div>
              <span className="text-2xl font-black text-slate-900 font-display">
                {activeTripsCount}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Taux d'occupation : 78%
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">Signalements ouverts</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-2xl font-black text-amber-600 font-display">
                {pendingReportsCount}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Délai moyen résolu : 22 min
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">Revenus pubs (Partenaires)</span>
                <Megaphone className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-emerald-700 font-display">
                {adRevenueDh.toLocaleString()} DH
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                TotalEnergies & Afriquia
              </span>
            </div>
          </div>

          {/* National Corridors Monitoring Table */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Activité en temps réel des corridors nationaux (Maroc)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                    <th className="py-2.5">Corridor / Axe</th>
                    <th className="py-2.5">Volume trajets</th>
                    <th className="py-2.5">Places demandées</th>
                    <th className="py-2.5">Prix moyen</th>
                    <th className="py-2.5">Statut corridor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">
                      Marrakech: Targa ↔ Médina (Intra-urbain)
                    </td>
                    <td>142 trajets / jour</td>
                    <td>89% réservé</td>
                    <td>25-45 DH</td>
                    <td><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Optimal</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">
                      Casablanca ↔ Rabat (Inter-villes autoroute)
                    </td>
                    <td>380 trajets / jour</td>
                    <td>94% réservé</td>
                    <td>60-80 DH</td>
                    <td><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Haute demande</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">
                      Marrakech (Guéliz) ↔ Casablanca (Casa Port)
                    </td>
                    <td>65 trajets / jour</td>
                    <td>82% réservé</td>
                    <td>110-130 DH</td>
                    <td><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Fluide</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Tab (Section 34: Modération) */}
      {activeTab === 'reports' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Signalements et requêtes utilisateurs ({reports.length})
            </h3>
            <span className="text-xs text-slate-500">
              Statuts : NEW · IN_REVIEW · RESOLVED · REJECTED
            </span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => {
              const statusColors = {
                NEW: 'bg-rose-100 text-rose-800 border-rose-200',
                IN_REVIEW: 'bg-amber-100 text-amber-800 border-amber-200',
                RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                REJECTED: 'bg-slate-100 text-slate-600 border-slate-200',
              };

              return (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[rep.status]}`}>
                        {rep.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {rep.reason}
                      </span>
                      <span className="text-slate-400 text-xs">· {rep.created_at}</span>
                    </div>

                    <p className="text-xs text-slate-600">{rep.details}</p>

                    <p className="text-[11px] text-slate-400">
                      Signalé par : <span className="text-slate-700 font-medium">{rep.author_name}</span> | Utilisateur visé : <span className="text-slate-700 font-medium">{rep.target_user_name}</span>
                    </p>
                  </div>

                  {/* Moderation action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateReportStatus(rep.id, 'IN_REVIEW')}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100"
                    >
                      Prendre en charge
                    </button>
                    <button
                      onClick={() => updateReportStatus(rep.id, 'RESOLVED')}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    >
                      Résoudre
                    </button>
                    <button
                      onClick={() => updateReportStatus(rep.id, 'REJECTED')}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trips Administration Tab */}
      {activeTab === 'trips' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Gestion administrative des trajets
            </h3>
            <span className="text-xs text-slate-500">
              Possibilité d'annulation administrative si infraction
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            {trips.map((t) => (
              <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{t.origin} → {t.destination}</span>
                    <span className="text-slate-400">({t.date} · {t.departure_time})</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Conducteur: {t.driver.first_name} {t.driver.last_name} · Véhicule: {t.vehicle.brand} {t.vehicle.model} ({t.vehicle.plate})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{t.global_price} DH</span>
                  {t.status !== 'CANCELLED' ? (
                    <button
                      onClick={() => cancelTrip(t.id)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-lg"
                    >
                      Annuler administrativement
                    </button>
                  ) : (
                    <span className="text-rose-600 font-semibold">Annulé</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users & KYC Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Utilisateurs et statuts de vérification d'identité (CIN / Permis)
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs">
            {Object.values(MOCK_USERS).map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={u.first_name} photo={u.photo} size="md" verified={u.verification_status.identity} />
                  <div>
                    <p className="font-bold text-slate-900">{u.first_name} {u.last_name}</p>
                    <p className="text-slate-500">{u.phone} · {u.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    CIN Vérifiée ✓
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {u.trips_as_driver + u.trips_as_passenger} trajets
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
