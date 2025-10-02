/**
 * JourneyProgressionDrawer - Draws roads connecting nodes in journey progression order
 * Creates a winding path through the grid following distance-based cell placement
 */
export class JourneyProgressionDrawer {
  constructor(container) {
    this.container = container;
    this.svgElement = null;
    this.roadPaths = [];
    
    this.init();
  }
  
  init() {
    this.createSVG();
    console.log('🛣️ Journey progression drawer initialized');
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
    
    // Get all nodes sorted by distance (journey progression order)
    const journeyNodes = this.getJourneyNodes();
    
    if (journeyNodes.length < 2) {
      console.log('🛣️ Need at least 2 nodes for journey progression');
      return;
    }
    
    console.log(`🛣️ Drawing journey progression through ${journeyNodes.length} nodes:`);
    journeyNodes.forEach((node, i) => {
      console.log(`  ${i}: ${node.distance}km at (${node.x}, ${node.y})`);
    });
    
    // Create smooth path connecting all nodes in distance order
    const pathData = this.createJourneyPath(journeyNodes);
    this.drawJourneyRoad(pathData);
    
    console.log(`✅ Drew journey progression road`);
  }
  
  getJourneyNodes() {
    return Array.from(this.container.querySelectorAll('.travel-node')).map(node => {
      const cell = node.closest('.grid-cell');
      const rect = node.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      
      return {
        element: node,
        distance: parseFloat(cell.getAttribute('data-distance') || '0'),
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
      };
    }).sort((a, b) => a.distance - b.distance);
  }
  
  /**
   * Create journey path with smooth curves connecting nodes
   * This creates the winding road effect like Two Dots progression
   */
  createJourneyPath(nodes) {
    if (nodes.length < 2) return '';
    
    let pathData = `M ${nodes[0].x} ${nodes[0].y}`;
    
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      
      // Calculate smooth curve between consecutive nodes
      const controlPoint = this.getControlPoint(prev, curr, i);
      
      // Use quadratic Bezier curve for smooth connection
      pathData += ` Q ${controlPoint.x} ${controlPoint.y} ${curr.x} ${curr.y}`;
    }
    
    return pathData;
  }
  
  /**
   * Calculate control point for smooth curve between two nodes
   * Creates natural-looking road curves
   */
  getControlPoint(fromNode, toNode, segmentIndex) {
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    
    // Calculate the direction vector
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      return { x: midX, y: midY };
    }
    
    // Create perpendicular vector for curve offset
    const perpX = -dy / distance;
    const perpY = dx / distance;
    
    // Curve intensity based on distance and segment
    const baseOffset = Math.min(40, distance * 0.2);
    
    // Alternate curve direction for natural flow (like Two Dots)
    const curveDirection = (segmentIndex % 2 === 0) ? 1 : -1;
    
    // Add some variation for more natural curves
    const variation = (segmentIndex % 3) * 0.3;
    
    return {
      x: midX + (perpX * baseOffset * curveDirection * (1 + variation)),
      y: midY + (perpY * baseOffset * curveDirection * (1 + variation))
    };
  }
  
  /**
   * Draw the journey road with proper styling
   */
  drawJourneyRoad(pathData) {
    if (!pathData) return;
    
    // Create multi-layer road for realistic appearance
    
    // Background shadow/outline
    const shadowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shadowPath.setAttribute('d', pathData);
    shadowPath.setAttribute('stroke', '#654321');
    shadowPath.setAttribute('stroke-width', '12');
    shadowPath.setAttribute('fill', 'none');
    shadowPath.setAttribute('opacity', '0.3');
    shadowPath.setAttribute('stroke-linecap', 'round');
    shadowPath.setAttribute('stroke-linejoin', 'round');
    
    // Main road surface
    const roadPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    roadPath.setAttribute('d', pathData);
    roadPath.setAttribute('stroke', '#8B7355');
    roadPath.setAttribute('stroke-width', '8');
    roadPath.setAttribute('fill', 'none');
    roadPath.setAttribute('opacity', '0.8');
    roadPath.setAttribute('stroke-linecap', 'round');
    roadPath.setAttribute('stroke-linejoin', 'round');
    
    // Center line
    const centerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    centerPath.setAttribute('d', pathData);
    centerPath.setAttribute('stroke', '#F5F5DC');
    centerPath.setAttribute('stroke-width', '2');
    centerPath.setAttribute('fill', 'none');
    centerPath.setAttribute('opacity', '0.9');
    centerPath.setAttribute('stroke-linecap', 'round');
    centerPath.setAttribute('stroke-dasharray', '6,8');
    
    // Add all layers to SVG
    this.svgElement.appendChild(shadowPath);
    this.svgElement.appendChild(roadPath);
    this.svgElement.appendChild(centerPath);
    
    // Store references
    this.roadPaths.push(
      { element: shadowPath, type: 'shadow' },
      { element: roadPath, type: 'surface' },
      { element: centerPath, type: 'centerline' }
    );
  }
  
  clearRoads() {
    this.roadPaths.forEach(({ element }) => element.remove());
    this.roadPaths = [];
  }
}