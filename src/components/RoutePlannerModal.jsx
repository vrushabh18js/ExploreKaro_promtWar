import React, { useState } from 'react';
import { 
  X, Car, Train, Bike, Footprints, Shield, Zap, 
  MapPin, CheckCircle2, AlertTriangle, ArrowRight, Leaf 
} from 'lucide-react';

export function RoutePlannerModal({
  originPlace,
  destinationPlace,
  allPlaces,
  hazards,
  onClose,
  onApplyRoute
}) {
  const [selectedOrigin, setSelectedOrigin] = useState(originPlace?.id || (allPlaces[0]?.id || ''));
  const [selectedDest, setSelectedDest] = useState(destinationPlace?.id || (allPlaces[1]?.id || ''));
  const [transitMode, setTransitMode] = useState('transit'); // 'drive' | 'transit' | 'bike' | 'walk'
  const [routeType, setRouteType] = useState('safeguard'); // 'fastest' | 'safeguard'

  const originObj = allPlaces.find(p => p.id === selectedOrigin) || allPlaces[0];
  const destObj = allPlaces.find(p => p.id === selectedDest) || allPlaces[1];

  // Calculate simulated distances and times
  const calculateSimulatedRoute = () => {
    if (!originObj || !destObj) return null;

    const lat1 = originObj.lat;
    const lon1 = originObj.lng;
    const lat2 = destObj.lat;
    const lon2 = destObj.lng;

    // Approximate distance in KM
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const distKm = Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1)) || 4.2;

    const speedMap = { drive: 22, transit: 28, bike: 16, walk: 4.8 };
    const baseMinutes = Math.round((distKm / speedMap[transitMode]) * 60) + 3;

    // Live Traffic condition impact
    const isPeakTraffic = distKm > 3;
    const trafficDelayMinutes = transitMode === 'drive' ? (isPeakTraffic ? 5 : 2) : (transitMode === 'transit' ? 3 : 0);
    const isSafe = routeType === 'safeguard';
    const finalMinutes = isSafe ? baseMinutes + 2 : baseMinutes + trafficDelayMinutes;
    const finalDist = isSafe ? Number((distKm * 1.08).toFixed(1)) : distKm;
    const safetyRating = isSafe ? 9.5 : 7.2;

    const trafficCondition = isSafe
      ? '🟢 SafeGuard Bypass: Heavy bottlenecks avoided (Clear Flow)'
      : (isPeakTraffic ? '🔴 Peak Congestion: +5m delay detected on arterial' : '🟢 Smooth Traffic Movement');

    // Create polyline coordinates
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lon1 + lon2) / 2;

    const coordinates = [
      [lat1, lon1],
      isSafe
        ? [midLat + 0.005, midLng - 0.004] // Safe commercial detour
        : [midLat, midLng], // Direct path through potential congestion
      [lat2, lon2]
    ];

    return {
      distanceKm: finalDist,
      minutes: finalMinutes,
      baseMinutes,
      trafficDelayMinutes,
      trafficCondition,
      safetyRating,
      carbonSavedKg: transitMode === 'transit' ? (finalDist * 0.12).toFixed(1) : (transitMode === 'walk' || transitMode === 'bike') ? (finalDist * 0.18).toFixed(1) : '0',
      coordinates,
      isSafeGuard: isSafe,
      turns: isSafe ? [
        `Start from ${originObj.name} via Main Well-Lit Commercial Boulevard (CCTV Monitored)`,
        `Bypass reported dark underpass via City Centre Avenue (Police Booth 200m)`,
        `Proceed straight along Metro Line Corridor (Congestion avoided)`,
        `Arrive safely at ${destObj.name}`
      ] : [
        `Head straight from ${originObj.name} onto Central Express Alley`,
        `Cross congested intersection (Caution: Heavy Traffic & Slow Moving)`,
        `Turn right toward ${destObj.name}`
      ]
    };
  };

  const routeDetails = calculateSimulatedRoute();

  const handleApply = () => {
    if (!routeDetails) return;
    onApplyRoute(routeDetails);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--accent-primary)',
              letterSpacing: '0.04em'
            }}>
              Smart Navigation Engine
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-main)' }}>
              Dual Route & Safety Sentinel
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Origin Starting Point:
              </label>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                {allPlaces.map((p) => (
                  <option key={p.id} value={p.id}>
                    📍 {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Destination:
              </label>
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                {allPlaces.map((p) => (
                  <option key={p.id} value={p.id}>
                    🎯 {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Travel Mode Pills */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
              Select Travel Mode:
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
                    onClick={() => setTransitMode(m.id)}
                    style={{
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-tertiary)',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '12px'
                    }}
                  >
                    <Icon size={18} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dual Route Toggle: SafeGuard vs Fastest */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
              Routing Philosophy:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* SafeGuard Route */}
              <div
                onClick={() => setRouteType('safeguard')}
                style={{
                  background: routeType === 'safeguard' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-tertiary)',
                  border: `2px solid ${routeType === 'safeguard' ? '#10b981' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={16} style={{ color: '#10b981' }} />
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#10b981' }}>SafeGuard Route</span>
                  </div>
                  <span style={{ fontSize: '11px', background: '#10b981', color: '#000000', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    Recommended
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  Prioritizes CCTV coverage, well-lit active boulevards, and bypasses reported accident & crime zones.
                </p>
                <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
                  Safety Score: 9.5 / 10
                </div>
              </div>

              {/* Fastest Route */}
              <div
                onClick={() => setRouteType('fastest')}
                style={{
                  background: routeType === 'fastest' ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-tertiary)',
                  border: `2px solid ${routeType === 'fastest' ? '#38bdf8' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={16} style={{ color: '#38bdf8' }} />
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#38bdf8' }}>Fastest Route</span>
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  Shortest distance via express links, but may include poorly lit shortcuts and peak traffic choke corridors.
                </p>
                <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>
                  Safety Score: 7.2 / 10
                </div>
              </div>
            </div>
          </div>

          {/* Route Summary Card */}
          {routeDetails && (
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                    ⏱️ Navigation Estimated Time:
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {routeDetails.minutes} mins
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    ({routeDetails.distanceKm} km)
                  </span>
                </div>
                {Number(routeDetails.carbonSavedKg) > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: '#16a34a',
                    background: '#ecfdf5',
                    border: '1px solid #bbf7d0',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600
                  }}>
                    <Leaf size={12} />
                    <span>Saves {routeDetails.carbonSavedKg} kg CO₂</span>
                  </div>
                )}
              </div>

              {/* Live Traffic Condition Banner */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0f172a'
              }}>
                <span style={{ fontSize: '14px' }}>🚦</span>
                <span>{routeDetails.trafficCondition}</span>
              </div>

              {/* Turn-by-Turn Guidance */}
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Navigation Waypoints:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {routeDetails.turns.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={13} style={{ color: routeType === 'safeguard' ? '#10b981' : '#38bdf8', marginTop: '2px', flexShrink: 0 }} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          <button className="btn-primary" onClick={handleApply}>
            <span>Render Route on Map</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
