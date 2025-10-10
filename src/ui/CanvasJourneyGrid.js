import { OrganicPathfinder } from './OrganicPathfinder.js';
import { NodeComponent } from './NodeComponent.js';
import { SceneryRenderer } from './SceneryRenderer.js';
import { GridConfig, ContourConfig } from '../config.js';
import { PatternFactory } from '../utils/PatternFactory.js';

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
      organicPathVersion: 0,
      contourOverlay: null,
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

    // Pattern caches (created lazily)
    this.biomePatterns = null;
    this.contourFillPatternSources = new Map();
    this.backgroundPatternSource = null;
    this.innermostContourPattern = null;

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
   * Create pattern textures for biome backgrounds
   * Generates small repeating patterns (dots, crosses, etc.)
   */
  createBiomePatterns() {
    return PatternFactory.createBiomePatterns(this.ctx);
  }

  /**
   * Draw biome background colors based on distance/height
   * Creates immersive environmental zones that change as you scroll
   */
  drawBiomeBackgrounds(visibleTop, visibleBottom) {
    // Create patterns lazily on first draw
    if (!this.biomePatterns) {
      this.biomePatterns = this.createBiomePatterns();
    }

    // Get biome definitions from SceneryRenderer
    const biomes = this.sceneryRenderer.biomes;

    // Map biome names to patterns
    const biomePatternMap = {
      'forest': 'dots',
      'plains': 'dots',
      'desert': 'crosses',
      'mountain': 'diagonal',
      'snow': 'circles'
    };

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

      // Add pattern overlay (subtle texture)
      const patternName = biomePatternMap[biome.name] || 'dots';
      const pattern = this.biomePatterns[patternName];
      if (pattern) {
        this.ctx.fillStyle = pattern;
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

    // Draw contour background before road stroke
    this.drawElevationContours(this.pathCache.organicPath, this.pathCache.sortedNodes);

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
    this.pathCache.organicPathVersion = Date.now();
    this.pathCache.contourOverlay = null;

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
   * Draw contour-style elevation lines derived directly from waypoint influence
   */
  drawElevationContours(path2d, nodes) {
    if (!path2d || !nodes || nodes.length === 0) return;
    if (!this.canvas) return;

    const overlay = this.ensureContourOverlay(path2d, nodes);
    if (!overlay) return;

    this.ctx.drawImage(overlay, 0, 0);
  }

  ensureContourOverlay(path2d, nodes) {
    if (!this.canvas) return null;

    if (!this.pathCache.contourOverlay) {
      this.pathCache.contourOverlay = document.createElement('canvas');
      this.pathCache.contourOverlay._pathVersion = null;
    }

    const overlay = this.pathCache.contourOverlay;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const currentVersion = this.pathCache.organicPathVersion || Date.now();

    if (overlay.width !== width || overlay.height !== height || overlay._pathVersion !== currentVersion) {
      overlay.width = width;
      overlay.height = height;
      const overlayCtx = overlay.getContext('2d');
      overlayCtx.clearRect(0, 0, width, height);

      const influence = this.buildWaypointInfluenceField(nodes, width, height);
      const contours = this.generateMarchingSquaresContours(influence);
      this.renderContourOverlay(overlayCtx, path2d, contours);

      overlay._pathVersion = currentVersion;
    }

    return overlay;
  }

  buildWaypointInfluenceField(nodes, width, height) {
    const cellSize = Math.max(8, Math.floor(this.CELL_SIZE * 0.15));
    const cols = Math.ceil(width / cellSize) + 6;
    const rows = Math.ceil(height / cellSize) + 6;
    const originX = -cellSize * 3;
    const originY = -cellSize * 3;

    const nodeCenters = nodes.map(node => this.getNodeCenter(node));

    const field = [];
    for (let row = 0; row < rows; row++) {
      const rowData = [];
      const sampleY = originY + row * cellSize;
      for (let col = 0; col < cols; col++) {
        const sampleX = originX + col * cellSize;
        rowData.push(this.sampleWaypointInfluence(sampleX, sampleY, nodeCenters));
      }
      field.push(rowData);
    }

    return {
      data: field,
      rows,
      cols,
      cellSize,
      originX,
      originY
    };
  }

  /**
   * Calculate influence field value at a point using Chebyshev distance.
   * Chebyshev distance (max of dx, dy) creates square/blocky lobes that
   * align well with the orthogonal grid structure, producing more geometric
   * contour patterns than circular (Euclidean) or diamond (Manhattan) shapes.
   */
  sampleWaypointInfluence(x, y, influencePoints) {
    let value = 0;
    const baseRadius = Math.max(this.CELL_SIZE * 0.6, 60);

    for (let i = 0; i < influencePoints.length; i++) {
      const ip = influencePoints[i];
      const dx = Math.abs(x - ip.x);
      const dy = Math.abs(y - ip.y);
      const chebyshev = Math.max(dx, dy);
      const influence = Math.max(0, 1 - chebyshev / baseRadius);
      value += influence;
    }

    return value;
  }

  generateMarchingSquaresContours(field, customThresholds = null) {
    const thresholds = customThresholds || ContourConfig.thresholds;
    const groups = [];

    for (let thresholdIndex = 0; thresholdIndex < thresholds.length; thresholdIndex++) {
      const threshold = thresholds[thresholdIndex];
      const rawSegments = [];

      for (let row = 0; row < field.rows - 1; row++) {
        for (let col = 0; col < field.cols - 1; col++) {
          const cell = this.extractCell(field, row, col);
          const segs = this.marchSquare(cell, threshold);
          if (!segs) continue;
          for (const seg of segs) {
            rawSegments.push({
              ax: seg[0].x, ay: seg[0].y, bx: seg[1].x, by: seg[1].y
            });
          }
        }
      }

      if (rawSegments.length === 0) {
        continue;
      }

      const polylines = this.buildContourPolylines(rawSegments);
      const paths = [];

      for (const poly of polylines) {
        const smoothed = this.smoothPolyline(poly.points, poly.closed, ContourConfig.smoothingIterations);
        if (smoothed.length < 2) continue;

        const path = new Path2D();
        path.moveTo(smoothed[0].x, smoothed[0].y);
        for (let i = 1; i < smoothed.length; i++) {
          path.lineTo(smoothed[i].x, smoothed[i].y);
        }
        if (poly.closed) {
          path.closePath();
        }
        paths.push({ path, closed: poly.closed, points: smoothed });
      }

      if (paths.length > 0) {
        groups.push({ colorIndex: thresholdIndex, paths });
      }
    }

    return { groups };
  }

  buildContourPolylines(lines) {
    if (lines.length === 0) return [];

    const keyForPoint = (x, y) => `${x.toFixed(3)},${y.toFixed(3)}`;
    const adjacency = new Map();
    const used = new Array(lines.length).fill(false);

    const addEntry = (pointKey, entry) => {
      if (!adjacency.has(pointKey)) {
        adjacency.set(pointKey, []);
      }
      adjacency.get(pointKey).push(entry);
    };

    lines.forEach((line, index) => {
      addEntry(keyForPoint(line.ax, line.ay), { index, isStart: true });
      addEntry(keyForPoint(line.bx, line.by), { index, isStart: false });
    });

    const polylines = [];

    const extend = (poly, pointKey, direction) => {
      while (true) {
        const entries = adjacency.get(pointKey);
        if (!entries) break;

        let nextEntry = null;
        for (const entry of entries) {
          if (!used[entry.index]) {
            nextEntry = entry;
            break;
          }
        }

        if (!nextEntry) break;

        used[nextEntry.index] = true;
        const line = lines[nextEntry.index];
        let nextPoint;
        let nextKey;

        if (nextEntry.isStart) {
          nextPoint = { x: line.bx, y: line.by };
          nextKey = keyForPoint(line.bx, line.by);
        } else {
          nextPoint = { x: line.ax, y: line.ay };
          nextKey = keyForPoint(line.ax, line.ay);
        }

        if (direction === 'forward') {
          poly.push(nextPoint);
        } else {
          poly.unshift(nextPoint);
        }

        pointKey = nextKey;
      }
    };

    const pickUnusedIndexWithLooseEnd = () => {
      for (let i = 0; i < lines.length; i++) {
        if (used[i]) continue;

        const startKey = keyForPoint(lines[i].ax, lines[i].ay);
        const endKey = keyForPoint(lines[i].bx, lines[i].by);
        const startDegree = (adjacency.get(startKey)?.filter(entry => !used[entry.index]).length) || 0;
        const endDegree = (adjacency.get(endKey)?.filter(entry => !used[entry.index]).length) || 0;

        if (startDegree === 1 || endDegree === 1) {
          return i;
        }
      }
      return -1;
    };

    while (true) {
      let segmentIndex = pickUnusedIndexWithLooseEnd();
      if (segmentIndex === -1) {
        segmentIndex = used.findIndex(flag => !flag);
        if (segmentIndex === -1) {
          break;
        }
      }

      if (used[segmentIndex]) continue;

      used[segmentIndex] = true;
      const line = lines[segmentIndex];
      const polyline = [
        { x: line.ax, y: line.ay },
        { x: line.bx, y: line.by }
      ];

      extend(polyline, keyForPoint(line.bx, line.by), 'forward');
      extend(polyline, keyForPoint(line.ax, line.ay), 'backward');

      const cleaned = this.filterDuplicatePoints(polyline);
      let closed = false;
      if (cleaned.length > 2 && this.pointsAreClose(cleaned[0], cleaned[cleaned.length - 1], 0.5)) {
        cleaned.pop();
        closed = true;
      }

      polylines.push({ points: cleaned, closed });
    }

    return polylines;
  }

  smoothPolyline(points, closed, iterations = 2) {
    let pts = points.slice();

    for (let iter = 0; iter < iterations; iter++) {
      if (closed) {
        if (pts.length < 3) break;
        const newPts = [];
        for (let i = 0; i < pts.length; i++) {
          const p0 = pts[i];
          const p1 = pts[(i + 1) % pts.length];
          newPts.push({
            x: 0.75 * p0.x + 0.25 * p1.x,
            y: 0.75 * p0.y + 0.25 * p1.y
          });
          newPts.push({
            x: 0.25 * p0.x + 0.75 * p1.x,
            y: 0.25 * p0.y + 0.75 * p1.y
          });
        }
        pts = newPts;
      } else {
        if (pts.length < 3) break;
        const newPts = [pts[0]];
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[i];
          const p1 = pts[i + 1];
          newPts.push({
            x: 0.75 * p0.x + 0.25 * p1.x,
            y: 0.75 * p0.y + 0.25 * p1.y
          });
          newPts.push({
            x: 0.25 * p0.x + 0.75 * p1.x,
            y: 0.25 * p0.y + 0.75 * p1.y
          });
        }
        newPts.push(pts[pts.length - 1]);
        pts = newPts;
      }
    }

    return this.filterDuplicatePoints(pts);
  }

  getBackgroundPattern() {
    if (!this.backgroundPatternSource) {
      this.backgroundPatternSource = PatternFactory.createBackgroundPattern(this.ctx);
    }
    return this.backgroundPatternSource;
  }

  getContourPatternSource(levelIndex) {
    if (!this.contourFillPatternSources) {
      this.contourFillPatternSources = new Map();
    }

    if (!this.contourFillPatternSources.has(levelIndex)) {
      const pattern = PatternFactory.createContourFillPattern(this.ctx, levelIndex);
      this.contourFillPatternSources.set(levelIndex, pattern);
    }

    return this.contourFillPatternSources.get(levelIndex);
  }

  getInnermostContourPattern() {
    if (!this.innermostContourPattern) {
      this.innermostContourPattern = PatternFactory.createInnermostHatchPattern(
        this.ctx,
        ContourConfig.strokeColors[2] // Use color from config
      );
    }
    return this.innermostContourPattern;
  }





  filterDuplicatePoints(points) {
    if (points.length === 0) return [];
    const result = [points[0]];
    for (let i = 1; i < points.length; i++) {
      if (!this.pointsAreClose(points[i], result[result.length - 1], 0.5)) {
        result.push(points[i]);
      }
    }
    return result;
  }

  pointsAreClose(a, b, tolerance = 0.5) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return (dx * dx + dy * dy) <= tolerance * tolerance;
  }

  computePolygonArea(points) {
    if (!points || points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const p0 = points[i];
      const p1 = points[(i + 1) % points.length];
      area += (p0.x * p1.y) - (p1.x * p0.y);
    }

    return area * 0.5;
  }

  fillContourInterior(ctx, path, fillStyle) {
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.fill(path, 'nonzero');
    ctx.restore();
  }

  renderContourOverlay(ctx, path2d, contourData) {
    const strokeColors = ContourConfig.strokeColors;
    const fillColors = ContourConfig.fillColors;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const backgroundPatternSource = this.getBackgroundPattern();
    const backgroundPattern = backgroundPatternSource ? ctx.createPattern(backgroundPatternSource, 'repeat') : null;
    if (backgroundPattern) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = backgroundPattern;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.restore();
    }

    const nodeCenters = this.pathCache.sortedNodes.map(node => this.getNodeCenter(node));
    const outermostGroupIndex = contourData.groups.length > 0 ? contourData.groups[contourData.groups.length - 1].colorIndex : -1;
    const hatchPattern = this.getInnermostContourPattern();

    for (let index = contourData.groups.length - 1; index >= 0; index--) {
      const group = contourData.groups[index];
      const strokeColor = strokeColors[group.colorIndex % strokeColors.length];
      
      const closedPaths = [];
      group.paths.forEach(entry => {
        if (entry.closed && entry.points && entry.points.length >= 3) {
          entry._polygonArea = this.computePolygonArea(entry.points);
          closedPaths.push(entry);
        }
      });

      let primaryPathId = null;
      let largestArea = 0;
      for (let i = 0; i < closedPaths.length; i++) {
        const info = closedPaths[i];
        const absArea = Math.abs(info._polygonArea);
        if (absArea > largestArea) {
          largestArea = absArea;
          primaryPathId = closedPaths[i];
        }
      }

      group.paths.forEach(entry => {
        const { path, closed, points } = entry;
        if (closed) {
          let fillColor = fillColors[group.colorIndex % fillColors.length];
          const isOutermostPath = group.colorIndex === outermostGroupIndex;

          if (isOutermostPath && hatchPattern) {
            const isPrimary = primaryPathId && entry === primaryPathId;

            if (!isPrimary) {
              const nodesInside = nodeCenters.filter(center => ctx.isPointInPath(path, center.x, center.y)).length;

              if (nodesInside === 0) {
                console.log(
                  `🟢 Hatch contour group ${index} | area=${entry._polygonArea?.toFixed(1) || 'n/a'} ` +
                  `primaryArea=${primaryPathId?._polygonArea?.toFixed(1) || 'n/a'}`
                );
                fillColor = hatchPattern;
              } else {
                console.log(
                  `⚪️ Skip contour group ${index} (contains ${nodesInside} nodes) | area=${entry._polygonArea?.toFixed(1) || 'n/a'}`
                );
              }
            } else {
              console.log(
                `⚪️ Skip contour group ${index} (primary) | area=${entry._polygonArea?.toFixed(1) || 'n/a'}`
              );
            }
          }

          this.fillContourInterior(ctx, path, fillColor);
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke(path);
      });
    }

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#000';
    ctx.stroke(path2d);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(154, 136, 110, 0.1)';
    ctx.lineWidth = 20;
    ctx.stroke(path2d);
    ctx.restore();
  }

  extractCell(field, row, col) {
    const x = field.originX + col * field.cellSize;
    const y = field.originY + row * field.cellSize;
    return {
      x,
      y,
      size: field.cellSize,
      tl: field.data[row][col],
      tr: field.data[row][col + 1],
      br: field.data[row + 1][col + 1],
      bl: field.data[row + 1][col]
    };
  }

  marchSquare(cell, threshold) {
    const { x, y, size, tl, tr, br, bl } = cell;
    const caseIndex = (tl > threshold ? 8 : 0) | (tr > threshold ? 4 : 0) | (br > threshold ? 2 : 0) | (bl > threshold ? 1 : 0);

    if (caseIndex === 0 || caseIndex === 15) return null;

    const edges = [
      [[{ x, y }, tl], [{ x: x + size, y }, tr]],
      [[{ x: x + size, y }, tr], [{ x: x + size, y: y + size }, br]],
      [[{ x: x + size, y: y + size }, br], [{ x, y: y + size }, bl]],
      [[{ x, y: y + size }, bl], [{ x, y }, tl]]
    ];

    const lookup = {
      1: [3, 2], 2: [1, 2], 3: [3, 1], 4: [0, 1], 5: [0, 3, 1, 2], 6: [0, 2], 7: [3, 0],
      8: [0, 3], 9: [0, 2], 10: [0, 1, 2, 3], 11: [0, 1], 12: [3, 1], 13: [1, 2], 14: [3, 2]
    };

    const edgeIndices = lookup[caseIndex];
    if (!edgeIndices) return null;

    const points = [];
    for (let i = 0; i < edgeIndices.length; i++) {
      const edge = edges[edgeIndices[i]];
      points.push(this.interpolateEdge(edge[0], edge[1], threshold));
    }

    const segments = [];
    for (let i = 0; i < points.length; i += 2) {
      if (points[i] && points[i + 1]) {
        segments.push([points[i], points[i + 1]]);
      }
    }

    return segments.length ? segments : null;
  }

  interpolateEdge(start, end, threshold) {
    const [p0, v0] = start;
    const [p1, v1] = end;
    const denom = v0 - v1;
    if (denom === 0) {
      return { x: p0.x, y: p0.y };
    }

    const t = (v0 - threshold) / denom;
    return {
      x: p0.x + (p1.x - p0.x) * t,
      y: p0.y + (p1.y - p0.y) * t
    };
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
    ctx.strokeStyle = '#B3D0C0';
    ctx.lineWidth = 16;
    ctx.globalAlpha = 0.3;
    ctx.stroke(path2d);

    // Main road surface
    ctx.strokeStyle = '#B3D0C0';
    ctx.lineWidth = 12;
    ctx.globalAlpha = 1.0;
    ctx.stroke(path2d);

    // Center line (optional)
    // ctx.strokeStyle = '#888';
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
