import { GRID_CONFIG } from '../config.js';

/**
 * TravelGrid - Core grid system for travel photo positioning
 * Maps accumulated distance to grid coordinates for orthogonal path visualization
 */
export class TravelGrid {
  constructor(options = {}) {
    // Grid configuration
    this.KM_PER_CELL = GRID_CONFIG.KM_PER_CELL;
    this.CELLS_PER_ROW = GRID_CONFIG.CELLS_PER_ROW;
    this.CELL_SIZE = options.cellSize || 80;
    
    // Data storage
    this.photoNodes = new Map();  // id -> { gridPos, distance, data }
    this.pathSegments = [];       // Array of connected path segments
    this.nextNodeId = 1;
    
    // Grid bounds (dynamic based on content)
    this.bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  
  /**
   * Convert cumulative distance to grid coordinates
   * Grid grows vertically (downward) as distance increases
   * @param {number} totalKm - Total distance traveled in kilometers
   * @returns {{x: number, y: number}} Grid position
   */
  distanceToGrid(totalKm) {
    // Use Math.ceil to ensure any fraction of a KM pushes to the next cell.
    // This matches the behavior in CanvasJourneyGrid.js for consistency.
    // e.g., 20.1km -> Math.ceil(20.1 / 20) -> Math.ceil(1.005) -> 2.
    // A distance of 0km results in cellIndex 0.
    const cellIndex = Math.ceil(totalKm / this.KM_PER_CELL);
    const row = Math.floor(cellIndex / this.CELLS_PER_ROW);
    const col = cellIndex % this.CELLS_PER_ROW;
    
    return {
      x: col, // X should be the column (horizontal)
      y: row  // Y should be the row (vertical)
    };
  }
  
  /**
   * Convert grid coordinates to screen coordinates
   * @param {{x: number, y: number}} gridPos - Grid position
   * @returns {{x: number, y: number}} Screen coordinates
   */
  gridToScreen(gridPos) {
    return {
      x: gridPos.x * this.CELL_SIZE,
      y: gridPos.y * this.CELL_SIZE
    };
  }
  
  /**
   * Add a new photo node to the grid
   * @param {number} totalDistance - Cumulative distance in km
   * @param {Object} photoData - Photo metadata
   * @returns {string} Node ID
   */
  addPhotoNode(totalDistance, photoData = {}) {
    const nodeId = `node_${this.nextNodeId++}`;
    const gridPos = this.distanceToGrid(totalDistance);
    
    const node = {
      id: nodeId,
      gridPos,
      distance: totalDistance,
      timestamp: Date.now(),
      data: { ...photoData }
    };
    
    this.photoNodes.set(nodeId, node);
    this.updateBounds(gridPos);
    
    console.log(`Added node ${nodeId} at grid(col: ${gridPos.x}, row: ${gridPos.y}) - ${totalDistance}km`);
    return nodeId;
  }
  
  /**
   * Update grid bounds to accommodate new positions
   */
  updateBounds(gridPos) {
    this.bounds.minX = Math.min(this.bounds.minX, gridPos.x);
    this.bounds.minY = Math.min(this.bounds.minY, gridPos.y);
    this.bounds.maxX = Math.max(this.bounds.maxX, gridPos.x);
    this.bounds.maxY = Math.max(this.bounds.maxY, gridPos.y);
  }
  
  /**
   * Get all photo nodes sorted by distance
   * @returns {Array} Sorted array of nodes
   */
  getNodesByDistance() {
    return Array.from(this.photoNodes.values())
      .sort((a, b) => a.distance - b.distance);
  }
  
  /**
   * Get node by ID
   * @param {string} nodeId 
   * @returns {Object|null} Node object or null
   */
  getNode(nodeId) {
    return this.photoNodes.get(nodeId) || null;
  }
  
  /**
   * Check if a grid position is occupied
   * @param {{x: number, y: number}} gridPos 
   * @returns {boolean} True if position has a node
   */
  isPositionOccupied(gridPos) {
    return Array.from(this.photoNodes.values())
      .some(node => node.gridPos.x === gridPos.x && node.gridPos.y === gridPos.y);
  }
  
  /**
   * Get grid dimensions for rendering
   * @returns {{width: number, height: number, bounds: Object}} Grid info
   */
  getGridDimensions() {
    const width = (this.bounds.maxX - this.bounds.minX + 1) * this.CELL_SIZE;
    const height = (this.bounds.maxY - this.bounds.minY + 1) * this.CELL_SIZE;
    
    return {
      width,
      height,
      bounds: { ...this.bounds },
      cellSize: this.CELL_SIZE
    };
  }
  
  /**
   * Clear all data (useful for testing)
   */
  clear() {
    this.photoNodes.clear();
    this.pathSegments = [];
    this.bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    this.nextNodeId = 1;
    console.log('Grid cleared');
  }
  
  /**
   * Debug method: Log current grid state
   */
  debugState() {
    console.log('=== Travel Grid State ===');
    console.log('Nodes:', this.photoNodes.size);
    console.log('Bounds:', this.bounds);
    console.log('Path segments:', this.pathSegments.length);
    
    this.getNodesByDistance().forEach(node => {
      console.log(`  ${node.id}: (${node.gridPos.x},${node.gridPos.y}) - ${node.distance}km`);
    });
  }
}