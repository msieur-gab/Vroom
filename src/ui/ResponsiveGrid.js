/**
 * ResponsiveGrid - HTML/CSS based grid system replacing canvas
 * Handles responsive cell sizing and dynamic grid generation
 */
export class ResponsiveGrid {
  constructor(container, grid) {
    this.container = container;
    this.grid = grid; // TravelGrid instance for data
    this.gridElement = null;
    this.debugElement = null;
    
    // Configuration
    this.MIN_CELL_SIZE = 44;
    this.KM_PER_CELL = 20;
    this.isDevelopmentMode = true;
    
    // Calculated values
    this.cellSize = this.MIN_CELL_SIZE;
    this.maxColumns = 10;
    this.gridCells = new Map(); // cellId -> DOM element
    
    this.init();
  }
  
  init() {
    this.calculateGridDimensions();
    this.createGridHTML();
    this.setupEventListeners();
    this.updateDebugInfo();
    
    console.log(`📐 Responsive grid initialized: ${this.maxColumns} columns × ${this.cellSize}px cells`);
  }
  
  /**
   * Calculate responsive grid dimensions based on screen size
   */
  calculateGridDimensions() {
    const screenWidth = window.innerWidth;
    
    // Calculate maximum columns that fit with minimum cell size
    const maxPossibleColumns = Math.floor(screenWidth / this.MIN_CELL_SIZE);
    
    // Set reasonable column limits based on screen size
    if (screenWidth <= 320) {
      this.maxColumns = Math.max(7, maxPossibleColumns);
    } else if (screenWidth <= 480) {
      this.maxColumns = Math.max(8, Math.min(10, maxPossibleColumns));
    } else if (screenWidth <= 768) {
      this.maxColumns = Math.max(10, Math.min(15, maxPossibleColumns));
    } else {
      this.maxColumns = Math.max(15, Math.min(20, maxPossibleColumns));
    }
    
    // Calculate actual cell size
    this.cellSize = Math.max(this.MIN_CELL_SIZE, Math.floor(screenWidth / this.maxColumns));
    
    // Update CSS custom properties
    document.documentElement.style.setProperty('--max-columns', this.maxColumns);
    document.documentElement.style.setProperty('--cell-size', `${this.cellSize}px`);
    document.documentElement.style.setProperty('--screen-width', `${screenWidth}px`);
    
    console.log(`📐 Grid: ${screenWidth}px screen → ${this.maxColumns} cols × ${this.cellSize}px`);
  }
  
  /**
   * Create the main grid HTML structure
   */
  createGridHTML() {
    // Create main grid container
    this.gridElement = document.createElement('div');
    this.gridElement.className = 'travel-grid';
    this.gridElement.setAttribute('data-dev-grid', this.isDevelopmentMode ? 'visible' : 'hidden');
    
    // Create debug info panel
    if (this.isDevelopmentMode) {
      this.debugElement = document.createElement('div');
      this.debugElement.className = 'grid-debug';
      this.debugElement.setAttribute('data-visible', 'true');
      this.container.appendChild(this.debugElement);
    }
    
    // Clear container and add grid
    this.container.innerHTML = '';
    if (this.debugElement) {
      this.container.appendChild(this.debugElement);
    }
    this.container.appendChild(this.gridElement);
  }
  
  /**
   * Convert distance to grid coordinates using journey progression
   * @param {number} distance - Distance in km
   * @returns {{row: number, col: number}} Grid coordinates
   */
  distanceToGridCoords(distance) {
    // Each cell represents 20km of cumulative travel distance
    // St=0km->cell0, 01=20km->cell1, 02=40km->cell2, etc.
    const cellIndex = Math.floor(distance / this.KM_PER_CELL);
    
    // Convert linear cell index to row/col coordinates (left-to-right, top-to-bottom)
    const row = Math.floor(cellIndex / this.maxColumns);
    const col = cellIndex % this.maxColumns;
    
    console.log(`🗺️ Distance ${distance}km → cell ${cellIndex} → grid(${row}, ${col})`);
    return { row, col };
  }
  
  /**
   * Add a travel node to the grid
   * @param {number} distance - Distance in km
   * @param {Object} nodeData - Node data
   * @returns {string} Cell ID
   */
  addNode(distance, nodeData = {}) {
    const coords = this.distanceToGridCoords(distance);
    const cellId = `cell_${coords.row}_${coords.col}`;
    
    // Use exact coordinates - no collision detection for now
    const finalCellId = `cell_${coords.row}_${coords.col}`;
    
    // Create grid cell
    const cellElement = document.createElement('div');
    cellElement.className = 'grid-cell';
    cellElement.setAttribute('data-distance', distance);
    cellElement.setAttribute('data-has-node', 'true');
    cellElement.setAttribute('data-row', coords.row);
    cellElement.setAttribute('data-col', coords.col);
    
    // Position cell in grid
    cellElement.style.gridRow = coords.row + 1; // CSS Grid is 1-indexed
    cellElement.style.gridColumn = coords.col + 1;
    
    // Create travel node element (original green circle style)
    const nodeElement = document.createElement('div');
    nodeElement.className = 'travel-node';
    nodeElement.style.cssText = `
      width: 16px;
      height: 16px;
      background: #4CAF50;
      border: 2px solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 8px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
    nodeElement.textContent = Math.round(distance);
    
    cellElement.appendChild(nodeElement);
    this.gridElement.appendChild(cellElement);
    
    // Store reference
    this.gridCells.set(finalCellId, {
      element: cellElement,
      coords: { row: coords.row, col: coords.col },
      distance: distance,
      nodeData: nodeData
    });
    
    console.log(`📍 Added node at ${distance}km → cell ${Math.floor(distance / this.KM_PER_CELL)} → grid(${coords.row}, ${coords.col})`);
    return finalCellId;
  }
  
  /**
   * Clear all nodes from grid
   */
  clearNodes() {
    this.gridCells.forEach(({ element }) => {
      element.remove();
    });
    this.gridCells.clear();
    console.log('🧹 All grid nodes cleared');
  }
  
  /**
   * Update debug information display
   */
  updateDebugInfo() {
    if (!this.debugElement) return;
    
    const nodeCount = this.gridCells.size;
    const screenWidth = window.innerWidth;
    
    this.debugElement.innerHTML = `
      Screen: ${screenWidth}px<br>
      Grid: ${this.maxColumns} cols × ${this.cellSize}px<br>
      Nodes: ${nodeCount}<br>
      KM/Cell: ${this.KM_PER_CELL}
    `;
  }
  
  /**
   * Setup event listeners for responsive behavior
   */
  setupEventListeners() {
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
    
    // Development mode toggle (for testing)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'g' && e.altKey) {
        this.toggleDevelopmentMode();
      }
    });
  }
  
  /**
   * Handle window resize events
   */
  handleResize() {
    const oldColumns = this.maxColumns;
    const oldCellSize = this.cellSize;
    
    this.calculateGridDimensions();
    
    if (oldColumns !== this.maxColumns || oldCellSize !== this.cellSize) {
      console.log(`📐 Grid resized: ${oldColumns}→${this.maxColumns} cols, ${oldCellSize}→${this.cellSize}px`);
      this.repositionNodes();
    }
    
    this.updateDebugInfo();
  }
  
  /**
   * Reposition existing nodes after grid resize
   */
  repositionNodes() {
    this.gridCells.forEach(({ element, distance }, cellId) => {
      const newCoords = this.distanceToGridCoords(distance);
      
      // Update grid position
      element.style.gridRow = newCoords.row + 1;
      element.setAttribute('data-row', newCoords.row);
      
      // Column might need adjustment if grid got narrower
      let newCol = parseInt(element.getAttribute('data-col'));
      if (newCol >= this.maxColumns) {
        newCol = Math.min(newCol, this.maxColumns - 1);
        element.style.gridColumn = newCol + 1;
        element.setAttribute('data-col', newCol);
      }
    });
  }
  
  /**
   * Toggle development mode visibility
   */
  toggleDevelopmentMode() {
    this.isDevelopmentMode = !this.isDevelopmentMode;
    this.gridElement.setAttribute('data-dev-grid', this.isDevelopmentMode ? 'visible' : 'hidden');
    
    if (this.debugElement) {
      this.debugElement.setAttribute('data-visible', this.isDevelopmentMode ? 'true' : 'false');
    }
    
    console.log(`🔧 Development mode: ${this.isDevelopmentMode ? 'ON' : 'OFF'}`);
  }
  
  /**
   * Center view on content (scroll to show all nodes)
   */
  centerView() {
    if (this.gridCells.size === 0) {
      // No content, scroll to top
      this.container.scrollTop = 0;
      return;
    }
    
    // Find the range of rows with content
    let minRow = Infinity;
    let maxRow = -Infinity;
    
    this.gridCells.forEach(({ coords }) => {
      minRow = Math.min(minRow, coords.row);
      maxRow = Math.max(maxRow, coords.row);
    });
    
    // Calculate center position
    const centerRow = (minRow + maxRow) / 2;
    const centerY = centerRow * this.cellSize;
    const containerHeight = this.container.clientHeight;
    
    // Scroll to center the content vertically
    const scrollTop = Math.max(0, centerY - containerHeight / 2);
    
    this.container.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
    
    console.log(`🎯 Centered view on rows ${minRow}-${maxRow} (${this.gridCells.size} nodes)`);
  }
  
  /**
   * Get grid statistics for debugging
   */
  getGridStats() {
    return {
      screenWidth: window.innerWidth,
      maxColumns: this.maxColumns,
      cellSize: this.cellSize,
      nodeCount: this.gridCells.size,
      kmPerCell: this.KM_PER_CELL,
      developmentMode: this.isDevelopmentMode
    };
  }
}