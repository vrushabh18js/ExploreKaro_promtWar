import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, MapPin, Navigation, AlertTriangle, Scale, 
  Search, Sliders, Moon, Sun, Bookmark, Sparkles, Crosshair
} from 'lucide-react';
import { SEED_CITIES } from '../data/citiesData';
import { geocodeLocation } from '../services/apiService';

export function Header({
  activeCity,
  onSelectCity,
  userLocation,
  onDetectGPS,
  radiusKm,
  onChangeRadius,
  onOpenNavigation,
  onOpenComparison,
  onOpenDispatch,
  onOpenAIModal,
  wishlistCount,
  onToggleWishlistFilter,
  showWishlistOnly,
  theme,
  onToggleTheme,
  isMapOpen,
  onToggleMap
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Debounced geocoding search for ANY location input
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await geocodeLocation(searchQuery);
      setSuggestions(results);
      setIsSearching(false);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handleSelectSuggestion = (item) => {
    onSelectCity({
      id: `custom-${Date.now()}`,
      name: item.name,
      state: item.fullName.split(',').slice(-2, -1)[0]?.trim() || 'India',
      tagline: 'Custom Explored Destination',
      center: [item.lat, item.lng],
      zoom: 14,
      isCustom: true,
      weatherSim: { temp: 28, condition: 'Partly Sunny', rainProb: 10, aqi: 90, aqiLabel: 'Moderate' },
      trafficStatus: 'Normal Flow',
      places: [],
      neighborhoodMatrix: [],
      safetyHazards: []
    });
    setSearchQuery('');
    setSuggestions([]);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 20px',
      transition: 'background var(--transition-normal)'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Brand & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Compass size={24} style={{ animation: 'spin 12s linear infinite' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                exploreKaro
              </span>
              <span style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}>
                Urban OS
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Navigate Chaos • Discover Culture • Travel Safe
            </p>
          </div>
        </div>

        {/* City Selector & Any-Location Autocomplete Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: '1 1 340px',
          maxWidth: '520px',
          position: 'relative'
        }}>
          {/* Seed City Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={activeCity.isCustom ? 'custom' : activeCity.id}
              onChange={(e) => {
                const found = SEED_CITIES.find(c => c.id === e.target.value);
                if (found) onSelectCity(found);
              }}
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '9px 12px',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {SEED_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  📍 {c.name}
                </option>
              ))}
              {activeCity.isCustom && (
                <option value="custom">📍 {activeCity.name} (Custom)</option>
              )}
            </select>
          </div>

          {/* Search Any Location Input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px'
            }}>
              <Search size={16} style={{ color: 'var(--text-dim)', marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search any town, street, or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  padding: '9px 0',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              {isSearching && (
                <span style={{ fontSize: '11px', color: 'var(--accent-primary)' }}>...</span>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                right: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1100,
                overflow: 'hidden'
              }}>
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSuggestion(item)}
                    style={{
                      padding: '10px 14px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <MapPin size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {item.fullName.length > 55 ? item.fullName.slice(0, 55) + '...' : item.fullName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GPS Locate Button */}
          <button
            onClick={onDetectGPS}
            title="Detect My Real GPS Location"
            style={{
              background: userLocation ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)',
              color: userLocation ? 'var(--accent-success)' : 'var(--text-main)',
              border: `1px solid ${userLocation ? 'var(--accent-success)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Crosshair size={16} />
          </button>
        </div>

        {/* Radius Slider (1 - 30 km) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-tertiary)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Sliders size={15} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
            Radius: <span style={{ color: 'var(--accent-primary)' }}>{radiusKm} km</span>
          </span>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={radiusKm}
            onChange={(e) => onChangeRadius(parseInt(e.target.value, 10))}
            style={{
              width: '80px',
              cursor: 'pointer',
              accentColor: 'var(--accent-primary)'
            }}
          />
        </div>

        {/* Action Controls & Modal Launchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Open / Close Map on User Demand */}
          <button
            onClick={onToggleMap}
            title={isMapOpen ? "Close Interactive Map View" : "Open Interactive Map View"}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: isMapOpen ? '1px solid #ef4444' : '1px solid #10b981',
              background: isMapOpen ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isMapOpen ? '#ef4444' : '#10b981',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <MapPin size={15} />
            <span>{isMapOpen ? '✕ Close Map' : '🗺️ Open Map'}</span>
          </button>

          {/* Smart Route Planner */}
          <button
            className="btn-primary"
            onClick={onOpenNavigation}
            title="Open Safe & Multi-Modal Route Planner"
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            <Navigation size={15} />
            <span>Navigate</span>
          </button>

          {/* Best vs Worst Neighborhoods */}
          <button
            className="btn-secondary"
            onClick={onOpenComparison}
            title="Compare Best vs Worst Neighborhoods"
            style={{ padding: '8px 12px', fontSize: '13px' }}
          >
            <Scale size={15} style={{ color: 'var(--accent-warning)' }} />
            <span>Best vs Worst</span>
          </button>

          {/* Report Urban Hazard */}
          <button
            className="btn-urgent"
            onClick={onOpenDispatch}
            title="Report Accident, Waterlogging or Dark Street"
            style={{ padding: '8px 12px', fontSize: '13px' }}
          >
            <AlertTriangle size={15} />
            <span>Report Chaos</span>
          </button>

          {/* AI Concierge */}
          <button
            className="btn-secondary"
            onClick={onOpenAIModal}
            title="AI Smart Search & Query"
            style={{ padding: '8px 12px', fontSize: '13px' }}
          >
            <Sparkles size={15} style={{ color: 'var(--accent-purple)' }} />
            <span>AI Concierge</span>
          </button>

          {/* Wishlist Toggle */}
          <button
            onClick={onToggleWishlistFilter}
            title="Show Saved Favorites"
            style={{
              background: showWishlistOnly ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-tertiary)',
              color: showWishlistOnly ? 'var(--accent-secondary)' : 'var(--text-main)',
              border: `1px solid ${showWishlistOnly ? 'var(--accent-secondary)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Bookmark size={15} />
            <span>{wishlistCount}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title="Toggle Light / Dark Mode"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {theme === 'dark' ? <Sun size={15} style={{ color: '#fbbf24' }} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
