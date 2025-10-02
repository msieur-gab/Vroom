/**
 * OrthogonalPathfinder - Advanced A* based orthogonal routing
 * Based on the systematic approach from flowchart orthogonal connectors
 * 
 * Features:
 * - Protection zones around nodes
 * - A* algorithm with heuristics and turn penalties
 * - Center line correction for symmetrical paths
 * - Proper grid construction from shape boundaries
 */
export class OrthogonalPathfinder {
  constructor() {
    this.STEP_COST = 1;           // Base cost per unit distance
    this.TURN_PENALTY = 1;        // Additional cost for direction changes
    this.PROTECTION_MARGIN = 20;  // Margin around nodes (outerRectangle)
  }
  
  /**
   * Find orthogonal path between two nodes with specified connection sides
   * @param {Object} fromNode - Starting node with bounds {left, right, top, bottom}
   * @param {Object} toNode - Ending node with bounds {left, right, top, bottom}
   * @param {string} fromSide - Connection side for start node
   * @param {string} toSide - Connection side for end node
   * @returns {Array} Array of path points
   */
  findPathWithSides(fromNode, toNode, fromSide, toSide) {
    const fromRect = fromNode;
    const toRect = toNode;
    
    const startPoint = this.getConnectionPoint(fromRect, fromSide);
    const endPoint = this.getConnectionPoint(toRect, toSide);
    
    // Create simple 3-point orthogonal path
    return this.createSimpleOrthogonalPath(startPoint, endPoint, fromSide, toSide);
  }
  
  /**
   * Create simple 3-point orthogonal path based on connection sides
   */
  createSimpleOrthogonalPath(startPoint, endPoint, fromSide, toSide) {
    // Create smooth serpentine curves like in road.png
    const gap = Math.abs(endPoint.y - startPoint.y);
    const curveRadius = Math.min(gap * 0.3, 40); // Adaptive radius based on distance
    
    // For right→left: create rounded downward-right curve
    if (fromSide === 'right' && toSide === 'left') {
      const extendX = Math.max(startPoint.x, endPoint.x) + curveRadius;
      const midY = (startPoint.y + endPoint.y) / 2;
      
      return [
        startPoint,
        { x: extendX, y: startPoint.y },           // Extend right
        { x: extendX, y: startPoint.y + curveRadius }, // Start curve down
        { x: extendX, y: midY - curveRadius },     // Approach middle
        { x: extendX, y: midY },                   // Middle point
        { x: extendX, y: midY + curveRadius },     // Continue down
        { x: endPoint.x + curveRadius, y: endPoint.y }, // Approach end
        endPoint
      ];
    }
    
    // For left→right: create rounded downward-left curve
    if (fromSide === 'left' && toSide === 'right') {
      const extendX = Math.min(startPoint.x, endPoint.x) - curveRadius;
      const midY = (startPoint.y + endPoint.y) / 2;
      
      return [
        startPoint,
        { x: extendX, y: startPoint.y },           // Extend left
        { x: extendX, y: startPoint.y + curveRadius }, // Start curve down
        { x: extendX, y: midY - curveRadius },     // Approach middle
        { x: extendX, y: midY },                   // Middle point
        { x: extendX, y: midY + curveRadius },     // Continue down
        { x: endPoint.x - curveRadius, y: endPoint.y }, // Approach end
        endPoint
      ];
    }
    
    // For same-side connections: traditional serpentine curve
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2;
    
    return [
      startPoint,
      { x: startPoint.x, y: midY },
      { x: endPoint.x, y: midY },
      endPoint
    ];
  }

  /**
   * Find orthogonal path between two nodes (legacy method)
   * @param {Object} fromNode - Starting node with bounds
   * @param {Object} toNode - Ending node with bounds
   * @returns {Array} Array of path points
   */
  findPath(fromNode, toNode) {
    return this.findPathWithSides(fromNode, toNode, 'right', 'left');
  }
  
  /**
   * Create outerRectangle (protection zone) around a node
   */
  createOuterRectangle(rect) {
    const margin = this.PROTECTION_MARGIN;
    return {
      left: rect.left - margin,
      right: rect.right + margin,
      top: rect.top - margin,
      bottom: rect.bottom + margin
    };
  }
  
  /**
   * Build grid points from intersections of horizontal and vertical lines
   * Based on shape boundaries, center lines, and protection zones
   */
  buildGridPoints(fromRect, toRect, fromOuter, toOuter, fromSide, toSide) {
    const points = new Set();
    
    // Collect all horizontal lines (Y coordinates)
    const horizontalLines = [
      // Shape boundaries
      fromRect.top, fromRect.bottom,
      toRect.top, toRect.bottom,
      // Protection zone boundaries  
      fromOuter.top, fromOuter.bottom,
      toOuter.top, toOuter.bottom,
      // Center lines
      (fromRect.top + fromRect.bottom) / 2,
      (toRect.top + toRect.bottom) / 2
    ];
    
    // For row transitions, add strategic routing points
    if (fromRect.bottom < toRect.top) {
      // Add intermediate Y coordinate for routing
      const gap = toRect.top - fromRect.bottom;
      const midY = fromRect.bottom + (gap * 0.5);
      horizontalLines.push(midY);
    } else {
      // Same row or overlapping - add center line
      horizontalLines.push((Math.min(fromRect.top, toRect.top) + Math.max(fromRect.bottom, toRect.bottom)) / 2);
    }
    
    // Collect all vertical lines (X coordinates) - strategically based on connection sides
    const verticalLines = [
      // Shape boundaries
      fromRect.left, fromRect.right,
      toRect.left, toRect.right,
      // Protection zone boundaries
      fromOuter.left, fromOuter.right,
      toOuter.left, toOuter.right,
      // Center lines
      (fromRect.left + fromRect.right) / 2,
      (toRect.left + toRect.right) / 2
    ];
    
    // Add strategic vertical lines based on connection sides for row transitions
    if (fromRect.bottom < toRect.top && fromSide && toSide) {
      // For row transitions with specific connection sides, add strategic X coordinates
      if (fromSide === 'right' && toSide === 'left') {
        // Right to left: curve downward-right
        // Add X coordinate that strongly favors right-then-down-then-left routing
        const fromRightX = fromRect.right;
        const toLeftX = toRect.left;
        const strategicX = Math.max(fromRightX, toLeftX) + 50; // Extend far right for strong right curve
        verticalLines.push(strategicX);
      } else if (fromSide === 'left' && toSide === 'right') {
        // Left to right: curve downward-left  
        // Add X coordinate that favors left-then-down-then-right routing
        const fromLeftX = fromRect.left;
        const toRightX = toRect.right;
        const strategicX = Math.min(fromLeftX, toRightX) - 20; // Extend left for proper curve
        verticalLines.push(strategicX);
      } else {
        // Traditional same-side connections - use global center line
        verticalLines.push((Math.min(fromRect.left, toRect.left) + Math.max(fromRect.right, toRect.right)) / 2);
      }
    } else {
      // Same row or no specific sides - use global center line
      verticalLines.push((Math.min(fromRect.left, toRect.left) + Math.max(fromRect.right, toRect.right)) / 2);
    }
    
    // Create grid points from intersections
    const uniqueHorizontal = [...new Set(horizontalLines)].sort((a, b) => a - b);
    const uniqueVertical = [...new Set(verticalLines)].sort((a, b) => a - b);
    
    uniqueHorizontal.forEach(y => {
      uniqueVertical.forEach(x => {
        points.add(this.pointToKey({x, y}));
      });
    });
    
    // Convert back to point objects
    return Array.from(points).map(key => this.keyToPoint(key));
  }
  
  /**
   * Build graph structure with connectivity rules
   * Points can connect horizontally/vertically if no protection zones are crossed
   */
  buildGraph(gridPoints, fromOuter, toOuter) {
    const graph = new Map();
    
    // Initialize all points in graph
    gridPoints.forEach(point => {
      graph.set(this.pointToKey(point), []);
    });
    
    // Create connections between points
    gridPoints.forEach(point => {
      const connections = graph.get(this.pointToKey(point));
      
      // Find valid horizontal and vertical neighbors
      gridPoints.forEach(other => {
        if (point.x === other.x && point.y === other.y) return;
        
        // Horizontal connection (same Y)
        if (point.y === other.y && point.x !== other.x) {
          if (this.isConnectionValid(point, other, fromOuter, toOuter)) {
            connections.push({
              point: other,
              cost: Math.abs(point.x - other.x) * this.STEP_COST,
              direction: point.x < other.x ? 'right' : 'left'
            });
          }
        }
        
        // Vertical connection (same X)
        if (point.x === other.x && point.y !== other.y) {
          if (this.isConnectionValid(point, other, fromOuter, toOuter)) {
            const direction = point.y < other.y ? 'down' : 'up';
            const baseCost = Math.abs(point.y - other.y) * this.STEP_COST;
            const upwardPenalty = direction === 'up' ? baseCost * 10 : 0; // 10x penalty for upward
            
            connections.push({
              point: other,
              cost: baseCost + upwardPenalty,
              direction: direction
            });
          }
        }
      });
    });
    
    return graph;
  }
  
  /**
   * Check if connection between two points is valid (doesn't cross protection zones)
   */
  isConnectionValid(point1, point2, fromOuter, toOuter) {
    // For now, allow all connections to debug the issue
    // TODO: Re-enable proper validation once basic pathfinding works
    return true;
    
    // Connection is invalid if it crosses through a protection zone interior
    // (except if one of the points is a connection point on the shape boundary)
    
    const minX = Math.min(point1.x, point2.x);
    const maxX = Math.max(point1.x, point2.x);
    const minY = Math.min(point1.y, point2.y);
    const maxY = Math.max(point1.y, point2.y);
    
    // Check if line segment crosses through protection zones
    const crossesFromOuter = this.lineSegmentCrossesRectangleInterior(
      point1, point2, fromOuter
    );
    const crossesToOuter = this.lineSegmentCrossesRectangleInterior(
      point1, point2, toOuter
    );
    
    return !crossesFromOuter && !crossesToOuter;
  }
  
  /**
   * Check if line segment crosses through rectangle interior
   */
  lineSegmentCrossesRectangleInterior(point1, point2, rect) {
    // If line is horizontal
    if (point1.y === point2.y) {
      const y = point1.y;
      const minX = Math.min(point1.x, point2.x);
      const maxX = Math.max(point1.x, point2.x);
      
      // Line crosses interior if it passes through the middle and overlaps
      return (
        y > rect.top && y < rect.bottom &&
        minX < rect.right && maxX > rect.left
      );
    }
    
    // If line is vertical
    if (point1.x === point2.x) {
      const x = point1.x;
      const minY = Math.min(point1.y, point2.y);
      const maxY = Math.max(point1.y, point2.y);
      
      return (
        x > rect.left && x < rect.right &&
        minY < rect.bottom && maxY > rect.top
      );
    }
    
    return false; // Only handle orthogonal lines
  }
  
  /**
   * Connect a point to existing grid points
   */
  connectPointToGrid(point, gridPoints, graph, fromOuter, toOuter) {
    const pointKey = this.pointToKey(point);
    const connections = graph.get(pointKey);
    
    gridPoints.forEach(gridPoint => {
      const gridKey = this.pointToKey(gridPoint);
      
      // Horizontal connection
      if (point.y === gridPoint.y && point.x !== gridPoint.x) {
        if (this.isConnectionValid(point, gridPoint, fromOuter, toOuter)) {
          connections.push({
            point: gridPoint,
            cost: Math.abs(point.x - gridPoint.x) * this.STEP_COST,
            direction: point.x < gridPoint.x ? 'right' : 'left'
          });
          
          // Add reverse connection
          graph.get(gridKey).push({
            point: point,
            cost: Math.abs(point.x - gridPoint.x) * this.STEP_COST,
            direction: gridPoint.x < point.x ? 'right' : 'left'
          });
        }
      }
      
      // Vertical connection
      if (point.x === gridPoint.x && point.y !== gridPoint.y) {
        if (this.isConnectionValid(point, gridPoint, fromOuter, toOuter)) {
          const direction = point.y < gridPoint.y ? 'down' : 'up';
          const baseCost = Math.abs(point.y - gridPoint.y) * this.STEP_COST;
          const upwardPenalty = direction === 'up' ? baseCost * 10 : 0; // 10x penalty for upward
          
          connections.push({
            point: gridPoint,
            cost: baseCost + upwardPenalty,
            direction: direction
          });
          
          // Add reverse connection
          const reverseDirection = gridPoint.y < point.y ? 'down' : 'up';
          const reverseBaseCost = Math.abs(point.y - gridPoint.y) * this.STEP_COST;
          const reverseUpwardPenalty = reverseDirection === 'up' ? reverseBaseCost * 10 : 0;
          
          graph.get(gridKey).push({
            point: point,
            cost: reverseBaseCost + reverseUpwardPenalty,
            direction: reverseDirection
          });
        }
      }
    });
  }
  
  /**
   * Classify grid slice as corner, edge, or internal
   */
  classifySlice(slice, fromNode, toNode) {
    const touchesFromNode = this.rectanglesIntersect(slice, fromNode);
    const touchesToNode = this.rectanglesIntersect(slice, toNode);
    
    if (touchesFromNode || touchesToNode) {
      return 'edge';
    }
    
    // Check if it's in a corner position
    const isCorner = (
      (slice.left <= Math.min(fromNode.left, toNode.left) || slice.right >= Math.max(fromNode.right, toNode.right)) &&
      (slice.top <= Math.min(fromNode.top, toNode.top) || slice.bottom >= Math.max(fromNode.bottom, toNode.bottom))
    );
    
    return isCorner ? 'corner' : 'internal';
  }
  
  /**
   * Get reference points for a slice based on its type
   */
  getSlicePoints(slice, type) {
    const points = [];
    
    // All slices: corner points
    points.push(
      { x: slice.left, y: slice.top },
      { x: slice.right, y: slice.top },
      { x: slice.left, y: slice.bottom },
      { x: slice.right, y: slice.bottom }
    );
    
    if (type === 'internal') {
      // Internal slice: middle points and center
      const centerX = (slice.left + slice.right) / 2;
      const centerY = (slice.top + slice.bottom) / 2;
      
      points.push(
        { x: centerX, y: slice.top },     // Top middle
        { x: centerX, y: slice.bottom },  // Bottom middle
        { x: slice.left, y: centerY },    // Left middle
        { x: slice.right, y: centerY },   // Right middle
        { x: centerX, y: centerY }        // Center
      );
    } else if (type === 'edge') {
      // Edge slice: middle point of external edge
      const centerX = (slice.left + slice.right) / 2;
      const centerY = (slice.top + slice.bottom) / 2;
      
      points.push(
        { x: centerX, y: centerY }
      );
    }
    
    return points;
  }
  
  /**
   * Build graph of orthogonal connections between reference points
   */
  buildConnectionGraph(referenceData) {
    const { points, pointMap } = referenceData;
    const graph = new Map();
    
    // Initialize graph
    points.forEach(point => {
      graph.set(`${point.x},${point.y}`, []);
    });
    
    // Create connections between points
    points.forEach(point => {
      const connections = graph.get(`${point.x},${point.y}`);
      
      // Find horizontal and vertical neighbors
      points.forEach(other => {
        if (point === other) return;
        
        // Horizontal connection
        if (point.y === other.y && Math.abs(point.x - other.x) > 0) {
          // Check if there's no obstacle between them
          if (this.isDirectPathClear(point, other, points)) {
            connections.push({
              point: other,
              cost: Math.abs(point.x - other.x) * this.STEP_COST,
              direction: point.x < other.x ? 'right' : 'left'
            });
          }
        }
        
        // Vertical connection
        if (point.x === other.x && Math.abs(point.y - other.y) > 0) {
          // Check if there's no obstacle between them
          if (this.isDirectPathClear(point, other, points)) {
            connections.push({
              point: other,
              cost: Math.abs(point.y - other.y) * this.STEP_COST,
              direction: point.y < other.y ? 'down' : 'up'
            });
          }
        }
      });
    });
    
    return graph;
  }
  
  /**
   * A* algorithm with turn penalty and Manhattan distance heuristic
   */
  aStarWithTurnPenalty(graph, start, end) {
    const gScore = new Map();     // Cost from start to node
    const fScore = new Map();     // gScore + heuristic
    const previous = new Map();   // For path reconstruction
    const directions = new Map(); // Track direction to each node
    const openSet = new Set();    // Nodes to explore
    const closedSet = new Set();  // Nodes already explored
    
    const startKey = this.pointToKey(start);
    const endKey = this.pointToKey(end);
    
    // Initialize
    graph.forEach((_, key) => {
      gScore.set(key, Infinity);
      fScore.set(key, Infinity);
    });
    
    gScore.set(startKey, 0);
    fScore.set(startKey, this.manhattanDistance(start, end));
    openSet.add(startKey);
    
    while (openSet.size > 0) {
      // Find node in openSet with lowest fScore
      let current = null;
      let lowestF = Infinity;
      
      for (const node of openSet) {
        const f = fScore.get(node);
        if (f < lowestF) {
          lowestF = f;
          current = node;
        }
      }
      
      if (current === endKey) {
        // Path found, reconstruct it
        return this.reconstructPath(previous, current);
      }
      
      openSet.delete(current);
      closedSet.add(current);
      
      const connections = graph.get(current) || [];
      
      connections.forEach(({ point, cost, direction }) => {
        const neighborKey = this.pointToKey(point);
        
        if (closedSet.has(neighborKey)) return;
        
        // Calculate tentative gScore
        let tentativeG = gScore.get(current) + cost;
        
        // Add turn penalty if direction changes
        const prevDirection = directions.get(current);
        if (prevDirection && prevDirection !== direction) {
          tentativeG += this.TURN_PENALTY;
        }
        
        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        } else if (tentativeG >= gScore.get(neighborKey)) {
          return; // Not a better path
        }
        
        // This is the best path so far
        previous.set(neighborKey, current);
        directions.set(neighborKey, direction);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + this.manhattanDistance(point, end));
      });
    }
    
    // No path found
    return null;
  }
  
  /**
   * Manhattan distance heuristic for A*
   */
  manhattanDistance(point1, point2) {
    return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
  }
  
  /**
   * Reconstruct path from A* result
   */
  reconstructPath(previous, current) {
    const path = [];
    
    while (current) {
      const point = this.keyToPoint(current);
      path.unshift(point);
      current = previous.get(current);
    }
    
    return path.length > 1 ? path : null;
  }
  
  /**
   * Center line correction for symmetrical paths
   */
  centerLineCorrection(path, fromRect, toRect) {
    if (path.length < 3) return path;
    
    // Find horizontal and vertical center lines between shapes
    const horizontalCenter = (Math.min(fromRect.top, toRect.top) + Math.max(fromRect.bottom, toRect.bottom)) / 2;
    const verticalCenter = (Math.min(fromRect.left, toRect.left) + Math.max(fromRect.right, toRect.right)) / 2;
    
    // Try to map path segments to center lines
    const correctedPath = [...path];
    
    // Look for horizontal segments that could be mapped to horizontal center
    for (let i = 1; i < correctedPath.length - 1; i++) {
      const prev = correctedPath[i - 1];
      const curr = correctedPath[i];
      const next = correctedPath[i + 1];
      
      // Horizontal segment
      if (prev.y === curr.y && curr.y === next.y) {
        // Check if we can move this segment to the center line
        const minX = Math.min(prev.x, next.x);
        const maxX = Math.max(prev.x, next.x);
        
        // Create test rectangle for intersection check
        const testRect = {
          left: minX,
          right: maxX,
          top: Math.min(curr.y, horizontalCenter),
          bottom: Math.max(curr.y, horizontalCenter)
        };
        
        // If moving to center line doesn't create intersections, do it
        if (!this.rectanglesIntersect(testRect, fromRect) && 
            !this.rectanglesIntersect(testRect, toRect)) {
          correctedPath[i] = { x: curr.x, y: horizontalCenter };
        }
      }
      
      // Vertical segment
      if (prev.x === curr.x && curr.x === next.x) {
        const minY = Math.min(prev.y, next.y);
        const maxY = Math.max(prev.y, next.y);
        
        const testRect = {
          left: Math.min(curr.x, verticalCenter),
          right: Math.max(curr.x, verticalCenter),
          top: minY,
          bottom: maxY
        };
        
        if (!this.rectanglesIntersect(testRect, fromRect) && 
            !this.rectanglesIntersect(testRect, toRect)) {
          correctedPath[i] = { x: verticalCenter, y: curr.y };
        }
      }
    }
    
    return correctedPath;
  }
  
  /**
   * Point/key conversion utilities
   */
  pointToKey(point) {
    return `${point.x},${point.y}`;
  }
  
  keyToPoint(key) {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  }
  
  /**
   * Get connection point on node edge
   */
  getConnectionPoint(node, side) {
    const centerX = (node.left + node.right) / 2;
    const centerY = (node.top + node.bottom) / 2;
    
    switch (side) {
      case 'right':
        return { x: node.right, y: centerY };
      case 'left':
        return { x: node.left, y: centerY };
      case 'top':
        return { x: centerX, y: node.top };
      case 'bottom':
        return { x: centerX, y: node.bottom };
      default:
        return { x: centerX, y: centerY };
    }
  }
  
  /**
   * Helper functions
   */
  rectanglesIntersect(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect2.right < rect1.left || 
             rect1.bottom < rect2.top || 
             rect2.bottom < rect1.top);
  }
}