import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Eye, ShieldAlert, Navigation2, Layers, Crosshair } from 'lucide-react';

export function MapViewer({
  center,
  radiusKm,
  places,
  hazards,
  selectedPlace,
  onSelectPlace,
  onNavigateTo,
  onMapClick,
  activeRoutePolyline,
  onClose
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const hazardsLayerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const routePolylineRef = useRef(null);

  const [showRadius, setShowRadius] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [tileTheme, setTileTheme] = useState('osm'); // 'osm' | 'esri'

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center || [18.9220, 72.8347],
        zoom: 13,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // 100% Free OpenStreetMap & Esri Tiles (Zero API key required)
      const tileUrl = tileTheme === 'esri'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tiles = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      });
      tiles.addTo(map);
      mapInstanceRef.current = map;
      mapInstanceRef.current._tileLayer = tiles;

      // Create Layer Groups
      markersLayerRef.current = L.layerGroup().addTo(map);
      hazardsLayerRef.current = L.layerGroup().addTo(map);

      // Invalidate size to ensure no grey tiles when opened on demand
      setTimeout(() => {
        map.invalidateSize();
      }, 150);

      // Map Click Handler
      map.on('click', (e) => {
        if (onMapClick) onMapClick(e.latlng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer if Theme Changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map._tileLayer) return;

    map.removeLayer(map._tileLayer);
    const tileUrl = tileTheme === 'esri'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    });
    tiles.addTo(map);
    map._tileLayer = tiles;
  }, [tileTheme]);

  // Center & Radius Update
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !center) return;

    map.setView(center, map.getZoom(), { animate: true });

    // Update Radius Circle
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
    }

    if (showRadius) {
      const circle = L.circle(center, {
        radius: radiusKm * 1000,
        color: '#38bdf8',
        fillColor: '#38bdf8',
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '6, 8'
      }).addTo(map);
      radiusCircleRef.current = circle;
    }
  }, [center, radiusKm, showRadius]);

  // Render Place Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // Origin center marker
    if (center) {
      const originIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="
          width: 22px; height: 22px; border-radius: 50%;
          background: #38bdf8; border: 3px solid white;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);
          animation: pulse-origin 2s infinite ease-in-out;
        "></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      L.marker(center, { icon: originIcon })
        .bindTooltip('Your Exploration Anchor', { permanent: false, direction: 'top' })
        .addTo(layer);
    }

    places.forEach((place) => {
      const emojiMap = {
        heritage: '🏛️',
        food: '🍲',
        hotel: '🏨',
        hidden_gem: '💎',
        attraction: '🎡'
      };
      const emoji = emojiMap[place.category] || '📍';
      const pinClass = `marker-pin pin-${place.category}`;

      const icon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div class="${pinClass}">
            <div class="marker-pin-inner">${emoji}</div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -36]
      });

      const popupHtml = `
        <div style="min-width: 240px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #38bdf8; letter-spacing: 0.04em;">
              ${place.category.replace('_', ' ')}
            </span>
            <span style="font-size: 12px; font-weight: 700; color: #f59e0b;">⭐ ${place.rating}</span>
          </div>
          <h4 style="font-size: 14px; font-weight: 700; color: #f9fafb; margin: 0 0 4px 0;">
            ${place.name}
          </h4>
          <p style="font-size: 11px; color: #9ca3af; margin: 0 0 8px 0; line-height: 1.4;">
            ${place.address || ''}
          </p>
          <div style="display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap;">
            <span style="font-size: 10px; background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 6px; border-radius: 99px; font-weight: 600;">
              🛡️ Safe: ${place.safetyScore}/10
            </span>
            <span style="font-size: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 6px; border-radius: 99px; font-weight: 600;">
              ✨ Clean: ${place.cleanlinessScore}/10
            </span>
            <span style="font-size: 10px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 2px 6px; border-radius: 99px; font-weight: 600;">
              ${place.priceLevel} (${place.estimatedCost})
            </span>
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="btn-popup-view-${place.id}" style="
              flex: 1; background: #2563eb; color: white; border: none;
              padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;
            ">
              Story & Lore 🎧
            </button>
            <button id="btn-popup-nav-${place.id}" style="
              flex: 1; background: #10b981; color: white; border: none;
              padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;
            ">
              Navigate 🧭
            </button>
          </div>
        </div>
      `;

      const marker = L.marker([place.lat, place.lng], { icon })
        .bindPopup(popupHtml)
        .addTo(layer);

      marker.on('popupopen', () => {
        const btnView = document.getElementById(`btn-popup-view-${place.id}`);
        const btnNav = document.getElementById(`btn-popup-nav-${place.id}`);
        if (btnView) btnView.onclick = () => onSelectPlace(place);
        if (btnNav) btnNav.onclick = () => onNavigateTo(place);
      });
    });
  }, [places, center, onSelectPlace, onNavigateTo]);

  // Render Safety Hazard Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = hazardsLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (!showHazards || !hazards) return;

    hazards.forEach((haz) => {
      const icon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div class="marker-pin pin-hazard">
            <div class="marker-pin-inner">⚠️</div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -34]
      });

      const popupHtml = `
        <div style="min-width: 220px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 2px 6px; border-radius: 4px;">
              ${haz.severity.toUpperCase()} ALERT
            </span>
            <span style="font-size: 11px; color: #9ca3af;">${haz.reportedDate}</span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #f9fafb; margin: 0 0 6px 0;">
            ${haz.title}
          </h4>
          <p style="font-size: 11px; color: #d1d5db; margin: 0 0 8px 0; line-height: 1.4;">
            ${haz.description}
          </p>
          <div style="font-size: 10px; color: #10b981; font-weight: 600;">
            ✓ Verified by ${haz.verifiedCount || 12} Citizens
          </div>
        </div>
      `;

      L.marker([haz.lat, haz.lng], { icon })
        .bindPopup(popupHtml)
        .addTo(layer);

      // Warning circle around hazard
      L.circle([haz.lat, haz.lng], {
        radius: 250,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.12,
        weight: 1
      }).addTo(layer);
    });
  }, [hazards, showHazards]);

  // Route Polyline (Fastest vs SafeGuard Route)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (activeRoutePolyline && activeRoutePolyline.length > 0) {
      const isSafeGuard = activeRoutePolyline.isSafeGuard;
      const polyline = L.polyline(activeRoutePolyline.coordinates, {
        color: isSafeGuard ? '#10b981' : '#38bdf8',
        weight: 5,
        opacity: 0.85,
        dashArray: isSafeGuard ? undefined : '8, 6'
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      routePolylineRef.current = polyline;
    }
  }, [activeRoutePolyline]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      {/* Map DOM Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Map Controls */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Toggle Radius */}
        <button
          onClick={() => setShowRadius(!showRadius)}
          title="Toggle Exploration Radius Boundary"
          style={{
            background: showRadius ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: showRadius ? '#ffffff' : 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <Eye size={14} />
          <span>{radiusKm}km Radius</span>
        </button>

        {/* Toggle Safety Hazard Heatzones */}
        <button
          onClick={() => setShowHazards(!showHazards)}
          title="Toggle Safety Hazard Hotspots"
          style={{
            background: showHazards ? 'rgba(239, 68, 68, 0.9)' : 'var(--bg-secondary)',
            color: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <ShieldAlert size={14} />
          <span>Hazards</span>
        </button>

        {/* Close Map Button (When Opened On Demand) */}
        {onClose && (
          <button
            onClick={onClose}
            title="Close Interactive Map"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}
          >
            <span>✕ Close Map</span>
          </button>
        )}

        {/* Tile Theme Toggle */}
        <button
          onClick={() => setTileTheme(tileTheme === 'osm' ? 'esri' : 'osm')}
          title="Switch Map Tiles (OpenStreetMap / Esri World Street)"
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <Layers size={14} />
          <span>{tileTheme === 'osm' ? 'OSM Tiles' : 'Esri Street'}</span>
        </button>

        {/* Re-center */}
        <button
          onClick={() => {
            if (mapInstanceRef.current && center) {
              mapInstanceRef.current.setView(center, 13, { animate: true });
            }
          }}
          title="Recenter Map on Anchor"
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <Crosshair size={14} />
          <span>Recenter</span>
        </button>
      </div>
    </div>
  );
}
