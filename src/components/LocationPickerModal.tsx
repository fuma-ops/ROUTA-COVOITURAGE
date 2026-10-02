import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import L from 'leaflet';
import {
  MapPin,
  Search,
  Check,
  X,
  Navigation,
} from 'lucide-react';
import { MOROCCAN_PRESETS, displayPlaceName, labelForPoint, resolvePlace } from '../utils/places';

export const LocationPickerModal: React.FC = () => {
  const {
    showLocationModal,
    setShowLocationModal,
    locationTargetField,
    confirmLocationSelection,
    searchParams,
  } = useApp();

  const isOrigin = locationTargetField === 'origin';
  const defaultVal = isOrigin ? searchParams.origin : searchParams.destination;

  const [searchQuery, setSearchQuery] = useState(defaultVal || '');
  const [selectedLocation, setSelectedLocation] = useState({
    name: defaultVal || (isOrigin ? 'Targa (Carrefour), Marrakech' : 'Médina (Bab Doukkala), Marrakech'),
    lat: isOrigin ? 31.6425 : 31.6295,
    lng: isOrigin ? -8.0418 : -7.9811,
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Sync state on open
  useEffect(() => {
    if (showLocationModal) {
      const val = isOrigin ? searchParams.origin : searchParams.destination;
      const initialName = val || (isOrigin ? 'Targa (Carrefour), Marrakech' : 'Médina (Bab Doukkala), Marrakech');
      setSearchQuery(val || '');

      // Centre la carte sur le lieu déjà choisi (coordonnées exactes si point GPS)
      const known = resolvePlace(initialName);
      const lat = known ? known.lat : (isOrigin ? 31.6425 : 31.6295);
      const lng = known ? known.lng : (isOrigin ? -8.0418 : -7.9811);

      setSelectedLocation({
        name: initialName,
        lat,
        lng,
      });
    }
  }, [showLocationModal, isOrigin, searchParams]);

  // Leaflet map setup and lifecycle
  useEffect(() => {
    if (!showLocationModal || !mapContainerRef.current) return;

    // Clean any prior instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
    }).setView([selectedLocation.lat, selectedLocation.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size to ensure proper layout render
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const pinColor = isOrigin ? '#10B981' : '#9E113E';
    const pinLabel = isOrigin ? 'Départ' : 'Destination';

    const createPinIcon = (name: string) =>
      L.divIcon({
        className: 'custom-single-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
            <div style="background:${pinColor}; color:#fff; font-size:11px; font-weight:800; padding:4px 10px; border-radius:999px; box-shadow:0 3px 10px rgba(0,0,0,0.35); border:2px solid white; white-space:nowrap;">
              ${pinLabel} : ${displayPlaceName(name).split(',')[0]}
            </div>
            <div style="width:16px; height:16px; background:${pinColor}; border-radius:50%; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.4); margin-top:-2px;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
      });

    const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
      icon: createPinIcon(selectedLocation.name),
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;

    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      const roundedLat = Math.round(pos.lat * 10000) / 10000;
      const roundedLng = Math.round(pos.lng * 10000) / 10000;

      // Le point exact est conservé (aucun alignement sur le lieu connu le plus proche)
      const newName = labelForPoint(pos.lat, pos.lng);
      setSelectedLocation({
        name: newName,
        lat: roundedLat,
        lng: roundedLng,
      });
      setSearchQuery(newName);
      marker.setIcon(createPinIcon(newName));
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const roundedLat = Math.round(lat * 10000) / 10000;
      const roundedLng = Math.round(lng * 10000) / 10000;

      // Le point exact est conservé (aucun alignement sur le lieu connu le plus proche)
      const newName = labelForPoint(lat, lng);
      setSelectedLocation({
        name: newName,
        lat: roundedLat,
        lng: roundedLng,
      });
      setSearchQuery(newName);

      marker.setLatLng([lat, lng]);
      marker.setIcon(createPinIcon(newName));
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showLocationModal, isOrigin]);

  const handleSelectPreset = (preset: typeof MOROCCAN_PRESETS[0]) => {
    setSelectedLocation({
      name: preset.name,
      lat: preset.lat,
      lng: preset.lng,
    });
    setSearchQuery(preset.name);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([preset.lat, preset.lng], 15);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([preset.lat, preset.lng]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = MOROCCAN_PRESETS.find((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const resolved = matched ? null : resolvePlace(searchQuery.trim());
    if (matched) {
      handleSelectPreset(matched);
    } else if (resolved) {
      handleSelectPreset({ name: searchQuery.trim(), lat: resolved.lat, lng: resolved.lng });
    } else {
      setSelectedLocation((prev) => ({
        ...prev,
        name: searchQuery.trim(),
      }));
    }
  };

  const finalName = searchQuery.trim() || selectedLocation.name;
  // Seuls les lieux localisables peuvent être confirmés : le matching en a besoin
  const finalPlace = resolvePlace(finalName);

  const handleConfirm = () => {
    if (!finalPlace) return;
    confirmLocationSelection(finalName);
  };

  // Filter presets based on user typing
  const filteredPresets = searchQuery.trim()
    ? MOROCCAN_PRESETS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : MOROCCAN_PRESETS;

  if (!showLocationModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl h-[85vh] max-h-[640px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-xs ${
                isOrigin ? 'bg-emerald-600' : 'bg-[#9E113E]'
              }`}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {isOrigin ? 'Choisir le point de départ' : 'Choisir la destination'}
              </h3>
              <p className="text-xs text-slate-500">
                Cliquez sur la carte ou tapez votre quartier
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLocationModal(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar inside map modal */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isOrigin ? 'Rechercher un départ (ex: Targa, Guéliz...)' : 'Rechercher une destination (ex: Médina...)'}
              className="w-full pl-9 pr-20 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-[#9E113E]"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
            >
              Chercher
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
              Lieux fréquents :
            </span>
            {filteredPresets.slice(0, 6).map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="px-2.5 py-1 bg-white hover:bg-[#9E113E] hover:text-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 whitespace-nowrap transition-colors"
              >
                {p.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Leaflet Map Canvas */}
        <div className="flex-1 relative w-full h-full bg-slate-100 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-600 shadow-xs border border-slate-200 pointer-events-none z-10 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-[#9E113E]" />
            <span>Cliquez n'importe où pour déplacer le repère</span>
          </div>
        </div>

        {/* Footer with confirmation */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                isOrigin ? 'bg-emerald-500' : 'bg-[#9E113E]'
              }`}
            />
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
                {displayPlaceName(finalName)}
              </span>
              <span
                className={`text-[10px] font-semibold block truncate ${
                  finalPlace ? 'text-slate-500' : 'text-rose-600'
                }`}
              >
                {!finalPlace
                  ? 'Lieu non reconnu : cliquez sur la carte pour placer le repère'
                  : finalPlace.precisionMeters === 0
                    ? `Point exact · ${finalPlace.lat.toFixed(4)}, ${finalPlace.lng.toFixed(4)}`
                    : `Ville entière (±${Math.round(finalPlace.precisionMeters / 1000)} km) · précisez sur la carte`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowLocationModal(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={!finalPlace}
              className={`disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-all ${
                isOrigin ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#9E113E] hover:bg-[#850D33]'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Confirmer ce lieu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
