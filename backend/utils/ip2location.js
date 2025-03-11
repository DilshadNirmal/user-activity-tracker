const IP2Location = require('ip2location-nodejs');

let ip2location = null;

const initializeIp2Location = () => {
  if (!ip2location) {
    ip2location = new IP2Location.IP2Location();
    
    // Load the BIN database
    // Note: You need to download the IP2Location BIN database file
    // from https://lite.ip2location.com (free) or https://www.ip2location.com (paid)
    // and place it in the project directory
    try {
      ip2location.open('./IP2LOCATION-LITE-DB11.BIN');
    } catch (error) {
      console.error('Error loading IP2Location database:', error);
      return false;
    }
  }
  return true;
};

const getLocationFromIp2Location = async (ipAddress) => {
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

    // Initialize IP2Location if not already initialized
    if (!initializeIp2Location()) {
      throw new Error('IP2Location database initialization failed');
    }

    // Get location data
    const result = ip2location.getAll(ipAddress);
    
    return {
      city: result.city,
      country: result.countryLong,
      latitude: result.latitude,
      longitude: result.longitude
    };
  } catch (error) {
    console.error('Error fetching location data from IP2Location:', error);
    return null;
  }
};

module.exports = { getLocationFromIp2Location };