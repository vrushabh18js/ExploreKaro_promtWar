import React from 'react';
import { Star, Shield, Sparkles, Volume2, Navigation, Bookmark, Clock, MapPin, ExternalLink } from 'lucide-react';
import { openGoogleMapsNavigation } from '../services/apiService';

export function PlaceCard({
  place,
  distanceKm,
  isBookmarked,
  onToggleBookmark,
  onSelectPlace,
  onNavigateTo,
  onPlayAudio,
  isPlayingAudio,
  userLocation
}) {
  const categoryLabels = {
    heritage: '🏛️ Heritage & Lore',
    food: '🍲 Authentic Food',
    hotel: '🏨 Stay & Hospitality',
    hidden_gem: '💎 Hidden Gem',
    attraction: '🎡 City Attraction'
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
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
      {/* Top Meta: Category, Distance & Bookmark */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
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

            {place.isLiveAi ? (
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#0284c7',
                background: '#e0f2fe',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Sparkles size={10} /> Live Online AI
              </span>
            ) : (
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#475569',
                background: '#f1f5f9',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)'
              }}>
                🏛️ Seed Dossier
              </span>
            )}
          </div>

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

        {/* Title & Rating */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-main)',
            margin: 0,
            lineHeight: 1.3
          }}>
            {place.name}
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            padding: '2px 6px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            flexShrink: 0
          }}>
            <Star size={12} fill="currentColor" />
            <span>{place.rating}</span>
          </div>
        </div>

        {/* Short Description */}
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          lineHeight: 1.45,
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {place.description}
        </p>

        {/* Metrics Row: Safety, Cleanliness, Price */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <span className="badge badge-safety">
            <Shield size={11} />
            <span>Safety: {place.safetyScore}/10</span>
          </span>
          <span className="badge badge-cleanliness">
            <Sparkles size={11} />
            <span>Clean: {place.cleanlinessScore}/10</span>
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            background: 'var(--bg-tertiary)',
            color: 'var(--text-main)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            {place.priceLevel} • {place.estimatedCost}
          </span>
        </div>

        {/* Navigation Estimated Time & Live Traffic Status */}
        {distanceKm !== undefined && (() => {
          const dist = distanceKm || 1.5;
          const driveMins = Math.max(3, Math.round(dist * 2.8 + (dist > 4 ? 4 : 1)));
          const transitMins = Math.max(5, Math.round(dist * 2.2 + 6));
          const walkMins = Math.max(8, Math.round(dist * 12.5));
          const isHeavy = dist > 5;
          const isModerate = dist > 2.5 && !isHeavy;
          const trafficStatus = isHeavy ? 'Heavy Delay (+6m)' : isModerate ? 'Moderate (+3m)' : 'Smooth Flow';
          const trafficColor = isHeavy ? '#dc2626' : isModerate ? '#d97706' : '#16a34a';

          return (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '8px 10px',
              marginBottom: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '5px',
                fontSize: '11px'
              }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  ⏱️ Est. Travel Time:
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: trafficColor,
                  background: `${trafficColor}15`,
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  🚦 {trafficStatus}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)'
              }}>
                <span>🚗 ~{driveMins}m drive</span>
                <span>🚌 ~{transitMins}m transit</span>
                <span>🚶 ~{walkMins}m walk</span>
              </div>
            </div>
          );
        })()}

        {/* Best Time To Visit */}
        {place.bestTime && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginBottom: '14px'
          }}>
            <Clock size={12} style={{ color: 'var(--accent-warning)', flexShrink: 0 }} />
            <span>Best: <strong style={{ color: 'var(--text-main)' }}>{place.bestTime}</strong></span>
          </div>
        )}
      </div>

      {/* Action Footer: Audio Story Lore, In-App Route & Google Maps Redirect */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        {/* Listen to Audio Lore */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayAudio(place);
          }}
          className="btn-secondary"
          style={{ padding: '7px 9px', fontSize: '11px', flex: '0 0 auto' }}
          title="Listen to Historical & Cultural Story"
        >
          <Volume2 size={13} style={{ color: isPlayingAudio ? 'var(--accent-success)' : 'inherit' }} />
          <span>{isPlayingAudio ? 'Stop' : 'Lore'}</span>
        </button>

        {/* In-App Route Planner */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigateTo(place);
          }}
          className="btn-secondary"
          style={{ padding: '7px 9px', fontSize: '11px', flex: '0 0 auto' }}
          title="Open Safe Route Planner on Map"
        >
          <Navigation size={13} />
          <span>Plan</span>
        </button>

        {/* Direct Google Maps Turn-by-Turn Navigation */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openGoogleMapsNavigation({
              destLat: place.lat,
              destLng: place.lng,
              destName: place.name,
              originLat: userLocation?.[0],
              originLng: userLocation?.[1]
            });
          }}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: '#1a73e8',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '7px 10px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(26, 115, 232, 0.3)',
            transition: 'all 0.15s ease'
          }}
          title="Open Turn-by-Turn Live Navigation directly on Google Maps"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>Google Maps ↗</span>
        </button>
      </div>
    </div>
  );
}
