import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { ChaosBanner } from './components/ChaosBanner';
import { MapViewer } from './components/MapViewer';
import { CategoryFilters } from './components/CategoryFilters';
import { PlaceCard } from './components/PlaceCard';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { RoutePlannerModal } from './components/RoutePlannerModal';
import { BestVsWorstModal } from './components/BestVsWorstModal';
import { CitizenDispatchModal } from './components/CitizenDispatchModal';
import { SmartVoiceAssistant } from './components/SmartVoiceAssistant';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

import { 
  calculateDistanceKm, 
  fetchNearbyPlacesOnline, 
  fetchLiveWeather, 
  reverseGeocodeOnline 
} from './services/apiService';
import { getStoredReports, saveCitizenReport, getStoredWishlist, toggleWishlistPlace } from './services/storageService';
import { listenToLiveCitizenReports, pushLiveCitizenReport, trackAnalyticsEvent } from './services/firebaseService';

export function App() {
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Active Location Anchor (Starts as global prompt, auto-detects GPS or initial destination)
  const [activeLocation, setActiveLocation] = useState({
    id: 'initial-loc',
    name: 'Mumbai',
    fullName: 'Mumbai, Maharashtra, India',
    center: [18.9220, 72.8347],
    lat: 18.9220,
    lng: 72.8347
  });

  const [radiusKm, setRadiusKm] = useState(12);

  // Weather & Live status from Open-Meteo
  const [weather, setWeather] = useState({
    temp: 28,
    condition: 'Partly Sunny',
    rainProb: 15,
    aqi: 80,
    aqiLabel: 'Live'
  });

  // Real Online Places list, Loading & Error states
  const [onlinePlaces, setOnlinePlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState(null);

  // Citizen Hazards from Firebase Realtime Cloud
  const [userReports, setUserReports] = useState([]);
  const [userGpsCoords, setUserGpsCoords] = useState(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  // Filters & Sorting
  const [activeCategory, setActiveCategory] = useState('all');
  const [safetyFilter, setSafetyFilter] = useState(false);
  const [budgetFilter, setBudgetFilter] = useState(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [keywordFilter, setKeywordFilter] = useState('');

  // Modals state
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [navOriginPlace, setNavOriginPlace] = useState(null);
  const [navDestPlace, setNavDestPlace] = useState(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Active Route drawn on map
  const [activeRoutePolyline, setActiveRoutePolyline] = useState(null);

  // Map on-demand visibility (defaults to false per user requirement)
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Wishlist
  const [wishlist, setWishlist] = useState([]);

  // Audio Speech Synthesis state
  const [playingAudioPlaceId, setPlayingAudioPlaceId] = useState(null);

  // Initialize LocalStorage and Realtime Firebase Cloud Listener
  useEffect(() => {
    setUserReports(getStoredReports());
    setWishlist(getStoredWishlist());

    const unsubscribe = listenToLiveCitizenReports((cloudReports) => {
      if (cloudReports && cloudReports.length > 0) {
        setUserReports((prev) => {
          const map = new Map();
          cloudReports.forEach((r) => map.set(r.id || r.firebaseId, r));
          prev.forEach((r) => {
            const key = r.id || r.firebaseId;
            if (!map.has(key)) map.set(key, r);
          });
          return Array.from(map.values());
        });
      }
    });

    trackAnalyticsEvent('app_session_started');
    return () => unsubscribe && unsubscribe();
  }, []);

  // Update Theme attribute on HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch Real Online Places & Weather whenever activeLocation or radiusKm changes
  const loadRealTimeData = useCallback(async (lat, lng, radius) => {
    setIsLoadingPlaces(true);
    setPlacesError(null);
    setActiveRoutePolyline(null);

    // 1. Fetch real online weather from Open-Meteo
    fetchLiveWeather(lat, lng).then((w) => setWeather(w)).catch(() => {});

    // 2. Fetch real online places from Wikipedia & Wikimedia Commons
    try {
      const places = await fetchNearbyPlacesOnline(lat, lng, radius, 'all');
      setOnlinePlaces(places);
      if (places.length === 0) {
        setPlacesError(`No geo-tagged tourist places found within ${radius} km radius on online registers. Try increasing the search radius.`);
      }
    } catch (err) {
      setPlacesError(err.message || 'Unable to connect to online places directory.');
      setOnlinePlaces([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, []);

  // Initial load or on activeLocation change
  useEffect(() => {
    if (activeLocation?.lat && activeLocation?.lng) {
      loadRealTimeData(activeLocation.lat, activeLocation.lng, radiusKm);
    }
  }, [activeLocation, radiusKm, loadRealTimeData]);

  // Filter Places by Category, Safety, Budget, Wishlist & Keyword
  const filteredPlaces = useMemo(() => {
    return onlinePlaces.filter((place) => {
      // Category check
      if (activeCategory !== 'all' && place.category !== activeCategory) return false;

      // Safety check (Score >= 8.5)
      if (safetyFilter && (place.safetyScore || 9) < 8.5) return false;

      // Budget check
      if (budgetFilter && place.priceLevel !== '₹' && place.priceLevel !== '₹₹') return false;

      // Wishlist check
      if (showWishlistOnly && !wishlist.includes(place.id)) return false;

      // Keyword filter check
      if (keywordFilter && keywordFilter.trim()) {
        const kw = keywordFilter.toLowerCase().trim();
        const matchName = place.name.toLowerCase().includes(kw);
        const matchDesc = (place.description || '').toLowerCase().includes(kw);
        const matchLore = (place.historicalLore || '').toLowerCase().includes(kw);
        const matchTags = (place.tags || []).some(t => t.toLowerCase().includes(kw));
        if (!matchName && !matchDesc && !matchLore && !matchTags) return false;
      }

      return true;
    }).sort((a, b) => {
      const distA = a.distanceKm || calculateDistanceKm(activeLocation.lat, activeLocation.lng, a.lat, a.lng);
      const distB = b.distanceKm || calculateDistanceKm(activeLocation.lat, activeLocation.lng, b.lat, b.lng);

      if (sortBy === 'distance') return distA - distB;
      if (sortBy === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === 'safety') return Number(b.safetyScore || 0) - Number(a.safetyScore || 0);
      return 0;
    });
  }, [onlinePlaces, activeLocation, activeCategory, safetyFilter, budgetFilter, showWishlistOnly, wishlist, keywordFilter, sortBy]);

  // Category counts from real live places
  const categoryCounts = useMemo(() => {
    const counts = { all: onlinePlaces.length, heritage: 0, food: 0, hidden_gem: 0, hotel: 0 };
    onlinePlaces.forEach((p) => {
      if (counts[p.category] !== undefined) counts[p.category]++;
    });
    return counts;
  }, [onlinePlaces]);

  // Wishlist Handler
  const handleToggleWishlist = (placeId) => {
    const updated = toggleWishlistPlace(placeId);
    setWishlist(updated);
  };

  // Citizen Report Submission Handler
  const handleCitizenReportSubmit = (newReport) => {
    saveCitizenReport(newReport);
    pushLiveCitizenReport(newReport);
    setUserReports((prev) => [newReport, ...prev]);
  };

  // GPS Location Detection via Browser Geolocation API
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserGpsCoords([lat, lng]);

        try {
          const locationName = await reverseGeocodeOnline(lat, lng);
          setActiveLocation({
            id: `gps-${Date.now()}`,
            name: locationName.split(',')[0],
            fullName: locationName,
            center: [lat, lng],
            lat,
            lng
          });
        } catch {
          setActiveLocation({
            id: `gps-${Date.now()}`,
            name: 'My GPS Location',
            fullName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            center: [lat, lng],
            lat,
            lng
          });
        } finally {
          setIsLoadingGPS(false);
        }
      },
      (err) => {
        setIsLoadingGPS(false);
        alert('Could not retrieve GPS location: ' + err.message + '. Please ensure location permission is allowed.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Audio Guide Web Speech API
  const handleToggleAudio = (place) => {
    if (!('speechSynthesis' in window)) {
      alert('Audio speech narration is not supported in this browser.');
      return;
    }

    if (playingAudioPlaceId === place.id) {
      window.speechSynthesis.cancel();
      setPlayingAudioPlaceId(null);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = place.audioStory || place.historicalLore || place.description;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setPlayingAudioPlaceId(null);
      utterance.onerror = () => setPlayingAudioPlaceId(null);
      window.speechSynthesis.speak(utterance);
      setPlayingAudioPlaceId(place.id);
    }
  };

  // Trigger Navigation to Place
  const handleNavigateTo = (destPlace) => {
    const origin = onlinePlaces.find(p => p.id !== destPlace.id) || destPlace;
    setNavOriginPlace(origin);
    setNavDestPlace(destPlace);
    setIsNavModalOpen(true);
    setIsMapOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header Navigation Bar (Global Online Geocoding Search) */}
      <Header
        activeCity={activeLocation}
        onSelectLocation={(loc) => {
          setActiveLocation(loc);
          setKeywordFilter('');
        }}
        userLocation={userGpsCoords}
        onDetectGPS={handleDetectGPS}
        isLoadingGPS={isLoadingGPS}
        radiusKm={radiusKm}
        onChangeRadius={setRadiusKm}
        onOpenNavigation={() => {
          setNavOriginPlace(onlinePlaces[0] || null);
          setNavDestPlace(onlinePlaces[1] || onlinePlaces[0] || null);
          setIsNavModalOpen(true);
          setIsMapOpen(true);
        }}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenDispatch={() => setIsDispatchOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        wishlistCount={wishlist.length}
        onToggleWishlistFilter={() => setShowWishlistOnly(!showWishlistOnly)}
        showWishlistOnly={showWishlistOnly}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        isMapOpen={isMapOpen}
        onToggleMap={() => setIsMapOpen(!isMapOpen)}
      />

      {/* 2. Realtime Meteorological & Incident Banner */}
      <ChaosBanner
        city={activeLocation}
        weather={weather}
        hazardCount={userReports.length}
      />

      {/* 3. Category Filter & Sorting Bar */}
      <CategoryFilters
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        safetyFilter={safetyFilter}
        onToggleSafetyFilter={() => setSafetyFilter(!safetyFilter)}
        budgetFilter={budgetFilter}
        onToggleBudgetFilter={() => setBudgetFilter(!budgetFilter)}
        sortBy={sortBy}
        onChangeSortBy={setSortBy}
        keywordFilter={keywordFilter}
        onChangeKeywordFilter={setKeywordFilter}
        counts={categoryCounts}
      />

      {/* Online Error / Notice Banner */}
      {placesError && !isLoadingPlaces && (
        <div style={{
          maxWidth: '1440px',
          margin: '16px auto 0 auto',
          padding: '12px 20px',
          width: 'calc(100% - 40px)',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{placesError}</span>
          </div>
          <button
            className="btn-secondary"
            onClick={() => loadRealTimeData(activeLocation.lat, activeLocation.lng, radiusKm)}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={12} />
            <span>Retry Query</span>
          </button>
        </div>
      )}

      {/* 4. Main Viewport: On-Demand Map OR Full-Width Discovery Feed */}
      {isMapOpen ? (
        <main className="main-viewport-grid">
          {/* Left: Interactive Leaflet Map (On-Demand) */}
          <section className="main-viewport-map-col" style={{ height: '100%', position: 'relative' }}>
            <MapViewer
              center={[activeLocation.lat, activeLocation.lng]}
              radiusKm={radiusKm}
              places={filteredPlaces}
              hazards={userReports}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              onNavigateTo={handleNavigateTo}
              activeRoutePolyline={activeRoutePolyline}
              onClose={() => setIsMapOpen(false)}
              onMapClick={(latlng) => {
                setActiveLocation({
                  id: `map-${Date.now()}`,
                  name: `Selected Coordinates`,
                  fullName: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
                  center: [latlng.lat, latlng.lng],
                  lat: latlng.lat,
                  lng: latlng.lng
                });
              }}
            />
          </section>

          {/* Right: Scrollable Place Discovery Feed in Map Split Mode */}
          <section className="main-viewport-feed-col" style={{
            height: '100%',
            overflowY: 'auto',
            padding: '20px',
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {showWishlistOnly ? 'Saved Favorites' : 'Live Verified Destinations'}
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {isLoadingPlaces ? 'Querying online servers...' : `Found ${filteredPlaces.length} real places within ${radiusKm} km`}
                </span>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setIsMapOpen(false)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                ✕ Close Map View
              </button>
            </div>

            {/* Loading Indicator */}
            {isLoadingPlaces ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)', margin: '0 auto 10px auto' }} />
                <p style={{ fontSize: '13px', margin: 0 }}>Querying Wikipedia & Wikimedia Commons real-time places directory...</p>
              </div>
            ) : filteredPlaces.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                {filteredPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    distanceKm={place.distanceKm}
                    isBookmarked={wishlist.includes(place.id)}
                    onToggleBookmark={handleToggleWishlist}
                    onSelectPlace={setSelectedPlace}
                    onNavigateTo={handleNavigateTo}
                    onPlayAudio={handleToggleAudio}
                    isPlayingAudio={playingAudioPlaceId === place.id}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                padding: '50px 20px',
                textAlign: 'center',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-subtle)'
              }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  No verified places found within {radiusKm} km
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setRadiusKm(25)}
                >
                  Expand Radius to 25 km
                </button>
              </div>
            )}
          </section>
        </main>
      ) : (
        /* Default: Clean Full-Width Explorers Feed (Map Closed) */
        <main style={{
          flex: 1,
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          padding: '24px 20px 80px 20px'
        }}>
          {/* Map Invitation Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(16, 185, 129, 0.12))',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 24px',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🗺️</span>
                <strong style={{ fontSize: '16px', color: 'var(--text-main)' }}>
                  Interactive Live Map Available On Demand
                </strong>
                <span style={{
                  fontSize: '10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  fontWeight: 700
                }}>
                  Zero API Key Required
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Explore live pins plotted from real GPS coordinates with community incident heatmaps.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => setIsMapOpen(true)}
              style={{ padding: '10px 20px', fontSize: '14px', borderRadius: 'var(--radius-md)' }}
            >
              <span>🗺️ Open Interactive Map View</span>
            </button>
          </div>

          {/* Feed Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {showWishlistOnly ? 'Saved Favorites' : `Real-Time Exploration: ${activeLocation.name}`}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {isLoadingPlaces ? 'Streaming live places...' : `Showing ${filteredPlaces.length} verified destinations within ${radiusKm} km radius`}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn-secondary"
                onClick={() => setIsMapOpen(true)}
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <span>🗺️ View on Map</span>
              </button>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)'
              }}>
                Sorted by {sortBy}
              </span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoadingPlaces ? (
            <div style={{
              padding: '80px 20px',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)', margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                Querying Live Online Places Directory
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Retrieving real Wikipedia geo-articles, Wikimedia photography, and verified historical lore...
              </p>
            </div>
          ) : filteredPlaces.length > 0 ? (
            /* Full-Width Place Cards Grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '18px'
            }}>
              {filteredPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  distanceKm={place.distanceKm}
                  isBookmarked={wishlist.includes(place.id)}
                  onToggleBookmark={handleToggleWishlist}
                  onSelectPlace={setSelectedPlace}
                  onNavigateTo={handleNavigateTo}
                  onPlayAudio={handleToggleAudio}
                  isPlayingAudio={playingAudioPlaceId === place.id}
                />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '80px 20px',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-subtle)',
              marginTop: '20px'
            }}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                No online places found matching your filters within {radiusKm} km
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Expand your radius or search another city, landmark, or region worldwide.
              </p>
              <button
                className="btn-primary"
                onClick={() => {
                  setRadiusKm(25);
                  setActiveCategory('all');
                  setSafetyFilter(false);
                  setBudgetFilter(false);
                  setShowWishlistOnly(false);
                }}
              >
                Expand Radius to 25 km
              </button>
            </div>
          )}
        </main>
      )}

      {/* Floating Bottom Map Action Button (When Map is Closed) */}
      {!isMapOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 900
        }}>
          <button
            onClick={() => setIsMapOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              color: '#38bdf8',
              border: '2px solid #38bdf8',
              borderRadius: '9999px',
              padding: '12px 26px',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>🗺️ View on Interactive Map</span>
          </button>
        </div>
      )}

      {/* 5. Modals & Overlays */}
      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onNavigateTo={handleNavigateTo}
          isPlayingAudio={playingAudioPlaceId === selectedPlace.id}
          onToggleAudio={handleToggleAudio}
          isBookmarked={wishlist.includes(selectedPlace.id)}
          onToggleBookmark={handleToggleWishlist}
        />
      )}

      {isNavModalOpen && (
        <RoutePlannerModal
          originPlace={navOriginPlace}
          destinationPlace={navDestPlace}
          allPlaces={onlinePlaces}
          userCoords={userGpsCoords}
          onClose={() => setIsNavModalOpen(false)}
          onApplyRoute={(route) => setActiveRoutePolyline(route)}
        />
      )}

      {isComparisonOpen && (
        <BestVsWorstModal
          places={onlinePlaces}
          activeCity={activeLocation}
          onClose={() => setIsComparisonOpen(false)}
        />
      )}

      {isDispatchOpen && (
        <CitizenDispatchModal
          currentLocation={[activeLocation.lat, activeLocation.lng]}
          cityName={activeLocation.name}
          onClose={() => setIsDispatchOpen(false)}
          onSubmitReport={handleCitizenReportSubmit}
        />
      )}

      {isAIModalOpen && (
        <SmartVoiceAssistant
          allPlaces={onlinePlaces}
          cityName={activeLocation.name}
          onClose={() => setIsAIModalOpen(false)}
          onApplyAIRecommendation={(place) => {
            setSelectedPlace(place);
            setActiveLocation({
              id: place.id,
              name: place.name,
              fullName: place.name,
              center: [place.lat, place.lng],
              lat: place.lat,
              lng: place.lng
            });
          }}
        />
      )}
    </div>
  );
}

export default App;
