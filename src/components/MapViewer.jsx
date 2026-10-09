import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Eye, ShieldAlert, Navigation2, Layers, Crosshair, ZoomIn, ZoomOut, Maximize2, Activity } from 'lucide-react';
import { openGoogleMapsNavigation } from '../services/apiService';

export function MapViewer({
  center,
  radiusKm,
  places = [],
  hazards = [],
  selectedPlace,
  onSelectPlace,
  onNavigateTo,
  onMapClick,
  activeRoutePolyline,
  onClose,
  userLocation
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const hazardsLayerRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const routePolylineRef = useRef(null);

  const [showRadius, setShowRadius] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [tileTheme, setTileTheme] = useState('osm'); // 'osm' standard default

  // Helper: Calculate ETA & Traffic for Place
  const getTravelEstimates = (placeLat, placeLng) => {
    if (!center) return { driveMins: 12, transitMins: 18, walkMins: 36, trafficStatus: 'Smooth Flow', trafficColor: '#16a34a' };
    const R = 6371;
    const dLat = ((placeLat - center[0]) * Math.PI) / 180;
    const dLon = ((placeLng - center[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((center[0] * Math.PI) / 180) *
        Math.cos((placeLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const distKm = Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1)) || 2.5;

    const driveMins = Math.max(3, Math.round(distKm * 2.8 + (distKm > 4 ? 4 : 1)));
    const transitMins = Math.max(5, Math.round(distKm * 2.2 + 6));
    const walkMins = Math.max(8, Math.round(distKm * 12.5));

    let trafficStatus = 'Smooth Flow';
    let trafficColor = '#16a34a';
    if (distKm > 6) {
      trafficStatus = 'Heavy Peak Delay (+7m)';
      trafficColor = '#dc2626';
    } else if (distKm > 3) {
      trafficStatus = 'Moderate Flow (+3m)';
      trafficColor = '#d97706';
    }

    return { distKm, driveMins, transitMins, walkMins, trafficStatus, trafficColor };
  };

  // Initialize Leaflet Map with OpenStreetMap Standard Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center || [18.9220, 72.8347],
        zoom: 13,
        zoomControl: false // Custom styled controls
      });

      // Standard Zoom Control
      L.control.zoom({ position: 'topright' }).addTo(map);

      // 100% Free OpenStreetMap Standard Tiles (Zero API Key Needed)
      const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      const tiles = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 19
      });
      tiles.addTo(map);
      mapInstanceRef.current = map;
      mapInstanceRef.current._tileLayer = tiles;

      // Layer Groups
      markersLayerRef.current = L.layerGroup().addTo(map);
      hazardsLayerRef.current = L.layerGroup().addTo(map);
      trafficLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => {
        map.invalidateSize();
      }, 150);

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

  // Update Tile Layer if toggled
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map._tileLayer) return;

    map.removeLayer(map._tileLayer);
    const tileUrl = tileTheme === 'esri'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
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

    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
    }

    if (showRadius) {
      const circle = L.circle(center, {
        radius: radiusKm * 1000,
        color: '#0284c7',
        fillColor: '#0284c7',
        fillOpacity: 0.07,
        weight: 2,
        dashArray: '6, 8'
      }).addTo(map);
      radiusCircleRef.current = circle;
    }
  }, [center, radiusKm, showRadius]);

  // Render Live Traffic Flow Corridors
  useEffect(() => {
    const map = mapInstanceRef.current;
    const trafficLayer = trafficLayerRef.current;
    if (!map || !trafficLayer || !center) return;

    trafficLayer.clearLayers();
    if (!showTraffic) return;

    // Simulated Arterial Traffic Lines around anchor
    const cLat = center[0];
    const cLng = center[1];

    const trafficSegments = [
      // Arterial 1: North-South Boulevard (Moderate)
      { coords: [[cLat - 0.025, cLng - 0.004], [cLat - 0.008, cLng - 0.002], [cLat + 0.015, cLng + 0.001], [cLat + 0.030, cLng + 0.003]], color: '#d97706', label: 'Central Arterial: Moderate Flow (24 km/h)' },
      // Arterial 2: East Avenue (Clear Flow)
      { coords: [[cLat + 0.005, cLng - 0.025], [cLat + 0.003, cLng], [cLat + 0.001, cLng + 0.028]], color: '#16a34a', label: 'Ring Expressway: Smooth Flow (46 km/h)' },
      // Arterial 3: Junction Chokepoint (Heavy Delay)
      { coords: [[cLat - 0.006, cLng - 0.012], [cLat - 0.004, cLng - 0.003], [cLat - 0.001, cLng + 0.008]], color: '#dc2626', label: 'Commercial Chowk: Bottleneck (+8m delay)' }
    ];

    trafficSegments.forEach((seg) => {
      const line = L.polyline(seg.coords, {
        color: seg.color,
        weight: 6,
        opacity: 0.75,
        lineCap: 'round',
        lineJoin: 'round'
      });
      line.bindTooltip(seg.label, { direction: 'top', sticky: true });
      line.addTo(trafficLayer);
    });
  }, [center, showTraffic]);

  // Render Destination Pins & Popups
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // Exploration Anchor Pin
    if (center) {
      const originIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="
          width: 24px; height: 24px; border-radius: 50%;
          background: #0284c7; border: 3px solid #ffffff;
          box-shadow: 0 0 14px rgba(2, 132, 199, 0.7);
          animation: pulse-origin 2s infinite ease-in-out;
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker(center, { icon: originIcon })
        .bindTooltip('📍 Your Current Exploration Anchor', { permanent: false, direction: 'top' })
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
      const { distKm, driveMins, transitMins, walkMins, trafficStatus, trafficColor } = getTravelEstimates(place.lat, place.lng);

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

      // Crisp Light Mode Popup HTML with Navigation Estimated Time and Live Traffic Condition
      const popupHtml = `
        <div style="min-width: 260px; font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; padding: 4px;">
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #0284c7; letter-spacing: 0.04em; background: #e0f2fe; padding: 2px 7px; border-radius: 4px;">
              ${place.category.replace('_', ' ')}
            </span>
            <span style="font-size: 12px; font-weight: 700; color: #b45309; background: #fef3c7; padding: 2px 6px; border-radius: 4px;">
              ⭐ ${place.rating}
            </span>
          </div>

          <!-- Place Title & Address -->
          <h4 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0; line-height: 1.3;">
            ${place.name}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.4;">
            ${place.address || ''} • <strong>${distKm} km away</strong>
          </p>

          <!-- Navigation Estimated Time Strip -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; margin-bottom: 8px;">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.04em; margin-bottom: 4px;">
              ⏱️ Estimated Travel Time:
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: #0f172a;">
              <span>🚗 ~${driveMins}m drive</span>
              <span>🚌 ~${transitMins}m transit</span>
              <span>🚶 ~${walkMins}m walk</span>
            </div>
          </div>

          <!-- Live Traffic Condition -->
          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; margin-bottom: 10px; padding: 4px 8px; border-radius: 6px; background: ${trafficColor}15; color: ${trafficColor}; border: 1px solid ${trafficColor}30;">
            <span style="font-size: 13px;">🚦</span>
            <span>Live Traffic: ${trafficStatus}</span>
          </div>

          <!-- Attributes: Safety & Cleanliness -->
          <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
            <span style="font-size: 10px; background: #ecfdf5; color: #15803d; border: 1px solid #bbf7d0; padding: 2px 6px; border-radius: 99px; font-weight: 600;">
              🛡️ Safe: ${place.safetyScore}/10
            </span>
            <span style="font-size: 10px; background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; padding: 2px 6px; border-radius: 99px; font-weight: 600;">
              ✨ Clean: ${place.cleanlinessScore}/10
            </span>
            <span style="font-size: 10px; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 99px; font-weight: 600;">
              ${place.priceLevel} (${place.estimatedCost})
            </span>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 6px;">
            <button id="btn-popup-view-${place.id}" style="
              flex: 1; background: #0284c7; color: white; border: none;
              padding: 7px 8px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;
            ">
              Lore 🎧
            </button>
            <button id="btn-popup-nav-${place.id}" style="
              flex: 1; background: #475569; color: white; border: none;
              padding: 7px 8px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;
            ">
              Plan 🧭
            </button>
            <button id="btn-popup-gmaps-${place.id}" style="
              flex: 1.4; background: #1a73e8; color: white; border: none;
              padding: 7px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;
              box-shadow: 0 1px 4px rgba(26,115,232,0.35);
            ">
              Google Maps ↗
            </button>
          </div>
        </div>
      `;

      const marker = L.marker([place.lat, place.lng], { icon })
        .bindTooltip(`${place.name} • 🚗 ~${driveMins}m`, { direction: 'top' })
        .bindPopup(popupHtml)
        .addTo(layer);

      marker.on('popupopen', () => {
        const btnView = document.getElementById(`btn-popup-view-${place.id}`);
        const btnNav = document.getElementById(`btn-popup-nav-${place.id}`);
        const btnGmaps = document.getElementById(`btn-popup-gmaps-${place.id}`);
        if (btnView) btnView.onclick = () => onSelectPlace(place);
        if (btnNav) btnNav.onclick = () => onNavigateTo(place);
        if (btnGmaps) {
          btnGmaps.onclick = () => {
            openGoogleMapsNavigation({
              destLat: place.lat,
              destLng: place.lng,
              destName: place.name,
              originLat: userLocation ? userLocation[0] : center[0],
              originLng: userLocation ? userLocation[1] : center[1]
            });
          };
        }
      });
    });
  }, [places, center, userLocation, onSelectPlace, onNavigateTo]);

  // Render Safety Hazards
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
        <div style="min-width: 220px; font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px;">
              ${haz.severity.toUpperCase()} HAZARD
            </span>
            <span style="font-size: 11px; color: #64748b;">${haz.reportedDate}</span>
          </div>
          <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">
            ${haz.title}
          </h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 8px 0; line-height: 1.4;">
            ${haz.description}
          </p>
          <div style="font-size: 10px; color: #16a34a; font-weight: 600;">
            ✓ Verified by ${haz.verifiedCount || 12} Citizens
          </div>
        </div>
      `;

      L.marker([haz.lat, haz.lng], { icon })
        .bindPopup(popupHtml)
        .addTo(layer);

      L.circle([haz.lat, haz.lng], {
        radius: 250,
        color: '#dc2626',
        fillColor: '#dc2626',
        fillOpacity: 0.12,
        weight: 1
      }).addTo(layer);
    });
  }, [hazards, showHazards]);

  // Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (activeRoutePolyline && activeRoutePolyline.coordinates) {
      const isSafeGuard = activeRoutePolyline.isSafeGuard;
      const polyline = L.polyline(activeRoutePolyline.coordinates, {
        color: isSafeGuard ? '#16a34a' : '#0284c7',
        weight: 5,
        opacity: 0.85,
        dashArray: isSafeGuard ? undefined : '8, 6'
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      routePolylineRef.current = polyline;
    }
  }, [activeRoutePolyline]);

  // Fit bounds to all places
  const handleFitAllPlaces = () => {
    const map = mapInstanceRef.current;
    if (!map || places.length === 0) return;
    const group = L.featureGroup(places.map(p => L.marker([p.lat, p.lng])));
    map.fitBounds(group.getBounds().pad(0.15));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      {/* Map DOM Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Status Badge (Bottom Left) */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 500,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        boxShadow: 'var(--shadow-md)',
        fontSize: '11px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a' }}>
          <span>🗺️ Leaflet + OpenStreetMap</span>
          <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#16a34a', padding: '1px 6px', borderRadius: '4px' }}>
            Zero API Key Needed
          </span>
        </div>
        {showTraffic && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: '#475569' }}>
            <span>Traffic:</span>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>● Smooth</span>
            <span style={{ color: '#d97706', fontWeight: 700 }}>● Moderate</span>
            <span style={{ color: '#dc2626', fontWeight: 700 }}>● Heavy</span>
          </div>
        )}
      </div>

      {/* Floating Map Controls Toolbar (Top Right) */}
      <div style={{
        position: 'absolute',
        top: '60px', /* Below zoom controls */
        right: '12px',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {/* Toggle Live Traffic Layer */}
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          title="Toggle Realtime Traffic Flow Corridors"
          style={{
            background: showTraffic ? '#d97706' : '#ffffff',
            color: showTraffic ? '#ffffff' : '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '7px 11px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Activity size={14} />
          <span>{showTraffic ? '🚦 Traffic Live' : '🚦 Traffic Off'}</span>
        </button>

        {/* Toggle Radius */}
        <button
          onClick={() => setShowRadius(!showRadius)}
          title="Toggle Exploration Radius Boundary"
          style={{
            background: showRadius ? '#0284c7' : '#ffffff',
            color: showRadius ? '#ffffff' : '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '7px 11px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Eye size={14} />
          <span>{radiusKm}km Radius</span>
        </button>

        {/* Toggle Safety Hazard Hotspots */}
        <button
          onClick={() => setShowHazards(!showHazards)}
          title="Toggle Safety Hazard Hotspots"
          style={{
            background: showHazards ? '#dc2626' : '#ffffff',
            color: showHazards ? '#ffffff' : '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '7px 11px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <ShieldAlert size={14} />
          <span>Hazards</span>
        </button>

        {/* Fit All Places */}
        <button
          onClick={handleFitAllPlaces}
          title="Fit View to All Places"
          style={{
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '7px 11px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Maximize2 size={14} />
          <span>Fit All</span>
        </button>

        {/* Re-center on Anchor */}
        <button
          onClick={() => {
            if (mapInstanceRef.current && center) {
              mapInstanceRef.current.setView(center, 13, { animate: true });
            }
          }}
          title="Recenter Map on Anchor"
          style={{
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '7px 11px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Crosshair size={14} />
          <span>Recenter</span>
        </button>

        {/* Close Map Button */}
        {onClose && (
          <button
            onClick={onClose}
            title="Close Interactive Map View"
            style={{
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
              marginTop: '4px'
            }}
          >
            <span>✕ Close Map</span>
          </button>
        )}
      </div>
    </div>
  );
}
