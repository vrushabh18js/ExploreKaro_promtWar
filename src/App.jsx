import React, { useState, useEffect, useMemo } from 'react';
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

import { SEED_CITIES, calculateDistanceKm } from './data/citiesData';
import { fetchLiveWeather, generateDynamicPOIs, reverseGeocode } from './services/apiService';
import { getStoredReports, saveCitizenReport, getStoredWishlist, toggleWishlistPlace } from './services/storageService';
import { listenToLiveCitizenReports, pushLiveCitizenReport, trackAnalyticsEvent } from './services/firebaseService';

export function App() {
  // Active City & Location Anchor
  const [activeCity, setActiveCity] = useState(SEED_CITIES[0]);
  const [anchorCoords, setAnchorCoords] = useState(SEED_CITIES[0].center);
  const [radiusKm, setRadiusKm] = useState(12);

  // Weather & Live status
  const [weather, setWeather] = useState(SEED_CITIES[0].weatherSim);

  // Places and Citizen Hazards
  const [customPlaces, setCustomPlaces] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [userGpsCoords, setUserGpsCoords] = useState(null);

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

  // Initialize from LocalStorage, Realtime Firebase, and Proactively Detect GPS Location
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    setUserReports(getStoredReports());
    setWishlist(getStoredWishlist());

    // Proactively detect user's current GPS location so navigation knows user position first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserGpsCoords([lat, lng]);
          console.log('[exploreKaro GPS] Current location detected on app start:', lat, lng);
        },
        (err) => {
          console.log('[exploreKaro GPS] Initial location status:', err.message);
        },
        { timeout: 7000, maximumAge: 60000 }
      );
    }

    // Connect Realtime Firebase Cloud Listener for Live Community Hazard Alerts
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

  // Handle City Change & Weather fetch
  useEffect(() => {
    setAnchorCoords(activeCity.center);
    setActiveRoutePolyline(null);
    setKeywordFilter(''); // Reset search filter on city change

    // Fetch live weather from Open-Meteo
    fetchLiveWeather(activeCity.center[0], activeCity.center[1]).then((res) => {
      setWeather(res);
    });

    // If it's a custom location, generate dynamic POIs
    if (activeCity.isCustom) {
      const generated = generateDynamicPOIs(
        activeCity.center[0], 
        activeCity.center[1], 
        activeCity.name, 
        activeCity.state
      );
      setCustomPlaces(generated);
    } else {
      setCustomPlaces([]);
    }
  }, [activeCity]);

  // Aggregate All Places for Active City / Custom Location
  const allCurrentPlaces = useMemo(() => {
    const list = activeCity.isCustom ? customPlaces : (activeCity.places || []);
    return list;
  }, [activeCity, customPlaces]);

  // Aggregate Hazards (Seed hazards + Stored user reports for this area)
  const allHazards = useMemo(() => {
    const seed = activeCity.safetyHazards || [];
    return [...userReports, ...seed];
  }, [activeCity, userReports]);

  // Filter Places by Distance / Radius, Category, Safety, Budget, Wishlist & Keyword
  const filteredPlaces = useMemo(() => {
    return allCurrentPlaces.filter((place) => {
      // Radius distance check
      const dist = calculateDistanceKm(anchorCoords[0], anchorCoords[1], place.lat, place.lng);
      if (dist > radiusKm) return false;

      // Category check
      if (activeCategory !== 'all' && place.category !== activeCategory) return false;

      // Safety check (Score >= 8.5)
      if (safetyFilter && place.safetyScore < 8.5) return false;

      // Budget check (₹ or ₹₹)
      if (budgetFilter && place.priceLevel !== '₹' && place.priceLevel !== '₹₹') return false;

      // Wishlist check
      if (showWishlistOnly && !wishlist.includes(place.id)) return false;

      // Keyword filter check (matches title, tags, lore, or cuisine)
      if (keywordFilter && keywordFilter.trim()) {
        const kw = keywordFilter.toLowerCase().trim();
        const matchName = place.name.toLowerCase().includes(kw);
        const matchDesc = (place.description || '').toLowerCase().includes(kw);
        const matchLore = (place.historicalLore || '').toLowerCase().includes(kw);
        const matchTags = (place.tags || []).some(t => t.toLowerCase().includes(kw));
        const matchCat = (place.category || '').toLowerCase().includes(kw);
        if (!matchName && !matchDesc && !matchLore && !matchTags && !matchCat) return false;
      }

      return true;
    }).sort((a, b) => {
      const distA = calculateDistanceKm(anchorCoords[0], anchorCoords[1], a.lat, a.lng);
      const distB = calculateDistanceKm(anchorCoords[0], anchorCoords[1], b.lat, b.lng);

      if (sortBy === 'distance') return distA - distB;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'safety') return b.safetyScore - a.safetyScore;
      if (sortBy === 'cleanliness') return b.cleanlinessScore - a.cleanlinessScore;
      if (sortBy === 'affordability') return a.priceLevel.length - b.priceLevel.length;
      return 0;
    });
  }, [allCurrentPlaces, anchorCoords, radiusKm, activeCategory, safetyFilter, budgetFilter, showWishlistOnly, wishlist, keywordFilter, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: 0, heritage: 0, food: 0, hidden_gem: 0, hotel: 0 };
    allCurrentPlaces.forEach((p) => {
      const dist = calculateDistanceKm(anchorCoords[0], anchorCoords[1], p.lat, p.lng);
      if (dist <= radiusKm) {
        counts.all++;
        if (counts[p.category] !== undefined) counts[p.category]++;
      }
    });
    return counts;
  }, [allCurrentPlaces, anchorCoords, radiusKm]);

  // Wishlist Handler
  const handleToggleWishlist = (placeId) => {
    const updated = toggleWishlistPlace(placeId);
    setWishlist(updated);
  };

  // Citizen Report Submission Handler (Syncs to LocalStorage & Firebase Realtime Cloud)
  const handleCitizenReportSubmit = (newReport) => {
    saveCitizenReport(newReport);
    pushLiveCitizenReport(newReport);
    setUserReports((prev) => [newReport, ...prev]);
  };

  // GPS Location Detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserGpsCoords([lat, lng]);
        setAnchorCoords([lat, lng]);

        const locationName = await reverseGeocode(lat, lng);
        setActiveCity({
          id: `gps-loc-${Date.now()}`,
          name: locationName.split(',')[0],
          state: 'My Current GPS Location',
          tagline: 'Precision Live Exploration Anchor',
          center: [lat, lng],
          zoom: 14,
          isCustom: true,
          weatherSim: { temp: 29, condition: 'Clear', rainProb: 10, aqi: 85, aqiLabel: 'Good' },
          trafficStatus: 'Local Traffic Flow',
          places: [],
          neighborhoodMatrix: [],
          safetyHazards: []
        });
      },
      (err) => {
        alert('Could not retrieve GPS location: ' + err.message);
      },
      { timeout: 8000 }
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

  // Trigger Navigation to Place (Prioritizes user's current GPS location first)
  const handleNavigateTo = (destPlace) => {
    // Proactively acquire GPS if not yet available
    if (!userGpsCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserGpsCoords([lat, lng]);
          setNavOriginPlace({
            id: 'current_gps',
            name: 'My Current Location (GPS Live)',
            lat,
            lng
          });
        },
        () => {},
        { timeout: 5000 }
      );
    }

    const origin = userGpsCoords
      ? { id: 'current_gps', name: 'My Current Location (GPS Live)', lat: userGpsCoords[0], lng: userGpsCoords[1] }
      : { id: 'current_gps', name: 'My Current Location', lat: anchorCoords[0], lng: anchorCoords[1] };

    setNavOriginPlace(origin);
    setNavDestPlace(destPlace);
    setIsNavModalOpen(true);
    setIsMapOpen(true); // Open map when navigating
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header Navigation Bar */}
      <Header
        activeCity={activeCity}
        onSelectCity={setActiveCity}
        userLocation={userGpsCoords}
        onDetectGPS={handleDetectGPS}
        radiusKm={radiusKm}
        onChangeRadius={setRadiusKm}
        onOpenNavigation={() => {
          if (!userGpsCoords && navigator.geolocation) {
            handleDetectGPS();
          }
          const origin = userGpsCoords
            ? { id: 'current_gps', name: 'My Current Location (GPS Live)', lat: userGpsCoords[0], lng: userGpsCoords[1] }
            : { id: 'current_gps', name: 'My Current Location', lat: anchorCoords[0], lng: anchorCoords[1] };
          setNavOriginPlace(origin);
          setNavDestPlace(allCurrentPlaces[0] || null);
          setIsNavModalOpen(true);
          setIsMapOpen(true);
        }}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenDispatch={() => setIsDispatchOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        wishlistCount={wishlist.length}
        onToggleWishlistFilter={() => setShowWishlistOnly(!showWishlistOnly)}
        showWishlistOnly={showWishlistOnly}
        isMapOpen={isMapOpen}
        onToggleMap={() => setIsMapOpen(!isMapOpen)}
      />

      {/* 2. Realtime Urban Chaos Barometer */}
      <ChaosBanner
        city={activeCity}
        weather={weather}
        hazardCount={allHazards.length}
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

      {/* 4. Main Viewport: On-Demand Map OR Full-Width Discovery Feed */}
      {isMapOpen ? (
        <main className="main-viewport-grid">
          {/* Left: Interactive Leaflet Map (On-Demand) */}
          <section className="main-viewport-map-col" style={{ height: '100%', position: 'relative' }}>
            <MapViewer
              center={anchorCoords}
              radiusKm={radiusKm}
              places={filteredPlaces}
              hazards={allHazards}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              onNavigateTo={handleNavigateTo}
              activeRoutePolyline={activeRoutePolyline}
              onClose={() => setIsMapOpen(false)}
              onMapClick={(latlng) => {
                setAnchorCoords([latlng.lat, latlng.lng]);
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
            {/* Feed Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {showWishlistOnly ? 'Saved Favorites' : 'Places Within Reach'}
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Showing {filteredPlaces.length} locations within {radiusKm} km radius
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

            {/* Place Cards Column */}
            {filteredPlaces.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                {filteredPlaces.map((place) => {
                  const dist = calculateDistanceKm(anchorCoords[0], anchorCoords[1], place.lat, place.lng);
                  return (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      distanceKm={dist}
                      isBookmarked={wishlist.includes(place.id)}
                      onToggleBookmark={handleToggleWishlist}
                      onSelectPlace={setSelectedPlace}
                      onNavigateTo={handleNavigateTo}
                      onPlayAudio={handleToggleAudio}
                      isPlayingAudio={playingAudioPlaceId === place.id}
                    />
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-subtle)',
                marginTop: '20px'
              }}>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  No places found within {radiusKm} km
                </p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setRadiusKm(25);
                    setActiveCategory('all');
                    setSafetyFilter(false);
                    setBudgetFilter(false);
                  }}
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
                  Interactive Map Available On Demand
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
                Open the live map whenever you want to inspect safety caution heatzones, traffic bottlenecks, and dual-route paths.
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {showWishlistOnly ? 'Saved Favorites' : `Explore ${activeCity.name}`}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Showing {filteredPlaces.length} curated destinations within {radiusKm} km radius
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

          {/* Full-Width Place Cards Grid: 2-3 responsive columns */}
          {filteredPlaces.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '18px'
            }}>
              {filteredPlaces.map((place) => {
                const dist = calculateDistanceKm(anchorCoords[0], anchorCoords[1], place.lat, place.lng);
                return (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    distanceKm={dist}
                    isBookmarked={wishlist.includes(place.id)}
                    onToggleBookmark={handleToggleWishlist}
                    onSelectPlace={setSelectedPlace}
                    onNavigateTo={handleNavigateTo}
                    onPlayAudio={handleToggleAudio}
                    isPlayingAudio={playingAudioPlaceId === place.id}
                  />
                );
              })}
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
                No places found matching your active filters within {radiusKm} km
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Try adjusting the radius slider or resetting category filters.
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
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#ffffff',
              border: '2px solid #ffffff',
              borderRadius: '9999px',
              padding: '12px 26px',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35), 0 2px 6px rgba(0, 0, 0, 0.08)',
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
          allPlaces={allCurrentPlaces}
          hazards={allHazards}
          userLocation={userGpsCoords}
          onDetectGPS={handleDetectGPS}
          onClose={() => setIsNavModalOpen(false)}
          onApplyRoute={(route) => setActiveRoutePolyline(route)}
        />
      )}

      {isComparisonOpen && (
        <BestVsWorstModal
          activeCity={activeCity}
          onClose={() => setIsComparisonOpen(false)}
        />
      )}

      {isDispatchOpen && (
        <CitizenDispatchModal
          currentLocation={anchorCoords}
          cityName={activeCity.name}
          onClose={() => setIsDispatchOpen(false)}
          onSubmitReport={handleCitizenReportSubmit}
        />
      )}

      {isAIModalOpen && (
        <SmartVoiceAssistant
          allPlaces={allCurrentPlaces}
          cityName={activeCity.name}
          onClose={() => setIsAIModalOpen(false)}
          onApplyAIRecommendation={(place) => {
            setSelectedPlace(place);
            setAnchorCoords([place.lat, place.lng]);
          }}
        />
      )}
    </div>
  );
}

export default App;
