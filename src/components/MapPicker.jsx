import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

export const MapPicker = ({ lat, lng, onLocationSelect, address, onAddressChange }) => {
  const defaultLat = lat || 26.8467; // Lucknow center
  const defaultLng = lng || 80.9462;

  const [currentLat, setCurrentLat] = useState(defaultLat);
  const [currentLng, setCurrentLng] = useState(defaultLng);

  useEffect(() => {
    if (lat && lng) {
      setCurrentLat(lat);
      setCurrentLng(lng);
    }
  }, [lat, lng]);

  const handleQuickLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;
          setCurrentLat(newLat);
          setCurrentLng(newLng);
          onLocationSelect(newLat, newLng);
        },
        (err) => {
          console.warn("Geolocation permission denied or unavailable:", err);
        }
      );
    }
  };

  const handleCoordinateChange = (e, type) => {
    const val = parseFloat(e.target.value) || 0;
    if (type === 'lat') {
      setCurrentLat(val);
      onLocationSelect(val, currentLng);
    } else {
      setCurrentLng(val);
      onLocationSelect(currentLat, val);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label-title flex items-center gap-1.5 mb-0">
          <MapPin className="w-4 h-4 text-red-600" />
          Complaint Location Pin & Address Input
        </label>
        <button
          type="button"
          onClick={handleQuickLocate}
          className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-all"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          Detect My GPS Location
        </button>
      </div>

      {/* Street Address Input */}
      <div>
        <input
          type="text"
          className="input-field"
          placeholder="Type full landmark, street name, house number, area, district..."
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          required
        />
      </div>

      {/* Coordinates & Location Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600 font-medium">GPS Coordinates:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Lat:</span>
            <input
              type="number"
              step="0.0001"
              value={currentLat}
              onChange={(e) => handleCoordinateChange(e, 'lat')}
              className="w-24 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs text-slate-800"
            />
            <span className="text-slate-500 font-medium">Lng:</span>
            <input
              type="number"
              step="0.0001"
              value={currentLng}
              onChange={(e) => handleCoordinateChange(e, 'lng')}
              className="w-24 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Embedded Interactive OSM iFrame View */}
        <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-300 shadow-inner">
          <iframe
            title="Complaint Map View"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLng - 0.015}%2C${currentLat - 0.015}%2C${currentLng + 0.015}%2C${currentLat + 0.015}&layer=mapnik&marker=${currentLat}%2C${currentLng}`}
          />
          <div className="absolute bottom-2 right-2 bg-white/95 px-2 py-1 rounded text-[10px] font-semibold text-slate-700 shadow border border-slate-200">
            📍 Selected Pin Point
          </div>
        </div>
      </div>
    </div>
  );
};
