import React from 'react';
import { Star, Volume2, Navigation, Bookmark, MapPin, ExternalLink, Globe } from 'lucide-react';

export function PlaceCard({
  place,
  distanceKm,
  isBookmarked,
  onToggleBookmark,
  onSelectPlace,
  onNavigateTo,
  onPlayAudio,
  isPlayingAudio
}) {
  const categoryLabels = {
    heritage: '🏛️ Heritage & Lore',
    food: '🍲 Authentic Food',
    hotel: '🏨 Stay & Hospitality',
    hidden_gem: '💎 Scenic Gem',
    attraction: '🎡 Landmark & Attraction'
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--border-active)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
      onClick={() => onSelectPlace(place)}
    >
      {/* Real Online Photo Banner (Wikimedia Commons) */}
      {place.photoUrl && (
        <div style={{ height: '140px', width: '100%', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
          <img
            src={place.photoUrl}
            alt={place.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
          }} />
          <span style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            fontSize: '10px',
            fontWeight: 700,
            background: 'rgba(0,0,0,0.65)',
            color: '#38bdf8',
            padding: '2px 8px',
            borderRadius: '4px',
            backdropFilter: 'blur(4px)'
          }}>
            📷 Wikimedia Verified
          </span>
        </div>
      )}

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Top Meta: Category, Distance & Bookmark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
            background: 'rgba(56, 189, 248, 0.1)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            letterSpacing: '0.04em'
          }}>
            {categoryLabels[place.category] || 'Explore'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {distanceKm !== undefined && (
              <span style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <MapPin size={12} style={{ color: 'var(--accent-primary)' }} />
                {distanceKm} km away
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(place.id);
              }}
              title={isBookmarked ? 'Remove from Saved' : 'Save to Favorites'}
              style={{
                background: isBookmarked ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-tertiary)',
                color: isBookmarked ? 'var(--accent-secondary)' : 'var(--text-dim)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-main)',
          margin: '0 0 6px 0',
          lineHeight: 1.3
        }}>
          {place.name}
        </h3>

        {/* Real GPS Coordinates */}
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={11} style={{ color: 'var(--accent-primary)' }} />
          <span>Real Coordinates: {place.lat?.toFixed(4)}, {place.lng?.toFixed(4)}</span>
        </div>

        {/* Short Verified Description */}
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          lineHeight: 1.45,
          marginBottom: '14px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1
        }}>
          {place.description}
        </p>

        {/* External Quick Links: Google Maps Directions & Wikipedia */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {place.googleMapsDirectionsUrl && (
            <a
              href={place.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '3px 8px',
                borderRadius: '4px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Google Maps</span>
              <ExternalLink size={10} />
            </a>
          )}

          {place.wikipediaUrl && (
            <a
              href={place.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                background: 'var(--bg-tertiary)',
                padding: '3px 8px',
                borderRadius: '4px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Globe size={11} />
              <span>Wikipedia</span>
            </a>
          )}
        </div>
      </div>

      {/* Action Footer: Audio Story Lore & Navigate */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        {/* Listen to Real Audio Lore */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayAudio(place);
          }}
          className="btn-secondary"
          style={{ flex: 1, padding: '7px 10px', fontSize: '12px' }}
          title="Narrate Verified Historical Story via Speech API"
        >
          <Volume2 size={14} style={{ color: isPlayingAudio ? 'var(--accent-success)' : 'inherit' }} />
          <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Lore'}</span>
        </button>

        {/* Navigate Here */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigateTo(place);
          }}
          className="btn-primary"
          style={{ flex: 1, padding: '7px 10px', fontSize: '12px' }}
          title="Plan Live Road Route with OSRM and Google Maps"
        >
          <Navigation size={14} />
          <span>Navigate</span>
        </button>
      </div>
    </div>
  );
}
