const fs = require('fs');
const content = fs.readFileSync('extracted.txt', 'utf8');

const header = `import React from 'react';
import { 
  RefreshCw, Check, Navigation, Footprints, Bike, Compass, Car, 
  ChevronLeft, ChevronRight, Sunrise, Sun, Moon, MapPin, Info, 
  Sparkles, Calendar 
} from 'lucide-react';
import LeafletMap from './map/LeafletMap';

export default function ItineraryDayViewer({
  itinerary,
  selectedSpot,
  language,
  setActivePlannerTab,
  setSelectedSpot,
  isNavigating,
  simDistance,
  simDuration,
  simActiveStreet,
  userLocation,
  transportMode,
  userHeading,
  isDarkMode,
  alternativeRoutes,
  selectedRouteIndex,
  setSelectedRouteIndex,
  mapRotationActive,
  handleStopNavigation,
  handleStartNavigation,
  t,
  optimizing,
  hasOptimized,
  activeDay,
  setActiveDay,
  setSlotPage,
  showTravelRoute,
  setShowTravelRoute,
  isSavedItinerary,
  activeItineraryId,
  activeItineraryStatus,
  handleCompleteItinerary,
  isMobileDevice,
  mobileViewMode,
  selectSpotAndScroll,
  formatPriceRange,
  handleSwapSpot,
  slotPage,
  sidebarPage,
  setSidebarPage,
  isLocating,
  isFarAway,
  userSpeed,
  activeDaySpots,
  setAlternativeRoutes,
  activeDistance,
  activeDuration,
  setTransportMode,
  currentUser,
  days,
  setTripTitle,
  setShowSaveModal,
  costs,
  budget,
  isOverBudget,
  allDbSpots,
  rentalPage,
  setRentalPage,
  style,
  setMobileViewMode
}) {
`;

let componentBody = content.replace(/^\s*const renderItineraryContent = \(\) => \{/m, '').replace(/\};\s*$/m, '');

const fullContent = header + componentBody + '\n}\n';
fs.writeFileSync('src/features/trip-planner/components/ItineraryDayViewer.jsx', fullContent);
console.log('Created ItineraryDayViewer.jsx successfully.');
