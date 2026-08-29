import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPickerModal.scss';

// ── Fix Leaflet default marker icons broken by Vite bundling ────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',    import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',  import.meta.url).href,
});

// Custom red blood-drop marker ────────────────────────────────────────────────
const RED_MARKER = new L.Icon({
  iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
      <path d="M12 0 C12 0 0 14 0 20 A12 12 0 0 0 24 20 C24 14 12 0 12 0Z"
            fill="#c0392b" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="20" r="4" fill="white" opacity="0.6"/>
    </svg>
  `)}`,
  iconSize:     [28, 42],
  iconAnchor:   [14, 42],
  popupAnchor:  [0, -42],
});

// ── Click handler component (must live inside MapContainer) ─────────────────
function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Nominatim reverse geocode ────────────────────────────────────────────────
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'BloodDonationApp/1.0' },
  });
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  const addr = data.address || {};

  const city =
    addr.city        ||
    addr.town        ||
    addr.village     ||
    addr.municipality||
    addr.county      ||
    addr.state_district ||
    '';

  const country = addr.country || '';
  const countryCode = (addr.country_code || '').toUpperCase();

  return { city, country, countryCode, displayName: data.display_name };
}

// ── Main Modal Component ─────────────────────────────────────────────────────
const MapPickerModal = ({ isOpen, onClose, onConfirm, initialCity }) => {
  const [marker, setMarker] = useState<any>(null);   // { lat, lng }
  const [locationInfo, setLocationInfo] = useState<any>(null); // { city, country, ... }
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const mapRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMarker(null);
      setLocationInfo(null);
      setGeocodeError('');
      setIsGpsLoading(false);
    }
  }, [isOpen]);

  // Handle map click → reverse geocode
  const handleLocationSelect = useCallback(async (lat, lng) => {
    setMarker({ lat, lng });
    setIsGeocoding(true);
    setGeocodeError('');
    setLocationInfo(null);
    try {
      const info = await reverseGeocode(lat, lng);
      setLocationInfo(info);
    } catch {
      setGeocodeError('Could not fetch location. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // GPS auto-detect
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeocodeError('Geolocation is not supported by your browser.');
      return;
    }
    setIsGpsLoading(true);
    setGeocodeError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // Pan map to GPS location
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 12);
        }
        await handleLocationSelect(lat, lng);
        setIsGpsLoading(false);
      },
      () => {
        setGeocodeError('Location access denied. Please click on the map instead.');
        setIsGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  // Confirm selection
  const handleConfirm = () => {
    if (locationInfo && locationInfo.city) {
      onConfirm({ city: locationInfo.city, country: locationInfo.country });
      onClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="map-modal__overlay"
      id="map-picker-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Pick your city on the map"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="map-modal" id="map-picker-modal">
        {/* Header */}
        <div className="map-modal__header">
          <div className="map-modal__title-group">
            <svg viewBox="0 0 24 24" className="map-modal__title-icon" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <h2 className="map-modal__title">Pick Your City</h2>
          </div>
          <button
            className="map-modal__close"
            id="map-modal-close-btn"
            onClick={onClose}
            aria-label="Close map"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Instruction bar */}
        <div className="map-modal__instruction">
          <span className="map-modal__instruction-text">
            🖱️ Click anywhere on the map to drop a pin and detect your city
          </span>
          <button
            className={`map-modal__gps-btn ${isGpsLoading ? 'map-modal__gps-btn--loading' : ''}`}
            id="map-modal-gps-btn"
            onClick={handleUseMyLocation}
            disabled={isGpsLoading}
          >
            {isGpsLoading ? (
              <span className="map-modal__gps-spinner" aria-hidden="true" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
            )}
            {isGpsLoading ? 'Detecting...' : 'Use My Location'}
          </button>
        </div>

        {/* Map */}
        <div className="map-modal__map-container">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            className="map-modal__map"
            id="leaflet-map"
            ref={mapRef}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ClickHandler onLocationSelect={handleLocationSelect} />
            {marker && (
              <Marker position={[marker.lat, marker.lng]} icon={RED_MARKER} />
            )}
          </MapContainer>

          {/* Geocoding overlay */}
          {isGeocoding && (
            <div className="map-modal__geocoding-overlay" aria-live="polite">
              <span className="map-modal__geocoding-spinner" />
              <span>Detecting location…</span>
            </div>
          )}
        </div>

        {/* Result / Footer */}
        <div className="map-modal__footer">
          {/* Error */}
          {geocodeError && (
            <p className="map-modal__error" role="alert">{geocodeError}</p>
          )}

          {/* Detected location card */}
          {locationInfo && !isGeocoding && (
            <div className="map-modal__result" id="map-modal-result">
              <div className="map-modal__result-info">
                <svg viewBox="0 0 24 24" className="map-modal__result-icon" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div>
                  <p className="map-modal__result-city">
                    {locationInfo.city || 'Unknown area'}
                    {locationInfo.countryCode && (
                      <span className="map-modal__result-code"> · {locationInfo.countryCode}</span>
                    )}
                  </p>
                  <p className="map-modal__result-country">{locationInfo.country}</p>
                </div>
              </div>
              <button
                className="map-modal__confirm-btn"
                id="map-modal-confirm-btn"
                onClick={handleConfirm}
                disabled={!locationInfo.city}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Confirm Location
              </button>
            </div>
          )}

          {/* Placeholder when nothing selected */}
          {!locationInfo && !isGeocoding && !geocodeError && (
            <p className="map-modal__hint">No location selected yet — click on the map above</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;
