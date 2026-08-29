import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Fix Leaflet's default icon path issues with Webpack/Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DonorMap = ({ donors }) => {
  // Center on Pakistan or the first donor
  const center = donors.length > 0 && donors[0].latitude && donors[0].longitude 
    ? [donors[0].latitude, donors[0].longitude] 
    : [31.5204, 74.3587]; // Default to Lahore

  return (
    <div className="donor-map" style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1 }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {donors.map((donor) => {
          if (donor.latitude && donor.longitude) {
            return (
              <Marker key={donor.id} position={[donor.latitude, donor.longitude]}>
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{donor.name}</h3>
                    <p style={{ margin: '0 0 8px 0', color: '#ff4d4f', fontWeight: 'bold' }}>{donor.bloodGroup}</p>
                    <Link to={`/donor/${donor.name}`} style={{ display: 'inline-block', padding: '6px 12px', background: '#eab308', color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem' }}>
                      View Profile
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default DonorMap;
