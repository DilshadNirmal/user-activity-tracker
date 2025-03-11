const axios = require('axios');

const getLocationFromIp = async (ipAddress) => {
  try {
    // Skip geolocation for localhost/private IPs
    if (ipAddress === '127.0.0.1' || ipAddress === 'localhost' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
      return {
        city: 'Local',
        country: 'Local',
        latitude: 0,
        longitude: 0
      };
    }

    // Try multiple geolocation services for better accuracy
    const services = [
      // IP-API service (more accurate, higher rate limit)
      async () => {
        const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
        if (response.data.status === 'success') {
          return {
            city: response.data.city,
            country: response.data.country,
            latitude: response.data.lat,
            longitude: response.data.lon
          };
        }
        throw new Error('IP-API request failed');
      },
      // ipapi.co as fallback
      async () => {
        const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
        return {
          city: response.data.city,
          country: response.data.country_name,
          latitude: response.data.latitude,
          longitude: response.data.longitude
        };
      }
    ];

    // Try each service in sequence until one succeeds
    for (const service of services) {
      try {
        return await service();
      } catch (serviceError) {
        console.error('Service error:', serviceError);
        continue;
      }
    }

    throw new Error('All geolocation services failed');
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
};

module.exports = { getLocationFromIp };