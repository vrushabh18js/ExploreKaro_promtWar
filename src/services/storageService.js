// exploreKaro Local Storage Persistence Service
// Ensures bookmarks and citizen hazard reports persist across page refreshes

const REPORTS_KEY = 'explorekaro_citizen_reports_v1';
const WISHLIST_KEY = 'explorekaro_saved_wishlist_v1';

export function getStoredReports() {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCitizenReport(report) {
  try {
    const existing = getStoredReports();
    const updated = [report, ...existing];
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save citizen report:', e);
    return [];
  }
}

export function getStoredWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleWishlistPlace(placeId) {
  try {
    const existing = getStoredWishlist();
    let updated;
    if (existing.includes(placeId)) {
      updated = existing.filter((id) => id !== placeId);
    } else {
      updated = [...existing, placeId];
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to update wishlist:', e);
    return [];
  }
}
