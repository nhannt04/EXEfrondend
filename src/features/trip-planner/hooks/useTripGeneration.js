import { useState, useEffect } from 'react';
import tripService from '../../../services/tripService';
import { SPOTS_DATABASE } from '../constants/plannerConstants';

export const useTripGeneration = (language, t) => {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFactIndex, setLoadingFactIndex] = useState(0);
  const [optimizing, setOptimizing] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => {
        setLoadingFactIndex((prev) => (prev + 1) % 4);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleGenerate = async (params) => {
    setLoading(true);
    setItinerary(null);
    setHasOptimized(false);
    
    try {
      // Logic for AI generation via tripService
      const response = await tripService.generateItinerary(params);
      if (response && response.success) {
        setItinerary(response.data);
        return response.data;
      }
    } catch (err) {
      console.error("Failed to generate itinerary:", err);
      alert(language === 'vi' ? "Lỗi khi sinh lịch trình AI!" : "Error generating AI itinerary!");
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleOptimizeBudget = (currentItinerary) => {
    setOptimizing(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!currentItinerary) {
          setOptimizing(false);
          resolve(null);
          return;
        }

        const ecoHomestay = SPOTS_DATABASE.Homestay.Healing;
        const ecoMorning = SPOTS_DATABASE.Cafe[0];
        const ecoAfternoon = SPOTS_DATABASE.Activity[0];
        const ecoEvening = SPOTS_DATABASE.Food[1];

        const optimized = currentItinerary.map((d) => ({
          ...d,
          accommodation: { ...ecoHomestay },
          morning: { ...ecoMorning },
          afternoon: { ...ecoAfternoon },
          evening: { ...ecoEvening }
        }));

        setItinerary(optimized);
        setOptimizing(false);
        setHasOptimized(true);
        resolve(optimized);
      }, 2500);
    });
  };

  return {
    itinerary,
    setItinerary,
    loading,
    loadingFactIndex,
    optimizing,
    setOptimizing,
    hasOptimized,
    handleGenerate,
    handleOptimizeBudget
  };
};
