/**
 * RoadDrawer - SVG-based system for drawing roads between nodes
 * Renders behind grid nodes to prevent interaction conflicts
 */
export class RoadDrawer {
  constructor(container, responsiveGrid) {
    this.container = container;
    this.responsiveGrid = responsiveGrid;
    this.svgElement = null;
    this.pathElements = new Map(); // pathId -> SVG path element
    
    this.init();
  }
  
  init() {
    this.createSVGLayer();
    this.setupEventListeners();
    console.log('🛣️ SVG road drawing system initialized');
  }
  
  /**
   * Create SVG layer behind the grid
   */
  createSVGLayer() {
    // Create SVG element
    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgElement.classList.add('road-layer');
    
    // Style SVG to overlay behind grid
    this.svgElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: visible;
    `;
    
    // Insert SVG before the grid (so it renders behind)
    const gridElement = this.container.querySelector('.travel-grid');
    if (gridElement) {
      this.container.insertBefore(this.svgElement, gridElement);
    } else {
      this.container.appendChild(this.svgElement);
    }
    
    this.updateSVGDimensions();
  }
  
  /**
   * Update SVG dimensions based on grid size
   */
  updateSVGDimensions() {
    const gridStats = this.responsiveGrid.getGridStats();
    const maxRows = Math.ceil(1000 / gridStats.maxColumns); // Estimate max rows needed
    
    const width = gridStats.maxColumns * gridStats.cellSize;
    const height = maxRows * gridStats.cellSize;
    
    this.svgElement.setAttribute('width', width);
    this.svgElement.setAttribute('height', height);
    this.svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }
  
  /**
   * Draw road between two nodes
   * @param {string} fromNodeId - Starting node ID
   * @param {string} toNodeId - Ending node ID
   * @param {Array} pathCoordinates - Array of {row, col} coordinates for the path
   * @returns {string} Path ID
   */
  drawRoad(fromNodeId, toNodeId, pathCoordinates) {
    const pathId = `road_${fromNodeId}_${toNodeId}`;
    
    // Remove existing path if it exists
    this.removeRoad(pathId);
    
    if (!pathCoordinates || pathCoordinates.length < 2) {
      console.warn('Invalid path coordinates for road', pathId);
      return pathId;
    }
    
    // Convert grid coordinates to screen coordinates
    const screenPath = this.convertPathToScreenCoords(pathCoordinates);
    
    // Create SVG path element
    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Generate SVG path data
    const pathData = this.generateSVGPathData(screenPath);
    
    // Style the path
    pathElement.setAttribute('d', pathData);
    pathElement.setAttribute('stroke', '#FF5722');
    pathElement.setAttribute('stroke-width', '4');
    pathElement.setAttribute('stroke-linecap', 'round');
    pathElement.setAttribute('stroke-linejoin', 'round');
    pathElement.setAttribute('fill', 'none');
    pathElement.setAttribute('opacity', '0.8');
    pathElement.classList.add('road-path');
    pathElement.setAttribute('data-from', fromNodeId);
    pathElement.setAttribute('data-to', toNodeId);
    
    // Add to SVG
    this.svgElement.appendChild(pathElement);
    
    // Store reference
    this.pathElements.set(pathId, pathElement);
    
    console.log(`🛣️ Drew road: ${fromNodeId} → ${toNodeId} (${pathCoordinates.length} segments)`);
    return pathId;
  }
  
  /**
   * Convert grid coordinates to screen pixel coordinates
   * @param {Array} pathCoordinates - Array of {row, col} coordinates
   * @returns {Array} Array of {x, y} screen coordinates
   */
  convertPathToScreenCoords(pathCoordinates) {
    const cellSize = this.responsiveGrid.cellSize;
    
    console.log(`🛣️ Converting ${pathCoordinates.length} coordinates with cellSize: ${cellSize}`);
    
    const screenCoords = pathCoordinates.map(({ row, col }) => {
      const x = (col * cellSize) + (cellSize / 2); // Center of cell
      const y = (row * cellSize) + (cellSize / 2);  // Center of cell
      console.log(`🛣️ Grid(${row}, ${col}) → Screen(${x}, ${y})`);
      return { x, y };
    });
    
    return screenCoords;
  }
  
  /**
   * Generate SVG path data string from screen coordinates
   * @param {Array} screenPath - Array of {x, y} coordinates
   * @returns {string} SVG path data
   */
  generateSVGPathData(screenPath) {
    if (screenPath.length === 0) return '';
    
    let pathData = `M ${screenPath[0].x} ${screenPath[0].y}`;
    
    for (let i = 1; i < screenPath.length; i++) {
      pathData += ` L ${screenPath[i].x} ${screenPath[i].y}`;
    }
    
    return pathData;
  }
  
  /**
   * Draw simple straight roads between all nodes
   */
  drawAllRoads() {
    // Clear existing roads
    this.clearAllRoads();
    
    // Get all node elements from the DOM
    const nodeElements = Array.from(this.container.querySelectorAll('.grid-cell[data-has-node="true"]'));
    
    if (nodeElements.length < 2) {
      console.log('🛣️ Need at least 2 nodes to draw roads');
      return;
    }
    
    // Sort by distance to connect in order
    nodeElements.sort((a, b) => {
      return parseFloat(a.getAttribute('data-distance')) - parseFloat(b.getAttribute('data-distance'));
    });
    
    console.log(`🛣️ Drawing ${nodeElements.length - 1} straight roads between nodes`);
    
    // Draw straight lines between consecutive nodes
    for (let i = 0; i < nodeElements.length - 1; i++) {
      const fromNode = nodeElements[i];
      const toNode = nodeElements[i + 1];
      
      this.drawStraightRoad(fromNode, toNode, i);
    }
    
    console.log(`🛣️ Drew ${nodeElements.length - 1} roads`);
  }
  
  /**
   * Draw a straight line between two DOM elements
   * @param {HTMLElement} fromElement - Starting node element
   * @param {HTMLElement} toElement - Ending node element  
   * @param {number} index - Road index for ID
   */
  drawStraightRoad(fromElement, toElement, index) {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    // Calculate center positions relative to container
    const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
    const toX = toRect.left + toRect.width / 2 - containerRect.left;
    const toY = toRect.top + toRect.height / 2 - containerRect.top;
    
    // Create SVG line element
    const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineElement.setAttribute('x1', fromX);
    lineElement.setAttribute('y1', fromY);
    lineElement.setAttribute('x2', toX);
    lineElement.setAttribute('y2', toY);
    lineElement.setAttribute('stroke', '#FF5722');
    lineElement.setAttribute('stroke-width', '3');
    lineElement.setAttribute('opacity', '0.7');
    lineElement.classList.add('road-line');
    
    // Add to SVG
    this.svgElement.appendChild(lineElement);
    
    // Store reference
    const pathId = `road_${index}`;
    this.pathElements.set(pathId, lineElement);
    
    console.log(`🛣️ Drew straight road from (${Math.round(fromX)}, ${Math.round(fromY)}) to (${Math.round(toX)}, ${Math.round(toY)})`);
  }
  
  /**
   * Remove a specific road
   * @param {string} pathId - Path ID to remove
   */
  removeRoad(pathId) {
    const pathElement = this.pathElements.get(pathId);
    if (pathElement) {
      pathElement.remove();
      this.pathElements.delete(pathId);
    }
  }
  
  /**
   * Clear all roads
   */
  clearAllRoads() {
    this.pathElements.forEach((element) => {
      element.remove();
    });
    this.pathElements.clear();
    console.log('🛣️ All roads cleared');
  }
  
  /**
   * Update road positions after grid resize
   */
  updateRoadPositions() {
    // Get current path data and redraw
    const currentPaths = new Map();
    
    this.pathElements.forEach((element, pathId) => {
      const fromNode = element.getAttribute('data-from');
      const toNode = element.getAttribute('data-to');
      
      // Store the path info for redrawing
      if (fromNode && toNode) {
        currentPaths.set(pathId, { fromNode, toNode });
      }
    });
    
    // Clear and redraw with updated dimensions
    this.clearAllRoads();
    this.updateSVGDimensions();
    
    // Would need path segments to redraw - this is called from external update
    console.log('🛣️ Road positions updated for grid resize');
  }
  
  /**
   * Setup event listeners for responsive behavior
   */
  setupEventListeners() {
    // Update SVG dimensions when grid changes
    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.updateSVGDimensions();
      }, 100);
    });
  }
  
  /**
   * Add visual effects to roads (optional styling)
   */
  styleRoads(options = {}) {
    const defaultStyle = {
      color: '#FF5722',
      width: 4,
      opacity: 0.8,
      dashArray: null, // null = solid, '5,5' = dashed
      animate: false
    };
    
    const style = { ...defaultStyle, ...options };
    
    this.pathElements.forEach((element) => {
      element.setAttribute('stroke', style.color);
      element.setAttribute('stroke-width', style.width);
      element.setAttribute('opacity', style.opacity);
      
      if (style.dashArray) {
        element.setAttribute('stroke-dasharray', style.dashArray);
      } else {
        element.removeAttribute('stroke-dasharray');
      }
      
      if (style.animate) {
        element.style.animation = 'road-pulse 2s ease-in-out infinite alternate';
      }
    });
  }
  
  /**
   * Get road drawing statistics
   */
  getStats() {
    return {
      totalRoads: this.pathElements.size,
      svgDimensions: {
        width: this.svgElement.getAttribute('width'),
        height: this.svgElement.getAttribute('height')
      }
    };
  }
}