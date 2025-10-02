/**
 * CleanJourneyGrid - Fresh implementation with correct journey progression logic
 * 5 cells per row, 20km per cell, 100km per row
 */
export class CleanJourneyGrid {
  constructor(container, grid) {
    this.container = container;
    this.grid = grid;
    this.gridElement = null;
    
    // Fixed configuration - no responsive calculations
    this.CELLS_PER_ROW = 5;
    this.KM_PER_CELL = 20;
    this.KM_PER_ROW = 100; // 5 × 20km
    this.CELL_SIZE = 80; // Fixed size for simplicity
    
    this.nodes = new Map(); // distance -> node element
    
    this.init();
  }
  
  init() {
    this.createGrid();
    console.log(`🗺️ Clean journey grid: ${this.CELLS_PER_ROW} cells/row, ${this.KM_PER_CELL}km/cell`);
  }
  
  createGrid() {
    // Create main grid container
    this.gridElement = document.createElement('div');
    this.gridElement.className = 'journey-grid';
    this.gridElement.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${this.CELLS_PER_ROW}, ${this.CELL_SIZE}px);
      gap: 2px;
      padding: 20px;
      background: #f0f0f0;
    `;
    
    // Clear container and add grid
    this.container.innerHTML = '';
    this.container.appendChild(this.gridElement);
  }
  
  /**
   * Convert distance to grid coordinates
   * @param {number} distance - Distance in km
   * @returns {{row: number, col: number, cellIndex: number}}
   */
  distanceToCoords(distance) {
    const cellIndex = Math.floor(distance / this.KM_PER_CELL);
    const row = Math.floor(cellIndex / this.CELLS_PER_ROW);
    const col = cellIndex % this.CELLS_PER_ROW;
    
    console.log(`📍 ${distance}km → cell ${cellIndex} → (row ${row}, col ${col})`);
    return { row, col, cellIndex };
  }
  
  /**
   * Add a journey node at specific distance
   * @param {number} distance - Distance in km
   * @param {Object} nodeData - Node data
   */
  addNode(distance, nodeData = {}) {
    const coords = this.distanceToCoords(distance);
    
    // Create cell element
    const cellElement = document.createElement('div');
    cellElement.className = 'journey-cell';
    cellElement.style.cssText = `
      width: ${this.CELL_SIZE}px;
      height: ${this.CELL_SIZE}px;
      background: #e8e8e8;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      grid-row: ${coords.row + 1};
      grid-column: ${coords.col + 1};
    `;
    cellElement.setAttribute('data-distance', distance);
    cellElement.setAttribute('data-cell-index', coords.cellIndex);
    
    // Create node (photo dot)
    const nodeElement = document.createElement('div');
    nodeElement.className = 'journey-node';
    
    // Check if this is a milestone (every 100km)
    const isMilestone = distance > 0 && distance % 100 === 0;
    const isStart = distance === 0;
    
    if (isStart) {
      nodeElement.style.cssText = `
        width: 24px;
        height: 24px;
        background: #FFD700;
        border: 2px solid #FFA500;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: #333;
      `;
      nodeElement.textContent = 'St';
    } else if (isMilestone) {
      nodeElement.style.cssText = `
        width: 24px;
        height: 24px;
        background: #4CAF50;
        border: 2px solid #2E7D32;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        font-weight: bold;
        color: white;
      `;
      nodeElement.textContent = `M${distance / 100}`;
    } else {
      nodeElement.style.cssText = `
        width: 20px;
        height: 20px;
        background: #2196F3;
        border: 2px solid #1976D2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        font-weight: bold;
        color: white;
      `;
      nodeElement.textContent = Math.floor(coords.cellIndex).toString().padStart(2, '0');
    }
    
    cellElement.appendChild(nodeElement);
    this.gridElement.appendChild(cellElement);
    
    // Store reference
    this.nodes.set(distance, {
      element: cellElement,
      nodeElement: nodeElement,
      coords: coords,
      distance: distance,
      data: nodeData
    });
    
    console.log(`✅ Added ${isStart ? 'start' : isMilestone ? 'milestone' : 'node'} at ${distance}km`);
    return cellElement;
  }
  
  /**
   * Get all nodes sorted by distance
   */
  getNodesByDistance() {
    return Array.from(this.nodes.values()).sort((a, b) => a.distance - b.distance);
  }
  
  /**
   * Clear all nodes
   */
  clearNodes() {
    this.nodes.forEach(({ element }) => element.remove());
    this.nodes.clear();
    console.log('🧹 All nodes cleared');
  }
  
  /**
   * Get grid statistics
   */
  getStats() {
    return {
      cellsPerRow: this.CELLS_PER_ROW,
      kmPerCell: this.KM_PER_CELL,
      kmPerRow: this.KM_PER_ROW,
      cellSize: this.CELL_SIZE,
      nodeCount: this.nodes.size
    };
  }
}