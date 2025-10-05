# Node Placement & Board Game Pattern Documentation

## Overview
Vrooom uses a **board game serpentine pattern** for placing travel nodes, where each cell represents 20km of distance and nodes flow in alternating left-to-right and right-to-left patterns between rows.

## Core Concepts

### Grid Layout
- **Cells per row**: 5 cells (numbered 1, 2, 3, 4, 5 from left to right)
- **Distance per cell**: 20km
- **Distance per row**: 100km (5 cells × 20km)
- **Cell numbering**: Always left-to-right regardless of travel direction

### Board Game Pattern (Serpentine)
```
Row 0 (Even): 1 → 2 → 3 → 4 → 5 ↓
                              ↙
Row 1 (Odd):  1 ← 2 ← 3 ← 4 ← 5
↓
Row 2 (Even): 1 → 2 → 3 → 4 → 5 ↓
                              ↙
Row 3 (Odd):  1 ← 2 ← 3 ← 4 ← 5
```

**Pattern Rules:**
- **Even rows (0, 2, 4...)**: Travel Left-to-Right (L2R)
- **Odd rows (1, 3, 5...)**: Travel Right-to-Left (R2L)
- **Row transitions**: Connect end of current row to start of next row

## Distance-to-Coordinate Mapping

### Key Formula (in CanvasJourneyGrid.js)
```javascript
distanceToCoords(distance) {
  const cellIndex = Math.ceil(distance / this.KM_PER_CELL); // 1-based
  const row = Math.floor((cellIndex - 1) / this.CELLS_PER_ROW);
  const colInRow = (cellIndex - 1) % this.CELLS_PER_ROW;
  
  // Serpentine logic: reverse column for odd rows
  const col = (row % 2 === 0) ? colInRow : (this.CELLS_PER_ROW - 1 - colInRow);
  
  return {
    row,
    col,
    x: col * this.CELL_SIZE,
    y: row * this.CELL_SIZE,
    cellIndex
  };
}
```

### Distance Examples
| Distance | Cell Index | Row | Column | Direction | Position Description |
|----------|------------|-----|---------|-----------|-------------------|
| 0km      | 0          | 0   | 0       | L2R       | Start position |
| 20km     | 1          | 0   | 0       | L2R       | Row 0, Cell 1 |
| 40km     | 2          | 0   | 1       | L2R       | Row 0, Cell 2 |
| 100km    | 5          | 0   | 4       | L2R       | Row 0, Cell 5 (end) |
| 120km    | 6          | 1   | 4       | R2L       | Row 1, Cell 5 (start from right) |
| 140km    | 7          | 1   | 3       | R2L       | Row 1, Cell 4 |
| 200km    | 10         | 1   | 0       | R2L       | Row 1, Cell 1 (end) |
| 220km    | 11         | 2   | 0       | L2R       | Row 2, Cell 1 (start from left) |

## Node Addition Logic

### Original addNode Method (app.js)
The `addNode` method handles **cumulative distance calculation** properly:

```javascript
addNode: (tripDistance, data = {}) => {
  // 1. Calculate REAL cumulative distance for stats
  const lastRealDistance = lastNode ? (lastNode.data.realDistance || lastNode.distance) : 0;
  const realCumulativeDistance = lastRealDistance + tripDistance;

  // 2. Calculate VISUAL distance for grid placement
  const lastNodeCellIndex = lastNode ? Math.ceil(lastNode.distance / KM_PER_CELL) : 0;
  const cellJump = Math.ceil(tripDistance / KM_PER_CELL);
  const newCellIndex = lastNodeCellIndex + cellJump;
  
  // 3. Place in target cell (1km into cell range)
  let visualCumulativeDistance = 0;
  if (newCellIndex > 0) {
    visualCumulativeDistance = ((newCellIndex - 1) * KM_PER_CELL) + 1;
  }

  // 4. Update stats and milestones with REAL distance
  this.checkAndupdate(realCumulativeDistance);
}
```

### Key Principles
1. **Trip Distance**: Input represents the distance traveled since last node
2. **Real Distance**: Actual cumulative distance for statistics and milestones
3. **Visual Distance**: Distance used for grid positioning (snapped to cell boundaries)
4. **Cell Jumping**: Nodes jump by the appropriate number of cells based on trip distance

## U-Turn Connection Logic

### Connection Sides (CanvasJourneyGrid.js)
```javascript
getConnectionSides(fromNode, toNode) {
  if (fromRow === toRow) {
    // Same row - horizontal connection
    const isEvenRow = fromRow % 2 === 0;
    return isEvenRow ? 
      { fromSide: 'right', toSide: 'left' } :    // L2R: right → left
      { fromSide: 'left', toSide: 'right' };     // R2L: left → right
  } else {
    // Row transition - follow serpentine flow
    const fromIsEvenRow = fromRow % 2 === 0;
    return fromIsEvenRow ?
      { fromSide: 'right', toSide: 'left' } :    // Even: right → left (downward-right curve)
      { fromSide: 'left', toSide: 'right' };     // Odd: left → right (downward-left curve)
  }
}
```

### U-Turn Direction Rules
- **L2R → R2L**: Connect right side to left side (downward-right curve)
- **R2L → L2R**: Connect left side to right side (downward-left curve)
- **Same row**: Connect based on travel direction within row

## Pathfinding System

### Simple Geometric Curves (OrthogonalPathfinder.js)
The system uses **simple geometric curves** instead of complex A* pathfinding:

```javascript
createSimpleOrthogonalPath(startPoint, endPoint, fromSide, toSide) {
  // For right→left: create smooth downward-right curve
  if (fromSide === 'right' && toSide === 'left') {
    const extendX = Math.max(startPoint.x, endPoint.x) + curveRadius;
    // Creates smooth serpentine curve with multiple points
  }
  // For left→right: create smooth downward-left curve  
  if (fromSide === 'left' && toSide === 'right') {
    const extendX = Math.min(startPoint.x, endPoint.x) - curveRadius;
    // Creates smooth serpentine curve with multiple points
  }
}
```

## Common Troubleshooting

### Issue: Wrong U-Turn Direction
**Problem**: U-turns curve upward instead of downward
**Solution**: Check `getConnectionSides()` logic and ensure pathfinder creates downward curves

### Issue: Incorrect Distance Calculation
**Problem**: Stats show wrong cumulative distance
**Solution**: Ensure `checkAndupdate()` is called with **real cumulative distance**, not individual trip distances

### Issue: Nodes in Wrong Cells
**Problem**: Nodes don't land in expected grid cells
**Solution**: Verify `distanceToCoords()` mapping and `Math.ceil()` usage for cell index calculation

### Issue: Broken Serpentine Pattern
**Problem**: Nodes don't follow board game flow
**Solution**: Check row parity logic in `distanceToCoords()` - odd rows must reverse column calculation

## Testing Commands

### Basic Testing
```javascript
window.vroom.clear()
window.vroom.addNode(25)    // Should place in cell 2
window.vroom.addNode(75)    // Should jump to cell 5 (25+75=100km total)
window.vroom.addNode(25)    // Should start row 2 at cell 1 (125km total)
```

### Pattern Verification
```javascript
window.vroom.testCells()    // Shows distance-to-cell mapping
window.vroom.showStats()    // Shows grid statistics
```

## File Locations

### Core Logic Files
- **`src/ui/CanvasJourneyGrid.js`** - Main grid rendering and node placement
- **`src/ui/OrthogonalPathfinder.js`** - U-turn curve generation  
- **`src/app.js`** - Node addition logic and distance calculation
- **`src/core/TravelGrid.js`** - Data storage and retrieval

### Key Methods
- **`distanceToCoords()`** - Distance to grid position mapping
- **`addNode()`** - Node addition with cumulative distance tracking
- **`getConnectionSides()`** - U-turn direction determination
- **`createSimpleOrthogonalPath()`** - Curve path generation

## Visual Reference
See `road.png` for the expected serpentine curve pattern - smooth U-turns that flow naturally between rows following the board game pattern.

## Last Updated
Created during NodeComponent integration session - this documents the working system before any modifications.

---
**Note**: This logic was carefully developed and tested. Any changes to distance calculation or placement logic should be thoroughly tested to avoid breaking the cumulative distance tracking and board game pattern.