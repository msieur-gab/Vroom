/**
 * JourneyRoadDrawer - Two Dots style curved journey progression
 * Creates a winding path that connects photo locations organically
 */
export class JourneyRoadDrawer {
  constructor(container) {
    this.container = container;
    this.svgElement = null;
    this.paths = [];
    
    this.init();
  }
  
  init() {
    this.createSVG();
    console.log('🛣️ Journey road drawer initialized (Two Dots style)');
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
    
    // Get all nodes with their journey positions
    const journeyNodes = this.getJourneyNodes();
    
    if (journeyNodes.length < 2) {
      console.log('🛣️ Need at least 2 nodes for journey path');
      return;
    }
    
    // Create smooth curved path through all nodes
    const pathData = this.createSmoothJourneyPath(journeyNodes);
    this.drawJourneyPath(pathData);
    
    console.log(`🛣️ Drew journey path through ${journeyNodes.length} locations`);
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
   * Create smooth curved path through journey nodes
   * Uses quadratic Bezier curves for natural flow
   */
  createSmoothJourneyPath(nodes) {
    if (nodes.length < 2) return '';
    
    let pathData = `M ${nodes[0].x} ${nodes[0].y}`;
    
    if (nodes.length === 2) {
      // Simple curve between two points
      const midX = (nodes[0].x + nodes[1].x) / 2;
      const midY = (nodes[0].y + nodes[1].y) / 2;
      
      // Add some curve variation
      const offsetX = (Math.random() - 0.5) * 100;
      const offsetY = (Math.random() - 0.5) * 50;
      
      pathData += ` Q ${midX + offsetX} ${midY + offsetY} ${nodes[1].x} ${nodes[1].y}`;
    } else {
      // Smooth curves through multiple points
      for (let i = 1; i < nodes.length; i++) {
        const prev = nodes[i - 1];
        const curr = nodes[i];
        const next = nodes[i + 1];
        
        if (i === 1) {
          // First curve - start with control point
          const controlX = prev.x + (curr.x - prev.x) * 0.5;
          const controlY = prev.y + (curr.y - prev.y) * 0.5;
          
          // Add natural curve variation
          const curveOffset = this.getCurveOffset(prev, curr, i);
          
          pathData += ` Q ${controlX + curveOffset.x} ${controlY + curveOffset.y} ${curr.x} ${curr.y}`;
        } else if (i === nodes.length - 1) {
          // Last curve - end smoothly
          const controlX = prev.x + (curr.x - prev.x) * 0.5;
          const controlY = prev.y + (curr.y - prev.y) * 0.5;
          
          pathData += ` Q ${controlX} ${controlY} ${curr.x} ${curr.y}`;
        } else {
          // Middle curves - create flowing S-curves
          const controlX = prev.x + (curr.x - prev.x) * 0.6;
          const controlY = prev.y + (curr.y - prev.y) * 0.6;
          
          const curveOffset = this.getCurveOffset(prev, curr, i);
          
          pathData += ` Q ${controlX + curveOffset.x} ${controlY + curveOffset.y} ${curr.x} ${curr.y}`;
        }
      }
    }
    
    return pathData;
  }
  
  /**
   * Get curve offset for more natural, winding paths
   */
  getCurveOffset(fromNode, toNode, index) {
    // Create alternating left/right curves for natural flow
    const baseOffset = 40;
    const alternator = (index % 2 === 0) ? 1 : -1;
    
    // Calculate perpendicular offset for curve
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x: 0, y: 0 };
    
    // Perpendicular vector
    const perpX = -dy / length;
    const perpY = dx / length;
    
    // Scale offset based on distance (longer segments get more curve)
    const offsetMagnitude = Math.min(baseOffset, length * 0.3);
    
    return {
      x: perpX * offsetMagnitude * alternator,
      y: perpY * offsetMagnitude * alternator
    };
  }
  
  /**
   * Draw the journey path with road-like styling
   */
  drawJourneyPath(pathData) {
    if (!pathData) return;
    
    // Create background road stroke (wider, darker)
    const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bgPath.setAttribute('d', pathData);
    bgPath.setAttribute('stroke', '#8B4513'); // Brown road color
    bgPath.setAttribute('stroke-width', '8');
    bgPath.setAttribute('fill', 'none');
    bgPath.setAttribute('opacity', '0.6');
    bgPath.setAttribute('stroke-linecap', 'round');
    bgPath.setAttribute('stroke-linejoin', 'round');
    bgPath.classList.add('journey-road-bg');
    
    // Create foreground road stroke (thinner, lighter)
    const fgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    fgPath.setAttribute('d', pathData);
    fgPath.setAttribute('stroke', '#DEB887'); // Light brown/tan
    fgPath.setAttribute('stroke-width', '4');
    fgPath.setAttribute('fill', 'none');
    fgPath.setAttribute('opacity', '0.9');
    fgPath.setAttribute('stroke-linecap', 'round');
    fgPath.setAttribute('stroke-linejoin', 'round');
    fgPath.classList.add('journey-road-fg');
    
    // Add road dashes for more realistic look (optional)
    const dashPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    dashPath.setAttribute('d', pathData);
    dashPath.setAttribute('stroke', '#FFFFFF');
    dashPath.setAttribute('stroke-width', '1');
    dashPath.setAttribute('fill', 'none');
    dashPath.setAttribute('opacity', '0.7');
    dashPath.setAttribute('stroke-linecap', 'round');
    dashPath.setAttribute('stroke-dasharray', '8,12');
    dashPath.classList.add('journey-road-dash');
    
    this.svgElement.appendChild(bgPath);
    this.svgElement.appendChild(fgPath);
    this.svgElement.appendChild(dashPath);
    
    this.paths.push({ element: bgPath, id: 'road-bg' });
    this.paths.push({ element: fgPath, id: 'road-fg' });
    this.paths.push({ element: dashPath, id: 'road-dash' });
  }
  
  clearRoads() {
    this.paths.forEach(({ element }) => element.remove());
    this.paths = [];
  }
}