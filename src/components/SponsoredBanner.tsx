import React from 'react';
import { Fuel, ShieldCheck, ExternalLink } from 'lucide-react';

export const SponsoredBanner: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 my-4">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-3.5 sm:p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Fuel className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 text-slate-200 px-1.5 py-0.5 rounded-sm">
                Partenaire Routa
              </span>
              <span className="text-xs font-bold text-white">
                TotalEnergies Club Maroc
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Conducteurs Routa : bénéficiez de -10% sur les vidanges et lavages dans toutes les stations autoroutières du Royaume.
            </p>
          </div>
        </div>

        <button
          onClick={() => {}}
          className="self-end sm:self-center px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>En profiter</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
