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

export function App() {
  // Theme state
  const [theme, setTheme] = useState('dark');

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

  // Wishlist
  const [wishlist, setWishlist] = useState([]);

  // Audio Speech Synthesis state
  const [playingAudioPlaceId, setPlayingAudioPlaceId] = useState(null);

  // Initialize from LocalStorage
  useEffect(() => {
    setUserReports(getStoredReports());
    setWishlist(getStoredWishlist());
  }, []);

  // Update Theme attribute on HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle City Change & Weather fetch
  useEffect(() => {
    setAnchorCoords(activeCity.center);
    setActiveRoutePolyline(null);

    // Fetch live weather from Open-Meteo
    fetchLiveWeather(activeCity.center[0], activeCity.center[1]).then((res) => {
      setWeather(res);
    });

    // If it's a custom location, generate dynamic POIs
    if (activeCity.isCustom) {
      const generated = generateDynamicPOIs(activeCity.center[0], activeCity.center[1], activeCity.name);
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

  // Filter Places by Distance / Radius, Category, Safety, Budget, Wishlist
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
  }, [allCurrentPlaces, anchorCoords, radiusKm, activeCategory, safetyFilter, budgetFilter, showWishlistOnly, wishlist, sortBy]);

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

  // Citizen Report Submission Handler
  const handleCitizenReportSubmit = (newReport) => {
    const updated = saveCitizenReport(newReport);
    setUserReports(updated);
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

  // Trigger Navigation to Place
  const handleNavigateTo = (destPlace) => {
    const origin = allCurrentPlaces.find(p => p.id !== destPlace.id) || destPlace;
    setNavOriginPlace(origin);
    setNavDestPlace(destPlace);
    setIsNavModalOpen(true);
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
          setNavOriginPlace(allCurrentPlaces[0] || null);
          setNavDestPlace(allCurrentPlaces[1] || allCurrentPlaces[0] || null);
          setIsNavModalOpen(true);
        }}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenDispatch={() => setIsDispatchOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        wishlistCount={wishlist.length}
        onToggleWishlistFilter={() => setShowWishlistOnly(!showWishlistOnly)}
        showWishlistOnly={showWishlistOnly}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
        counts={categoryCounts}
      />

      {/* 4. Main Two-Column Viewport (Map & Explorer Cards) */}
      <main className="main-viewport-grid">
        {/* Left: Interactive Leaflet Map */}
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
            onMapClick={(latlng) => {
              // Click anywhere to relocate exploration anchor
              setAnchorCoords([latlng.lat, latlng.lng]);
            }}
          />
        </section>

        {/* Right: Scrollable Place Discovery Feed */}
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
            {filteredPlaces.length > 0 && (
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                Sorted by {sortBy}
              </span>
            )}
          </div>

          {/* Place Cards Grid */}
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
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Try expanding the exploration radius slider on the top bar or reset active filters.
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
        </section>
      </main>

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
