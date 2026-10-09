import React from 'react';
import { 
  X, Volume2, VolumeX, Shield, Sparkles, Clock, 
  MapPin, Accessibility, Navigation, AlertCircle, Heart, ExternalLink 
} from 'lucide-react';
import { openGoogleMapsNavigation } from '../services/apiService';

export function PlaceDetailModal({
  place,
  onClose,
  onNavigateTo,
  isPlayingAudio,
  onToggleAudio,
  isBookmarked,
  onToggleBookmark,
  userLocation
}) {
  if (!place) return null;

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
              {place.category.replace('_', ' ')} • Verified Dossier
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-main)' }}>
              {place.name}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onToggleBookmark(place.id)}
              style={{
                background: isBookmarked ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-secondary)',
                color: isBookmarked ? 'var(--accent-secondary)' : 'var(--text-main)',
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
              <Heart size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
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
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px'
          }}>
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Safety Score</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={16} /> {place.safetyScore} / 10
              </div>
            </div>

            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cleanliness</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={16} /> {place.cleanlinessScore} / 10
              </div>
            </div>

            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Affordability</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fbbf24' }}>
                {place.priceLevel} ({place.estimatedCost})
              </div>
            </div>
          </div>

          {/* Navigation Estimated Time & Live Traffic Status Card */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Navigation size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>Navigation Estimated Time</span>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#15803d',
                background: '#ecfdf5',
                border: '1px solid #bbf7d0',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                🚦 Live Traffic: Smooth Flow
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              textAlign: 'center'
            }}>
              <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '16px', marginBottom: '2px' }}>🚗</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>~12 mins</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Drive</div>
              </div>
              <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '16px', marginBottom: '2px' }}>🚌</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>~18 mins</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Transit / Metro</div>
              </div>
              <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '16px', marginBottom: '2px' }}>🚲</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>~10 mins</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Bike / Two-Wheeler</div>
              </div>
              <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '16px', marginBottom: '2px' }}>🚶</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>~34 mins</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Walk</div>
              </div>
            </div>
          </div>

          {/* Historical & Cultural Audio Guide */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(168, 85, 247, 0.1))',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={18} style={{ color: 'var(--accent-heritage)' }} />
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Interactive AI Cultural Audio Narration
                </h4>
              </div>
              <button
                onClick={() => onToggleAudio(place)}
                style={{
                  background: isPlayingAudio ? '#ef4444' : 'var(--accent-heritage)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isPlayingAudio ? 'Pause Narration' : 'Play Narration'}</span>
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
              {place.audioStory || place.historicalLore}
            </p>
          </div>

          {/* In-Depth Historical Lore */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Historical Heritage & Origins
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {place.historicalLore}
            </p>
          </div>

          {/* Best Time & Visiting Advice */}
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Clock size={16} style={{ color: 'var(--accent-warning)' }} />
              <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>Optimal Visiting Window</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {place.bestTime}
            </p>
          </div>

          {/* Accessibility & Safety Protocol */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px'
          }}>
            {/* Accessibility */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Accessibility size={15} style={{ color: '#38bdf8' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Accessibility</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                {place.accessibility?.note || 'Standard pedestrian sidewalks available.'}
              </p>
            </div>

            {/* Emergency & Safety */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <AlertCircle size={15} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Safety Infrastructure</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                {place.emergencyNote || 'Regular local security surveillance active in precinct.'}
              </p>
            </div>
          </div>

          {/* Address & Tags */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <MapPin size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>{place.address}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {place.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '11px',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          background: 'var(--bg-tertiary)'
        }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              onClick={() => {
                onClose();
                onNavigateTo(place);
              }}
              title="Open internal multi-modal route planner"
            >
              <Navigation size={15} />
              <span>Route Planner</span>
            </button>
            <button
              type="button"
              onClick={() => {
                openGoogleMapsNavigation({
                  destLat: place.lat,
                  destLng: place.lng,
                  destName: place.name,
                  originLat: userLocation?.[0],
                  originLng: userLocation?.[1]
                });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#1a73e8',
                color: '#ffffff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(26, 115, 232, 0.35)',
                transition: 'all 0.15s ease'
              }}
              title="Open turn-by-turn directions directly in Google Maps"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Open in Google Maps</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
