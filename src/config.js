/**
 * Application Configuration
 * Central place for all configuration constants
 */

export const GridConfig = {
  // Distance per cell in kilometers
  kmPerCell: 1,

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

/**
 * Contour Line Configuration
 * Settings for generating and styling elevation-style contour lines
 */
export const ContourConfig = {
  // Thresholds for generating contour bands. Values are influence levels.
  // Linearly spaced values create evenly spaced contour lines.
  thresholds: [0.8, 0.65, 0.5, 0.35, 0.2, 0.05],

  // Number of smoothing iterations to apply. Higher numbers = rounder corners.
  smoothingIterations: 4,

  // Stroke colors for the contour lines, from innermost to outermost.
  strokeColors: [
    'rgba(149, 130, 103, 0.32)',
    'rgba(130, 115, 93, 0.3)',
    'rgba(109, 97, 78, 0.28)',
    'rgba(93, 83, 68, 0.26)',
    'rgba(80, 71, 60, 0.24)',
    'rgba(67, 59, 50, 0.22)'
  ],

  // Fill colors for the contour bands, from innermost to outermost.
  fillColors: [
    'rgba(149, 130, 103, 0.0)',
    'rgba(130, 115, 93, 0.0)',
    'rgba(109, 97, 78, 0.0)',
    'rgba(93, 83, 68, 0.0)',
    'rgba(80, 71, 60, 0.0)',
    '#F4FFF9'
  ]
};