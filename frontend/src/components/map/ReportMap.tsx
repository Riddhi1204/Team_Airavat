'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import type { MapMarker } from '@/types';
import { getPriorityMarkerColor } from '@/lib/utils';

// Fix default marker icon path issue with webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface ReportMapProps {
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  onBoundsChange?: (bounds: { min_lat: number; max_lat: number; min_lng: number; max_lng: number }) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  selectedId?: number | null;
}

export default function ReportMap({
  markers,
  onMarkerClick,
  onBoundsChange,
  center = [20.5937, 78.9629], // India center
  zoom = 5,
  className = '',
  selectedId,
}: ReportMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapRef.current = map;
    setMapReady(true);

    // Bounds change handler
    if (onBoundsChange) {
      const handleBounds = () => {
        const bounds = map.getBounds();
        onBoundsChange({
          min_lat: bounds.getSouth(),
          max_lat: bounds.getNorth(),
          min_lng: bounds.getWest(),
          max_lng: bounds.getEast(),
        });
      };
      map.on('moveend', handleBounds);
      map.on('zoomend', handleBounds);
      // Fire initial bounds
      setTimeout(handleBounds, 500);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapReady || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    markers.forEach((m) => {
      const color = getPriorityMarkerColor(m.priority_level);
      const isSelected = m.id === selectedId;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: ${isSelected ? '18px' : '14px'};
          height: ${isSelected ? '18px' : '14px'};
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ${isSelected ? 'outline: 3px solid ' + color + '40;' : ''}
        "></div>`,
        iconSize: [isSelected ? 18 : 14, isSelected ? 18 : 14],
        iconAnchor: [isSelected ? 9 : 7, isSelected ? 9 : 7],
      });

      const marker = L.marker([m.latitude, m.longitude], { icon });

      // Tooltip
      marker.bindTooltip(
        `<div style="font-size:12px;">
          <strong>${m.public_reference}</strong><br/>
          ${m.category}<br/>
          <span style="color:${color};font-weight:bold;">${m.priority_level || 'Unscored'}</span>
          ${m.priority_score ? ` (${m.priority_score.toFixed(1)})` : ''}
        </div>`,
        { direction: 'top', offset: [0, -10] }
      );

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(m));
      }

      marker.addTo(layer);
    });
  }, [markers, mapReady, selectedId, onMarkerClick]);

  // Center on selected marker
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const m = markers.find((mk) => mk.id === selectedId);
    if (m) {
      mapRef.current.setView([m.latitude, m.longitude], Math.max(mapRef.current.getZoom(), 12), {
        animate: true,
      });
    }
  }, [selectedId, markers]);

  return (
    <div ref={mapContainerRef} className={`w-full h-full min-h-[300px] ${className}`} />
  );
}
