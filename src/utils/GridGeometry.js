/**
 * GridGeometry - Pure geometry functions for serpentine grid calculations
 * Handles coordinate conversions between distance, grid cells, and screen positions
 */
export class GridGeometry {
  /**
   * @param {number} cellSize - Size of each grid cell in pixels
   * @param {number} cellPadding - Padding between cells in pixels
   * @param {number} cellsPerRow - Number of cells per row
   * @param {number} horizontalPadding - Horizontal padding on left/right edges
   * @param {number} kmPerCell - Kilometers represented by each cell
   */
  constructor(cellSize, cellPadding, cellsPerRow, horizontalPadding, kmPerCell) {
    this.cellSize = cellSize;
    this.cellPadding = cellPadding;
    this.cellsPerRow = cellsPerRow;
    this.horizontalPadding = horizontalPadding;
    this.kmPerCell = kmPerCell;
  }

  /**
   * Convert distance (km) to grid coordinates using serpentine pattern
   * Row 0: L→R, Row 1: R→L, Row 2: L→R, etc.
   *
   * @param {number} distance - Distance in kilometers
   * @returns {Object} { row, col, cellIndex, x, y }
   */
  distanceToCoords(distance) {
    const cellIndex = Math.ceil(distance / this.kmPerCell);
    const row = Math.floor(cellIndex / this.cellsPerRow);

    // Serpentine pattern: alternate direction every row
    let col;
    const positionInRow = cellIndex % this.cellsPerRow;

    if (row % 2 === 0) {
      // Even rows: Left to Right (normal)
      col = positionInRow;
    } else {
      // Odd rows: Right to Left (reversed)
      col = this.cellsPerRow - 1 - positionInRow;
    }

    // Calculate screen position with horizontal padding
    const x = this.horizontalPadding + this.cellPadding + (col * (this.cellSize + this.cellPadding));
    const y = this.cellPadding + (row * (this.cellSize + this.cellPadding));

    console.log(`🐍 Serpentine: ${distance}km → cell ${cellIndex} → row ${row} (${row % 2 === 0 ? 'L→R' : 'R→L'}) → col ${col}`);
    return { row, col, cellIndex, x, y };
  }

  /**
   * Get center point of a cell
   *
   * @param {number} row - Grid row
   * @param {number} col - Grid column
   * @returns {Object} { x, y }
   */
  getCellCenter(row, col) {
    const x = this.horizontalPadding + this.cellPadding + (col * (this.cellSize + this.cellPadding)) + this.cellSize / 2;
    const y = this.cellPadding + (row * (this.cellSize + this.cellPadding)) + this.cellSize / 2;
    return { x, y };
  }

  /**
   * Get center point of a node
   *
   * @param {Object} node - Node with coords property
   * @returns {Object} { x, y }
   */
  getNodeCenter(node) {
    return {
      x: node.coords.x + this.cellSize / 2,
      y: node.coords.y + this.cellSize / 2
    };
  }

  /**
   * Calculate serpentine cell index from row/col coordinates
   * This gives us the proper ordering for serpentine traversal
   *
   * @param {number} row - Grid row
   * @param {number} col - Grid column
   * @returns {number} Cell index in serpentine order
   */
  getSerpentineCellIndex(row, col) {
    const isEvenRow = row % 2 === 0;

    // Even rows go left-to-right (0,1,2,3,4)
    // Odd rows go right-to-left (4,3,2,1,0)
    const colInSerpentine = isEvenRow ? col : (this.cellsPerRow - 1 - col);

    // Cell index = row * cellsPerRow + column position in that row
    return row * this.cellsPerRow + colInSerpentine;
  }

  /**
   * Update cell size (for responsive resizing)
   *
   * @param {number} newCellSize - New cell size in pixels
   */
  updateCellSize(newCellSize) {
    this.cellSize = newCellSize;
  }
}
