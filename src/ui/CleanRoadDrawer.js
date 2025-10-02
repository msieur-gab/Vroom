/**
 * CleanRoadDrawer - Fresh road drawing for journey progression
 * Connects nodes in distance order with smooth curves
 */
export class CleanRoadDrawer {
  constructor(container, journeyGrid) {
    this.container = container;
    this.journeyGrid = journeyGrid;
    this.svgElement = null;
    this.roadPaths = [];
    
    this.init();
  }
  
  init() {
    this.createSVG();
    console.log('🛣️ Clean road drawer initialized');
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
    
    const nodes = this.journeyGrid.getNodesByDistance();
    
    if (nodes.length < 2) {
      console.log('🛣️ Need at least 2 nodes to draw road');
      return;
    }
    
    console.log(`🛣️ Drawing road through ${nodes.length} nodes:`);
    nodes.forEach(node => {
      console.log(`  ${node.distance}km at (${node.coords.row}, ${node.coords.col})`);
    });
    
    // Get actual screen positions of nodes
    const screenPositions = nodes.map(node => {
      const rect = node.nodeElement.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      
      return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top,
        distance: node.distance
      };
    });
    
    // Create curved path connecting all nodes
    const pathData = this.createCurvedPath(screenPositions);
    this.drawRoadPath(pathData);
    
    console.log('✅ Road drawn successfully');
  }
  
  /**
   * Create curved path through all screen positions
   */
  createCurvedPath(positions) {
    if (positions.length < 2) return '';
    
    let path = `M ${positions[0].x} ${positions[0].y}`;
    
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      
      if (i === 1) {
        // First segment - simple curve
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        
        // Add slight curve offset
        const offsetX = (curr.y - prev.y) * 0.2;
        const offsetY = (prev.x - curr.x) * 0.2;
        
        path += ` Q ${midX + offsetX} ${midY + offsetY} ${curr.x} ${curr.y}`;
      } else {
        // Subsequent segments - smooth curves
        const controlPoint = this.getControlPoint(prev, curr, i);
        path += ` Q ${controlPoint.x} ${controlPoint.y} ${curr.x} ${curr.y}`;
      }
    }
    
    return path;
  }
  
  /**
   * Calculate control point for smooth curves
   */
  getControlPoint(fromPos, toPos, segmentIndex) {
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;
    
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { x: midX, y: midY };
    
    // Perpendicular offset for curve
    const perpX = -dy / distance;
    const perpY = dx / distance;
    
    // Curve intensity
    const offset = Math.min(30, distance * 0.25);
    
    // Alternate curve direction
    const direction = (segmentIndex % 2 === 0) ? 1 : -1;
    
    return {
      x: midX + perpX * offset * direction,
      y: midY + perpY * offset * direction
    };
  }
  
  /**
   * Draw the actual road path
   */
  drawRoadPath(pathData) {
    if (!pathData) return;
    
    // Road shadow
    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shadow.setAttribute('d', pathData);
    shadow.setAttribute('stroke', '#333');
    shadow.setAttribute('stroke-width', '8');
    shadow.setAttribute('fill', 'none');
    shadow.setAttribute('opacity', '0.2');
    shadow.setAttribute('stroke-linecap', 'round');
    shadow.setAttribute('stroke-linejoin', 'round');
    
    // Main road
    const road = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    road.setAttribute('d', pathData);
    road.setAttribute('stroke', '#666');
    road.setAttribute('stroke-width', '6');
    road.setAttribute('fill', 'none');
    road.setAttribute('opacity', '0.7');
    road.setAttribute('stroke-linecap', 'round');
    road.setAttribute('stroke-linejoin', 'round');
    
    // Center line
    const centerLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    centerLine.setAttribute('d', pathData);
    centerLine.setAttribute('stroke', '#FFF');
    centerLine.setAttribute('stroke-width', '2');
    centerLine.setAttribute('fill', 'none');
    centerLine.setAttribute('opacity', '0.8');
    centerLine.setAttribute('stroke-linecap', 'round');
    centerLine.setAttribute('stroke-dasharray', '5,5');
    
    this.svgElement.appendChild(shadow);
    this.svgElement.appendChild(road);
    this.svgElement.appendChild(centerLine);
    
    this.roadPaths.push(shadow, road, centerLine);
  }
  
  clearRoads() {
    this.roadPaths.forEach(path => path.remove());
    this.roadPaths = [];
  }
}