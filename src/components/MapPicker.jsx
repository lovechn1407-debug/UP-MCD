import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Navigation, MapPin, Loader2 } from 'lucide-react';

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });
  return position ? <Marker position={position} /> : null;
}

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position, map]);
  return null;
}

export default function MapPicker({ onLocationSelect, initialPosition = null }) {
  const [position, setPosition] = useState(initialPosition);
  const [address, setAddress] = useState('');
  const [detecting, setDetecting] = useState(false);
  const defaultCenter = [26.8467, 80.9462]; // Lucknow, UP

  const handlePositionChange = useCallback(async (pos) => {
    setPosition(pos);
    if (onLocationSelect) {
      onLocationSelect({ lat: pos[0], lng: pos[1] });
    }
    // Reverse geocode
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${pos[0]}&lon=${pos[1]}&format=json`
      );
      const data = await res.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    }
  }, [onLocationSelect]);

  const detectLocation = () => {
    setDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          handlePositionChange(newPos);
          setDetecting(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setDetecting(false);
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Click Map to Pin Location
        </span>
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 text-xs font-semibold transition-all disabled:opacity-50"
        >
          {detecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
          {detecting ? 'Detecting...' : 'GPS Auto-Detect'}
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 14 : 7}
          style={{ height: '280px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
          {position && <FlyToLocation position={position} />}
        </MapContainer>
      </div>

      {address && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{address}</span>
        </div>
      )}

      {position && (
        <p className="text-[11px] font-mono text-slate-400">
          Selected GPS: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      )}
    </div>
  );
}
