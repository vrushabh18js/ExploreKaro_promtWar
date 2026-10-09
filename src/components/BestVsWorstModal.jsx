import React, { useState } from 'react';
import { X, Scale, Shield, Sparkles, Wallet, Footprints, Train, CheckCircle2, XCircle, Award } from 'lucide-react';
import { SEED_CITIES } from '../data/citiesData';

export function BestVsWorstModal({ activeCity, onClose }) {
  // Aggregate all neighborhoods across seed cities for deep comparison flexibility
  const availableNeighborhoods = activeCity.neighborhoodMatrix?.length > 1
    ? activeCity.neighborhoodMatrix
    : SEED_CITIES.flatMap(c => c.neighborhoodMatrix);

  const [areaAId, setAreaAId] = useState(availableNeighborhoods[0]?.id || '');
  const [areaBId, setAreaBId] = useState(availableNeighborhoods[1]?.id || availableNeighborhoods[0]?.id || '');

  const areaA = availableNeighborhoods.find(n => n.id === areaAId) || availableNeighborhoods[0];
  const areaB = availableNeighborhoods.find(n => n.id === areaBId) || availableNeighborhoods[1];

  const metrics = [
    { label: 'Safety & Security', key: 'safety', icon: Shield, color: '#10b981' },
    { label: 'Cleanliness & Air', key: 'cleanliness', icon: Sparkles, color: '#38bdf8' },
    { label: 'Affordability', key: 'affordability', icon: Wallet, color: '#f59e0b' },
    { label: 'Pedestrian Walkability', key: 'walkability', icon: Footprints, color: '#a855f7' },
    { label: 'Transit Connectivity', key: 'transit', icon: Train, color: '#06b6d4' }
  ];

  // Calculate overall composite score out of 50
  const scoreA = metrics.reduce((acc, m) => acc + (areaA[m.key] || 0), 0).toFixed(1);
  const scoreB = metrics.reduce((acc, m) => acc + (areaB[m.key] || 0), 0).toFixed(1);

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
                City Reality Index
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-main)' }}>
              Best vs. Worst Neighborhood Comparison Matrix
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
            {/* Area A Selector */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                Locality A:
              </label>
              <select
                value={areaAId}
                onChange={(e) => setAreaAId(e.target.value)}
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
                {availableNeighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    📍 {n.name}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                {areaA.vibe}
              </div>
            </div>

            {/* Area B Selector */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-warning)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                Locality B:
              </label>
              <select
                value={areaBId}
                onChange={(e) => setAreaBId(e.target.value)}
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
                {availableNeighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    📍 {n.name}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                {areaB.vibe}
              </div>
            </div>
          </div>

          {/* Metric Comparison Table with Visual Bars */}
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '16px'
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px' }}>
              Standardized Rating Breakdown (1 - 10 Scale)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {metrics.map((m) => {
                const valA = areaA[m.key] || 0;
                const valB = areaB[m.key] || 0;
                const isAWinner = valA > valB;
                const isBWinner = valB > valA;
                const Icon = m.icon;

                return (
                  <div key={m.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                      <span style={{ color: isAWinner ? m.color : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isAWinner && '🏆'} {valA} / 10
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                        <Icon size={14} style={{ color: m.color }} />
                        {m.label}
                      </span>
                      <span style={{ color: isBWinner ? m.color : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {valB} / 10 {isBWinner && '🏆'}
                      </span>
                    </div>

                    {/* Dual comparison bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {/* Bar A (right aligned) */}
                      <div style={{ background: 'var(--bg-secondary)', height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{
                          width: `${valA * 10}%`,
                          background: isAWinner ? m.color : 'var(--text-dim)',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                      {/* Bar B (left aligned) */}
                      <div style={{ background: 'var(--bg-secondary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${valB * 10}%`,
                          background: isBWinner ? m.color : 'var(--text-dim)',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pros, Cons & Crowd Levels Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Area A Details */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--accent-primary)' }}>{areaA.name}</strong>
                <span style={{ fontSize: '11px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                  Crowd: {areaA.crowdLevel}
                </span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>Strengths:</div>
                {areaA.pros?.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-main)', marginBottom: '2px' }}>
                    <CheckCircle2 size={12} style={{ color: '#10b981', flexShrink: 0 }} /> {p}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>Drawbacks:</div>
                {areaA.cons?.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    <XCircle size={12} style={{ color: '#ef4444', flexShrink: 0 }} /> {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Area B Details */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--accent-warning)' }}>{areaB.name}</strong>
                <span style={{ fontSize: '11px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                  Crowd: {areaB.crowdLevel}
                </span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>Strengths:</div>
                {areaB.pros?.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-main)', marginBottom: '2px' }}>
                    <CheckCircle2 size={12} style={{ color: '#10b981', flexShrink: 0 }} /> {p}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>Drawbacks:</div>
                {areaB.cons?.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    <XCircle size={12} style={{ color: '#ef4444', flexShrink: 0 }} /> {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Composite Verdict */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(16, 185, 129, 0.1))',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Award size={18} style={{ color: 'var(--accent-primary)' }} />
              <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>
                exploreKaro Urban Reality Verdict:
              </strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
              {Number(scoreA) > Number(scoreB)
                ? `${areaA.name} scores higher overall (${scoreA}/50 vs ${scoreB}/50), offering superior safety and walking infrastructure. However, ${areaB.name} is significantly better for budget shopping and authentic street food. Choose ${areaA.name} for evening stays and relaxed walks, and ${areaB.name} for daytime explorations.`
                : `${areaB.name} leads overall (${scoreB}/50 vs ${scoreA}/50) with better cleanliness and connectivity. Meanwhile, ${areaA.name} shines for unique character. For family stays and solo travelers, ${areaB.name} is recommended.`}
            </p>
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
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
