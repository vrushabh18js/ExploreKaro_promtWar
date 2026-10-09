import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, MapPin, Navigation, AlertTriangle, Scale, 
  Search, Sliders, Moon, Sun, Bookmark, Sparkles, Crosshair, Loader2
} from 'lucide-react';
import { searchLocationsOnline } from '../services/apiService';

export function Header({
  activeCity,
  onSelectLocation,
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
  onToggleMap,
  isLoadingGPS = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]);
        setIsInputFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced real-time online geocoding (300ms)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setSearchError(null);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchLocationsOnline(searchQuery);
        setSuggestions(results);
        if (results.length === 0) {
          setSearchError('No matching destinations found online. Try another landmark or city.');
        }
      } catch (err) {
        setSearchError(err.message || 'Online geocoding service unavailable.');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handleSelectSuggestion = (item) => {
    onSelectLocation({
      id: item.id || `loc-${Date.now()}`,
      name: item.name,
      fullName: item.fullName,
      state: item.state || item.country || '',
      country: item.country || '',
      center: [item.lat, item.lng],
      lat: item.lat,
      lng: item.lng,
      type: item.type
    });

    setSearchQuery('');
    setSuggestions([]);
    setSearchError(null);
    setIsInputFocused(false);
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // If suggestions are currently populated, pick the top result
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
      return;
    }

    // Direct online query
    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchLocationsOnline(query);
      setIsSearching(false);
      if (results && results.length > 0) {
        handleSelectSuggestion(results[0]);
      } else {
        setSearchError(`No online results found for "${query}". Please check spelling.`);
      }
    } catch (err) {
      setIsSearching(false);
      setSearchError(err.message || 'Failed to query online places provider.');
    }
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
                Live Online OS
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Real-Time Global Exploration • Wikipedia & OSM Live Data
            </p>
          </div>
        </div>

        {/* Global Online Location Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: '1 1 360px',
          maxWidth: '560px',
          position: 'relative'
        }}>
          {/* Active Location Indicator Badge */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              maxWidth: '160px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={activeCity?.fullName || activeCity?.name || 'Active Location'}
          >
            <MapPin size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeCity?.name || 'Worldwide'}
            </span>
          </div>

          {/* Real-Time Online Geocoding Input */}
          <div ref={searchContainerRef} style={{ position: 'relative', flex: 1 }}>
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-tertiary)',
                border: isInputFocused ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '2px 6px 2px 10px',
                transition: 'border var(--transition-fast)'
              }}
            >
              <Search size={15} style={{ color: isInputFocused ? 'var(--accent-primary)' : 'var(--text-dim)', marginRight: '6px', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search any city, landmark, or street worldwide..."
                value={searchQuery}
                onFocus={() => setIsInputFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  padding: '7px 0',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />

              {/* Clear Query Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSuggestions([]); setSearchError(null); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '12px'
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}

              {/* Submit Search Button */}
              <button
                type="submit"
                disabled={isSearching}
                style={{
                  background: 'var(--accent-primary)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: isSearching ? 'wait' : 'pointer',
                  marginLeft: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
                title="Search online destination"
              >
                {isSearching ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : 'Search'}
              </button>
            </form>

            {/* Live Suggestions Dropdown */}
            {(suggestions.length > 0 || searchError || isSearching) && isInputFocused && (
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
                overflow: 'hidden',
                maxHeight: '340px',
                overflowY: 'auto'
              }}>
                {isSearching && (
                  <div style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
                    <span>Querying live global places directory...</span>
                  </div>
                )}

                {searchError && !isSearching && (
                  <div style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--accent-urgent)', background: 'rgba(239, 68, 68, 0.08)' }}>
                    ⚠️ {searchError}
                  </div>
                )}

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
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <MapPin size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.fullName}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--accent-primary)',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {item.type || 'Online'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GPS Locate Button */}
          <button
            onClick={onDetectGPS}
            disabled={isLoadingGPS}
            title="Detect My Real GPS Location (Browser Permission Required)"
            style={{
              background: userLocation ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)',
              color: userLocation ? 'var(--accent-success)' : 'var(--text-main)',
              border: `1px solid ${userLocation ? 'var(--accent-success)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isLoadingGPS ? 'wait' : 'pointer'
            }}
          >
            {isLoadingGPS ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Crosshair size={16} />
            )}
          </button>
        </div>

        {/* Radius Slider (1 - 25 km) */}
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
            max="25"
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
            title="Open Real OSRM & Google Maps Route Planner"
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            <Navigation size={15} />
            <span>Navigate</span>
          </button>

          {/* Best vs Worst Neighborhoods */}
          <button
            className="btn-secondary"
            onClick={onOpenComparison}
            title="Compare Live Destination Profiles"
            style={{ padding: '8px 12px', fontSize: '13px' }}
          >
            <Scale size={15} style={{ color: 'var(--accent-warning)' }} />
            <span>Compare</span>
          </button>

          {/* Report Urban Hazard */}
          <button
            className="btn-urgent"
            onClick={onOpenDispatch}
            title="Report Realtime Incident to Cloud DB"
            style={{ padding: '8px 12px', fontSize: '13px' }}
          >
            <AlertTriangle size={15} />
            <span>Report Chaos</span>
          </button>

          {/* AI Concierge */}
          <button
            className="btn-secondary"
            onClick={onOpenAIModal}
            title="AI Exploration Concierge"
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
