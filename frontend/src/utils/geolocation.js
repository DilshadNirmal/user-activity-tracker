import api from '../config/axios';

const getBrowserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'browser'
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

const getLocationData = async () => {
  try {
    // First, try to get location from browser's geolocation API
    const browserLocation = await getBrowserLocation();
    
    // If we have browser location, get city and country using reverse geocoding
    if (browserLocation) {
      try {
        const response = await api.post('/api/users/reverse-geocode', {
          latitude: browserLocation.latitude,
          longitude: browserLocation.longitude
        });
        
        return {
          ...browserLocation,
          city: response.data.city,
          country: response.data.country
        };
      } catch (error) {
        console.error('Error in reverse geocoding:', error);
        return browserLocation;
      }
    }
  } catch (error) {
    console.error('Browser geolocation failed:', error);
    // If browser geolocation fails, we'll fall back to IP-based location
    // which will be handled by the backend
    return null;
  }
};

export { getLocationData };