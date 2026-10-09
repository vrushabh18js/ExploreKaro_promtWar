import React from 'react';
import { 
  X, Volume2, VolumeX, MapPin, Navigation, Heart, ExternalLink, Globe 
} from 'lucide-react';

export function PlaceDetailModal({
  place,
  onClose,
  onNavigateTo,
  isPlayingAudio,
  onToggleAudio,
  isBookmarked,
  onToggleBookmark
}) {
  if (!place) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        {/* Real Wikimedia Photo Header */}
        {place.photoUrl && (
          <div style={{ height: '220px', width: '100%', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
            <img
              src={place.photoUrl}
              alt={place.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
            }} />
            <span style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              fontSize: '11px',
              fontWeight: 700,
              background: 'rgba(0,0,0,0.7)',
              color: '#38bdf8',
              padding: '3px 10px',
              borderRadius: '4px',
              backdropFilter: 'blur(4px)'
            }}>
              📷 Verified Wikimedia Photography
            </span>
          </div>
        )}

        {/* Modal Header */}
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
              {place.category?.toUpperCase() || 'DESTINATION'} • ONLINE VERIFIED
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-main)' }}>
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
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Coordinates and Distance */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-tertiary)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
              <MapPin size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>Real GPS: {place.lat?.toFixed(5)}, {place.lng?.toFixed(5)}</span>
            </div>
            {place.distanceKm !== undefined && (
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                {place.distanceKm} km from location center
              </span>
            )}
          </div>

          {/* Historical & Cultural Audio Guide */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(168, 85, 247, 0.1))',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={18} style={{ color: 'var(--accent-primary)' }} />
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Interactive Web Speech Cultural Guide
                </h4>
              </div>
              <button
                onClick={() => onToggleAudio(place)}
                style={{
                  background: isPlayingAudio ? '#ef4444' : 'var(--accent-primary)',
                  color: isPlayingAudio ? '#ffffff' : '#000000',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isPlayingAudio ? 'Stop Audio' : 'Play Narration'}</span>
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
              {place.audioStory || place.historicalLore || place.description}
            </p>
          </div>

          {/* In-Depth Historical & Cultural Lore from Real Wikipedia Data */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Verified Cultural Lore & Background
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
              {place.historicalLore || place.description}
            </p>
          </div>

          {/* External Verified Reference Links */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {place.googleMapsDirectionsUrl && (
              <a
                href={place.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <span>Open in Google Maps Navigation</span>
                <ExternalLink size={13} />
              </a>
            )}

            {place.wikipediaUrl && (
              <a
                href={place.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <Globe size={14} />
                <span>Read Full Wikipedia Article</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Footer Actions */}
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
            Close
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onClose();
              onNavigateTo(place);
            }}
          >
            <Navigation size={16} />
            <span>Plan Route with OSRM & Google Maps</span>
          </button>
        </div>
      </div>
    </div>
  );
}
