/**
 * SimpleRoadDrawer - Basic SVG line drawing between nodes
 */
export class SimpleRoadDrawer {
  constructor(container) {
    this.container = container;
    this.svgElement = null;
    this.lines = [];
    
    this.init();
  }
  
  init() {
    this.createSVG();
    console.log('🛣️ Simple road drawer initialized');
  }
  
  createSVG() {
    // Create SVG element
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
    
    // Add SVG to container
    this.container.appendChild(this.svgElement);
  }
  
  drawRoads() {
    // Clear existing lines
    this.clearRoads();
    
    // Get all nodes, sorted by distance
    const nodes = Array.from(this.container.querySelectorAll('.travel-node')).map(node => {
      const cell = node.closest('.grid-cell');
      return {
        element: node,
        distance: parseFloat(cell.getAttribute('data-distance') || '0')
      };
    }).sort((a, b) => a.distance - b.distance);
    
    if (nodes.length < 2) {
      console.log('🛣️ Need at least 2 nodes to draw roads');
      return;
    }
    
    // Draw lines between consecutive nodes
    for (let i = 0; i < nodes.length - 1; i++) {
      this.drawLine(nodes[i].element, nodes[i + 1].element);
    }
    
    console.log(`🛣️ Drew ${nodes.length - 1} roads`);
  }
  
  drawLine(fromElement, toElement) {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    // Calculate positions relative to container
    const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
    const x2 = toRect.left + toRect.width / 2 - containerRect.left;
    const y2 = toRect.top + toRect.height / 2 - containerRect.top;
    
    // Create line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#FF5722');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('opacity', '0.8');
    
    this.svgElement.appendChild(line);
    this.lines.push(line);
  }
  
  clearRoads() {
    this.lines.forEach(line => line.remove());
    this.lines = [];
  }
}