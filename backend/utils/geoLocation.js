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

    // Using ipapi.co - a free IP geolocation service
    const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
    
    return {
      city: response.data.city,
      country: response.data.country_name,
      latitude: response.data.latitude,
      longitude: response.data.longitude
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
};

module.exports = { getLocationFromIp };