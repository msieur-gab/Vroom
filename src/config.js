/**
 * Grid Configuration
 * Central place for all grid-related constants
 */

export const GRID_CONFIG = {
  // Distance per cell in kilometers
  KM_PER_CELL: 10,

  // Number of cells per row (affects serpentine width)
  CELLS_PER_ROW: 4,

  // Calculated: kilometers per row
  get KM_PER_ROW() {
    return this.KM_PER_CELL * this.CELLS_PER_ROW; // 10 * 5 = 50km per row
  },

  // Visual settings
  CELL_PADDING: 4,        // px spacing between cells
  HORIZONTAL_PADDING: 16, // px padding on left/right edges

  // Cell size range (responsive)
  MIN_CELL_SIZE: 60,      // Minimum cell size in pixels
  MAX_CELL_SIZE: 80       // Maximum cell size in pixels
};
