'use client';

import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: '<div class="custom-marker-pin">📍</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng);
    },
  });
  return null;
}

export default function MapPickerInner({ value, onChange }) {
  const center = value?.lat && value?.lng ? [value.lat, value.lng] : [31.7683, 35.2137];

  return (
    <MapContainer center={center} zoom={value?.lat ? 14 : 8} scrollWheelZoom className="map-shell">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={(latlng) => onChange({ lat: latlng.lat, lng: latlng.lng })} />
      {value?.lat && value?.lng ? <Marker icon={markerIcon} position={[value.lat, value.lng]} /> : null}
    </MapContainer>
  );
}
