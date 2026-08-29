import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAvatarColor } from '../../utils/avatar';

// Fix Leaflet's default icon issue with React
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const DEFAULT_CENTER: [number, number] = [31.5204, 74.3587]; // Lahore
const DEFAULT_ZOOM = 6; // Pakistan zoom level

// Provide dummy coords for donors who don't have them
const getDummyCoords = (city: string): [number, number] => {
  const map: Record<string, [number, number]> = {
    'Lahore': [31.5204, 74.3587],
    'Karachi': [24.8607, 67.0011],
    'Islamabad': [33.6844, 73.0479],
    'Peshawar': [34.0151, 71.5249],
    'Quetta': [30.1798, 66.9750]
  };
  // Default to somewhere near center if city unknown, with slight random offset
  const base = map[city] || [30.3753, 69.3451];
  return [base[0] + (Math.random() - 0.5) * 0.1, base[1] + (Math.random() - 0.5) * 0.1];
};

export const DonorMap = ({ donors }) => {
  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden', marginTop: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {donors.map(donor => {
          const position = (donor.latitude && donor.longitude) 
            ? [donor.latitude, donor.longitude] 
            : getDummyCoords(donor.city);
          
          return (
            <Marker key={donor.id} position={position as [number, number]}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>{donor.name}</strong><br />
                  <span style={{ 
                    display: 'inline-block', 
                    background: getAvatarColor(donor.id), 
                    color: '#fff', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginTop: '4px'
                  }}>
                    {donor.bloodGroup}
                  </span>
                  <br />
                  <small>{donor.city}</small>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
