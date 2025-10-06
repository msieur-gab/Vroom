import { GridConfig } from '../config.js';

/**
 * OrganicPathfinder - Creates smooth, curved serpentine paths
 *
 * Creates flowing, organic curves using semicircular arcs (compass method).
 *
 * Key features:
 * - Large U-turn curves at row ends using perfect semicircles
 * - Smooth flow through node positions at cell centers
 * - Natural, road-like appearance
 * - Waypoints positioned at cell centers for consistent geometry
 */

export class OrganicPathfinder {
  constructor(cellSize, cellPadding, cellsPerRow, horizontalPadding = GridConfig.horizontalPadding) {
    this.CELL_SIZE = cellSize;
    this.CELL_PADDING = cellPadding;
    this.CELLS_PER_ROW = cellsPerRow;
    this.HORIZONTAL_PADDING = horizontalPadding;

    // Radius for quarter-circle turns
    // This is the radius of the semicircle formed by two quarter circles
    this.TURN_RADIUS = (cellSize + cellPadding) * 0.5;
  }

  /**
   * Create smooth serpentine path through waypoints
   * @param {Array} waypoints - Array of {x, y} points
   * @returns {Path2D} Smooth curved path
   */
  createSmoothPath(waypoints) {
    if (waypoints.length < 2) return new Path2D();

    const path = new Path2D();

    // Start at first waypoint
    path.moveTo(waypoints[0].x, waypoints[0].y);

    // Create smooth curves through all waypoints
    for (let i = 0; i < waypoints.length - 1; i++) {
      const curr = waypoints[i];
      const next = waypoints[i + 1];
      const prev = i > 0 ? waypoints[i - 1] : null;
      const nextNext = i < waypoints.length - 2 ? waypoints[i + 2] : null;

      // Detect if this is a U-turn (row transition)
      const isUTurn = this.isRowTransition(curr, next);

      if (isUTurn) {
        this.addUTurnCurve(path, curr, next, prev, nextNext);
      } else {
        this.addSmoothSegment(path, curr, next, prev, nextNext);
      }
    }

    return path;
  }

  /**
   * Check if transition between points is a row change (U-turn needed)
   */
  isRowTransition(point1, point2) {
    const row1 = Math.floor(point1.y / (this.CELL_SIZE + this.CELL_PADDING));
    const row2 = Math.floor(point2.y / (this.CELL_SIZE + this.CELL_PADDING));
    return row1 !== row2;
  }

  /**
   * Add a U-turn using ONE semicircle spanning two rows
   *
   * COMPASS METHOD:
   * The semicircle is constructed using the "compass method" - imagine placing a compass
   * at the midpoint between entry and exit waypoints, with radius set to half the distance
   * between them. This creates a perfect semicircle that naturally curves through the
   * appropriate arc cell (leftmost or rightmost).
   *
   * For right turns (even rows): curves through rightmost cell (cell 4)
   * For left turns (odd rows): curves through leftmost cell (cell 0)
   *
   * @param curr - Exit waypoint of current row (at arc cell center)
   * @param next - Entry waypoint of next row (at arc cell center)
   */
  addUTurnCurve(path, curr, next, prev, nextNext) {
    const currRow = Math.floor(curr.y / (this.CELL_SIZE + this.CELL_PADDING));
    const isEvenRow = currRow % 2 === 0;

    // STEP 1: Calculate diagonal distance between entry and exit waypoints
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // STEP 2: Radius of semicircle = half the distance between waypoints
    // This is the key insight of the compass method
    const radius = distance / 2;

    // STEP 3: Center point of the semicircle = midpoint between waypoints
    // This ensures the arc passes exactly through both waypoints
    const centerX = (curr.x + next.x) / 2;
    const centerY = (curr.y + next.y) / 2;

    // STEP 4: Calculate angles from center to waypoints using atan2
    // atan2(dy, dx) returns the angle in radians from the positive X-axis
    const startAngle = Math.atan2(curr.y - centerY, curr.x - centerX);
    const endAngle = Math.atan2(next.y - centerY, next.x - centerX);

    // STEP 5: Draw the arc in the appropriate direction
    if (isEvenRow) {
      // RIGHT turn (even row → odd row):
      // Arc curves clockwise (false) through the rightmost cell
      path.arc(centerX, centerY, radius, startAngle, endAngle, false);
    } else {
      // LEFT turn (odd row → even row):
      // Arc curves counter-clockwise (true) through the leftmost cell
      path.arc(centerX, centerY, radius, startAngle, endAngle, true);
    }
  }

  /**
   * Add smooth segment for horizontal connections (same row)
   * Currently uses straight lines - could be enhanced with gentle curves
   */
  addSmoothSegment(path, curr, next, prev, nextNext) {
    // Simple straight line connection for same-row nodes
    path.lineTo(next.x, next.y);
  }

  /**
   * Generate waypoints using serpentine flow (hybrid approach)
   * Fills gaps between distant nodes by adding waypoints at row ends/edges
   */
  generateOrganicWaypoints(nodes) {
    if (nodes.length === 0) return [];

    const waypoints = [];
    const addWaypoint = (point) => {
      if (!point) return;
      const last = waypoints[waypoints.length - 1];
      if (!last || last.x !== point.x || last.y !== point.y) {
        waypoints.push(point);
      }
    };

    // Start at first node - always use cell center
    const firstNode = nodes[0];
    const firstCol = firstNode.coords.col;
    const firstRow = firstNode.coords.row;

    addWaypoint(this.getCellCenter(firstRow, firstCol));

    // For each pair of consecutive nodes
    for (let i = 0; i < nodes.length - 1; i++) {
      const fromNode = nodes[i];
      const toNode = nodes[i + 1];
      const fromRow = fromNode.coords.row;
      const toRow = toNode.coords.row;
      const fromCol = fromNode.coords.col;
      const toCol = toNode.coords.col;

      // Same row - just add destination cell center
      if (fromRow === toRow) {
        addWaypoint(this.getCellCenter(toRow, toCol));
        continue;
      }

      // Adjacent rows with shared column - align vertically instead of forcing edge arcs
      if (this.shouldUseAlignedColumnTransition(fromNode, toNode)) {
        const alignedWaypoints = this.getAlignedColumnWaypoints(fromNode, toNode);
        alignedWaypoints.forEach(addWaypoint);
        addWaypoint(this.getCellCenter(toRow, toCol));
        continue;
      }

      // Different rows - add serpentine waypoints
      const isFromEvenRow = fromRow % 2 === 0;

      // Add waypoint at CENTER of arc cell (cell 0 for left turns, cell 4 for right turns)
      const fromArcCol = isFromEvenRow ? (this.CELLS_PER_ROW - 1) : 0; // Cell 4 or Cell 0

      if (fromCol !== fromArcCol) {
        // Need to travel to arc cell center
        addWaypoint(this.getCellCenter(fromRow, fromArcCol));
      }

      // Add waypoints for each intermediate row
      for (let row = fromRow + 1; row < toRow; row++) {
        const isEvenRow = row % 2 === 0;

        // Entry point: center of arc cell (cell 0 or cell 4)
        const entryArcCol = isEvenRow ? 0 : (this.CELLS_PER_ROW - 1); // Cell 0 or Cell 4
        addWaypoint(this.getCellCenter(row, entryArcCol));

        // Exit point: center of arc cell (cell 0 or cell 4)
        const exitArcCol = isEvenRow ? (this.CELLS_PER_ROW - 1) : 0; // Cell 4 or Cell 0
        addWaypoint(this.getCellCenter(row, exitArcCol));
      }

      // Add waypoint at CENTER of arc cell in destination row
      const isToEvenRow = toRow % 2 === 0;
      const toArcCol = isToEvenRow ? 0 : (this.CELLS_PER_ROW - 1); // Cell 0 or Cell 4
      addWaypoint(this.getCellCenter(toRow, toArcCol));

      // Add destination node center
      addWaypoint(this.getCellCenter(toRow, toCol));
    }

    return waypoints;
  }

  /**
   * Determine if two nodes should align vertically during a row transition
   * rather than travelling to the serpentine arc columns.
   */
  shouldUseAlignedColumnTransition(fromNode, toNode) {
    const fromRow = fromNode.coords.row;
    const toRow = toNode.coords.row;
    const fromCol = fromNode.coords.col;
    const toCol = toNode.coords.col;

    const rowDelta = Math.abs(toRow - fromRow);
    if (rowDelta !== 1) return false; // Only adjust adjacent rows to preserve serpentine flow

    const fromDefaultArcCol = fromRow % 2 === 0 ? (this.CELLS_PER_ROW - 1) : 0;
    const toDefaultArcCol = toRow % 2 === 0 ? 0 : (this.CELLS_PER_ROW - 1);

    // If both nodes are already sitting on their default arc columns, keep the existing behaviour
    if (fromCol === fromDefaultArcCol && toCol === toDefaultArcCol) {
      return false;
    }

    const toRowDirection = toRow % 2 === 0 ? 1 : -1; // Even rows move left ➝ right, odd rows right ➝ left
    const relativeDirection = (toCol - fromCol) * toRowDirection;

    // Only align vertically if the destination node sits ahead (or directly below) in the row's flow direction
    if (relativeDirection < 0) {
      return false;
    }

    return true;
  }

  /**
   * Build waypoints that keep the transition vertical through a shared column.
   */
  getAlignedColumnWaypoints(fromNode, toNode) {
    const alignedWaypoints = [];
    const fromRow = fromNode.coords.row;
    const toRow = toNode.coords.row;
    const sharedCol = fromNode.coords.col;

    const step = toRow > fromRow ? 1 : -1;
    for (let row = fromRow + step; row !== toRow; row += step) {
      alignedWaypoints.push(this.getCellCenter(row, sharedCol));
    }

    // Encourage the path to enter the destination row through the shared column
    alignedWaypoints.push(this.getCellCenter(toRow, sharedCol));

    return alignedWaypoints;
  }


  /**
   * Get center point of a cell by row/col
   */
  getCellCenter(row, col) {
    const x = this.HORIZONTAL_PADDING + this.CELL_PADDING + (col * (this.CELL_SIZE + this.CELL_PADDING)) + this.CELL_SIZE / 2;
    const y = this.CELL_PADDING + (row * (this.CELL_SIZE + this.CELL_PADDING)) + this.CELL_SIZE / 2;
    return { x, y };
  }

  /**
   * Create complete serpentine path with organic curves
   * @param {Array} sortedNodes - Nodes sorted in serpentine order
   * @returns {Path2D} Complete organic path
   */
  createOrganicSerpentinePath(sortedNodes) {
    if (sortedNodes.length === 0) return new Path2D();

    // Generate waypoints positioned for smooth curves
    const waypoints = this.generateOrganicWaypoints(sortedNodes);

    // Create smooth curved path through waypoints
    return this.createSmoothPath(waypoints);
  }
}
