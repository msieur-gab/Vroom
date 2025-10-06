import { OrganicPathfinder } from './OrganicPathfinder.js';
import { NodeComponent } from './NodeComponent.js';
import { SceneryRenderer } from './SceneryRenderer.js';
import { GridConfig } from '../config.js';

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

    // Grid configuration from centralized config
    this.CELLS_PER_ROW = GridConfig.cellsPerRow;
    this.KM_PER_CELL = GridConfig.kmPerCell;
    this.KM_PER_ROW = GridConfig.kmPerRow;
    this.CELL_PADDING = GridConfig.cellPadding;
    this.HORIZONTAL_PADDING = GridConfig.horizontalPadding;

    // Debug configuration
    this.DEBUG = {
      showGrid: false,  // Toggle grid cell visibility (for development)
      showWaypoints: false  // Toggle waypoint debug dots (set in drawWaypointDebug)
    };

    // Calculate responsive cell size
    this.calculateCellSize();
    
    // Viewport and scrolling
    this.scrollY = 0;
    this.viewportHeight = 0;
    
    // Node storage
    this.nodes = new Map(); // distance -> node data
    this.nodeComponents = new Map(); // distance -> NodeComponent instances
    this.maxDistance = 0;

    // Path rendering cache - recalculated only when nodes change
    this.pathCache = {
      sortedNodes: null,
      waypoints: null,
      organicPath: null,
      isDirty: true
    };

    // Organic pathfinder for smooth serpentine roads
    this.organicPathfinder = new OrganicPathfinder(
      this.CELL_SIZE,
      this.CELL_PADDING,
      this.CELLS_PER_ROW,
      this.HORIZONTAL_PADDING
    );

    // Scenery renderer for decorative elements
    this.sceneryRenderer = new SceneryRenderer(this);

    // DOM overlay for interactive nodes
    this.nodeOverlay = null;
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.setupScrolling();
    console.log(`🎨 Canvas journey grid: ${this.CELLS_PER_ROW} cells/row, ${this.KM_PER_CELL}km/cell, ${this.CELL_SIZE}px cells`);
  }

  /**
   * Calculate responsive cell size based on viewport width
   * Maintains square cells that fit within the screen
   */
  calculateCellSize() {
    const containerWidth = this.container?.clientWidth || window.innerWidth || 500;

    // Available width = containerWidth - (2 × horizontal padding) - (6 × cell padding)
    const availableWidth = containerWidth - (2 * this.HORIZONTAL_PADDING) - ((this.CELLS_PER_ROW + 1) * this.CELL_PADDING);

    // Cell size = available width divided by number of cells
    this.CELL_SIZE = Math.floor(availableWidth / this.CELLS_PER_ROW);

    // Ensure minimum size for usability
    this.CELL_SIZE = Math.max(60, this.CELL_SIZE);

    console.log(`📱 Responsive cell size: ${this.CELL_SIZE}px (container: ${containerWidth}px)`);
  }
  
  createCanvas() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      display: block;
      background: #f8f9fa;
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

    // Initialize scenery renderer with overlay
    this.sceneryRenderer.initialize(this.nodeOverlay);

    // Make container scrollable
    this.container.style.cssText = `
      overflow-y: auto;
      height: 100vh;
      position: relative;
    `;
  }
  
  updateCanvasSize() {
    const containerWidth = this.container.clientWidth || 500;
    const gridWidth = (this.CELLS_PER_ROW * this.CELL_SIZE) + ((this.CELLS_PER_ROW + 1) * this.CELL_PADDING) + (2 * this.HORIZONTAL_PADDING);

    // Calculate total height needed
    const maxCells = this.maxDistance > 0 ? Math.ceil(this.maxDistance / this.KM_PER_CELL) + 1 : 10;
    const maxRows = Math.ceil(maxCells / this.CELLS_PER_ROW);
    const totalHeight = (maxRows * this.CELL_SIZE) + ((maxRows + 1) * this.CELL_PADDING) + 100; // Extra padding

    // Set canvas dimensions (maintain square aspect ratio)
    this.canvas.width = gridWidth;
    this.canvas.height = totalHeight;
    this.canvas.style.width = `${gridWidth}px`;
    this.canvas.style.height = `${totalHeight}px`;

    // Update overlay to match canvas size
    if (this.nodeOverlay) {
      this.nodeOverlay.style.width = `${gridWidth}px`;
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
    
    // Handle window resize with responsive cell size recalculation
    window.addEventListener('resize', () => {
      this.calculateCellSize();
      this.updateOrganicPathfinder(); // Update pathfinder with new cell size
      this.updateCanvasSize();
      this.repositionAllNodes(); // Reposition nodes with new cell size
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

    // Calculate screen position with horizontal padding
    const x = this.HORIZONTAL_PADDING + this.CELL_PADDING + (col * (this.CELL_SIZE + this.CELL_PADDING));
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

    // Invalidate path cache since nodes changed
    this.pathCache.isDirty = true;

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

    // Draw biome backgrounds FIRST (behind everything)
    this.drawBiomeBackgrounds(visibleTop, visibleBottom);

    // Draw grid cells (only visible ones) - optional for debugging
    if (this.DEBUG.showGrid) {
      this.drawVisibleGrid(visibleTop, visibleBottom);
    }

    // Don't draw canvas nodes - we use DOM overlay NodeComponents instead
    // this.drawVisibleNodes(visibleTop, visibleBottom);

    // Draw roads connecting visible nodes
    this.drawRoads(visibleTop, visibleBottom);
  }
  
  /**
   * Draw biome background colors based on distance/height
   * Creates immersive environmental zones that change as you scroll
   */
  drawBiomeBackgrounds(visibleTop, visibleBottom) {
    // Get biome definitions from SceneryRenderer
    const biomes = this.sceneryRenderer.biomes;

    // Calculate which biomes are visible in viewport
    for (let i = 0; i < biomes.length; i++) {
      const biome = biomes[i];
      const nextBiome = i < biomes.length - 1 ? biomes[i + 1] : null;

      // Convert km to pixel height
      const biomeStartY = (biome.minKm / this.KM_PER_ROW) * (this.CELL_SIZE + this.CELL_PADDING);
      const biomeEndY = nextBiome
        ? (nextBiome.minKm / this.KM_PER_ROW) * (this.CELL_SIZE + this.CELL_PADDING)
        : this.canvas.height;

      // Skip if biome not visible
      if (biomeEndY < visibleTop || biomeStartY > visibleBottom) continue;

      // Calculate visible portion of this biome
      const drawStartY = Math.max(0, biomeStartY);
      const drawEndY = Math.min(this.canvas.height, biomeEndY);
      const drawHeight = drawEndY - drawStartY;

      // Draw biome background with gradient if there's a next biome
      if (nextBiome && drawEndY === biomeEndY) {
        // Create gradient for smooth transition (last 20% of biome)
        const transitionHeight = drawHeight * 0.2;
        const solidHeight = drawHeight - transitionHeight;

        // Solid color portion
        this.ctx.fillStyle = biome.bgColor;
        this.ctx.fillRect(0, drawStartY, this.canvas.width, solidHeight);

        // Gradient transition
        const gradient = this.ctx.createLinearGradient(
          0, drawStartY + solidHeight,
          0, drawStartY + drawHeight
        );
        gradient.addColorStop(0, biome.bgColor);
        gradient.addColorStop(1, nextBiome.bgColor);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, drawStartY + solidHeight, this.canvas.width, transitionHeight);
      } else {
        // No transition, just solid color
        this.ctx.fillStyle = biome.bgColor;
        this.ctx.fillRect(0, drawStartY, this.canvas.width, drawHeight);
      }
    }
  }

  /**
   * Draw visible grid cells
   */
  drawVisibleGrid(visibleTop, visibleBottom) {
    const firstVisibleRow = Math.max(0, Math.floor(visibleTop / (this.CELL_SIZE + this.CELL_PADDING)));
    const lastVisibleRow = Math.ceil(visibleBottom / (this.CELL_SIZE + this.CELL_PADDING));

    // Semi-transparent white cells to let biome colors show through
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 1;

    for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
      for (let col = 0; col < this.CELLS_PER_ROW; col++) {
        const x = this.HORIZONTAL_PADDING + this.CELL_PADDING + (col * (this.CELL_SIZE + this.CELL_PADDING));
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
   * Draw roads using cached paths (recalculated only when nodes change)
   */
  drawRoads(visibleTop, visibleBottom) {
    // Rebuild cache if dirty (nodes added/removed/repositioned)
    if (this.pathCache.isDirty) {
      this.rebuildPathCache();
    }

    if (!this.pathCache.sortedNodes || this.pathCache.sortedNodes.length < 2) {
      return;
    }

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Scenery decorations are now DOM-based (rendered in nodeOverlay)
    // No canvas drawing needed - decorations updated in rebuildPathCache()

    // Draw cached organic path
    this.drawOrganicPath(this.pathCache.organicPath);

    // DEBUG: Draw red dots at waypoints (optional)
    if (this.DEBUG.showWaypoints) {
      this.drawWaypointDebug(this.pathCache.waypoints);
    }
  }

  /**
   * Rebuild path cache - called only when nodes change
   */
  rebuildPathCache() {
    console.log('🔄 Rebuilding path cache...');

    // Sort nodes in SERPENTINE ORDER, not by distance!
    this.pathCache.sortedNodes = Array.from(this.nodes.values())
      .sort((a, b) => {
        // Calculate serpentine cell index for proper ordering
        const cellA = this.getSerpentineCellIndex(a.coords.row, a.coords.col);
        const cellB = this.getSerpentineCellIndex(b.coords.row, b.coords.col);
        return cellA - cellB;
      });

    if (this.pathCache.sortedNodes.length < 2) {
      this.pathCache.isDirty = false;
      return;
    }

    // Generate waypoints for organic path
    this.pathCache.waypoints = this.organicPathfinder.generateOrganicWaypoints(this.pathCache.sortedNodes);

    // Generate organic Path2D
    this.pathCache.organicPath = this.organicPathfinder.createOrganicSerpentinePath(this.pathCache.sortedNodes);

    // Generate scenery decorations (pass waypoints to detect traversed cells)
    this.sceneryRenderer.generateDecorations(this.pathCache.sortedNodes, this.pathCache.waypoints);

    this.pathCache.isDirty = false;
    console.log(`✅ Path cache rebuilt: ${this.pathCache.sortedNodes.length} nodes, ${this.pathCache.waypoints.length} waypoints`);
  }


  /**
   * Get center point of a cell
   */
  getCellCenter(row, col) {
    const x = this.HORIZONTAL_PADDING + this.CELL_PADDING + (col * (this.CELL_SIZE + this.CELL_PADDING)) + this.CELL_SIZE / 2;
    const y = this.CELL_PADDING + (row * (this.CELL_SIZE + this.CELL_PADDING)) + this.CELL_SIZE / 2;
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

    // Clear scenery decorations
    this.sceneryRenderer.clear();

    // Invalidate path cache
    this.pathCache.isDirty = true;

    this.maxDistance = 0;
    this.updateCanvasSize();
    this.redraw();
    console.log('🧹 All canvas nodes and components cleared');
  }
  
  /**
   * Update OrganicPathfinder with new cell size
   */
  updateOrganicPathfinder() {
    this.organicPathfinder = new OrganicPathfinder(
      this.CELL_SIZE,
      this.CELL_PADDING,
      this.CELLS_PER_ROW,
      this.HORIZONTAL_PADDING
    );
  }

  /**
   * Reposition all nodes with updated cell size
   * Simply recalculates coords - nodes auto-position at cell centers
   */
  repositionAllNodes() {
    this.nodes.forEach((node, distance) => {
      // Recalculate grid coordinates with new cell size
      node.coords = this.distanceToCoords(distance);

      // Update NodeComponent position
      const component = this.nodeComponents.get(distance);
      if (component) {
        const center = this.getCellCenter(node.coords.row, node.coords.col);
        component.nodeData.coords = { x: center.x - 20, y: center.y - 20 };
        component.updatePosition();
      }
    });

    // Invalidate path cache since positions changed
    this.pathCache.isDirty = true;
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
