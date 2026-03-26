'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getIPLocation, getCurrentPosition, getReverseGeocode, LocationData } from '../lib/location';

interface LocationContextType {
  location: LocationData | null;
  setLocation: (location: LocationData) => void;
  detectLocation: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('user_location');
    if (saved) {
      setLocationState(JSON.parse(saved));
      setIsLoading(false);
    } else {
      detectLocation();
    }
  }, []);

  const setLocation = (loc: LocationData) => {
    setLocationState(loc);
    localStorage.setItem('user_location', JSON.stringify(loc));
  };

  const detectLocation = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      // Step 1: Try GPS
      try {
        const position = await getCurrentPosition();
        const reverse = await getReverseGeocode(position.coords.latitude, position.coords.longitude);
        if (reverse.city || reverse.pincode) {
          setLocation({
            city: reverse.city || 'Unknown',
            pincode: reverse.pincode || '',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            source: 'gps',
          });
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('GPS failed, trying IP...');
      }

      // Step 2: Try IP
      const ipLoc = await getIPLocation();
      if (ipLoc.city || ipLoc.pincode) {
        setLocation({
          city: ipLoc.city || 'Unknown',
          pincode: ipLoc.pincode || '',
          lat: ipLoc.lat,
          lng: ipLoc.lng,
          source: 'ip',
        });
      } else {
        setIsError(true);
      }
    } catch (e) {
      console.error('Location detection failed:', e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, detectLocation, isLoading, isError }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
