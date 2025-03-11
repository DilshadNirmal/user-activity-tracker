const axios = require('axios');

// Cache for storing successful lookups
const locationCache = new Map();

// Configure axios instances with proper headers and timeouts
const createAxiosInstance = (baseURL) => {
  return axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    }
  });
};

const isPrivateIP = (ipAddress) => {
  if (!ipAddress || typeof ipAddress !== 'string') return true;
  if (ipAddress === 'localhost') return true;
  
  const parts = ipAddress.split('.');
  if (parts.length !== 4) return true;
  
  return (
    parts[0] === '10' ||
    parts[0] === '127' ||
    (parts[0] === '172' && (parseInt(parts[1]) >= 16 && parseInt(parts[1]) <= 31)) ||
    (parts[0] === '192' && parts[1] === '168')
  );
};

const geoServices = [
  {
    name: 'ip-api',
    fetch: async (ipAddress) => {
      const api = createAxiosInstance('http://ip-api.com');
      const response = await api.get(`/json/${ipAddress}`);
      if (response.data.status === 'success') {
        return {
          city: response.data.city,
          country: response.data.country,
          latitude: response.data.lat,
          longitude: response.data.lon,
          source: 'ip-api'
        };
      }
      throw new Error('IP-API request failed');
    }
  },
  {
    name: 'ipapi.co',
    fetch: async (ipAddress) => {
      const api = createAxiosInstance('https://ipapi.co');
      const response = await api.get(`/${ipAddress}/json/`);
      if (response.data.error) throw new Error(response.data.reason || 'ipapi.co request failed');
      return {
        city: response.data.city,
        country: response.data.country_name,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        source: 'ipapi.co'
      };
    }
  }
];

const getLocationFromIp = async (ipAddress) => {
  try {
    // Handle private/invalid IP addresses
    if (isPrivateIP(ipAddress)) {
      return {
        city: 'Local',
        country: 'Local',
        latitude: 0,
        longitude: 0,
        source: 'local'
      };
    }

    // Check cache first
    if (locationCache.has(ipAddress)) {
      return locationCache.get(ipAddress);
    }

    // Try each service in sequence until one succeeds
    let lastError = null;
    for (const service of geoServices) {
      try {
        const locationData = await service.fetch(ipAddress);
        
        // Cache successful lookup
        locationCache.set(ipAddress, locationData);
        return locationData;
      } catch (error) {
        console.error(`${service.name} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    console.error('All geolocation services failed');
    return null;
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
};

module.exports = { getLocationFromIp };