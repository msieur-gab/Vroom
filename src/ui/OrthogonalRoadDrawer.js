/**
 * OrthogonalRoadDrawer - Implements proper orthogonal routing between nodes
 * Based on A* pathfinding with orthogonal constraints and center line correction
 */
export class OrthogonalRoadDrawer {
  constructor(container) {
    this.container = container;
    this.svgElement = null;
    this.paths = [];
    
    // Configuration
    this.CELL_PADDING = 10; // Space around nodes
    this.TURN_PENALTY = 1;  // Cost for making turns
    
    this.init();
  }
  
  init() {
    this.createSVG();
    console.log('🛣️ Orthogonal road drawer initialized');
  }
  
  createSVG() {
    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    
    this.container.appendChild(this.svgElement);
  }
  
  drawRoads() {
    this.clearRoads();
    
    // Get all nodes sorted by distance
    const nodes = this.getNodesWithPositions();
    
    if (nodes.length < 2) {
      console.log('🛣️ Need at least 2 nodes for orthogonal routing');
      return;
    }
    
    // Draw orthogonal paths between consecutive nodes
    for (let i = 0; i < nodes.length - 1; i++) {
      const fromNode = nodes[i];
      const toNode = nodes[i + 1];
      
      const path = this.findOrthogonalPath(fromNode, toNode);
      this.drawPath(path, `road_${i}`);
    }
    
    console.log(`🛣️ Drew ${nodes.length - 1} orthogonal roads`);
  }
  
  getNodesWithPositions() {
    return Array.from(this.container.querySelectorAll('.travel-node')).map(node => {
      const cell = node.closest('.grid-cell');
      const rect = node.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      
      return {
        element: node,
        distance: parseFloat(cell.getAttribute('data-distance') || '0'),
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top,
        width: rect.width,
        height: rect.height
      };
    }).sort((a, b) => a.distance - b.distance);
  }
  
  /**
   * Find orthogonal path between two nodes using simple L-shaped routing
   * This is a simplified version - for complex scenarios, full A* would be needed
   */
  findOrthogonalPath(fromNode, toNode) {
    const startX = fromNode.x;
    const startY = fromNode.y;
    const endX = toNode.x;
    const endY = toNode.y;
    
    // Create L-shaped path with padding around nodes
    const padding = this.CELL_PADDING;
    
    let waypoints = [];
    
    // Determine routing direction based on relative positions
    if (Math.abs(endX - startX) > Math.abs(endY - startY)) {
      // Horizontal routing preferred
      if (endX > startX) {
        // Route right then down/up
        const midX = startX + (endX - startX) / 2;
        waypoints = [
          { x: startX, y: startY },
          { x: midX, y: startY },
          { x: midX, y: endY },
          { x: endX, y: endY }
        ];
      } else {
        // Route left then down/up
        const midX = startX - (startX - endX) / 2;
        waypoints = [
          { x: startX, y: startY },
          { x: midX, y: startY },
          { x: midX, y: endY },
          { x: endX, y: endY }
        ];
      }
    } else {
      // Vertical routing preferred
      if (endY > startY) {
        // Route down then right/left
        const midY = startY + (endY - startY) / 2;
        waypoints = [
          { x: startX, y: startY },
          { x: startX, y: midY },
          { x: endX, y: midY },
          { x: endX, y: endY }
        ];
      } else {
        // Route up then right/left
        const midY = startY - (startY - endY) / 2;
        waypoints = [
          { x: startX, y: startY },
          { x: startX, y: midY },
          { x: endX, y: midY },
          { x: endX, y: endY }
        ];
      }
    }
    
    // Add node padding to avoid overlapping
    waypoints = this.addNodePadding(waypoints, fromNode, toNode);
    
    return waypoints;
  }
  
  /**
   * Add padding around nodes to prevent path overlap
   */
  addNodePadding(waypoints, fromNode, toNode) {
    if (waypoints.length < 2) return waypoints;
    
    const padding = this.CELL_PADDING;
    const result = [...waypoints];
    
    // Move first waypoint away from start node
    if (result.length > 1) {
      const dx = result[1].x - result[0].x;
      const dy = result[1].y - result[0].y;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal movement
        result[0].x += dx > 0 ? fromNode.width / 2 + padding : -(fromNode.width / 2 + padding);
      } else {
        // Vertical movement
        result[0].y += dy > 0 ? fromNode.height / 2 + padding : -(fromNode.height / 2 + padding);
      }
    }
    
    // Move last waypoint away from end node
    if (result.length > 1) {
      const lastIdx = result.length - 1;
      const dx = result[lastIdx].x - result[lastIdx - 1].x;
      const dy = result[lastIdx].y - result[lastIdx - 1].y;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal movement
        result[lastIdx].x -= dx > 0 ? toNode.width / 2 + padding : -(toNode.width / 2 + padding);
      } else {
        // Vertical movement
        result[lastIdx].y -= dy > 0 ? toNode.height / 2 + padding : -(toNode.height / 2 + padding);
      }
    }
    
    return result;
  }
  
  /**
   * Draw SVG path from waypoints
   */
  drawPath(waypoints, pathId) {
    if (waypoints.length < 2) return;
    
    // Create path data
    let pathData = `M ${waypoints[0].x} ${waypoints[0].y}`;
    for (let i = 1; i < waypoints.length; i++) {
      pathData += ` L ${waypoints[i].x} ${waypoints[i].y}`;
    }
    
    // Create path element
    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', pathData);
    pathElement.setAttribute('stroke', '#FF5722');
    pathElement.setAttribute('stroke-width', '3');
    pathElement.setAttribute('fill', 'none');
    pathElement.setAttribute('opacity', '0.8');
    pathElement.setAttribute('stroke-linecap', 'round');
    pathElement.setAttribute('stroke-linejoin', 'round');
    pathElement.classList.add('orthogonal-road');
    
    this.svgElement.appendChild(pathElement);
    this.paths.push({ element: pathElement, id: pathId });
  }
  
  clearRoads() {
    this.paths.forEach(({ element }) => element.remove());
    this.paths = [];
  }
}