import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

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
    <div className="map-picker">
      <div className="map-picker__controls">
        <button type="button" className="btn btn--outline btn--sm" onClick={detectLocation} disabled={detecting}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
          </svg>
          {detecting ? 'Detecting...' : 'Auto-Detect Location'}
        </button>
      </div>

      <div className="map-picker__container">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 14 : 7}
          style={{ height: '300px', width: '100%', borderRadius: '8px' }}
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
        <div className="map-picker__address">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{address}</span>
        </div>
      )}

      {position && (
        <p className="map-picker__coords">
          Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      )}
    </div>
  );
}
