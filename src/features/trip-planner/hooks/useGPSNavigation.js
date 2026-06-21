import { useState, useEffect, useRef } from 'react';
import { getDistanceKm, calculateHeading } from '../utils/geoUtils';

export const useGPSNavigation = (language) => {
  const [userLocation, setUserLocation] = useState({ lat: 15.8801, lng: 108.3271 }); // Default Hoi An Center
  const [userSpeed, setUserSpeed] = useState(0);
  const [userHeading, setUserHeading] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isFarAway, setIsFarAway] = useState(false);
  
  const lastLocationRef = useRef(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLoc = { lat: latitude, lng: longitude };
          setUserLocation(currentLoc);
          lastLocationRef.current = currentLoc;
          setIsLocating(false);

          // Check if far away from Hoi An (e.g. > 100km)
          const distToHoiAn = getDistanceKm(latitude, longitude, 15.8801, 108.3271);
          if (distToHoiAn > 100) {
            setIsFarAway(true);
          }
        },
        (error) => {
          console.warn("Error getting initial location:", error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const updatePosition = (position) => {
    const { latitude, longitude, speed, heading } = position.coords;
    const currentLoc = { lat: latitude, lng: longitude };

    if (lastLocationRef.current) {
      // Calculate manual heading if hardware heading is not available
      if (heading === null || heading === undefined) {
        const dist = getDistanceKm(
          lastLocationRef.current.lat,
          lastLocationRef.current.lng,
          latitude,
          longitude
        );
        if (dist > 0.002) { // Only update heading if moved > 2m
          const newHeading = calculateHeading(
            lastLocationRef.current.lat,
            lastLocationRef.current.lng,
            latitude,
            longitude
          );
          setUserHeading(newHeading);
        }
      } else {
        setUserHeading(heading);
      }
    }

    setUserLocation(currentLoc);
    lastLocationRef.current = currentLoc;
    
    // Speed is in m/s, convert to km/h
    const speedKmH = speed ? Math.round(speed * 3.6) : 0;
    setUserSpeed(speedKmH);
  };

  return {
    userLocation,
    setUserLocation,
    userSpeed,
    userHeading,
    setUserHeading,
    isLocating,
    isFarAway,
    updatePosition
  };
};
