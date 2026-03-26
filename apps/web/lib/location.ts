export interface LocationData {
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
  source: 'gps' | 'ip' | 'manual';
}

export const getIPLocation = async (): Promise<Partial<LocationData>> => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return {
      city: data.city || 'Unknown',
      pincode: data.postal || '',
      lat: data.latitude,
      lng: data.longitude,
      source: 'ip',
    };
  } catch (e) {
    console.error('IP Location failed:', e);
    return {};
  }
};

export const getReverseGeocode = async (lat: number, lng: number): Promise<Partial<LocationData>> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await res.json();
    const address = data.address;
    return {
      city: address.city || address.town || address.village || address.suburb || 'Unknown',
      pincode: address.postcode || '',
      lat,
      lng,
      source: 'gps',
    };
  } catch (e) {
    console.error('Reverse Geocode failed:', e);
    return { lat, lng, source: 'gps' };
  }
};

export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
};
