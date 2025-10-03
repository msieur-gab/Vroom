import { GRID_CONFIG } from '../config.js';

/**
 * PathRouter - A* pathfinding with orthogonal constraints
 * Creates clean, efficient paths between grid nodes with minimal turns
 */
export class PathRouter {
  constructor(grid) {
    this.grid = grid;
    this.TURN_PENALTY = 1;  // Extra cost for direction changes
    this.STRAIGHT_BONUS = 0.5;  // Bonus for continuing straight
  }
  
  /**
   * Find orthogonal path between two grid positions
   * @param {{row: number, col: number}} start - Starting grid position
   * @param {{row: number, col: number}} end - Target grid position
   * @returns {Array<{row: number, col: number}>} Path coordinates
   */
  findPath(start, end) {
    if (start.row === end.row && start.col === end.col) {
      return [start];
    }
    
    // Use A* algorithm with orthogonal constraints
    const openSet = [{ pos: start, gCost: 0, hCost: this.heuristic(start, end), parent: null, direction: null }];
    const closedSet = new Set();
    const gCosts = new Map();
    
    gCosts.set(this.posKey(start), 0);
    
    while (openSet.length > 0) {
      // Get node with lowest f-cost (g + h)
      openSet.sort((a, b) => (a.gCost + a.hCost) - (b.gCost + b.hCost));
      const current = openSet.shift();
      
      // Reached destination
      if (current.pos.row === end.row && current.pos.col === end.col) {
        return this.reconstructPath(current);
      }
      
      closedSet.add(this.posKey(current.pos));
      
      // Check all orthogonal neighbors (no diagonals)
      const neighbors = this.getOrthogonalNeighbors(current.pos);
      
      for (const neighbor of neighbors) {
        const neighborKey = this.posKey(neighbor);
        
        if (closedSet.has(neighborKey)) continue;
        
        // Calculate movement cost with turn penalties
        const movementCost = 1; // Base cost for one grid step
        const direction = this.getDirection(current.pos, neighbor);
        const turnPenalty = this.calculateTurnPenalty(current.direction, direction);
        
        const tentativeGCost = current.gCost + movementCost + turnPenalty;
        
        // Check if this path to neighbor is better
        const existingGCost = gCosts.get(neighborKey);
        if (existingGCost === undefined || tentativeGCost < existingGCost) {
          gCosts.set(neighborKey, tentativeGCost);
          
          const neighborNode = {
            pos: neighbor,
            gCost: tentativeGCost,
            hCost: this.heuristic(neighbor, end),
            parent: current,
            direction: direction
          };
          
          // Add to open set if not already there
          if (!openSet.some(node => node.pos.row === neighbor.row && node.pos.col === neighbor.col)) {
            openSet.push(neighborNode);
          }
        }
      }
    }
    
    // No path found, return direct orthogonal path as fallback
    return this.createDirectPath(start, end);
  }
  
  /**
   * Get valid orthogonal neighbors (up, down, left, right)
   * @param {{row: number, col: number}} pos - Current position
   * @returns {Array<{row: number, col: number}>} Neighbor positions
   */
  getOrthogonalNeighbors(pos) {
    return [
      { row: pos.row - 1, col: pos.col },  // Up
      { row: pos.row + 1, col: pos.col },  // Down
      { row: pos.row, col: pos.col - 1 },  // Left
      { row: pos.row, col: pos.col + 1 }   // Right
    ].filter(neighbor => this.isValidPosition(neighbor));
  }
  
  /**
   * Check if a grid position is valid for pathfinding
   * @param {{row: number, col: number}} pos - Position to check
   * @returns {boolean} True if position is valid
   */
  isValidPosition(pos) {
    // Allow reasonable grid bounds (could be expanded)
    return pos.row >= -10 && pos.row <= 100 && pos.col >= -50 && pos.col <= 500;
  }
  
  /**
   * Manhattan distance heuristic for A*
   * @param {{row: number, col: number}} a - Start position
   * @param {{row: number, col: number}} b - End position
   * @returns {number} Heuristic distance
   */
  heuristic(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }
  
  /**
   * Get direction of movement between two adjacent positions
   * @param {{row: number, col: number}} from - Starting position
   * @param {{row: number, col: number}} to - Target position
   * @returns {string} Direction ('up', 'down', 'left', 'right')
   */
  getDirection(from, to) {
    if (to.row < from.row) return 'up';
    if (to.row > from.row) return 'down';
    if (to.col < from.col) return 'left';
    if (to.col > from.col) return 'right';
    return null;
  }
  
  /**
   * Calculate penalty for direction changes (turns)
   * @param {string|null} previousDirection - Previous movement direction
   * @param {string} newDirection - New movement direction
   * @returns {number} Turn penalty cost
   */
  calculateTurnPenalty(previousDirection, newDirection) {
    if (!previousDirection) return 0; // First move has no penalty
    
    if (previousDirection === newDirection) {
      return -this.STRAIGHT_BONUS; // Bonus for continuing straight
    } else {
      return this.TURN_PENALTY; // Penalty for turning
    }
  }
  
  /**
   * Create position key for Maps and Sets
   * @param {{row: number, col: number}} pos - Position
   * @returns {string} Unique position key
   */
  posKey(pos) {
    return `${pos.row},${pos.col}`;
  }
  
  /**
   * Reconstruct path from A* result
   * @param {Object} endNode - Final node from A* search
   * @returns {Array<{row: number, col: number}>} Complete path
   */
  reconstructPath(endNode) {
    const path = [];
    let current = endNode;
    
    while (current) {
      path.unshift(current.pos);
      current = current.parent;
    }
    
    return path;
  }
  
  /**
   * Create direct orthogonal path as fallback
   * @param {{row: number, col: number}} start - Starting position
   * @param {{row: number, col: number}} end - Target position
   * @returns {Array<{row: number, col: number}>} Direct path
   */
  createDirectPath(start, end) {
    const path = [start];
    
    // Move horizontally first, then vertically (L-shaped path)
    if (start.col !== end.col) {
      // Horizontal movement
      const step = start.col < end.col ? 1 : -1;
      for (let col = start.col + step; col !== end.col + step; col += step) {
        path.push({ row: start.row, col });
      }
    }
    
    if (start.row !== end.row) {
      // Vertical movement
      const step = start.row < end.row ? 1 : -1;
      for (let row = start.row + step; row !== end.row + step; row += step) {
        path.push({ row, col: end.col });
      }
    }
    
    return path;
  }
  
  /**
   * Generate paths connecting all photo nodes in order
   * @returns {Array<Array<{row: number, col: number}>>} Array of path segments
   */
  generateAllPaths() {
    const nodes = this.grid.getNodesByDistance();
    const pathSegments = [];
    
    for (let i = 0; i < nodes.length - 1; i++) {
      const startNode = nodes[i];
      const endNode = nodes[i + 1];
      
      // Convert distances to grid coordinates using ResponsiveGrid logic
      const startCoords = this.distanceToGridCoords(startNode.distance);
      const endCoords = this.distanceToGridCoords(endNode.distance);
      
      const path = this.findPath(startCoords, endCoords);
      pathSegments.push({
        from: startNode.id,
        to: endNode.id,
        path: path,
        distance: endNode.distance - startNode.distance
      });
    }
    
    // Store paths in grid for rendering
    this.grid.pathSegments = pathSegments;
    
    console.log(`Generated ${pathSegments.length} path segments`);
    return pathSegments;
  }
  
  /**
   * Convert distance to grid coordinates (matches ResponsiveGrid logic)
   * @param {number} distance - Distance in km
   * @returns {{row: number, col: number}} Grid coordinates
   */
  distanceToGridCoords(distance) {
    const KM_PER_CELL = GRID_CONFIG.KM_PER_CELL;
    const MAX_COLUMNS = GRID_CONFIG.CELLS_PER_ROW;

    // Same logic as ResponsiveGrid
    const cellIndex = distance === 0 ? 0 : Math.ceil(distance / KM_PER_CELL);
    const row = Math.floor(cellIndex / MAX_COLUMNS);
    const col = cellIndex % MAX_COLUMNS;
    
    console.log(`🔍 PathRouter: ${distance}km → cell ${cellIndex} → grid(${row}, ${col})`);
    return { row, col };
  }
  
  /**
   * Debug method: Analyze path quality
   * @param {Array<{row: number, col: number}>} path - Path to analyze
   * @returns {Object} Path statistics
   */
  analyzePath(path) {
    if (path.length < 2) return { turns: 0, length: 0 };
    
    let turns = 0;
    let totalLength = 0;
    let lastDirection = null;
    
    for (let i = 1; i < path.length; i++) {
      const direction = this.getDirection(path[i - 1], path[i]);
      totalLength += 1;
      
      if (lastDirection && direction !== lastDirection) {
        turns++;
      }
      lastDirection = direction;
    }
    
    return { turns, length: totalLength, efficiency: totalLength / (turns + 1) };
  }
}