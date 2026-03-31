'use client';

import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: '<div class="custom-marker-pin">🐾</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function HeatMapInner({ points = [], center }) {
  const fallback = center?.lat && center?.lng ? [center.lat, center.lng] : points[0] ? [points[0].lat, points[0].lng] : [31.7683, 35.2137];

  return (
    <MapContainer center={fallback} zoom={points.length ? 11 : 8} scrollWheelZoom className="map-shell">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point) => (
        <Circle
          key={`circle-${point.report_id}`}
          center={[point.lat, point.lng]}
          radius={Math.max(180, (point.count || 1) * 180)}
          pathOptions={{ fillOpacity: 0.25 }}
        />
      ))}
      {points.map((point) => (
        <Marker key={point.report_id} icon={markerIcon} position={[point.lat, point.lng]}>
          <Popup>
            <strong>{point.label || 'Sighting'}</strong>
            <div>{new Date(point.created_at).toLocaleString()}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
