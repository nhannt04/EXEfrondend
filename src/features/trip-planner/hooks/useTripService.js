import { useState, useEffect, useCallback } from 'react';
import tripService from '../../../services/tripService';

export const useTripService = (currentUser, language) => {
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeItineraryId, setActiveItineraryId] = useState(null);
  const [activeItineraryStatus, setActiveItineraryStatus] = useState('NOT_STARTED');
  const [isSavedItinerary, setIsSavedItinerary] = useState(false);

  const fetchSavedItineraries = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await tripService.getUserTrips();
      if (response && response.success) {
        setSavedItineraries(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch saved itineraries:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchSavedItineraries();
  }, [fetchSavedItineraries]);

  const handleSaveItinerary = async (tripTitle, itinerary, days, budget, style) => {
    if (!currentUser) {
      alert(language === 'vi' ? "Vui lòng đăng nhập để lưu lịch trình!" : "Please login to save your itinerary!");
      return false;
    }
    
    setIsSaving(true);
    try {
      const tripData = {
        title: tripTitle,
        totalDays: days,
        totalBudget: budget,
        travelStyle: style,
        itineraryData: JSON.stringify(itinerary),
        status: 'NOT_STARTED'
      };
      const response = await tripService.saveTrip(tripData);
      if (response && response.success) {
        alert(language === 'vi' ? "Đã lưu lịch trình thành công!" : "Itinerary saved successfully!");
        fetchSavedItineraries();
        return true;
      }
    } catch (err) {
      console.error("Failed to save itinerary:", err);
      alert(language === 'vi' ? "Lỗi khi lưu lịch trình!" : "Error saving itinerary!");
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  const handleDeleteSaved = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(language === 'vi' ? "Bạn có chắc chắn muốn xóa lịch trình này?" : "Are you sure you want to delete this itinerary?")) return;

    try {
      const response = await tripService.deleteTrip(id);
      if (response && response.success) {
        setSavedItineraries(prev => prev.filter(t => t.id !== id));
        if (activeItineraryId === id) {
          setIsSavedItinerary(false);
          setActiveItineraryId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete itinerary:", err);
    }
  };

  const handleCompleteItinerary = async () => {
    if (!activeItineraryId) return;
    try {
      const response = await tripService.updateTripStatus(activeItineraryId, 'COMPLETED');
      if (response && response.success) {
        setActiveItineraryStatus('COMPLETED');
        setSavedItineraries(prev => prev.map(t => t.id === activeItineraryId ? { ...t, status: 'COMPLETED' } : t));
        alert(language === 'vi' ? "Chúc mừng! Bạn đã hoàn thành lộ trình khám phá Hội An." : "Congratulations! You have completed your Hoi An exploration route.");
      }
    } catch (err) {
      console.error("Failed to complete itinerary:", err);
    }
  };

  return {
    savedItineraries,
    isSaving,
    activeItineraryId,
    setActiveItineraryId,
    activeItineraryStatus,
    setActiveItineraryStatus,
    isSavedItinerary,
    setIsSavedItinerary,
    handleSaveItinerary,
    handleDeleteSaved,
    handleCompleteItinerary,
    fetchSavedItineraries
  };
};
