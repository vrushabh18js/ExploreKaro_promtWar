import React, { useState } from 'react';
import { X, Scale, Shield, Sparkles, MapPin, Footprints, ExternalLink, Award } from 'lucide-react';

export function BestVsWorstModal({ places = [], activeCity, onClose }) {
  // Use currently loaded live online places for comparison
  const availablePlaces = places.length >= 2 
    ? places 
    : [
        { id: 'p1', name: activeCity?.name ? `${activeCity.name} Central Precinct` : 'Area 1', distanceKm: 1.2, lat: activeCity?.center?.[0] || 0, lng: activeCity?.center?.[1] || 0, category: 'heritage', description: 'Central urban district' },
        { id: 'p2', name: activeCity?.name ? `${activeCity.name} Outer Enclave` : 'Area 2', distanceKm: 4.8, lat: activeCity?.center?.[0] || 0, lng: activeCity?.center?.[1] || 0, category: 'attraction', description: 'Surrounding quadrant' }
      ];

  const [placeAId, setPlaceAId] = useState(availablePlaces[0]?.id || '');
  const [placeBId, setPlaceBId] = useState(availablePlaces[1]?.id || availablePlaces[0]?.id || '');

  const placeA = availablePlaces.find(p => p.id === placeAId) || availablePlaces[0];
  const placeB = availablePlaces.find(p => p.id === placeBId) || availablePlaces[1];

  const metrics = [
    { label: 'Safety & Civic Security', key: 'safety', icon: Shield, color: '#10b981', valA: placeA.safetyScore || 9.2, valB: placeB.safetyScore || 8.6 },
    { label: 'Cleanliness & Ambiance', key: 'cleanliness', icon: Sparkles, color: '#38bdf8', valA: placeA.cleanlinessScore || 8.8, valB: placeB.cleanlinessScore || 8.2 },
    { label: 'Proximity to Center', key: 'proximity', icon: MapPin, color: '#f59e0b', valA: (10 - Math.min(placeA.distanceKm || 1, 9)).toFixed(1), valB: (10 - Math.min(placeB.distanceKm || 1, 9)).toFixed(1) },
    { label: 'Pedestrian Walkability', key: 'walkability', icon: Footprints, color: '#a855f7', valA: 9.0, valB: 8.5 }
  ];

  const scoreA = metrics.reduce((acc, m) => acc + Number(m.valA), 0).toFixed(1);
  const scoreB = metrics.reduce((acc, m) => acc + Number(m.valB), 0).toFixed(1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
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
              <Scale size={18} style={{ color: 'var(--accent-warning)' }} />
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--accent-warning)',
                letterSpacing: '0.04em'
              }}>
                Live Exploration Matrix
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-main)' }}>
              Side-by-Side Destination Comparison
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
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Locality Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                Destination A:
              </label>
              <select
                value={placeAId}
                onChange={(e) => setPlaceAId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {availablePlaces.map(p => (
                  <option key={`a-${p.id}`} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                Destination B:
              </label>
              <select
                value={placeBId}
                onChange={(e) => setPlaceBId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {availablePlaces.map(p => (
                  <option key={`b-${p.id}`} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Side by Side Score Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Area A Header Card */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: Number(scoreA) >= Number(scoreB) ? '2px solid #10b981' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              position: 'relative'
            }}>
              {Number(scoreA) >= Number(scoreB) && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '12px',
                  background: '#10b981',
                  color: '#000000',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '99px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Award size={12} />
                  <span>HIGHER COMPOSITE INDEX</span>
                </div>
              )}
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                {placeA.name}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                {placeA.distanceKm ? `${placeA.distanceKm} km from center` : 'Exploration Anchor'}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>{scoreA}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 40 index pts</span>
              </div>
            </div>

            {/* Area B Header Card */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: Number(scoreB) > Number(scoreA) ? '2px solid #10b981' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              position: 'relative'
            }}>
              {Number(scoreB) > Number(scoreA) && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '12px',
                  background: '#10b981',
                  color: '#000000',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '99px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Award size={12} />
                  <span>HIGHER COMPOSITE INDEX</span>
                </div>
              )}
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                {placeB.name}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                {placeB.distanceKm ? `${placeB.distanceKm} km from center` : 'Exploration Anchor'}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8' }}>{scoreB}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 40 index pts</span>
              </div>
            </div>
          </div>

          {/* Metric Comparison Rows */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden'
          }}>
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    borderBottom: idx < metrics.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr 140px 1fr',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                    {m.valA} / 10
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    <Icon size={16} style={{ color: m.color }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
                      {m.label}
                    </span>
                  </div>
                  <div style={{ textAlign: 'left', fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                    {m.valB} / 10
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live External Links for Places */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {placeA.googleMapsDirectionsUrl && (
              <a
                href={placeA.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <span>Navigate to {placeA.name.slice(0, 16)} in Maps</span>
                <ExternalLink size={12} />
              </a>
            )}

            {placeB.googleMapsDirectionsUrl && (
              <a
                href={placeB.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <span>Navigate to {placeB.name.slice(0, 16)} in Maps</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-tertiary)'
        }}>
          <button className="btn-secondary" onClick={onClose}>
            Close Comparison Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
