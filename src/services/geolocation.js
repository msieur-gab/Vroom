/**
 * GeolocationService - GPS tracking and distance calculations
 * Handles location tracking and Haversine distance calculations
 */
export class GeolocationService {
  constructor() {
    this.isSupported = 'geolocation' in navigator;
    this._lastPosition = null;  // Private variable
    this._homePosition = null;  // Private variable
    this.watchId = null;
  }

  // Getter for lastPosition
  get lastPosition() {
    return this._lastPosition;
  }

  // Setter for lastPosition
  set lastPosition(value) {
    console.log('🔧 Setting lastPosition:', value);
    this._lastPosition = value;
  }

  // Getter for homePosition
  get homePosition() {
    return this._homePosition;
  }

  // Setter for homePosition (only called by setHomePosition method)
  set homePosition(value) {
    this._homePosition = value;
  }

  /**
   * Check if geolocation is supported
   */
  isAvailable() {
    return this.isSupported;
  }

  /**
   * Get current GPS position
   * @param {Object} options - Geolocation options
   * @returns {Promise<Object>} Position data
   */
  async getCurrentPosition(options = {}) {
    if (!this.isSupported) {
      throw new Error('Geolocation not supported on this device');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const posData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            timestamp: position.timestamp
          };

          // Don't set lastPosition here - let the caller decide when to update it
          console.log('📍 Position acquired:', posData);
          resolve(posData);
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          reject(new Error(`Location access denied: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // Increased timeout to 30 seconds
          maximumAge: 0, // Always get fresh position (important for testing with mocked locations)
          ...options
        }
      );
    });
  }

  /**
   * Set home position (starting point for distance calculations)
   * @param {Object} position - Position object with latitude/longitude
   */
  setHomePosition(position) {
    this.homePosition = {
      latitude: position.latitude,
      longitude: position.longitude,
      timestamp: position.timestamp || Date.now()
    };
    console.log('🏠 Home position set:', this.homePosition);
  }

  /**
   * Get home position
   * @returns {Object|null} Home position or null
   */
  getHomePosition() {
    return this.homePosition;
  }

  /**
   * Calculate distance between current position and home
   * @returns {Promise<number>} Distance in kilometers
   */
  async getDistanceFromHome() {
    if (!this.homePosition) {
      throw new Error('Home position not set. Call setHomePosition() first.');
    }

    const currentPos = await this.getCurrentPosition();
    return this.calculateDistance(
      this.homePosition.latitude,
      this.homePosition.longitude,
      currentPos.latitude,
      currentPos.longitude
    );
  }

  /**
   * Calculate distance between two positions and last position
   * @returns {Promise<number>} Distance traveled since last photo in kilometers
   */
  async getDistanceSinceLastPhoto() {
    if (!this.lastPosition) {
      // First photo - no previous position
      return 0;
    }

    const currentPos = await this.getCurrentPosition();
    const distance = this.calculateDistance(
      this.lastPosition.latitude,
      this.lastPosition.longitude,
      currentPos.latitude,
      currentPos.longitude
    );

    // Update last position
    this.lastPosition = currentPos;
    return distance;
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    console.log(`📏 Distance calculated: ${distance.toFixed(2)}km`);
    return distance;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Watch position changes (for real-time tracking)
   * @param {Function} callback - Called when position changes
   * @param {Object} options - Geolocation options
   */
  watchPosition(callback, options = {}) {
    if (!this.isSupported) {
      throw new Error('Geolocation not supported');
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const posData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        callback(posData);
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
        ...options
      }
    );

    return this.watchId;
  }

  /**
   * Stop watching position
   */
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('⏹️ Stopped watching position');
    }
  }

  /**
   * Format coordinates for display
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {string} Formatted coordinates
   */
  formatCoordinates(lat, lon) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lon).toFixed(6)}°${lonDir}`;
  }

  /**
   * Reset service state
   */
  reset() {
    console.log('🔄 Resetting geolocation service...');
    this._lastPosition = null;
    this._homePosition = null;
    this.stopWatching();
    console.log('✅ Geolocation service reset complete');
  }
}

// Singleton instance
export const geolocationService = new GeolocationService();
