/**
 * SceneryRenderer - Adds decorative elements to the journey map
 *
 * Creates a rich, varied landscape by placing biome-appropriate decorations
 * in safe zones around the path and nodes.
 */

export class SceneryRenderer {
  constructor(canvasJourneyGrid) {
    this.grid = canvasJourneyGrid;
    this.decorations = [];

    // Biome definitions with emoji icons for prototype
    this.biomes = [
      {
        minKm: 0,
        maxKm: 100,
        name: 'forest',
        icons: ['🌲', '🌳', '🌿', '🍄', '🦋'],
        bgColor: '#e8f5e9'
      },
      {
        minKm: 100,
        maxKm: 300,
        name: 'plains',
        icons: ['🌾', '🌻', '🌼', '🦗', '🐝'],
        bgColor: '#fff9c4'
      },
      {
        minKm: 300,
        maxKm: 600,
        name: 'desert',
        icons: ['🌵', '🏜️', '🦎', '🦂', '☀️'],
        bgColor: '#fff3e0'
      },
      {
        minKm: 600,
        maxKm: 1000,
        name: 'mountain',
        icons: ['🏔️', '⛰️', '🦅', '🐐', '☁️'],
        bgColor: '#e3f2fd'
      },
      {
        minKm: 1000,
        maxKm: Infinity,
        name: 'snow',
        icons: ['❄️', '🏔️', '🐻', '🦌', '⛄'],
        bgColor: '#f1f8ff'
      }
    ];

    // Configuration
    this.config = {
      density: 0.3, // Probability of placing decoration in empty cell (0-1)
      minDistanceFromRoad: 40, // Minimum pixels from road center
      iconSize: 24, // Base size for emoji rendering
      randomSizeVariation: 0.3 // ±30% size variation
    };
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
   * We need to check the actual waypoints, not just guess based on nodes
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
      // Waypoints are at cell centers, but we need some tolerance
      const inCell = wp.x >= cellX && wp.x <= cellX + cellSize &&
                     wp.y >= cellY && wp.y <= cellY + cellSize;
      return inCell;
    });
  }

  /**
   * Get safe placement zones in a cell (areas away from the road centerline)
   * The organic pathfinder uses waypoints at cell centers, creating
   * a circular "road zone" we need to avoid
   */
  getSafePlacementInCell(row, col) {
    const center = this.grid.getCellCenter(row, col);
    const cellSize = this.grid.CELL_SIZE;
    const isEvenRow = row % 2 === 0;
    const isArcCell = col === 0 || col === this.grid.CELLS_PER_ROW - 1;

    // Define safe zones - areas away from the road centerline
    const safeZones = [];

    // The road has a width (from drawing) - stay clear of center ±20px
    const roadClearance = 20;

    if (isArcCell) {
      // Arc cells (0 and 4): Road curves through center, use corners and edges
      const isRightArc = col === this.grid.CELLS_PER_ROW - 1;

      if (isRightArc) {
        // Right arc cell - safe zones on far right and corners
        safeZones.push(
          // Far right edge
          { x: center.x + cellSize * 0.35, y: center.y + (Math.random() - 0.5) * cellSize * 0.6 },
          // Top right corner
          { x: center.x + cellSize * 0.3, y: center.y - cellSize * 0.3 },
          // Bottom right corner
          { x: center.x + cellSize * 0.3, y: center.y + cellSize * 0.3 }
        );
      } else {
        // Left arc cell - safe zones on far left and corners
        safeZones.push(
          // Far left edge
          { x: center.x - cellSize * 0.35, y: center.y + (Math.random() - 0.5) * cellSize * 0.6 },
          // Top left corner
          { x: center.x - cellSize * 0.3, y: center.y - cellSize * 0.3 },
          // Bottom left corner
          { x: center.x - cellSize * 0.3, y: center.y + cellSize * 0.3 }
        );
      }
    } else {
      // Regular cells (1, 2, 3): Road runs horizontally through center
      // Safe zones are top and bottom, with good horizontal variation
      const horizontalOffset = (Math.random() - 0.5) * cellSize * 0.7;

      safeZones.push(
        // Top area (above road)
        { x: center.x + horizontalOffset, y: center.y - cellSize * 0.35 },
        // Bottom area (below road)
        { x: center.x + horizontalOffset, y: center.y + cellSize * 0.35 }
      );
    }

    // Return a random safe zone
    return safeZones.length > 0
      ? safeZones[Math.floor(Math.random() * safeZones.length)]
      : null;
  }

  /**
   * Generate decorations based on current nodes and waypoints
   * Pass waypoints to detect which cells are actually traversed
   */
  generateDecorations(sortedNodes, waypoints) {
    this.decorations = [];

    if (sortedNodes.length === 0) return;

    // Get grid dimensions
    const maxRow = Math.max(...sortedNodes.map(n => n.coords.row));
    const occupiedCells = new Set(
      sortedNodes.map(n => `${n.coords.row},${n.coords.col}`)
    );

    // Generate decorations for each row
    for (let row = 0; row <= maxRow; row++) {
      const rowDistance = row * this.grid.KM_PER_ROW;
      const biome = this.getBiomeAtDistance(rowDistance);

      // Try each column in this row
      for (let col = 0; col < this.grid.CELLS_PER_ROW; col++) {
        const cellKey = `${row},${col}`;

        // Skip cells with nodes
        if (occupiedCells.has(cellKey)) continue;

        // Skip cells that actually have waypoints (are traversed by the path)
        if (this.isCellTraversed(row, col, waypoints)) continue;

        // Randomly decide whether to place decoration
        if (Math.random() > this.config.density) continue;

        // Get safe placement position in cell
        const position = this.getSafePlacementInCell(row, col);
        if (!position) continue;

        // Random icon from biome
        const icon = biome.icons[Math.floor(Math.random() * biome.icons.length)];

        // Random size variation
        const sizeVariation = 1 + (Math.random() - 0.5) * 2 * this.config.randomSizeVariation;
        const size = this.config.iconSize * sizeVariation;

        this.decorations.push({
          x: position.x,
          y: position.y,
          icon,
          size,
          biome: biome.name,
          row,
          col
        });
      }
    }

    console.log(`🌳 Generated ${this.decorations.length} scenery decorations across ${maxRow + 1} rows`);
  }

  /**
   * Draw decorations with viewport culling
   */
  drawDecorations(ctx, visibleTop, visibleBottom) {
    if (this.decorations.length === 0) return;

    // Set text rendering properties for emoji
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw only visible decorations
    this.decorations.forEach(decoration => {
      // Viewport culling
      if (decoration.y + decoration.size < visibleTop) return;
      if (decoration.y - decoration.size > visibleBottom) return;

      // Draw emoji
      ctx.font = `${decoration.size}px Arial`;
      ctx.fillText(decoration.icon, decoration.x, decoration.y);
    });
  }

  /**
   * Clear all decorations
   */
  clear() {
    this.decorations = [];
  }
}
