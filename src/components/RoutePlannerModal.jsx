import React, { useState, useEffect } from 'react';
import { 
  X, Car, Train, Bike, Footprints, Shield, Zap, 
  MapPin, CheckCircle2, ArrowRight, ExternalLink, Loader2 
} from 'lucide-react';
import { fetchOnlineRoute } from '../services/apiService';

export function RoutePlannerModal({
  originPlace,
  destinationPlace,
  allPlaces = [],
  userCoords,
  onClose,
  onApplyRoute
}) {
  const [selectedOriginId, setSelectedOriginId] = useState(originPlace?.id || allPlaces[0]?.id || '');
  const [selectedDestId, setSelectedDestId] = useState(destinationPlace?.id || allPlaces[1]?.id || allPlaces[0]?.id || '');
  const [transitMode, setTransitMode] = useState('drive'); // 'drive' | 'transit' | 'bike' | 'walk'
  const [routeType, setRouteType] = useState('safeguard'); // 'fastest' | 'safeguard'
  const [routeResult, setRouteResult] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Determine origin and destination objects
  const originObj = selectedOriginId === 'my-gps' && userCoords
    ? { id: 'my-gps', name: 'My Current GPS Location', lat: userCoords[0], lng: userCoords[1] }
    : allPlaces.find(p => p.id === selectedOriginId) || allPlaces[0];

  const destObj = allPlaces.find(p => p.id === selectedDestId) || allPlaces[1] || allPlaces[0];

  // Fetch real online road route whenever origin, dest or mode changes
  useEffect(() => {
    if (!originObj || !destObj || (originObj.lat === destObj.lat && originObj.lng === destObj.lng)) {
      setRouteResult(null);
      return;
    }

    let isMounted = true;
    setIsLoadingRoute(true);
    setRouteError(null);

    fetchOnlineRoute(originObj.lat, originObj.lng, destObj.lat, destObj.lng, transitMode)
      .then((res) => {
        if (!isMounted) return;
        setRouteResult(res);
        setIsLoadingRoute(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setRouteError(err.message || 'Route service currently busy.');
        setIsLoadingRoute(false);
      });

    return () => { isMounted = false; };
  }, [originObj?.lat, originObj?.lng, destObj?.lat, destObj?.lng, transitMode]);

  const handleApply = () => {
    if (!routeResult) return;
    onApplyRoute(routeResult);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--accent-primary)',
                letterSpacing: '0.04em'
              }}>
                OSRM & Google Maps Engine
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-main)' }}>
              Live Multi-Modal Route Navigation
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Origin & Destination Selectors */}
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Origin */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                Origin (Starting Point):
              </label>
              <select
                value={selectedOriginId}
                onChange={(e) => setSelectedOriginId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 12px',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {userCoords && (
                  <option value="my-gps">📍 My Current GPS Location</option>
                )}
                {allPlaces.map((p) => (
                  <option key={`orig-${p.id}`} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                Destination:
              </label>
              <select
                value={selectedDestId}
                onChange={(e) => setSelectedDestId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 12px',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {allPlaces.map((p) => (
                  <option key={`dest-${p.id}`} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transit Modes */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
              Mode of Transit:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { id: 'drive', label: 'Drive', icon: Car },
                { id: 'transit', label: 'Transit', icon: Train },
                { id: 'bike', label: 'Bike', icon: Bike },
                { id: 'walk', label: 'Walk', icon: Footprints }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = transitMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTransitMode(m.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px 6px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-tertiary)',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    <Icon size={18} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real Route Calculation Output */}
          {isLoadingRoute ? (
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Computing live road route with OSRM routing network...</span>
            </div>
          ) : routeResult ? (
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {routeResult.durationMinutes} mins
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    ({routeResult.distanceKm} km live road network)
                  </span>
                </div>

                {/* Direct Google Maps Link */}
                <a
                  href={routeResult.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#1a73e8',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                  title="Open live navigation in Google Maps app"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Turn-by-Turn Guidance */}
              {routeResult.steps && routeResult.steps.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Live Navigational Maneuvers:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                    {routeResult.steps.slice(0, 6).map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <CheckCircle2 size={13} style={{ color: 'var(--accent-primary)', marginTop: '2px', flexShrink: 0 }} />
                        <span>{step.instruction} {step.distance ? `(${step.distance}m)` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : routeError ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontSize: '12px',
              color: '#ef4444'
            }}>
              ⚠️ {routeError}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          background: 'var(--bg-tertiary)'
        }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleApply}
            disabled={!routeResult || isLoadingRoute}
          >
            <span>Draw Live Route on Map</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
