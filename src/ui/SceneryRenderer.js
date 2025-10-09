/**
 * SceneryRenderer - Adds decorative elements to the journey map using DOM overlay
 *
 * Uses the existing nodeOverlay DOM layer for decorations instead of canvas drawing.
 * Benefits:
 * - CSS animations and hover effects
 * - Sprite sheet rendering for game-like graphics
 * - No canvas redraw overhead
 * - Element pooling for performance
 */

export class SceneryRenderer {
  constructor(canvasJourneyGrid) {
    this.grid = canvasJourneyGrid;
    this.overlay = null; // Will be set to grid.nodeOverlay

    // Element pool: Map<cellKey, DOM element>
    this.decorationElements = new Map();

    // Active decorations: Set<cellKey>
    this.activeDecorations = new Set();

    // Sprite sheet configuration - horizontal strip layout
    this.spriteSheet = {
      url: 'assets/tree.svg',
      spriteWidth: 250,   // Width of each sprite (250px)
      spriteHeight: 250,  // Height of each sprite (250px)
      totalSprites: 2,    // 2 trees in the strip
      stripWidth: 501     // Total strip width
    };

    // Sprite-based biome definitions
    // Each biome should cover ~3x viewport height for immersive experience
    // At ~100km per row and ~5-10 rows per viewport, each biome = ~1500-3000km
    // Sprites are indexed in horizontal strip: 0 = first tree, 1 = second tree
    this.biomes = [
      {
        minKm: 0,
        maxKm: 2000,
        name: 'forest',
        sprites: [
          { index: 0 },  // Tree 1 (pine-style)
          { index: 1 }   // Tree 2 (rounded style)
        ],
        bgColor: '#F4FFF9'  // Rich forest green
      },
      {
        minKm: 2000,
        maxKm: 4000,
        name: 'plains',
        sprites: [
          { index: 0 },  // Reuse trees for now (will replace when you add more sprites)
          { index: 1 }
        ],
        bgColor: '#FDD835'  // Bright yellow plains
      },
      {
        minKm: 4000,
        maxKm: 6000,
        name: 'desert',
        sprites: [
          { index: 0 },  // Reuse trees for now
          { index: 1 }
        ],
        bgColor: '#FFB74D'  // Sandy orange desert
      },
      {
        minKm: 6000,
        maxKm: 8000,
        name: 'mountain',
        sprites: [
          { index: 0 },  // Reuse trees for now
          { index: 1 }
        ],
        bgColor: '#64B5F6'  // Mountain blue
      },
      {
        minKm: 8000,
        maxKm: Infinity,
        name: 'snow',
        sprites: [
          { index: 0 },  // Reuse trees for now
          { index: 1 }
        ],
        bgColor: '#E1F5FE',  // Icy blue-white
        filter: 'brightness(1.2) saturate(0.3)' // Make it look snowy
      }
    ];

    // Configuration
    this.config = {
      density: 0.8, // Probability of placing decoration in empty cell (0-1) - increased for fuller coverage
      baseSize: 32, // Base size for sprite rendering (will scale) - increased from 32 to 56
      randomSizeVariation: 0.6, // ±40% size variation for more variety
      minZIndex: 1,  // Decorations behind road
      maxZIndex: 15  // Decorations in front of road (road is z-index 10)
    };
  }

  /**
   * Initialize the renderer with the overlay element
   */
  initialize(overlayElement) {
    this.overlay = overlayElement;
  }

  /**
   * Get biome for a given distance
   */
  getBiomeAtDistance(distanceKm) {
    return this.biomes.find(biome =>
      distanceKm >= biome.minKm && distanceKm < biome.maxKm
    ) || this.biomes[0];
  }

  /**
   * Check if a cell actually has a waypoint (is traversed by the path)
   */
  isCellTraversed(row, col, waypoints) {
    if (!waypoints || waypoints.length === 0) return false;

    const cellSize = this.grid.CELL_SIZE;
    const cellPadding = this.grid.CELL_PADDING;

    // Calculate cell bounds
    const cellX = this.grid.HORIZONTAL_PADDING + cellPadding + (col * (cellSize + cellPadding));
    const cellY = cellPadding + (row * (cellSize + cellPadding));

    // Check if any waypoint falls within this cell
    return waypoints.some(wp => {
      const inCell = wp.x >= cellX && wp.x <= cellX + cellSize &&
                     wp.y >= cellY && wp.y <= cellY + cellSize;
      return inCell;
    });
  }

  /**
   * Get safe placement position in a cell (areas away from road centerline)
   */
  getSafePlacementInCell(row, col) {
    const center = this.grid.getCellCenter(row, col);
    const cellSize = this.grid.CELL_SIZE;
    const isArcCell = col === 0 || col === this.grid.CELLS_PER_ROW - 1;

    const safeZones = [];

    if (isArcCell) {
      // Arc cells: use corners and edges
      const isRightArc = col === this.grid.CELLS_PER_ROW - 1;

      if (isRightArc) {
        safeZones.push(
          { x: center.x + cellSize * 0.35, y: center.y + (Math.random() - 0.5) * cellSize * 0.6 },
          { x: center.x + cellSize * 0.3, y: center.y - cellSize * 0.3 },
          { x: center.x + cellSize * 0.3, y: center.y + cellSize * 0.3 }
        );
      } else {
        safeZones.push(
          { x: center.x - cellSize * 0.35, y: center.y + (Math.random() - 0.5) * cellSize * 0.6 },
          { x: center.x - cellSize * 0.3, y: center.y - cellSize * 0.3 },
          { x: center.x - cellSize * 0.3, y: center.y + cellSize * 0.3 }
        );
      }
    } else {
      // Regular cells: top and bottom
      const horizontalOffset = (Math.random() - 0.5) * cellSize * 0.7;
      safeZones.push(
        { x: center.x + horizontalOffset, y: center.y - cellSize * 0.35 },
        { x: center.x + horizontalOffset, y: center.y + cellSize * 0.35 }
      );
    }

    return safeZones.length > 0
      ? safeZones[Math.floor(Math.random() * safeZones.length)]
      : null;
  }

  /**
   * Create a DOM element for a decoration using sprite sheet (horizontal strip)
   */
  createDecorationElement(cellKey, sprite, biome, position, size, zIndex) {
    const element = document.createElement('div');
    element.className = 'scenery-decoration';
    element.dataset.cellKey = cellKey;
    element.dataset.biome = biome.name;

    // Calculate sprite position in horizontal strip
    // bgX = -(sprite.index * spriteWidth) to shift to the correct sprite
    const bgX = -(sprite.index * this.spriteSheet.spriteWidth);
    const bgY = 0; // Always 0 for horizontal strip

    // Calculate scale factor to fit our desired size
    const scale = size / this.spriteSheet.spriteWidth;

    element.style.cssText = `
      position: absolute;
      left: ${position.x}px;
      top: ${position.y}px;
      width: ${this.spriteSheet.spriteWidth}px;
      height: ${this.spriteSheet.spriteHeight}px;
      transform: translate(-50%, -50%) scale(${scale});
      transform-origin: center center;
      background-image: url('${this.spriteSheet.url}');
      background-position: ${bgX}px ${bgY}px;
      background-size: ${this.spriteSheet.stripWidth}px ${this.spriteSheet.spriteHeight}px;
      background-repeat: no-repeat;
      pointer-events: none;
      user-select: none;
      transition: opacity 0.3s ease;
      z-index: ${zIndex};
      ${biome.filter ? `filter: ${biome.filter};` : ''}
    `;

    return element;
  }

  /**
   * Generate decorations using DOM overlay
   * Maintains element pool and toggles visibility based on active cells
   */
  generateDecorations(sortedNodes, waypoints) {
    if (!this.overlay) {
      console.warn('⚠️ SceneryRenderer: overlay not initialized');
      return;
    }

    // Track which cells should have decorations
    const newActiveDecorations = new Set();

    if (sortedNodes.length === 0) {
      this.updateVisibility(newActiveDecorations);
      return;
    }

    const maxRow = Math.max(...sortedNodes.map(n => n.coords.row));
    const occupiedCells = new Set(
      sortedNodes.map(n => `${n.coords.row},${n.coords.col}`)
    );

    // Generate decorations for each row
    for (let row = 0; row <= maxRow; row++) {
      const rowDistance = row * this.grid.KM_PER_ROW;
      const biome = this.getBiomeAtDistance(rowDistance);

      for (let col = 0; col < this.grid.CELLS_PER_ROW; col++) {
        const cellKey = `${row},${col}`;

        // Skip cells with nodes
        if (occupiedCells.has(cellKey)) continue;

        // Skip cells with waypoints
        if (this.isCellTraversed(row, col, waypoints)) continue;

        // Randomly decide whether to place decoration
        if (Math.random() > this.config.density) continue;

        // Place 1-2 decorations per cell for fuller coverage
        const decorationCount = Math.random() > 0.5 ? 2 : 1;

        for (let i = 0; i < decorationCount; i++) {
          const decorationKey = `${cellKey}_${i}`;

          // Get safe placement position
          const position = this.getSafePlacementInCell(row, col);
          if (!position) continue;

          // Random sprite and size
          const sprite = biome.sprites[Math.floor(Math.random() * biome.sprites.length)];
          const sizeVariation = 1 + (Math.random() - 0.5) * 2 * this.config.randomSizeVariation;
          const size = this.config.baseSize * sizeVariation;

          // Random z-index for depth layering (some behind road, some in front)
          const zIndex = Math.floor(Math.random() * (this.config.maxZIndex - this.config.minZIndex + 1)) + this.config.minZIndex;

          // Reuse existing element or create new one
          if (!this.decorationElements.has(decorationKey)) {
            const element = this.createDecorationElement(decorationKey, sprite, biome, position, size, zIndex);
            this.decorationElements.set(decorationKey, element);
            this.overlay.appendChild(element);
          }

          newActiveDecorations.add(decorationKey);
        }
      }
    }

    // Update visibility
    this.updateVisibility(newActiveDecorations);
    this.activeDecorations = newActiveDecorations;

    console.log(`🌳 Scenery: ${newActiveDecorations.size} decorations active (${this.decorationElements.size} in pool)`);
  }

  /**
   * Update visibility of decoration elements based on active set
   */
  updateVisibility(activeSet) {
    this.decorationElements.forEach((element, cellKey) => {
      const shouldBeVisible = activeSet.has(cellKey);
      element.style.opacity = shouldBeVisible ? '1' : '0';
      element.style.pointerEvents = shouldBeVisible ? 'none' : 'none';
    });
  }

  /**
   * Clear all decorations
   */
  clear() {
    this.decorationElements.forEach(element => {
      element.style.opacity = '0';
    });
    this.activeDecorations.clear();
  }

  /**
   * Destroy all decoration elements (cleanup)
   */
  destroy() {
    this.decorationElements.forEach(element => {
      element.remove();
    });
    this.decorationElements.clear();
    this.activeDecorations.clear();
  }
}
