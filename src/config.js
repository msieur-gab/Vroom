/**
 * Application Configuration
 * Central place for all configuration constants
 */

export const GridConfig = {
  // Distance per cell in kilometers
  kmPerCell: 10,

  // Number of cells per row (affects serpentine width)
  cellsPerRow: 4,

  // Calculated: kilometers per row
  get kmPerRow() {
    return this.kmPerCell * this.cellsPerRow; // 10 * 4 = 40km per row
  },

  // Visual settings
  cellPadding: 4,         // px spacing between cells
  horizontalPadding: 16,  // px padding on left/right edges

  // Cell size range (responsive)
  minCellSize: 60,        // Minimum cell size in pixels
  maxCellSize: 80         // Maximum cell size in pixels
};

/**
 * Photo clustering configuration
 * Controls when photos are grouped into the same node
 */
export const ClusteringConfig = {
  minDistanceMeters: 100,         // Minimum distance to create new node (100 meters)
  maxTimeGapMs: 30 * 60 * 1000,   // Maximum time gap for clustering (30 minutes)
  maxPhotosPerCluster: 4,         // Maximum photos per node cluster
  cellOffsetKm: 1                 // Place nodes 1km into their target cell
};

/**
 * Image processing configuration
 * Settings for camera capture and image optimization
 */
export const ImageConfig = {
  maxWidth: 1920,           // Maximum full image width
  maxHeight: 1080,          // Maximum full image height
  thumbnailWidth: 400,      // Thumbnail width
  thumbnailHeight: 300,     // Thumbnail height
  quality: 0.85             // JPEG compression quality (0-1)
};

/**
 * Geolocation configuration
 * GPS tracking settings
 */
export const GeoConfig = {
  timeoutMs: 30000,         // GPS timeout (30 seconds)
  maximumAgeMs: 0,          // Force fresh GPS reading (no cache)
  earthRadiusKm: 6371       // Earth radius for Haversine calculations
};
