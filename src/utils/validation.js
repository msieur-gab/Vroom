/**
 * Input Validation Utilities
 * Centralized validation logic with consistent error messages
 */

/**
 * Validate player name
 * @param {string} name - Player name to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validatePlayerName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (trimmedName.length > 50) {
    return { valid: false, error: 'Name must be 50 characters or less' };
  }

  // Check for invalid characters (only allow letters, numbers, spaces, hyphens, apostrophes)
  const validNamePattern = /^[a-zA-Z0-9\s\-']+$/;
  if (!validNamePattern.test(trimmedName)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true, error: null };
}

/**
 * Validate distance value
 * @param {number} distance - Distance to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateDistance(distance) {
  if (distance === null || distance === undefined) {
    return { valid: false, error: 'Distance is required' };
  }

  if (typeof distance !== 'number' || isNaN(distance)) {
    return { valid: false, error: 'Distance must be a number' };
  }

  if (distance < 0) {
    return { valid: false, error: 'Distance cannot be negative' };
  }

  if (!isFinite(distance)) {
    return { valid: false, error: 'Distance must be a finite number' };
  }

  // Maximum reasonable distance (circumference of Earth)
  const MAX_DISTANCE = 40075; // km
  if (distance > MAX_DISTANCE) {
    return { valid: false, error: `Distance cannot exceed ${MAX_DISTANCE}km` };
  }

  return { valid: true, error: null };
}

/**
 * Validate GPS coordinates
 * @param {number} latitude - Latitude value
 * @param {number} longitude - Longitude value
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateCoordinates(latitude, longitude) {
  if (latitude === null || latitude === undefined) {
    return { valid: false, error: 'Latitude is required' };
  }

  if (longitude === null || longitude === undefined) {
    return { valid: false, error: 'Longitude is required' };
  }

  if (typeof latitude !== 'number' || isNaN(latitude)) {
    return { valid: false, error: 'Latitude must be a number' };
  }

  if (typeof longitude !== 'number' || isNaN(longitude)) {
    return { valid: false, error: 'Longitude must be a number' };
  }

  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }

  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }

  return { valid: true, error: null };
}

/**
 * Validate photo blob
 * @param {Blob} blob - Photo blob to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validatePhotoBlob(blob) {
  if (!blob) {
    return { valid: false, error: 'Photo is required' };
  }

  if (!(blob instanceof Blob)) {
    return { valid: false, error: 'Invalid photo format' };
  }

  // Check file type
  if (!blob.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Maximum file size: 10MB
  const MAX_SIZE = 10 * 1024 * 1024;
  if (blob.size > MAX_SIZE) {
    return { valid: false, error: 'Photo size must be less than 10MB' };
  }

  if (blob.size === 0) {
    return { valid: false, error: 'Photo cannot be empty' };
  }

  return { valid: true, error: null };
}
