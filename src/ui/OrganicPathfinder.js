/**
 * OrganicPathfinder - Creates smooth, curved serpentine paths
 *
 * Unlike OrthogonalPathfinder which uses right angles with rounded corners,
 * this creates flowing, organic curves using Bézier curves and splines.
 *
 * Key features:
 * - Large U-turn curves at row ends
 * - Smooth flow through node positions
 * - Natural, road-like appearance
 * - Curves extend beyond grid boundaries for organic feel
 */

export class OrganicPathfinder {
  constructor(cellSize, cellPadding, cellsPerRow, horizontalPadding = 30) {
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
   * The semicircle connects boundary waypoints (at edges of cells 2 and 4)
   * For right turns (even rows): curves through cell 5 (rightmost)
   * For left turns (odd rows): curves through cell 1 (leftmost)
   *
   * curr = exit point of current row (right edge of cell 4, or left edge of cell 2)
   * next = entry point of next row (left edge of cell 2, or right edge of cell 4)
   */
  addUTurnCurve(path, curr, next, prev, nextNext) {
    const currRow = Math.floor(curr.y / (this.CELL_SIZE + this.CELL_PADDING));
    const isEvenRow = currRow % 2 === 0;

    // Calculate the radius based on the diagonal distance between entry/exit points
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // For a semicircle connecting these two points, radius = distance / 2
    const radius = distance / 2;

    // Center point is at the midpoint between curr and next
    const centerX = (curr.x + next.x) / 2;
    const centerY = (curr.y + next.y) / 2;

    // Calculate start and end angles based on the positions
    if (isEvenRow) {
      // RIGHT turn (even row):
      // curr is at right edge of cell 4, next is at left edge of cell 2 (next row)
      // Arc curves through cell 5 on the right
      const startAngle = Math.atan2(curr.y - centerY, curr.x - centerX);
      const endAngle = Math.atan2(next.y - centerY, next.x - centerX);

      // Draw arc clockwise from curr to next
      path.arc(centerX, centerY, radius, startAngle, endAngle, false);
    } else {
      // LEFT turn (odd row):
      // curr is at left edge of cell 2, next is at right edge of cell 4 (next row)
      // Arc curves through cell 1 on the left
      const startAngle = Math.atan2(curr.y - centerY, curr.x - centerX);
      const endAngle = Math.atan2(next.y - centerY, next.x - centerX);

      // Draw arc counter-clockwise from curr to next (opposite direction from right turn)
      path.arc(centerX, centerY, radius, startAngle, endAngle, true);
    }
  }

  /**
   * Add smooth segment for horizontal connections (same row)
   */
  addSmoothSegment(path, curr, next, prev, nextNext) {
    // For horizontal segments, use gentle curves through the points
    // Calculate control points based on neighboring points for continuity

    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Use quadratic curve for gentle smoothing
    // Control point at midpoint with slight vertical offset for organic feel
    const tension = 0.3; // How much the curve deviates from straight line
    const cpx = (curr.x + next.x) / 2;
    const cpy = (curr.y + next.y) / 2;

    // For now, simple line (we can enhance with gentle curves later)
    path.lineTo(next.x, next.y);
  }

  /**
   * Generate waypoints using serpentine flow (hybrid approach)
   * Fills gaps between distant nodes by adding waypoints at row ends/edges
   */
  generateOrganicWaypoints(nodes) {
    if (nodes.length === 0) return [];

    const waypoints = [];

    // Start at first node - always use cell center
    const firstNode = nodes[0];
    const firstCol = firstNode.coords.col;
    const firstRow = firstNode.coords.row;

    waypoints.push(this.getCellCenter(firstRow, firstCol));

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
        waypoints.push(this.getCellCenter(toRow, toCol));
        continue;
      }

      // Different rows - add serpentine waypoints
      const isFromEvenRow = fromRow % 2 === 0;

      // Add waypoint at CENTER of arc cell (cell 0 for left turns, cell 4 for right turns)
      const fromArcCol = isFromEvenRow ? (this.CELLS_PER_ROW - 1) : 0; // Cell 4 or Cell 0

      if (fromCol !== fromArcCol) {
        // Need to travel to arc cell center
        waypoints.push(this.getCellCenter(fromRow, fromArcCol));
      }

      // Add waypoints for each intermediate row
      for (let row = fromRow + 1; row < toRow; row++) {
        const isEvenRow = row % 2 === 0;

        // Entry point: center of arc cell (cell 0 or cell 4)
        const entryArcCol = isEvenRow ? 0 : (this.CELLS_PER_ROW - 1); // Cell 0 or Cell 4
        waypoints.push(this.getCellCenter(row, entryArcCol));

        // Exit point: center of arc cell (cell 0 or cell 4)
        const exitArcCol = isEvenRow ? (this.CELLS_PER_ROW - 1) : 0; // Cell 4 or Cell 0
        waypoints.push(this.getCellCenter(row, exitArcCol));
      }

      // Add waypoint at CENTER of arc cell in destination row
      const isToEvenRow = toRow % 2 === 0;
      const toArcCol = isToEvenRow ? 0 : (this.CELLS_PER_ROW - 1); // Cell 0 or Cell 4
      waypoints.push(this.getCellCenter(toRow, toArcCol));

      // Add destination node center
      waypoints.push(this.getCellCenter(toRow, toCol));
    }

    return waypoints;
  }

  /**
   * Get boundary point between arc cells (1, 5) and straight path cells (2, 3, 4)
   * @param {number} row - Row index
   * @param {number} col - Column index (should be 1 for left boundary, 3 for right boundary)
   * @param {boolean} isRightEdge - True for right edge of cell, false for left edge
   *
   * Cell 1 (leftmost) and Cell 5 (rightmost) are reserved for arcs
   * Waypoints should be at:
   * - Right edge of cell 2 (boundary between cells 2-3) for left entry
   * - Left edge of cell 4 (boundary between cells 3-4) for right entry
   */
  getCellBoundary(row, col, isRightEdge) {
    const baseX = this.HORIZONTAL_PADDING + this.CELL_PADDING + (col * (this.CELL_SIZE + this.CELL_PADDING));
    const y = this.CELL_PADDING + (row * (this.CELL_SIZE + this.CELL_PADDING)) + this.CELL_SIZE / 2;

    if (isRightEdge) {
      // Right edge of the cell (before entering cell 5 for right turns)
      const x = baseX + this.CELL_SIZE;
      return { x, y, row, col };
    } else {
      // Left edge of the cell (after exiting cell 1 for left turns)
      const x = baseX;
      return { x, y, row, col };
    }
  }

  /**
   * Get center point of a cell by row/col
   */
  getCellCenter(row, col) {
    const x = this.HORIZONTAL_PADDING + this.CELL_PADDING + (col * (this.CELL_SIZE + this.CELL_PADDING)) + this.CELL_SIZE / 2;
    const y = this.CELL_PADDING + (row * (this.CELL_SIZE + this.CELL_PADDING)) + this.CELL_SIZE / 2;
    return { x, y, row, col };
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
