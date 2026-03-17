import { useState, useEffect } from 'react';

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface UseUserLocationResult {
  location: UserLocation | null;
  cityName: string | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
}

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address;
    const city = addr?.city || addr?.town || addr?.village || addr?.state_district || addr?.state || null;
    return city;
  } catch {
    return null;
  }
}

export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSuccess = async (lat: number, lon: number) => {
    setLocation({ latitude: lat, longitude: lon });
    setIsLoading(false);

    // Reverse geocode for city name
    const city = await reverseGeocode(lat, lon);
    setCityName(city);

    // Cache in localStorage
    localStorage.setItem('userLocation', JSON.stringify({
      latitude: lat,
      longitude: lon,
      cityName: city,
      timestamp: Date.now(),
    }));
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocationSuccess(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setError(err.message || 'Failed to get location');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // Try to load cached location on mount
  useEffect(() => {
    const cached = localStorage.getItem('userLocation');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setLocation({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
          });
          setCityName(parsed.cityName || null);
        } else {
          requestLocation();
        }
      } catch {
        requestLocation();
      }
    }
  }, []);

  return { location, cityName, isLoading, error, requestLocation };
}
