'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Lab {
  labId: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  phone: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  location: { type: string; coordinates: number[] };
}

interface LabMapProps {
  labs: Lab[];
}

export default function LabMap({ labs }: LabMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5); // India center
    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add markers for each lab
    labs.forEach((lab) => {
      if (!lab.location?.coordinates || lab.location.coordinates.length < 2) return;

      const [lng, lat] = lab.location.coordinates;
      if (!lat || !lng) return;

      const color =
        lab.status === 'Approved' ? '#22c55e' :
        lab.status === 'Pending' ? '#fbbf24' :
        lab.status === 'Rejected' ? '#ef4444' : '#9ca3af';

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${lab.name}</h3>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${lab.city}, ${lab.state}</p>
          ${lab.address ? `<p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${lab.address}</p>` : ''}
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${lab.phone}</p>
          <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background-color: ${color}20; color: ${color};">
            ${lab.status}
          </span>
        </div>
      `);
    });

    // Fit bounds if there are labs
    if (labs.length > 0) {
      const bounds = L.latLngBounds(
        labs.map(lab => [lab.location.coordinates[1], lab.location.coordinates[0]] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [labs]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
