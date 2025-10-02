import { OrthogonalPathfinder } from './OrthogonalPathfinder.js';
import { OrganicPathfinder } from './OrganicPathfinder.js';
import { NodeComponent } from './NodeComponent.js';

/**
 * CanvasJourneyGrid - High-performance Canvas-based journey visualization
 * Handles thousands of nodes with viewport culling for optimal scrolling
 */
export class CanvasJourneyGrid {
  constructor(container, grid) {
    this.container = container;
    this.grid = grid;
    this.canvas = null;
    this.ctx = null;
    
    // Fixed grid configuration
    this.CELLS_PER_ROW = 5;
    this.KM_PER_CELL = 20;
    this.KM_PER_ROW = 100; // 5 × 20km
    this.CELL_SIZE = 80;
    this.CELL_PADDING = 4;
    
    // Viewport and scrolling
    this.scrollY = 0;
    this.viewportHeight = 0;
    
    // Node storage
    this.nodes = new Map(); // distance -> node data
    this.nodeComponents = new Map(); // distance -> NodeComponent instances
    this.maxDistance = 0;
    
    // Pathfinding - toggle between styles
    this.useOrganicPaths = true; // Set to false for orthogonal paths
    this.orthogonalPathfinder = new OrthogonalPathfinder();
    this.organicPathfinder = new OrganicPathfinder(
      this.CELL_SIZE,
      this.CELL_PADDING,
      this.CELLS_PER_ROW
    );
    
    // DOM overlay for interactive nodes
    this.nodeOverlay = null;
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.setupScrolling();
    console.log(`🎨 Canvas journey grid: ${this.CELLS_PER_ROW} cells/row, ${this.KM_PER_CELL}km/cell`);
  }
  
  createCanvas() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      display: block;
      background: #f8f9fa;
      width: 100%;
    `;
    
    this.ctx = this.canvas.getContext('2d');
    
    // Create DOM overlay for interactive nodes
    this.nodeOverlay = document.createElement('div');
    this.nodeOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    `;
    this.nodeOverlay.classList.add('node-overlay');
    
    // Set canvas size
    this.updateCanvasSize();
    
    // Clear container and add elements
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.container.appendChild(this.nodeOverlay);
    
    // Make container scrollable
    this.container.style.cssText = `
      overflow-y: auto;
      height: 100vh;
      position: relative;
    `;
  }
  
  updateCanvasSize() {
    const containerWidth = this.container.clientWidth || 500;
    const gridWidth = (this.CELLS_PER_ROW * this.CELL_SIZE) + ((this.CELLS_PER_ROW + 1) * this.CELL_PADDING);
    
    // Calculate total height needed
    const maxCells = this.maxDistance > 0 ? Math.ceil(this.maxDistance / this.KM_PER_CELL) + 1 : 10;
    const maxRows = Math.ceil(maxCells / this.CELLS_PER_ROW);
    const totalHeight = (maxRows * this.CELL_SIZE) + ((maxRows + 1) * this.CELL_PADDING) + 100; // Extra padding
    
    // Set canvas dimensions
    this.canvas.width = Math.max(gridWidth, containerWidth);
    this.canvas.height = totalHeight;
    this.canvas.style.height = `${totalHeight}px`;
    
    // Update overlay height to match canvas
    if (this.nodeOverlay) {
      this.nodeOverlay.style.height = `${totalHeight}px`;
    }
    
    this.viewportHeight = this.container.clientHeight;
    
    console.log(`🎨 Canvas resized: ${this.canvas.width}×${this.canvas.height}px`);
  }
  
  setupScrolling() {
    // Handle scroll events for viewport culling
    this.container.addEventListener('scroll', () => {
      this.scrollY = this.container.scrollTop;
      this.redraw();
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.updateCanvasSize();
      this.redraw();
    });
  }
  
  /**
   * Convert distance to grid coordinates using serpentine pattern
   * Row 0: L→R, Row 1: R→L, Row 2: L→R, etc.
   */
  distanceToCoords(distance) {
    const cellIndex = Math.ceil(distance / this.KM_PER_CELL);
    const row = Math.floor(cellIndex / this.CELLS_PER_ROW);
    
    // Serpentine pattern: alternate direction every row
    let col;
    const positionInRow = cellIndex % this.CELLS_PER_ROW;
    
    if (row % 2 === 0) {
      // Even rows: Left to Right (normal)
      col = positionInRow;
    } else {
      // Odd rows: Right to Left (reversed)
      col = this.CELLS_PER_ROW - 1 - positionInRow;
    }
    
    // Calculate screen position
    const x = this.CELL_PADDING + (col * (this.CELL_SIZE + this.CELL_PADDING));
    const y = this.CELL_PADDING + (row * (this.CELL_SIZE + this.CELL_PADDING));
    
    console.log(`🐍 Serpentine: ${distance}km → cell ${cellIndex} → row ${row} (${row % 2 === 0 ? 'L→R' : 'R→L'}) → col ${col}`);
    return { row, col, cellIndex, x, y };
  }
  
  /**
   * Add a journey node
   */
  addNode(distance, nodeData = {}) {
    const coords = this.distanceToCoords(distance);
    
    // Determine node type
    const isStart = distance === 0 && !nodeData.type;
    
    const node = {
      distance,
      coords,
      data: nodeData,
      type: nodeData.type || (isStart ? 'start' : 'regular')
    };
    
    this.nodes.set(distance, node);
    this.maxDistance = Math.max(this.maxDistance, distance);
    
    // Create interactive NodeComponent for journey and milestone nodes
    if (node.type === 'journey' || node.type === 'milestone' || (node.type === 'regular' && !nodeData.isMilestone)) {
      this.createInteractiveNode(node);
    }
    
    // Update canvas size if needed
    this.updateCanvasSize();
    
    // Redraw
    this.redraw();
    
    console.log(`🎨 Added ${node.type} node at ${distance}km → (${coords.row}, ${coords.col})`);
    return node;
  }
  
  /**
   * Redraw canvas with viewport culling
   */
  redraw() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate visible area for viewport culling
    const visibleTop = this.scrollY - 100; // Extra buffer
    const visibleBottom = this.scrollY + this.viewportHeight + 100;

    // Draw grid cells (only visible ones)
    this.drawVisibleGrid(visibleTop, visibleBottom);

    // Don't draw canvas nodes - we use DOM overlay NodeComponents instead
    // this.drawVisibleNodes(visibleTop, visibleBottom);

    // Draw roads connecting visible nodes
    this.drawRoads(visibleTop, visibleBottom);
  }
  
  /**
   * Draw visible grid cells
   */
  drawVisibleGrid(visibleTop, visibleBottom) {
    const firstVisibleRow = Math.max(0, Math.floor(visibleTop / (this.CELL_SIZE + this.CELL_PADDING)));
    const lastVisibleRow = Math.ceil(visibleBottom / (this.CELL_SIZE + this.CELL_PADDING));

    this.ctx.fillStyle = '#e9ecef';
    this.ctx.strokeStyle = '#dee2e6';
    this.ctx.lineWidth = 1;

    for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
      for (let col = 0; col < this.CELLS_PER_ROW; col++) {
        const x = this.CELL_PADDING + (col * (this.CELL_SIZE + this.CELL_PADDING));
        const y = this.CELL_PADDING + (row * (this.CELL_SIZE + this.CELL_PADDING));

        // Only draw if cell is in visible area
        if (y + this.CELL_SIZE >= visibleTop && y <= visibleBottom) {
          this.ctx.fillRect(x, y, this.CELL_SIZE, this.CELL_SIZE);
          this.ctx.strokeRect(x, y, this.CELL_SIZE, this.CELL_SIZE);
        }
      }
    }
  }
  
  /**
   * Calculate serpentine cell index from row/col coordinates
   * This gives us the proper ordering for serpentine traversal
   */
  getSerpentineCellIndex(row, col) {
    const cellsPerRow = this.CELLS_PER_ROW;
    const isEvenRow = row % 2 === 0;

    // Even rows go left-to-right (0,1,2,3,4)
    // Odd rows go right-to-left (4,3,2,1,0)
    const colInSerpentine = isEvenRow ? col : (cellsPerRow - 1 - col);

    // Cell index = row * cellsPerRow + column position in that row
    return row * cellsPerRow + colInSerpentine;
  }

  /**
   * Draw orthogonal roads using grid-based pathfinding
   */
  drawRoads(visibleTop, visibleBottom) {
    // Sort nodes in SERPENTINE ORDER, not by distance!
    const sortedNodes = Array.from(this.nodes.values())
      .sort((a, b) => {
        // Calculate serpentine cell index for proper ordering
        const cellA = this.getSerpentineCellIndex(a.coords.row, a.coords.col);
        const cellB = this.getSerpentineCellIndex(b.coords.row, b.coords.col);
        return cellA - cellB;
      });

    if (sortedNodes.length < 2) return;

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Use organic or orthogonal paths based on setting
    if (this.useOrganicPaths) {
      // Generate waypoints for debugging
      const waypoints = this.organicPathfinder.generateOrganicWaypoints(sortedNodes);

      // Draw the organic path
      const organicPath = this.organicPathfinder.createOrganicSerpentinePath(sortedNodes);
      this.drawOrganicPath(organicPath);

      // DEBUG: Draw red dots at waypoints
      this.drawWaypointDebug(waypoints);
    } else {
      // Generate complete serpentine path with waypoints
      const fullPath = this.generateFullSerpentinePath(sortedNodes);
      console.log(`🛣️ Drawing full serpentine path through ${fullPath.length} waypoints`);

      // Draw the complete path
      if (fullPath && fullPath.length > 1) {
        this.drawOrthogonalPath(fullPath, false);
      }
    }
  }

  /**
   * Generate complete serpentine path including waypoints at row ends
   */
  generateFullSerpentinePath(sortedNodes) {
    if (sortedNodes.length === 0) return [];

    const waypoints = [];
    const firstNode = sortedNodes[0];
    const lastNode = sortedNodes[sortedNodes.length - 1];

    // Start at first node
    waypoints.push(this.getNodeCenter(firstNode));

    // For each pair of consecutive nodes, fill in the serpentine path
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      const fromNode = sortedNodes[i];
      const toNode = sortedNodes[i + 1];

      // Add intermediate waypoints for the serpentine flow
      const intermediates = this.getSerpentineWaypoints(fromNode, toNode);
      waypoints.push(...intermediates);

      // Add the next node
      waypoints.push(this.getNodeCenter(toNode));
    }

    return waypoints;
  }

  /**
   * Get serpentine waypoints between two nodes
   */
  getSerpentineWaypoints(fromNode, toNode) {
    const waypoints = [];
    const fromRow = fromNode.coords.row;
    const toRow = toNode.coords.row;
    const fromCol = fromNode.coords.col;
    const toCol = toNode.coords.col;

    // Same row - no waypoints needed
    if (fromRow === toRow) {
      return waypoints;
    }

    // Different rows - need to traverse serpentine pattern
    const isFromEvenRow = fromRow % 2 === 0;

    // Add waypoint at end of fromNode's row
    const fromRowEndCol = isFromEvenRow ? 4 : 0;
    if (fromCol !== fromRowEndCol) {
      waypoints.push(this.getCellCenter(fromRow, fromRowEndCol));
    }

    // Add waypoints for each intermediate row
    for (let row = fromRow + 1; row < toRow; row++) {
      const isEvenRow = row % 2 === 0;
      const startCol = isEvenRow ? 0 : 4;
      const endCol = isEvenRow ? 4 : 0;

      waypoints.push(this.getCellCenter(row, startCol));
      waypoints.push(this.getCellCenter(row, endCol));
    }

    // Add waypoint at start of toNode's row
    const isToEvenRow = toRow % 2 === 0;
    const toRowStartCol = isToEvenRow ? 0 : 4;
    if (toCol !== toRowStartCol) {
      waypoints.push(this.getCellCenter(toRow, toRowStartCol));
    }

    return waypoints;
  }

  /**
   * Get center point of a cell
   */
  getCellCenter(row, col) {
    const x = col * (this.CELL_SIZE + this.CELL_PADDING) + this.CELL_SIZE / 2;
    const y = row * (this.CELL_SIZE + this.CELL_PADDING) + this.CELL_SIZE / 2;
    return { x, y };
  }

  /**
   * Get center point of a node
   */
  getNodeCenter(node) {
    return {
      x: node.coords.x + this.CELL_SIZE / 2,
      y: node.coords.y + this.CELL_SIZE / 2
    };
  }
  
  /**
   * Determine connection sides based on serpentine pattern
   */
  getConnectionSides(fromNode, toNode) {
    const fromRow = fromNode.coords.row;
    const toRow = toNode.coords.row;
    
    if (fromRow === toRow) {
      // Same row - horizontal connection
      const isEvenRow = fromRow % 2 === 0;
      
      if (isEvenRow) {
        // Even row: Left to Right
        return { fromSide: 'right', toSide: 'left' };
      } else {
        // Odd row: Right to Left
        return { fromSide: 'left', toSide: 'right' };
      }
    } else {
      // Different rows - vertical connection (row transition)
      // Determine connection sides based on actual horizontal positions
      const fromX = fromNode.coords.x;
      const toX = toNode.coords.x;
      
      // If nodes are horizontally aligned or very close, use traditional serpentine logic
      const horizontalOffset = Math.abs(fromX - toX);
      const cellSize = this.CELL_SIZE;
      
      if (horizontalOffset < cellSize * 0.5) {
        // Nodes are close horizontally - use traditional serpentine logic
        const fromIsEvenRow = fromRow % 2 === 0;
        
        if (fromIsEvenRow) {
          return { fromSide: 'right', toSide: 'right' };
        } else {
          return { fromSide: 'left', toSide: 'left' };
        }
      } else {
        // Significant horizontal offset - determine direction based on serpentine path
        // Find the empty cell between nodes in serpentine order
        const fromCol = Math.floor(fromNode.distance / 20) % 5 + 1; // 1-5
        const toCol = Math.floor(toNode.distance / 20) % 5 + 1;     // 1-5
        
        // For row transitions, follow serpentine flow direction
        if (fromRow % 2 === 0) {
          // From even row (L2R): natural flow goes right to connect to R2L
          // Always curve right for L2R transitions
          return { fromSide: 'right', toSide: 'left' };
        } else {
          // From odd row (R2L): natural flow goes left to connect to L2R  
          // Always curve left for R2L transitions
          return { fromSide: 'left', toSide: 'right' };
        }
      }
    }
  }
  
  /**
   * Convert node to bounds format for pathfinder
   */
  nodeToBounds(node) {
    const nodeSize = 20; // Approximate node radius
    const centerX = node.coords.x + this.CELL_SIZE / 2;
    const centerY = node.coords.y + this.CELL_SIZE / 2;
    
    return {
      left: centerX - nodeSize / 2,
      right: centerX + nodeSize / 2,
      top: centerY - nodeSize / 2,
      bottom: centerY + nodeSize / 2
    };
  }
  
  /**
   * Draw organic curved path
   */
  drawOrganicPath(path2d) {
    const ctx = this.ctx;

    // Draw road layers for depth (doubled thickness)
    // Shadow layer
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 16;
    ctx.globalAlpha = 0.3;
    ctx.stroke(path2d);

    // Main road surface
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 12;
    ctx.globalAlpha = 1.0;
    ctx.stroke(path2d);

    // Center line (optional)
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.stroke(path2d);

    ctx.globalAlpha = 1.0;
  }

  /**
   * DEBUG: Draw red dots at waypoints
   */
  drawWaypointDebug(waypoints) {
    const ctx = this.ctx;
    ctx.fillStyle = 'red';
    ctx.globalAlpha = 1.0;

    waypoints.forEach((wp, index) => {
      // Draw red dot
      ctx.beginPath();
      ctx.arc(wp.x, wp.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw waypoint number
      ctx.fillStyle = 'white';
      ctx.font = '10px monospace';
      ctx.fillText(index, wp.x + 6, wp.y - 6);
      ctx.fillStyle = 'red';
    });
  }

  /**
   * Draw orthogonal path with rounded corners
   */
  drawOrthogonalPath(pathPoints, isDashed = false) {
    if (pathPoints.length < 2) return;
    
    const ctx = this.ctx;
    const cornerRadius = 15;
    
    // Create smooth path with rounded corners
    const smoothPath = this.createSmoothOrthogonalPath(pathPoints, cornerRadius);
    
    // Draw road layers
    // Shadow
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.3;
    ctx.stroke(smoothPath);
    
    // Surface
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.8;
    ctx.stroke(smoothPath);
    
    // Center line (dashed for first segment only)
    if (isDashed) {
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.9;
      ctx.setLineDash([8, 12]);
      ctx.stroke(smoothPath);
      ctx.setLineDash([]);
    }
    
    ctx.globalAlpha = 1.0;
  }
  
  /**
   * Create smooth orthogonal path with rounded corners
   */
  createSmoothOrthogonalPath(points, radius) {
    const path = new Path2D();
    
    if (points.length === 0) return path;
    
    path.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // Calculate corner rounding
      const d1 = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
      const d2 = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
      const maxRadius = Math.min(radius, d1 / 2, d2 / 2);
      
      if (maxRadius > 0) {
        // Calculate rounded corner points
        const ratio1 = maxRadius / d1;
        const ratio2 = maxRadius / d2;
        
        const startX = curr.x - ratio1 * (curr.x - prev.x);
        const startY = curr.y - ratio1 * (curr.y - prev.y);
        const endX = curr.x + ratio2 * (next.x - curr.x);
        const endY = curr.y + ratio2 * (next.y - curr.y);
        
        // Line to corner start
        path.lineTo(startX, startY);
        
        // Rounded corner
        path.quadraticCurveTo(curr.x, curr.y, endX, endY);
      } else {
        // Sharp corner
        path.lineTo(curr.x, curr.y);
      }
    }
    
    // Line to final point
    if (points.length > 1) {
      path.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    }
    
    return path;
  }
  
  /**
   * Create an interactive NodeComponent for journey and milestone nodes
   */
  async createInteractiveNode(node) {
    if (!this.nodeOverlay) return;

    // Calculate center position of the cell
    const centerX = node.coords.x + this.CELL_SIZE / 2;
    const centerY = node.coords.y + this.CELL_SIZE / 2;

    // Create NodeComponent with appropriate data - use the actual node type!
    const nodeData = {
      distance: node.distance,
      type: node.type, // Use the actual type (journey, milestone, etc.)
      coords: { x: centerX - 20, y: centerY - 20 }, // Offset for node size
      data: {
        ...node.data,
        title: node.data.title || node.data.name || `Node at ${node.distance}km`,
        description: node.data.description || 'Journey moment'
      }
    };

    const nodeComponent = new NodeComponent(nodeData, this.nodeOverlay);

    // Wait for initialization to complete, then enable pointer events
    setTimeout(() => {
      if (nodeComponent.element) {
        nodeComponent.element.style.pointerEvents = 'auto';
        console.log(`🎯 Enabled pointer events for ${node.type} node at ${node.distance}km`);
      }
    }, 100);

    this.nodeComponents.set(node.distance, nodeComponent);

    console.log(`🎯 Created interactive ${node.type} node at ${node.distance}km`);
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
    // Clear canvas nodes
    this.nodes.clear();
    
    // Clear and destroy NodeComponents
    this.nodeComponents.forEach(component => component.destroy());
    this.nodeComponents.clear();
    
    this.maxDistance = 0;
    this.updateCanvasSize();
    this.redraw();
    console.log('🧹 All canvas nodes and components cleared');
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
      nodeCount: this.nodes.size,
      canvasSize: `${this.canvas.width}×${this.canvas.height}`,
      maxDistance: this.maxDistance
    };
  }
}